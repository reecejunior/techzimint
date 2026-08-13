import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  startAfter,
  Timestamp,
  where,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { ADMIN_EMAIL, ensureSignedIn, getDb } from './firebase';
import {
  computeScore,
  initialsOf,
  parseVideoUrl,
  periodKeys,
  slugify,
  withRanks,
} from './ranking';
import type {
  Category,
  Comment,
  Post,
  PostDraft,
  PostVideo,
  Region,
  Review,
  ReviewDraft,
  Reviewer,
  ReviewWithStartup,
  Startup,
  StartupSubmission,
  PostImage,
} from './types';

export { periodKeys, slugify, withRanks } from './ranking';

export const FEED_PAGE_SIZE = 12;

function toIso(value: unknown, fallback = ''): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return fallback;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function mapImages(value: unknown): PostImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(i => i && typeof i.url === 'string')
    .map(i => ({
      url: String(i.url),
      path: i.path ? String(i.path) : undefined,
      width: typeof i.width === 'number' ? i.width : undefined,
      height: typeof i.height === 'number' ? i.height : undefined,
    }));
}

function mapVideo(value: unknown): PostVideo | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as DocumentData;
  if (typeof v.url !== 'string' || !v.url) return null;
  return {
    kind: v.kind === 'embed' ? 'embed' : 'upload',
    url: String(v.url),
    path: v.path ? String(v.path) : undefined,
    embedId: v.embedId ? String(v.embedId) : undefined,
    provider: v.provider === 'vimeo' ? 'vimeo' : v.provider === 'youtube' ? 'youtube' : undefined,
  };
}

/* ─── Mapping ─────────────────────────────────────────────── */

function mapStartup(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): Startup {
  const d = snap.data() ?? {};
  const { weekKey, monthKey } = periodKeys();

  const reviewCount = num(d.reviewCount);
  const likeCount = num(d.likeCount);
  const commentCount = num(d.commentCount);
  // A counter stamped with a past period is not this period's count.
  const weeklyLikes = d.weekKey === weekKey ? num(d.weeklyLikes) : 0;
  const monthlyLikes = d.monthKey === monthKey ? num(d.monthlyLikes) : 0;

  const avgOf = (sum: unknown) => (reviewCount > 0 ? num(sum) / reviewCount : 0);
  const avgUX = avgOf(d.ratingSumUX);
  const avgUsefulness = avgOf(d.ratingSumUsefulness);
  const avgWouldPay = avgOf(d.ratingSumWouldPay);
  const avgOverall = reviewCount > 0 ? (avgUX + avgUsefulness + avgWouldPay) / 3 : 0;

  return {
    id: snap.id,
    slug: String(d.slug ?? snap.id),
    name: String(d.name ?? 'Untitled'),
    tagline: String(d.tagline ?? ''),
    description: String(d.description ?? ''),
    category: (d.category ?? 'SaaS') as Category,
    region: (d.region ?? 'Harare') as Region,
    website: String(d.website ?? ''),
    demo: d.demo || undefined,
    apk: d.apk || undefined,
    founders: Array.isArray(d.founders) ? d.founders.map(String) : [],

    logoUrl: String(d.logoUrl ?? ''),
    logoInitials: String(d.logoInitials ?? initialsOf(String(d.name ?? 'AN'))),
    logoColor: String(d.logoColor ?? '#E85D04'),
    ownerId: String(d.ownerId ?? ''),

    postCount: num(d.postCount),
    likeCount,
    weeklyLikes,
    monthlyLikes,
    commentCount,
    reviewCount,
    ratingSumUX: num(d.ratingSumUX),
    ratingSumUsefulness: num(d.ratingSumUsefulness),
    ratingSumWouldPay: num(d.ratingSumWouldPay),

    avgUX,
    avgUsefulness,
    avgWouldPay,
    score: computeScore({ likes: likeCount, comments: commentCount, reviews: reviewCount, avgOverall }),
    scoreWeek: computeScore({ likes: weeklyLikes, comments: commentCount, reviews: reviewCount, avgOverall }),
    scoreMonth: computeScore({ likes: monthlyLikes, comments: commentCount, reviews: reviewCount, avgOverall }),

    // Placeholders — assigned by withRanks() once the whole set is known.
    rankWeek: 0,
    rankMonth: 0,
    rankDeltaWeek: 0,
    rankDeltaMonth: 0,
    prevRankWeek: num(d.prevRankWeek),
    prevRankMonth: num(d.prevRankMonth),

    isStartupOfWeek: Boolean(d.isStartupOfWeek),
    isTrending: Boolean(d.isTrending),
    rankHistory: Array.isArray(d.rankHistory)
      ? d.rankHistory.map((r: DocumentData) => ({ week: String(r.week), rank: num(r.rank) }))
      : [],
    status: (d.status ?? 'approved') as Startup['status'],
    rejectionReason: String(d.rejectionReason ?? ''),
    submittedAt: toIso(d.submittedAt),
  };
}

