/**
 * Records this week's standings.
 *
 *   npm run snapshot-ranks
 *
 * Ranks themselves are computed live from vote counts, so nothing here affects
 * today's leaderboard. What this writes is the *history*: it stores the current
 * position as `prevRankWeek` / `prevRankMonth` (which is what the ▲▼ movement
 * arrows compare against) and appends a point to each startup's rank chart.
 *
 * Run it once a week — by hand, or from any scheduler.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, writeBatch, doc } from 'firebase/firestore';

const here = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const raw = readFileSync(resolve(here, '..', '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* Fall through to the check below. */
  }
}

loadEnv();

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId) {
  console.error('Missing Firebase config. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

function isoWeek(d = new Date()) {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  return Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

const HISTORY_POINTS = 8;

async function main() {
  const db = getFirestore(initializeApp(config));
  const snap = await getDocs(collection(db, 'startups'));

  const rows = snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(s => s.status === 'approved');

  if (!rows.length) {
    console.log('No approved startups to rank.');
    process.exit(0);
  }

  const rank = (key, out) => {
    [...rows]
      .sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0) || String(a.name).localeCompare(String(b.name)))
      .forEach((s, i) => {
        s[out] = i + 1;
      });
  };
  rank('weeklyVotes', '_week');
  rank('monthlyVotes', '_month');

  const label = `W${isoWeek()}`;
  const batch = writeBatch(db);

  for (const s of rows) {
    const history = Array.isArray(s.rankHistory) ? s.rankHistory : [];
    // Replace the point if this week was already recorded, so re-running is safe.
    const next = history.filter(p => p.week !== label).concat({ week: label, rank: s._week });

    batch.update(doc(db, 'startups', s.id), {
      prevRankWeek: s._week,
      prevRankMonth: s._month,
      rankHistory: next.slice(-HISTORY_POINTS),
    });
  }

  await batch.commit();
  console.log(`Recorded ${label} standings for ${rows.length} startups.`);
  process.exit(0);
}

main().catch(err => {
  console.error('Snapshot failed:', err.message);
  process.exit(1);
});
