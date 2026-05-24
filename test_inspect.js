import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config({ path: "/Users/bunyasit/dev/atlas/.env" });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "atlas-84bc7.firebaseapp.com",
  projectId: "atlas-84bc7",
  storageBucket: "atlas-84bc7.firebasestorage.app",
  messagingSenderId: "257271521688",
  appId: "1:257271521688:web:c661460d40706242864bed",
  measurementId: "G-XMREWEXQCV"
};

async function run() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  const id = "session-plus07kgfln";
  const docRef = doc(db, "sessions", id);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    console.log("Steps:");
    console.log(JSON.stringify(data.activeProject?.steps, null, 2));
  } else {
    console.log("No session found with id session-plus07kgfln");
  }
}

run().catch(console.error);
