import { NextResponse, type NextRequest } from 'next/server';
import { MAX_IDEA_LENGTH } from '@/lib/regulationsAi';
import type { AiPlan } from '@/lib/regulations';
import { ModelError, askModel, getModelConfig } from '@/lib/server/regulationsModel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Per-IP allowance. In-memory, so each serverless instance counts on its own:
 *  this blunts casual abuse, it is not a hard cap. The real spend limit is the
 *  quota on the model host's API key. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, { count: number; resetAt: number }>();

/** Answers for ideas already asked, so repeats (and the example chips) cost no
 *  model tokens. Per serverless instance, like the limiter above. */
const CACHE_TTL_MS = 6 * 60 * 60_000;
const CACHE_MAX = 300;
const cache = new Map<string, { plan: AiPlan | null; at: number }>();

function cacheKey(idea: string): string {
  return idea.toLowerCase().replace(/\s+/g, ' ').trim();
}

function cacheGet(key: string): { plan: AiPlan | null } | undefined {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return hit;
}

function cacheSet(key: string, plan: AiPlan | null) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
  cache.set(key, { plan, at: Date.now() });
}

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
  // Only this site's own pages should spend model tokens. Browsers always send
  // Origin on a cross-site POST, so a mismatch is someone else's page.
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host')) {
    return NextResponse.json({ error: 'Not allowed.' }, { status: 403, headers: NO_STORE });
  }

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

  const key = cacheKey(idea);
  const cached = cacheGet(key);
  if (cached) {
    return NextResponse.json({ configured: true, plan: cached.plan }, { headers: NO_STORE });
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
    cacheSet(key, plan);
    return NextResponse.json({ configured: true, plan }, { headers: NO_STORE });
  } catch (e) {
    const reason = e instanceof ModelError ? e.reason : 'other';
    console.error('[regulations-ai]', e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: 'The AI step is unavailable right now.', reason },
      { status: 502, headers: NO_STORE },
    );
  }
}
