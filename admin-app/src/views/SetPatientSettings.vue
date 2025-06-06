<template>
    <div class="max-w-3xl mx-auto p-4">
        <h2 class="text-2xl font-bold mb-6 text-center">Personalizar paciente: {{ patientName }}</h2>

        <LevelSettings nivel="Bajo" :data="levels.lowLevel" @editar-objetos="goToItemSelection('lowLevel')" />
        <LevelSettings nivel="Medio" :data="levels.mediumLevel" @editar-objetos="goToItemSelection('mediumLevel')" />
        <LevelSettings nivel="Alto" :data="levels.highLevel" @editar-objetos="goToItemSelection('highLevel')" />
    </div>
    <div class="max-w-3xl mx-auto p-4">
        <button class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800" @click="returnToPatientList">
            Salir sin guardar
        </button>
        <button class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800" @click="saveChanges">
            Guardar y salir
        </button>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import LevelSettings from "@/components/LevelSettings.vue";

const route = useRoute();
const router = useRouter();

const patientName = route.query.name || "Paciente";
const levels = ref({
    lowLevel: {
        timeMem: "45",
        timeSearch: "60",
        distractingItems: {},
        searchItems: {}
    },
    mediumLevel: {
        timeMem: "35",
        timeSearch: "35",
        distractingItems: {},
        searchItems: {}
    },
    highLevel: {
        timeMem: "15",
        timeSearch: "25",
        distractingItems: {},
        searchItems: {}
    }
});

const goToItemSelection = (levelKey) => {
    router.push({ path: "/select-items", query: { level: levelKey } });
};

const returnToPatientList = () => router.push({name: 'PatientList'});
const saveChanges = () => router.push({name: 'PatientList'});
</script>