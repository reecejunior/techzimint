'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart3, CheckCircle2, Heart, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { toggleCommunityLike } from '@/lib/firestore';
import { timeAgo } from '@/lib/ranking';
import type { CommunityPost } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import styles from './CommunityCard.module.css';

const KIND_LABEL: Record<CommunityPost['kind'], string> = {
  question: 'Question',
  showcase: 'Show & Tell',
  poll: 'Poll',
};

interface CommunityCardProps {
  post: CommunityPost;
  liked: boolean;
}

/**
 * A feed item for the community section — a question/help thread, a
 * show-and-tell post, or a poll — visually told apart by the kind label up
 * top and, for a question, an Answered/Open badge. A poll also gets a
 * compact preview of its first couple of options (see below). The whole
 * card links to the thread (see stretch-link in globals.css); the like
 * button sits above that overlay so it stays its own target instead of
 * triggering navigation.
 */
export default function CommunityCard({ post, liked }: CommunityCardProps) {
  const [pendingLike, setPendingLike] = useState(false);
  /** Local guess applied while the write is in flight — same pattern as
   *  PostCard's like button. */
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const isLiked = optimistic?.liked ?? liked;
  const likeCount = Math.max(0, post.likeCount + (optimistic?.delta ?? 0));

  async function like() {
    if (pendingLike) return;
    const next = !isLiked;
    setOptimistic({ liked: next, delta: next ? 1 : -1 });
    setPendingLike(true);
    setFailed(null);
    try {
      await toggleCommunityLike(post.id);
      // The snapshot listener owns the truth from here.
      setOptimistic(null);
    } catch (err) {
      setOptimistic(null);
      setFailed(err instanceof Error ? err.message : 'Could not save that.');
      setTimeout(() => setFailed(null), 3200);
    } finally {
      setPendingLike(false);
    }
  }

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <span
          className={clsx(
            styles.kindBadge,
            post.kind === 'showcase' ? styles.kindShowcase : styles.kindNeutral,
          )}
        >
          {KIND_LABEL[post.kind]}
        </span>

        {/* Only a question can be "answered" — a showcase or poll never carries this. */}
        {post.kind === 'question' && (
          <span className={clsx(styles.statusBadge, post.isAnswered && styles.statusAnswered)}>
            {post.isAnswered && <CheckCircle2 size={12} aria-hidden="true" />}
            {post.isAnswered ? 'Answered' : 'Open'}
          </span>
        )}
      </div>

      <h3 className={styles.title}>
        <Link href={`/community/${post.id}`} className={clsx(styles.titleLink, 'stretch-link')}>
          {post.title}
        </Link>
      </h3>

      <p className={styles.excerpt}>{post.body}</p>

      {/* A compact preview, not live results: the full voting/tally UI lives
          on the thread page. Showing the first couple of options (no counts,
          no subscription) keeps a feed of many cards from opening one vote
          listener per poll just to render a teaser. */}
      {post.kind === 'poll' && post.pollOptions.length > 0 && (
        <div className={styles.pollPreview}>
          <ul className={styles.pollPreviewOptions}>
            {post.pollOptions.slice(0, 2).map(opt => (
              <li key={opt.id} className={styles.pollPreviewOption}>
                {opt.label}
              </li>
            ))}
          </ul>
          <span className={styles.pollPreviewCta}>
            <BarChart3 size={13} aria-hidden="true" />
            {post.pollOptions.length > 2
              ? `+${post.pollOptions.length - 2} more · Vote`
              : 'Vote'}
          </span>
        </div>
      )}

      {post.tags.length > 0 && (
        <ul className={styles.tags}>
          {post.tags.map(t => (
            <li key={t} className={styles.tag}>
              #{t}
            </li>
          ))}
        </ul>
      )}

      <footer className={styles.footer}>
        <div className={styles.author}>
          <Avatar initials={post.authorAvatar} size="sm" color="#8A7C70" />
          <span className={styles.authorName}>{post.authorName}</span>
          <time className={styles.time} dateTime={post.createdAt}>
            {timeAgo(post.createdAt)}
          </time>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={clsx(styles.action, isLiked && styles.liked)}
            onClick={like}
            disabled={pendingLike}
            aria-pressed={isLiked}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} this post. ${likeCount} likes.`}
          >
            <Heart size={15} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span className={styles.actionCount}>{likeCount}</span>
          </button>

          <span className={styles.action}>
            <MessageCircle size={15} aria-hidden="true" />
            <span className={styles.actionCount}>{post.commentCount}</span>
          </span>
        </div>
      </footer>

      {failed && (
        <p className={styles.failed} role="alert">
          {failed}
        </p>
      )}
    </article>
  );
}
