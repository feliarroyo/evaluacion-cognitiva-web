<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-50">
    <div
      class="h-[95vh] w-full max-w-3xl flex flex-col p-4 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div class="sticky top-0 z-10 bg-white pt-4 pb-2">
        <h2 class="text-2xl font-bold mb-4 text-center">
          Información del Paciente
        </h2>
        <div
          class="bg-white shadow p-4 rounded mb-6 flex justify-between items-center"
        >
          <div>
            <p>
              <strong>Nombre:</strong> {{ patient?.name }}
              {{ patient?.lastName }}
            </p>
            <p><strong>Email:</strong> {{ patientId }}</p>
          </div>
          <button
            class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            @click="volver"
          >
            Volver
          </button>
        </div>
      </div>
      <h3 class="text-xl font-semibold mb-3">Historial de partidas</h3>
      <div class="flex flex-col grow min-h-0 overflow-y-auto pr-2 pt-2">
        <div v-if="loading" class="text-gray-500">Cargando...</div>
        <div v-else-if="playthroughs.length === 0" class="text-gray-500">
          Sin partidas registradas.
        </div>
        <ul v-else class="flex flex-col gap-4">
          <li
            v-for="(pt, index) in playthroughs"
            :key="index"
            class="border p-3 rounded shadow"
          >
            <div class="flex flex-col md:flex-row md:items-start md:gap-3">
              <div class="md:w-1/2">
                <p><strong>Fecha:</strong> {{ pt.date }} ({{ pt.time }})</p>
                <p><strong>Nivel:</strong> {{ pt.level }}</p>
                <p>
                  <strong>Tiempo total de memorización:</strong>
                  {{ pt.memTime }}s
                </p>
                <p>
                  <strong>Tiempo total de búsqueda:</strong>
                  {{ patient?.levelsConfig?.mediumLevel?.timeSearch }}s
                </p>
                <p>
                  <strong>Tiempo utilizado de búsqueda:</strong>
                  {{ pt.searchTime }}s
                </p>
                <p><strong>Presición: </strong>{{ pt.precision }}%</p>
                <p>
                  <strong>Eficiencia temporal: </strong>{{ pt.efficiency }}%
                </p>
                <p><strong>Tasa de error: </strong>{{ pt.errorRate }}%</p>
                <p>
                  <strong>Indice de omisión: </strong>{{ pt.omissionIndex }}%
                </p>
                <p>
                  <strong>Puntaje general: </strong
                  >{{ Math.max(0, pt.generalScore) }}%
                </p>
              </div>
              <!-- Objetos (derecha) -->
              <div class="md:w-1/2 mt-4 md:mt-0 grid grid-cols-2 gap-2">
                <!-- Objetos memorizados -->
                <div class="border border-gray-300 rounded p-2">
                  <p class="font-semibold mb-1 text-center">
                    Objetos memorizados
                  </p>
                  <div class="grid grid-cols-3 gap-2">
                    <img
                      v-for="(item, i) in pt.memObjects"
                      :key="'mem-' + i"
                      :src="getImagePath(item)"
                      :alt="item"
                      class="h-12 w-12 object-contain mx-auto"
                      :title="item"
                    />
                  </div>
                </div>

                <!-- Objetos encontrados -->
                <div class="border border-gray-300 rounded p-2">
                  <p class="font-semibold mb-1 text-center">
                    Objetos encontrados
                  </p>
                  <div class="grid grid-cols-3 gap-2">
                    <img
                      v-for="(item, i) in pt.foundObjects"
                      :key="'found-' + i"
                      :src="getImagePath(item)"
                      :alt="item"
                      class="h-12 w-12 object-contain mx-auto"
                      :title="item"
                    />
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { db, doc, getDoc, collection, query, where, getDocs } from "@/firebase";
import BaseLayout from "@/components/layouts/BaseLayout.vue";
import itemImages from "@/data/itemImages.json";

const route = useRoute();
const router = useRouter();
const loading = ref(true);

const patientId = route.query.id; // Passed via query param
const patient = ref(null);
const playthroughs = ref([]);

const volver = () => router.push({ name: "PatientList" });

const getImagePath = (itemName) => {
  return itemImages[itemName] || itemImages["Desconocido"];
};

// Fetch patient info and results
onMounted(async () => {
  try {
    const patientRef = doc(db, "pacientes", patientId);
    const patientSnap = await getDoc(patientRef);
    if (patientSnap.exists()) {
      patient.value = patientSnap.data();
    }
    const email = patient.id;

    console.log(email);
    const resultsRef = collection(db, "results");
    const q = query(resultsRef, where("idPatient", "==", route.query.id));
    const querySnap = await getDocs(q);
    playthroughs.value = querySnap.docs.map((doc) => {
      const data = doc.data();
      const memSet = new Set(data.memObjects || []);
      const foundSet = new Set(data.foundObjects || []);

      const correctObjects = data.foundObjects.filter((obj) => memSet.has(obj));
      const incorrectObjects = data.foundObjects.filter(
        (obj) => !memSet.has(obj)
      );

      const precision =
        data.memObjects?.length > 0
          ? (correctObjects.length / data.memObjects.length) * 100
          : 0;

      const efficiency =
        patient.value?.levelsConfig?.mediumLevel?.timeSearch > 0
          ? ((patient.value.levelsConfig.mediumLevel.timeSearch -
              data.searchTime) /
              patient.value.levelsConfig.mediumLevel.timeSearch) *
            100
          : 0;

      const errorRate =
        data.foundObjects?.length > 0
          ? (incorrectObjects.length / data.foundObjects.length) * 100
          : 0;

      const omissionIndex =
        data.memObjects?.length > 0
          ? ((data.memObjects.length - correctObjects.length) /
              data.memObjects.length) *
            100
          : 0;

      const W1 = 0.5; // precisión
      const W2 = 0.3; // eficiencia temporal
      const W3 = 0.2; // taza de error

      const generalScore = precision * W1 + efficiency * W2 - errorRate * W3;

      return {
        ...data,
        correctObjects,
        incorrectObjects,
        precision: precision.toFixed(1),
        efficiency: efficiency.toFixed(1),
        errorRate: errorRate.toFixed(1),
        omissionIndex: omissionIndex.toFixed(1),
        generalScore: generalScore.toFixed(1),
      };
    });
    loading.value = false;
  } catch (err) {
    console.error("Error cargando los pacientes o resultados:", err);
  }
});
</script>
