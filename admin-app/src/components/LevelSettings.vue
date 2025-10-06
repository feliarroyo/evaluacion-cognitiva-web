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
          v-model.number="data.timeMem"
          type="number"
          min="1"
          class="w-full p-2 border rounded"
          :disabled="disabled"
          @keydown="blockInvalid"
        />
      </div>
      <div>
        <label class="block font-medium mb-1">Tiempo de Evaluación (s)</label>
        <input
          v-model.number="data.timeSearch"
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          min="1"
          class="w-full p-2 border rounded"
          :disabled="disabled"
          @keydown="blockInvalid"
        />
      </div>
    </div>
    <div class="justify-center pt-4">
      <p class="text-center">
        {{ countItems(data.searchItems) }} objetos a memorizar,
        {{ countItems(data.distractingItems, data.searchItems) }} objetos
        distractores
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

const countItems = (items, exclude = {}) => {
  const excludeNames = new Set(Object.values(exclude || {}));
  return Object.values(items || {}).filter((name) => !excludeNames.has(name))
    .length;
};

const blockInvalid = (e) => {
  // Allow digits, navigation, back/delete
  if (
    !/[0-9]/.test(e.key) &&
    !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
  ) {
    e.preventDefault();
  }
};
</script>
