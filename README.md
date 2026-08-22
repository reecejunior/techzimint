# Techzim Startups

A feed where African founders post what they're building — with screenshots and
video — and the community likes, comments and reviews. That engagement is what
produces the leaderboard.

Built with Next.js 16 (App Router), CSS Modules, and Firebase (Firestore +
anonymous auth) — all on Firebase's free Spark plan.

---

## Firebase setup

The app reads and writes everything through Firestore. Several of these steps
are in the Firebase console and can't be done from the codebase.

Everything here works on the **free Spark plan**. Firebase Storage is the one
service that now requires the paid Blaze plan, so image uploads go to ImgBB
instead — free, no card. See [Media](#media) for the one key that needs setting.

### 1. Create the Firestore database

Console → **Build → Firestore Database → Create database**. Any region is fine;
pick the one closest to your users.

If you plan to seed in the next step without loosening rules, start it in
**test mode**. Otherwise start in production mode and read step 3 first.

### 2. Enable anonymous sign-in

Console → **Build → Authentication → Sign-in method → Anonymous → Enable**.

Likes, comments and reviews are attributed to an anonymous account, so one person
gets one like per post without being forced to register. It must be **Anonymous**
specifically — enabling Email/Password or Google instead will not satisfy it.

### 3. Deploy rules and indexes

```bash
firebase deploy --only firestore
```

Two files matter here:

- [`firestore.rules`](firestore.rules) — who can read and write what.
- [`firestore.indexes.json`](firestore.indexes.json) — the composite index the
  feed's collection-group query needs. Without it the feed shows an error with a
  one-click link to create it.

You can also paste the rules into the console under **Firestore → Rules**.

> The Firebase API key in `.env.local` is a public identifier, not a secret — it
> ships in the browser bundle by design. These rule files are what actually
> protect your data, so don't skip this step.

### 4. Load the starting content

```bash
npm run seed
```

Writes 10 startups, a launch post for each, their reviews, and 5 reviewer
profiles. Safe to re-run: every document has a fixed id, so a second run
overwrites rather than duplicating. Existing startups are skipped unless you pass
`--force` — which is also how you migrate them after a schema change.

The seed writes directly to `startups/` and `reviewers/`, which the rules in
step 3 forbid by design — it writes records it doesn't own, and reviewer
profiles are editorial. Publish
[`firestore.seed.rules`](firestore.seed.rules) first, run the seed, then publish
[`firestore.rules`](firestore.rules) again. The seeding ruleset opens only the
collections the seed touches, so likes and reviews stay protected even during
that window.

### 5. Run it

```bash
npm run dev
```

### Stuck?

```bash
npm run check:firebase
```

Tells you which of the steps above is still incomplete, and what to change in the
console for each one. Firebase's own error codes are precise but don't say which
setting produced them.

Until the steps above are done the app doesn't show a blank page or a raw
Firebase error — it renders the specific setup step that's still missing.

---

## Environment

`.env.local` holds the Firebase web config (already filled in for the
`techziminteractive` project) and the ImgBB upload key. For a different project,
copy `.env.example` and fill the Firebase values from **Project settings →
General → Your apps → SDK setup**.

| Variable | Needed for |
| --- | --- |
| `NEXT_PUBLIC_FIREBASE_*` | Everything — the app won't load without them |
| `NEXT_PUBLIC_IMGBB_API_KEY` | Uploading images from a device. Optional; without it founders paste links |

---

## Data model

| Path | Contents |
| --- | --- |
| `startups/{id}` | The startup profile, plus its rolled-up engagement counters |
| `startups/{id}/posts/{id}` | A feed entry — text, images, video |
| `startups/{id}/posts/{id}/comments/{id}` | Conversation under a post |
| `startups/{id}/reviews/{id}` | A structured review (3 rated dimensions) |
| `likes/{postId}__{uid}` | One like. The composite id makes double-liking unrepresentable |
| `helpful/{reviewId}__{uid}` | One "helpful" mark on a review |
| `reviewers/{id}` | Editorial reviewer profiles |

### How the feed works

The feed is a single `collectionGroup('posts')` query. Startup identity (name,
slug, logo) is **denormalised onto each post** so a card renders without a
lookup to its parent, and `approved` is mirrored from the parent so the query
can filter in one pass. Joining to the parent per post would mean one extra read
per card — which a feed cannot afford.

That denormalisation is the one place this schema trades duplication for speed;
everything else is derived.

### Scoring

Engagement in the feed produces the ranking. Weights reflect effort:

| Signal | Weight | Why |
| --- | --- | --- |
| Like | 3 | One tap |
| Comment | 5 | Costs a sentence |
| Review | 12 | Costs thought |
| Avg rating | 40 | Quality, not volume |

A like on a post increments the post *and* rolls up to its startup in the same
transaction, so a startup total can never disagree with the sum of its posts.

Three things are deliberately **not** stored:

- **Score** is computed from the counters on read, so it can't drift away from
  the engagement behind it.
- **Rank** is a property of the whole set, so it's assigned after the collection
  loads rather than saved per-startup where it would go stale as soon as anyone
  else got a like.
- **Averages** are derived from rating sums ÷ review count, so the numbers on the
  leaderboard always match the reviews on the detail page.

Weekly and monthly like counters are stamped with the period they belong to
(`weekKey`, `monthKey`). A counter from a past period reads as zero and resets on
the next write, so the two windows stay honest without a scheduled job.

### Media

Founders upload images straight from their device. Firebase Storage requires the
paid Blaze plan, so files go to **ImgBB** instead — free, no card, and it accepts
browser uploads directly.

**Setup:** get a key at [api.imgbb.com](https://api.imgbb.com) → *Get API key*,
put it in `.env.local` as `NEXT_PUBLIC_IMGBB_API_KEY`, restart the dev server.
Without it the app still works — the upload button hides and founders paste
links instead.

The key ships in the browser bundle. That is unavoidable for a client-side
upload and is the same trade every unsigned-upload host makes: it is a *quota*
key, not an account credential, so the worst case is someone burning your upload
allowance. Rotate it in the ImgBB dashboard if that happens.

**Images are downscaled before upload** — longest edge 1600px, re-encoded at 82%
quality. A phone camera JPEG is routinely 4–8 MB, which is a slow upload on a
mobile connection and pointless for a card that renders at a fraction of that
width. GIFs pass through untouched, since re-encoding one through a canvas would
flatten the animation, and the original is kept whenever the re-encode doesn't
actually come out smaller.

Pasting a link stays available: a founder whose screenshots already live
somewhere shouldn't have to re-upload them. Every pasted link is loaded before
it is accepted, which proves the URL really resolves to an image (extensions lie,
and plenty of CDNs omit them) and measures it, so the feed can reserve the right
space and not jump as pictures arrive.

**Video is always a YouTube or Vimeo link.** Hosting video is a different order
of cost, and both platforms already solve playback and bandwidth. Embed ids are
resolved on write so the player never parses a URL at render time, and embedded
players are click-to-load: mounting an iframe per card would pull a third-party
bundle for every post whether or not anyone watches.

`PostImage.path` is unused but kept in the shape, so moving to Firebase Storage
later changes only the picker — no data migration.

### Moderation

**Reactive, not pre-approval.** Submissions go live immediately — a queue nobody
clears is a feed nobody posts to.

To take something down, set its `status` to `rejected` in the console (and the
launch post's `approved` to `false`). It disappears from the feed and the
leaderboard, but its page still loads and says it was removed.

Clients cannot change `status` themselves: it is frozen on update in
[`firestore.rules`](firestore.rules), so only the console — or the admin panel
below — can reject or restore. New startups also can't arrive pre-loaded with
likes, reviews, or a "Startup of the Week" badge — the create rule pins all
of those.

If spam ever becomes a real problem, flipping back to pre-approval is two lines:
`status: 'approved'` → `'pending'` in `submitStartup`, and `approved: true` →
`false` on the launch post.

#### Admin panel (`/admin`)

A quiet, unlinked route for one real account to reject or restore any startup,
and to remove any post or comment. Everyone else on the site is anonymous;
this is the one place a real Firebase Auth (email/password) identity is used.

- **Sign-in**: real email/password, checked client-side against `ADMIN_EMAIL`
  in [`src/lib/firebase.ts`](src/lib/firebase.ts) for the UI, and against the
  same email as a literal in `firestore.rules`' `isAdmin()` for the actual
  enforcement. The two are not linked — if the email ever changes, update both.
- **Reject/restore**: toggles a startup's `status` between `approved` and
  `rejected` (with an optional reason, visible only in the admin panel) and
  mirrors it onto every post under that startup.
- **Remove any post or comment**: the same delete controls founders see on
  their own posts, but visible to the admin on everyone's.
- **No rejection notifications** — founders aren't told; this was a deliberate
  scope cut, not an oversight.

**Held inert on purpose.** The whole feature ships gated by a kill switch,
`adminActive()` at the top of `firestore.rules`, currently hardcoded to
`false`. With it off, `isAdmin()` evaluates to false for anyone, including a
correctly-signed-in admin — the panel renders, but every write it attempts is
still rejected by the rules. To go live: create the admin's Firebase Auth
user (Email/Password, matching `ADMIN_EMAIL`), flip `adminActive()` to `true`,
and republish rules:

```bash
firebase deploy --only firestore:rules
```

### Weekly standings

```bash
npm run snapshot-ranks
```

Records the current positions as each startup's previous rank and appends a point
to its rank-history chart. This is what the ▲▼ movement arrows compare against,
so run it once a week (by hand or from any scheduler). Nothing breaks if you
don't — the arrows just keep comparing to the last time it ran.

---

## Notifications

Three delivery paths, all free, all opt-in from the bell in the nav:

| Path | How it fires | Reaches |
| --- | --- | --- |
| In-app bell | Live Firestore listener | Same browser only |
| Email | `/api/cron/notify-daily`, 06:00 UTC | Any device |
| Web push | `/api/push/notify`, triggered by the client the moment a notification is written | That browser, tab open or not |

**Two gotchas worth knowing before debugging this.**

*Both* notification indexes are required, and they are **not** interchangeable —
`firestore.indexes.json` declares `(recipientId ASC, createdAt ASC)` for the send
jobs and `(recipientId ASC, createdAt DESC)` for the bell. Firestore treats a
direction change as a different index, so creating one leaves the other query
failing. The bell surfaces that failure in the dropdown rather than rendering an
empty state, because "nothing yet" reading as "no notifications" is exactly how
this stayed hidden the first time.

`vercel.json` deliberately schedules only **two** crons, each at most daily.
Vercel's Hobby plan caps both the count and the frequency, and a config it
rejects fails the entire deployment — not just the cron. `/api/cron/notify-instant`
therefore exists but is unscheduled: `notify-daily` sweeps the `instant` opt-ins
too, so nobody is silently dropped, and genuinely instant delivery is push's job.
Neither config file takes comments — both schemas reject unknown keys — which is
why this note lives here.

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:logic` | Checks the pure ranking, scoring, period and slug logic |
| `npm run check:firebase` | Reports which Firebase setup steps are still pending |
| `npm run seed` | Loads starting content. `-- --force` also migrates existing docs |
| `npm run snapshot-ranks` | Records this week's standings |
| `npm run backfill:has-video` | Stamps `hasVideo` on existing posts so `/videos` can find them |
| `npm run find:duplicate-reviews` | Reports authors with more than one review per startup |
| `npm run remove:duplicate-reviews` | Keeps the newest review per author, rolls back the rest |

---

## Design notes

Everything is a token in [`globals.css`](src/app/globals.css). If you need a
value that isn't on one of these scales, the scale is probably right and the
instinct is wrong.

**Type.** One family — the system stack, which is SF Pro on Apple platforms and
Segoe UI on Windows. Hierarchy comes from size and weight, never from a second
typeface. Tracking is optical: large type is tightened (`--track-display`,
`-0.022em`), small type is left alone or opened slightly (`--track-micro`).
Applying one flat letter-spacing to everything is what makes type look
generated. Body is 17px.

**Space.** A 4pt grid, `--s-1` through `--s-20`. Section rhythm comes from
`--s-16` / `--s-20`; component padding from `--s-3` to `--s-6`.

**Shape.** Radius grows with the surface it wraps — `--r-xs` (6px) on badges,
`--r-sm` (8px) on controls, `--r-md` (12px) on cards, `--r-lg` (18px) on the
featured panel. `--r-pill` is reserved for the primary call to action and the
filter chips, so a pill always means "this is an action".

**Colour.** Warm-neutral ink so the orange stays the only saturated thing on
screen. Use the semantic aliases (`--brand`, `--brand-text`, `--surface`,
`--hairline`), not raw ramp steps.

Two rules that are easy to get wrong:

- **`--brand` (#E85D04) is 3.5:1 on white.** Fine for fills, icons and large
  display type; it fails AA for body text. Use `--brand-text` (#C24C03, 4.9:1).
- **Translucent white on orange must be composited before you trust it.**
  White at 72% over `--orange-600` measures 3.25:1, not the 4.9:1 the raw colour
  suggests. That's why `--brand-panel` is the deeper `--orange-700`.

Two rules worth knowing before adding UI:

- **`--brand` (#E85D04) is 3.5:1 on white** — fine for fills, icons, borders and
  large display type, but it fails WCAG AA for body text. Use `--brand-text`
  (#C94F03, 4.56:1) for orange text at normal sizes.
- **White text needs `--brand-panel` or `--orange-600`/`700` behind it**, not
  `--brand`. That's why the hero strip and callouts use the darker gradient.
