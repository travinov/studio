import "server-only";
import admin from "firebase-admin";

let app: admin.app.App;

function initializeAdminApp() {
  if (!admin.apps.length) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Please add it to your .env file."
      );
    }

    try {
      const serviceAccount = JSON.parse(
        Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
      );
      
      app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

    } catch (error: any) {
        console.error("Failed to parse or initialize Firebase Admin SDK:", error.message);
        throw new Error("Invalid Firebase service account credentials.");
    }
  } else {
    app = admin.app();
  }
}

function getAdminApp() {
  if (!app) {
    initializeAdminApp();
  }
  return app;
}

export const auth = new Proxy({} as admin.auth.Auth, {
  get: (_, prop) => {
    return Reflect.get(getAdminApp().auth(), prop);
  },
});

export const db = new Proxy({} as admin.firestore.Firestore, {
    get: (_, prop) => {
        return Reflect.get(getAdminApp().firestore(), prop);
    }
});