function mapPost(snap: QueryDocumentSnapshot<DocumentData>): Post {
  const d = snap.data();
  return {
    id: snap.id,
    startupId: String(d.startupId ?? snap.ref.parent.parent?.id ?? ''),
    startupName: String(d.startupName ?? 'Untitled'),
    startupSlug: String(d.startupSlug ?? ''),
    startupLogoUrl: String(d.startupLogoUrl ?? ''),
    startupLogoInitials: String(d.startupLogoInitials ?? '??'),
    startupLogoColor: String(d.startupLogoColor ?? '#E85D04'),
    authorId: String(d.authorId ?? ''),
    authorName: String(d.authorName ?? 'Anonymous'),
    body: String(d.body ?? ''),
    images: mapImages(d.images),
    video: mapVideo(d.video),
    likeCount: num(d.likeCount),
    commentCount: num(d.commentCount),
    approved: d.approved !== false,
    isLaunch: Boolean(d.isLaunch),
    createdAt: toIso(d.createdAt),
  };
}

function mapComment(snap: QueryDocumentSnapshot<DocumentData>): Comment {
  const d = snap.data();
  return {
    id: snap.id,
    postId: String(d.postId ?? ''),
    startupId: String(d.startupId ?? ''),
    authorId: String(d.authorId ?? ''),
    authorName: String(d.authorName ?? 'Anonymous'),
    authorAvatar: String(d.authorAvatar ?? '??'),
    body: String(d.body ?? ''),
    createdAt: toIso(d.createdAt),
  };
}

function mapReview(snap: QueryDocumentSnapshot<DocumentData>): Review {
  const d = snap.data();
  return {
    id: snap.id,
    authorId: String(d.authorId ?? ''),
    authorName: String(d.authorName ?? 'Anonymous'),
    authorAvatar: String(d.authorAvatar ?? '??'),
    isFounder: Boolean(d.isFounder),
    isTrustedTester: Boolean(d.isTrustedTester),
    ratingUX: num(d.ratingUX),
    ratingUsefulness: num(d.ratingUsefulness),
    ratingWouldPay: num(d.ratingWouldPay),
    comment: String(d.comment ?? ''),
    createdAt: toIso(d.createdAt),
    helpfulCount: num(d.helpfulCount),
  };
}

function mapReviewer(snap: QueryDocumentSnapshot<DocumentData>): Reviewer {
  const d = snap.data();
  return {
    id: snap.id,
    username: String(d.username ?? snap.id),
    name: String(d.name ?? 'Anonymous'),
    bio: String(d.bio ?? ''),
    avatarInitials: String(d.avatarInitials ?? '??'),
    avatarColor: String(d.avatarColor ?? '#E85D04'),
    reviewCount: num(d.reviewCount),
    helpfulCount: num(d.helpfulCount),
    isTrustedTester: Boolean(d.isTrustedTester),
    joinedAt: toIso(d.joinedAt),
  };
}

/* ─── Feed ────────────────────────────────────────────────── */

/**
 * Live feed of the newest posts across every approved startup.
 *
 * `approved` is denormalised onto each post so this is a single collection-group
 * query — joining to the parent startup to check its status would mean a read
 * per post, which the feed cannot afford.
 */
export function subscribeToFeed(
  onData: (posts: Post[]) => void,
  onError: (err: Error) => void,
  pageSize = FEED_PAGE_SIZE,
): () => void {
  const q = query(
    collectionGroup(getDb(), 'posts'),
    where('approved', '==', true),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  );
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(mapPost)),
    err => onError(err as Error),
  );
}

