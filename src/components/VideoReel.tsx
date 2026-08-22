'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Play, X } from 'lucide-react';
import clsx from 'clsx';
import { toggleLike } from '@/lib/firestore';
import { embedSrc, timeAgo } from '@/lib/ranking';
import type { Post } from '@/lib/types';
import Logo from '@/components/ui/Logo';
import styles from './VideoReel.module.css';

/**
 * Full-screen, swipe-through video viewer — the TikTok/Reels reading mode.
 *
 * Paging is CSS scroll-snap rather than a JS carousel: it inherits native
 * momentum, keyboard scrolling and accessibility for free, and it can't
 * de-sync from the scroll position the way a hand-rolled pager does.
 *
 * Only the panel currently in view mounts a player. Mounting every iframe
 * would pull a third-party player bundle per video and — worse — leave
 * several of them playing audio at once.
 */
export default function VideoReel({
  posts,
  startIndex,
  likedIds,
  onClose,
}: {
  posts: Post[];
  startIndex: number;
  likedIds: Set<string>;
  onClose: () => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(startIndex);

  // Jump to the tapped video before the first paint the user sees, so
  // opening at item 7 doesn't animate through 1–6.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = startIndex * el.clientHeight;
  }, [startIndex]);

  // A full-screen layer must not leave the page scrolling behind it.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  /* Which panel is in view decides which one gets a player.
   *
   * Derived from scroll position: with mandatory scroll-snap every panel is
   * exactly one viewport tall, so the index is a division. No observer to
   * point at the right root, no threshold to tune.
   *
   * Deliberately unthrottled and handled by React's own onScroll rather
   * than a rAF loop in an effect. setActiveIndex with an unchanged value is
   * a no-op React bails out of, so the per-event cost is one division —
   * and it keeps this to a single obvious code path. */
  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    const h = el.clientHeight;
    if (!h) return;
    const i = Math.min(Math.max(Math.round(el.scrollTop / h), 0), posts.length - 1);
    setActiveIndex(prev => (prev === i ? prev : i));
  }

  return (
    <div className={styles.root} role="dialog" aria-modal="true" aria-label="Video viewer">
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close video viewer">
        <X size={22} aria-hidden="true" />
      </button>

      <div className={styles.scroller} ref={scrollerRef} onScroll={handleScroll}>
        {posts.map((post, i) => (
          <Panel
            key={post.id}
            post={post}
            active={i === activeIndex}
            liked={likedIds.has(post.id)}
          />
        ))}
      </div>

      {posts.length > 1 && activeIndex === 0 && (
        <p className={styles.hint} aria-hidden="true">Swipe up for more</p>
      )}
    </div>
  );
}

function Panel({
  post,
  active,
  liked,
}: {
  post: Post;
  active: boolean;
  liked: boolean;
}) {
  const [pendingLike, setPendingLike] = useState(false);
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);
  const [expanded, setExpanded] = useState(false);

  const video = post.video;
  const isLiked = optimistic?.liked ?? liked;
  const likeCount = Math.max(0, post.likeCount + (optimistic?.delta ?? 0));

  async function like() {
    if (pendingLike) return;
    const next = !isLiked;
    setOptimistic({ liked: next, delta: next ? 1 : -1 });
    setPendingLike(true);
    try {
      await toggleLike(post.startupId, post.id);
      setOptimistic(null);
    } catch {
      setOptimistic(null);
    } finally {
      setPendingLike(false);
    }
  }

  return (
    <section className={styles.panel}>
      <div className={styles.stage}>
        {!video ? null : !active ? (
          /* Inert placeholder — keeps the panel's height and shows the
             thumbnail without loading a player for something off-screen. */
          <div className={styles.idle}>
            {video.provider === 'youtube' && video.embedId && (
              // eslint-disable-next-line @next/next/no-img-element -- third-party thumbnail
              <img
                src={`https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`}
                alt=""
                className={styles.idleImg}
                loading="lazy"
              />
            )}
            <span className={styles.idleBadge}>
              <Play size={20} fill="currentColor" aria-hidden="true" />
            </span>
          </div>
        ) : video.kind === 'upload' ? (
          <video
            className={styles.player}
            src={video.url}
            controls
            autoPlay
            muted
            loop
            playsInline
          />
        ) : video.provider && video.embedId ? (
          <iframe
            className={styles.player}
            /* Muted autoplay is the only kind browsers allow without a
               per-video gesture; the player's own controls can unmute. */
            src={`${embedSrc(video.provider, video.embedId)}&autoplay=1&mute=1&playsinline=1&loop=1&playlist=${video.embedId}`}
            title={`${post.startupName} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : null}
      </div>

      {/* Overlay: caption bottom-left, actions bottom-right. */}
      <div className={styles.overlay}>
        <div className={styles.caption}>
          <Link href={`/startups/${post.startupSlug}`} className={styles.tag}>
            <Logo
              name={post.startupName}
              url={post.startupLogoUrl}
              initials={post.startupLogoInitials}
              size="sm"
            />
            <span className={styles.tagName}>{post.startupName}</span>
            <time className={styles.tagTime} dateTime={post.createdAt}>
              {timeAgo(post.createdAt)}
            </time>
          </Link>

          {post.body && (
            <p
              className={clsx(styles.body, expanded && styles.bodyOpen)}
              onClick={() => setExpanded(o => !o)}
            >
              {post.body}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={clsx(styles.action, isLiked && styles.liked)}
            onClick={like}
            disabled={pendingLike}
            aria-pressed={isLiked}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} ${post.startupName}. ${likeCount} likes.`}
          >
            <Heart size={26} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className={styles.actionCount}>{likeCount}</span>
          </button>

          <Link
            href={`/startups/${post.startupSlug}`}
            className={styles.action}
            aria-label={`${post.commentCount} comments on ${post.startupName}`}
          >
            <MessageCircle size={26} aria-hidden="true" />
            <span className={styles.actionCount}>{post.commentCount}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
