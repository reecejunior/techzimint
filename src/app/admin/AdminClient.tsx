'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, ExternalLink, Heart, ImageIcon, Lightbulb,
  Loader2, LogOut, Mail, MessageCircle, Pencil, PlaySquare, RotateCcw, Search, ShieldCheck, Trash2, X,
} from 'lucide-react';
import { sendAdminPasswordReset, signInAdmin, signOutAdmin } from '@/lib/firebase';
import {
  approveStartup, deletePost, deleteTrackerComment, deleteTrackerOverride, editPost, rejectStartup,
  reviewTrackerSuggestion, saveTrackerOverride,
} from '@/lib/firestore';
import {
  useAdminAuth, useAllStartupsForAdmin, useStartupPosts, useTrackerCommentsForAdmin,
  useTrackerOverrides, useTrackerSuggestionsForAdmin,
} from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { Post, Startup, TrackerComment, TrackerOverride, TrackerSuggestion } from '@/lib/types';
import { applyTrackerOverride, WINNERS, type Winner } from '@/app/community/hackathon-tracker/data';
import Logo from '@/components/ui/Logo';
import { ErrorState } from '@/components/ui/DataState';
import styles from './admin.module.css';

/** Same ordering as the tracker page's own STATUSES — kept as a separate
 *  local constant rather than importing from the (client) page module, since
 *  admin.module.css styling here is otherwise independent of that page. */
const STATUS_OPTIONS = ['Active', 'Some later activity', 'Unclear', 'Too recent', 'No trace'] as const;

/** winnerId -> display name, for the comments-moderation list (TrackerComment
 *  only stores the id; the suggestions queue denormalises the name instead,
 *  since those are reviewed one at a time rather than browsed in bulk). */
const WINNER_NAME_BY_ID: Record<string, string> = Object.fromEntries(WINNERS.map(w => [w.id, w.name]));

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
        <StatsStrip />
        <TrackerEntryEditor adminEmail={user?.email ?? ''} />
        <TrackerQueue />
        <TrackerCommentsQueue />
        <Queue />
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

