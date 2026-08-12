/**
 * Reports which Firebase setup steps are done and which are still pending.
 *
 *   npm run check:firebase
 *
 * Firebase's own error codes are accurate but say nothing about what to do, so
 * this maps each one to the console setting behind it. Read-only apart from a
 * single scratch document, which it deletes.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { initializeApp } from 'firebase/app';
import {
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const here = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  try {
    const raw = readFileSync(resolve(here, '..', '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {
    /* Reported by the config check below. */
  }
}

loadEnv();

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ok = s => `  [32mPASS[0m  ${s}`;
const bad = s => `  [31mFAIL[0m  ${s}`;
const note = s => `        ${s}`;

if (!config.apiKey || !config.projectId) {
  console.log(bad('Config — .env.local is missing or incomplete.'));
  console.log(note('Copy .env.example to .env.local and fill it from the Firebase console:'));
  console.log(note('Project settings -> General -> Your apps -> SDK setup and configuration.'));
  process.exit(1);
}

console.log(`\nChecking Firebase project "${config.projectId}"\n`);
console.log(ok('Config — .env.local loaded.'));

const app = initializeApp(config);
const db = getFirestore(app);
const results = { auth: false, read: false, write: false, seeded: false, feed: false };

/* ── 1. Anonymous auth ──
   The app signs visitors in anonymously so a person gets one vote per startup
   without being made to register. Enabling some *other* provider (email, Google)
   does not satisfy this — it has to be Anonymous specifically.

   Note: the /v1/projects endpoint does not reliably list enabled providers, so
   don't infer anything from its response. The sign-up attempt is the real test. */
try {
  await signInAnonymously(getAuth(app));
  console.log(ok('Auth — anonymous sign-in works. Voting and reviewing are enabled.'));
  results.auth = true;
} catch (e) {
  if (e.code === 'auth/admin-restricted-operation' || e.code === 'auth/configuration-not-found') {
    console.log(bad('Auth — anonymous sign-in is refused, so voting and reviewing will fail.'));
    console.log(note('Console -> Build -> Authentication -> Sign-in method -> Anonymous.'));
    console.log(note('Toggle it on, then click SAVE in the dialog — the toggle alone'));
    console.log(note('does not persist. The list should then read "Anonymous  Enabled".'));
    console.log(note(''));
    console.log(note('Enabling Email/Password or Google instead will not help: the app'));
    console.log(note('asks for an anonymous session specifically.'));
    console.log(note(''));
    console.log(note('If it already reads Enabled, check the console project selector —'));
    console.log(note(`this app points at project id "${config.projectId}".`));
  } else {
    console.log(bad(`Auth — ${e.code}: ${e.message}`));
  }
}

/* ── 2. Reads ── */
let startupCount = 0;
try {
  const snap = await getDocs(collection(db, 'startups'));
  startupCount = snap.size;
  console.log(ok(`Read — the startups collection is readable (${startupCount} document(s)).`));
  results.read = true;
  results.seeded = startupCount > 0;
} catch (e) {
  if (e.code === 'permission-denied') {
    console.log(bad('Read — rules are rejecting reads, so the leaderboard will stay empty.'));
    console.log(note('Deploy the project rules:  firebase deploy --only firestore:rules'));
    console.log(note('or paste firestore.rules into Console -> Firestore -> Rules.'));
  } else if (/NOT_FOUND|not-found/.test(`${e.code}${e.message}`)) {
    console.log(bad('Read — this project has no Firestore database.'));
    console.log(note('Console -> Build -> Firestore Database -> Create database.'));
  } else {
    console.log(bad(`Read — ${e.code}: ${e.message}`));
  }
}

/* ── 3. Writes (what the seed needs) ── */
const probeRef = doc(db, 'startups', 'zz-setup-probe');
try {
  await setDoc(probeRef, { probe: true, at: new Date().toISOString() });
  console.log(ok('Write — seeding is possible right now.'));
  results.write = true;
  try {
    await deleteDoc(probeRef);
  } catch {
    console.log(note('Could not remove the scratch doc; delete startups/zz-setup-probe by hand.'));
  }
} catch (e) {
  if (e.code === 'permission-denied') {
    if (results.seeded) {
      console.log(ok('Write — blocked by rules, which is correct once seeding is done.'));
      results.write = true;
    } else {
      console.log(bad('Write — rules reject writes, so `npm run seed` cannot load the content.'));
      console.log(note('Temporarily allow writes, seed, then restore the locked-down rules:'));
      console.log(note('  1. Console -> Firestore -> Rules, set:  allow read, write: if true;'));
      console.log(note('  2. npm run seed'));
      console.log(note('  3. firebase deploy --only firestore:rules   (restores firestore.rules)'));
    }
  } else {
    console.log(bad(`Write — ${e.code}: ${e.message}`));
  }
}

/* ── 4. The feed ──
   One collection-group query over every startup's posts. It needs both a rule
   at the group scope and a composite index, and the two failures look nothing
   alike — so name which one is missing. */
let postCount = 0;
try {
  const snap = await getDocs(
    query(
      collectionGroup(db, 'posts'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5),
    ),
  );
  postCount = snap.size;
  results.feed = true;
  if (postCount === 0) {
    console.log(bad('Feed — the query works, but there are no posts yet.'));
    console.log(note('Run `npm run seed --force` to give existing startups a launch post.'));
  } else {
    console.log(ok(`Feed — readable, ${postCount} recent post(s).`));
  }
} catch (e) {
  const msg = `${e.code ?? ''} ${e.message ?? ''}`;
  if (/index/i.test(msg)) {
    console.log(bad('Feed — the posts index has not been built.'));
    const link = String(e.message).match(/https:\/\/console\.firebase\.google\.com\/\S+/)?.[0];
    console.log(note('Deploy it:  firebase deploy --only firestore:indexes'));
    if (link) console.log(note(`or create it here:\n        ${link}`));
  } else if (e.code === 'permission-denied') {
    console.log(bad('Feed — rules reject the posts query, so the feed will be empty.'));
    console.log(note('firestore.rules needs the collection-group rule:'));
    console.log(note("  match /{path=**}/posts/{postId} { allow read: if true; }"));
    console.log(note('Publish the current firestore.rules and this clears.'));
  } else {
    console.log(bad(`Feed — ${e.code}: ${e.message}`));
  }
}

/* ── Summary ── */
console.log('');
if (results.auth && results.read && results.feed && postCount > 0) {
  console.log('Everything is ready. Run `npm run dev` and the feed will be live.\n');
} else if (results.feed && postCount === 0) {
  console.log('Next step: `npm run seed --force` to create the launch posts.\n');
} else if (results.seeded && !results.auth) {
  console.log('Content is loaded, but nobody can like or review until auth is fixed.\n');
} else {
  console.log('Fix the FAIL lines above, then run this check again.\n');
}

process.exit(0);
