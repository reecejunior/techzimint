'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ensureSignedIn, getFirebaseAuth, isAdminUser, isFirebaseConfigured } from './firebase';
import {
  FEED_PAGE_SIZE,
  fetchStartupBySlug,
  fetchVideoFeedPage,
  getReviewerByUsername,
  getReviewsByAuthor,
  subscribeToComments,
  subscribeToCommunityComments,
  subscribeToCommunityFeed,
  subscribeToCommunityPollVotes,
  subscribeToCommunityPost,
  subscribeToMyCommunityCommentLikes,
  subscribeToMyCommunityLikes,
  subscribeToMyHelpfulMarks,
  subscribeToMyLikes,
  subscribeToMyNotificationPref,
  subscribeToMyNotifications,
  subscribeToMyPushTokens,
  subscribeToReviews,
  subscribeToStartupPosts,
  subscribeToStartups,
  subscribeToAllTrackerComments,
  subscribeToStartupsForAdmin,
  subscribeToTrackerComments,
  subscribeToTrackerOverrides,
  subscribeToTrackerSuggestions,
  subscribeToVideoFeed,
} from './firestore';
import type {
  Comment,
  CommunityComment,
  CommunityKind,
  CommunityPollVote,
  CommunityPost,
  Notification,
  NotificationPref,
  Post,
  Review,
  Reviewer,
  ReviewWithStartup,
  Startup,
  TrackerComment,
  TrackerOverride,
  TrackerSuggestion,
} from './types';

const NOT_CONFIGURED =
  'Firebase is not configured yet. Add your project keys to .env.local and restart the dev server.';

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

/**
 * The "not configured" and "still switching subject" cases are derived during
 * render rather than pushed through setState from an effect — an effect that
 * sets state synchronously just forces a second render to say what the first
 * one already knew.
 */

/* ─── Feed ────────────────────────────────────────────────── */

interface FeedState extends AsyncState<Post[]> {
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
}

type FeedSubscribe = (
  onData: (posts: Post[]) => void,
  onError: (err: Error) => void,
) => () => void;

/**
 * The newest page of the feed stays live over a websocket so new posts, likes
 * and comment counts arrive on their own. Older pages are fetched once and
 * appended — keeping every page subscribed would mean an open listener per page.
 *
 * Parameterised by which query to run so the main feed and the video-only
 * feed share this pagination logic rather than duplicating it.
 */
function useFeedQuery(subscribe: FeedSubscribe, fetchPage: (afterIso: string) => Promise<Post[]>): FeedState {
  const [live, setLive] = useState<AsyncState<Post[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [older, setOlder] = useState<Post[]>([]);
  const [exhausted, setExhausted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribe(
      posts => setLive({ data: posts, loading: false, error: null }),
      err => setLive({ data: [], loading: false, error: err.message }),
    );
  }, [subscribe]);

  const posts = useMemo(() => {
    // A live post can also exist in an older page after a like reorders nothing
    // but a refetch overlaps — de-duplicate by id, preferring the live copy.
    const seen = new Set(live.data.map(p => p.id));
    return [...live.data, ...older.filter(p => !seen.has(p.id))];
  }, [live.data, older]);

  const loadMore = useCallback(() => {
    const last = posts[posts.length - 1];
    if (!last || loadingMore || exhausted) return;

    setLoadingMore(true);
    fetchPage(last.createdAt)
      .then(page => {
        if (page.length < FEED_PAGE_SIZE) setExhausted(true);
        setOlder(prev => {
          const seen = new Set(prev.map(p => p.id));
          return [...prev, ...page.filter(p => !seen.has(p.id))];
        });
      })
      .catch(() => setExhausted(true))
      .finally(() => setLoadingMore(false));
  }, [posts, loadingMore, exhausted, fetchPage]);

  if (!isFirebaseConfigured) {
    return {
      data: [],
      loading: false,
      error: NOT_CONFIGURED,
      hasMore: false,
      loadingMore: false,
      loadMore: () => {},
    };
  }

  return {
    data: posts,
    loading: live.loading,
    error: live.error,
    hasMore: !exhausted && live.data.length >= FEED_PAGE_SIZE,
    loadingMore,
    loadMore,
  };
}

/** Only posts carrying a video, newest first. */
export function useVideoFeed(): FeedState {
  return useFeedQuery(subscribeToVideoFeed, fetchVideoFeedPage);
}

export function useStartupPosts(startupId: string | undefined): AsyncState<Post[]> {
  const [state, setState] = useState<AsyncState<Post[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!startupId || !isFirebaseConfigured) return;
    return subscribeToStartupPosts(
      startupId,
      posts => setState({ data: posts, loading: false, error: null, forId: startupId }),
      err => setState({ data: [], loading: false, error: err.message, forId: startupId }),
    );
  }, [startupId]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: null };
  if (!startupId || state.forId !== startupId) return { data: [], loading: true, error: null };
  return state;
}

