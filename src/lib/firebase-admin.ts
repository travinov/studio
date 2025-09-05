
import 'server-only';
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // When deployed to App Hosting, initializeApp() without arguments will
    // automatically discover the correct credentials.
    admin.initializeApp();
  } catch (error: any) {
    // If initialization fails, it's likely because the credentials are not
    // available in the environment. This can happen in local development.
    // In that case, we fall back to using the service account keys from .env.
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };

      if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        throw new Error('Firebase service account credentials are not set in the environment.');
      }
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (e: any) {
       console.error('Firebase admin initialization error', e.stack);
    }
  }
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
