// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCwtCbMFWS0_sp6T1PA0IrOFjf9jsg1qU0",
  authDomain: "sde-6cdc0.firebaseapp.com",
  databaseURL: "https://sde-6cdc0-default-rtdb.firebaseio.com",
  projectId: "sde-6cdc0",
  storageBucket: "sde-6cdc0.firebasestorage.app",
  messagingSenderId: "177303648317",
  appId: "1:177303648317:web:58fa62e3eeee0c3fc35254",
  measurementId: "G-6YRY1F372B",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const rtdb = getDatabase();

export {
  app,
  auth,
  rtdb,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
};
