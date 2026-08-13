'use client';

import { useState } from 'react';
import { AlertTriangle, ExternalLink, Loader2, LogOut, RotateCcw, ShieldCheck } from 'lucide-react';
import { signInAdmin, signOutAdmin } from '@/lib/firebase';
import { approveStartup, rejectStartup } from '@/lib/firestore';
import { useAdminAuth, useAllStartupsForAdmin } from '@/lib/hooks';
import type { Startup } from '@/lib/types';
import Logo from '@/components/ui/Logo';
import { ErrorState } from '@/components/ui/DataState';
import styles from './admin.module.css';

export default function AdminClient() {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className={`wrap ${styles.page}`}>
        <div className={`skel ${styles.skelBlock}`} />
      </div>
    );
  }

  if (!isAdmin) {
    // Almost everyone here is the anonymous session every visitor gets —
    // that's not "signed in with the wrong account", it's "hasn't tried to
    // sign in at all", so it gets the login form, not a rejection notice.
    const realAccount = user && !user.isAnonymous;
    return (
      <div className={`wrap ${styles.page}`}>
        {realAccount ? <NotAuthorized email={user.email} /> : <LoginForm />}
      </div>
    );
  }

  return (
    <div className={`wrap ${styles.page}`}>
      <Queue />
    </div>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInAdmin(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.gate}>
      <ShieldCheck size={28} className={styles.gateIcon} strokeWidth={1.5} aria-hidden="true" />
      <h1 className={styles.gateTitle}>Admin sign-in</h1>
      <form className={styles.loginForm} onSubmit={submit}>
        <input
          type="email"
          className={styles.input}
          placeholder="Email"
          autoComplete="username"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className={styles.input}
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy && <Loader2 size={15} className={styles.spin} aria-hidden="true" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

function NotAuthorized({ email }: { email: string | null }) {
  return (
    <div className={styles.gate}>
      <AlertTriangle size={28} className={styles.gateIconWarn} strokeWidth={1.5} aria-hidden="true" />
      <h1 className={styles.gateTitle}>Not authorised</h1>
      <p className={styles.gateText}>
        {email ?? 'This account'} doesn&apos;t have access to the admin panel.
      </p>
      <button type="button" className={styles.submitBtn} onClick={() => void signOutAdmin()}>
        <LogOut size={14} aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

function Queue() {
  const { data: startups, loading, error } = useAllStartupsForAdmin();

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Moderation</h1>
          <p className={styles.subtitle}>
            Every startup, newest submission first. Rejecting one pulls it out of the feed and
            leaderboard immediately — its own page still loads, marked as removed.
          </p>
        </div>
        <button type="button" className={styles.signOut} onClick={() => void signOutAdmin()}>
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </header>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`skel ${styles.skelRow}`} />
          ))}
        </div>
      ) : startups.length === 0 ? (
        <p className={styles.empty}>Nothing submitted yet.</p>
      ) : (
        <ul className={styles.list}>
          {startups.map(s => (
            <Row key={s.id} startup={s} />
          ))}
        </ul>
      )}
    </>
  );
}

function Row({ startup }: { startup: Startup }) {
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reject() {
    setBusy(true);
    setError(null);
    try {
      await rejectStartup(startup.id, reason);
      setReasonOpen(false);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reject that.');
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    setError(null);
    try {
      await approveStartup(startup.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not restore that.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className={styles.row}>
      <Logo name={startup.name} url={startup.logoUrl} initials={startup.logoInitials} size="md" />

      <div className={styles.rowBody}>
        <div className={styles.rowHead}>
          <span className={styles.rowName}>{startup.name}</span>
          <span className={styles.status} data-status={startup.status}>
            {startup.status}
          </span>
        </div>
        <p className={styles.rowTagline}>{startup.tagline}</p>
        {startup.founders.length > 0 && (
          <p className={styles.rowFounders}>by {startup.founders.join(' & ')}</p>
        )}
        {startup.status === 'rejected' && startup.rejectionReason && (
          <p className={styles.rowReason}>Reason: {startup.rejectionReason}</p>
        )}
        {startup.website && (
          <a href={startup.website} target="_blank" rel="noopener noreferrer" className={styles.rowLink}>
            {startup.website.replace(/^https?:\/\//, '')}
            <ExternalLink size={11} aria-hidden="true" />
          </a>
        )}

        {reasonOpen && (
          <div className={styles.reasonBox}>
            <input
              className={styles.reasonInput}
              placeholder="Reason (optional, shown only to you)"
              maxLength={500}
              value={reason}
              onChange={e => setReason(e.target.value)}
              autoFocus
            />
            <div className={styles.reasonActions}>
              <button type="button" className={styles.reasonCancel} onClick={() => setReasonOpen(false)}>
                Cancel
              </button>
              <button type="button" className={styles.reasonConfirm} onClick={reject} disabled={busy}>
                {busy && <Loader2 size={13} className={styles.spin} aria-hidden="true" />}
                Confirm reject
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </div>

      <div className={styles.rowActions}>
        {startup.status === 'rejected' ? (
          <button type="button" className={styles.restoreBtn} onClick={restore} disabled={busy}>
            {busy ? <Loader2 size={13} className={styles.spin} aria-hidden="true" /> : <RotateCcw size={13} aria-hidden="true" />}
            Restore
          </button>
        ) : (
          !reasonOpen && (
            <button type="button" className={styles.rejectBtn} onClick={() => setReasonOpen(true)} disabled={busy}>
              Reject
            </button>
          )
        )}
      </div>
    </li>
  );
}
