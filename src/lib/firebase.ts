import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAuth,
  sendPasswordResetEmail,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';

/**
 * The real accounts on a site where everyone else browses anonymously.
 * Mirrored as a literal list in firestore.rules (rules can't import a JS
 * constant) — change both together if this ever changes.
 */
export const ADMIN_EMAILS = ['chimutashureece@gmail.com', 'limbikani@techzim.co.zw'];

export function isAdminUser(user: User | null): boolean {
  return Boolean(user?.email && ADMIN_EMAILS.includes(user.email));
}

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
 * Swaps the current session (anonymous or not) for the admin's real account.
 * The moderation panel is what actually gates on the result — this alone
 * grants nothing, since firestore.rules is the real enforcement layer.
 */
export function signInAdmin(email: string, password: string): Promise<User> {
  return signInWithEmailAndPassword(getFirebaseAuth(), email, password).then(c => c.user);
}

/**
 * Emails a secure, one-time link that lets the account holder set their own
 * password — for a first-time invite (the account exists with a throwaway
 * password nobody tells them) as much as for a genuine "forgot it" case.
 * Firebase's own page handles the actual reset; nothing here sees the new
 * password.
 */
export function sendAdminPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email);
}

/**
 * Drops the admin session. The next anonymous action re-bootstraps a fresh
 * anonymous identity — any likes/reviews cast under the previous anonymous
 * session are not recovered, since Firebase Auth doesn't keep more than one
 * identity live per client.
 */
export function signOutAdmin(): Promise<void> {
  return signOut(getFirebaseAuth());
}

/**
 * Asks for notification permission and registers this browser for push, if
 * the platform supports it (Safari's support is patchy; this returns null
 * rather than throwing when it's unavailable). Returns the FCM token to
 * save, or null if permission was denied or push isn't supported here.
 */
export async function requestPushToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return null;

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    throw new Error(
      'Push isn’t configured yet — generate a Web Push certificate in the Firebase console ' +
        '(Project settings → Cloud Messaging) and set NEXT_PUBLIC_FIREBASE_VAPID_KEY.',
    );
  }

  const { getMessaging, getToken, isSupported } = await import('firebase/messaging');
  if (!(await isSupported())) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  const messaging = getMessaging(getFirebaseApp());
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
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
