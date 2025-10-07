<template>
  <div class="w-full p-6">
    <h2 class="text-2xl font-bold text-center mb-8">
      Añadir objetos para el nivel de complejidad {{ complexityText }}
    </h2>

    <div class="grid grid-cols-2 gap-10">
      <!-- LEFT COLUMN -->
      <div class="flex flex-col justify-between h-full">
        <div>
          <img
            :src="wallImage"
            alt="Imagen de la pared"
            class="w-full h-auto object-contain mb-6 rounded shadow"
            style="max-height: 400px"
          />

          <div class="mb-6">
            <h3 class="font-semibold mb-2 !mt-2">Objetos seleccionados:</h3>
            <div
              v-if="Object.keys(selections).length === 0"
              class="text-gray-500"
            >
              No has seleccionado ningún objeto
            </div>

            <div
              v-else
              class="border rounded overflow-y-auto"
              style="max-height: calc(100vh - 400px - 120px)"
            >
              <ul>
                <li
                  v-for="(obj, spawnId) in selections"
                  :key="spawnId"
                  class="mb-2 flex items-center gap-4 bg-gray-100 p-2 rounded shadow-sm"
                >
                  <img
                    :src="getItemImage(obj)"
                    alt="Imagen item"
                    class="w-8 h-8 object-contain"
                  />
                  <span>
                    Ubicación {{ getSpawnNumber(spawnId) }}:
                    <strong>{{ obj }}</strong>
                  </span>
                  <button
                    @click="removeSelection(spawnId)"
                    class="ml-auto text-red-600 hover:underline"
                    title="Eliminar selección"
                  >
                    ✖
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 mt-6">
          <button @click="cancel" class="btn btn-secondary px-6 py-2 rounded">
            Cancelar
          </button>
          <button
            @click="save"
            :disabled="Object.keys(selections).length === 0"
            class="btn btn-primary px-6 py-2 rounded disabled:opacity-50"
          >
            Guardar
          </button>
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="flex flex-col gap-2">
        <div>
          <h3 class="text-sm font-semibold">
            {{ spawnZone }} -
            {{
              type === "search"
                ? "Ubicar objetos a memorizar"
                : "Ubicar objetos"
            }}
          </h3>
        </div>

        <!-- HALL -->
        <template v-if="spawnZone === 'Hall'">
          <SpawnAssignment
            :objects="hallNonRackObjects"
            :availableSpawns="filteredHallNonRackSpawns"
            :selections="selections"
            title="Ubicar objetos"
            :getItemImage="getItemImage"
            :spawnNumber="getSpawnNumber"
            :addToSelections="addSelection"
          />
          <SpawnAssignment
            :objects="hallRackObjects"
            :availableSpawns="filteredHallRackSpawns"
            :selections="selections"
            title="Ubicar objetos de perchero"
            :getItemImage="getItemImage"
            :spawnNumber="getSpawnNumber"
            :addToSelections="addSelection"
          />
        </template>

        <!-- ENTRANCE WALL -->
        <template v-else-if="spawnZone === 'Pared de entrada'">
          <div class="grid grid-cols-2 gap-2 items-start">
            <div class="flex flex-col gap-3">
              <SpawnAssignment
                :objects="filteredNonRackObjects"
                :availableSpawns="filteredEntranceSpawns"
                :selections="selections"
                title="Ubicar objetos"
                :getItemImage="getItemImage"
                :spawnNumber="getSpawnNumber"
                :addToSelections="addSelection"
              />
              <SpawnAssignment
                :objects="filteredRackObjects"
                :availableSpawns="filteredRackSpawns"
                :selections="selections"
                title="Ubicar objetos de perchero"
                :getItemImage="getItemImage"
                :spawnNumber="getSpawnNumber"
                :addToSelections="addSelection"
              />
            </div>
            <div class="flex flex-col gap-3">
              <SpawnAssignment
                v-if="hallSelectedNonRackObjects.length > 0"
                :objects="hallSelectedNonRackObjects"
                :availableSpawns="filteredEntranceSpawns"
                :selections="selections"
                title="Ubicar objetos a memorizar"
                :getItemImage="getItemImage"
                :spawnNumber="getSpawnNumber"
                :addToSelections="addSelection"
              />
              <SpawnAssignment
                v-if="hallSelectedRackObjects.length > 0"
                :objects="hallSelectedRackObjects"
                :availableSpawns="filteredRackSpawns"
                :selections="selections"
                title="Ubicar objetos a memorizar de perchero"
                :getItemImage="getItemImage"
                :spawnNumber="getSpawnNumber"
                :addToSelections="addSelection"
              />
            </div>
          </div>
        </template>

        <!-- OTHER WALLS -->
        <template v-else>
          <SpawnAssignment
            :objects="filteredAvailableObjects"
            :availableSpawns="filteredSpawns"
            :selections="selections"
            title="Ubicar objetos"
            :getItemImage="getItemImage"
            :spawnNumber="getSpawnNumber"
            :addToSelections="addSelection"
          />

          <!-- HALL OBJECTS TO MEMORIZE -->
          <SpawnAssignment
            v-if="hallObjectsToMemorize.length > 0"
            :objects="hallObjectsToMemorize"
            :availableSpawns="filteredSpawns"
            :selections="selections"
            title="Ubicar objetos a memorizar"
            :getItemImage="getItemImage"
            :spawnNumber="getSpawnNumber"
            :addToSelections="addSelection"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import spawnInfo from "@/data/spawnInfo.json";
