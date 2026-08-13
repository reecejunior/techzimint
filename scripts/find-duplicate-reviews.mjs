/**
 * Reports every (startup, author) pair that has more than one review —
 * the gap `addReview` used to have, before reviews got a deterministic,
 * one-per-author document id like `likes` already had.
 *
 *   npm run find:duplicate-reviews
 *
 * Read-only: `reviews` is publicly readable, so this needs no auth and
 * makes no writes. It only reports; nothing here deletes anything.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import { collectionGroup, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';

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
  console.log('Config — .env.local is missing or incomplete. Copy .env.example and fill it in.');
  process.exit(1);
}

const app = initializeApp(config);
const db = getFirestore(app);

const snap = await getDocs(collectionGroup(db, 'reviews'));
console.log(`Scanned ${snap.size} review(s) across every startup.\n`);

/** authorId+startupId -> review docs */
const groups = new Map();
for (const d of snap.docs) {
  const startupId = d.ref.parent.parent?.id ?? '(unknown)';
  const data = d.data();
  const authorId = String(data.authorId ?? '(no authorId)');
  const key = `${startupId}__${authorId}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ id: d.id, startupId, authorId, ...data });
}

const duplicates = [...groups.values()].filter(g => g.length > 1);

if (duplicates.length === 0) {
  console.log('No duplicates found — every author has at most one review per startup.\n');
  process.exit(0);
}

console.log(`Found ${duplicates.length} (startup, author) pair(s) with more than one review:\n`);

const startupNameCache = new Map();
async function startupName(id) {
  if (startupNameCache.has(id)) return startupNameCache.get(id);
  const s = await getDoc(doc(db, 'startups', id));
  const name = s.exists() ? String(s.data().name ?? id) : `${id} (missing)`;
  startupNameCache.set(id, name);
  return name;
}

for (const group of duplicates) {
  const name = await startupName(group[0].startupId);
  console.log(`▸ ${name}  —  author ${group[0].authorId}  —  ${group.length} reviews`);
  for (const r of group.sort((a, b) => String(a.createdAt) < String(b.createdAt) ? -1 : 1)) {
    const created = r.createdAt?.toDate ? r.createdAt.toDate().toISOString() : String(r.createdAt ?? '?');
    console.log(
      `    review ${r.id}  by "${r.authorName ?? 'Anonymous'}"  ` +
        `UX=${r.ratingUX} Use=${r.ratingUsefulness} Pay=${r.ratingWouldPay}  ` +
        `at ${created}  ` +
        `— "${String(r.comment ?? '').slice(0, 60)}${String(r.comment ?? '').length > 60 ? '…' : ''}"`,
    );
  }
  console.log('');
}

console.log(
  'Each startup\'s reviewCount/ratingSum* already includes every one of these —\n' +
    'the averages currently overweight whoever left more than one review.\n' +
    'Decide which review per group should stay (usually the newest), then remove the\n' +
    'rest and roll back their rating contribution. Nothing here does that automatically —\n' +
    'run it again after you decide, or ask for a follow-up script that applies a fix.\n',
);
process.exit(0);
