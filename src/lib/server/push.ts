import 'server-only';
import { getAdminDb, getAdminMessaging } from './firebaseAdmin';

/**
 * Sends one push to every token registered for a visitor, and prunes
 * whichever tokens FCM reports as dead — a token going stale (browser data
 * cleared, app uninstalled, permission revoked) is the normal case, not an
 * error worth surfacing.
 */
export async function sendPushToUser(
  uid: string,
  payload: { title: string; body: string; url: string },
): Promise<{ sent: number }> {
  const db = getAdminDb();
  const tokenDoc = await db.collection('pushTokens').doc(uid).get();
  const tokens: string[] = Array.isArray(tokenDoc.data()?.tokens) ? tokenDoc.data()!.tokens : [];
  if (tokens.length === 0) return { sent: 0 };

  const res = await getAdminMessaging().sendEachForMulticast({
    tokens,
    // `data`-only (no top-level `notification`) so the service worker's
    // onBackgroundMessage is what decides how to render it, consistently,
    // rather than the browser doing its own default rendering sometimes.
    data: { title: payload.title, body: payload.body, url: payload.url },
    webpush: { fcmOptions: { link: payload.url } },
  });

  const dead: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success && DEAD_TOKEN_CODES.has(r.error?.code ?? '')) dead.push(tokens[i]);
  });
  if (dead.length > 0) {
    await db.collection('pushTokens').doc(uid).update({
      tokens: tokens.filter(t => !dead.includes(t)),
    });
  }

  return { sent: res.successCount };
}

const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);
