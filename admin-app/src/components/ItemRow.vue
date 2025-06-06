<template>
    <div class="flex justify-between items-center border rounded p-4 text-black">
      <span>{{ item.name + ' - GRANDE' }}</span>
      <div>
        <button class="btn btn-secondary" @click="removeItem">Remover</button>
      </div>
    </div>
</template>

<script setup>
const { item: item } = defineProps(["item"]);


const emit = defineEmits(["remove-item"]);

const removeItem = () => emit("remove-item", item);
</script>