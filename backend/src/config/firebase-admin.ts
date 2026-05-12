import * as admin from 'firebase-admin';
import logger from '../utils/logger';

let initialized = false;

export function getFirebaseAdmin(): admin.app.App | null {
  if (initialized) {
    return admin.apps?.[0] ?? null;
  }

  try {
    if (!admin.apps?.length) {
      // Prefer individual env vars (works on Fly.io / Docker)
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        admin.initializeApp({
          credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
        });
        logger.info('Firebase Admin SDK initialized from env vars');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        // Fallback: service account JSON file path (GCP / local dev)
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
        logger.info('Firebase Admin SDK initialized from application default');
      } else {
        logger.warn('Firebase Admin SDK not configured — social login disabled');
        initialized = true;
        return null;
      }
    }
    initialized = true;
    return admin.apps[0];
  } catch (error) {
    logger.warn('Firebase Admin SDK not initialized — social login disabled', { error });
    initialized = true;
    return null;
  }
}

export async function verifyFirebaseToken(
  idToken: string,
): Promise<admin.auth.DecodedIdToken | null> {
  const app = getFirebaseAdmin();
  if (!app) return null;

  try {
    const decoded = await admin.auth(app).verifyIdToken(idToken);
    return decoded;
  } catch (error) {
    logger.warn('Firebase ID token verification failed', { error });
    return null;
  }
}

export function isFirebaseAdminConfigured(): boolean {
  return admin.apps != null && admin.apps.length > 0;
}
