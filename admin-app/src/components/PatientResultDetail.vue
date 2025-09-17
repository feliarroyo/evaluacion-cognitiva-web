<template>
  <div class="h-screen w-screen flex items-center justify-center bg-gray-50">
    <div
      class="h-[95vh] w-full max-w-3xl flex flex-col p-4 bg-white rounded-lg shadow-md overflow-hidden"
    >
      <div class="sticky top-0 z-10 bg-white pt-4 pb-2">
        <h2 class="text-2xl font-bold mb-4 text-center">Detalle de Partida</h2>
        <button
          class="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 mb-4"
          @click="volver"
        >
          Volver
        </button>
      </div>

      <div v-if="loading" class="text-gray-500">Cargando...</div>
      <div v-else-if="!result" class="text-gray-500">
        Partida no encontrada.
      </div>
      <div v-else class="flex flex-col gap-4 overflow-y-auto pr-2 pt-2">
        <p><strong>Fecha:</strong> {{ result.date }} ({{ result.time }})</p>
        <p><strong>Nivel:</strong> {{ result.level }}</p>
        <p><strong>Tiempo de memorización:</strong> {{ result.memTime }}s</p>
        <p><strong>Tiempo de búsqueda:</strong> {{ result.searchTime }}s</p>
        <p><strong>Presición:</strong> {{ result.precision }}%</p>
        <p><strong>Eficiencia:</strong> {{ result.efficiency }}%</p>
        <p><strong>Tasa de error:</strong> {{ result.errorRate }}%</p>
        <p><strong>Índice de omisión:</strong> {{ result.omissionIndex }}%</p>
        <p><strong>Puntaje general:</strong> {{ result.generalScore }}%</p>

        <div class="grid grid-cols-2 gap-4">
          <div class="border p-2 rounded">
            <p class="font-semibold mb-2 text-center">Objetos memorizados</p>
            <div class="grid grid-cols-3 gap-2">
              <img
                v-for="(item, i) in result.memObjects"
                :key="'mem-' + i"
                :src="getImagePath(item)"
                :alt="item"
                class="h-12 w-12 object-contain mx-auto"
              />
            </div>
          </div>
          <div class="border p-2 rounded">
            <p class="font-semibold mb-2 text-center">Objetos encontrados</p>
            <div class="grid grid-cols-3 gap-2">
              <img
                v-for="(item, i) in result.foundObjects"
                :key="'found-' + i"
                :src="getImagePath(item)"
                :alt="item"
                class="h-12 w-12 object-contain mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { rtdb } from "@/firebase";
import { get, ref as dbRef, child } from "firebase/database";
import itemImages from "@/data/itemImages.json";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const result = ref(null);

const patientId = route.query.id;
const date = route.query.date;
const time = route.query.time;

const volver = () => router.back();

const getImagePath = (itemName) => {
  return itemImages[itemName] || itemImages["Desconocido"];
};

onMounted(async () => {
  try {
    const resultsSnapshot = await get(child(dbRef(rtdb), `results`));
    if (!resultsSnapshot.exists()) {
      loading.value = false;
      return;
    }

    const allResults = resultsSnapshot.val();
    for (const [, resultData] of Object.entries(allResults)) {
      if (resultData.results) {
        for (const [_, res] of Object.entries(resultData.results)) {
          if (res.date === date && res.time === time) {
            result.value = res;
            break;
          }
        }
      }
    }

    loading.value = false;
  } catch (err) {
    console.error("Error cargando detalle:", err);
    loading.value = false;
  }
});
</script>
