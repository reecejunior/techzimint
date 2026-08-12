// Sanity checks for the pure logic in src/lib/ranking.ts.
import assert from 'node:assert/strict';
import {
  computeScore, parseVideoUrl, periodKeys, slugify, timeAgo, withRanks,
} from '../src/lib/ranking.ts';
import type { Startup } from '../src/lib/types.ts';

const make = (over: Partial<Startup>): Startup =>
  ({
    id: 'x', slug: 'x', name: 'X', tagline: '', description: '',
    category: 'SaaS', region: 'Harare', website: '', logoUrl: '', logoInitials: 'X',
    logoColor: '#E85D04', ownerId: '', founders: [], score: 0,
    postCount: 0, likeCount: 0, weeklyLikes: 0, monthlyLikes: 0,
    commentCount: 0, reviewCount: 0,
    ratingSumUX: 0, ratingSumUsefulness: 0, ratingSumWouldPay: 0,
    avgUX: 0, avgUsefulness: 0, avgWouldPay: 0,
    scoreWeek: 0, scoreMonth: 0,
    rankWeek: 0, rankMonth: 0, rankDeltaWeek: 0, rankDeltaMonth: 0,
    prevRankWeek: 0, prevRankMonth: 0,
    isStartupOfWeek: false, isTrending: false, rankHistory: [],
    status: 'approved', submittedAt: '',
    ...over,
  }) as Startup;

/* ── Ranking ── */
const list = withRanks([
  make({ id: 'a', name: 'A', scoreWeek: 10, scoreMonth: 5, prevRankWeek: 3 }),
  make({ id: 'b', name: 'B', scoreWeek: 30, scoreMonth: 1, prevRankWeek: 1 }),
  make({ id: 'c', name: 'C', scoreWeek: 20, scoreMonth: 99, prevRankWeek: 0 }),
]);
const by = (id: string) => list.find(s => s.id === id)!;

assert.equal(by('b').rankWeek, 1, 'highest weekly score ranks first');
assert.equal(by('c').rankWeek, 2);
assert.equal(by('a').rankWeek, 3);

assert.equal(by('c').rankMonth, 1, 'monthly ranking is independent of weekly');
assert.equal(by('a').rankMonth, 2);
assert.equal(by('b').rankMonth, 3);

/* The bug this guards: ranking on one number while displaying another lets a
   lower-ranked row print a bigger score than the row above it. */
const ordered = [...list].sort((x, y) => x.rankWeek - y.rankWeek);
ordered.forEach((s, i) => {
  if (i > 0) {
    assert.ok(
      ordered[i - 1].scoreWeek >= s.scoreWeek,
      `rank ${i} must not display a lower score than rank ${i + 1}`,
    );
  }
});

assert.equal(by('a').rankDeltaWeek, 0, 'was 3rd, still 3rd → no movement');
assert.equal(by('b').rankDeltaWeek, 0, 'was 1st, still 1st → no movement');
assert.equal(by('c').rankDeltaWeek, 0, 'never ranked before → no movement, not a fake climb');

const moved = withRanks([
  make({ id: 'a', name: 'A', scoreWeek: 10, prevRankWeek: 5 }),
  make({ id: 'b', name: 'B', scoreWeek: 5, prevRankWeek: 1 }),
]);
assert.equal(moved.find(s => s.id === 'a')!.rankDeltaWeek, 4, '5th → 1st is a climb of 4');
assert.equal(moved.find(s => s.id === 'b')!.rankDeltaWeek, -1, '1st → 2nd is a drop of 1');

/* ── Ties ── */
const tied = withRanks([
  make({ id: 'z', name: 'Zebra', scoreWeek: 7, weeklyLikes: 3 }),
  make({ id: 'y', name: 'Apple', scoreWeek: 7, weeklyLikes: 3 }),
]);
assert.equal(tied.find(s => s.id === 'y')!.rankWeek, 1, 'ties break alphabetically, stably');

/* ── Period keys ── */
const { weekKey, monthKey } = periodKeys(new Date('2026-01-01T00:00:00Z'));
assert.equal(monthKey, '2026-01');
assert.equal(weekKey, '2026-W01', '1 Jan 2026 is a Thursday → ISO week 1');
assert.equal(periodKeys(new Date('2027-01-01T00:00:00Z')).weekKey, '2026-W53',
  '1 Jan 2027 is a Friday → belongs to ISO week 53 of 2026');
assert.equal(periodKeys(new Date('2026-08-11T00:00:00Z')).weekKey, '2026-W33');
assert.notEqual(
  periodKeys(new Date('2026-08-09T00:00:00Z')).weekKey,
  periodKeys(new Date('2026-08-10T00:00:00Z')).weekKey,
  'Sunday and Monday fall in different ISO weeks',
);

/* ── Slugs ── */
assert.equal(slugify('PayFlow ZW'), 'payflow-zw');
assert.equal(slugify('  Mbudzi   Market!! '), 'mbudzi-market');
assert.equal(slugify('O & A Level'), 'o-a-level');
assert.equal(slugify('***'), '', 'unusable names produce an empty slug, which is rejected upstream');

/* ── Scoring ──
   Weights must respect effort: a review outranks a comment outranks a like. */
assert.ok(
  computeScore({ likes: 0, comments: 0, reviews: 1, avgOverall: 0 }) >
    computeScore({ likes: 0, comments: 1, reviews: 0, avgOverall: 0 }),
  'one review counts for more than one comment',
);
assert.ok(
  computeScore({ likes: 0, comments: 1, reviews: 0, avgOverall: 0 }) >
    computeScore({ likes: 1, comments: 0, reviews: 0, avgOverall: 0 }),
  'one comment counts for more than one like',
);
assert.equal(computeScore({ likes: 0, comments: 0, reviews: 0, avgOverall: 0 }), 0,
  'no engagement scores zero, not a floor');

/* ── Video links ── */
assert.deepEqual(parseVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  { provider: 'youtube', embedId: 'dQw4w9WgXcQ' });
assert.deepEqual(parseVideoUrl('https://youtu.be/dQw4w9WgXcQ?t=30'),
  { provider: 'youtube', embedId: 'dQw4w9WgXcQ' });
assert.deepEqual(parseVideoUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ'),
  { provider: 'youtube', embedId: 'dQw4w9WgXcQ' });
assert.deepEqual(parseVideoUrl('https://vimeo.com/123456789'),
  { provider: 'vimeo', embedId: '123456789' });
assert.equal(parseVideoUrl('https://example.com/video.mp4'), null,
  'an arbitrary link is rejected rather than embedded blindly');
assert.equal(parseVideoUrl(''), null);

/* ── Relative time ── */
const t0 = new Date('2026-08-11T12:00:00Z');
const ago = (iso: string) => timeAgo(iso, t0);
assert.equal(ago('2026-08-11T11:59:30Z'), 'just now');
assert.equal(ago('2026-08-11T11:58:00Z'), '2 minutes ago');
assert.equal(ago('2026-08-11T11:00:00Z'), '1 hour ago');
assert.equal(ago('2026-08-09T12:00:00Z'), '2 days ago');
assert.equal(ago('not a date'), '', 'a bad timestamp renders nothing, not NaN');

console.log('All logic checks passed.');
