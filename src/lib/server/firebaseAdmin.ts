import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * The service account key grants full read/write, bypassing every rule in
 * firestore.rules. This module exists so that power stays reachable only from
 * server-only code (Route Handlers) — the `server-only` import above turns an
 * accidental client-component import into a build error, not a leaked secret.
 */
function loadServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Generate one in the Firebase console: ' +
        'Project settings → Service accounts → Generate new private key.',
    );
  }
  // Vercel env vars are single-line — base64 avoids hand-escaping the key's
  // embedded newlines. A raw JSON value (local dev, pasted directly) still
  // works since it's tried first.
  const json = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(json);
}

function getAdminApp(): App {
  const existing = getApps();
  if (existing.length) return existing[0];
  return initializeApp({ credential: cert(loadServiceAccount()) });
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
