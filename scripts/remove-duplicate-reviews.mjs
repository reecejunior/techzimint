/**
 * Removes the extra reviews found by `find-duplicate-reviews.mjs`.
 *
 *   npm run remove:duplicate-reviews
 *
 * Policy: within each (startup, author) group, the single most recent
 * review is kept — matching what `addReview` now does going forward — and
 * every older one from that same author is deleted. Each startup's
 * `reviewCount` and rating sums are rolled back by exactly what the deleted
 * reviews had contributed, so the average reflects only real, distinct
 * opinions afterward.
 *
 * Needs firestore.seed.rules published first (reviews are normally
 * undeletable by clients — `allow delete: if false` — which is correct for
 * everyone except this one cleanup). Publish it, run this, then republish
 * firestore.rules immediately.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import {
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  increment,
  updateDoc,
} from 'firebase/firestore';

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

function toMillis(v) {
  if (v?.toDate) return v.toDate().getTime();
  if (typeof v === 'string') return Date.parse(v) || 0;
  return 0;
}

const snap = await getDocs(collectionGroup(db, 'reviews'));

const groups = new Map();
for (const d of snap.docs) {
  const startupId = d.ref.parent.parent?.id;
  if (!startupId) continue;
  const data = d.data();
  const authorId = String(data.authorId ?? '');
  const key = `${startupId}__${authorId}`;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push({ ref: d.ref, startupId, ...data });
}

const duplicateGroups = [...groups.values()].filter(g => g.length > 1);

if (duplicateGroups.length === 0) {
  console.log('No duplicate reviews found — nothing to remove.\n');
  process.exit(0);
}

let totalDeleted = 0;

for (const group of duplicateGroups) {
  const sorted = [...group].sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
  const keep = sorted[sorted.length - 1];
  const remove = sorted.slice(0, -1);

  const deltaUX = remove.reduce((sum, r) => sum + (Number(r.ratingUX) || 0), 0);
  const deltaUsefulness = remove.reduce((sum, r) => sum + (Number(r.ratingUsefulness) || 0), 0);
  const deltaWouldPay = remove.reduce((sum, r) => sum + (Number(r.ratingWouldPay) || 0), 0);

  for (const r of remove) {
    await deleteDoc(r.ref);
    totalDeleted += 1;
  }

  const startupRef = doc(db, 'startups', keep.startupId);
  const startupSnap = await getDoc(startupRef);
  const startupName = startupSnap.exists() ? String(startupSnap.data().name ?? keep.startupId) : keep.startupId;

  await updateDoc(startupRef, {
    reviewCount: increment(-remove.length),
    ratingSumUX: increment(-deltaUX),
    ratingSumUsefulness: increment(-deltaUsefulness),
    ratingSumWouldPay: increment(-deltaWouldPay),
  });

  console.log(
    `${startupName}: removed ${remove.length} review(s) by author ${keep.authorId}, ` +
      `kept the one from ${new Date(toMillis(keep.createdAt) || Date.now()).toISOString()}.`,
  );
}

console.log(`\nDone — deleted ${totalDeleted} duplicate review(s) across ${duplicateGroups.length} group(s).`);
console.log('Republish firestore.rules now — this script needed the open seed rules to delete reviews.\n');
process.exit(0);
