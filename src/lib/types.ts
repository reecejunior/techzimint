export type Category = 'Fintech' | 'Agritech' | 'Logistics' | 'Edtech' | 'Healthtech' | 'E-commerce' | 'SaaS';
export type Region = 'Harare' | 'Bulawayo' | 'Mutare' | 'Gweru' | 'Pan-African';

export const categories: Category[] = ['Fintech', 'Agritech', 'Logistics', 'Edtech', 'Healthtech', 'E-commerce', 'SaaS'];
export const regions: Region[] = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Pan-African'];

/* ─── Media ───────────────────────────────────────────────── */

export interface PostImage {
  /** A public image URL. Firebase Storage needs the paid plan, so media is
   *  linked rather than uploaded. */
  url: string;
  /** Reserved for a future Storage upload, so adding one needs no migration. */
  path?: string;
  /** Measured when the link is added, so the feed can reserve space. */
  width?: number;
  height?: number;
}

export interface PostVideo {
  /** `embed` for YouTube/Vimeo; `upload` is reserved for a Storage file. */
  kind: 'upload' | 'embed';
  url: string;
  path?: string;
  /** YouTube/Vimeo id, resolved on write so the player needs no parsing. */
  embedId?: string;
  provider?: 'youtube' | 'vimeo';
}

/* ─── Feed ────────────────────────────────────────────────── */

/**
 * One entry in the feed. Lives at `startups/{startupId}/posts/{postId}`.
 *
 * Startup identity is denormalised onto the post so the feed can render a card
 * from a single collection-group query, with no per-post parent lookup.
 */
export interface Post {
  id: string;
  startupId: string;
  startupName: string;
  startupSlug: string;
  startupLogoUrl: string;
  startupLogoInitials: string;
  startupLogoColor: string;

  authorId: string;
  authorName: string;

  /** Post copy. The first post of a startup is its launch announcement. */
  body: string;
  images: PostImage[];
  video: PostVideo | null;

  likeCount: number;
  commentCount: number;

  /** Mirrors the parent startup's status so the feed can filter in one query. */
  approved: boolean;
  isLaunch: boolean;
  /** Denormalised `video != null`, because Firestore cannot query for the
   *  absence of a field — /videos filters on this in one query instead. */
  hasVideo: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  startupId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
  /** The top-level comment this replies to, or null. One level of nesting —
   *  replying to a reply attaches to that reply's own parent, not to it. */
  parentId: string | null;
  /** True when authorId matched the startup's ownerId at write time. */
  isFounder: boolean;
}

/* ─── Reviews ─────────────────────────────────────────────── */

/** A structured review. Lives in `startups/{id}/reviews/{reviewId}`. */
export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  isFounder: boolean;
  isTrustedTester: boolean;
  ratingUX: number;
  ratingUsefulness: number;
  ratingWouldPay: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
}

export interface RankHistory {
  week: string;
  rank: number;
}

/* ─── Startups ────────────────────────────────────────────── */

export interface Startup {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  category: Category;
  region: Region;
  website: string;
  demo?: string;
  apk?: string;
  founders: string[];

  /** Logo image URL. Falls back to the monogram when empty. */
  logoUrl: string;
  logoInitials: string;
  logoColor: string;

  /** uid of whoever submitted it — may post updates to this startup. */
  ownerId: string;

  /** Aggregates, maintained transactionally as engagement arrives. */
  postCount: number;
  likeCount: number;
  weeklyLikes: number;
  monthlyLikes: number;
  commentCount: number;
  reviewCount: number;
  ratingSumUX: number;
  ratingSumUsefulness: number;
  ratingSumWouldPay: number;

  /** Derived on read — never stored. */
  avgUX: number;
  avgUsefulness: number;
  avgWouldPay: number;
  score: number;
  scoreWeek: number;
  scoreMonth: number;

  /** Derived by sorting the whole set — never stored. */
  rankWeek: number;
  rankMonth: number;
  rankDeltaWeek: number;
  rankDeltaMonth: number;
  prevRankWeek: number;
  prevRankMonth: number;

