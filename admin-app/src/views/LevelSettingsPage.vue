<template>
  <div class="center-screen card w-full">
    <h2>{{ titulo }}</h2>
    <div v-if='context !== "default"' class="mb-4 center-element">
      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="useDefaultConfig" />
        Usar configuración por defecto del especialista
      </label>
    </div>
    <div class="flex flex-wrap gap-4">
      <LevelSettings class="flex-1 min-w-[250px]" level="1" :data="tempLevels.lowLevel" :disabled="useDefaultConfig"
        @edit-items="goToItemSelection('lowLevel')" />

      <LevelSettings class="flex-1 min-w-[250px]" level="2" :data="tempLevels.highLevel" :disabled="useDefaultConfig"
        @edit-items="goToItemSelection('highLevel')" />
    </div>

    <div class="btns-bar pt-4">
      <button class="btn btn-secondary" @click="volver">
        Salir sin guardar
      </button>
      <button class="btn btn-success" @click="guardar">
        Guardar y salir
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { db, doc, getDoc, setDoc, collection, where, query, auth, getDocs } from "@/firebase";
import LevelSettings from "@/components/LevelSettings.vue";
import { tempLevels } from "@/data/tempLevelData.js";

const route = useRoute();
const router = useRouter();
const useDefaultConfig = ref(false);

//console.log("UPDATED CONFIG IS " + (updatedConfig !== null)? updatedConfig.value : "NULL");
const context = route.query.context || "patient"; // 'patient' o 'default'
const patientId = route.query.id || null;
const patientName = route.query.name || "";

const titulo = computed(() =>
  context === "default"
    ? "Definir configuración por defecto"
    : `Personalizar paciente: ${patientName}`
);

const levels = ref({
  lowLevel: {
    distractingItems: {
      aboveEntrance: { items: [] },
      insideEntrance: { items: [] },
      aboveTVShelf: { items: [] },
      aboveTVFurniture: { items: [] },
      insideTVShelf: { items: [] },
      insideTVDoor: { items: [] },
      oppositeBookshelf: { items: [] },
      aboveLongFurniture: { items: [] },
      insideLongFurnitureShelf: { items: [] },
      insideLongFurnitureDoor: { items: [] },
      insideLongFurnitureDrawer: { items: [] },
      aboveOppositeDrawer: { items: [] },
      insideOppositeDrawer: { items: [] },
      couch: { items: [] },
      table: { items: [] },
      chair: { items: [] },
      sideTable: { items: [] },
      rack: { items: [] }
    },
    searchItems: {
      aboveEntrance: { items: [] },
      insideEntrance: { items: [] },
      aboveTVShelf: { items: [] },
      aboveTVFurniture: { items: [] },
      insideTVShelf: { items: [] },
      insideTVDoor: { items: [] },
      oppositeBookshelf: { items: [] },
      aboveLongFurniture: { items: [] },
      insideLongFurnitureShelf: { items: [] },
      insideLongFurnitureDoor: { items: [] },
      insideLongFurnitureDrawer: { items: [] },
      aboveOppositeDrawer: { items: [] },
      insideOppositeDrawer: { items: [] },
      couch: { items: [] },
      table: { items: [] },
      chair: { items: [] },
      sideTable: { items: [] },
      rack: { items: [] }
    },
    timeMem: "10",
    timeSearch: "120"
  },
  highLevel: {
    distractingItems: {
      aboveEntrance: { items: [] },
      insideEntrance: { items: [] },
      aboveTVShelf: { items: [] },
      aboveTVFurniture: { items: [] },
      insideTVShelf: { items: [] },
      insideTVDoor: { items: [] },
      oppositeBookshelf: { items: [] },
      aboveLongFurniture: { items: [] },
      insideLongFurnitureShelf: { items: [] },
      insideLongFurnitureDoor: { items: [] },
      insideLongFurnitureDrawer: { items: [] },
      aboveOppositeDrawer: { items: [] },
      insideOppositeDrawer: { items: [] },
      couch: { items: [] },
      table: { items: [] },
      chair: { items: [] },
      sideTable: { items: [] },
      rack: { items: [] }
    },
    searchItems: {
      aboveEntrance: { items: [] },
      insideEntrance: { items: [] },
      aboveTVShelf: { items: [] },
      aboveTVFurniture: { items: [] },
      insideTVShelf: { items: [] },
      insideTVDoor: { items: [] },
      oppositeBookshelf: { items: [] },
      aboveLongFurniture: { items: [] },
      insideLongFurnitureShelf: { items: [] },
      insideLongFurnitureDoor: { items: [] },
      insideLongFurnitureDrawer: { items: [] },
      aboveOppositeDrawer: { items: [] },
      insideOppositeDrawer: { items: [] },
      couch: { items: [] },
      table: { items: [] },
      chair: { items: [] },
      sideTable: { items: [] },
      rack: { items: [] }
    },
    timeMem: "5",
    timeSearch: "40"
  }
});

onMounted(async () => {
  try {
    if (!tempLevels.initialized) {
      let docRef;

      if (context === "default") {
        const especialistaRef = collection(db, "especialista");
        const q = query(especialistaRef, where("mail", "==", auth.currentUser.email));
        const querySnapshot = await getDocs(q);
        docRef = doc(db, "especialista", querySnapshot.docs[0].id);
      } else {
        docRef = doc(db, "pacientes", patientId);
      }

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        useDefaultConfig.value = data.usesDefault || true;
        const levelsConfig = data.levelsConfig || {};
        tempLevels.lowLevel = levelsConfig.lowLevel || defaultLevelStructure();
        tempLevels.highLevel = levelsConfig.highLevel || defaultLevelStructure();
      } else {
        tempLevels.lowLevel = defaultLevelStructure();
        tempLevels.mediumLevel = defaultLevelStructure();
        tempLevels.highLevel = defaultLevelStructure();
      }
      tempLevels.initialized = true;
    }
  } catch (error) {
    console.error("Error cargando configuración:", error);
  }
});

const guardar = async () => {
  try {
    const config = {
      levelsConfig: {
        lowLevel: tempLevels.lowLevel,
        highLevel: tempLevels.highLevel
      },
      usesDefault: useDefaultConfig.value
    };

    console.log(config);

    if (context === "default") {
      const especialistaRef = collection(db, "especialista");
      const q = query(especialistaRef, where("mail", "==", auth.currentUser.email));
      const querySnapshot = await getDocs(q);
      await setDoc(doc(db, "especialista", querySnapshot.docs[0].id), config, { merge: true });
    } else {
      await setDoc(doc(db, "pacientes", patientId), config, { merge: true });
    }

    // Clear temp data
    tempLevels.initialized = false;

    router.push({ name: 'PatientList', query: { message: "Configuración guardada correctamente." } });
  } catch (e) {
    console.error("Error al guardar:", e);
  }
};

const volver = () => {
  tempLevels.initialized = false;
  router.push({ name: 'PatientList' });
}

const goToItemSelection = (levelKey) => {
  router.push({
    path: "/select-items",
    query: {
      level: levelKey,
      context: context,
      id: patientId,
      searchItems: encodeURIComponent(JSON.stringify(levels.value[levelKey].searchItems)),
      distractingItems: encodeURIComponent(JSON.stringify(levels.value[levelKey].distractingItems))
    },
  });
};
</script>