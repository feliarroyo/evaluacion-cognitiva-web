<template>
  <div class="center-screen card w-full max-w-md">
    <h2>Registrar Usuario</h2>

    <form @submit.prevent="registerUser">
      <div class="login-input">
        <label>Nombre</label>
        <input v-model="name" type="text" required />
      </div>

      <div class="login-input">
        <label>Apellido</label>
        <input v-model="lastName" type="text" required />
      </div>

      <div class="login-input">
        <label>Correo electrónico</label>
        <input v-model="email" type="email" required />
      </div>

      <div class="login-input">
        <label>Contraseña</label>
        <input v-model="password" type="password" required />
      </div>
      <div class="btns-bar">
        <button type="button" class="btn btn-secondary" @click="goBack">
          Volver a lista de usuarios
        </button>
        <!-- <button type="button" class="btn btn-secondary" @click="createLocales">
          Reset current admin
        </button> -->
        <button type="submit" class="btn btn-primary">Registrar usuario</button>
      </div>
    </form>

    <p v-if="message" class="mt-4 text-green-600 font-semibold">
      {{ message }}
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { auth, rtdb } from "@/firebase";
import { useRouter } from "vue-router";
import { getDatabase, ref as dbRef, set, update, get } from "firebase/database";
import { secondaryAuth } from "@/createUserFirebase";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";

const name = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const message = ref("");
const error = ref("");
const router = useRouter();

const levelsConfigDefault = {
  lowLevel: {
    distractingItems: {},
    searchItems: {},
    timeMem: "45",
    timeSearch: "60",
  },
  highLevel: {
    distractingItems: {},
    searchItems: {},
    timeMem: "15",
    timeSearch: "25",
  },
};

const registerUser = async () => {
  message.value = "";
  error.value = "";

  try {
    const database = getDatabase();
    // Crear usuario con secondaryAuth
    const userCred = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.value,
      password.value
    );
    const newUserId = userCred.user.uid;
    console.log("Usuario creado:", newUserId);

    const globalConfigSnap = await get(dbRef(database, "globalLevelsConfig"));
    let levelsConfig = {
      lowLevel: {
        distractingItems: {},
        searchItems: {},
        timeMem: 0,
        timeSearch: 0,
      },
      highLevel: {
        distractingItems: {},
        searchItems: {},
        timeMem: 0,
        timeSearch: 0,
      },
    };

    if (globalConfigSnap.exists()) {
      levelsConfig = globalConfigSnap.val();
    } else {
      console.warn("No existe globalLevelsConfig, se usará estructura vacía.");
    }

    // Agregar paciente a Realtime Database
    await set(dbRef(database, `pacientes/${newUserId}`), {
      name: name.value,
      lastName: lastName.value,
      email: email.value,
      levelsConfig: levelsConfig,
    });

    // Buscar especialista actual (por email)
    const especialistasSnap = await get(dbRef(database, "especialista"));
    let especialistaKey = null;

    especialistasSnap.forEach((childSnap) => {
      const data = childSnap.val();
      if (data.mail === auth.currentUser.email) {
        especialistaKey = childSnap.key;
      }
    });

    if (!especialistaKey) {
      console.warn("Especialista no encontrado.");
    } else {
      await update(
        dbRef(database, `especialista/${especialistaKey}/pacientes`),
        {
          [newUserId]: true,
        }
      );
    }

    // Cerrar sesión secundaria
    await signOut(secondaryAuth);

    router.push({
      path: "/patients",
      query: {
        message: `¡Usuario ${name.value} ${lastName.value} creado con éxito!`,
      },
    });

    // Limpiar campos
    name.value = "";
    lastName.value = "";
    email.value = "";
    password.value = "";
  } catch (err) {
    console.error("Error registrando usuario:", err);
    error.value = err.message;
  }
};

const goBack = () => router.push({ name: "PatientList" });
</script>