  isStartupOfWeek: boolean;
  isTrending: boolean;
  rankHistory: RankHistory[];
  status: 'approved' | 'pending' | 'rejected';
  /** Set by an admin when rejecting. Empty otherwise. */
  rejectionReason: string;
  submittedAt: string;
}

export interface Reviewer {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarInitials: string;
  avatarColor: string;
  reviewCount: number;
  helpfulCount: number;
  isTrustedTester: boolean;
  joinedAt: string;
}

/* ─── Form payloads ───────────────────────────────────────── */

export interface StartupSubmission {
  name: string;
  tagline: string;
  description: string;
  website: string;
  demo: string;
  apk: string;
  founders: string;
  category: string;
  region: string;
  /** Logo and launch-post media, as links. */
  logo: PostImage | null;
  images: PostImage[];
  video: PostVideo | null;
}

export interface PostDraft {
  body: string;
  images: PostImage[];
  video: PostVideo | null;
}

/**
 * What the owner may change about their own listing after it's live. Name,
 * slug, category and region are deliberately absent — identity and curation
 * stay fixed once submitted, both here and in firestore.rules.
 */
export interface StartupEditInput {
  tagline: string;
  description: string;
  website: string;
  demo: string;
  apk: string;
  founders: string;
  /** null clears the logo back to the initials fallback. */
  logo: PostImage | null;
}

export interface ReviewDraft {
  ratingUX: number;
  ratingUsefulness: number;
  ratingWouldPay: number;
  comment: string;
  authorName: string;
}

/** Reviews carry their parent startup when listed on a profile. */
export interface ReviewWithStartup extends Review {
  startupId: string;
  startupName: string;
  startupSlug: string;
}

/* ─── Notifications ───────────────────────────────────────── */

/**
 * `reply` fires when the founder replies to your comment — attributed to the
 * startup, not the founder's typed name, since that's the point of it.
 * `like`, `comment` and `review` fire for the founder when their startup
 * gets one, attributed to whoever did it.
 */
export type NotificationType = 'reply' | 'like' | 'comment' | 'review';

export interface Notification {
  id: string;
  recipientId: string;
  type: NotificationType;
  startupId: string;
  startupSlug: string;
  startupName: string;
  /** Who triggered it. Empty for `like` — likes carry no name at all. */
  actorName: string;
  /** The comment/reply/review text, truncated. Empty for `like`. */
  snippet: string;
  read: boolean;
  createdAt: string;
}

export type NotificationEmailMode = 'instant' | 'daily' | 'off';

/* ─── Community ───────────────────────────────────────────── */

export type CommunityKind = 'question' | 'showcase' | 'poll';

/** One choice on a poll post. Set once at creation (2–6 of them) and never
 *  edited after — there is deliberately no vote-count field here. See the
 *  comment above subscribeToCommunityPollVotes in firestore.ts for why
 *  tallies are computed live from the vote collection instead of being
 *  denormalised onto this array. */
export interface PollOption {
  id: string;
  label: string;
}

/**
 * One post in the developer community — a question/help thread or a
 * show-and-tell/build-in-public post. Lives at `communityPosts/{id}`, a
 * top-level collection independent of `startups`: a community post never
 * belongs to a startup and never touches anything the ranking system reads
 * (no `score`, `rank`, `rankHistory`, `scoreWeek`, etc).
 *
 * Open to any signed-in visitor, not just startup owners or founders — the
 * same anonymous-auth session the rest of the site already uses
 * (ensureSignedIn()), never a separate account system.
 */
export interface CommunityPost {
  id: string;
  kind: CommunityKind;
  title: string;
  body: string;
  tags: string[];

  authorId: string;
  authorName: string;
  authorAvatar: string;

  likeCount: number;
  commentCount: number;

  /** Questions only — a showcase or poll is never "answered". */
  isAnswered: boolean;
  /** The comment marked as the accepted answer, or null. Only the asker may
   *  set this, and only on a `kind: 'question'` post — see markCommunityAnswer. */
  acceptedCommentId: string | null;

