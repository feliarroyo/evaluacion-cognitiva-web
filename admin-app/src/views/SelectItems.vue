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
          <h2 class="text-3xl font-semibold mb-2">{{ spawnName }}</h2>
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

const spawnName = route.query.spawn || "";
const type = route.query.type || "search";
const level = route.query.level || "lowLevel";

const { selectionsByLevel, setSelections, getSelections } = useSelections();
const selections = reactive(getSelections(level, spawnName, type) || {});

const imagesMap = {
  lowLevel: {
    "Pared de entrada": "/environment/entradaNivel1.png",
    "Centro del living": "/environment/centroNivel1.png",
    "Pared opuesta": "/environment/opuestoNivel1.png",
    "Pared de la TV": "/environment/tvNivel1.png",
    "Entrada - Hall": "/environment/entrance.png",
  },
  highLevel: {
    "Pared de entrada": "/environment/entradaNivel2.png",
    "Centro del living": "/environment/centroNivel2.png",
    "Pared opuesta": "/environment/opuestoNivel2.png",
    "Pared de la TV": "/environment/tvNivel2.png",
    "Entrada - Hall": "/environment/center.png",
  },
};

const complexityText = computed(() => {
  if (level === "lowLevel") return "baja";
  if (level === "highLevel") return "alta";
  return "desconocida";
});

const wallImage =
  (imagesMap[level] && imagesMap[level][spawnName]) ||
  "/environment/Opposite.png";

const availableSpawns = ref([]);
const availableObjects = ref([]);

const selectedSpawn = ref("");
const selectedObject = ref("");

// Función para obtener todos los objetos usados en todas las paredes y tipos (buscar + distractores)
const getAllUsedObjects = () => {
  const used = new Set();
  for (const levelKey of ["lowLevel", "highLevel"]) {
    const levelData = selectionsByLevel[levelKey];
    if (!levelData) continue;

    for (const spawn in levelData) {
      const spawnData = levelData[spawn];
      if (spawnData.search) {
        Object.values(spawnData.search).forEach((obj) => used.add(obj));
      }
      if (spawnData.distracting) {
        Object.values(spawnData.distracting).forEach((obj) => used.add(obj));
      }
    }
  }
  return used;
};

// Función para obtener todos los spawns usados en todas las paredes y tipos (buscar + distractores)
const getAllUsedSpawns = () => {
  const usedSpawns = new Set();
  for (const levelKey of ["lowLevel", "highLevel"]) {
    const levelData = selectionsByLevel[levelKey];
    if (!levelData) continue;

    for (const spawn in levelData) {
      const spawnData = levelData[spawn];
      if (spawnData.search) {
        Object.keys(spawnData.search).forEach((spawnId) =>
          usedSpawns.add(spawnId)
        );
      }
      if (spawnData.distracting) {
        Object.keys(spawnData.distracting).forEach((spawnId) =>
          usedSpawns.add(spawnId)
        );
      }
    }
  }
  return usedSpawns;
};

// Objetos disponibles filtrados excluyendo los usados excepto los que ya están seleccionados aquí para poder editarlos
const filteredAvailableObjects = computed(() => {
  if (spawnName === "Hall" && type === "search") {
    // Objetos a buscar seleccionados en todas las paredes excepto Hall
    const searchObjectsOtherWalls = new Set();

    for (const levelKey of ["lowLevel", "highLevel"]) {
      const levelData = selectionsByLevel[levelKey];
      if (!levelData) continue;

      for (const spawn in levelData) {
        if (spawn === "Hall") continue; // Excluir Hall
        const spawnData = levelData[spawn];
        if (spawnData.search) {
          Object.values(spawnData.search).forEach((obj) =>
            searchObjectsOtherWalls.add(obj)
          );
        }
      }
    }

    // Mostrar sólo esos objetos, y permitir seleccionar sólo los que no están asignados aún en Hall
    return availableObjects.value.filter((obj) =>
      searchObjectsOtherWalls.has(obj.name)
    );
  } else {
    // Caso normal (ya definido antes)
    const usedObjects = getAllUsedObjects();

    Object.values(selections).forEach((obj) => {
      usedObjects.delete(obj);
    });

    return availableObjects.value.filter((obj) => !usedObjects.has(obj.name));
  }
});

// Spawns disponibles filtrados excluyendo los usados excepto los ya seleccionados aquí
const filteredSpawns = computed(() => {
  const usedSpawns = getAllUsedSpawns();

  Object.keys(selections).forEach((spawnId) => {
    usedSpawns.delete(spawnId);
  });

  return (availableSpawns.value || [])
    .filter((spawn) => spawn.zone === spawnName)
    .filter((spawn) => !usedSpawns.has(spawn.dbId));
});

onMounted(() => {
  availableSpawns.value = spawnInfo[level] || [];
  availableObjects.value = Object.entries(itemImages).map(([name, img]) => ({
    name,
    img,
  }));
  const savedSelections = getSelections(level, spawnName, type);
  Object.assign(selections, savedSelections);
});

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
    alert("Este objeto ya fue asignado a otro spawn.");
    return;
  }

  selections[selectedSpawn.value] = selectedObject.value;
  setSelections(level, spawnName, type, selections);

  // Reset controlado para evitar quedarse con opción inválida
  selectedSpawn.value = "";
  selectedObject.value = "";
};

const getSpawnNumber = (dbId) => {
  const spawn = availableSpawns.value.find((s) => s.dbId === dbId);
  return spawn ? spawn.number : dbId;
};

const getItemImage = (itemName) => {
  const obj = availableObjects.value.find((o) => o.name === itemName);
  return obj ? obj.img : "";
};

const removeSelection = (spawnId) => {
  delete selections[spawnId];
  setSelections(level, spawnName, type, selections);
};

const save = () => {
  if (Object.keys(selections).length === 0) {
    alert("No hay selecciones para guardar.");
    return;
  }
  setSelections(level, spawnName, type, selections);
  alert(`Guardando ${Object.keys(selections).length} pares spawn - objeto.`);
  router.back();
};

const cancel = () => {
  if (
    confirm(
      "¿Seguro que quieres cancelar? Se perderán las selecciones no guardadas."
    )
  ) {
    for (const key in selections) {
      delete selections[key];
    }
    setSelections(level, spawnName, type, {});

    router.back();
  }
};
</script>