import itemImages from "@/data/itemImages.json";
import { useSelections } from "@/composables/useSelections";
import SpawnAssignment from "@/components/SpawnAssignment.vue";

const route = useRoute();
const router = useRouter();

const spawnZone = route.query.spawn || "";
const level = route.query.level || "lowLevel";
const type = route.query.type || "search";

const {
  selectionsByLevel,
  setSelections,
  getSelections,
  isHallObjectUsedElsewhere,
} = useSelections();
const selections = reactive(getSelections(level, spawnZone, type) || {});

const wallImages = {
  lowLevel: {
    "Pared de entrada": import.meta.env.BASE_URL + "environmentSpawns/entradaNivel1.png",
    "Centro del living": import.meta.env.BASE_URL + "environmentSpawns/centroNivel1.png",
    "Pared opuesta": import.meta.env.BASE_URL + "environmentSpawns/opuestoNivel1.png",
    "Pared de la TV": import.meta.env.BASE_URL + "environmentSpawns/tvNivel1_Abierto.png",
    Hall: import.meta.env.BASE_URL + "environmentSpawns/hall.png",
  },
  highLevel: {
    "Pared de entrada": import.meta.env.BASE_URL + "environmentSpawns/entradaNivel2.png",
    "Centro del living": import.meta.env.BASE_URL + "environmentSpawns/centroNivel2.png",
    "Pared opuesta": import.meta.env.BASE_URL + "environmentSpawns/opuestoNivel2.png",
    "Pared de la TV": import.meta.env.BASE_URL + "environmentSpawns/tvNivel2_Abierto.png",
    Hall: import.meta.env.BASE_URL + "environmentSpawns/hall.png",
  },
};

const complexityText = computed(() => (level === "lowLevel" ? "baja" : "alta"));
const wallImage =
  (wallImages[level] && wallImages[level][spawnZone]) ||
  (import.meta.env.BASE_URL + "environment/Opposite.png");

const availableSpawns = ref([]);
const availableObjects = ref([]);

// ------------------ FILTERS ------------------
const filteredAvailableObjects = computed(() => {
  const usedObjects = getUsedObjectsForLevel();
  Object.values(selections).forEach((obj) => usedObjects.delete(obj));

  return availableObjects.value.filter((obj) => {
    if (obj.category === "Rack" && spawnZone !== "Pared de entrada")
      return false;
    return !usedObjects.has(obj.name);
  });
});

const hallSearchObjects = computed(() => {
  return new Set(Object.values(selectionsByLevel[level]?.Hall?.search || {}));
});

const filteredNonRackObjects = computed(() =>
  filteredAvailableObjects.value.filter((o) => o.category !== "Rack")
);

const filteredRackObjects = computed(() =>
  filteredAvailableObjects.value
    .filter((o) => o.category === "Rack")
    .filter((o) => !hallSearchObjects.value.has(o.name))
);

const filteredSpawns = computed(() => {
  const usedSpawns = getUsedSpawnsForLevel();
  Object.keys(selections).forEach((spawnId) => usedSpawns.delete(spawnId));
  return (availableSpawns.value || [])
    .filter((s) => s.zone === spawnZone)
    .filter((s) => !usedSpawns.has(s.dbId));
});

const filteredEntranceSpawns = computed(() =>
  filteredSpawns.value.filter((s) => s.otherProp !== "Perchero")
);
const filteredRackSpawns = computed(() =>
  filteredSpawns.value.filter((s) => s.otherProp === "Perchero")
);

