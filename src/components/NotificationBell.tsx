'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bell, Heart, MessageCircle, Star } from 'lucide-react';
import { markAllNotificationsRead, markNotificationRead } from '@/lib/firestore';
import { useMyNotifications } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { Notification } from '@/lib/types';
import styles from './NotificationBell.module.css';

const ICONS: Record<Notification['type'], typeof Bell> = {
  reply: MessageCircle,
  comment: MessageCircle,
  like: Heart,
  review: Star,
};

function messageFor(n: Notification): string {
  switch (n.type) {
    case 'reply':
      // Attributed to the startup, not the founder's typed name — replying
      // as the founder is the whole point of this one.
      return `${n.startupName} replied: "${n.snippet}"`;
    case 'comment':
      return `${n.actorName || 'Someone'} commented on ${n.startupName}: "${n.snippet}"`;
    case 'review':
      return n.snippet
        ? `${n.actorName || 'Someone'} reviewed ${n.startupName}: "${n.snippet}"`
        : `${n.actorName || 'Someone'} reviewed ${n.startupName}.`;
    case 'like':
      return `Someone liked ${n.startupName}.`;
  }
}

/**
 * A quiet bell — everyone's anonymous, so this is scoped to whatever this
 * browser's anonymous session has accumulated, not a real account inbox.
 * Clear localStorage or switch devices and the history doesn't follow.
 */
export default function NotificationBell() {
  const { data: notifications } = useMyNotifications();
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

          {notifications.length === 0 ? (
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
        </div>
      )}
    </div>
  );
}
