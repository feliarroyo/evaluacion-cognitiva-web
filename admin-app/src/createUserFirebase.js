import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCwtCbMFWS0_sp6T1PA0IrOFjf9jsg1qU0",
  authDomain: "sde-6cdc0.firebaseapp.com",
  projectId: "sde-6cdc0",
  storageBucket: "sde-6cdc0.firebasestorage.app",
  messagingSenderId: "177303648317",
  appId: "1:177303648317:web:58fa62e3eeee0c3fc35254",
  measurementId: "G-6YRY1F372B"
};

const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
const secondaryAuth = getAuth(secondaryApp);

export { secondaryAuth };