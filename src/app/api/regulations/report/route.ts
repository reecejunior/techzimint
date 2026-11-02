import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { RULES } from '@/lib/regulationsData';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { clientIp, makeLimiter, sameOrigin } from '@/lib/server/guards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const tooMany = makeLimiter(10 * 60_000, 3);
const RULE_IDS = new Set(RULES.map(r => r.id));

const MIN_MESSAGE = 10;
const MAX_MESSAGE = 800;

/**
 * POST { ruleId, message, contact?, website? } -> { ok: true }.
 *
 * Saves a reader's correction for the team to review in /admin. `website` is a
 * hidden field real visitors never fill: a bot that does gets a quiet success
 * and nothing is stored. The service-account write bypasses firestore.rules, so
 * everything is validated here.
 */
export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403, headers: NO_STORE });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Send JSON.' }, { status: 400, headers: NO_STORE });
  }

  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const ruleId = typeof body.ruleId === 'string' ? body.ruleId : '';
  const message = typeof body.message === 'string' ? body.message.replace(/\s+/g, ' ').trim() : '';
  const contact = typeof body.contact === 'string' ? body.contact.trim().slice(0, 120) : '';

  if (!RULE_IDS.has(ruleId)) {
    return NextResponse.json({ error: 'Unknown rule.' }, { status: 400, headers: NO_STORE });
  }
  if (message.length < MIN_MESSAGE || message.length > MAX_MESSAGE) {
    return NextResponse.json(
      { error: `Describe the problem in ${MIN_MESSAGE} to ${MAX_MESSAGE} characters.` },
      { status: 400, headers: NO_STORE },
    );
  }
  if (tooMany(clientIp(request))) {
    return NextResponse.json(
      { error: 'Too many reports. Try again in a few minutes.' },
      { status: 429, headers: NO_STORE },
    );
  }

  try {
    await getAdminDb().collection('regulationReports').add({
      ruleId,
      message,
      contact,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (e) {
    console.error('[regulations-report]', e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: 'Could not send that right now.' },
      { status: 503, headers: NO_STORE },
    );
  }
}
