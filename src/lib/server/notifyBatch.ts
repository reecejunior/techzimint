import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from './firebaseAdmin';
import { sendEmail } from './email';
import { renderNotificationEmail } from './notificationEmail';
import type { Notification } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://startups.techzim.co.zw';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Shared by both cron routes — "instant" and "daily" are the same mechanism
 * at different frequencies, not two different code paths. Each visitor's
 * `lastNotifiedAt` is the cursor: only notifications created after it are
 * eligible, so nobody gets the same one twice even across the two jobs.
 */
export async function runNotifyBatch(mode: 'instant' | 'daily') {
  const db = getAdminDb();
  const prefsSnap = await db.collection('notificationPrefs').where('mode', '==', mode).get();

  let sent = 0;
  let failed = 0;

  for (const prefDoc of prefsSnap.docs) {
    const uid = prefDoc.id;
    const pref = prefDoc.data();
    const email = String(pref.email ?? '');
    if (!email) continue;

    const lastNotifiedAt = pref.lastNotifiedAt instanceof Timestamp ? pref.lastNotifiedAt : Timestamp.fromMillis(0);

    const notifsSnap = await db
      .collection('notifications')
      .where('recipientId', '==', uid)
      .where('createdAt', '>', lastNotifiedAt)
      .orderBy('createdAt', 'asc')
      .limit(50)
      .get();

    if (notifsSnap.empty) continue;

    const notifications: Notification[] = notifsSnap.docs.map(d => {
      const v = d.data();
      return {
        id: d.id,
        recipientId: String(v.recipientId ?? ''),
        type: (v.type ?? 'comment') as Notification['type'],
        startupId: String(v.startupId ?? ''),
        startupSlug: String(v.startupSlug ?? ''),
        startupName: String(v.startupName ?? 'Untitled'),
        actorName: String(v.actorName ?? ''),
        snippet: String(v.snippet ?? ''),
        read: Boolean(v.read),
        createdAt: v.createdAt instanceof Timestamp ? v.createdAt.toDate().toISOString() : '',
      };
    });

    const html = renderNotificationEmail({ siteUrl: SITE_URL, notifications, cadence: mode });
    const newestCreatedAt = notifsSnap.docs[notifsSnap.docs.length - 1].data().createdAt;

    try {
      await sendEmail({
        to: email,
        subject:
          mode === 'instant'
            ? "There's new activity on Techzim Startups"
            : "Today's activity on Techzim Startups",
        html,
      });
      // Only move the cursor on a successful send — a failed send should be
      // retried next run, not silently skipped forever.
      await prefDoc.ref.update({ lastNotifiedAt: newestCreatedAt });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`Notification email failed for ${email}:`, err);
    }

    // Same deliberate pace as the weekly digest — not a rate-limit
    // workaround for a specific number, just a sane default.
    await sleep(350);
  }

  return { checked: prefsSnap.size, sent, failed };
}
