import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { SECTORS } from '@/lib/regulationsData';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { clientIp, makeLimiter, sameOrigin } from '@/lib/server/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const tooMany = makeLimiter(60_000, 30);
const SECTOR_IDS = new Set(SECTORS.map(s => s.id));

/**
 * POST { sectors: string[], noSector: boolean } -> 204.
 *
 * Counts what kinds of ideas people search, so the team can see what to research
 * next. Only sector ids from our own list and a yes/no are accepted: the idea
 * text never reaches this route, and nothing here identifies a visitor. The
 * counters live in one document, regulationStats/summary, read by /admin.
 */
export async function POST(request: NextRequest) {
  const quiet = () => new NextResponse(null, { status: 204 });
  if (!sameOrigin(request) || tooMany(clientIp(request))) return quiet();

  let body: { sectors?: unknown; noSector?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return quiet();
  }

  const sectors = Array.isArray(body.sectors)
    ? [...new Set(body.sectors.filter((x): x is string => typeof x === 'string' && SECTOR_IDS.has(x)))].slice(0, 12)
    : [];
  const noSector = body.noSector === true && sectors.length === 0;

  const day = new Date().toISOString().slice(0, 10);
  const inc = FieldValue.increment(1);
  try {
    await getAdminDb().collection('regulationStats').doc('summary').set(
      {
        searches: inc,
        ...(noSector ? { noSector: inc } : {}),
        sectors: Object.fromEntries(sectors.map(id => [id, inc])),
        days: { [day]: inc },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } catch (e) {
    console.error('[regulations-stat]', e instanceof Error ? e.message : e);
  }
  return quiet();
}
