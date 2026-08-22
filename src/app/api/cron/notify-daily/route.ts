import { NextResponse, type NextRequest } from 'next/server';
import { runNotifyBatch } from '@/lib/server/notifyBatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Triggered by Vercel Cron once a day (see vercel.json) — the only email
 * notification job that actually runs on the current plan.
 *
 * Sweeps `instant` alongside `daily`: Hobby won't schedule a cron more often
 * than daily, so instant *email* isn't achievable here, and delivering a day
 * late beats delivering never. Push is the real instant path.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runNotifyBatch(['daily', 'instant']);
  return NextResponse.json(result);
}
