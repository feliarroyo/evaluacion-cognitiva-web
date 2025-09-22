<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-2xl font-bold text-center mb-8">
      Añadir objetos para el nivel de complejidad {{ complexityText }}
    </h1>

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
          <h2 class="text-lg font-semibold">
            {{ spawnZone }} -
            {{
              type === "search"
                ? "Agregar objetos a buscar"
                : "Agregar objetos distractores"
            }}
          </h2>
        </div>

        <template v-if="spawnZone === 'Pared de entrada'">
          <div class="space-y-2 border rounded p-4 shadow-md">
            <h3 class="font-semibold mb-2">Objetos del mueble</h3>

            <ul class="border rounded max-h-22 overflow-y-auto mb-3">
              <li
                v-for="obj in filteredNormalObjects"
                :key="obj.name"
                @click="selectedObjectNormal = obj.name"
                :class="[
                  'flex items-center gap-2 p-2 cursor-pointer',
                  selectedObjectNormal === obj.name ? 'bg-blue-200' : '',
                  Object.values(selections).includes(obj.name)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <img :src="obj.img" alt="" class="w-8 h-8 object-contain" />
                <span>{{ obj.name }}</span>
              </li>
            </ul>

            <select
              v-model="selectedSpawnNormal"
              class="w-full border rounded px-3 py-2 mb-3"
            >
              <option disabled value="">-- Selecciona una ubicación--</option>
              <option
                v-for="spawn in filteredEntranceSpawns"
                :key="spawn.dbId"
                :value="spawn.dbId"
                :disabled="!!selections[spawn.dbId]"
              >
                Ubicación {{ getSpawnNumber(spawn.dbId) }}
              </option>
            </select>

            <button
              @click="addSelectionNormal"
              :disabled="
                !selectedObjectNormal ||
                !selectedSpawnNormal ||
                !!selections[selectedSpawnNormal]
              "
              class="btn btn-secondary px-6 py-2 rounded disabled:opacity-50 !mt-2"
            >
              Seleccionar
            </button>
          </div>

          <div class="space-y-2 border rounded p-4 shadow-md">
            <h3 class="font-semibold mb-2">Objetos del perchero</h3>
            <ul class="border rounded max-h-22 overflow-y-auto mb-3">
              <li
                v-for="obj in filteredRackObjects"
                :key="obj.name"
                @click="selectedObjectRack = obj.name"
                :class="[
                  'flex items-center gap-2 p-2 cursor-pointer',
                  selectedObjectRack === obj.name ? 'bg-blue-200' : '',
                  Object.values(selections).includes(obj.name)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <img :src="obj.img" alt="" class="w-8 h-8 object-contain" />
                <span>{{ obj.name }}</span>
              </li>
            </ul>
            <select
              v-model="selectedSpawnRack"
              class="w-full border rounded px-3 py-2 mb-6"
            >
              <option disabled value="">-- Selecciona una ubicación --</option>
              <option
                v-for="spawn in filteredPercheroSpawns"
                :key="spawn.dbId"
                :value="spawn.dbId"
                :disabled="!!selections[spawn.dbId]"
              >
                Ubicación {{ getSpawnNumber(spawn.dbId) }}
              </option>
            </select>
            <button
              @click="addSelectionRack"
              :disabled="
                !selectedObjectRack ||
                !selectedSpawnRack ||
                !!selections[selectedSpawnRack]
              "
              class="btn btn-secondary px-6 py-2 rounded disabled:opacity-50 !mt-2"
            >
              Seleccionar
            </button>
          </div>
        </template>

        <template v-else-if="spawnZone === 'Hall'">
          <!-- BLOQUE NORMAL -->
          <div class="space-y-2 border rounded p-4 shadow-md">
            <h3 class="font-semibold mb-2">Objetos de la estantería</h3>

            <ul class="border rounded max-h-22 overflow-y-auto mb-3">
              <li
                v-for="obj in hallNormalObjects"
                :key="obj"
                @click="selectedObjectNormal = obj"
                :class="[
                  'flex items-center gap-2 p-2 cursor-pointer',
                  selectedObjectNormal === obj ? 'bg-blue-200' : '',
                  Object.values(selections).includes(obj)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <img
                  :src="getItemImage(obj)"
                  alt=""
                  class="w-8 h-8 object-contain"
                />
                <span>{{ obj }}</span>
              </li>
            </ul>

            <select
              v-model="selectedSpawnNormal"
              class="w-full border rounded px-3 py-2 mb-3"
            >
              <option disabled value="">-- Selecciona una ubicación --</option>
              <option
                v-for="spawn in filteredEntranceSpawns"
                :key="spawn.dbId"
                :value="spawn.dbId"
                :disabled="!!selections[spawn.dbId]"
              >
                Ubicación {{ getSpawnNumber(spawn.dbId) }}
              </option>
            </select>

            <button
              @click="addSelectionNormal"
              :disabled="
                !selectedObjectNormal ||
                !selectedSpawnNormal ||
                !!selections[selectedSpawnNormal]
              "
              class="btn btn-secondary px-6 py-2 rounded disabled:opacity-50 !mt-2"
            >
              Seleccionar
            </button>
          </div>

          <!-- BLOQUE PERCHERO -->
          <div class="space-y-2 border rounded p-4 shadow-md">
            <h3 class="font-semibold mb-2">Objetos del perchero</h3>

            <ul class="border rounded max-h-22 overflow-y-auto mb-3">
              <li
                v-for="obj in hallRackObjects"
                :key="obj"
                @click="selectedObjectRack = obj"
                :class="[
                  'flex items-center gap-2 p-2 cursor-pointer',
                  selectedObjectRack === obj ? 'bg-blue-200' : '',
                  Object.values(selections).includes(obj)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <img
                  :src="getItemImage(obj)"
                  alt=""
                  class="w-8 h-8 object-contain"
                />
                <span>{{ obj }}</span>
              </li>
            </ul>

            <select
              v-model="selectedSpawnRack"
              class="w-full border rounded px-3 py-2 mb-3"
            >
              <option disabled value="">-- Selecciona una ubicación --</option>
              <option
                v-for="spawn in filteredPercheroSpawns"
                :key="spawn.dbId"
                :value="spawn.dbId"
                :disabled="!!selections[spawn.dbId]"
              >
                Ubicación {{ getSpawnNumber(spawn.dbId) }}
              </option>
            </select>

            <button
              @click="addSelectionRack"
              :disabled="
                !selectedObjectRack ||
                !selectedSpawnRack ||
                !!selections[selectedSpawnRack]
              "
              class="btn btn-secondary px-6 py-2 rounded disabled:opacity-50 !mt-2"
            >
              Seleccionar
            </button>
          </div>
        </template>

        <template v-else>
          <div class="space-y-2 border rounded p-4 shadow-md">
            <h3 class="font-semibold mb-2">Seleccionar objeto</h3>
            <ul class="border rounded max-h-48 overflow-auto mb-3">
              <li
                v-for="obj in filteredAvailableObjects"
                :key="obj.name"
                @click="selectedObject = obj.name"
                :class="[
                  'flex items-center gap-2 p-2 cursor-pointer',
                  selectedObject === obj.name ? 'bg-blue-200' : '',
                  Object.values(selections).includes(obj.name)
                    ? 'opacity-50 cursor-not-allowed'
                    : '',
                ]"
              >
                <img :src="obj.img" alt="" class="w-8 h-8 object-contain" />
                <span>{{ obj.name }}</span>
              </li>
            </ul>
            <select
              v-model="selectedSpawn"
              class="w-full border rounded px-3 py-2 mb-3"
            >
              <option disabled value="">-- Selecciona una ubicación --</option>
              <option
                v-for="spawn in filteredSpawns"
                :key="spawn.dbId"
                :value="spawn.dbId"
                :disabled="!!selections[spawn.dbId]"
              >
                Ubicación {{ getSpawnNumber(spawn.dbId) }}
              </option>
            </select>
            <button
              @click="addSelection"
              :disabled="
                !selectedObject || !selectedSpawn || !!selections[selectedSpawn]
              "
              class="btn btn-secondary px-6 py-2 rounded disabled:opacity-50 !mt-2"
            >
              Seleccionar
            </button>
          </div>
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

