/**
 * Pure leaderboard logic — scoring, ranking, period buckets, slugs, embeds.
 *
 * Kept free of any Firestore or Storage import so it can be reasoned about (and
 * tested) without a database in the room.
 */
import type { Startup } from './types';

/* ─── Scoring ───
   Engagement in the feed is what produces the ranking. Weights reflect effort:
   a like is one tap, a comment takes a sentence, a review takes thought. Score
   is derived from the counters on read rather than stored beside them, so it
   can never drift out of sync with the engagement behind it. */
export const LIKE_WEIGHT = 3;
export const COMMENT_WEIGHT = 5;
export const REVIEW_WEIGHT = 12;
export const RATING_WEIGHT = 40;

export function computeScore(input: {
  likes: number;
  comments: number;
  reviews: number;
  avgOverall: number;
}): number {
  return Math.round(
    input.likes * LIKE_WEIGHT +
      input.comments * COMMENT_WEIGHT +
      input.reviews * REVIEW_WEIGHT +
      input.avgOverall * RATING_WEIGHT,
  );
}

/* ─── Period buckets ───
   Weekly and monthly like counts are stored as counters (cheap to read, live
   over websockets) stamped with the period they belong to. A stale stamp reads
   as zero and is reset on the next write, so the numbers stay correct without a
   scheduled job to reset them. */
export function periodKeys(d = new Date()) {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  // ISO-8601 week: the week containing the Thursday of the current week.
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return {
    weekKey: `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`,
    monthKey: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
  };
}

/**
 * Assigns ranks and movement across the whole set.
 *
 * Rank is a property of the collection, not of one document, so it is computed
 * after every startup has arrived rather than stored per-startup where it would
 * go stale the moment anyone else received a like.
 *
 * Ranks on the period score — the same number the row displays — so a
 * lower-ranked row can never print a higher figure than the one above it.
 *
 * Mutates and returns the given array.
 */
export function withRanks(list: Startup[]): Startup[] {
  const assign = (
    scoreKey: 'scoreWeek' | 'scoreMonth',
    likeKey: 'weeklyLikes' | 'monthlyLikes',
    rankField: 'rankWeek' | 'rankMonth',
    prevField: 'prevRankWeek' | 'prevRankMonth',
    deltaField: 'rankDeltaWeek' | 'rankDeltaMonth',
  ) => {
    [...list]
      .sort(
        (a, b) =>
          b[scoreKey] - a[scoreKey] ||
          b[likeKey] - a[likeKey] ||
          a.name.localeCompare(b.name),
      )
      .forEach((s, i) => {
        s[rankField] = i + 1;
        // A previous rank of 0 means "never ranked before" — show no movement
        // rather than inventing a dramatic climb from nowhere.
        s[deltaField] = s[prevField] > 0 ? s[prevField] - (i + 1) : 0;
      });
  };

  assign('scoreWeek', 'weeklyLikes', 'rankWeek', 'prevRankWeek', 'rankDeltaWeek');
  assign('scoreMonth', 'monthlyLikes', 'rankMonth', 'prevRankMonth', 'rankDeltaMonth');
  return list;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Two-letter monogram, used when a startup has no uploaded logo. */
export function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('') || 'AN'
  );
}

/* ─── Video embeds ───
   Resolved once on write so the player never has to parse a URL at render time,
   and an unsupported link is rejected at the point someone pastes it. */
export function parseVideoUrl(
  raw: string,
): { provider: 'youtube' | 'vimeo'; embedId: string } | null {
  const url = raw.trim();
  if (!url) return null;

  const youtube =
    url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (youtube) return { provider: 'youtube', embedId: youtube[1] };

  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d{6,})/);
  if (vimeo) return { provider: 'vimeo', embedId: vimeo[1] };

  return null;
}

export function embedSrc(provider: 'youtube' | 'vimeo', id: string): string {
  return provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0`
    : `https://player.vimeo.com/video/${id}`;
}

/** "3 hours ago" — the feed needs relative time, not a date stamp. */
export function timeAgo(iso: string, now = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';

  const seconds = Math.max(0, Math.round((now.getTime() - then) / 1000));
  if (seconds < 60) return 'just now';

  const steps: [number, string][] = [
    [60, 'minute'],
    [60, 'hour'],
    [24, 'day'],
    [7, 'week'],
    [4.345, 'month'],
    [12, 'year'],
  ];

  let value = seconds;
  let unit = 'second';
  for (const [size, name] of steps) {
    if (value < size) break;
    value /= size;
    unit = name;
  }

  const n = Math.floor(value);
  return `${n} ${unit}${n === 1 ? '' : 's'} ago`;
}
