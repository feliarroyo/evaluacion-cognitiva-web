<template>
  <div class="w-full flex justify-start mb-4 p-4 max-w-5xl">
    <button
      @click="goBack"
      class="ml-4 text-lg px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
      aria-label="Volver"
    >
      ←
    </button>
  </div>

  <div class="flex flex-col p-4 items-center">
    <div class="flex flex-col items-center justify-center w-full max-w-5xl">
      <h3 class="text-3xl font-bold mb-2 text-center w-full">
        {{ sectionTitle }}
      </h3>

      <div class="flex items-center w-full mt-2">
        <button
          v-if="photos.length > 1"
          @click="prevPhoto"
          class="text-4xl px-3 hover:text-gray-600"
        >
          ‹
        </button>

        <div
          v-if="photos.length > 0"
          class="flex-grow flex items-center justify-center w-full h-[60vh] bg-gray-50 rounded shadow mx-2"
        >
          <img
            v-if="photos[currentIndex].type === 'image'"
            :src="photos[currentIndex].src"
            :alt="photos[currentIndex].desc"
            class="max-h-full max-w-full object-contain"
          />

          <video
            v-else-if="photos[currentIndex].type === 'video'"
            :src="photos[currentIndex].src"
            controls
            class="max-h-full max-w-full object-contain"
          />
        </div>

        <div
          v-else
          class="flex-grow flex items-center justify-center w-full h-[60vh] bg-gray-50 rounded shadow mx-2"
        >
          <p class="text-gray-500 text-center">
            No hay imágenes disponibles para esta sección.
          </p>
        </div>

        <button
          v-if="photos.length > 1"
          @click="nextPhoto"
          class="text-4xl px-3 hover:text-gray-600"
        >
          ›
        </button>
      </div>

      <div class="h-8"></div>

      <p v-if="photos.length > 0" class="text-lg text-center px-4 w-full">
        {{ photos[currentIndex].desc }}
      </p>

      <p v-else class="text-center text-gray-500 mt-6">
        No hay imágenes disponibles para esta sección.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const allPhotos = ref([
  {
    type: "image",
    src: "/unityEnvironment/hall.png",
    desc: "Esta es la zona donde el usuario tendrá la posibilidad de observar los objetos detenidamente para recordarlos y luego buscarlos en el living. Los objetos estarán colocados en los estantes flotantes de la pared; o en el perchero, en caso de ser necesario.",
    section: "hall",
  },
  {
    type: "image",
    src: "/unityEnvironment/centroNivel1.png",
    desc: "Zona central: un sillón principal de un cuerpo y una mesa baja en el centro de la sala.",
    section: "lowLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/entradaNivel1.png",
    desc: "Entrada: es la primera zona que verá el usuario. Consta de un mueble bajo, decorado con un cuadro, una lampara y un jarrón. A la izquierda se ubica un perchero.",
    section: "lowLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/opuestoNivel1.png",
    desc: "Pared opuesta a la entrada: mueble modular con cajones y puertas para guardar objetos. También incluye una pequeña biblioteca y espacio en la superficie para colocar cosas.",
    section: "lowLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/tvNivel1.png",
    desc: "Zona de la TV: ubicada frente a la zona central. Tiene repisas inferiores y flotantes, además de compartimentos cerrados para guardar objetos.",
    section: "lowLevel",
    section: "lowLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/centroNivel2.png",
    desc: "Zona central: dos sillones individuales con una mesa pequeña entre ellos y una mesa más grande al frente.",
    section: "highLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/entradaNivel2.png",
    desc: "Entrada: similar al nivel bajo, con un mueble bajo decorado y un perchero. Incluye cajones interactivos que pueden contener objetos.",
    section: "highLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/opuestoNivel2.png",
    desc: "Pared opuesta a la entrada: mismo mueble modular del nivel bajo, pero con una repisa extra en el centro.",
    section: "highLevel",
  },
  {
    type: "image",
    src: "/unityEnvironment/tvNivel2.png",
    desc: "Zona de la TV: frente al área central. Permite colocar objetos dentro de los compartimentos, en la repisa flotante y en las repisas inferiores.",
    section: "highLevel",
  },
  {
    type: "video",
    src: "/unityEnvironment/tutorialVideo.mp4",
    desc: "Video demostración de lo que se busca que haga el usuario. Se puede visualizar la tarea desde el inicio hasta el final con una explicación detallada.",
    section: "tutorial",
  },
]);

const section = route.params.section;

const photos = computed(() =>
  allPhotos.value.filter((p) => p.section === section)
);

const currentIndex = ref(0);

const prevPhoto = () => {
  currentIndex.value =
    (currentIndex.value - 1 + photos.value.length) % photos.value.length;
};

const nextPhoto = () => {
  currentIndex.value = (currentIndex.value + 1) % photos.value.length;
};

const sectionTitle = computed(() => {
  switch (section) {
    case "tutorial":
      return "Juego - Tutorial";
    case "hall":
      return "Juego - Hall";
    case "lowLevel":
      return "Juego - Nivel Bajo";
    case "highLevel":
      return "Juego - Nivel Alto";
    default:
      return "Juego";
  }
});

const goBack = () => {
  window.history.back();
};
</script>
