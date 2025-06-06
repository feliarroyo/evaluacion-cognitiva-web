<template>
  <BaseLayout>
    <div class="flex flex-col h-screen w-full">
      <div class="bg-white shadow z-10 p-4 sticky top-0 w-full">
        <div class="flex flex-wrap justify-center gap-2 w-full px-4">
          <button class="btn btn-primary" @click="goToSeeVirtualEnvironment">
            Visualizar entorno virtual
          </button>
          <button class="btn btn-primary" @click="goToNewPatient">
            Agregar Paciente
          </button>
          <button class="btn btn-primary" @click="goToSetDefault">
            Definir niveles por defecto
          </button>
          <button class="btn btn-secondary" @click="logOut">
            Cerrar sesión
          </button>
        </div>
        <p v-if="message" class="text-green-600 font-semibold mb-4 text-center">
          {{ message }}
        </p>
      </div>
      <div
        class="flex-1 overflow-y-auto px-4 pb-4 w-full flex justify-center pt-8"
      >
        <div class="flex flex-col gap-3 w-full max-w-xl">
          <p v-if="loading" class="text-center text-gray-500">
            Cargando pacientes...
          </p>
          <PatientRow
            v-for="pac in patients"
            :key="pac.id"
            :patient="pac"
            @info="handleInfo"
            @settings="handleSettings"
          />
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  db,
  auth,
  signOut,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "@/firebase";
import PatientRow from "@/components/PatientRow.vue";
import BaseLayout from "@/components/layouts/BaseLayout.vue";
import VirtualEnvironment from "./VirtualEnvironment.vue";

const patients = ref([]);
const loading = ref(true);

const handleInfo = (patient) => {
  router.push({
    name: "PatientInfo",
    query: {
      id: patient.id,
    },
  });
};

const handleSettings = (patient) => {
  router.push({
    name: "LevelSettingsPage",
    query: {
      context: "patient",
      id: patient.id,
      name: patient.name + " " + patient.lastName,
    },
  });
};

const router = useRouter();
const goToSeeVirtualEnvironment = () =>
  router.push({ name: "VirtualEnvironment" });
const goToNewPatient = () => router.push({ name: "NewPatient" });
const goToSetDefault = () =>
  router.push({ name: "LevelSettingsPage", query: { context: "default" } });

const logOut = async () => {
  try {
    await signOut(auth);
    router.push({ name: "Login" }); // redirect to login screen
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
const route = useRoute();
const message = ref(route.query.message || "");

onMounted(async () => {
  // Get current user credentials
  const currentUser = auth.currentUser;

  // If needed, show message for 4 seconds
  if (message.value) {
    setTimeout(() => {
      message.value = "";
      router.replace({ query: {} });
    }, 4000);
  }

  try {
    // Get specialist info
    const especialistasRef = collection(db, "especialista");
    const q = query(especialistasRef, where("mail", "==", currentUser.email));
    const querySnapshot = await getDocs(q);

    // In case there is not a logged user.
    if (querySnapshot.empty) {
      console.warn("Especialista no encontrado");
      return;
    }

    // Get allowed patients emails
    const specialistData = querySnapshot.docs[0].data();
    const allowedPatientEmails = specialistData.patients || [];

    if (allowedPatientEmails.length === 0) {
      patients.value = [];
      return;
    }

    // Get patient list using the mails
    const patientsPromises = allowedPatientEmails.map(async (email) => {
      const docRef = doc(db, "pacientes", email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    });

    // Removed patients from mails not found
    const fetchedPatients = await Promise.all(patientsPromises);
    patients.value = fetchedPatients.filter((p) => p !== null);
  } catch (error) {
    console.error("Error fetching patients:", error);
  } finally {
    loading.value = false;
  }
});
</script>
