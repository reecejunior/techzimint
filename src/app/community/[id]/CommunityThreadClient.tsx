'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  Heart,
  Link2,
  Loader2,
  MessageCircle,
  Send,
} from 'lucide-react';
import clsx from 'clsx';
import {
  addCommunityComment,
  castCommunityPollVote,
  markCommunityAnswer,
  retractCommunityPollVote,
  toggleCommunityCommentLike,
  toggleCommunityLike,
} from '@/lib/firestore';
import {
  useCommunityComments,
  useCommunityPollVotes,
  useCommunityPost,
  useMyCommunityCommentLikes,
  useMyCommunityLikes,
  useMyUid,
} from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import type { CommunityComment, CommunityPost } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import FormattedText from '@/components/ui/FormattedText';
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

/* ─── Copy link ───
 * Pure client convenience: no backend involved at all, just the page's own
 * URL onto the clipboard, with a brief "Copied" swap standing in for a toast. */
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be denied (insecure context, permissions, an
      // older browser) — fail quietly rather than throw in the visitor's face
      // over what is, at worst, a missed convenience.
    }
  }

  return (
    <button type="button" className={styles.action} onClick={copy}>
      {copied ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}
      <span className={styles.actionLabel}>{copied ? 'Copied' : 'Copy link'}</span>
    </button>
  );
}

/* ─── Poll ───
 * Options render as plain buttons until the visitor has voted (or asks to
 * peek at results without voting) — like Twitter/X or Slack, never forcing a
 * vote just to see where things stand. Once results show, every option is a
 * single-hue meter: a --brand fill on a neutral track plus a direct
 * percentage, not a different hue per option — each option already carries
 * its own label, so a colour-per-option would be an encoding nobody asked
 * for, and it would break "one accent colour, nothing else saturated". */
