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

/* ─── Techzim's Choice ────────────────────────────────────── */

/** One editorial pick. Order in the array is the rank shown (1st = index 0). */
export interface TechzimChoicePick {
  startupId: string;
  /** A short editorial line on why it's picked. Optional — an empty string
   *  just shows the pick with no commentary. */
  note: string;
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
