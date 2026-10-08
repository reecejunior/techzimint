# Growth & product ideas

Dated log of growth/product thinking from the daily-improve run. Newest entries at the bottom.

## 2026-09-29

**Target audience**
- Zimbabwean/African founders — come to launch, get feedback, and track how their product ranks against peers.
- Angel investors/VCs and corporate innovation teams — come to scout what's gaining traction before it's on their radar elsewhere.
- Job seekers and students — come to find startups that are actually hiring or worth interning at, and to see what's being built locally.
- Diaspora and media (incl. Techzim itself) — come for a quick pulse on the local tech scene to write about or point family/contacts toward.

**Growth ideas**
- Add an OG/share image generator per startup page (name, tagline, score) so links shared to WhatsApp/Twitter/LinkedIn look like a real card instead of a bare URL — cheap virality lever given founders already share their own listing.
- Publish a public, crawlable "best of" or "trending this month" page with real SEO copy (not just the live feed) — the current pages are client-rendered lists with little unique text for search engines to index.
- Reach out to 2-3 university innovation hubs/accelerators (e.g. HIT, UZ innovation hub, Impact Hub Harare) to get their cohorts to submit as a batch — a handful of founders bringing their own networks compounds faster than organic signups.
- Turn the existing weekly digest email into something forwardable/shareable on its own (a public web version of each week's digest at a stable URL) so it can be linked from social instead of only living in inboxes.
- Add a lightweight "claim it's you" prompt on startup cards with no owner activity in 30+ days, nudging the community to tag the founder on social — keeps listings alive without needing outbound effort.

**Feature backlog**
- Filter/search by funding stage or team size on `/startups` (beyond the category/region/sort filters that exist today).
- A "claim your listing" flow for founders who didn't originally submit a startup but want posting rights (currently ownership is fixed to whoever submitted it).
- An embeddable "Featured on Techzim Startups" badge/widget founders can drop on their own site, linking back here.
- A public RSS or JSON feed of the main feed/leaderboard for third-party sites or newsletters to consume.
- An investor-facing "shortlist" tool — let a signed-in visitor bookmark a private list of startups across sessions, distinct from the public leaderboard.

## 2026-09-30

**Target audience**
- Zimbabwean/African founders — come to launch, get feedback, and track how their product ranks against peers.
- Angel investors/VCs and corporate innovation teams — come to scout what's gaining traction before it's on their radar elsewhere.
- Job seekers and students — come to find startups that are actually hiring or worth interning at, and to see what's being built locally.
- Diaspora and media (incl. Techzim itself) — come for a quick pulse on the local tech scene to write about or point family/contacts toward.

**Growth ideas**
- Add a "New this week" strip on the homepage feed for startups with little or no engagement yet — the current feed and leaderboard both reward existing traction, so a brand-new founder gets buried on day one with nothing to show friends.
- Cross-post "Startup of the Week" and Techzim's Choice picks into Techzim's own main-site editorial calendar/newsletter — that audience already exists, so this is distribution the site doesn't have to build from scratch.
- Add JSON-LD structured data (Product/Organization schema) to startup detail pages — a small, purely technical change that makes listings eligible for richer Google search results with no design or content work.
- Give each category its own shareable mini-leaderboard (e.g. a stable URL for "Top Fintech startups in Zimbabwe") — a specific, niche page is something a journalist or investor will actually link to, where the full directory is too broad to cite.
- A short "this startup's week" recap nudging founders back with concrete numbers (new likes/comments/reviews since their last visit) — distinct from the in-app notification bell, which only reports individual events, not a trend.

**Feature backlog**
- A per-category leaderboard page (top-ranked startups within Fintech, Agritech, etc.), not just the single cross-category leaderboard that exists today.
- A founder-facing engagement-over-time chart (likes/comments/reviews trend) on a startup's own page, alongside the rank-history chart that already exists.
- Search-as-you-type autocomplete for startup names from the main nav, rather than only the in-page search on `/startups`.
- A launch-anniversary badge (30/90/365 days live) as a light, time-based recognition distinct from the existing Trending/Startup of the Week badges.
- A one-off CSV/JSON export of the full directory for researchers and journalists, distinct from a live RSS/API feed.

## 2026-10-01

**Target audience**
- Zimbabwean/African founders — come to launch, get feedback, and track how their product ranks against peers.
- Angel investors/VCs and corporate innovation teams — come to scout what's gaining traction before it's on their radar elsewhere.
- Job seekers and students — come to find startups that are actually hiring or worth interning at, and to see what's being built locally.
- Diaspora and media (incl. Techzim itself) — come for a quick pulse on the local tech scene to write about or point family/contacts toward.

**Growth ideas**
- Give each founder a personal, UTM-tagged share link for their own listing (distinct from the generic share button that exists today) with a simple visit count shown only to them — turns "share your startup" from a one-off ask into something they keep coming back to check.
- Pitch a recurring "founder spotlight" slot to external Zimbabwean tech newsletters/podcasts (not Techzim's own channels, which are already covered in the 2026-09-30 entry) — syndicated distribution the site doesn't own but can feed with almost no extra work.
- Auto-generate a shareable "milestone" card (100 likes, 50 reviews, etc.) the moment a startup crosses a round-number threshold, prompting the founder to post it — engagement-triggered, unlike the time-based launch-anniversary badge already logged.
- Build simple region-specific landing pages (e.g. "Startups in Bulawayo") with real SEO copy, distinct from the category-specific leaderboard pages already logged — region is a second, separate axis locals and diaspora actually search on.

**Feature backlog**
- A "Compare startups" tool: pick 2-3 listings and see their ratings and stats side by side — useful for an investor or job seeker choosing between similar products, distinct from the investor shortlist/bookmark idea already logged.
- An optional "Open roles" field on a startup's own listing so job seekers can see who's hiring directly from the directory, without leaving the site.
- A Shona/Ndebele toggle for the site's chrome and page copy, broadening reach beyond English-only visitors.
- A startup "perks marketplace" — listed companies can offer each other (or the community) discounts/credits, giving founders a reason to check the directory even when not promoting their own listing.

## 2026-10-02

**Target audience**
- Zimbabwean/African founders — come to launch, get feedback, and track how their product ranks against peers.
- Angel investors/VCs and corporate innovation teams — come to scout what's gaining traction before it's on their radar elsewhere.
- Job seekers and students — come to find startups that are actually hiring or worth interning at, and to see what's being built locally.
- Diaspora and media (incl. Techzim itself) — come for a quick pulse on the local tech scene to write about or point family/contacts toward.

**Growth ideas**
- Add a one-tap "Share to WhatsApp" action with a prefilled message (name, tagline, link) distinct from the existing generic Share2 button/native share sheet — WhatsApp is the dominant sharing channel locally, and a generic `navigator.share` sheet buries it a tap deeper than it deserves.
- Build a white-label cohort sub-page for accelerator/hub partners (e.g. `/startups?cohort=hit-2026`) listing just their batch, that the hub can link from their own site — a concrete asset to hand partners instead of only the outreach ask already logged.
- Auto-draft a monthly "movers" recap post from `rankDeltaMonth` (who climbed, who's new, who's trending) pitched to local tech press as linkable narrative content — distinct from the raw JSON-LD/mini-leaderboard/CSV-export ideas already logged, which are data, not a story.
- Add a lightweight listing-completeness nudge ("Add a demo link to stand out — 3 of 5 details filled in") shown only to the founder on their own startup page, to lift thin listings without gating submission on it up front.

**Feature backlog**
- A "Most improved this month" badge computed from the existing `rankDeltaMonth` field — reuses data already tracked for the rank chart, distinct from the existing Trending/Startup-of-the-Week/anniversary badge ideas.
- Bulk admin actions (approve/reject several pending submissions in one pass) in `AdminClient` — internal moderation tooling, not a founder-facing feature.
- Per-category email digest preference (opt into just Fintech updates, say) rather than today's single all-or-nothing instant/daily toggle.
- A cross-startup public changelog/activity timeline (every update, every startup, filterable by category) — a directory-wide view of the Updates thread that today only exists per-startup.

## 2026-10-08

**Target audience**
- Zimbabwean/African founders — come to launch, get feedback, and track how their product ranks against peers.
- Angel investors/VCs and corporate innovation teams — come to scout what's gaining traction before it's on their radar elsewhere.
- Job seekers and students — come to find startups that are actually hiring or worth interning at, and to see what's being built locally.
- Diaspora and media (incl. Techzim itself) — come for a quick pulse on the local tech scene to write about or point family/contacts toward.

**Growth ideas**
- Send the weekly digest as a push notification too, reusing the push infrastructure already built for instant/daily in-app alerts — reaches visitors who enabled push but never handed over an email, a channel the digest doesn't touch today.
- Surface a small "help these launches get their first review" module pointing engaged visitors at listings with the fewest reviews, rather than only the most-liked ones the default sort already favours — spreads review coverage instead of compounding attention on the same leaders.
- A twice-yearly "Startup Awards" announcement cycle (mid-year and year-end) as a recurring press hook — distinct from the monthly "movers" recap already logged, which is a smaller, data-driven story rather than a seasonal event.
- A founder referral mechanic — a tracked parameter on the submit link that credits the referring founder, surfaced as a lightweight "brought N founders here" badge — turns founders who already share their own listing into an acquisition channel for new listings too.

**Feature backlog**
- A per-startup "Follow" button for any visitor, not just the founder, to opt into that one listing's update notifications — distinct from the founder-only posting/notification system that exists today.
- A read-only, rate-limited developer API exposing the directory/leaderboard as JSON for third parties to build on — a step beyond the plain public RSS/JSON feed already logged, with real auth and usage limits.
- An automatic "why did my rank move" breakdown on the startup page — which of likes, comments or reviews actually drove the week-over-week change — building on the existing rank-history chart, which shows the number but not the cause.
- A region filter alongside the category filter on the directory (shipped today — see the PR this entry travelled with); next natural step is a combined "category + region" shareable URL so a filtered view can be linked directly, not just reconstructed by hand.
