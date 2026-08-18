import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { buildDigest } from '@/lib/server/digest';
import { renderDigestEmail } from '@/lib/server/digestEmail';
import { sendEmail } from '@/lib/server/email';

// Needs the Node runtime for firebase-admin, and must never be statically
// cached — every run has to hit Firestore fresh.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://startups.techzim.co.zw';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Triggered by Vercel Cron (see vercel.json) once a week. Vercel sends
 * `Authorization: Bearer $CRON_SECRET` on scheduled invocations — checking it
 * here is what stops anyone else on the internet from firing off a send by
 * just visiting this URL.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const digest = await buildDigest();
  if (digest.topFive.length === 0 && digest.newLaunches.length === 0) {
    return NextResponse.json({ sent: 0, reason: 'Nothing to report this week.' });
  }

  const db = getAdminDb();
  const subsSnap = await db.collection('subscribers').where('active', '==', true).get();

  // Nothing stops the same address subscribing twice (the client can't read
  // this collection to check first — see firestore.rules) — group by email
  // so nobody gets the digest more than once. Any one of a group's doc ids
  // works for the unsubscribe link; that route deactivates every doc sharing
  // the email anyway.
  const byEmail = new Map<string, string>();
  for (const doc of subsSnap.docs) {
    const email = String(doc.data().email ?? '').toLowerCase();
    if (email && !byEmail.has(email)) byEmail.set(email, doc.id);
  }

  let sent = 0;
  let failed = 0;

  for (const [email, id] of byEmail) {
    const html = renderDigestEmail({
      siteUrl: SITE_URL,
      unsubscribeUrl: `${SITE_URL}/api/unsubscribe?id=${id}`,
      topFive: digest.topFive,
      newLaunches: digest.newLaunches,
    });

    try {
      await sendEmail({ to: email, subject: "This week's Techzim Startups standings", html });
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error(`Digest send failed for ${email}:`, err);
    }

    // A deliberate pace, not a rate-limit workaround for any specific number —
    // sending hundreds at a time may eventually want a batch API instead of
    // one request per recipient; fine at today's list size.
    await sleep(350);
  }

  return NextResponse.json({ sent, failed, recipients: byEmail.size });
}
