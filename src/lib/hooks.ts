'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { ensureSignedIn, getFirebaseAuth, isAdminUser, isFirebaseConfigured } from './firebase';
import {
  FEED_PAGE_SIZE,
  fetchFeedPage,
  fetchStartupBySlug,
  getReviewerByUsername,
  getReviewsByAuthor,
  subscribeToComments,
  subscribeToFeed,
  subscribeToMyHelpfulMarks,
  subscribeToMyLikes,
  subscribeToMyNotifications,
  subscribeToReviews,
  subscribeToStartupPosts,
  subscribeToStartups,
  subscribeToStartupsForAdmin,
} from './firestore';
import type {
  Comment,
  Notification,
  Period,
  Post,
  Review,
  Reviewer,
  ReviewWithStartup,
  Startup,
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

/**
 * The newest page of the feed stays live over a websocket so new posts, likes
 * and comment counts arrive on their own. Older pages are fetched once and
 * appended — keeping every page subscribed would mean an open listener per page.
 */
export function useFeed(): FeedState {
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
    return subscribeToFeed(
      posts => setLive({ data: posts, loading: false, error: null }),
      err => setLive({ data: [], loading: false, error: err.message }),
    );
  }, []);

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
    fetchFeedPage(last.createdAt)
      .then(page => {
        if (page.length < FEED_PAGE_SIZE) setExhausted(true);
        setOlder(prev => {
          const seen = new Set(prev.map(p => p.id));
          return [...prev, ...page.filter(p => !seen.has(p.id))];
        });
      })
      .catch(() => setExhausted(true))
      .finally(() => setLoadingMore(false));
  }, [posts, loadingMore, exhausted]);

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

/* ─── Leaderboard ─────────────────────────────────────────── */

export function useLeaderboard(
  startups: Startup[],
  period: Period,
  category: string,
  region: string,
): Startup[] {
  return useMemo(() => {
    const rankOf = (s: Startup) => (period === 'week' ? s.rankWeek : s.rankMonth);
    return startups
      .filter(s => category === 'all' || s.category === category)
      .filter(s => region === 'all' || s.region === region)
      .sort((a, b) => rankOf(a) - rankOf(b));
  }, [startups, period, category, region]);
}
