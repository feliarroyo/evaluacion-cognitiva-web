<template>
    <div class="text-center hover:scale-105 transition-transform">
      <img
        :src="img"
        :alt="name"
        class="w-24 h-24 mx-auto object-contain"
      />
      <p class="mt-2 text-sm font-medium">{{ name }}</p>
    </div>
  </template>
  
  <script setup>
  defineProps({
    name: String,
    img: String
  });
  </script>