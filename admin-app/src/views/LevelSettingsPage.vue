<template>
  <div class="center-screen card w-full">
    <h2>{{ titulo }}</h2>
    <div v-if="context !== 'default'" class="mb-4 center-element">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="useDefaultConfig" />
        Usar configuración por defecto del especialista
      </label>
    </div>
    <div class="flex flex-wrap gap-4">
      <LevelSettings
        class="flex-1 min-w-[250px]"
        level="Bajo"
        :data="tempLevels.lowLevel"
        :disabled="context !== 'default' && useDefaultConfig"
        @edit-items="goToItemSelection('lowLevel')"
      />

      <LevelSettings
        class="flex-1 min-w-[250px]"
        level="Alto"
        :data="tempLevels.highLevel"
        :disabled="context !== 'default' && useDefaultConfig"
        @edit-items="goToItemSelection('highLevel')"
      />
    </div>

    <div class="btns-bar pt-4">
      <button class="btn btn-secondary" @click="volver">
        Salir sin guardar
      </button>
      <button class="btn btn-success" @click="guardar">Guardar y salir</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { rtdb, auth } from "@/firebase";
import { ref as dbRef, child, get, set, update } from "firebase/database";
import LevelSettings from "@/components/LevelSettings.vue";
import { tempLevels } from "@/data/tempLevelData.js";
import { useSelections } from "@/composables/useSelections";
import spawnInfoData from "@/data/spawnInfo.json";

const route = useRoute();
const router = useRouter();
const useDefaultConfig = ref(false);
const { selectionsByLevel, resetAllSelections } = useSelections();

//console.log("UPDATED CONFIG IS " + (updatedConfig !== null)? updatedConfig.value : "NULL");
const context = route.query.context || "patient"; // 'patient' o 'default'
const patientId = route.query.id || null;
const patientName = route.query.name || "";

const titulo = computed(() =>
  context === "default"
    ? "Definir configuración por defecto"
    : `Personalizar paciente: ${patientName}`
);

const defaultLevelStructure = {
  distractingItems: {},
  searchItems: {},
  timeMem: 0,
  timeSearch: 0,
};

async function getEspecialistaIdByEmail(email) {
  const snapshot = await get(child(dbRef(rtdb), "especialista"));
  if (!snapshot.exists()) throw new Error("No se encontraron especialistas");

  const especialistas = snapshot.val();
  for (const [id, data] of Object.entries(especialistas)) {
    if (data.mail === email) {
      return id;
    }
  }

  throw new Error("Especialista no encontrado");
}

onMounted(async () => {
  try {
    if (!tempLevels.initialized) {
      let path = "";

      if (context === "default") {
        const email = auth.currentUser?.email;
        if (!email) throw new Error("Usuario no autenticado");

        const especialistaId = await getEspecialistaIdByEmail(email);

        path = `especialista/${especialistaId}`;
      } else {
        path = `pacientes/${patientId}`;
      }

      const snapshot = await get(child(dbRef(rtdb), path));

      if (snapshot.exists()) {
        const data = snapshot.val();
        useDefaultConfig.value = data.usesDefault ?? true;
        const levelsConfig = data.levelsConfig || {};
        tempLevels.lowLevel = levelsConfig.lowLevel || {
          ...defaultLevelStructure,
        };
        tempLevels.highLevel = levelsConfig.highLevel || {
          ...defaultLevelStructure,
        };
      } else {
        tempLevels.lowLevel = { ...defaultLevelStructure };
        tempLevels.highLevel = { ...defaultLevelStructure };
      }

      tempLevels.initialized = true;
    }
  } catch (error) {
    console.error("Error cargando configuración:", error);
  }
});

const syncSelectionsToTempLevels = () => {
  for (const levelKey of ["lowLevel", "highLevel"]) {
    const levelSelections = selectionsByLevel[levelKey] || {};
    tempLevels[levelKey].searchItems = {};
    tempLevels[levelKey].distractingItems = {};

    for (const spawnName in levelSelections) {
      const spawnData = levelSelections[spawnName];

      // Obtener el spawnInfo correspondiente según zone
      const spawnInfo = spawnInfoData[levelKey]?.find(
        (s) => s.zone === spawnName
      );
      if (!spawnInfo) continue; // Si no existe el spawnInfo, saltar

      const dbId = spawnInfo.dbId;
      if (!dbId) continue; // Si dbId no está definido, saltar

      // Validar y asignar item de búsqueda
      if (spawnData.search) {
        const itemName = Object.values(spawnData.search)[0];
        if (itemName !== undefined && itemName !== null) {
          tempLevels[levelKey].searchItems[dbId] = itemName;
        }
      }

      // Validar y asignar item distractor
      if (spawnData.distracting) {
        const itemName = Object.values(spawnData.distracting)[0];
        if (itemName !== undefined && itemName !== null) {
          tempLevels[levelKey].distractingItems[dbId] = itemName;
        }
      }
    }
  }
};

const guardar = async () => {
  try {
    syncSelectionsToTempLevels();

    const newLevelsConfig = {
      lowLevel: tempLevels.lowLevel,
      highLevel: tempLevels.highLevel,
    };
    // const config = {
    //   levelsConfig: {
    //     lowLevel: tempLevels.lowLevel,
    //     highLevel: tempLevels.highLevel,
    //   },
    //   usesDefault: useDefaultConfig.value,
    // };

    let path = "";

    if (context === "default") {
      const email = auth.currentUser?.email;
      if (!email) throw new Error("Usuario no autenticado");

      const especialistaId = await getEspecialistaIdByEmail(email);
      console.log(especialistaId);
      path = `especialista/${especialistaId}/levelsConfig`;
    } else {
      path = `pacientes/${patientId}/levelsConfig`;
    }

    await update(dbRef(rtdb, path), newLevelsConfig);

    // Clear temp data
    tempLevels.initialized = false;

    router.push({
      name: "PatientList",
      query: { message: "Configuración guardada correctamente." },
    });
  } catch (e) {
    console.error("Error al guardar:", e);
  }
};

const volver = () => {
  resetAllSelections();

  tempLevels.lowLevel = {
    distractingItems: {},
    searchItems: {},
    timeMem: 0,
    timeSearch: 0,
  };
  tempLevels.highLevel = {
    distractingItems: {},
    searchItems: {},
    timeMem: 0,
    timeSearch: 0,
  };

  tempLevels.initialized = false;
  router.push({ name: "PatientList" });
};

const goToItemSelection = (levelKey) => {
  router.push({
    path: "/select-items",
    query: {
      level: levelKey,
      context: context,
      id: patientId,
      searchItems: encodeURIComponent(
        JSON.stringify(tempLevels[levelKey].searchItems)
      ),
      distractingItems: encodeURIComponent(
        JSON.stringify(tempLevels[levelKey].distractingItems)
      ),
    },
  });
};
</script>
