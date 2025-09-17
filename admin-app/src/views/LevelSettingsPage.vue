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
import { ref as dbRef, child, get, update } from "firebase/database";
import LevelSettings from "@/components/LevelSettings.vue";
import { tempLevels } from "@/data/tempLevelData.js";
import { useSelections } from "@/composables/useSelections";

const route = useRoute();
const router = useRouter();
const useDefaultConfig = ref(false);
const { selectionsByLevel, resetAllSelections } = useSelections();

const context = route.query.context || "patient";
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

async function loadDefaultConfigFromEspecialista() {
  const email = auth.currentUser?.email;
  if (!email) throw new Error("Usuario no autenticado");

  const especialistaId = await getEspecialistaIdByEmail(email);
  const snapshot = await get(
    child(dbRef(rtdb), `especialista/${especialistaId}/levelsConfig`)
  );

  if (snapshot.exists()) {
    const levelsConfig = snapshot.val();
    tempLevels.lowLevel = levelsConfig.lowLevel || { ...defaultLevelStructure };
    tempLevels.highLevel = levelsConfig.highLevel || {
      ...defaultLevelStructure,
    };
  } else {
    tempLevels.lowLevel = { ...defaultLevelStructure };
    tempLevels.highLevel = { ...defaultLevelStructure };
  }
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
        useDefaultConfig.value = data.usesDefault ?? false;

        if (useDefaultConfig.value && context !== "default") {
          await loadDefaultConfigFromEspecialista();
        } else {
          const levelsConfig = data.levelsConfig || {};
          tempLevels.lowLevel = levelsConfig.lowLevel || {
            ...defaultLevelStructure,
          };
          tempLevels.highLevel = levelsConfig.highLevel || {
            ...defaultLevelStructure,
          };
        }
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
      if (!spawnData) continue;

      if (spawnName === "Hall") {
        if (spawnData.search) {
          Object.entries(spawnData.search).forEach(([spawnId, itemName]) => {
            if (itemName) {
              tempLevels[levelKey].searchItems[spawnId] = itemName;
            }
          });
        }
      } else {
        if (spawnData.search) {
          Object.entries(spawnData.search).forEach(([spawnId, itemName]) => {
            if (itemName) {
              tempLevels[levelKey].distractingItems[spawnId] = itemName;
            }
          });
        }
        if (spawnData.distracting) {
          Object.entries(spawnData.distracting).forEach(
            ([spawnId, itemName]) => {
              if (itemName) {
                tempLevels[levelKey].distractingItems[spawnId] = itemName;
              }
            }
          );
        }
      }
    }
  }
};

const guardar = async () => {
  try {
    let newLevelsConfig = {
      lowLevel: tempLevels.lowLevel,
      highLevel: tempLevels.highLevel,
    };

    let path = "";

    if (context === "default") {
      const email = auth.currentUser?.email;
      if (!email) throw new Error("Usuario no autenticado");

      const especialistaId = await getEspecialistaIdByEmail(email);
      path = `especialista/${especialistaId}`;
    } else {
      path = `pacientes/${patientId}`;

      if (useDefaultConfig.value) {
        const email = auth.currentUser?.email;
        if (!email) throw new Error("Usuario no autenticado");

        const especialistaId = await getEspecialistaIdByEmail(email);
        const snapshot = await get(
          child(dbRef(rtdb), `especialista/${especialistaId}/levelsConfig`)
        );

        if (snapshot.exists()) {
          newLevelsConfig = snapshot.val();
        }
      } else {
        syncSelectionsToTempLevels();
        newLevelsConfig = {
          lowLevel: tempLevels.lowLevel,
          highLevel: tempLevels.highLevel,
        };
      }
    }

    await update(dbRef(rtdb, path), {
      levelsConfig: newLevelsConfig,
      usesDefault: useDefaultConfig.value,
    });

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
