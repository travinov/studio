
import 'server-only';
import admin from 'firebase-admin';

let app: admin.app.App;

function initializeAdminApp() {
  if (admin.apps.length > 0) {
    app = admin.app();
    return;
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!serviceAccountBase64) {
    console.error(
      'Firebase Admin SDK Error: FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in .env file.'
    );
    throw new Error(
      'Server configuration error. Firebase Admin SDK service account is missing.'
    );
  }

  try {
    const serviceAccountJson = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } catch (error: any) {
    console.error(
      'Firebase Admin SDK Error: Failed to parse or initialize service account. Please ensure FIREBASE_SERVICE_ACCOUNT_BASE64 is a valid Base64 encoded JSON.',
      error.message
    );
    throw new Error(
      'Server configuration error. Firebase Admin SDK failed to initialize.'
    );
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
  },
});