export function useComments(
  startupId: string | undefined,
  postId: string | undefined,
  active: boolean,
): AsyncState<Comment[]> {
  const [state, setState] = useState<AsyncState<Comment[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Only subscribe once the thread is open: a feed of 12 posts would
    // otherwise hold 12 idle listeners.
    if (!active || !startupId || !postId || !isFirebaseConfigured) return;
    return subscribeToComments(
      startupId,
      postId,
      comments => setState({ data: comments, loading: false, error: null, forId: postId }),
      err => setState({ data: [], loading: false, error: err.message, forId: postId }),
    );
  }, [active, startupId, postId]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: null };
  if (!active || state.forId !== postId) return { data: [], loading: active, error: null };
  return state;
}

/* ─── Startups ────────────────────────────────────────────── */

export function useStartups(): AsyncState<Startup[]> {
  const [state, setState] = useState<AsyncState<Startup[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToStartups(
      startups => setState({ data: startups, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  return state;
}

/**
 * One startup by slug.
 *
 * Prefers the live approved set, because that is where rank and movement come
 * from. Falls back to a direct read when the slug isn't in it — otherwise a
 * founder who just submitted would be told their own startup doesn't exist,
 * since a pending startup is excluded from the leaderboard query.
 */
export function useStartup(slug: string): AsyncState<Startup | null> {
  const { data, loading, error } = useStartups();
  const ranked = useMemo(() => data.find(s => s.slug === slug) ?? null, [data, slug]);

  /* Only the resolved result is stored. "Still loading" is derived from the
     absence of a result for this slug, so the effect never sets state
     synchronously just to say what the render already knows. */
  const [fallback, setFallback] = useState<{ startup: Startup | null; forSlug?: string }>({
    startup: null,
  });

  useEffect(() => {
    // Only reach for it once the approved set has arrived and come up empty.
    if (!isFirebaseConfigured || loading || ranked || error) return;

    let cancelled = false;
    fetchStartupBySlug(slug)
      .then(found => {
        if (!cancelled) setFallback({ startup: found, forSlug: slug });
      })
      .catch(() => {
        if (!cancelled) setFallback({ startup: null, forSlug: slug });
      });

    return () => {
      cancelled = true;
    };
  }, [slug, loading, ranked, error]);

  if (ranked) return { data: ranked, loading: false, error };
  if (loading) return { data: null, loading: true, error };
  if (error) return { data: null, loading: false, error };
  // Keep showing the spinner until the fallback for *this* slug has resolved.
  if (fallback.forSlug !== slug) return { data: null, loading: true, error: null };
  return { data: fallback.startup, loading: false, error: null };
}

export function useReviews(startupId: string | undefined): AsyncState<Review[]> {
  const [state, setState] = useState<AsyncState<Review[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!startupId || !isFirebaseConfigured) return;
    return subscribeToReviews(
      startupId,
      reviews => setState({ data: reviews, loading: false, error: null, forId: startupId }),
      err => setState({ data: [], loading: false, error: err.message, forId: startupId }),
    );
  }, [startupId]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: null };
  if (!startupId || state.forId !== startupId) return { data: [], loading: true, error: null };
  return state;
}

/* ─── Identity ────────────────────────────────────────────── */

/** Post ids this visitor has liked, so hearts render filled. */
export function useMyLikes(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyLikes(setIds, () => setIds(new Set()));
  }, []);
  return ids;
}

export function useMyHelpfulMarks(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyHelpfulMarks(setIds, () => setIds(new Set()));
  }, []);
  return ids;
}

