<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-3xl">
      <h1 class="text-center text-2xl font-bold mb-8">Ubicaciones</h1>
      <div class="w-full max-w-3xl flex flex-col gap-6">
        <div
          v-for="spawn in spawnLocations"
          :key="spawn"
          class="flex items-center justify-between p-4 border rounded"
        >
          <div>
            <span class="font-medium block">{{ spawn }}</span>
            <template v-if="spawn !== 'Hall'">
              <span
                v-if="
                  getSelectionCountForSpawn(
                    route.query.level,
                    spawn,
                    'search'
                  ) > 0
                "
                class="text-sm text-green-600"
              >
                ({{
                  getSelectionCountForSpawn(route.query.level, spawn, "search")
                }}
                objetos para buscar)
              </span>
              <span
                v-if="
                  getSelectionCountForSpawn(
                    route.query.level,
                    spawn,
                    'distracting'
                  ) > 0
                "
                class="text-sm text-red-600"
              >
                ({{
                  getSelectionCountForSpawn(
                    route.query.level,
                    spawn,
                    "distracting"
                  )
                }}
                distractores)
              </span>
            </template>
          </div>
          <div class="flex gap-3">
            <template v-if="spawn === 'Hall'">
              <button
                class="btn btn-primary"
                @click="goToItemSelection(spawn, 'search')"
              >
                Asignar objetos a buscar
              </button>
            </template>
            <template v-else>
              <button
                class="btn btn-primary"
                @click="goToItemSelection(spawn, 'search')"
              >
                Agregar objetos a buscar
              </button>
              <button
                class="btn btn-secondary"
                @click="goToItemSelection(spawn, 'distracting')"
              >
                Agregar objetos distractores
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-3xl flex justify-between mt-auto px-4 pt-8">
      <button class="btn btn-secondary" @click="goBack">
        Salir sin guardar
      </button>
      <button class="btn btn-primary" @click="saveSettings">
        Guardar cambios
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { useSelections } from "@/composables/useSelections";
import { tempLevels } from "@/data/tempLevelData.js";

const route = useRoute();
const router = useRouter();
const { selectionsByLevel, resetAllSelections } = useSelections();

const spawnLocations = [
  "Pared de entrada",
  "Pared de la TV",
  "Pared opuesta",
  "Centro del living",
  "Hall",
];

const getSelectionCountForSpawn = (level, spawnName, type) => {
  if (spawnName === "Hall") return 0;
  if (!selectionsByLevel[level] || !selectionsByLevel[level][spawnName])
    return 0;
  if (!selectionsByLevel[level][spawnName][type]) return 0;
  return Object.keys(selectionsByLevel[level][spawnName][type]).length;
};

const goToItemSelection = (spawnName, type) => {
  router.push({
    path: "/select-items-new",
    query: {
      spawn: spawnName,
      type: type,
      level: route.query.level,
      context: route.query.context,
      id: route.query.id,
    },
  });
};

const goBack = () => {
  resetAllSelections();

  tempLevels.lowLevel.searchItems = {};
  tempLevels.lowLevel.distractingItems = {};
  tempLevels.highLevel.searchItems = {};
  tempLevels.highLevel.distractingItems = {};

  router.back();
};

const saveSettings = () => {
  // Primero, obtener los objetos a buscar de todas las paredes excepto Hall
  const level = route.query.level;
  const levelSelections = selectionsByLevel[level];
  if (!levelSelections) return;

  // Objetos a buscar en paredes excepto Hall
  const searchObjectsOtherWalls = new Set();
  for (const spawn of spawnLocations) {
    if (spawn === "Hall") continue;
    const spawnData = levelSelections[spawn];
    if (spawnData && spawnData.search) {
      Object.values(spawnData.search).forEach((obj) =>
        searchObjectsOtherWalls.add(obj)
      );
    }
  }

  // Objetos asignados en Hall (tipo search)
  const hallData = levelSelections["Hall"];
  const hallSearchObjects = new Set();
  if (hallData && hallData.search) {
    Object.values(hallData.search).forEach((obj) => hallSearchObjects.add(obj));
  }

  // Verificar que los objetos a buscar seleccionados esten en el hall
  for (const obj of searchObjectsOtherWalls) {
    if (!hallSearchObjects.has(obj)) {
      alert(
        `No puedes guardar: El objeto "${obj}" no está asignado en la pared Hall.`
      );
      return; // No guardar
    }
  }

  // Si pasa la validación, guardar normalmente
  ["lowLevel", "highLevel"].forEach((levelKey) => {
    tempLevels[levelKey].searchItems = {};
    tempLevels[levelKey].distractingItems = {};

    const levelSel = selectionsByLevel[levelKey];
    if (!levelSel) return;

    Object.entries(levelSel).forEach(([spawnName, types]) => {
      if (types.search && Object.keys(types.search).length > 0) {
        tempLevels[levelKey].searchItems[spawnName] = {
          items: Object.values(types.search),
        };
      }
      if (types.distracting && Object.keys(types.distracting).length > 0) {
        tempLevels[levelKey].distractingItems[spawnName] = {
          items: Object.values(types.distracting),
        };
      }
    });
  });

  router.back();
};
</script>
