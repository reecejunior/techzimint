'use client';

import { useId, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import {
  authErrorText,
  MIN_PASSWORD,
  sendMemberPasswordReset,
  signInMember,
  signUpMember,
} from '@/lib/account';
import styles from './MemberAuth.module.css';

type Mode = 'signup' | 'signin' | 'reset';

const COPY: Record<Mode, { title: string; button: string }> = {
  signup: { title: 'Create a free account', button: 'Sign up' },
  signin: { title: 'Sign in', button: 'Sign in' },
  reset: { title: 'Reset your password', button: 'Email me a reset link' },
};

/**
 * Email sign-up for the rules directory. Signing up upgrades the visitor's
 * existing anonymous session, so nothing they have already done is lost. The
 * account state shows up everywhere through useMember(); `onDone` is only for
 * callers that want to close a panel.
 */
export default function MemberAuth({
  reason, onDone,
}: { reason: string; onDone?: () => void }) {
  const [mode, setMode] = useState<Mode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const emailId = useId();
  const passId = useId();

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
    setBusy(true);
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
      setBusy(false);
    }
  }

  function go(next: Mode) {
    setMode(next);
    setError('');
    setSent(false);
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <h3 className={styles.title}>{COPY[mode].title}</h3>
      <p className={styles.reason}>{reason}</p>

      {sent ? (
        <p className={styles.ok} role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> If that email has an account, a reset link
          is on its way.
        </p>
      ) : (
        <>
          <label className={styles.label} htmlFor={emailId}>Email</label>
          <input
            id={emailId}
            className={styles.input}
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            maxLength={254}
            required
          />
          {mode !== 'reset' && (
            <>
              <label className={styles.label} htmlFor={passId}>Password</label>
              <input
                id={passId}
                className={styles.input}
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={MIN_PASSWORD}
                maxLength={128}
                required
              />
            </>
          )}
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.submit} disabled={busy}>
            {busy && <Loader2 size={15} className={styles.spin} aria-hidden="true" />}
            {COPY[mode].button}
          </button>
        </>
      )}

      <p className={styles.switch}>
        {mode === 'signup' && (
          <>Already have an account? <button type="button" onClick={() => go('signin')}>Sign in</button></>
        )}
        {mode === 'signin' && (
          <>
            New here? <button type="button" onClick={() => go('signup')}>Create an account</button>
            {' · '}
            <button type="button" onClick={() => go('reset')}>Forgot password</button>
          </>
        )}
        {mode === 'reset' && <button type="button" onClick={() => go('signin')}>Back to sign in</button>}
      </p>
    </form>
  );
}