/** The anonymous uid, used to decide whether to show founder-only controls. */
export function useMyUid(): string | null {
  const [uid, setUid] = useState<string | null>(null);
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;
    ensureSignedIn()
      .then(user => {
        if (!cancelled) setUid(user.uid);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return uid;
}

/* ─── Community ───────────────────────────────────────────────
 * Deliberately simpler than useFeedQuery above: one live onSnapshot, no
 * older-pages pagination split. That's a starting scope, not an oversight —
 * the community section opens with a single capped recent-first list, and
 * can grow the same live-page/fetched-older-pages pattern the main feed uses
 * once there's enough volume that one page isn't everything there is. */

export function useCommunityFeed(kind: CommunityKind | 'all'): AsyncState<CommunityPost[]> {
  const [state, setState] = useState<AsyncState<CommunityPost[]> & { forKind?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToCommunityFeed(
      kind,
      posts => setState({ data: posts, loading: false, error: null, forKind: kind }),
      err => setState({ data: [], loading: false, error: err.message, forKind: kind }),
    );
  }, [kind]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  // Guards against a stale render for the previous tab while the new tab's
  // subscription is still spinning up — same trick useStartupPosts uses.
  if (state.forKind !== kind) return { data: [], loading: true, error: null };
  return state;
}

/** A single community post, live — the thread page's own header and status
 *  (likes, answered state) come from this rather than the feed list. */
export function useCommunityPost(postId: string | undefined): AsyncState<CommunityPost | null> {
  const [state, setState] = useState<AsyncState<CommunityPost | null> & { forId?: string }>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!postId || !isFirebaseConfigured) return;
    return subscribeToCommunityPost(
      postId,
      post => setState({ data: post, loading: false, error: null, forId: postId }),
      err => setState({ data: null, loading: false, error: err.message, forId: postId }),
    );
  }, [postId]);

  if (!isFirebaseConfigured) return { data: null, loading: false, error: null };
  if (!postId || state.forId !== postId) return { data: null, loading: true, error: null };
  return state;
}

export function useCommunityComments(postId: string | undefined): AsyncState<CommunityComment[]> {
  const [state, setState] = useState<AsyncState<CommunityComment[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!postId || !isFirebaseConfigured) return;
    return subscribeToCommunityComments(
      postId,
      comments => setState({ data: comments, loading: false, error: null, forId: postId }),
      err => setState({ data: [], loading: false, error: err.message, forId: postId }),
    );
  }, [postId]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: null };
  if (!postId || state.forId !== postId) return { data: [], loading: true, error: null };
  return state;
}

/** Community post ids this visitor has liked — a separate set from
 *  useMyLikes, since communityLikes is its own collection (see firestore.ts). */
export function useMyCommunityLikes(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyCommunityLikes(setIds, () => setIds(new Set()));
  }, []);
  return ids;
}

/** Community *comment* ids this visitor has liked — a third like set,
 *  independent of both useMyLikes and useMyCommunityLikes. */
export function useMyCommunityCommentLikes(): Set<string> {
  const [ids, setIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyCommunityCommentLikes(setIds, () => setIds(new Set()));
  }, []);
  return ids;
}

export interface PollTally {
  /** optionId → vote count, for every option that has at least one vote. */
  counts: Map<string, number>;
  totalVotes: number;
  /** The optionId this visitor voted for, or null if they haven't. */
  myVote: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Tallies for one poll. This is the "hook owns the derived shape, firestore.ts
 * owns the raw subscription" split useFeedQuery already uses for pagination —
 * subscribeToCommunityPollVotes hands back the raw vote docs, and counting
 * them into per-option totals (plus picking out this visitor's own vote) is
 * presentation logic that lives here rather than in firestore.ts. See the
 * longer comment above subscribeToCommunityPollVotes for why these are
 * tallied in memory at all, rather than from a stored counter.
 */
export function useCommunityPollVotes(postId: string | undefined): PollTally {
  const uid = useMyUid();
  const [state, setState] = useState<AsyncState<CommunityPollVote[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!postId || !isFirebaseConfigured) return;
    return subscribeToCommunityPollVotes(
      postId,
      votes => setState({ data: votes, loading: false, error: null, forId: postId }),
      err => setState({ data: [], loading: false, error: err.message, forId: postId }),
    );
  }, [postId]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const v of state.data) m.set(v.optionId, (m.get(v.optionId) ?? 0) + 1);
    return m;
  }, [state.data]);

  const myVote = useMemo(
    () => (uid ? (state.data.find(v => v.uid === uid)?.optionId ?? null) : null),
    [state.data, uid],
  );

  if (!isFirebaseConfigured) {
    return { counts: new Map(), totalVotes: 0, myVote: null, loading: false, error: null };
  }
  if (!postId || state.forId !== postId) {
    return { counts: new Map(), totalVotes: 0, myVote: null, loading: true, error: null };
  }
  return { counts, totalVotes: state.data.length, myVote, loading: state.loading, error: state.error };
}

/* ─── Admin ───────────────────────────────────────────────── */

/**
 * Who's signed in right now, and whether that's the admin account. Purely a
 * UI convenience — every admin write is re-checked by firestore.rules, which
 * is the only layer that can't be spoofed from the browser.
 */
export function useAdminAuth(): { user: User | null; isAdmin: boolean; loading: boolean } {
  const [state, setState] = useState<{ user: User | null; loading: boolean }>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return onAuthStateChanged(getFirebaseAuth(), user => setState({ user, loading: false }));
  }, []);

  if (!isFirebaseConfigured) return { user: null, isAdmin: false, loading: false };
  return { user: state.user, isAdmin: isAdminUser(state.user), loading: state.loading };
}