function PollBlock({ post }: { post: CommunityPost }) {
  const { counts, totalVotes, myVote, loading } = useCommunityPollVotes(post.id);
  const [revealResults, setRevealResults] = useState(false);
  const [pendingOption, setPendingOption] = useState<string | null>(null);
  // Shown the instant a click is sent, before the vote doc's own listener
  // confirms it — otherwise clicking an option would visibly do nothing for
  // a beat. Cleared once the live `myVote` catches up to it, or on failure.
  const [optimisticVote, setOptimisticVote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const effectiveVote = optimisticVote ?? myVote;
  const hasVoted = Boolean(effectiveVote);
  const showResults = hasVoted || revealResults;

  // Folds the optimistic pick into the live tally so the meter and
  // percentages move the instant you click, rather than waiting a round
  // trip for the vote listener to report back.
  const displayCounts = new Map(counts);
  let displayTotal = totalVotes;
  if (optimisticVote && optimisticVote !== myVote) {
    if (myVote) displayCounts.set(myVote, Math.max(0, (displayCounts.get(myVote) ?? 1) - 1));
    else displayTotal += 1;
    displayCounts.set(optimisticVote, (displayCounts.get(optimisticVote) ?? 0) + 1);
  }

  async function vote(optionId: string) {
    if (pendingOption) return;
    setPendingOption(optionId);
    setOptimisticVote(optionId);
    setError(null);
    try {
      await castCommunityPollVote(post.id, optionId);
    } catch (err) {
      setOptimisticVote(null);
      setError(err instanceof Error ? err.message : 'Could not save your vote.');
    } finally {
      setPendingOption(null);
    }
  }

  async function retract() {
    if (pendingOption) return;
    setPendingOption('__retract');
    setOptimisticVote(null);
    setError(null);
    try {
      await retractCommunityPollVote(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove your vote.');
    } finally {
      setPendingOption(null);
    }
  }

  return (
    <div className={styles.poll}>
      <ul className={styles.pollOptions}>
        {post.pollOptions.map(opt => {
          const count = displayCounts.get(opt.id) ?? 0;
          const pct = displayTotal > 0 ? Math.round((count / displayTotal) * 100) : 0;
          const mine = effectiveVote === opt.id;
          const busy = pendingOption === opt.id;

          if (!showResults) {
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  className={styles.pollOption}
                  onClick={() => vote(opt.id)}
                  disabled={Boolean(pendingOption)}
                >
                  {busy && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
                  {opt.label}
                </button>
              </li>
            );
          }

          return (
            <li key={opt.id}>
              <button
                type="button"
                className={clsx(styles.pollResult, mine && styles.pollResultMine)}
                onClick={() => vote(opt.id)}
                disabled={Boolean(pendingOption)}
                aria-pressed={mine}
              >
                <span className={styles.pollResultTop}>
                  <span className={styles.pollResultLabel}>
                    {mine && <CheckCircle2 size={13} aria-hidden="true" />}
                    {opt.label}
                  </span>
                  <span className={styles.pollResultPct}>{pct}%</span>
                </span>
                <span className={styles.pollResultTrack}>
                  <span className={styles.pollResultFill} style={{ width: `${pct}%` }} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.pollMeta}>
        <span>
          {loading ? 'Loading votes…' : `${displayTotal} vote${displayTotal === 1 ? '' : 's'}`}
        </span>
        {!hasVoted && (
          <button type="button" className={styles.pollToggle} onClick={() => setRevealResults(r => !r)}>
            {revealResults ? 'Hide results' : 'View results'}
          </button>
        )}
        {hasVoted && (
          <button
            type="button"
            className={styles.pollToggle}
            onClick={retract}
            disabled={pendingOption === '__retract'}
          >
            Remove my vote
          </button>
        )}
      </div>

      {error && (
        <p className={styles.failed} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── One comment row ─── */
function CommentRow({
  postId,
  comment,
  liked,
  canAccept,
  acceptPending,
  onReply,
  onAccept,
}: {
  postId: string;
  comment: CommunityComment;
  liked: boolean;
  /** Shows the "Accept as answer" control — only the post's own author, only
   *  on a question, and only for a top-level reply (never a nested one). */
  canAccept: boolean;
  acceptPending: boolean;
  onReply: () => void;
  onAccept: () => void;
}) {
  const [pendingLike, setPendingLike] = useState(false);
  const [optimistic, setOptimistic] = useState<{ liked: boolean; delta: number } | null>(null);

  const isLiked = optimistic?.liked ?? liked;
  const likeCount = Math.max(0, comment.likeCount + (optimistic?.delta ?? 0));

  async function like() {
    if (pendingLike) return;
    const next = !isLiked;
    setOptimistic({ liked: next, delta: next ? 1 : -1 });
    setPendingLike(true);
    try {
      await toggleCommunityCommentLike(postId, comment.id);
      setOptimistic(null);
    } catch {
      setOptimistic(null);
    } finally {
      setPendingLike(false);
    }
  }

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
        <div className={styles.commentText}>
          <FormattedText text={comment.body} />
        </div>
        <div className={styles.commentActions}>
          <button
            type="button"
            className={clsx(styles.commentLike, isLiked && styles.liked)}
            onClick={like}
            disabled={pendingLike}
            aria-pressed={isLiked}
            aria-label={`${isLiked ? 'Unlike' : 'Like'} this reply. ${likeCount} likes.`}
          >
            <Heart size={12} fill={isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            {likeCount > 0 && <span className={styles.commentLikeCount}>{likeCount}</span>}
          </button>
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
  const commentLikes = useMyCommunityCommentLikes();
  const [body, setBody] = useState('');
  const [name, setName] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string } | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const isAsker = Boolean(uid && post.authorId && uid === post.authorId);
  // Only a question can be "answered" — the control never appears on a
  // showcase or poll, regardless of who's viewing.
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
            : post.kind === 'poll'
              ? 'No comments yet. Say why you voted the way you did.'
              : 'No comments yet. Say something nice (or useful).'}
        </p>
      ) : (
        <ul className={styles.comments}>
          {topLevel.map(c => (
            <li key={c.id}>
              <CommentRow
                postId={post.id}
                comment={c}
                liked={commentLikes.has(c.id)}
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
                        postId={post.id}
                        comment={r}
                        liked={commentLikes.has(r.id)}
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
                post.kind === 'showcase' ? styles.kindShowcase : styles.kindNeutral,
              )}
            >
              {post.kind === 'question' ? (
                'Question'
              ) : post.kind === 'poll' ? (
                <>
                  <BarChart3 size={12} aria-hidden="true" /> Poll
                </>
              ) : (
                'Show & Tell'
              )}
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

          <div className={styles.body}>
            <FormattedText text={post.body} />
          </div>

          {post.kind === 'poll' && <PollBlock post={post} />}

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
            <CopyLinkButton />
          </div>
        </article>

        <CommentsSection post={post} />
      </div>
    </div>
  );
}
