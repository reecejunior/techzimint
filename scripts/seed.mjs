/**
 * Seeds Firestore with the starting content in seed-data.mjs.
 *
 *   npm run seed                    add anything missing
 *   npm run seed -- --force         also overwrite startups that already exist
 *   npm run seed -- --remove-demo   delete only the old fabricated fixtures
 *   npm run seed -- --purge         delete EVERY startup first, then seed
 *
 * --remove-demo is the safe cleanup: it targets the fixed ids the fabricated
 * data used (s1–s10, reviewers u1–u5) and leaves real submissions alone.
 * --purge deletes everything, including anything real people have posted.
 *
 * Safe to re-run: every document is written at a fixed id, so a second run
 * overwrites rather than duplicating.
 *
 * Requires .env.local, and Firestore rules that permit these writes — see the
 * Firebase setup section of README.md.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';

import { reviewers, startups } from './seed-data.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const force = process.argv.includes('--force');
const purge = process.argv.includes('--purge');
const purgeOnly = process.argv.includes('--purge-only');
const removeDemo = process.argv.includes('--remove-demo');

/**
 * The fabricated fixtures that shipped before real data existed. They had fixed
 * ids, so they can be removed precisely — unlike `--purge`, which would also
 * take out anything real people have submitted since.
 */
const LEGACY_DEMO_STARTUPS = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10'];
const LEGACY_DEMO_REVIEWERS = ['u1', 'u2', 'u3', 'u4', 'u5'];

/* Minimal .env.local reader — avoids a dependency just to read a few keys. */
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
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!config.apiKey || !config.projectId) {
  console.error('Missing Firebase config. Copy .env.example to .env.local and fill it in.');
  process.exit(1);
}

/** Matches periodKeys() in src/lib/ranking.ts. */
function periodKeys(d = new Date()) {
  const utc = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return {
    weekKey: `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`,
    monthKey: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`,
  };
}

/** Removes a startup and everything nested under it. */
async function deleteStartup(db, id) {
  const posts = await getDocs(collection(db, 'startups', id, 'posts'));
  for (const post of posts.docs) {
    const comments = await getDocs(
      collection(db, 'startups', id, 'posts', post.id, 'comments'),
    );
    await Promise.all(comments.docs.map(c => deleteDoc(c.ref)));
    await deleteDoc(post.ref);
  }
  const reviews = await getDocs(collection(db, 'startups', id, 'reviews'));
  await Promise.all(reviews.docs.map(r => deleteDoc(r.ref)));
  await deleteDoc(doc(db, 'startups', id));
}

async function main() {
  const db = getFirestore(initializeApp(config));
  const { weekKey, monthKey } = periodKeys();

  /* Surgical: only the old fabricated fixtures, leaving real submissions be. */
  if (removeDemo) {
    const all = await getDocs(collection(db, 'startups'));
    const present = new Set(all.docs.map(d => d.id));
    const targets = LEGACY_DEMO_STARTUPS.filter(id => present.has(id));

    console.log(`Removing ${targets.length} demo startup(s); leaving ${present.size - targets.length} other record(s) untouched.`);
    for (const id of targets) await deleteStartup(db, id);

    let goneReviewers = 0;
    for (const id of LEGACY_DEMO_REVIEWERS) {
      try {
        await deleteDoc(doc(db, 'reviewers', id));
        goneReviewers += 1;
      } catch {
        /* Already gone. */
      }
    }
    if (goneReviewers) console.log(`Removed ${goneReviewers} fictional reviewer profile(s).`);
  }

  /* Nuclear: everything, including anything real people submitted. */
  if (purge || purgeOnly) {
    const all = await getDocs(collection(db, 'startups'));
    console.log(`Purging ALL ${all.size} startup(s), including any real submissions…`);
    for (const d of all.docs) await deleteStartup(db, d.id);

    const oldReviewers = await getDocs(collection(db, 'reviewers'));
    await Promise.all(oldReviewers.docs.map(r => deleteDoc(r.ref)));
    if (oldReviewers.size) console.log(`Removed ${oldReviewers.size} reviewer profile(s).`);

    if (purgeOnly) {
      console.log('Purged everything — no re-seed performed (--purge-only).');
      process.exit(0);
    }
  }

  const existing = new Set();
  if (!force && !purge && !purgeOnly) {
    const snap = await getDocs(collection(db, 'startups'));
    snap.forEach(d => existing.add(d.id));
  }

  const batch = writeBatch(db);
  let startupCount = 0;
  let postCount = 0;
  let skipped = 0;

  for (const s of startups) {
    const { id, postImages, postVideo, ...fields } = s;

    if (existing.has(id)) {
      skipped += 1;
      continue;
    }

    // Every counter starts at zero: the leaderboard should only ever reflect
    // engagement that actually happened.
    batch.set(doc(db, 'startups', id), {
      ...fields,
      founders: fields.founders ?? [],
      logoUrl: fields.logoUrl ?? '',
      ownerId: '',
      weekKey,
      monthKey,
      postCount: 1,
      likeCount: 0,
      weeklyLikes: 0,
      monthlyLikes: 0,
      commentCount: 0,
      reviewCount: 0,
      ratingSumUX: 0,
      ratingSumUsefulness: 0,
      ratingSumWouldPay: 0,
      prevRankWeek: 0,
      prevRankMonth: 0,
      isStartupOfWeek: false,
      isTrending: false,
      rankHistory: [],
      status: 'approved',
      submittedAt: Timestamp.now(),
    });
    startupCount += 1;

    // A listing post so the startup appears in the feed. Founders replace this
    // with their own updates once they claim the page.
    batch.set(doc(db, 'startups', id, 'posts', `${id}-listing`), {
      startupId: id,
      startupName: fields.name,
      startupSlug: fields.slug,
      startupLogoUrl: fields.logoUrl ?? '',
      startupLogoInitials: fields.logoInitials,
      startupLogoColor: fields.logoColor,
      authorId: '',
      authorName: fields.name,
      body: fields.description,
      images: postImages ?? [],
      video: postVideo ?? null,
      likeCount: 0,
      commentCount: 0,
      approved: true,
      isLaunch: true,
      createdAt: Timestamp.now(),
    });
    postCount += 1;
  }

  for (const r of reviewers) {
    batch.set(doc(db, 'reviewers', r.id), {
      ...r,
      reviewCount: 0,
      helpfulCount: 0,
      joinedAt: Timestamp.now(),
    });
  }

  await batch.commit();

  console.log(
    `Seeded ${startupCount} startups and ${postCount} listing post(s)` +
      (reviewers.length ? `, ${reviewers.length} reviewers.` : '. No reviews or ratings — those only come from real users.'),
  );
  if (skipped) {
    console.log(`Skipped ${skipped} that already exist. Use --force to overwrite, or --purge to start clean.`);
  }
  process.exit(0);
}

main().catch(err => {
  console.error('\nSeeding failed:', err.message);
  if (String(err.code).includes('permission-denied')) {
    console.error(
      '\nFirestore rejected the write. Publish firestore.seed.rules, run the seed,\n' +
        'then publish firestore.rules again — see README.md.',
    );
  }
  if (String(err.message).includes('NOT_FOUND') || String(err.code).includes('not-found')) {
    console.error(
      '\nThis project has no Firestore database yet. Create one in the Firebase\n' +
        'console under Build → Firestore Database → Create database.',
    );
  }
  process.exit(1);
});
