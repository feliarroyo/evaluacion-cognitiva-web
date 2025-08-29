<template>
  <div class="max-w-6xl mx-auto p-6">
    <h1 class="text-4xl font-bold text-center mb-8">
      Añadir objetos para el nivel de complejidad {{ complexityText }}
    </h1>

    <div class="flex gap-8">
      <div class="w-1/2 flex flex-col">
        <img
          :src="wallImage"
          alt="Imagen de la pared"
          class="w-full h-auto object-contain"
          style="max-height: 500px"
        />
        <div style="margin-top: 2rem">
          <h3 class="font-semibold mb-2">Objetos seleccionados:</h3>
          <div
            v-if="Object.keys(selections).length === 0"
            class="text-gray-500"
          >
            No has seleccionado ningún objeto
          </div>
          <ul v-else>
            <li
              v-for="(obj, spawnId) in selections"
              :key="spawnId"
              class="mb-2 flex items-center gap-4"
            >
              <img
                :src="getItemImage(obj)"
                alt="Imagen item"
                class="w-8 h-8 object-contain"
              />
              <span>
                Spawn {{ getSpawnNumber(spawnId) }}:
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

      <div class="w-1/2 flex flex-col justify-between">
        <div>
          <h2 class="text-3xl font-semibold mb-2">{{ spawnZone }}</h2>
          <p class="text-lg mb-6">
            {{
              type === "search"
                ? "Agregar objetos a buscar"
                : "Agregar objetos distractores"
            }}
          </p>
          <label for="objectSelect" class="block mb-2 font-medium">
            Seleccionar objeto:
          </label>
          <ul class="border rounded max-h-48 overflow-auto mb-4">
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
              :disabled="Object.values(selections).includes(obj.name)"
            >
              <img :src="obj.img" alt="" class="w-8 h-8 object-contain" />
              <span>{{ obj.name }}</span>
            </li>
          </ul>
          <label for="spawnSelect" class="block mb-2 font-medium">
            Seleccionar spawn:
          </label>
          <select
            id="spawnSelect"
            v-model="selectedSpawn"
            class="w-full border rounded px-3 py-2 mb-4"
          >
            <option disabled value="">-- Selecciona un spawn --</option>
            <option
              v-for="spawn in filteredSpawns"
              :key="spawn.dbId"
              :value="spawn.dbId"
            >
              Spawn {{ getSpawnNumber(spawn.dbId) }}
            </option>
          </select>

          <button
            @click="addSelection"
            :disabled="
              !selectedObject || !selectedSpawn || !!selections[selectedSpawn]
            "
            class="btn btn-secondary mb-6 px-6 py-2 rounded disabled:opacity-50"
          >
            Seleccionar
          </button>
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
const level = route.query.level || "lowLevel"; // lowLevel o highLevel
const type = route.query.type || "search"; // "search" o "distracting"

const { selectionsByLevel, setSelections, getSelections } = useSelections();

// cargar las selecciones actuales (según level, spawnZone y type de la vista)
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

// ---------------- FUNCIONES DE USO ----------------

// Obtiene todos los objetos usados en ESTE nivel (low/high) — tanto search como distracting
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

// Spawns ya usados en ESTE nivel
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

// ---------------- FILTROS DISPONIBLES ----------------

// Aquí está la corrección: cuando estamos EN EL HALL y la vista es "search",
// mostramos **solo** los objetos que fueron elegidos con "A buscar" en OTRAS paredes
// (es decir: los que están en zoneData.search de esas paredes).
const filteredAvailableObjects = computed(() => {
  // caso especial: Hall + vista "search"
  if (spawnZone === "Hall" && type === "search") {
    const searchObjectsFromOtherWalls = new Set();
    const levelData = selectionsByLevel[level];
    if (levelData) {
      for (const zone in levelData) {
        if (zone === "Hall") continue; // excluimos Hall
        const zoneData = levelData[zone];
        // <-- aquí usamos **search**, no distracting
        if (zoneData && zoneData.search) {
          Object.values(zoneData.search).forEach((obj) =>
            searchObjectsFromOtherWalls.add(obj)
          );
        }
      }
    }

    // además no mostrar objetos ya asignados en la vista actual (para edición)
    const alreadyAssignedHere = new Set(Object.values(selections));

    return availableObjects.value.filter(
      (obj) =>
        searchObjectsFromOtherWalls.has(obj.name) &&
        !alreadyAssignedHere.has(obj.name)
    );
  }

  // caso general para otras paredes / modos: no permitir repetir objetos dentro del mismo nivel
  const usedObjects = getUsedObjectsForLevel();
  // permitir editar las selecciones actuales: sacarlas del set de usados
  Object.values(selections).forEach((obj) => usedObjects.delete(obj));

  return availableObjects.value.filter((obj) => !usedObjects.has(obj.name));
});

// Spawns disponibles (filtrado por zona y por si ya fueron usados en ESTE nivel)
const filteredSpawns = computed(() => {
  const usedSpawns = getUsedSpawnsForLevel();
  Object.keys(selections).forEach((spawnId) => usedSpawns.delete(spawnId));

  return (availableSpawns.value || [])
    .filter((s) => s.zone === spawnZone)
    .filter((s) => !usedSpawns.has(s.dbId));
});

// ---------------- CICLO DE VIDA ----------------
onMounted(() => {
  availableSpawns.value = spawnInfo[level] || [];
  availableObjects.value = Object.entries(itemImages).map(([name, img]) => ({
    name,
    img,
  }));
  const saved = getSelections(level, spawnZone, type);
  Object.assign(selections, saved || {});
});

// ---------------- ACCIONES (ADD / REMOVE / SAVE) ----------------
const addSelection = () => {
  if (!selectedObject.value || !selectedSpawn.value) {
    alert("Selecciona spawn y objeto antes de añadir.");
    return;
  }
  if (selections[selectedSpawn.value]) {
    alert("Este spawn ya tiene un objeto asignado.");
    return;
  }
  if (Object.values(selections).includes(selectedObject.value)) {
    alert("Este objeto ya está asignado en esta zona.");
    return;
  }

  selections[selectedSpawn.value] = selectedObject.value;

  // guardamos usando el mismo 'type' de la vista (esto respeta cómo venías usando useSelections)
  setSelections(level, spawnZone, type, selections);

  selectedSpawn.value = "";
  selectedObject.value = "";
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

const save = () => {
  // Validación: si estamos en Hall y la vista es "search", debe haber asignaciones
  if (spawnZone === "Hall" && type === "search") {
    const hallObjects = Object.values(selections);
    if (hallObjects.length === 0) {
      alert("Debes asignar los objetos a buscar en el Hall antes de guardar.");
      return;
    }
  }

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
