// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace with your own Firebase project configuration from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyBdt11AzxV8vTrkAN5il5XYl_OI-N6EOeU",
  authDomain: "stockkasir-9b9b2.firebaseapp.com",
  projectId: "stockkasir-9b9b2",
  storageBucket: "stockkasir-9b9b2.appspot.com",
  messagingSenderId: "603864622282",
  appId: "1:603864622282:web:489b980c87adc810294033"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
