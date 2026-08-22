import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { sendPushToUser } from '@/lib/server/push';
import { messageFor } from '@/lib/notificationText';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://startups.techzim.co.zw';

/**
 * Called client-side, fire-and-forget, right after a like/comment/reply/
 * review creates a notification — this is what makes push near-instant
 * instead of waiting on a cron. It re-reads the notification itself via the
 * Admin SDK rather than trusting anything else in the request body, so a
 * caller can't spoof what gets pushed or to whom — the only thing this
 * endpoint can be tricked into is re-announcing a notification that's
 * already genuinely real and already happened.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const notificationId = typeof body?.notificationId === 'string' ? body.notificationId : null;
  if (!notificationId) {
    return NextResponse.json({ error: 'notificationId is required' }, { status: 400 });
  }

  const db = getAdminDb();
  const ref = db.collection('notifications').doc(notificationId);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ sent: 0, reason: 'not found' });
  }

  const n = snap.data()!;
  if (n.pushedAt) {
    return NextResponse.json({ sent: 0, reason: 'already pushed' });
  }

  const message = messageFor({
    type: n.type,
    startupName: String(n.startupName ?? 'Untitled'),
    actorName: String(n.actorName ?? ''),
    snippet: String(n.snippet ?? ''),
  });

  const result = await sendPushToUser(String(n.recipientId), {
    title: 'Techzim Startups',
    body: message,
    url: `${SITE_URL}/startups/${n.startupSlug}`,
  });

  await ref.update({ pushedAt: new Date() });
  return NextResponse.json(result);
}