  /** `kind: 'poll'` only — empty for a question or showcase. Set once at
   *  creation; votes live entirely in the separate `communityPollVotes`
   *  collection (see castCommunityPollVote / subscribeToCommunityPollVotes). */
  pollOptions: PollOption[];

  /** Mirrors the moderation parity startup posts already have: posts go live
   *  immediately, and an admin can pull one out of the feed after the fact
   *  by flipping this rather than deleting it outright. */
  approved: boolean;
  createdAt: string;
}

/** Mirrors Comment's shape (see above) — same denormalised author fields,
 *  same one-level-of-nesting `parentId` convention. */
export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  body: string;
  createdAt: string;
  /** The top-level comment this replies to, or null. One level of nesting,
   *  same rule as Comment: replying to a reply attaches to that reply's own
   *  parent, not to it. */
  parentId: string | null;
  /** True once the post's own author has marked this as the accepted answer
   *  to their question. Always false on a showcase post's comments. */
  isAccepted: boolean;
  /** Likes on this individual reply — a separate counter from the post's own
   *  likeCount, so a good answer can surface without touching ranking. */
  likeCount: number;
}

/** What the composer collects to create a CommunityPost. */
export interface CommunityPostDraft {
  kind: CommunityKind;
  title: string;
  body: string;
  tags: string[];
  /** Required when `kind === 'poll'` (2–6 options); ignored otherwise. */
  pollOptions?: PollOption[];
}

/**
 * One visitor's vote on one poll. Lives at
 * `communityPollVotes/{postId}__{uid}` — same deterministic-id trick as
 * `likes`/`communityLikes`, so a second vote from the same visitor is
 * naturally an update (or delete) of this same doc, never a duplicate.
 * There is no per-post subcollection here: a flat top-level collection keeps
 * the `where('postId', '==', …)` tally query a single-field equality filter,
 * which Firestore indexes automatically.
 */
export interface CommunityPollVote {
  id: string;
  postId: string;
  uid: string;
  optionId: string;
  createdAt: string;
}

/**
 * One visitor's opt-in for getting notifications by email too, not just in
 * the bell. Doc id is their own anonymous uid — same one-per-visitor trick
 * `likes` and `reviews` use.
 */
export interface NotificationPref {
  email: string;
  mode: NotificationEmailMode;
  /** Cursor for the send job — only notifications created after this are
   *  eligible for the next email, so nobody gets the same one twice. */
  lastNotifiedAt: string;
}

/* ─── Hackathon tracker suggestions ───────────────────────────
   The hackathon-winners tracker's own dataset
   (src/app/community/hackathon-tracker/data.ts) is a static, built-in file,
   not a database table — it started as a one-off research compilation. This
   collection is the visible, auditable intake queue that replaces scattered
   WhatsApp/email corrections: a visitor submits a correction from the
   tracker page, an admin reviews it from /admin, and an approved one is then
   folded into the data file in a follow-up update. Approving a suggestion
   here does not, by itself, change what the tracker page shows. */

export type TrackerSuggestionStatus = 'pending' | 'applied' | 'dismissed';

/** One submitted correction or addition for the hackathon tracker. Lives at
 *  `trackerSuggestions/{id}`. */
export interface TrackerSuggestion {
  id: string;
  /** The tracker row this is about (a `Winner.id` from the static dataset),
   *  or '' for a general note — a whole missing programme, say — that isn't
   *  tied to one row. */
  winnerId: string;
  /** Denormalised at submission time so the admin queue reads without a
   *  join back into the tracker's static dataset. */
  winnerName: string;
  note: string;
  /** A link backing up the correction, or '' if none was given. */
  evidenceUrl: string;
  /** How the submitter wants to be known in the queue, or '' to stay
   *  anonymous — never a real account name, since tracker visitors use the
   *  same anonymous session as the rest of the site. */
  submitterName: string;
  submittedBy: string;
  status: TrackerSuggestionStatus;
  createdAt: string;
  reviewedAt: string | null;
  /** The admin's own note on what they did with it ("folded into the data
   *  update on 2026-10-25", "couldn't confirm, left as is"). */
  reviewNote: string;
}
