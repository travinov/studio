import "server-only";
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is not set.");
  }

  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const auth = admin.auth();
export const db = admin.firestore();
