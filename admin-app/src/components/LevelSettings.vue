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
        <label class="block font-medium mb-1">Tiempo de Búsqueda (s)</label>
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
        {{ countItems(data.searchItems) }} objetos para buscar,
        {{ countItems(data.distractingItems, data.searchItems) }} distractores
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

// se contabilizan los items teniendo en cuenta ignorar de la lista de distractores los que son de memorización
const countItems = (items, exclude = {}) => {
  let count = 0;

  const excludeNames = new Set(
    Object.values(exclude || {}).flatMap((entry) => entry.items || [])
  );

  for (const entry of Object.values(items || {})) {
    const itemNames = entry.items || [];

    for (const name of itemNames) {
      console.log("ITEM NAME:", name);
      if (!excludeNames.has(name)) {
        count++;
      }
    }
  }

  return count;
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
