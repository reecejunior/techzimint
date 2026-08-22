import { NextResponse } from 'next/server';
import { createHmac, randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** ImageKit caps this at one hour; a short window limits how long a leaked
 *  signature stays usable. Two minutes is ample for picking a file. */
const TTL_SECONDS = 120;

/**
 * Hands the browser a short-lived signature so it can upload straight to
 * ImageKit without the private key ever leaving the server.
 *
 * This is why ImageKit is a better fit here than an unsigned-upload host:
 * the credential that actually matters stays server-side, and this route is
 * the one place to add abuse controls later (rate limiting, requiring an
 * authenticated caller) without touching the client.
 */
export async function GET() {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      { error: 'Uploads are not configured — IMAGEKIT_PRIVATE_KEY is not set.' },
      { status: 503 },
    );
  }

  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  // ImageKit's scheme: HMAC-SHA1 over token + expire, keyed with the private key.
  const signature = createHmac('sha1', privateKey).update(token + expire).digest('hex');

  return NextResponse.json(
    { token, expire, signature },
    // Never cache: each signature is single-use and time-boxed.
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
