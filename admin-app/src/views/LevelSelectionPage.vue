<template>
  <div class="center-screen card w-full flex flex-col items-center">
    <h2>Personalizar - Paciente: {{ patientName }}</h2>

    <div class="flex flex-col gap-4 items-center">
      <button
        class="btn btn-primary w-60 mx-auto"
        @click="goToLevel('lowLevel')"
      >
        Configurar Nivel Bajo
      </button>
      <button
        class="btn btn-primary w-60 mx-auto"
        @click="goToLevel('highLevel')"
      >
        Configurar Nivel Alto
      </button>
      <button class="btn btn-secondary w-48 mx-auto" @click="goBack">
        Volver
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const patientId = route.query.id || null;
const patientName = route.query.name || "";

const goToLevel = (levelKey) => {
  router.push({
    name: "LevelSettingsPage",
    query: {
      id: patientId,
      name: patientName,
      context: "patient",
      level: levelKey,
    },
  });
};

const goBack = () => {
  router.push({ name: "PatientList" });
};
</script>
