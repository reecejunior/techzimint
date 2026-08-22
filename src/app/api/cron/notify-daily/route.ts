import { NextResponse, type NextRequest } from 'next/server';
import { runNotifyBatch } from '@/lib/server/notifyBatch';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Triggered by Vercel Cron once a day (see vercel.json). Same batching logic
 * as notify-instant, just for visitors who opted into `mode: 'daily'`.
 */
export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await runNotifyBatch('daily');
  return NextResponse.json(result);
}
