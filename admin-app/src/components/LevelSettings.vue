<template>
  <div class="border card relative rounded-md">
    <!-- Overlay when disabled -->
    <!-- Disabled Overlay -->
    <div
      v-if="disabled"
      class="absolute inset-0 rounded-md z-10 flex items-center justify-center backdrop-blur-xs"
    ></div>

    <h3>Nivel {{ level }}</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <label class="block font-medium mb-1">Tiempo de Memorización (s)</label>
        <input
          v-model="data.timeMem"
          type="number"
          class="w-full p-2 border rounded"
          :disabled="disabled"
        />
      </div>
      <div>
        <label class="block font-medium mb-1">Tiempo de Búsqueda (s)</label>
        <input
          v-model="data.timeSearch"
          type="number"
          class="w-full p-2 border rounded"
          :disabled="disabled"
        />
      </div>
    </div>
    <div class="justify-center pt-4">
      <p class="text-center">
        {{ countItems(data.searchItems) }} objetos para buscar,
        {{ countItems(data.distractingItems) }} distractores
      </p>
      <div class="flex justify-center pt-4">
        <button
          @click="$emit('edit-items')"
          class="btn btn-primary"
          :disabled="disabled"
        >
          Seleccionar objetos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  level: String,
  data: Object,
  disabled: Boolean,
});

const countItems = (items) => {
  let value = 0;
  for (const location in items) {
    value += items[location]?.items?.length || 0;
  }
  return value;
};
</script>