/** Every hackathon-tracker suggestion, newest first — the /admin review
 *  queue (see submitTrackerSuggestion / reviewTrackerSuggestion). */
export function useTrackerSuggestionsForAdmin(): AsyncState<TrackerSuggestion[]> {
  const [state, setState] = useState<AsyncState<TrackerSuggestion[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToTrackerSuggestions(
      items => setState({ data: items, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  return state;
}

/** Every public comment on one hackathon-tracker row, oldest first. Pass ''
 *  while the row is collapsed (or unknown) and no subscription starts. */
export function useTrackerComments(winnerId: string): AsyncState<TrackerComment[]> {
  const [state, setState] = useState<AsyncState<TrackerComment[]> & { forId?: string }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured || !winnerId) return;
    return subscribeToTrackerComments(
      winnerId,
      items => setState({ data: items, loading: false, error: null, forId: winnerId }),
      err => setState({ data: [], loading: false, error: err.message, forId: winnerId }),
    );
  }, [winnerId]);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  if (!winnerId || state.forId !== winnerId) return { data: [], loading: Boolean(winnerId), error: null };
  return state;
}

/** Every hackathon-tracker comment site-wide, newest first — the /admin
 *  moderation list (see subscribeToAllTrackerComments / deleteTrackerComment). */
export function useTrackerCommentsForAdmin(): AsyncState<TrackerComment[]> {
  const [state, setState] = useState<AsyncState<TrackerComment[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToAllTrackerComments(
      items => setState({ data: items, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  return state;
}

/** Every live admin correction to the hackathon tracker, keyed by winnerId —
 *  used both to show corrected rows on the public page (merged over the
 *  static dataset with applyTrackerOverride) and to drive the /admin editor. */
export function useTrackerOverrides(): AsyncState<TrackerOverride[]> {
  const [state, setState] = useState<AsyncState<TrackerOverride[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToTrackerOverrides(
      items => setState({ data: items, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  return state;
}

/** Every startup regardless of status, for the moderation list. */
export function useAllStartupsForAdmin(): AsyncState<Startup[]> {
  const [state, setState] = useState<AsyncState<Startup[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToStartupsForAdmin(
      startups => setState({ data: startups, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: NOT_CONFIGURED };
  return state;
}

/** This visitor's notifications, newest first. Empty until they've done
 *  something that establishes their anonymous session (ensureSignedIn is
 *  called inside the subscription itself, same as useMyLikes). */
export function useMyNotifications(): AsyncState<Notification[]> {
  const [state, setState] = useState<AsyncState<Notification[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyNotifications(
      notifications => setState({ data: notifications, loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: [], loading: false, error: null };
  return state;
}

/** This visitor's email-notification preference, or null if never set. */
export function useMyNotificationPref(): AsyncState<NotificationPref | null> {
  const [state, setState] = useState<AsyncState<NotificationPref | null>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyNotificationPref(
      pref => setState({ data: pref, loading: false, error: null }),
      err => setState({ data: null, loading: false, error: err.message }),
    );
  }, []);

  if (!isFirebaseConfigured) return { data: null, loading: false, error: null };
  return state;
}

/** FCM tokens registered for this visitor, across every device/browser. */
export function useMyPushTokens(): string[] {
  const [tokens, setTokens] = useState<string[]>([]);
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    return subscribeToMyPushTokens(setTokens, () => setTokens([]));
  }, []);
  return tokens;
}

/* ─── Profiles ────────────────────────────────────────────── */

interface Profile {
  reviewer: Reviewer | null;
  reviews: ReviewWithStartup[];
}

const NO_PROFILE: Profile = { reviewer: null, reviews: [] };

export function useReviewerProfile(username: string): AsyncState<Profile> {
  const [state, setState] = useState<AsyncState<Profile> & { forUser?: string }>({
    data: NO_PROFILE,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    let cancelled = false;

    (async () => {
      try {
        const reviewer = await getReviewerByUsername(username);
        if (cancelled) return;

        const reviews = reviewer ? await getReviewsByAuthor(reviewer.id) : [];
        if (cancelled) return;

        setState({ data: { reviewer, reviews }, loading: false, error: null, forUser: username });
      } catch (err) {
        if (cancelled) return;
        setState({
          data: NO_PROFILE,
          loading: false,
          error: err instanceof Error ? err.message : 'Could not load this profile.',
          forUser: username,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (!isFirebaseConfigured) return { data: NO_PROFILE, loading: false, error: NOT_CONFIGURED };
  if (state.forUser !== username) return { data: NO_PROFILE, loading: true, error: null };
  return state;
}

