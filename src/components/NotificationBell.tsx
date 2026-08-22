'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Heart, Loader2, MessageCircle, Star } from 'lucide-react';
import { requestPushToken } from '@/lib/firebase';
import {
  markAllNotificationsRead, markNotificationRead, removePushToken, saveNotificationPref,
  savePushToken,
} from '@/lib/firestore';
import { useMyNotificationPref, useMyNotifications, useMyPushTokens } from '@/lib/hooks';
import { messageFor } from '@/lib/notificationText';
import { timeAgo } from '@/lib/ranking';
import type { Notification, NotificationEmailMode } from '@/lib/types';
import styles from './NotificationBell.module.css';

const ICONS: Record<Notification['type'], typeof Bell> = {
  reply: MessageCircle,
  comment: MessageCircle,
  like: Heart,
  review: Star,
};

/**
 * A quiet bell — everyone's anonymous, so this is scoped to whatever this
 * browser's anonymous session has accumulated, not a real account inbox.
 * Clear localStorage or switch devices and the history doesn't follow.
 */
export default function NotificationBell() {
  const { data: notifications, loading, error } = useMyNotifications();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openOne(n: Notification) {
    setOpen(false);
    if (!n.read) void markNotificationRead(n.id);
  }

  function markAll() {
    if (unread.length === 0) return;
    void markAllNotificationsRead(unread.map(n => n.id));
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : 'Notifications'}
      >
        <Bell size={18} aria-hidden="true" />
        {unread.length > 0 && (
          <span className={styles.dot} aria-hidden="true">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.panel} role="menu">
          <div className={styles.panelHead}>
            <span className={styles.panelTitle}>Notifications</span>
            {unread.length > 0 && (
              <button type="button" className={styles.markAll} onClick={markAll}>
                Mark all read
              </button>
            )}
          </div>

          {/* An error must never render as "nothing yet" — that reads as
              "you have no notifications" when the truth is "this is
              broken", and it hides real faults (a missing index, denied
              rules) behind a reassuring empty state. */}
          {error ? (
            <p className={styles.failed} role="alert">
              Notifications couldn&apos;t load. {error}
            </p>
          ) : loading ? (
            <p className={styles.empty}>Loading…</p>
          ) : notifications.length === 0 ? (
            <p className={styles.empty}>Nothing yet — likes, comments and replies show up here.</p>
          ) : (
            <ul className={styles.list}>
              {notifications.map(n => {
                const Icon = ICONS[n.type];
                return (
                  <li key={n.id}>
                    <Link
                      href={`/startups/${n.startupSlug}`}
                      className={styles.item}
                      data-unread={!n.read || undefined}
                      onClick={() => openOne(n)}
                    >
                      <Icon size={15} className={styles.itemIcon} aria-hidden="true" />
                      <span className={styles.itemBody}>
                        <span className={styles.itemText}>{messageFor(n)}</span>
                        <time className={styles.itemTime} dateTime={n.createdAt}>
                          {timeAgo(n.createdAt)}
                        </time>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <PushToggle />
          <EmailPrefForm />
        </div>
      )}
    </div>
  );
}

/**
 * Push arrives even when this tab is closed, without asking for an email —
 * the closest thing to instant this app can do without a paid backend
 * trigger. Only ever covers *this* browser/device; a visitor on a second
 * device would enable it separately there.
 */
function PushToggle() {
  const tokens = useMyPushTokens();
  const [thisToken, setThisToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Once we know which token belongs to this browser, it doubles as proof
  // push is already on here — no separate "enabled" flag to keep in sync.
  const enabledHere = Boolean(thisToken) && tokens.includes(thisToken as string);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const token = await requestPushToken();
      if (!token) {
        setError("Permission wasn't granted, or push isn't supported in this browser.");
        return;
      }
      await savePushToken(token);
      setThisToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not enable push.');
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    if (!thisToken) return;
    setBusy(true);
    setError(null);
    try {
      await removePushToken(thisToken);
      setThisToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not turn that off.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.prefForm}>
      <div className={styles.pushRow}>
        <span className={styles.prefLabel}>
          <BellRing size={13} aria-hidden="true" />
          Push notifications on this device
        </span>
        {enabledHere ? (
          <button type="button" className={styles.prefOff} onClick={disable} disabled={busy}>
            Turn off
          </button>
        ) : (
          <button type="button" className={styles.prefSave} onClick={enable} disabled={busy}>
            {busy && <Loader2 size={12} className={styles.spin} aria-hidden="true" />}
            {busy ? 'Enabling…' : 'Enable'}
          </button>
        )}
      </div>
      {error && (
        <p className={styles.prefError} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Everyone here is anonymous by default — this is the one place a visitor
 * can optionally hand over an email, specifically to get these same
 * notifications even when they're not on this browser to see the bell.
 */
function EmailPrefForm() {
  const { data: pref, loading } = useMyNotificationPref();
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<NotificationEmailMode>('daily');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Only seed the form from the live doc once, the first time it's loaded —
  // otherwise every snapshot update would overwrite text mid-edit.
  const [seeded, setSeeded] = useState(false);

  if (!loading && !seeded && pref) {
    setEmail(pref.email);
    setMode(pref.mode);
    setSeeded(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveNotificationPref(email, email.trim() ? mode : 'off');
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.prefForm} onSubmit={save}>
      <span className={styles.prefLabel}>Also get these by email</span>
      <div className={styles.prefRow}>
        <input
          type="email"
          className={styles.prefInput}
          placeholder="you@example.com"
          value={email}
          onChange={e => {
            setEmail(e.target.value);
            setSaved(false);
          }}
        />
        <select
          className={styles.prefSelect}
          value={mode}
          onChange={e => {
            setMode(e.target.value as NotificationEmailMode);
            setSaved(false);
          }}
          aria-label="How often to email"
        >
          <option value="daily">Daily summary</option>
          <option value="instant">Every notification</option>
        </select>
      </div>
      <div className={styles.prefActions}>
        <button type="submit" className={styles.prefSave} disabled={saving}>
          {saving && <Loader2 size={12} className={styles.spin} aria-hidden="true" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className={styles.prefSaved}>Saved</span>}
        {!saving && pref && pref.mode !== 'off' && (
          <button
            type="button"
            className={styles.prefOff}
            onClick={() => {
              setEmail('');
              setMode('daily');
              void saveNotificationPref('', 'off');
              setSaved(true);
            }}
          >
            Turn off
          </button>
        )}
      </div>
      {error && (
        <p className={styles.prefError} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