const route = useRoute();
const router = useRouter();

const spawnZone = route.query.spawn || "";
const level = route.query.level || "lowLevel";
const type = route.query.type || "search";

const { selectionsByLevel, setSelections, getSelections } = useSelections();
const selections = reactive(getSelections(level, spawnZone, type) || {});

const imagesMap = {
  lowLevel: {
    "Pared de entrada": "/environmentSpawns/entradaNivel1.png",
    "Centro del living": "/environmentSpawns/centroNivel1.png",
    "Pared opuesta": "/environmentSpawns/opuestoNivel1.png",
    "Pared de la TV": "/environmentSpawns/tvNivel1_Abierto.png",
    Hall: "/environmentSpawns/hall.png",
  },
  highLevel: {
    "Pared de entrada": "/environmentSpawns/entradaNivel2.png",
    "Centro del living": "/environmentSpawns/centroNivel2.png",
    "Pared opuesta": "/environmentSpawns/opuestoNivel2.png",
    "Pared de la TV": "/environmentSpawns/tvNivel2_Abierto.png",
    Hall: "/environmentSpawns/hall.png",
  },
};

const complexityText = computed(() => (level === "lowLevel" ? "baja" : "alta"));
const wallImage =
  (imagesMap[level] && imagesMap[level][spawnZone]) ||
  "/environment/Opposite.png";

