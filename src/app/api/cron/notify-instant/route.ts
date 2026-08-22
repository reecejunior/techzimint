import { NextResponse, type NextRequest } from 'next/server';
import { runNotifyBatch } from '@/lib/server/notifyBatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Triggered by Vercel Cron on a short interval (see vercel.json) — "instant"
 * on a platform without a real-time trigger means "checked often," not
 * "the moment it happens." A visitor opted into `mode: 'instant'` gets an
 * email the next time this runs, batching anything that landed since the
 * last one so a burst of activity doesn't become a burst of emails.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runNotifyBatch('instant');
  return NextResponse.json(result);
}
