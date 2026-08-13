export type Category = 'Fintech' | 'Agritech' | 'Logistics' | 'Edtech' | 'Healthtech' | 'E-commerce' | 'SaaS';
export type Region = 'Harare' | 'Bulawayo' | 'Mutare' | 'Gweru' | 'Pan-African';

export const categories: Category[] = ['Fintech', 'Agritech', 'Logistics', 'Edtech', 'Healthtech', 'E-commerce', 'SaaS'];
export const regions: Region[] = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Pan-African'];

export type Period = 'week' | 'month';

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
