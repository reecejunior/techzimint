'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Loader2, MessageCircle, Send, Star, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { addComment, deleteComment, deletePost, toggleLike } from '@/lib/firestore';
import { useComments } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { Post } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import PostMedia from '@/components/ui/PostMedia';
import styles from './PostCard.module.css';

interface PostCardProps {
  post: Post;
  liked: boolean;
  /** Shows the delete control. True only for the founder who owns this post's startup. */
  isOwner?: boolean;
  /** Shows the delete control regardless of ownership, plus a delete-x on every comment. */
  isAdmin?: boolean;
  /**
   * Position within a single startup's own update thread. Omitted outside
   * that context (e.g. the general feed, which interleaves different
   * startups) — the connecting line only makes sense within one story.
   */
  threadPosition?: 'first' | 'middle' | 'last';
}

export default function PostCard({
  post,
  liked,
  isOwner = false,
  isAdmin = false,
  threadPosition,
}: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [pendingLike, setPendingLike] = useState(false);
  /** Local guess applied while the write is in flight. */
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  async function handleDelete() {
    if (!confirmingDelete) {
      // First click asks; it does not act. A destructive control needs a
      // second, deliberate tap rather than firing on the first touch.
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    setFailed(null);
    try {
      await deletePost(post.startupId, post.id);
      // No further state to set on success: the live subscription this card
      // came from removes it, which unmounts this component.
    } catch (err) {
      setDeleting(false);
      setConfirmingDelete(false);
      setFailed(err instanceof Error ? err.message : 'Could not delete that.');
      setTimeout(() => setFailed(null), 3200);
    }
  }

  return (
    <article className={styles.card}>
      {threadPosition && (
        <span className={styles.threadLine} data-pos={threadPosition} aria-hidden="true" />
      )}

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
            {post.isLaunch ? (
              <span className={styles.launch}>Launched</span>
            ) : (
              <span className={styles.updateTag}>Update</span>
            )}
            <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>

        {(isOwner || isAdmin) && (
          <button
            type="button"
            className={clsx(styles.delete, confirmingDelete && styles.deleteConfirm)}
            onClick={handleDelete}
            onBlur={() => setConfirmingDelete(false)}
            disabled={deleting}
            aria-label={confirmingDelete ? 'Confirm delete' : `Delete this update on ${post.startupName}`}
            title={confirmingDelete ? 'Click again to delete' : 'Delete'}
          >
            {deleting ? (
              <Loader2 size={15} className={styles.spin} aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            {confirmingDelete && <span className={styles.deleteLabel}>Confirm?</span>}
          </button>
        )}
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

      {showComments && <CommentThread post={post} isAdmin={isAdmin} />}
    </article>
  );
}

function CommentThread({ post, isAdmin }: { post: Post; isAdmin: boolean }) {
  const { data: comments, loading } = useComments(post.startupId, post.id, true);
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  async function remove(commentId: string) {
    setRemovingId(commentId);
    setError(null);
    try {
      await deleteComment(post.startupId, post.id, commentId);
      // The live subscription removes it from the list on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that comment.');
    } finally {
      setRemovingId(null);
    }
  }

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
              {isAdmin && (
                <button
                  type="button"
                  className={styles.commentDelete}
                  onClick={() => remove(c.id)}
                  disabled={removingId === c.id}
                  aria-label={`Remove this comment from ${c.authorName}`}
                  title="Remove comment"
                >
                  {removingId === c.id ? (
                    <Loader2 size={12} className={styles.spin} aria-hidden="true" />
                  ) : (
                    <X size={12} aria-hidden="true" />
                  )}
                </button>
              )}
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
