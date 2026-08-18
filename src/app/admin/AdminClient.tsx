'use client';

import { useState } from 'react';
import {
  AlertTriangle, ChevronDown, ChevronUp, ExternalLink, Loader2, LogOut, Mail, RotateCcw,
  ShieldCheck, Sparkles, Trophy, X,
} from 'lucide-react';
import { sendAdminPasswordReset, signInAdmin, signOutAdmin } from '@/lib/firebase';
import { approveStartup, rejectStartup, saveTechzimChoice } from '@/lib/firestore';
import { useAdminAuth, useAllStartupsForAdmin, useStartups, useTechzimChoice } from '@/lib/hooks';
import type { Startup, TechzimChoicePick } from '@/lib/types';
import Logo from '@/components/ui/Logo';
import { ErrorState } from '@/components/ui/DataState';
import styles from './admin.module.css';

export default function AdminClient() {
  const { user, isAdmin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className={styles.shell}>
        <div className={`wrap ${styles.page}`}>
          <div className={`skel ${styles.skelBlock}`} />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // Almost everyone here is the anonymous session every visitor gets —
    // that's not "signed in with the wrong account", it's "hasn't tried to
    // sign in at all", so it gets the login form, not a rejection notice.
    const realAccount = user && !user.isAnonymous;
    return (
      <div className={styles.shell}>
        <div className={`wrap ${styles.gateWrap}`}>
          {realAccount ? <NotAuthorized email={user.email} /> : <LoginForm />}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={`wrap ${styles.page}`}>
        <AdminHeader email={user?.email ?? null} />
        <div className={styles.stack}>
          <ChoiceEditor />
          <Queue />
        </div>
      </div>
    </div>
  );
}

function AdminHeader({ email }: { email: string | null }) {
  return (
    <header className={styles.shellHeader}>
      <div>
        <span className={styles.shellEyebrow}>Techzim Startups</span>
        <h1 className={styles.shellTitle}>Admin</h1>
      </div>
      <div className={styles.shellRight}>
        {email && (
          <span className={styles.shellUser}>
            <Mail size={13} aria-hidden="true" />
            {email}
          </span>
        )}
        <button type="button" className={styles.signOut} onClick={() => void signOutAdmin()}>
          <LogOut size={14} aria-hidden="true" />
          Sign out
        </button>
      </div>
    </header>
  );
}

function ChoiceEditor() {
  const { data: startups } = useStartups();
  const { data: picks, loading } = useTechzimChoice();
  const [draft, setDraft] = useState<TechzimChoicePick[] | null>(null);
  const [addId, setAddId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Falls back to the live doc until the admin makes their first edit, at
  // which point `draft` is non-null and wins — otherwise every snapshot
  // update would clobber whatever they're mid-way through editing.
  const current = draft ?? picks;
  const startupById = new Map(startups.map(s => [s.id, s]));
  const available = startups.filter(s => !current.some(p => p.startupId === s.id));

  function change(next: TechzimChoicePick[]) {
    setDraft(next);
    setSaved(false);
  }

  function addPick() {
    if (!addId || current.length >= 5) return;
    change([...current, { startupId: addId, note: '' }]);
    setAddId('');
  }

  function removePick(id: string) {
    change(current.filter(p => p.startupId !== id));
  }

  function updateNote(id: string, note: string) {
    change(current.map(p => (p.startupId === id ? { ...p, note } : p)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    change(next);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await saveTechzimChoice(current);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon} data-tone="brand">
          <Trophy size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.cardTitle}>Techzim&apos;s Choice</h2>
          <p className={styles.cardSubtitle}>
            Up to 5, in order — this is what visitors see instead of a leaderboard. An empty note
            is fine; add one when there&apos;s something worth saying about the pick.
          </p>
        </div>
      </div>

      {current.length > 0 && (
        <ul className={styles.choiceList}>
          {current.map((p, i) => {
            const s = startupById.get(p.startupId);
            return (
              <li key={p.startupId} className={styles.choiceRow}>
                <div className={styles.choiceMove}>
                  <button
                    type="button"
                    className={styles.choiceMoveBtn}
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} aria-hidden="true" />
                  </button>
                  <span className={styles.choiceRank}>{i + 1}</span>
                  <button
                    type="button"
                    className={styles.choiceMoveBtn}
                    onClick={() => move(i, 1)}
                    disabled={i === current.length - 1}
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                </div>

                <div className={styles.choiceBody}>
                  <span className={styles.choiceName}>{s?.name ?? `(missing: ${p.startupId})`}</span>
                  <input
                    className={styles.choiceNote}
                    placeholder="Why it's picked (optional)"
                    maxLength={280}
                    value={p.note}
                    onChange={e => updateNote(p.startupId, e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className={styles.choiceRemove}
                  onClick={() => removePick(p.startupId)}
                  aria-label={`Remove ${s?.name ?? 'this pick'}`}
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {current.length < 5 && (
        <div className={styles.choiceAdd}>
          <select
            className={styles.choiceSelect}
            value={addId}
            onChange={e => setAddId(e.target.value)}
            aria-label="Add a product to Techzim's Choice"
          >
            <option value="">Add a product…</option>
            {available.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button type="button" className={styles.choiceAddBtn} onClick={addPick} disabled={!addId}>
            Add
          </button>
        </div>
      )}

      <div className={styles.choiceActions}>
        <button type="button" className={styles.submitBtn} onClick={save} disabled={saving || loading}>
          {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
          {saving ? 'Saving…' : loading ? 'Loading current picks…' : 'Save picks'}
        </button>
        {saved && (
          <span className={styles.choiceSaved}>
            <Sparkles size={13} aria-hidden="true" />
            Saved
          </span>
        )}
      </div>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

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

  async function forgotPassword() {
    if (busy || !email.trim()) {
      setError('Enter your email above first, then click this again.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await sendAdminPasswordReset(email.trim());
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that email.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.gate}>
      <span className={styles.gateBadge} data-tone="brand">
        <ShieldCheck size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className={styles.gateTitle}>Admin sign-in</h1>
      <p className={styles.gateLede}>Techzim Startups moderation &amp; Techzim&apos;s Choice</p>

      <form className={styles.loginForm} onSubmit={submit}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            type="email"
            className={styles.input}
            placeholder="you@techzim.co.zw"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Password</span>
          <input
            type="password"
            className={styles.input}
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy && <Loader2 size={15} className={styles.spin} aria-hidden="true" />}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        {resetSent ? (
          <p className={styles.gateNotice}>
            Check <strong>{email.trim()}</strong> for a link to set your password.
          </p>
        ) : (
          <button type="button" className={styles.forgotLink} onClick={forgotPassword} disabled={busy}>
            Forgot your password, or signing in for the first time?
          </button>
        )}

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
      <span className={styles.gateBadge} data-tone="warn">
        <AlertTriangle size={22} strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className={styles.gateTitle}>Not authorised</h1>
      <p className={styles.gateText}>
        <strong>{email ?? 'This account'}</strong> doesn&apos;t have access to the admin panel.
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
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon} data-tone="neutral">
          <ShieldCheck size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.cardTitle}>Moderation</h2>
          <p className={styles.cardSubtitle}>
            Every startup, newest submission first. Rejecting one pulls it out of the feed
            immediately (and off Techzim&apos;s Choice, if it&apos;s currently picked) — its own page
            still loads, marked as removed.
          </p>
        </div>
      </div>

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
    </section>
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