// ------------------ HALL ------------------
const filteredHallRackSpawns = computed(() =>
  (availableSpawns.value || [])
    .filter((s) => s.zone === "Hall")
    .filter((s) => s.otherProp === "Perchero")
);

const filteredHallNonRackSpawns = computed(() =>
  (availableSpawns.value || [])
    .filter((s) => s.zone === "Hall")
    .filter((s) => s.otherProp !== "Perchero")
);

// ------------------ HALL OBJECTS ------------------
const hallSelectedObjects = computed(() => {
  const hallData = selectionsByLevel[level]?.Hall?.search || {};
  return Object.values(hallData);
});

const hallSelectedRackObjects = computed(() => {
  if (spawnZone !== "Pared de entrada") return [];
  return hallSelectedObjects.value
    .map((name) => {
      const obj = availableObjects.value.find((o) => o.name === name);

      if (obj?.category === "Rack" && hallSearchObjects.value.has(obj.name)) {
        return obj;
      }
      return null;
    })
    .filter(Boolean);
});

const hallSelectedNonRackObjects = computed(() => {
  return hallSelectedObjects.value
    .map((name) => {
      const obj = availableObjects.value.find((o) => o.name === name);
      if (obj?.category === "Rack" && spawnZone !== "Pared de entrada")
        return null;
      return obj?.category !== "Rack" ? obj : null;
    })
    .filter(Boolean);
});

const hallNonRackObjects = computed(() =>
  availableObjects.value.filter((obj) => obj.category !== "Rack")
);
const hallRackObjects = computed(() =>
  availableObjects.value.filter((obj) => obj.category === "Rack")
);

const hallObjectsToMemorize = computed(() => {
  return hallSelectedObjects.value
    .map((name) => {
      const obj = availableObjects.value?.find((o) => o.name === name);
      if (!obj) return null;

      if (obj.category === "Rack" && spawnZone !== "Pared de entrada")
        return null;

      const usedElsewhere = isHallObjectUsedElsewhere(level, obj.name);

      return {
        name: obj.name,
        img: obj.img || "/default.png",
        disabled: usedElsewhere,
      };
    })
    .filter(Boolean);
});

// ------------------ FUNCTIONS ------------------
const addSelection = (spawnId, objectName) => {
  if (!spawnId || !objectName) return;
  selections[spawnId] = objectName;
  setSelections(level, spawnZone, type, selections);
};

const removeSelection = (spawnId) => {
  delete selections[spawnId];
  setSelections(level, spawnZone, type, selections);
};

const getSpawnNumber = (dbId) => {
  const spawn = availableSpawns.value.find((s) => s.dbId === dbId);
  return spawn ? spawn.number : dbId;
};

const getItemImage = (itemName) => {
  const obj = availableObjects.value.find((o) => o.name === itemName);
  return obj ? obj.img : "";
};

const getUsedObjectsForLevel = () => {
  const used = new Set();
  const levelData = selectionsByLevel[level];
  if (!levelData) return used;
  for (const zone in levelData) {
    const zoneData = levelData[zone];
    if (zoneData.distracting)
      Object.values(zoneData.distracting).forEach((o) => used.add(o));
    if (zoneData.search)
      Object.values(zoneData.search).forEach((o) => used.add(o));
  }
  return used;
};

const getUsedSpawnsForLevel = () => {
  const used = new Set();
  const levelData = selectionsByLevel[level];
  if (!levelData) return used;
  for (const zone in levelData) {
    const zoneData = levelData[zone];
    if (zoneData.distracting)
      Object.keys(zoneData.distracting).forEach((id) => used.add(id));
    if (zoneData.search)
      Object.keys(zoneData.search).forEach((id) => used.add(id));
  }
  return used;
};

onMounted(() => {
  availableSpawns.value = spawnInfo[level] || [];
  availableObjects.value = itemImages.map((item) => ({
    name: item.name,
    img: item.image,
    category: item.category || "other",
  }));
  const saved = getSelections(level, spawnZone, type);
  Object.assign(selections, saved || {});
});

// ------------------ SAVE / CANCEL ------------------
const save = () => {
  setSelections(level, spawnZone, type, selections);
  alert("Cambios guardados correctamente.");
  router.back();
};

const cancel = () => {
  if (
    confirm(
      "¿Seguro que quieres cancelar? Los cambios no guardados se perderán."
    )
  ) {
    for (const k in selections) delete selections[k];
    setSelections(level, spawnZone, type, {});
    router.back();
  }
};
</script>
