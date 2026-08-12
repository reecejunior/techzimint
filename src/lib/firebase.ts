import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId,
);

/**
 * Next.js re-executes modules across hot reloads and route segments, so guard
 * against double-initialising the app.
 */
export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env.local and fill in your project values.',
    );
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function getDb(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/**
 * Votes and reviews are attributed to an anonymous account so a person can only
 * vote once per startup without being forced to create a login. Resolves the
 * existing session if there already is one.
 */
export function ensureSignedIn(): Promise<User> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise<User>((resolve, reject) => {
    const stop = auth.onAuthStateChanged(user => {
      if (user) {
        stop();
        resolve(user);
        return;
      }
      signInAnonymously(auth).catch(err => {
        stop();
        reject(err);
      });
    }, reject);
  });
}

/**
 * Analytics only exists in the browser, and only when the environment supports
 * it (it is unavailable in SSR and in some privacy modes). Fire-and-forget.
 */
export async function initAnalytics(): Promise<void> {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return;
  if (!firebaseConfig.measurementId) return;
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    if (await isSupported()) getAnalytics(getFirebaseApp());
  } catch {
    /* Analytics is optional — never let it break the page. */
  }
}
