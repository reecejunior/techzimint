import 'server-only';
import { Timestamp } from 'firebase-admin/firestore';
import { computeScore, periodKeys } from '@/lib/ranking';
import { getAdminDb } from './firebaseAdmin';

export interface DigestStartup {
  name: string;
  slug: string;
  tagline: string;
  score: number;
}

export interface DigestData {
  topFive: DigestStartup[];
  newLaunches: DigestStartup[];
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * The same score math the client uses (see mapStartup in firestore.ts), run
 * here against an admin-SDK read instead — the digest is generated outside
 * any browser, so it can't reuse the client's live-subscription version.
 */
export async function buildDigest(): Promise<DigestData> {
  const db = getAdminDb();
  const snap = await db.collection('startups').where('status', '==', 'approved').get();
  const { weekKey } = periodKeys();
  const weekAgo = Date.now() - WEEK_MS;

  const startups = snap.docs.map(doc => {
    const v = doc.data();
    const reviewCount = Number(v.reviewCount) || 0;
    const avgOverall =
      reviewCount > 0
        ? (Number(v.ratingSumUX) || 0) / reviewCount / 3 +
          (Number(v.ratingSumUsefulness) || 0) / reviewCount / 3 +
          (Number(v.ratingSumWouldPay) || 0) / reviewCount / 3
        : 0;
    // A weekly-like counter stamped with a past period is not this period's count.
    const weeklyLikes = v.weekKey === weekKey ? Number(v.weeklyLikes) || 0 : 0;
    const submittedAtMs = v.submittedAt instanceof Timestamp ? v.submittedAt.toMillis() : 0;

    return {
      name: String(v.name ?? 'Untitled'),
      slug: String(v.slug ?? doc.id),
      tagline: String(v.tagline ?? ''),
      score: computeScore({
        likes: weeklyLikes,
        comments: Number(v.commentCount) || 0,
        reviews: reviewCount,
        avgOverall,
      }),
      submittedAtMs,
    };
  });

  const topFive = [...startups]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ name, slug, tagline, score }) => ({ name, slug, tagline, score }));

  const newLaunches = startups
    .filter(s => s.submittedAtMs >= weekAgo)
    .sort((a, b) => b.submittedAtMs - a.submittedAtMs)
    .map(({ name, slug, tagline, score }) => ({ name, slug, tagline, score }));

  return { topFive, newLaunches };
}
