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
 * One mechanism for every email cadence — the cadence is just how often the
 * caller runs it. Each visitor's `lastNotifiedAt` is the cursor: only
 * notifications created after it are eligible, so nobody gets the same one
 * twice even if two jobs overlap.
 *
 * The daily job deliberately sweeps `instant` as well. Vercel's Hobby plan
 * won't run a cron more than once a day, so a genuinely instant *email* isn't
 * available here — sweeping both means someone who asked for instant still
 * gets their notifications, a day later, rather than nothing at all. Push
 * (which the client triggers directly) is the real instant path.
 */
export async function runNotifyBatch(modes: ('instant' | 'daily')[]) {
  const db = getAdminDb();
  const prefsSnap = await db.collection('notificationPrefs').where('mode', 'in', modes).get();

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

    const html = renderNotificationEmail({ siteUrl: SITE_URL, notifications });
    const newestCreatedAt = notifsSnap.docs[notifsSnap.docs.length - 1].data().createdAt;

    try {
      await sendEmail({
        to: email,
        subject:
          notifications.length === 1
            ? 'You have a new notification on Techzim Startups'
            : `You have ${notifications.length} new notifications on Techzim Startups`,
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
