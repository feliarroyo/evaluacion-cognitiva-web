<template>
  <div
    class="flex flex-col min-h-screen items-center justify-center p-6 space-y-6"
  >
    <h2 class="text-3xl font-bold mb-6">Juego</h2>

    <div class="flex flex-col items-center gap-4 w-full">
      <button @click="goTo('tutorial')" class="btn btn-primary w-80 mx-auto">
        Tutorial
      </button>
      <button @click="goTo('hall')" class="btn btn-primary w-80 mx-auto">
        Hall
      </button>
      <button @click="goTo('lowLevel')" class="btn btn-primary w-80 mx-auto">
        Nivel Bajo
      </button>
      <button @click="goTo('highLevel')" class="btn btn-primary w-80 mx-auto">
        Nivel Alto
      </button>
      <button @click="goBack" class="btn btn-secondary w-48 mx-auto">
        Volver
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goTo = (section) => {
  router.push({ name: "VirtualEnvironment", params: { section } });
};

const goBack = () => {
  router.push({ name: "PatientList" });
};
</script>
