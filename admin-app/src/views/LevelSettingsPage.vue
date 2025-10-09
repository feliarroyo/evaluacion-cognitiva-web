<template>
  <div class="center-screen card w-full">
    <h2>{{ titulo }}</h2>
    <div v-if="context !== 'default'" class="mb-4 center-element">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="useDefaultConfig" />
        Usar configuración por defecto
      </label>
    </div>

    <div class="flex flex-wrap gap-4">
      <LevelSettings
        v-if="levelKey === 'lowLevel'"
        class="flex-1 min-w-[250px]"
        level="Bajo"
        :data="tempLevels.lowLevel"
        :disabled="context !== 'default' && useDefaultConfig"
        @edit-items="goToItemSelection('lowLevel')"
      />

      <LevelSettings
        v-else-if="levelKey === 'highLevel'"
        class="flex-1 min-w-[250px]"
        level="Alto"
        :data="tempLevels.highLevel"
        :disabled="context !== 'default' && useDefaultConfig"
        @edit-items="goToItemSelection('highLevel')"
      />
    </div>

    <div class="btns-bar pt-4">
      <button class="btn btn-secondary" @click="goBack">
        Salir sin guardar
      </button>
      <button class="btn btn-success" @click="save">Guardar</button>
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
import { watch } from "vue";

const route = useRoute();
const router = useRouter();
const useDefaultConfig = ref(false);
const { selectionsByLevel, resetAllSelections } = useSelections();

const context = route.query.context || "patient";
const patientId = route.query.id || null;
const patientName = route.query.name || "";
const levelKey = route.query.level || null;

const titulo = computed(() => {
  if (context === "default") {
    return "Definir configuración por defecto";
  }
  const nivelTxt = levelKey === "lowLevel" ? "Nivel Bajo" : "Nivel Alto";
  return `Personalizar usuario: ${patientName} - ${nivelTxt}`;
});

const syncSelectionsToTempLevelsRealtime = () => {
  if (!levelKey) return;
  const levelSelections = selectionsByLevel[levelKey] || {};

  tempLevels[levelKey].searchItems = {};
  tempLevels[levelKey].distractingItems = {};

  for (const zone in levelSelections) {
    const spawnData = levelSelections[zone];
    if (!spawnData) continue;

    if (zone === "Hall") {
      if (spawnData.search) {
        Object.entries(spawnData.search).forEach(([spawnId, itemName]) => {
          if (itemName) tempLevels[levelKey].searchItems[spawnId] = itemName;
        });
      }
    } else {
      if (spawnData.search) {
        Object.entries(spawnData.search).forEach(([spawnId, itemName]) => {
          if (itemName)
            tempLevels[levelKey].distractingItems[spawnId] = itemName;
        });
      }
      if (spawnData.distracting) {
        Object.entries(spawnData.distracting).forEach(([spawnId, itemName]) => {
          if (itemName)
            tempLevels[levelKey].distractingItems[spawnId] = itemName;
        });
      }
    }
  }
};

watch(
  () => selectionsByLevel[levelKey],
  () => {
    syncSelectionsToTempLevelsRealtime();
  },
  { deep: true, immediate: true }
);

const defaultLevelStructure = {
  distractingItems: {},
  searchItems: {},
  timeMem: 0,
  timeSearch: 0,
};

async function loadGlobalDefaultConfig() {
  const snapshot = await get(child(dbRef(rtdb), "globalLevelsConfig"));
  if (snapshot.exists()) {
    const globalConfig = snapshot.val();
    tempLevels.lowLevel = globalConfig.lowLevel || { ...defaultLevelStructure };
    tempLevels.highLevel = globalConfig.highLevel || {
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
        path = "globalLevelsConfig";
      } else {
        path = `pacientes/${patientId}`;
      }

      const snapshot = await get(child(dbRef(rtdb), path));

      if (snapshot.exists()) {
        const data = snapshot.val();
        useDefaultConfig.value = data.usesDefault ?? false;

        if (useDefaultConfig.value && context !== "default") {
          await loadGlobalDefaultConfig();
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

const save = async () => {
  try {
    let path = "";

    if (context === "default") {
      path = "globalLevelsConfig";
    } else {
      path = `pacientes/${patientId}`;
    }

    const snapshot = await get(child(dbRef(rtdb), `${path}/levelsConfig`));
    let currentConfig = snapshot.exists()
      ? snapshot.val()
      : {
          lowLevel: { ...defaultLevelStructure },
          highLevel: { ...defaultLevelStructure },
        };

    let nivelAGuardar = levelKey;

    if (useDefaultConfig.value && context !== "default") {
      const globalSnapshot = await get(
        child(dbRef(rtdb), "globalLevelsConfig")
      );
      if (globalSnapshot.exists()) {
        const globalConfig = globalSnapshot.val();
        currentConfig[nivelAGuardar] = globalConfig[nivelAGuardar] || {
          ...defaultLevelStructure,
        };
      } else {
        currentConfig[nivelAGuardar] = { ...defaultLevelStructure };
      }
    } else {
      syncSelectionsToTempLevels();
      currentConfig[nivelAGuardar] = tempLevels[nivelAGuardar];
    }

    await update(dbRef(rtdb, path), {
      levelsConfig: currentConfig,
      usesDefault: useDefaultConfig.value,
    });

    resetAllSelections();
    tempLevels.lowLevel = {
      distractingItems: {},
      searchItems: {},
      timeMem: "0",
      timeSearch: "0",
    };
    tempLevels.highLevel = {
      distractingItems: {},
      searchItems: {},
      timeMem: "0",
      timeSearch: "0",
    };
    tempLevels.initialized = false;
    useDefaultConfig.value = false;

    router.push({
      name: "LevelSelectionPage",
      query: {
        id: patientId,
        name: patientName,
        message: "Configuración guardada correctamente.",
      },
    });
  } catch (e) {
    console.error("Error al guardar:", e);
  }
};

const goBack = () => {
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
  router.push({
    name: "LevelSelectionPage",
    query: {
      id: patientId,
      name: patientName,
    },
  });
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
