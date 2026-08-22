import { NextResponse, type NextRequest } from 'next/server';
import { runNotifyBatch } from '@/lib/server/notifyBatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sweeps only the `instant` opt-ins.
 *
 * Deliberately NOT in vercel.json: Hobby caps crons at two jobs, no more than
 * daily, and a rejected config fails the whole deployment. This stays here as
 * a manual/external trigger — call it from an outside scheduler, or add it to
 * vercel.json on a paid plan where a sub-daily schedule is actually allowed.
 * Until then notify-daily sweeps `instant` too, so nobody is dropped.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runNotifyBatch(['instant']);
  return NextResponse.json(result);
}
