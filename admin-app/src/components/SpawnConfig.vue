<template>
  <div class="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div class="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
      <h3 class="text-xl font-bold mb-4">{{ config.name }}</h3>
      <div v-if="selectedImage" class="mb-4 center-element">
        <img :src="selectedImage" alt="Imagen seleccionada" class="mx-auto max-h-32 object-contain" />
      </div>

      <p class="mb-2 text-gray-600">
        <span :style="{ color: allItemTextColor }">
          Máx. objetos: {{ config.lowLevel.itemsAllowed }} ({{ config.lowLevel.itemsAllowed - localItems.length }} restantes)
        </span>
        |
        <span :style="{ color: largeItemTextColor }">
          Máx. grandes: {{ config.lowLevel.largeItemsAllowed }} ({{ remainingLargeItems }} restantes)
        </span>
      </p>

      <!-- Select regular item -->
      <div class="flex items-center mb-4 gap-2">
        <select v-model="selectedItem" class="flex-1 border p-2 rounded">
          <option disabled value="">Seleccione un objeto</option>
          <option v-for="item in props.config.smallItemList" :key="item"
            :disabled="props.alreadySelectedItems.includes(item) || localItems.includes(item)">{{ item }}<span
              v-if="props.alreadySelectedItems.includes(item) || localItems.includes(item)"> (ya usado)</span></option>
        </select>
        <button @click="addItem" class="btn btn-secondary">Agregar</button>
      </div>

      <!-- Select large item -->
      <div class="flex items-center mb-4 gap-2">
        <select v-model="selectedLargeItem" class="flex-1 border p-2 rounded">
          <option disabled value="">Seleccione un objeto grande</option>
          <option v-for="item in props.config.largeItemList" :key="item"
            :disabled="props.alreadySelectedItems.includes(item) || localItems.includes(item)">{{ item }}<span
              v-if="props.alreadySelectedItems.includes(item) || localItems.includes(item)"> (ya usado)</span></option>
        </select>
        <button @click="addLargeItem" class="btn btn-secondary">Agregar grande</button>
      </div>

      <!-- Selected items -->
      <div class="mb-4">
        <h4 class="font-semibold mb-2">Seleccionados:</h4>
        <div class="flex flex-wrap gap-2">
          <div v-for="(item, index) in localItems" :key="index"
            class="border px-2 py-1 rounded flex items-center gap-2 bg-gray-100">
            <span>{{ item }}</span>
            <button @click="removeItem(index)" class="text-red-500 hover:text-red-700">×</button>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between mt-6">
        <button @click="$emit('close')" class="btn btn-secondary">Cancelar</button>
        <button @click="confirm" class="btn btn-primary">Confirmar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, watchEffect } from "vue";
import spawnInfo from "@/data/spawnInfo.json";
import itemImages from "@/data/itemImages.json";


// Props
const props = defineProps({
  location: String,
  config: Object,
  items: Object,
  isKey: Boolean,
  alreadySelectedItems: Array
});

const localItems = ref([...props.items]); // copia para evitar mutar la prop
const emit = defineEmits(["close", "update-items"]);

const selectedItem = ref("");
const selectedLargeItem = ref("");

const preloadImages = () => {
  Object.values(itemImages).forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

onMounted(() => {
  preloadImages();
});


const lastSelectedItem = ref(""); // used for image shown
watch(selectedItem, (newVal) => {
  if (newVal) {
    lastSelectedItem.value = newVal;
  }
});

watch(selectedLargeItem, (newVal) => {
  if (newVal) {
    lastSelectedItem.value = newVal;
  }
});

const selectedImage = computed(() => {
  return itemImages[lastSelectedItem.value] || itemImages['Desconocido'];
});

const remainingLargeItems = computed(() => {
  return props.config.lowLevel.largeItemsAllowed - localItems.value.filter(i =>
    props.config.largeItemList.includes(i)
  ).length
})

const allItemTextColor = computed(() => {
  return (props.config.lowLevel.itemsAllowed - localItems.value.length) === 0 ? 'red' : 'black';
})

const largeItemTextColor = computed(() => {
  return remainingLargeItems.value === 0 ? 'red' : 'black';
})

watchEffect(() => {
  console.log("Location:", props.location);
  console.log("Config for location:", props.config);
  console.log("Items array: " + props.items);
  console.log("Is Key Items: " + props.isKey);
});


const addItem = () => {
  if (selectedItem.value && localItems.value.length < props.config.itemsAllowed) {
    console.log(selectedItem.value);
    localItems.value.push(selectedItem.value);
    selectedItem.value = "";
    lastSelectedItem.value = 'Desconocido';
  }
};

const addLargeItem = () => {
  const largeCount = localItems.value.filter(i => props.config.largeItemList.includes(i)).length;
  if (selectedLargeItem.value && largeCount < props.config.lowLevel.largeItemsAllowed) {
    localItems.value.push(selectedLargeItem.value);
    selectedLargeItem.value = "";
    lastSelectedItem.value = 'Desconocido';
  }
};

const removeItem = (index) => {
  localItems.value.splice(index, 1);
};

const confirm = () => {
  console.log("LOCAL ITEMS TIENE: " + localItems.value);
  emit("update-items", props.location, localItems.value, props.isKey);
};
</script>