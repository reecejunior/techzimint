/**
 * Checks every startup logo and update image link, to see which no longer
 * load and why. Read-only.
 *
 *   node scripts/check-images.mjs
 *
 * Each link is fetched twice: as a plain request, and as a browser on the site
 * would (with the site as Referer). A link that works the first way but not the
 * second is being blocked by the image host's hotlink protection. Writes the
 * results to image-check.json. Needs the NEXT_PUBLIC_FIREBASE_* values in
 * .env.local.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeApp } from 'firebase/app';
import { collection, collectionGroup, getDocs, getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

const SITE = 'https://startups.techzim.co.zw/';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  for (const line of readFileSync(resolve(root, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch { /* checked below */ }
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
if (!config.apiKey || !config.projectId) {
  console.error('.env.local is missing the NEXT_PUBLIC_FIREBASE_* values.');
  process.exit(1);
}

const app = initializeApp(config);
await signInAnonymously(getAuth(app)).catch(() => {});
const db = getFirestore(app);

const links = [];
const startups = await getDocs(collection(db, 'startups'));
const names = new Map();
for (const d of startups.docs) {
  const x = d.data();
  names.set(d.id, x.name ?? d.id);
  if (x.logoUrl) links.push({ startup: x.name ?? d.id, kind: 'logo', url: String(x.logoUrl) });
}
const posts = await getDocs(collectionGroup(db, 'posts'));
for (const d of posts.docs) {
  const x = d.data();
  for (const img of Array.isArray(x.images) ? x.images : []) {
    if (img?.url) links.push({ startup: x.startupName ?? names.get(x.startupId) ?? '?', kind: 'update image', url: String(img.url) });
  }
}

async function probe(url, referer) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        ...(referer ? { Referer: referer } : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    const type = res.headers.get('content-type') ?? '';
    await res.body?.cancel();
    return { status: res.status, image: res.ok && type.startsWith('image/'), type };
  } catch (err) {
    return { status: 0, image: false, type: String(err.cause?.code ?? err.name) };
  }
}

const results = [];
let i = 0;
for (const l of links) {
  i++;
  const plain = await probe(l.url, null);
  const fromSite = await probe(l.url, SITE);
  const verdict = plain.image && fromSite.image ? 'ok'
    : plain.image && !fromSite.image ? 'blocked on other sites (hotlink protection)'
    : 'dead or not an image';
  results.push({ ...l, host: (() => { try { return new URL(l.url).host; } catch { return 'bad url'; } })(), verdict, plain, fromSite });
  process.stdout.write(`\r${i}/${links.length} checked`);
}
console.log('');

writeFileSync(resolve(root, 'image-check.json'), JSON.stringify(results, null, 2));
const summary = {};
for (const r of results) {
  const k = `${r.host} | ${r.verdict}`;
  summary[k] = (summary[k] ?? 0) + 1;
}
console.table(summary);
const bad = results.filter(r => r.verdict !== 'ok');
console.log(`${results.length} links, ${bad.length} not loading. Full list in image-check.json.`);
process.exit(0);
