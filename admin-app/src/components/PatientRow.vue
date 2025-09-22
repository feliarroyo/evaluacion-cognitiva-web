<template>
  <div
    class="mb-3 flex flex-col sm:flex-row sm:justify-between sm:items-center border rounded p-4 gap-4 text-black"
  >
    <span>{{ patient.name + " " + patient.lastName }}</span>
    <div class="flex gap-4 flex-wrap sm:flex-nowrap">
      <button class="btn btn-secondary" @click="info">Historial</button>
      <button class="btn btn-secondary" @click="settings">
        Personalizar niveles
      </button>
    </div>
  </div>
</template>

<script setup>
const { patient: patient } = defineProps(["patient"]);

const emit = defineEmits(["info", "settings"]);

const info = () => emit("info", patient);
const settings = () => emit("settings", patient);
</script>