const availableSpawns = ref([]);
const availableObjects = ref([]);

const selectedSpawn = ref("");
const selectedObject = ref("");

const selectedSpawnNormal = ref("");
const selectedObjectNormal = ref("");

const selectedSpawnRack = ref("");
const selectedObjectRack = ref("");

// ---------------- FILTROS ----------------
const filteredAvailableObjects = computed(() => {
  const usedObjects = getUsedObjectsForLevel();
  Object.values(selections).forEach((obj) => usedObjects.delete(obj));

  return availableObjects.value.filter((obj) => {
    // Excluir los objetos de perchero de las zonas que no tienen perchero
    if (
      obj.category === "Rack" &&
      !["Hall", "Pared de entrada"].includes(spawnZone)
    ) {
      return false;
    }
    return !usedObjects.has(obj.name);
  });
});

const filteredNormalObjects = computed(() =>
  filteredAvailableObjects.value.filter((o) => o.category !== "Rack")
);

const filteredRackObjects = computed(() =>
  filteredAvailableObjects.value.filter((o) => o.category === "Rack")
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
const filteredPercheroSpawns = computed(() =>
  filteredSpawns.value.filter((s) => s.otherProp === "Perchero")
);

// ---------------- FUNCIONES ----------------
const getUsedObjectsForLevel = () => {
  const used = new Set();
  const levelData = selectionsByLevel[level];
  if (!levelData) return used;
  for (const zone in levelData) {
    const zoneData = levelData[zone];
    if (zoneData.distracting) {
      Object.values(zoneData.distracting).forEach((o) => used.add(o));
    }
    if (zoneData.search) {
      Object.values(zoneData.search).forEach((o) => used.add(o));
    }
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

// ------- ADD SELECTIONS -------
const addSelection = () => {
  if (!selectedObject.value || !selectedSpawn.value) return;
  selections[selectedSpawn.value] = selectedObject.value;
  setSelections(level, spawnZone, type, selections);
  selectedSpawn.value = "";
  selectedObject.value = "";
};

const addSelectionNormal = () => {
  if (!selectedObjectNormal.value || !selectedSpawnNormal.value) return;
  selections[selectedSpawnNormal.value] = selectedObjectNormal.value;
  setSelections(level, spawnZone, type, selections);
  selectedSpawnNormal.value = "";
  selectedObjectNormal.value = "";
};

const addSelectionRack = () => {
  if (!selectedObjectRack.value || !selectedSpawnRack.value) return;
  selections[selectedSpawnRack.value] = selectedObjectRack.value;
  setSelections(level, spawnZone, type, selections);
  selectedSpawnRack.value = "";
  selectedObjectRack.value = "";
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

// --- Objetos a buscar en otras zonas ---
const hallObjects = computed(() => {
  const objs = [];
  const levelData = selectionsByLevel[level];
  if (!levelData) return objs;

  for (const zone in levelData) {
    if (zone === "Hall") continue; // ignorar hall
    const zoneData = levelData[zone];
    if (zoneData.search) {
      Object.values(zoneData.search).forEach((o) => objs.push(o));
    }
  }
  return objs;
});

// Separar normales y perchero
const hallNormalObjects = computed(() =>
  hallObjects.value.filter((o) => {
    const obj = availableObjects.value.find((x) => x.name === o);
    return obj && obj.category !== "Rack";
  })
);

const hallRackObjects = computed(() =>
  hallObjects.value.filter((o) => {
    const obj = availableObjects.value.find((x) => x.name === o);
    return obj && obj.category === "Rack";
  })
);

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