/** Next page of the feed. Cursor is the createdAt of the last post shown. */
export async function fetchFeedPage(
  afterIso: string,
  pageSize = FEED_PAGE_SIZE,
): Promise<Post[]> {
  const q = query(
    collectionGroup(getDb(), 'posts'),
    where('approved', '==', true),
    orderBy('createdAt', 'desc'),
    startAfter(Timestamp.fromDate(new Date(afterIso))),
    limit(pageSize),
  );
  const snap = await getDocs(q);
  return snap.docs.map(mapPost);
}

export function subscribeToStartupPosts(
  startupId: string,
  onData: (posts: Post[]) => void,
  onError: (err: Error) => void,
): () => void {
  // Oldest first: on a single startup's own page these read as one thread —
  // the launch post at the top, updates unfolding beneath it in the order
  // they happened. The cross-startup feed stays newest-first; that one is a
  // feed, not a story.
  const q = query(
    collection(getDb(), 'startups', startupId, 'posts'),
    orderBy('createdAt', 'asc'),
    limit(50),
  );
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(mapPost)),
    err => onError(err as Error),
  );
}

/* ─── Startups ────────────────────────────────────────────── */

export function subscribeToStartups(
  onData: (startups: Startup[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(collection(getDb(), 'startups'), where('status', '==', 'approved'));
  return onSnapshot(
    q,
    snap => onData(withRanks(snap.docs.map(mapStartup))),
    err => onError(err as Error),
  );
}

/**
 * One-shot read by slug, for server-rendered page metadata where a live
 * subscription has nothing to subscribe to. Rank fields stay at zero — ranks
 * only mean something relative to the full set.
 */
export async function fetchStartupBySlug(slug: string): Promise<Startup | null> {
  const q = query(collection(getDb(), 'startups'), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : mapStartup(snap.docs[0]);
}

export async function getReviewerByUsername(username: string): Promise<Reviewer | null> {
  const q = query(collection(getDb(), 'reviewers'), where('username', '==', username), limit(1));
  const snap = await getDocs(q);
  return snap.empty ? null : mapReviewer(snap.docs[0]);
}

/** Every review written by one author, across all startups. */
export async function getReviewsByAuthor(authorId: string): Promise<ReviewWithStartup[]> {
  const q = query(collectionGroup(getDb(), 'reviews'), where('authorId', '==', authorId));
  const snap = await getDocs(q);

  const rows = snap.docs.map(d => ({
    review: mapReview(d),
    startupId: d.ref.parent.parent?.id ?? '',
  }));

  // Resolve each parent startup once, not once per review.
  const parents = new Map<string, { name: string; slug: string }>();
  await Promise.all(
    [...new Set(rows.map(r => r.startupId))].filter(Boolean).map(async id => {
      const s = await getDoc(doc(getDb(), 'startups', id));
      if (s.exists()) parents.set(id, { name: String(s.data().name), slug: String(s.data().slug) });
    }),
  );

  return rows
    .map(({ review, startupId }) => ({
      ...review,
      startupId,
      startupName: parents.get(startupId)?.name ?? 'Unknown startup',
      startupSlug: parents.get(startupId)?.slug ?? '',
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function subscribeToReviews(
  startupId: string,
  onData: (reviews: Review[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(
    collection(getDb(), 'startups', startupId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(100),
  );
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(mapReview)),
    err => onError(err as Error),
  );
}

/* ─── Likes ───────────────────────────────────────────────── */

const likeId = (postId: string, uid: string) => `${postId}__${uid}`;

/** Live set of post ids the current visitor has liked. */
export function subscribeToMyLikes(
  onData: (postIds: Set<string>) => void,
  onError: (err: Error) => void,
): () => void {
  let stop = () => {};
  let cancelled = false;

  ensureSignedIn()
    .then(user => {
      if (cancelled) return;
      const q = query(collection(getDb(), 'likes'), where('uid', '==', user.uid));
      stop = onSnapshot(
        q,
        snap => onData(new Set(snap.docs.map(d => String(d.data().postId)))),
        err => onError(err as Error),
      );
    })
    .catch(err => onError(err as Error));

  return () => {
    cancelled = true;
    stop();
  };
}

/**
 * Adds or removes a like on a post, and rolls the change up to the startup that
 * owns it — all in one transaction, so the leaderboard total can never disagree
 * with the sum of its posts.
 *
 * @returns whether the post is liked after the call
 */
export async function toggleLike(startupId: string, postId: string): Promise<boolean> {
  const user = await ensureSignedIn();
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postRef = doc(db, 'startups', startupId, 'posts', postId);
  const ref_ = doc(db, 'likes', likeId(postId, user.uid));
  const { weekKey, monthKey } = periodKeys();

  return runTransaction(db, async tx => {
    const [likeSnap, startupSnap] = await Promise.all([tx.get(ref_), tx.get(startupRef)]);
    if (!startupSnap.exists()) throw new Error('That startup no longer exists.');
    const s = startupSnap.data();

    const sameWeek = s.weekKey === weekKey;
    const sameMonth = s.monthKey === monthKey;

    if (likeSnap.exists()) {
      tx.delete(ref_);
      tx.update(postRef, { likeCount: increment(-1) });
      tx.update(startupRef, {
        likeCount: increment(-1),
        // Only decrement a counter that belongs to the current period.
        weeklyLikes: sameWeek ? increment(-1) : 0,
        monthlyLikes: sameMonth ? increment(-1) : 0,
        weekKey,
        monthKey,
      });
      return false;
    }

    tx.set(ref_, {
      uid: user.uid,
      postId,
      startupId,
      weekKey,
      monthKey,
      createdAt: serverTimestamp(),
    });
    tx.update(postRef, { likeCount: increment(1) });
    tx.update(startupRef, {
      likeCount: increment(1),
      // A stale counter restarts at this like rather than continuing last week's.
      weeklyLikes: sameWeek ? increment(1) : 1,
      monthlyLikes: sameMonth ? increment(1) : 1,
      weekKey,
      monthKey,
    });
    return true;
  });
}

/* ─── Comments ────────────────────────────────────────────── */

export function subscribeToComments(
  startupId: string,
  postId: string,
  onData: (comments: Comment[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(
    collection(getDb(), 'startups', startupId, 'posts', postId, 'comments'),
    orderBy('createdAt', 'asc'),
    limit(200),
  );
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(mapComment)),
    err => onError(err as Error),
  );
}

export async function addComment(
  startupId: string,
  postId: string,
  body: string,
  authorName: string,
): Promise<void> {
  const text = body.trim();
  if (!text) throw new Error('Write something first.');

  const user = await ensureSignedIn();
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postRef = doc(db, 'startups', startupId, 'posts', postId);
  const commentRef = doc(collection(db, 'startups', startupId, 'posts', postId, 'comments'));
  const name = authorName.trim() || 'Anonymous';

  await runTransaction(db, async tx => {
    const postSnap = await tx.get(postRef);
    if (!postSnap.exists()) throw new Error('That post no longer exists.');

    tx.set(commentRef, {
      postId,
      startupId,
      authorId: user.uid,
      authorName: name,
      authorAvatar: initialsOf(name),
      body: text,
      createdAt: serverTimestamp(),
    });
    tx.update(postRef, { commentCount: increment(1) });
    tx.update(startupRef, { commentCount: increment(1) });
  });
}

/* ─── Reviews ─────────────────────────────────────────────── */

/**
 * Adds or replaces this visitor's review of a startup.
 *
 * The review's document id is the author's own uid, the same trick `likes`
 * uses to cap it at one per (startup, visitor) — a second submission
 * overwrites the first instead of stacking. `reviewCount` only moves the
 * first time; editing swaps the old rating out of the running sums and the
 * new one in, so the average never counts one person's opinion twice.
 */
export async function addReview(startupId: string, draft: ReviewDraft): Promise<void> {
  const user = await ensureSignedIn();
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const reviewRef = doc(db, 'startups', startupId, 'reviews', user.uid);

  await runTransaction(db, async tx => {
    const [startupSnap, existingSnap] = await Promise.all([tx.get(startupRef), tx.get(reviewRef)]);
    if (!startupSnap.exists()) throw new Error('That startup no longer exists.');

    const founders: string[] = Array.isArray(startupSnap.data().founders)
      ? startupSnap.data().founders
      : [];
    const authorName = draft.authorName.trim() || 'Anonymous';
    const isFounder = founders.some(f => f.toLowerCase() === authorName.toLowerCase());

    if (existingSnap.exists()) {
      const prev = existingSnap.data();
      tx.update(reviewRef, {
        authorName,
        authorAvatar: initialsOf(authorName),
        isFounder,
        ratingUX: draft.ratingUX,
        ratingUsefulness: draft.ratingUsefulness,
        ratingWouldPay: draft.ratingWouldPay,
        comment: draft.comment.trim(),
      });
      tx.update(startupRef, {
        ratingSumUX: increment(draft.ratingUX - num(prev.ratingUX)),
        ratingSumUsefulness: increment(draft.ratingUsefulness - num(prev.ratingUsefulness)),
        ratingSumWouldPay: increment(draft.ratingWouldPay - num(prev.ratingWouldPay)),
      });
      return;
    }

    tx.set(reviewRef, {
      authorId: user.uid,
      authorName,
      authorAvatar: initialsOf(authorName),
      isFounder,
      isTrustedTester: false,
      ratingUX: draft.ratingUX,
      ratingUsefulness: draft.ratingUsefulness,
      ratingWouldPay: draft.ratingWouldPay,
      comment: draft.comment.trim(),
      helpfulCount: 0,
      createdAt: serverTimestamp(),
    });

    tx.update(startupRef, {
      reviewCount: increment(1),
      ratingSumUX: increment(draft.ratingUX),
      ratingSumUsefulness: increment(draft.ratingUsefulness),
      ratingSumWouldPay: increment(draft.ratingWouldPay),
    });
  });
}

const helpfulId = (reviewId: string, uid: string) => `${reviewId}__${uid}`;

export function subscribeToMyHelpfulMarks(
  onData: (reviewIds: Set<string>) => void,
  onError: (err: Error) => void,
): () => void {
  let stop = () => {};
  let cancelled = false;

  ensureSignedIn()
    .then(user => {
      if (cancelled) return;
      const q = query(collection(getDb(), 'helpful'), where('uid', '==', user.uid));
      stop = onSnapshot(
        q,
        snap => onData(new Set(snap.docs.map(d => String(d.data().reviewId)))),
        err => onError(err as Error),
      );
    })
    .catch(err => onError(err as Error));

  return () => {
    cancelled = true;
    stop();
  };
}

export async function toggleHelpful(startupId: string, reviewId: string): Promise<boolean> {
  const user = await ensureSignedIn();
  const db = getDb();
  const reviewRef = doc(db, 'startups', startupId, 'reviews', reviewId);
  const markRef = doc(db, 'helpful', helpfulId(reviewId, user.uid));

  return runTransaction(db, async tx => {
    const markSnap = await tx.get(markRef);
    if (markSnap.exists()) {
      tx.delete(markRef);
      tx.update(reviewRef, { helpfulCount: increment(-1) });
      return false;
    }
    tx.set(markRef, { uid: user.uid, reviewId, startupId, createdAt: serverTimestamp() });
    tx.update(reviewRef, { helpfulCount: increment(1) });
    return true;
  });
}

/* ─── Posting ─────────────────────────────────────────────── */

function videoForWrite(video: PostVideo | null): PostVideo | null {
  if (!video) return null;
  if (video.kind === 'upload') return video;
  const parsed = parseVideoUrl(video.url);
  if (!parsed) throw new Error('That video link is not a YouTube or Vimeo URL.');
  return { kind: 'embed', url: video.url.trim(), ...parsed };
}

/**
 * Adds an update to an existing startup. Only the account that submitted the
 * startup may post to it.
 */
export async function addPost(startupId: string, draft: PostDraft): Promise<void> {
  const body = draft.body.trim();
  if (!body && draft.images.length === 0 && !draft.video) {
    throw new Error('Add some text, an image or a video.');
  }

  const user = await ensureSignedIn();
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postRef = doc(collection(db, 'startups', startupId, 'posts'));
  const video = videoForWrite(draft.video);

  await runTransaction(db, async tx => {
    const snap = await tx.get(startupRef);
    if (!snap.exists()) throw new Error('That startup no longer exists.');
    const s = snap.data();
    if (s.ownerId && s.ownerId !== user.uid) {
      throw new Error('Only the founder who submitted this startup can post updates.');
    }

    tx.set(postRef, {
      startupId,
      startupName: s.name,
      startupSlug: s.slug,
      startupLogoUrl: s.logoUrl ?? '',
      startupLogoInitials: s.logoInitials ?? '??',
      startupLogoColor: s.logoColor ?? '#E85D04',
      authorId: user.uid,
      authorName: Array.isArray(s.founders) && s.founders[0] ? s.founders[0] : String(s.name),
      body,
      images: draft.images,
      video,
      likeCount: 0,
      commentCount: 0,
      // Mirrors the parent so the feed can filter without a join.
      approved: s.status === 'approved',
      isLaunch: false,
      createdAt: serverTimestamp(),
    });
    tx.update(startupRef, { postCount: increment(1) });
  });
}

/**
 * Deletes a post. Only the founder who owns the startup may do this.
 *
 * Comments are removed first, outside the transaction — a transaction can
 * only touch documents it names ahead of time, and a subcollection's members
 * aren't known until they're queried. The post itself and the startup's
 * counters are then updated together, so the startup's totals never include
 * a post that no longer exists.
 *
 * Likes already cast on the post are left as orphaned records rather than
 * cascade-deleted: the same rule that stops one visitor reading another's
 * vote also stops this client from finding them, and once the post is gone
 * nothing will try to toggle a like against it again.
 *
 * Weekly/monthly like totals are left untouched. A post's lifetime like count
 * carries no record of which period each like landed in, so there is no
 * correct amount to subtract from this week's or this month's number.
 */
export async function deletePost(startupId: string, postId: string): Promise<void> {
  const user = await ensureSignedIn();
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postRef = doc(db, 'startups', startupId, 'posts', postId);

  const commentsSnap = await getDocs(
    collection(db, 'startups', startupId, 'posts', postId, 'comments'),
  );

  await runTransaction(db, async tx => {
    const [postSnap, startupSnap] = await Promise.all([tx.get(postRef), tx.get(startupRef)]);
    if (!postSnap.exists()) return; // Already gone — nothing to do.
    if (!startupSnap.exists()) throw new Error('That startup no longer exists.');

    const startup = startupSnap.data();
    if (startup.ownerId !== user.uid && user.email !== ADMIN_EMAIL) {
      throw new Error('Only the founder who posted this can delete it.');
    }

    const post = postSnap.data();
    for (const c of commentsSnap.docs) tx.delete(c.ref);
    tx.delete(postRef);
    tx.update(startupRef, {
      postCount: increment(-1),
      likeCount: increment(-num(post.likeCount)),
      commentCount: increment(-num(post.commentCount)),
    });
  });
}

/* ─── Submissions ─────────────────────────────────────────── */

const LOGO_COLORS = ['#E85D04', '#C24C03', '#9E3D02', '#D45100', '#B84808'];

/**
 * Creates a startup and its launch post together.
 *
 * Posts go live immediately. Moderation is reactive: `status` still exists, so
 * setting it to `rejected` pulls a startup out of the feed and the leaderboard
 * after the fact. Pre-approval was the alternative, and it costs more than it
 * saves — a queue nobody clears is a feed nobody posts to.
 *
 * @returns the slug the startup lives at
 */
export async function submitStartup(input: StartupSubmission): Promise<string> {
  const user = await ensureSignedIn();
  const db = getDb();
  const base = slugify(input.name);
  if (!base) throw new Error('Please give your startup a name.');

  const founders = input.founders
    .split(',')
    .map(f => f.trim())
    .filter(Boolean);

  // Keep slugs unique so two submissions can't collide on one URL. When the
  // readable slug is taken, suffix the new document id — one equality query,
  // and no composite index to deploy.
  const startupRef = doc(collection(db, 'startups'));
  const clash = await getDocs(
    query(collection(db, 'startups'), where('slug', '==', base), limit(1)),
  );
  const slug = clash.empty ? base : `${base}-${startupRef.id.slice(0, 5).toLowerCase()}`;

  const { weekKey, monthKey } = periodKeys();
  const logoInitials = initialsOf(input.name);
  const logoColor = LOGO_COLORS[base.length % LOGO_COLORS.length];
  const logoUrl = input.logo?.url ?? '';
  const video = videoForWrite(input.video);

  await setDoc(startupRef, {
    slug,
    name: input.name.trim(),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    category: input.category,
    region: input.region,
    website: input.website.trim(),
    demo: input.demo.trim(),
    apk: input.apk.trim(),
    founders,
    logoUrl,
    logoInitials,
    logoColor,
    ownerId: user.uid,
    postCount: 1,
    likeCount: 0,
    weeklyLikes: 0,
    monthlyLikes: 0,
    weekKey,
    monthKey,
    commentCount: 0,
    reviewCount: 0,
    ratingSumUX: 0,
    ratingSumUsefulness: 0,
    ratingSumWouldPay: 0,
    prevRankWeek: 0,
    prevRankMonth: 0,
    isStartupOfWeek: false,
    isTrending: false,
    rankHistory: [],
    status: 'approved',
    submittedAt: serverTimestamp(),
  });

  // The launch post is what appears in the feed once approved.
  await setDoc(doc(collection(db, 'startups', startupRef.id, 'posts')), {
    startupId: startupRef.id,
    startupName: input.name.trim(),
    startupSlug: slug,
    startupLogoUrl: logoUrl,
    startupLogoInitials: logoInitials,
    startupLogoColor: logoColor,
    authorId: user.uid,
    authorName: founders[0] ?? input.name.trim(),
    body: input.description.trim() || input.tagline.trim(),
    images: input.images,
    video,
    likeCount: 0,
    commentCount: 0,
    // Mirrors the startup's status so the feed can filter in one query.
    approved: true,
    isLaunch: true,
    createdAt: serverTimestamp(),
  });

  return slug;
}

/* ─── Admin moderation ────────────────────────────────────── */
/*
 * Gated by firestore.rules, not by this module — every function here writes
 * a shape that only passes the rules if the caller is signed in as
 * ADMIN_EMAIL, and that rule is itself held behind a kill switch until the
 * feature is activated. See firestore.rules' adminActive().
 */

/** Every startup regardless of status, newest submission first. */
export function subscribeToStartupsForAdmin(
  onData: (startups: Startup[]) => void,
  onError: (err: Error) => void,
): () => void {
  const q = query(collection(getDb(), 'startups'), orderBy('submittedAt', 'desc'), limit(200));
  return onSnapshot(
    q,
    snap => onData(snap.docs.map(mapStartup)),
    err => onError(err as Error),
  );
}

async function setStartupDecision(
  startupId: string,
  status: 'approved' | 'rejected',
  rejectionReason: string,
): Promise<void> {
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postsSnap = await getDocs(collection(db, 'startups', startupId, 'posts'));

  await runTransaction(db, async tx => {
    const snap = await tx.get(startupRef);
    if (!snap.exists()) throw new Error('That startup no longer exists.');

    tx.update(startupRef, { status, rejectionReason });
    // Posts mirror the startup's status so the feed's collection-group filter
    // stays correct without a join back to the parent.
    for (const p of postsSnap.docs) {
      tx.update(p.ref, { approved: status === 'approved' });
    }
  });
}

export function approveStartup(startupId: string): Promise<void> {
  return setStartupDecision(startupId, 'approved', '');
}

export function rejectStartup(startupId: string, reason: string): Promise<void> {
  return setStartupDecision(startupId, 'rejected', reason.trim().slice(0, 500));
}

/**
 * Removes a single comment without touching the rest of its thread. Deleting
 * a whole post already cascades its comments; this is for taking down one
 * abusive reply and leaving the rest intact.
 */
export async function deleteComment(startupId: string, postId: string, commentId: string): Promise<void> {
  const db = getDb();
  const startupRef = doc(db, 'startups', startupId);
  const postRef = doc(db, 'startups', startupId, 'posts', postId);
  const commentRef = doc(db, 'startups', startupId, 'posts', postId, 'comments', commentId);

  await runTransaction(db, async tx => {
    const commentSnap = await tx.get(commentRef);
    if (!commentSnap.exists()) return;
    tx.delete(commentRef);
    tx.update(postRef, { commentCount: increment(-1) });
    tx.update(startupRef, { commentCount: increment(-1) });
  });
}
