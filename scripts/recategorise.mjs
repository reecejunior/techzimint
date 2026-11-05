/**
 * Moves startups to better-fitting categories, reviewed from the November 2026
 * export. Shows what it would change unless you pass --apply.
 *
 *   node scripts/recategorise.mjs            (preview, changes nothing)
 *   node scripts/recategorise.mjs --apply    (asks for an admin email and password)
 *
 * Each move only happens if the startup is still in the category it was
 * reviewed in, so a change someone made since then is never overwritten.
 * Needs the NEXT_PUBLIC_FIREBASE_* values in .env.local and the updated
 * firestore.rules (admins may change `category`).
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithEmailAndPassword } from 'firebase/auth';

const CHANGES = [
  { id: "iSJD9cQXZRM6NA05LZrf", name: "AdServeKit", from: "SaaS", to: "Marketing" },
  { id: "7jvFCAWetAruWAsYkpjF", name: "Bazaar AI", from: "SaaS", to: "Marketing" },
  { id: "u5SAai8vhAPlbXgCcONT", name: "Socialplod", from: "SaaS", to: "Marketing" },
  { id: "qhOrPrHBs0PRPP9FLcyu", name: "Mikana", from: "SaaS", to: "Marketing" },
  { id: "NK2LG9n5eVbF5Wd5hj9h", name: "BantuBuzz", from: "SaaS", to: "Marketing" },
  { id: "6bV9NFg9Zchc6fPrSskQ", name: "Africin", from: "SaaS", to: "Media & Entertainment" },
  { id: "qQgEnFyUQ57XDp5s7H43", name: "Feedcover", from: "SaaS", to: "Media & Entertainment" },
  { id: "WqBSmw4UiwPgoggt25Va", name: "ClubFrame", from: "SaaS", to: "Media & Entertainment" },
  { id: "NtuYoFAebuqMbOyZmXVY", name: "AttachCV", from: "SaaS", to: "Jobs & Careers" },
  { id: "sWQmJyNSaP243OF1AZha", name: "Attache", from: "SaaS", to: "Jobs & Careers" },
  { id: "cafPBe804pWwkNBDroli", name: "FitMyCV", from: "SaaS", to: "Jobs & Careers" },
  { id: "8IYFviDM7UAIO3tKf9KR", name: "Mabasa Resume Maker", from: "SaaS", to: "Jobs & Careers" },
  { id: "zHI3spI7YhZewTLztdvB", name: "ResumeZW", from: "SaaS", to: "Jobs & Careers" },
  { id: "AfL71vZT4GCa0jqMMZJv", name: "ResumeZW", from: "SaaS", to: "Jobs & Careers" },
  { id: "zlAdAmOMu3LqzvALyfQ8", name: "ZimVita", from: "SaaS", to: "Jobs & Careers" },
  { id: "Ynr78HNZ33wDg7HNCv51", name: "Pachena", from: "SaaS", to: "Jobs & Careers" },
  { id: "gclX38G5HSyv9jnSF08z", name: "NextMentor", from: "Edtech", to: "Jobs & Careers" },
  { id: "ixGopfoHkyWo5FMXs1I5", name: "EventMap Zimbabwe", from: "SaaS", to: "Events & Travel" },
  { id: "4ep8uggzG7BedOWfTiQb", name: "KoopyKwacho", from: "SaaS", to: "Events & Travel" },
  { id: "4oD8qGsGlIaSV3yoNZTu", name: "GuestPass", from: "SaaS", to: "Events & Travel" },
  { id: "qCmaUXsMMV37oR5ZCtNy", name: "PassPoint", from: "E-commerce", to: "Events & Travel" },
  { id: "7sb9EmbPUI2HEBbXOeXN", name: "Popoutshare", from: "E-commerce", to: "Events & Travel" },
  { id: "JDbi82f95vVoMhgN1gf5", name: "Zimplaces", from: "E-commerce", to: "Events & Travel" },
  { id: "ug95JKmYNLCfw0QP33oX", name: "DomionDesk", from: "SaaS", to: "Proptech" },
  { id: "RRUb19ExCZqioQrOGITr", name: "PropertyZone", from: "SaaS", to: "Proptech" },
  { id: "3Cm5M6ocBWPGWXjJoSVI", name: "Roja Scout", from: "E-commerce", to: "Proptech" },
  { id: "RAnyYAUbnoGFZs76XGUp", name: "PolarisAI", from: "SaaS", to: "AI" },
  { id: "paY5UMCv6bb8UJVwsfEa", name: "Rynaty AI", from: "SaaS", to: "AI" },
  { id: "EnVqm3pcqGTvFNbfgfVG", name: "XcellentAI", from: "SaaS", to: "AI" },
  { id: "P6kOfMDBDZiheXMSxHov", name: "Ngano", from: "SaaS", to: "AI" },
  { id: "0xt4FBeaItqcv8XzdhTW", name: "Rera", from: "SaaS", to: "AI" },
  { id: "JqdTxobRT2M3uI4jyCD6", name: "Gweta Online", from: "SaaS", to: "AI" },
  { id: "XYsgErkNYTH8Mu1bV3qx", name: "SimbaTasker", from: "SaaS", to: "Local services" },
  { id: "iqgUSfVJHAOinsxZprC2", name: "Tesha", from: "Logistics", to: "Local services" },
  { id: "ztu6ELZrg9ejYPj6buv5", name: "Zonke Finder", from: "E-commerce", to: "Local services" },
  { id: "0p7M9MbwF9VWBiY7JBnt", name: "Owana", from: "SaaS", to: "Local services" },
  { id: "O3g5gj5NDLEKkshiL0AI", name: "OneDomain", from: "SaaS", to: "Telecoms & Internet" },
  { id: "B59blpssiWzyhEGc65I7", name: "zwDomains", from: "SaaS", to: "Telecoms & Internet" },
  { id: "DvAmxS1HZCrt599CqLeT", name: "Reketa", from: "SaaS", to: "Telecoms & Internet" },
  { id: "EcLOGBGiy66i7pclURPW", name: "Vadziyivemoto", from: "SaaS", to: "Civic tech" },
  { id: "8c1588D7KM5PEZikfspN", name: "Bako Emergency Technologies", from: "Healthtech", to: "Civic tech" },
  { id: "krbmgtCLyY62IL4oVUWN", name: "Loadnow Africa Private Limited", from: "SaaS", to: "Logistics" },
  { id: "Q4DfA8bZC9mxIJtnqIjs", name: "Onilaz Group", from: "SaaS", to: "Edtech" },
];

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

function ask(question, hidden = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  if (hidden) {
    rl._writeToOutput = s => { if (!rl.muted) rl.output.write(s); };
  }
  return new Promise(res => {
    rl.question(question, answer => { rl.close(); if (hidden) process.stdout.write('\n'); res(answer.trim()); });
    if (hidden) rl.muted = true;
  });
}

const apply = process.argv.includes('--apply');
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

if (apply) {
  const email = await ask('Admin email: ');
  const password = await ask('Password (hidden): ', true);
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error('Sign-in failed:', err.code ?? err.message);
    process.exit(1);
  }
} else {
  await signInAnonymously(auth).catch(() => {});
}

let moved = 0, skipped = 0, failed = 0;
for (const c of CHANGES) {
  const ref = doc(db, 'startups', c.id);
  const snap = await getDoc(ref);
  const now = snap.exists() ? snap.data().category : null;
  if (now !== c.from) {
    console.log(`skip  ${c.name}: now "${now ?? 'missing'}", reviewed as "${c.from}"`);
    skipped++;
    continue;
  }
  if (!apply) {
    console.log(`would move  ${c.name}: ${c.from} -> ${c.to}`);
    continue;
  }
  try {
    await updateDoc(ref, { category: c.to });
    console.log(`moved  ${c.name}: ${c.from} -> ${c.to}`);
    moved++;
  } catch (err) {
    console.log(`FAILED ${c.name}: ${err.code ?? err.message}`);
    failed++;
  }
}
console.log(apply
  ? `\nDone: ${moved} moved, ${skipped} skipped, ${failed} failed.`
  : `\nPreview only. ${CHANGES.length - skipped} would move, ${skipped} skipped. Run with --apply to make the changes.`);
if (failed) console.log('If they failed with permission-denied, publish the updated firestore.rules first.');
process.exit(failed ? 1 : 0);
