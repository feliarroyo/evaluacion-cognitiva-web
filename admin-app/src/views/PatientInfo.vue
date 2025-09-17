<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-50">
    <div
      class="h-[95vh] w-full max-w-3xl flex flex-col p-4 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div class="sticky top-0 z-10 bg-white pt-4 pb-2">
        <h2 class="text-2xl font-bold mb-4 text-center">
          Historial de Partidas
        </h2>
        <div
          class="bg-white shadow p-4 rounded mb-6 flex justify-between items-center"
        >
          <div>
            <p>
              <strong>Nombre:</strong> {{ patient?.name }}
              {{ patient?.lastName }}
            </p>
            <p><strong>Email:</strong> {{ patient?.email }}</p>
          </div>
          <button
            class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            @click="volver"
          >
            Volver
          </button>
        </div>
      </div>

      <h3 class="text-xl font-semibold mb-3">Partidas registradas</h3>

      <div class="flex flex-col grow min-h-0 overflow-y-auto pr-2 pt-2">
        <div v-if="loading" class="text-gray-500">Cargando...</div>
        <div v-else-if="playthroughs.length === 0" class="text-gray-500">
          Sin partidas registradas.
        </div>
        <ul v-else class="flex flex-col gap-4">
          <li
            v-for="(pt, index) in playthroughs"
            :key="index"
            class="border p-3 rounded shadow flex justify-between items-center"
          >
            <div>
              <p><strong>Fecha:</strong> {{ pt.date }} ({{ pt.time }})</p>
              <p><strong>Nivel:</strong> {{ pt.level }}</p>
            </div>
            <button class="btn btn-primary" @click="goToDetails(pt)">
              Ver detalles
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { rtdb } from "@/firebase";
import { get, ref as dbRef, child } from "firebase/database";

const route = useRoute();
const router = useRouter();
const loading = ref(true);

const patientId = route.query.id;
const patient = ref(null);
const playthroughs = ref([]);

const volver = () => router.push({ name: "PatientList" });

const goToDetails = (pt) => {
  router.push({
    name: "PatientResultDetails",
    query: {
      id: patientId,
      date: pt.date,
      time: pt.time,
    },
  });
};

onMounted(async () => {
  try {
    const patientSnapshot = await get(
      child(dbRef(rtdb), `pacientes/${patientId}`)
    );
    if (patientSnapshot.exists()) {
      patient.value = patientSnapshot.val();
    } else {
      loading.value = false;
      return;
    }

    const patientEmail = patient.value.email;
    const resultsSnapshot = await get(child(dbRef(rtdb), `results`));
    const allResults = resultsSnapshot.exists() ? resultsSnapshot.val() : {};

    const matchedResults = [];

    for (const [, resultData] of Object.entries(allResults)) {
      if (resultData.idPatient === patientEmail && resultData.results) {
        for (const [_, res] of Object.entries(resultData.results)) {
          matchedResults.push({
            ...res,
            generalScore: res.generalScore || 0,
          });
        }
      }
    }

    playthroughs.value = matchedResults;
    loading.value = false;
  } catch (err) {
    console.error("Error cargando historial:", err);
    loading.value = false;
  }
});
</script>
