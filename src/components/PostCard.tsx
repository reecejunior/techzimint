'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, MessageCircle, Send, Star } from 'lucide-react';
import clsx from 'clsx';
import { addComment, toggleLike } from '@/lib/firestore';
import { useComments } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { Post } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import PostMedia from '@/components/ui/PostMedia';
import styles from './PostCard.module.css';

export default function PostCard({ post, liked }: { post: Post; liked: boolean }) {
  const [showComments, setShowComments] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);
  /** Local guess applied while the write is in flight. */
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
      await toggleLike(post.startupId, post.id);
      // The snapshot listener owns the truth from here.
      setOptimistic(null);
    } catch (err) {
      console.error(`Like failed for post ${post.id}:`, err);
      setOptimistic(null);
      setFailed(err instanceof Error ? err.message : 'Could not save that.');
      setTimeout(() => setFailed(null), 3200);
    } finally {
      setPendingLike(false);
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <Link href={`/startups/${post.startupSlug}`} className={styles.logoLink} tabIndex={-1}>
          <Logo
            name={post.startupName}
            url={post.startupLogoUrl}
            initials={post.startupLogoInitials}
            size="md"
          />
        </Link>

        <div className={styles.headText}>
          <h3 className={styles.name}>
            <Link href={`/startups/${post.startupSlug}`} className={styles.nameLink}>
              {post.startupName}
            </Link>
          </h3>
          <p className={styles.meta}>
            {post.isLaunch && <span className={styles.launch}>Launched</span>}
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
      </header>

      {post.body && <p className={styles.body}>{post.body}</p>}

      <PostMedia images={post.images} video={post.video} startupName={post.startupName} />

      <footer className={styles.actions}>
        <button
          type="button"
          className={clsx(styles.action, isLiked && styles.liked)}
          onClick={like}
          disabled={pendingLike}
          aria-pressed={isLiked}
          aria-label={`${isLiked ? 'Unlike' : 'Like'} ${post.startupName}. ${likeCount} likes.`}
        >
          <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
          <span className={styles.actionCount}>{likeCount}</span>
        </button>

        <button
          type="button"
          className={clsx(styles.action, showComments && styles.actionOn)}
          onClick={() => setShowComments(o => !o)}
          aria-expanded={showComments}
        >
          <MessageCircle size={17} aria-hidden="true" />
          <span className={styles.actionCount}>{post.commentCount}</span>
        </button>

        {/* Reviews are structured and live on the startup, so this hands off
            rather than duplicating the form in every card. */}
        <Link href={`/startups/${post.startupSlug}#reviews`} className={styles.action}>
          <Star size={17} aria-hidden="true" />
          <span className={styles.actionLabel}>Review</span>
        </Link>
      </footer>

      {failed && (
        <p className={styles.failed} role="alert">
          {failed}
        </p>
      )}

      {showComments && <CommentThread post={post} />}
    </article>
  );
}

function CommentThread({ post }: { post: Post }) {
  const { data: comments, loading } = useComments(post.startupId, post.id, true);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await addComment(post.startupId, post.id, body, name);
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that comment.');
    } finally {
      setSending(false);
    }
  }

  return (
    <section className={styles.thread}>
      {loading ? (
        <p className={styles.threadEmpty}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className={styles.threadEmpty}>No comments yet. Start the conversation.</p>
      ) : (
        <ul className={styles.comments}>
          {comments.map(c => (
            <li key={c.id} className={styles.comment}>
              <Avatar initials={c.authorAvatar} size="sm" color="#8A7C70" />
              <div className={styles.commentBody}>
                <p className={styles.commentHead}>
                  <span className={styles.commentAuthor}>{c.authorName}</span>
                  <time className={styles.commentTime} dateTime={c.createdAt}>
                    {timeAgo(c.createdAt)}
                  </time>
                </p>
                <p className={styles.commentText}>{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={send}>
        <input
          className={styles.nameInput}
          placeholder="Your name (optional)"
          maxLength={60}
          value={name}
          onChange={e => setName(e.target.value)}
          aria-label="Your name"
        />
        <div className={styles.formRow}>
          <input
            className={styles.commentInput}
            placeholder={`Add a comment on ${post.startupName}…`}
            maxLength={1000}
            value={body}
            onChange={e => setBody(e.target.value)}
            aria-label="Your comment"
          />
          <button
            type="submit"
            className={styles.send}
            disabled={!body.trim() || sending}
            aria-label="Post comment"
          >
            <Send size={15} aria-hidden="true" />
          </button>
        </div>
        {error && (
          <p className={styles.failed} role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}
