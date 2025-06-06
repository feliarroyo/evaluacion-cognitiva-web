<template>
    <div class="center-screen card main-card">
      <h2>Iniciar sesión</h2>
      <div>
        <p v-if="error" class="center-element justify-center card bg-red-200">{{ error }}</p>
      </div>
      <form @submit.prevent="login">
        <div class="login-input pt-4">
          <label>Correo</label>
          <input type="email" v-model="email" required />
        </div>

        <div class="login-input">
          <label>Contraseña</label>
          <input type="password" v-model="password" placeholder="••••••" required />
        </div>
        <div class="center-element">
          <button type="submit" class="btn btn-primary">
            Iniciar sesión
          </button>
        </div>
      </form>
    </div>
</template>

<script setup>
import { auth, signInWithEmailAndPassword, signOut, db, collection, query, where, getDocs } from "@/firebase";
import { useRouter } from "vue-router";
import { ref } from "vue";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");

const login = async () => {
  try {
    // Attempt to sign in
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const userEmail = userCredential.user.email;

    // Check if the user mail is from an admin/"specialist" account
    const especialistasRef = collection(db, "especialista");
    const q = query(especialistasRef, where("mail", "==", userEmail));
    const querySnapshot = await getDocs(q);
    
    // Empty snapshot = not in specialist collection
    if (querySnapshot.empty) {
      // Sign out
      await signOut(auth);
      error.value = "El usuario ingresado no está registrado como especialista.";
      return;
    }

    // Go to the specialist's patient list if successful.
    router.push({ name: 'PatientList' });

  } catch (err) {
    // Show on app when an incorrect value is sent
    error.value = "Correo o contraseña incorrectos";
  }
};
</script>