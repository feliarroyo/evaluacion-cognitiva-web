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
                    Volver a lista de pacientes
                </button>
                <button type="button" class="btn btn-secondary" @click="createLocales">
                    Reset current admin
                </button>
                <button type="submit" class="btn btn-primary">
                    Registrar paciente
                </button>
            </div>
        </form>

        <p v-if="message" class="mt-4 text-green-600 font-semibold">{{ message }}</p>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { auth, db, collection, query, where, getDocs, doc, setDoc, updateDoc, arrayUnion, getDoc } from "@/firebase";
import { useRouter } from "vue-router";

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
        timeMem: "45",
        timeSearch: "60"
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
        timeMem: "15",
        timeSearch: "25"
    }
};


const registerUser = async () => {
    message.value = "";
    error.value = "";

    try {
        // Crear usuario con secondaryAuth
        const userCred = await createUserWithEmailAndPassword(
            secondaryAuth,
            email.value,
            password.value
        );
        console.log("Usuario creado:", userCred.user.uid);

        // Agregar paciente a Firestore
        await setDoc(doc(db, "pacientes", email.value), {
            name: name.value,
            lastName: lastName.value,
            levelsConfig: levelsConfigDefault
        });

        // Agregar email a la lista de pacientes del especialista actual
        const specialistQuery = query(
            collection(db, "especialista"),
            where("mail", "==", auth.currentUser.email)
        );
        const snapshot = await getDocs(specialistQuery);

        if (!snapshot.empty) {
            const specialistRef = snapshot.docs[0].ref;
            await updateDoc(specialistRef, {
                patients: arrayUnion(email.value)
            });
        } else {
            console.warn("Especialista no encontrado.");
        }

        // Cerrar sesión secundaria
        await signOut(secondaryAuth);

        // Mensaje de éxito y navegación
        router.push({
            path: "/patients",
            query: {
                message: `¡Usuario ${name.value} ${lastName.value} creado con éxito!`
            }
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

const goBack = () => router.push({ name: 'PatientList' });
</script>