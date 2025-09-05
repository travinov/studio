import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;

function getFirebaseApp() {
    if (!app) {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
    }
    return app;
}

function getFirebaseAuth() {
    if (!auth) {
        auth = getAuth(getFirebaseApp());
    }
    return auth;
}

// Proxies to delay initialization
const appProxy = new Proxy({} as FirebaseApp, {
    get: (_, prop) => Reflect.get(getFirebaseApp(), prop),
});

const authProxy = new Proxy({} as Auth, {
    get: (_, prop) => Reflect.get(getFirebaseAuth(), prop),
});


export { appProxy as app, authProxy as auth };
