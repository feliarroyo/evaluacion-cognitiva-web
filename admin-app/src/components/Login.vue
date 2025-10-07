<template>
  <div class="center-screen card main-card">
    <h2>Iniciar sesión</h2>
    <div>
      <p v-if="error" class="center-element justify-center card bg-red-200">
        {{ error }}
      </p>
      <div v-if="info" class="center-element justify-center card bg-green-200">
        {{ info }}
      </div>
    </div>
    <form @submit.prevent="login">
      <div class="login-input pt-4">
        <label>Correo</label>
        <input type="email" v-model="email" required />
      </div>

      <div class="login-input">
        <label>Contraseña</label>
        <input
          type="password"
          v-model="password"
          placeholder="••••••"
          required
        />
      </div>
      <p
        class="text-blue-800 underline cursor-pointer text-sm"
        @click="sendResetEmail"
      >
        Olvidé mis credenciales
      </p>
      <div class="center-element">
        <button type="submit" class="btn btn-primary">Iniciar sesión</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { auth, signInWithEmailAndPassword, signOut } from "@/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { getDatabase, ref as dbRef, get } from "firebase/database";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const info = ref("");

const login = async () => {
  try {
    // Intentar hacer login con Auth
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const userEmail = userCredential.user.email;

    // Obtener DB
    const database = getDatabase();

    // Referencia a especialistas en RTDB
    const especialistasRef = dbRef(database, "especialista");
    const snapshot = await get(especialistasRef);

    if (!snapshot.exists()) {
      await signOut(auth);
      error.value = "No se encontraron especialistas registrados.";
      return;
    }

    const especialistas = snapshot.val();
    const found = Object.values(especialistas).find(
      (e) => e.mail === userEmail
    );

    console.log(found);
    console.log("LOL");

    if (!found) {
      await signOut(auth);
      error.value =
        "El usuario ingresado no está registrado como especialista.";
      return;
    }

    // Login exitoso, redirigir
    router.push({ name: "PatientList" });
  } catch (err) {
    console.error(err);
    error.value = "Correo o contraseña incorrectos";
  }
};

const sendResetEmail = async () => {
  error.value = "";
  info.value = "";

  try {
    const database = getDatabase();
    const especialistasRef = dbRef(database, "especialista");
    const snapshot = await get(especialistasRef);

    if (!snapshot.exists()) {
      error.value = "No se encontró ningún especialista registrado.";
      return;
    }

    const especialistas = snapshot.val();
    const first = Object.values(especialistas)[0];
    const specialistEmail = first.mail;

    await sendPasswordResetEmail(auth, specialistEmail);
    info.value = `Se envió un email a ${maskEmail(
      specialistEmail
    )} con las credenciales.`;
  } catch (err) {
    console.error("Error enviando email:", err);
    error.value = "No se pudo enviar el correo de recuperación.";
  }
};

const maskEmail = (email) => {
  const [name, domain] = email.split("@");
  const maskedName =
    name.length > 2
      ? name[0] + "*".repeat(name.length - 2) + name[name.length - 1]
      : name[0] + "*";
  return `${maskedName}@${domain}`;
};
</script>
