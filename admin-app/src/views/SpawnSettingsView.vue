<template>
  <div class="min-h-screen flex flex-col justify-center items-center p-4">
    <div class="w-full max-w-3xl">
      <h1 class="text-center text-2xl font-bold mb-8">Ubicaciones</h1>
      <div class="w-full flex flex-col gap-6">
        <div
          v-for="spawn in spawnLocations"
          :key="spawn"
          class="flex items-center justify-between p-4 border rounded"
        >
          <span class="font-medium">
            {{ spawn }}
            <span
              v-if="getSelectionCount(spawn) > 0"
              class="text-sm text-gray-500"
            >
              ({{ getSelectionCount(spawn) }} objetos)
            </span>
          </span>
          <button
            class="btn btn-primary"
            @click="
              goToItemSelection(
                spawn,
                spawn === 'Hall' ? 'search' : 'distracting'
              )
            "
          >
            Seleccionar objetos
          </button>
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

const route = useRoute();
const router = useRouter();
const { selectionsByLevel, getSearchObjects, getDistractingObjects } =
  useSelections();

const spawnLocations = [
  "Hall",
  "Pared de entrada",
  "Pared de la TV",
  "Pared opuesta",
  "Centro del living",
];

const goToItemSelection = (spawnName, type) => {
  router.push({
    path: "/select-items-new",
    query: {
      spawn: spawnName,
      type,
      level: route.query.level,
      context: route.query.context,
      id: route.query.id,
    },
  });
};

const goBack = () => {
  router.back();
};

const getSelectionCount = (spawn) => {
  const level = route.query.level;
  const levelSelections = selectionsByLevel[level];
  if (!levelSelections) return 0;

  const zoneData = levelSelections[spawn];
  if (!zoneData) return 0;

  return spawn === "Hall"
    ? Object.keys(zoneData.search || {}).length
    : Object.keys(zoneData.search || {}).length +
        Object.keys(zoneData.distracting || {}).length;
};

const saveSettings = () => {
  const level = route.query.level;
  const levelSelections = selectionsByLevel[level];
  if (!levelSelections) return;
  const hallSearchObjects = getSearchObjects(level);
  if (hallSearchObjects.length === 0) {
    alert("Debes seleccionar al menos un objeto en Hall");
    return;
  }
  for (const obj of hallSearchObjects) {
    let assigned = false;
    for (const spawn of spawnLocations) {
      if (spawn === "Hall") continue;
      const spawnData = levelSelections[spawn];
      if (!spawnData) continue;
      if (
        (spawnData.search && Object.values(spawnData.search).includes(obj)) ||
        (spawnData.distracting &&
          Object.values(spawnData.distracting).includes(obj))
      ) {
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      alert(
        `El objeto "${obj}" del Hall no está asignado a ninguna otra pared`
      );
      return;
    }
  }

  alert("✅ Configuración guardada con éxito");
  router.back();
};
</script>
