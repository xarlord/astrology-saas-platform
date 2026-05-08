import * as admin from 'firebase-admin';
import logger from '../utils/logger';

let initialized = false;

export function getFirebaseAdmin(): admin.app.App | null {
  if (initialized) {
    return admin.apps?.[0] ?? null;
  }

  try {
    if (!admin.apps?.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
    initialized = true;
    logger.info('Firebase Admin SDK initialized');
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
