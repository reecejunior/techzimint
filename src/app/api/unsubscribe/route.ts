import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDb } from '@/lib/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function htmlResponse(message: string, status: number) {
  return new NextResponse(
    `<!doctype html><html><body style="margin:0;padding:60px 20px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#FFF9F5;color:#1D1A17;">
      <p style="font-size:16px;margin-bottom:16px;">${message}</p>
      <a href="/" style="color:#E85D04;text-decoration:none;font-weight:600;">Back to Techzim Startups</a>
    </body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

/**
 * A one-click GET so it works straight from an email link — no login exists
 * to gate this behind. The link carries an opaque subscriber doc id rather
 * than a plain email address, which is the only real access control here.
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  if (!id) return htmlResponse('That unsubscribe link is missing its id.', 400);

  const db = getAdminDb();
  const docSnap = await db.collection('subscribers').doc(id).get();
  if (!docSnap.exists) return htmlResponse("You're not on the list — nothing to do.", 200);

  const email = String(docSnap.data()?.email ?? '');
  const batch = db.batch();

  if (email) {
    // Deactivate every doc sharing this email, not just the one the link
    // named — a duplicate signup shouldn't keep emailing someone who opted out.
    const dupes = await db.collection('subscribers').where('email', '==', email).get();
    dupes.forEach(d => batch.update(d.ref, { active: false }));
  } else {
    batch.update(docSnap.ref, { active: false });
  }

  await batch.commit();
  return htmlResponse("You're unsubscribed — no more weekly emails.", 200);
}
