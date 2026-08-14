'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Heart, Loader2, MessageCircle, Send, Star, Trash2, X } from 'lucide-react';
import clsx from 'clsx';
import { addComment, deleteComment, deletePost, toggleLike } from '@/lib/firestore';
import { useComments } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { Comment, Post } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
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
  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string } | null>(null);

  const topLevel = comments.filter(c => !c.parentId);
  const repliesByParent = new Map<string, Comment[]>();
  for (const c of comments) {
    if (!c.parentId) continue;
    if (!repliesByParent.has(c.parentId)) repliesByParent.set(c.parentId, []);
    repliesByParent.get(c.parentId)!.push(c);
  }

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
      await addComment(post.startupId, post.id, body, name, replyTo?.id ?? null);
      setBody('');
      setReplyTo(null);
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
      ) : topLevel.length === 0 ? (
        <p className={styles.threadEmpty}>No comments yet. Start the conversation.</p>
      ) : (
        <ul className={styles.comments}>
          {topLevel.map(c => (
            <li key={c.id}>
              <CommentRow
                comment={c}
                isAdmin={isAdmin}
                removingId={removingId}
                onRemove={remove}
                onReply={() => setReplyTo({ id: c.id, authorName: c.authorName })}
              />
              {(repliesByParent.get(c.id) ?? []).length > 0 && (
                <ul className={styles.replies}>
                  {repliesByParent.get(c.id)!.map(r => (
                    <li key={r.id}>
                      <CommentRow
                        comment={r}
                        isAdmin={isAdmin}
                        removingId={removingId}
                        onRemove={remove}
                        // Replying to a reply re-parents to its own top-level
                        // parent — there's only one level of nesting.
                        onReply={() => setReplyTo({ id: c.id, authorName: r.authorName })}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className={styles.form} onSubmit={send}>
        {replyTo && (
          <p className={styles.replyingTo}>
            Replying to <strong>{replyTo.authorName}</strong>
            <button type="button" className={styles.replyCancel} onClick={() => setReplyTo(null)}>
              Cancel
            </button>
          </p>
        )}
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
            placeholder={replyTo ? `Reply to ${replyTo.authorName}…` : `Add a comment on ${post.startupName}…`}
            maxLength={1000}
            value={body}
            onChange={e => setBody(e.target.value)}
            aria-label={replyTo ? `Reply to ${replyTo.authorName}` : 'Your comment'}
          />
          <button
            type="submit"
            className={styles.send}
            disabled={!body.trim() || sending}
            aria-label={replyTo ? 'Post reply' : 'Post comment'}
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

function CommentRow({
  comment,
  isAdmin,
  removingId,
  onRemove,
  onReply,
}: {
  comment: Comment;
  isAdmin: boolean;
  removingId: string | null;
  onRemove: (id: string) => void;
  onReply: () => void;
}) {
  return (
    <div className={styles.comment}>
      <Avatar initials={comment.authorAvatar} size="sm" color="#8A7C70" />
      <div className={styles.commentBody}>
        <p className={styles.commentHead}>
          <span className={styles.commentAuthor}>{comment.authorName}</span>
          {comment.isFounder && <Badge variant="founder">Founder</Badge>}
          <time className={styles.commentTime} dateTime={comment.createdAt}>
            {timeAgo(comment.createdAt)}
          </time>
        </p>
        <p className={styles.commentText}>{comment.body}</p>
        <button type="button" className={styles.replyBtn} onClick={onReply}>
          Reply
        </button>
      </div>
      {isAdmin && (
        <button
          type="button"
          className={styles.commentDelete}
          onClick={() => onRemove(comment.id)}
          disabled={removingId === comment.id}
          aria-label={`Remove this comment from ${comment.authorName}`}
          title="Remove comment"
        >
          {removingId === comment.id ? (
            <Loader2 size={12} className={styles.spin} aria-hidden="true" />
          ) : (
            <X size={12} aria-hidden="true" />
          )}
        </button>
      )}
    </div>
  );
}
