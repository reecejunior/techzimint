'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MessageCircle, Play } from 'lucide-react';
import clsx from 'clsx';
import { toggleLike } from '@/lib/firestore';
import { embedSrc, timeAgo } from '@/lib/ranking';
import type { Post } from '@/lib/types';
import Logo from '@/components/ui/Logo';
import styles from './VideoCard.module.css';

/**
 * A video-forward card for /videos — the thumbnail leads, and the startup
 * that posted it is tagged underneath.
 *
 * Deliberately not PostCard: in the feed a video is one of several things a
 * post might carry, so it sits below the copy. Here the video *is* the
 * content, so it takes the top of the card and the copy is the caption.
 *
 * Players stay click-to-load for the same reason as PostMedia: mounting an
 * iframe per card would pull a third-party bundle for every video on screen
 * whether or not anyone watches.
 */
export default function VideoCard({ post, liked }: { post: Post; liked: boolean }) {
  const [playing, setPlaying] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);

  const video = post.video;
  if (!video) return null;

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
    <article className={styles.card}>
      <div className={styles.frame}>
        {video.kind === 'upload' ? (
          <video className={styles.player} src={video.url} controls preload="metadata" />
        ) : playing && video.provider && video.embedId ? (
          <iframe
            className={styles.player}
            src={`${embedSrc(video.provider, video.embedId)}&autoplay=1`}
            title={`${post.startupName} video`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.poster}
            onClick={() => setPlaying(true)}
            aria-label={`Play ${post.startupName} video`}
          >
            {video.provider === 'youtube' && video.embedId ? (
              // eslint-disable-next-line @next/next/no-img-element -- third-party thumbnail
              <img
                src={`https://i.ytimg.com/vi/${video.embedId}/hqdefault.jpg`}
                alt=""
                className={styles.posterImg}
                loading="lazy"
              />
            ) : (
              <span className={styles.posterFallback} aria-hidden="true" />
            )}
            <span className={styles.playBadge}>
              <Play size={20} fill="currentColor" aria-hidden="true" />
            </span>
          </button>
        )}
      </div>

      <div className={styles.body}>
        {/* The tag: whose video this is. */}
        <Link href={`/startups/${post.startupSlug}`} className={styles.tag}>
          <Logo
            name={post.startupName}
            url={post.startupLogoUrl}
            initials={post.startupLogoInitials}
            size="sm"
          />
          <span className={styles.tagText}>
            <span className={styles.tagName}>{post.startupName}</span>
            <time className={styles.tagTime} dateTime={post.createdAt}>
              {timeAgo(post.createdAt)}
            </time>
          </span>
        </Link>

        {post.body && <p className={styles.caption}>{post.body}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={clsx(styles.action, isLiked && styles.liked)}
            onClick={like}
            disabled={pendingLike}
            aria-pressed={isLiked}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} ${post.startupName}. ${likeCount} likes.`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className="tnum">{likeCount}</span>
          </button>

          <Link href={`/startups/${post.startupSlug}`} className={styles.action}>
            <MessageCircle size={16} aria-hidden="true" />
            <span className="tnum">{post.commentCount}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
