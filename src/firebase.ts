import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!firebaseApiKey || firebaseApiKey === "MY_FIREBASE_API_KEY") {
  throw new Error("Missing VITE_FIREBASE_API_KEY environment variable.");
}

const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: "atlas-84bc7.firebaseapp.com",
  projectId: "atlas-84bc7",
  storageBucket: "atlas-84bc7.firebasestorage.app",
  messagingSenderId: "257271521688",
  appId: "1:257271521688:web:c661460d40706242864bed",
  measurementId: "G-XMREWEXQCV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore
export const db = getFirestore(app);

console.log("Firebase client initialized successfully with project ID:", firebaseConfig.projectId);
