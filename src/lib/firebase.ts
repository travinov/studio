
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCOLIuonV4W0Qd2UhC73oIqV-nO6Xazi5w",
  authDomain: "instacraft-50z1a.firebaseapp.com",
  projectId: "instacraft-50z1a",
  storageBucket: "instacraft-50z1a.firebasestorage.app",
  messagingSenderId: "82655964404",
  appId: "1:82655964404:web:9ca8760f2f7c25b2be82a1"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let isFirebaseConfigured = false;

// Initialize Firebase only if the API key is provided
if (firebaseConfig.apiKey) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  isFirebaseConfigured = true;
} else {
    console.error("Firebase is not configured. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_* variables are set.");
}


export { app, auth, isFirebaseConfigured };
