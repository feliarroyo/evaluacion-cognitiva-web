<template>
  <div class="flex flex-col min-h-screen p-4">
    <!-- Botón volver -->
    <div class="w-full flex items-center mb-4">
      <button
        @click="goBack"
        class="text-lg font-bold px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
      >
        ← Volver
      </button>
    </div>

    <!-- Título -->
    <h1 class="text-3xl font-bold mb-10 text-center w-full">
      Entorno de la aplicación móvil
    </h1>

    <!-- Carrusel con descripción -->
    <div class="flex flex-col flex-grow items-center justify-center w-full">
      <div class="flex flex-col items-center w-full max-w-5xl">
        <!-- Flechas + Imagen -->
        <div class="flex items-center w-full">
          <!-- Flecha izquierda -->
          <button @click="prevPhoto" class="text-4xl px-3 hover:text-gray-600">
            ‹
          </button>

          <!-- Imagen -->
          <img
            :src="photos[currentIndex].src"
            :alt="photos[currentIndex].desc"
            class="flex-grow max-h-[70vh] object-contain rounded shadow"
          />

          <!-- Flecha derecha -->
          <button @click="nextPhoto" class="text-4xl px-3 hover:text-gray-600">
            ›
          </button>
        </div>

        <!-- Descripción (alineada con todo el carrusel) -->
        <p class="mt-4 text-lg text-center px-4 w-full">
          {{ photos[currentIndex].desc }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const photos = ref([
  {
    src: "/unityEnvironment/hall.png",
    desc: "Hall: está es la zona donde el usuario tendrá la posibilidad de observar los objetos detenidamente para recordarlos y luego buscarlos en el living. Los objetos estarán colocados en los estantes flotantes de la pared o en el perchero en caso de ser necesario.",
  },
  {
    src: "/unityEnvironment/centroNivel1.png",
    desc: "Nivel 1: zona central, un sillón y una mesa.",
  },
  {
    src: "/unityEnvironment/entradaNivel1.png",
    desc: "Nivel 1: entrada, es la primera zona que verá el usuario. Consta de un mueble bajo, decorado con un cuadro, una lampara y un jarrón. A la izquierda del mueble un perchero.",
  },
  {
    src: "/unityEnvironment/opuestoNivel1.png",
    desc: "Nivel 1: pared opuesta a la entrada. Se visualiza un mueble compuesto donde se pueden guardar objetos dentro de las puertas y los cajones, además de guardarlos en la pequeña biblioteca y sobre los muebles.",
  },
  {
    src: "/unityEnvironment/tvNivel1.png",
    desc: "Nivel 1: zona donde se encuentra la tv justo frente al centro. En esta zona se pueden poner objetos en las repisas de abajo, al lado de la tv, en la repisa flotante de arriba y dentro de las puertas.",
  },
  {
    src: "/unityEnvironment/centroNivel2.png",
    desc: "Nivel 2: zona central, posee dos sillones individuales, una pequeña mesa entre ellos y una mesa más grande delante.",
  },
  {
    src: "/unityEnvironment/entradaNivel2.png",
    desc: "Nivel 2: entrada, primera zona que verá el usuario. Consta al igual que en el nivel 1 de un mueble bajo con sus decoraciones y un perchero, lo nuevo es que el usuario puede interactuar con cajones y ahi pueden guardarse objetos también.",
  },
  {
    src: "/unityEnvironment/opuestoNivel2.png",
    desc: "Nivel 2: pared opuesta a la entrada. Se encuentra el mismo mueble compuesto del nivel 1 con las mismas capacidades para colocar objetos pero con un agregado de una repisa en el mueble bajo del centro.",
  },
  {
    src: "/unityEnvironment/tvNivel2.png",
    desc: "Nivel 2: zona de la tv, justo frente al centro. En esta zona al igual que en el nivel 1 se pueden poner objetos dentro de las puertas, en la repisa flotante, en los lados de la tv y en la repisa pequeña de abajo.",
  },
]);

const currentIndex = ref(0);

const prevPhoto = () => {
  currentIndex.value =
    (currentIndex.value - 1 + photos.value.length) % photos.value.length;
};

const nextPhoto = () => {
  currentIndex.value = (currentIndex.value + 1) % photos.value.length;
};

const goBack = () => {
  window.history.back();
};
</script>
