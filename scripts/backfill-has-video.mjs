/**
 * Stamps `hasVideo` onto every existing post.
 *
 *   npm run backfill:has-video
 *
 * The /videos page queries `where('hasVideo','==',true)`, and Firestore can't
 * match documents where the field is simply absent — so posts created before
 * the flag existed are invisible to that query until this runs.
 *
 * Needs firestore.seed.rules published first (posts aren't client-writable
 * beyond like/comment counters, which is correct for everyone except this).
 * Publish it, run this, then republish firestore.rules immediately.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import { collectionGroup, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

const here = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const raw = readFileSync(resolve(here, '..', '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* Reported below. */
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
  console.log('Config — .env.local is missing or incomplete.');
  process.exit(1);
}

const db = getFirestore(initializeApp(config));

const snap = await getDocs(collectionGroup(db, 'posts'));
console.log(`Scanned ${snap.size} post(s).\n`);

let stamped = 0;
let withVideo = 0;
let skipped = 0;

for (const d of snap.docs) {
  const data = d.data();
  const shouldHave = Boolean(data.video && typeof data.video.url === 'string' && data.video.url);

  if (data.hasVideo === shouldHave) {
    skipped += 1;
    continue;
  }

  await updateDoc(d.ref, { hasVideo: shouldHave });
  stamped += 1;
  if (shouldHave) withVideo += 1;
}

console.log(`Stamped ${stamped} post(s) — ${withVideo} of them carry a video.`);
console.log(`${skipped} already correct.`);
console.log('\nRepublish firestore.rules now — this needed the open seed rules to write posts.\n');
process.exit(0);
