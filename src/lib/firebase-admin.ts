
import 'server-only';
import admin from 'firebase-admin';

// Ensure the necessary environment variables are set.
if (
  !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
) {
  throw new Error(
    'Firebase server-side configuration is missing. Make sure NEXT_PUBLIC_FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT_BASE64 are set in your environment.'
  );
}

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
let serviceAccount: admin.ServiceAccount;

try {
  const serviceAccountJson = Buffer.from(
    serviceAccountBase64,
    'base64'
  ).toString('utf-8');
  serviceAccount = JSON.parse(serviceAccountJson);
} catch (error) {
  console.error('Error parsing Firebase service account JSON:', error);
  throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64. Make sure it is a valid Base64 encoded JSON object.');
}


if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

const auth = admin.auth();
const db = admin.firestore();

export { auth, db };