function StatsStrip() {
  const { data: startups, loading } = useAllStartupsForAdmin();

  const live = startups.filter(s => s.status === 'approved').length;
  const rejected = startups.filter(s => s.status === 'rejected').length;

  return (
    <div className={styles.stats}>
      <div className={styles.statItem}>
        <span className={styles.statNum}>{loading ? '—' : live}</span>
        <span className={styles.statLabel}>live products</span>
      </div>
      <div className={styles.statItem}>
        <span className={styles.statNum}>{loading ? '—' : rejected}</span>
        <span className={styles.statLabel}>rejected</span>
      </div>
    </div>
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
      <p className={styles.gateLede}>Techzim Startups moderation</p>

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

/*
 * Live corrections to the hackathon tracker's static dataset (see the
 * TrackerOverride doc comment in types.ts). Unlike TrackerQueue below, which
 * reviews what visitors submitted, this is a direct editing tool: pick a row,
 * change its status or details, save — it shows up on the public page right
 * away, no code change or deploy needed. "Revert to original" removes the
 * correction and falls back to the static research entry.
 */
function TrackerEntryEditor({ adminEmail }: { adminEmail: string }) {
  const { data: overrides } = useTrackerOverrides();
  const overrideMap = useMemo(() => new Map(overrides.map(o => [o.winnerId, o] as const)), [overrides]);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? WINNERS.find(w => w.id === selectedId) ?? null : null;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return WINNERS.filter(w => `${w.name} ${w.programme} ${w.people}`.toLowerCase().includes(q)).slice(0, 12);
  }, [query]);

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon} data-tone="neutral">
          <Pencil size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.cardTitle}>Edit tracker entries</h2>
          <p className={styles.cardSubtitle}>
            Correct one row&apos;s status or details directly — it updates the public tracker page right
            away, no code change needed. The original research stays on record underneath; this only
            overlays what&apos;s shown.
          </p>
        </div>
      </div>

      {selected ? (
        <TrackerEntryForm
          key={selected.id}
          winner={selected}
          override={overrideMap.get(selected.id)}
          adminEmail={adminEmail}
          onChangeEntry={() => setSelectedId(null)}
        />
      ) : (
        <>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Find an entry</span>
            <div className={styles.searchBox}>
              <Search size={15} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                className={`${styles.input} ${styles.searchInput}`}
                placeholder="Search by name, programme or founder…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </label>

          {query.trim() &&
            (results.length === 0 ? (
              <p className={styles.empty}>No entries match &ldquo;{query.trim()}&rdquo;.</p>
            ) : (
              <ul className={styles.searchResults}>
                {results.map(w => (
                  <li key={w.id}>
                    <button
                      type="button"
                      className={styles.searchResultBtn}
                      onClick={() => {
                        setSelectedId(w.id);
                        setQuery('');
                      }}
                    >
                      <span>
                        <span className={styles.rowName}>{w.name}</span>
                        <span className={styles.rowFounders}>
                          {' '}
                          · {w.programme} · {w.year}
                        </span>
                      </span>
                      {overrideMap.has(w.id) && <span className={styles.kindBadge}>Edited</span>}
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </>
      )}
    </section>
  );
}

function TrackerEntryForm({
  winner,
  override,
  adminEmail,
  onChangeEntry,
}: {
  winner: Winner;
  override: TrackerOverride | undefined;
  adminEmail: string;
  onChangeEntry: () => void;
}) {
  const effective = useMemo(() => applyTrackerOverride(winner, override), [winner, override]);
  const [name, setName] = useState(effective.name);
  const [people, setPeople] = useState(effective.people);
  const [whatItDoes, setWhatItDoes] = useState(effective.whatItDoes);
  const [prize, setPrize] = useState(effective.prize);
  const [prizeUsd, setPrizeUsd] = useState(effective.prizeUsd != null ? String(effective.prizeUsd) : '');
  const [status, setStatus] = useState<Winner['status']>(effective.status);
  const [alreadyOperating, setAlreadyOperating] = useState<Winner['alreadyOperating']>(effective.alreadyOperating);
  const [evidence, setEvidence] = useState(effective.evidence);
  const [source, setSource] = useState(effective.source);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const hasOverride = Boolean(override);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      let usd: number | undefined;
      if (prizeUsd.trim()) {
        usd = Number(prizeUsd);
        if (!Number.isFinite(usd) || usd < 0) throw new Error('Prize in US$ must be a positive number, or left blank.');
      }
      await saveTrackerOverride(
        winner.id,
        {
          name: name.trim(),
          people: people.trim(),
          whatItDoes: whatItDoes.trim(),
          prize: prize.trim(),
          prizeUsd: usd,
          status,
          alreadyOperating,
          evidence: evidence.trim(),
          source: source.trim(),
        },
        adminEmail,
      );
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  async function revert() {
    if (!window.confirm(`Revert "${winner.name}" to the original research entry? This removes your correction.`)) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTrackerOverride(winner.id);
      onChangeEntry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not revert that.');
      setBusy(false);
    }
  }

  return (
    <form className={styles.editForm} onSubmit={save}>
      <div className={styles.editFormHead}>
        <div>
          <span className={styles.rowName}>{winner.name}</span>
          <span className={styles.rowFounders}>
            {' '}
            · {winner.programme} · {winner.year}
          </span>
          {hasOverride && <span className={styles.kindBadge}>Edited</span>}
        </div>
        <button type="button" className={styles.forgotLink} onClick={onChangeEntry}>
          Choose a different entry
        </button>
      </div>

      <div className={styles.editGrid}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Name</span>
          <input className={styles.input} value={name} onChange={e => setName(e.target.value)} maxLength={200} required />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>People</span>
          <input className={styles.input} value={people} onChange={e => setPeople(e.target.value)} maxLength={300} required />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Status</span>
          <select className={styles.input} value={status} onChange={e => setStatus(e.target.value as Winner['status'])}>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Already operating before the win?</span>
          <select
            className={styles.input}
            value={alreadyOperating}
            onChange={e => setAlreadyOperating(e.target.value as Winner['alreadyOperating'])}
          >
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Prize (as described)</span>
          <input className={styles.input} value={prize} onChange={e => setPrize(e.target.value)} maxLength={300} required />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Prize in US$ (leave blank if not paid in US$)</span>
          <input
            type="number"
            min="0"
            step="1"
            className={styles.input}
            value={prizeUsd}
            onChange={e => setPrizeUsd(e.target.value)}
          />
        </label>
        <label className={`${styles.field} ${styles.editGridWide}`}>
          <span className={styles.fieldLabel}>What it does</span>
          <textarea
            className={styles.input}
            value={whatItDoes}
            onChange={e => setWhatItDoes(e.target.value)}
            rows={2}
            maxLength={400}
            required
          />
        </label>
        <label className={`${styles.field} ${styles.editGridWide}`}>
          <span className={styles.fieldLabel}>What we found (evidence)</span>
          <textarea
            className={styles.input}
            value={evidence}
            onChange={e => setEvidence(e.target.value)}
            rows={3}
            maxLength={800}
            required
          />
        </label>
        <label className={`${styles.field} ${styles.editGridWide}`}>
          <span className={styles.fieldLabel}>Evidence link</span>
          <input type="url" className={styles.input} value={source} onChange={e => setSource(e.target.value)} maxLength={300} />
        </label>
      </div>

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
      {saved && !error && (
        <p className={styles.savedMsg}>
          <CheckCircle2 size={14} aria-hidden="true" />
          Saved — this is now what shows on the tracker page.
        </p>
      )}

      <div className={styles.rowActions}>
        <button type="submit" className={styles.submitBtn} disabled={busy}>
          {busy && <Loader2 size={15} className={styles.spin} aria-hidden="true" />}
          Save correction
        </button>
        {hasOverride && (
          <button type="button" className={styles.rejectBtn} onClick={revert} disabled={busy}>
            <RotateCcw size={13} aria-hidden="true" />
            Revert to original
          </button>
        )}
      </div>
    </form>
  );
}

function TrackerQueue() {
  const { data: suggestions, loading, error } = useTrackerSuggestionsForAdmin();
  // Appeals are a founder disputing their own listing, identified by name and
  // email — worth an editor's attention before an anonymous tip, so they sort
  // first within "pending" rather than just by recency.
  const pending = suggestions
    .filter(s => s.status === 'pending')
    .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'appeal' ? -1 : 1));
  const decided = suggestions.filter(s => s.status !== 'pending');

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon} data-tone="brand">
          <Lightbulb size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.cardTitle}>Hackathon tracker suggestions</h2>
          <p className={styles.cardSubtitle}>
            Corrections and additions submitted from the tracker page. Marking one &ldquo;applied&rdquo;
            is just a note to yourself here — it doesn&apos;t change the tracker&apos;s data by
            itself, so still fold the change into the data file.
          </p>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className={styles.list}>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className={`skel ${styles.skelRow}`} />
          ))}
        </div>
      ) : suggestions.length === 0 ? (
        <p className={styles.empty}>Nothing submitted yet.</p>
      ) : (
        <ul className={styles.list}>
          {pending.map(s => (
            <TrackerRow key={s.id} suggestion={s} />
          ))}
          {decided.map(s => (
            <TrackerRow key={s.id} suggestion={s} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TrackerRow({ suggestion }: { suggestion: TrackerSuggestion }) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<'applied' | 'dismissed' | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(status: 'applied' | 'dismissed', reviewNote: string) {
    setBusy(true);
    setError(null);
    try {
      await reviewTrackerSuggestion(suggestion.id, status, reviewNote);
      setNoteOpen(false);
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setBusy(false);
    }
  }

  const displayStatus = suggestion.status === 'applied' ? 'approved' : suggestion.status === 'dismissed' ? 'rejected' : undefined;

  return (
    <li className={styles.row}>
      <div className={styles.rowGrid}>
        <div className={styles.rowBody}>
          <div className={styles.rowHead}>
            {suggestion.kind === 'appeal' && <span className={styles.kindBadge}>Appeal</span>}
            <span className={styles.rowName}>{suggestion.winnerName || 'General note'}</span>
            <span className={styles.status} data-status={displayStatus}>
              {suggestion.status}
            </span>
          </div>
          <p className={styles.rowTagline}>{suggestion.note}</p>
          {suggestion.submitterName && (
            <p className={styles.rowFounders}>
              from {suggestion.submitterName}
              {suggestion.submitterEmail && (
                <>
                  {' · '}
                  <a href={`mailto:${suggestion.submitterEmail}`} className={styles.rowLink}>
                    {suggestion.submitterEmail}
                  </a>
                </>
              )}
            </p>
          )}
          {suggestion.reviewNote && <p className={styles.rowReason}>Note: {suggestion.reviewNote}</p>}
          {suggestion.evidenceUrl && (
            <a
              href={suggestion.evidenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.rowLink}
            >
              {suggestion.evidenceUrl.replace(/^https?:\/\//, '')}
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          )}

          {noteOpen && pendingStatus && (
            <div className={styles.reasonBox}>
              <input
                className={styles.reasonInput}
                placeholder="Note for yourself (optional)"
                maxLength={500}
                value={note}
                onChange={e => setNote(e.target.value)}
                autoFocus
              />
              <div className={styles.reasonActions}>
                <button type="button" className={styles.reasonCancel} onClick={() => setNoteOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.reasonConfirm}
                  onClick={() => decide(pendingStatus, note)}
                  disabled={busy}
                >
                  {busy && <Loader2 size={13} className={styles.spin} aria-hidden="true" />}
                  Confirm
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

        {suggestion.status === 'pending' && !noteOpen && (
          <div className={styles.rowActions}>
            <button
              type="button"
              className={styles.restoreBtn}
              onClick={() => {
                setPendingStatus('applied');
                setNoteOpen(true);
              }}
              disabled={busy}
            >
              <CheckCircle2 size={13} aria-hidden="true" />
              Applied
            </button>
            <button
              type="button"
              className={styles.rejectBtn}
              onClick={() => {
                setPendingStatus('dismissed');
                setNoteOpen(true);
              }}
              disabled={busy}
            >
              <X size={13} aria-hidden="true" />
              Dismiss
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function TrackerCommentsQueue() {
  const { data: comments, loading, error } = useTrackerCommentsForAdmin();

  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <span className={styles.cardIcon} data-tone="neutral">
          <MessageCircle size={16} aria-hidden="true" />
        </span>
        <div>
          <h2 className={styles.cardTitle}>Hackathon tracker discussion</h2>
          <p className={styles.cardSubtitle}>
            Public comments left on tracker rows — visible on the site the moment they&apos;re
            posted, so this is moderation after the fact, not a review queue. Remove anything
            that shouldn&apos;t be there.
          </p>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className={styles.list}>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className={`skel ${styles.skelRow}`} />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>No comments yet.</p>
      ) : (
        <ul className={styles.list}>
          {comments.map(c => (
            <TrackerCommentRow key={c.id} comment={c} />
          ))}
        </ul>
      )}
    </section>
  );
}

function TrackerCommentRow({ comment }: { comment: TrackerComment }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removed, setRemoved] = useState(false);

  async function remove() {
    if (!window.confirm('Remove this comment? This cannot be undone.')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTrackerComment(comment.id);
      setRemoved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that.');
      setBusy(false);
    }
  }

  if (removed) return null;

  return (
    <li className={styles.row}>
      <div className={styles.rowGrid}>
        <div className={styles.rowBody}>
          <div className={styles.rowHead}>
            <span className={styles.rowName}>{WINNER_NAME_BY_ID[comment.winnerId] ?? comment.winnerId}</span>
          </div>
          <p className={styles.rowTagline}>{comment.body}</p>
          <p className={styles.rowFounders}>
            {comment.authorName || 'Anonymous'} · {timeAgo(comment.createdAt)}
          </p>
          {error && (
            <p className={styles.formError} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.rowActions}>
          <button type="button" className={styles.rejectBtn} onClick={remove} disabled={busy}>
            {busy ? <Loader2 size={13} className={styles.spin} aria-hidden="true" /> : <Trash2 size={13} aria-hidden="true" />}
            Remove
          </button>
        </div>
      </div>
    </li>
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
            Every startup, newest submission first. Expand one to read, edit or remove its
            updates. Rejecting a startup pulls it out of the directory immediately — its own
            page still loads, marked as removed.
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
  const [postsOpen, setPostsOpen] = useState(false);

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
      <div className={styles.rowGrid}>
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
      </div>

      <button
        type="button"
        className={styles.postsToggle}
        onClick={() => setPostsOpen(o => !o)}
        aria-expanded={postsOpen}
      >
        <MessageCircle size={13} aria-hidden="true" />
        {startup.postCount} update{startup.postCount === 1 ? '' : 's'}
        {postsOpen ? <ChevronUp size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}
      </button>

      {postsOpen && <PostsPanel startupId={startup.id} />}
    </li>
  );
}

function PostsPanel({ startupId }: { startupId: string }) {
  const { data: posts, loading } = useStartupPosts(startupId);

  if (loading) return <p className={styles.postsEmpty}>Loading updates…</p>;
  if (posts.length === 0) return <p className={styles.postsEmpty}>No updates posted yet.</p>;

  return (
    <div className={styles.postsPanel}>
      {posts.map(post => (
        <PostRow key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostRow({ post }: { post: Post }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(post.body);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await editPost(post.startupId, post.id, body);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      await deletePost(post.startupId, post.id);
      // The live subscription drops it from the list on success.
    } catch (err) {
      setDeleting(false);
      setConfirmingDelete(false);
      setError(err instanceof Error ? err.message : 'Could not delete that.');
    }
  }

  return (
    <article className={styles.postItem}>
      <div className={styles.postMeta}>
        <span className={styles.postKind}>{post.isLaunch ? 'Launch' : 'Update'}</span>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
        <span className={styles.postStat}>
          <Heart size={11} aria-hidden="true" /> {post.likeCount}
        </span>
        <span className={styles.postStat}>
          <MessageCircle size={11} aria-hidden="true" /> {post.commentCount}
        </span>
        {post.images.length > 0 && (
          <span className={styles.postStat}>
            <ImageIcon size={11} aria-hidden="true" /> {post.images.length}
          </span>
        )}
        {post.video && (
          <span className={styles.postStat}>
            <PlaySquare size={11} aria-hidden="true" /> video
          </span>
        )}
      </div>

      {editing ? (
        <>
          <textarea
            className={styles.postTextarea}
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={2000}
            rows={3}
            autoFocus
          />
          <div className={styles.postItemActions}>
            <button
              type="button"
              className={styles.reasonCancel}
              onClick={() => {
                setEditing(false);
                setBody(post.body);
                setError(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className={styles.reasonConfirm} onClick={save} disabled={saving || !body.trim()}>
              {saving && <Loader2 size={13} className={styles.spin} aria-hidden="true" />}
              Save
            </button>
          </div>
        </>
      ) : (
        <>
          {post.body && <p className={styles.postBody}>{post.body}</p>}

          {post.images.length > 0 && (
            <div className={styles.postImages}>
              {post.images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={img.url} alt="" className={styles.postImage} />
              ))}
            </div>
          )}

          <div className={styles.postItemActions}>
            <button type="button" className={styles.postEditBtn} onClick={() => setEditing(true)}>
              <Pencil size={12} aria-hidden="true" />
              Edit
            </button>
            <button
              type="button"
              className={styles.postDeleteBtn}
              data-confirming={confirmingDelete || undefined}
              onClick={remove}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 size={12} className={styles.spin} aria-hidden="true" />
              ) : (
                <Trash2 size={12} aria-hidden="true" />
              )}
              {confirmingDelete ? 'Confirm delete' : 'Delete'}
            </button>
          </div>
        </>
      )}

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
