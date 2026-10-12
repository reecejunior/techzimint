'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Heart, Loader2, MessageCircle, Send } from 'lucide-react';
import clsx from 'clsx';
import { addCommunityComment, markCommunityAnswer, toggleCommunityLike } from '@/lib/firestore';
import { useCommunityComments, useCommunityPost, useMyCommunityLikes, useMyUid } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { CommunityComment, CommunityPost } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './thread.module.css';

/* ─── Like button ───
 * Same optimistic pattern as PostCard/CommunityCard — a local guess while the
 * write is in flight, the live subscription owns the truth once it lands. */
function LikeButton({ post, liked }: { post: CommunityPost; liked: boolean }) {
  const [pending, setPending] = useState(false);
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const isLiked = optimistic?.liked ?? liked;
  const likeCount = Math.max(0, post.likeCount + (optimistic?.delta ?? 0));

  async function like() {
    if (pending) return;
    const next = !isLiked;
    setOptimistic({ liked: next, delta: next ? 1 : -1 });
    setPending(true);
    setFailed(null);
    try {
      await toggleCommunityLike(post.id);
      setOptimistic(null);
    } catch (err) {
      setOptimistic(null);
      setFailed(err instanceof Error ? err.message : 'Could not save that.');
      setTimeout(() => setFailed(null), 3200);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={clsx(styles.action, isLiked && styles.liked)}
        onClick={like}
        disabled={pending}
        aria-pressed={isLiked}
        aria-label={`${isLiked ? 'Unlike' : 'Like'} this post. ${likeCount} likes.`}
      >
        <Heart size={17} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
        <span className={styles.actionCount}>{likeCount}</span>
      </button>
      {failed && (
        <p className={styles.failed} role="alert">
          {failed}
        </p>
      )}
    </>
  );
}

/* ─── One comment row ─── */
function CommentRow({
  comment,
  canAccept,
  acceptPending,
  onReply,
  onAccept,
}: {
  comment: CommunityComment;
  /** Shows the "Accept as answer" control — only the post's own author, only
   *  on a question, and only for a top-level reply (never a nested one). */
  canAccept: boolean;
  acceptPending: boolean;
  onReply: () => void;
  onAccept: () => void;
}) {
  return (
    <div className={clsx(styles.comment, comment.isAccepted && styles.commentAccepted)}>
      <Avatar initials={comment.authorAvatar} size="sm" color="#8A7C70" />
      <div className={styles.commentBody}>
        <p className={styles.commentHead}>
          <span className={styles.commentAuthor}>{comment.authorName}</span>
          {comment.isAccepted && (
            <span className={styles.acceptedTag}>
              <CheckCircle2 size={12} aria-hidden="true" /> Accepted answer
            </span>
          )}
          <time className={styles.commentTime} dateTime={comment.createdAt}>
            {timeAgo(comment.createdAt)}
          </time>
        </p>
        <p className={styles.commentText}>{comment.body}</p>
        <div className={styles.commentActions}>
          <button type="button" className={styles.replyBtn} onClick={onReply}>
            Reply
          </button>
          {canAccept && (
            <button
              type="button"
              className={styles.acceptBtn}
              onClick={onAccept}
              disabled={acceptPending}
              aria-pressed={comment.isAccepted}
            >
              {acceptPending ? (
                <Loader2 size={12} className={styles.spin} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={12} aria-hidden="true" />
              )}
              {comment.isAccepted ? 'Unaccept' : 'Accept as answer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Comments + reply form ─── */
function CommentsSection({ post }: { post: CommunityPost }) {
  const { data: comments, loading } = useCommunityComments(post.id);
  const uid = useMyUid();
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const isAsker = Boolean(uid && post.authorId && uid === post.authorId);
  // Only a question can be "answered" — the control never appears on a
  // showcase, regardless of who's viewing.
  const showAccept = isAsker && post.kind === 'question';

  const topLevel = comments.filter(c => !c.parentId);
  const repliesByParent = new Map<string, CommunityComment[]>();
  for (const c of comments) {
    if (!c.parentId) continue;
    if (!repliesByParent.has(c.parentId)) repliesByParent.set(c.parentId, []);
    repliesByParent.get(c.parentId)!.push(c);
  }

  async function accept(commentId: string) {
    setAcceptingId(commentId);
    setError(null);
    try {
      await markCommunityAnswer(post.id, commentId);
      // The live subscriptions on both the post and its comments own the
      // truth from here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept that answer.');
    } finally {
      setAcceptingId(null);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await addCommunityComment(post.id, body, name, replyTo?.id ?? null);
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
      <h2 className={styles.threadHeading}>
        <MessageCircle size={16} aria-hidden="true" />
        {post.kind === 'question' ? 'Replies' : 'Comments'} ({post.commentCount})
      </h2>

      {loading ? (
        <p className={styles.threadEmpty}>Loading…</p>
      ) : topLevel.length === 0 ? (
        <p className={styles.threadEmpty}>
          {post.kind === 'question'
            ? 'No replies yet. Be the first to help out.'
            : 'No comments yet. Say something nice (or useful).'}
        </p>
      ) : (
        <ul className={styles.comments}>
          {topLevel.map(c => (
            <li key={c.id}>
              <CommentRow
                comment={c}
                canAccept={showAccept}
                acceptPending={acceptingId === c.id}
                onReply={() => setReplyTo({ id: c.id, authorName: c.authorName })}
                onAccept={() => accept(c.id)}
              />
              {(repliesByParent.get(c.id) ?? []).length > 0 && (
                <ul className={styles.replies}>
                  {repliesByParent.get(c.id)!.map(r => (
                    <li key={r.id}>
                      <CommentRow
                        comment={r}
                        canAccept={false}
                        acceptPending={false}
                        // Replying to a reply re-parents to its own top-level
                        // parent — there's only one level of nesting.
                        onReply={() => setReplyTo({ id: c.id, authorName: r.authorName })}
                        onAccept={() => {}}
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
            placeholder={
              replyTo
                ? `Reply to ${replyTo.authorName}…`
                : post.kind === 'question'
                  ? 'Write a helpful reply…'
                  : 'Add a comment…'
            }
            maxLength={2000}
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

/* ─── MAIN ─── */
export default function CommunityThreadClient({ postId }: { postId: string }) {
  const { data: post, loading, error } = useCommunityPost(postId);
  const likes = useMyCommunityLikes();

  if (error) {
    return (
      <div className={`wrap ${styles.stateWrap}`}>
        <ErrorState message={error} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`wrap ${styles.stateWrap}`}>
        <div className={`skel ${styles.skelHeader}`} />
        <div className={`skel ${styles.skelBody}`} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className={`wrap ${styles.stateWrap}`}>
        <EmptyState title="We couldn't find that post">
          It may have been removed, or the link may be wrong.{' '}
          <Link href="/community">Back to the community</Link>.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="wrap">
        <Link href="/community" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Community
        </Link>

        <article className={styles.post}>
          <div className={styles.head}>
            <span
              className={clsx(
                styles.kindBadge,
                post.kind === 'question' ? styles.kindQuestion : styles.kindShowcase,
              )}
            >
              {post.kind === 'question' ? 'Question' : 'Show & Tell'}
            </span>
            {post.kind === 'question' && (
              <span className={clsx(styles.statusBadge, post.isAnswered && styles.statusAnswered)}>
                {post.isAnswered && <CheckCircle2 size={12} aria-hidden="true" />}
                {post.isAnswered ? 'Answered' : 'Open'}
              </span>
            )}
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          <div className={styles.meta}>
            <Avatar initials={post.authorAvatar} size="sm" color="#8A7C70" />
            <span className={styles.authorName}>{post.authorName}</span>
            <time className={styles.time} dateTime={post.createdAt}>
              {timeAgo(post.createdAt)}
            </time>
          </div>

          <p className={styles.body}>{post.body}</p>

          {post.tags.length > 0 && (
            <ul className={styles.tags}>
              {post.tags.map(t => (
                <li key={t} className={styles.tag}>
                  #{t}
                </li>
              ))}
            </ul>
          )}

          <div className={styles.actions}>
            <LikeButton post={post} liked={likes.has(post.id)} />
          </div>
        </article>

        <CommentsSection post={post} />
      </div>
    </div>
  );
}
