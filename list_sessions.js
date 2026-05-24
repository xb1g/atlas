import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
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
  
  const colRef = collection(db, "sessions");
  const snap = await getDocs(colRef);
  console.log(`Found ${snap.size} sessions:`);
  snap.forEach((doc) => {
    const data = doc.data();
    console.log(`- Session ID: ${doc.id}`);
    if (data.activeProject) {
      console.log(`  Active Project: ${data.activeProject.id}`);
      const stepsWithTutorMsgs = data.activeProject.steps?.filter(s => s.tutorMessages && s.tutorMessages.length > 0) || [];
      console.log(`  Steps with tutor messages: ${stepsWithTutorMsgs.map(s => `${s.title} (${s.tutorMessages.length} messages)`).join(", ") || "None"}`);
    } else {
      console.log("  No active project");
    }
  });
}

run().catch(console.error);
