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
import { getDatabase, ref as dbRef, get, child } from "firebase/database";
import { auth, signOut } from "@/firebase";
import PatientRow from "@/components/PatientRow.vue";
import BaseLayout from "@/components/layouts/BaseLayout.vue";

const patients = ref([]);
const loading = ref(true);
const router = useRouter();

const goToSeeVirtualEnvironment = () => {
  router.push({ name: "VirtualEnvironment" });
};

const goToNewPatient = () => {
  router.push({ name: "NewPatient" });
};

const logOut = async () => {
  try {
    await signOut(auth);
    router.push({ name: "Login" });
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

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
    name: "LevelSelectionPage",
    query: {
      context: "patient",
      id: patient.id,
      name: patient.name + " " + patient.lastName,
    },
  });
};

onMounted(async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.warn("No hay usuario logueado");
    loading.value = false;
    return;
  }

  try {
    const database = getDatabase();

    const especialistasSnapshot = await get(dbRef(database, "especialista"));
    if (!especialistasSnapshot.exists()) {
      console.warn("No hay especialistas en base");
      loading.value = false;
      return;
    }

    let especialistaKey = null;
    especialistasSnapshot.forEach((childSnap) => {
      const data = childSnap.val();
      if (data.mail === currentUser.email) {
        especialistaKey = childSnap.key;
      }
    });

    if (!especialistaKey) {
      console.warn("Especialista no encontrado");
      loading.value = false;
      return;
    }

    const pacientesIdsSnapshot = await get(
      dbRef(database, `especialista/${especialistaKey}/pacientes`)
    );
    if (!pacientesIdsSnapshot.exists()) {
      patients.value = [];
      loading.value = false;
      return;
    }

    const pacientesIds = Object.keys(pacientesIdsSnapshot.val());

    const pacientesPromises = pacientesIds.map(async (id) => {
      const pacienteSnap = await get(dbRef(database, `pacientes/${id}`));
      if (pacienteSnap.exists()) {
        return { id: pacienteSnap.key, ...pacienteSnap.val() };
      }
      return null;
    });

    const pacientesData = await Promise.all(pacientesPromises);
    patients.value = pacientesData.filter((p) => p !== null);
  } catch (error) {
    console.error("Error fetching patients:", error);
  } finally {
    loading.value = false;
  }
});
</script>
