// firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAuth, getReactNativePersistence } from "firebase/auth/react-native";



const firebaseConfig = {
    apiKey: "AIzaSyCwDlN6bQgu9ayrCyN4_U6ylDvMjh17Rdc",
    authDomain: "momentum0821.firebaseapp.com",
    projectId: "momentum0821",
    storageBucket: "momentum0821.firebasestorage.app",
    messagingSenderId: "443859253397",
    appId: "1:443859253397:web:a16ae5de21280e7e92039c",
    measurementId: "G-5CEW5L0TSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Auth & Firestore exports
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });

export { auth, app, db };