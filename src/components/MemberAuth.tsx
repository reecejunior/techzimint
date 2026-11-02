'use client';

import { useId, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  authErrorText,
  isCancelled,
  MIN_PASSWORD,
  sendMemberPasswordReset,
  signInMember,
  signInWithGoogle,
  signUpMember,
} from '@/lib/account';
import styles from './MemberAuth.module.css';

type Mode = 'signup' | 'signin' | 'reset';

const COPY: Record<Mode, { title: string; button: string }> = {
  signup: { title: 'Create your free account', button: 'Create account' },
  signin: { title: 'Welcome back', button: 'Sign in' },
  reset: { title: 'Reset your password', button: 'Send reset link' },
};

/**
 * Sign up or sign in, with Google or with email. Signing up upgrades the
 * visitor's anonymous session, so nothing they have already done is lost.
 * Account state reaches the rest of the page through useMember(); `onDone` is
 * only for callers that want to close a panel.
 */
export default function MemberAuth({
  reason, onDone,
}: { reason?: string; onDone?: () => void }) {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState<'email' | 'google' | null>(null);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const emailId = useId();
  const passId = useId();

  async function google() {
    if (busy) return;
    setError('');
    setBusy('google');
    try {
      await signInWithGoogle();
      onDone?.();
    } catch (err) {
      if (!isCancelled(err)) setError(authErrorText(err));
    } finally {
      setBusy(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setError('');
    if (!email.trim()) {
      setError('Enter your email address.');
      return;
    }
    if (mode !== 'reset' && password.length < MIN_PASSWORD) {
      setError(`Use a password of at least ${MIN_PASSWORD} characters.`);
      return;
    }
    setBusy('email');
    try {
      if (mode === 'signup') await signUpMember(email, password);
      else if (mode === 'signin') await signInMember(email, password);
      else {
        await sendMemberPasswordReset(email);
        setSent(true);
        return;
      }
      onDone?.();
    } catch (err) {
      setError(authErrorText(err));
    } finally {
      setBusy(null);
    }
  }

  function go(next: Mode) {
    setMode(next);
    setError('');
    setSent(false);
  }

  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <h3 className={styles.title}>{COPY[mode].title}</h3>
        {reason && mode === 'signup' && <p className={styles.reason}>{reason}</p>}
      </div>

      {mode !== 'reset' && (
        <>
          <button type="button" className={styles.google} onClick={google} disabled={busy !== null}>
            {busy === 'google' && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
            Continue with Google
          </button>
          <p className={styles.or}><span>or with email</span></p>
        </>
      )}

      {sent ? (
        <p className={styles.ok} role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> If that email has an account, a reset link
          is on its way. Check your inbox.
        </p>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <label className={styles.field} htmlFor={emailId}>
            <span>Email</span>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              maxLength={254}
              required
            />
          </label>
          {mode !== 'reset' && (
            <label className={styles.field} htmlFor={passId}>
              <span>
                Password
                {mode === 'signin' && (
                  <button type="button" className={styles.forgot} onClick={() => go('reset')}>
                    Forgot?
                  </button>
                )}
              </span>
              <span className={styles.passWrap}>
                <input
                  id={passId}
                  type={show ? 'text' : 'password'}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'signup' ? `At least ${MIN_PASSWORD} characters` : ''}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  minLength={MIN_PASSWORD}
                  maxLength={128}
                  required
                />
                <button
                  type="button"
                  className={styles.eye}
                  onClick={() => setShow(s => !s)}
                  aria-label={show ? 'Hide password' : 'Show password'}
                >
                  {show ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </span>
            </label>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit} disabled={busy !== null}>
            {busy === 'email' && <Loader2 size={16} className={styles.spin} aria-hidden="true" />}
            {COPY[mode].button}
          </button>
        </form>
      )}

      <p className={styles.switch}>
        {mode === 'signup' && (
          <>Already have an account? <button type="button" onClick={() => go('signin')}>Sign in</button></>
        )}
        {mode === 'signin' && (
          <>New here? <button type="button" onClick={() => go('signup')}>Create an account</button></>
        )}
        {mode === 'reset' && <button type="button" onClick={() => go('signin')}>Back to sign in</button>}
      </p>
    </div>
  );
}
