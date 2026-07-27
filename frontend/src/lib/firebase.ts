import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

// Read configuration from environment variables with production fallbacks
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCtnoD9QFk1yzhOmFc-KCMAWOKddr8S0KA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "agentic-rag-assistant-11e0b.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "agentic-rag-assistant-11e0b",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "agentic-rag-assistant-11e0b.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "122405499317",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:122405499317:web:649fa53ee2c1afae6429fc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ETVFKXFP8E",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics initialization (Browser-only check)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported && firebaseConfig.measurementId) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics notice:", err);
    });
}

export { app, auth, db, storage, analytics };
