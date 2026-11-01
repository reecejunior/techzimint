import { NextResponse, type NextRequest } from 'next/server';
import { MAX_IDEA_LENGTH } from '@/lib/regulationsAi';
import { askModel, getModelConfig } from '@/lib/server/regulationsModel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Per-IP allowance. In-memory, so each serverless instance counts on its own:
 *  this blunts casual abuse, it is not a hard cap. The real spend limit is the
 *  quota on the model host's API key. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  if (hits.size > 500) {
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }
  const entry = hits.get(ip);
  if (!entry || entry.resetAt <= now) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/**
 * POST { idea } -> { configured, plan }.
 *
 * `configured: false` means no model is set up (REGS_AI_* env vars missing);
 * the page then keeps its keyword matches and says so. The idea text is sent
 * to the configured model host and is deliberately not logged here.
 */
export async function POST(request: NextRequest) {
  let idea = '';
  try {
    const body = (await request.json()) as { idea?: unknown };
    if (typeof body.idea === 'string') idea = body.idea.trim();
  } catch {
    return NextResponse.json({ error: 'Send JSON like { "idea": "..." }.' }, { status: 400, headers: NO_STORE });
  }
  if (idea.length < 3 || idea.length > MAX_IDEA_LENGTH) {
    return NextResponse.json(
      { error: `Describe your idea in 3 to ${MAX_IDEA_LENGTH} characters.` },
      { status: 400, headers: NO_STORE },
    );
  }

  const cfg = getModelConfig();
  if (!cfg) {
    return NextResponse.json({ configured: false, plan: null }, { headers: NO_STORE });
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many searches. Wait a minute and try again.' },
      { status: 429, headers: NO_STORE },
    );
  }

  try {
    const plan = await askModel(cfg, idea);
    return NextResponse.json({ configured: true, plan }, { headers: NO_STORE });
  } catch {
    return NextResponse.json(
      { error: 'The AI step is unavailable right now.' },
      { status: 502, headers: NO_STORE },
    );
  }
}
