import {
  EmailAuthProvider,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { ensureSignedIn, getFirebaseAuth } from './firebase';

/**
 * Everyone browses as an anonymous Firebase user. A member is the same user
 * with an email and password attached, so signing up keeps the uid and
 * anything already tied to it. Admins sign in the same way, so they count as
 * members too.
 */
export function isMemberUser(user: User | null): boolean {
  return Boolean(user && !user.isAnonymous && user.email);
}

export const MIN_PASSWORD = 8;

/** Fired after a sign-up, because Firebase does not announce a link as a sign-in. */
export const ACCOUNT_EVENT = 'techzim-account-changed';

/** Plain-language text for the errors Firebase Auth actually returns here. */
export function authErrorText(err: unknown): string {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  switch (code) {
    case 'auth/email-already-in-use':
    case 'auth/credential-already-in-use':
      return 'That email already has an account. Use "Sign in" instead.';
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/weak-password':
      return `Use a password of at least ${MIN_PASSWORD} characters.`;
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-login-credentials':
      return 'Email or password is wrong.';
    case 'auth/too-many-requests':
      return 'Too many tries. Wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'No connection. Check your internet and try again.';
    case 'auth/operation-not-allowed':
      return 'Email sign-up is not switched on for this site yet. Tell the Techzim team.';
    default:
      return 'Something went wrong. Try again in a moment.';
  }
}

/** Turn the current anonymous session into an email account, keeping its uid. */
export async function signUpMember(email: string, password: string): Promise<User> {
  const user = await ensureSignedIn();
  const credential = EmailAuthProvider.credential(email.trim(), password);
  if (!user.isAnonymous) throw Object.assign(new Error('already member'), { code: 'auth/credential-already-in-use' });
  const result = await linkWithCredential(user, credential);
  // The token in hand still says "anonymous", which the security rules read.
  await result.user.getIdToken(true);
  window.dispatchEvent(new Event(ACCOUNT_EVENT));
  return result.user;
}

export async function signInMember(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  return result.user;
}

export function sendMemberPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(getFirebaseAuth(), email.trim());
}

/** Signs out, then starts a fresh anonymous session so the site keeps working. */
export async function signOutMember(): Promise<void> {
  await signOut(getFirebaseAuth());
  await ensureSignedIn();
}
