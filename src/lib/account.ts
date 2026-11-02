import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  linkWithPopup,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
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
    case 'auth/popup-blocked':
      return 'Your browser blocked the Google window. Allow pop-ups for this site and try again.';
    case 'auth/account-exists-with-different-credential':
      return 'That email already signs in with a password. Use email and password instead.';
    case 'auth/unauthorized-domain':
      return 'Google sign-in is not set up for this address yet. Tell the Techzim team.';
    case 'auth/operation-not-allowed':
      return 'This sign-in option is not switched on for this site yet. Tell the Techzim team.';
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

/** True for errors that just mean the person closed the Google window. */
export function isCancelled(err: unknown): boolean {
  const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
  return code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request';
}

/**
 * Sign up or sign in with Google. An anonymous session is upgraded in place so
 * the uid is kept; if that Google account already belongs to a member, we sign
 * in to it instead. The popup opens straight from the click (no await first),
 * so browsers don't block it.
 */
export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const current = auth.currentUser;

  if (current?.isAnonymous) {
    try {
      const result = await linkWithPopup(current, provider);
      await result.user.getIdToken(true);
      window.dispatchEvent(new Event(ACCOUNT_EVENT));
      return result.user;
    } catch (err) {
      const code = typeof err === 'object' && err && 'code' in err ? String((err as { code: unknown }).code) : '';
      if (code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use') {
        const credential = GoogleAuthProvider.credentialFromError(err as Parameters<typeof GoogleAuthProvider.credentialFromError>[0]);
        if (credential) return (await signInWithCredential(auth, credential)).user;
      }
      throw err;
    }
  }
  return (await signInWithPopup(auth, provider)).user;
}
