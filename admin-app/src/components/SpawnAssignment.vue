<template>
  <div class="space-y-1 border rounded p-3 shadow-sm text-sm">
    <h4 class="font-semibold mb-1 text-base">{{ title }}</h4>

    <!-- Object list -->
    <ul class="border rounded max-h-32 overflow-y-auto mb-2 text-xs">
      <li
        v-for="obj in objects"
        :key="obj.name"
        @click="!isObjectUsed(obj.name) && (selectedObject = obj.name)"
        :class="[
          'flex items-center gap-1.5 p-1.5 rounded-sm transition select-none',
          isObjectUsed(obj.name)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-blue-100',
          selectedObject === obj.name ? 'bg-blue-200' : '',
        ]"
      >
        <img
          :src="obj.img || getItemImage(obj.name)"
          alt=""
          class="w-7 h-7 object-contain"
        />
        <span class="truncate">{{ obj.name }}</span>
      </li>
    </ul>

    <!-- Spawn selector -->
    <select
      v-model="selectedSpawn"
      class="w-full border rounded px-2 py-1.5 mb-2 text-sm"
    >
      <option disabled value="">-- Selecciona una ubicación --</option>
      <option
        v-for="spawn in availableSpawns"
        :key="spawn.dbId"
        :value="spawn.dbId"
        :disabled="selections[spawn.dbId]"
      >
        Ubicación {{ spawnNumber(spawn.dbId) }}
      </option>
    </select>

    <!-- Confirm button -->
    <button
      @click="addSelection"
      :disabled="!selectedObject || !selectedSpawn || selections[selectedSpawn]"
      class="btn btn-secondary w-full px-3 py-1.5 text-sm rounded disabled:opacity-50"
    >
      Seleccionar
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  objects: { type: Array, required: true },
  availableSpawns: { type: Array, required: true },
  selections: { type: Object, required: true },
  title: { type: String, default: "Seleccionar objeto" },
  getItemImage: { type: Function, required: true },
  spawnNumber: { type: Function, required: true },
  addToSelections: { type: Function, required: true },
});

const selectedObject = ref("");
const selectedSpawn = ref("");

const usedObjects = computed(() => new Set(Object.values(props.selections)));

const isObjectUsed = (objectName) => usedObjects.value.has(objectName);

const addSelection = () => {
  if (!selectedObject.value || !selectedSpawn.value) return;
  if (isObjectUsed(selectedObject.value)) return; // prevent reuse
  props.addToSelections(selectedSpawn.value, selectedObject.value);
  selectedObject.value = "";
  selectedSpawn.value = "";
};
</script>
