'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
    ArrowLeft, Globe, Heart, Loader2, MessageCircle, MessageSquare, Play, Smartphone, Star,
    ThumbsUp,
} from 'lucide-react';
import { addPost, addReview, toggleHelpful } from '@/lib/firestore';
import {
    useMyHelpfulMarks, useMyLikes, useMyUid, useReviews, useStartup, useStartupPosts,
} from '@/lib/hooks';
import type { PostVideo, RankHistory, Review, Startup, PostImage } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Logo from '@/components/ui/Logo';
import StarRating from '@/components/ui/StarRating';
import MediaPicker from '@/components/ui/MediaPicker';
import PostCard from '@/components/PostCard';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './detail.module.css';

/* ─── Rank history ───
   Plotted on a reversed axis so #1 sits at the top, rather than inverting the
   data and hoping the scale never overflows. */
function RankChart({ data }: { data: RankHistory[] }) {
    if (data.length < 2) {
        return (
            <p className={styles.chartEmpty}>
                Not enough history yet — this fills in as weekly standings are recorded.
            </p>
        );
    }

    return (
        <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={88}>
                <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <XAxis
                        dataKey="week"
                        tick={{ fontSize: 10, fill: '#7C756E' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <YAxis hide reversed domain={[1, 'dataMax']} />
                    <Tooltip
                        cursor={{ stroke: 'var(--hairline-strong)' }}
                        content={({ active, payload, label }) =>
                            active && payload?.length ? (
                                <div className={styles.chartTooltip}>
                                    <span>{label}</span>
                                    <strong>#{payload[0].value}</strong>
                                </div>
                            ) : null
                        }
                    />
                    <Line
                        type="monotone"
                        dataKey="rank"
                        stroke="var(--orange-500)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--orange-500)', r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: 'var(--orange-600)' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

/* ─── Review card ─── */
function ReviewCard({
    review,
    startupId,
    marked,
}: {
    review: Review;
    startupId: string;
    marked: boolean;
}) {
    const [pending, setPending] = useState(false);
    const [optimistic, setOptimistic] = useState<{ marked: boolean; delta: number } | null>(null);

    const isMarked = optimistic?.marked ?? marked;
    const count = Math.max(0, review.helpfulCount + (optimistic?.delta ?? 0));

    async function mark() {
        if (pending) return;
        const next = !isMarked;
        setOptimistic({ marked: next, delta: next ? 1 : -1 });
        setPending(true);
        try {
            await toggleHelpful(startupId, review.id);
        } catch (err) {
            console.error('Helpful mark failed:', err);
        } finally {
            setOptimistic(null);
            setPending(false);
        }
    }

    return (
        <article className={styles.review}>
            <div className={styles.reviewTop}>
                <Avatar initials={review.authorAvatar} size="sm" color="#8A7C70" />
                <div className={styles.reviewAuthorGroup}>
                    <span className={styles.reviewAuthor}>{review.authorName}</span>
                    {review.isFounder && <Badge variant="founder">Founder</Badge>}
                    {review.isTrustedTester && <Badge variant="trusted">Trusted</Badge>}
                </div>
                <time className={styles.reviewDate} dateTime={review.createdAt}>
                    {review.createdAt.slice(0, 10)}
                </time>
            </div>

            <div className={styles.reviewRatings}>
                <span>
                    UX <StarRating value={review.ratingUX} size={12} />
                </span>
                <span>
                    Usefulness <StarRating value={review.ratingUsefulness} size={12} />
                </span>
                <span>
                    Would pay <StarRating value={review.ratingWouldPay} size={12} />
                </span>
            </div>

            {review.comment && <p className={styles.reviewComment}>{review.comment}</p>}

            <button
                type="button"
                className={styles.helpfulBtn}
                data-marked={isMarked || undefined}
                onClick={mark}
                disabled={pending}
                aria-pressed={isMarked}
            >
                <ThumbsUp size={12} aria-hidden="true" /> Helpful ({count})
            </button>
        </article>
    );
}

/* ─── Review form ─── */
const DIMENSIONS = [
    { key: 'ratingUX', label: 'UX / Design' },
    { key: 'ratingUsefulness', label: 'Usefulness' },
    { key: 'ratingWouldPay', label: 'Would you pay?' },
] as const;

function ReviewForm({
    startupId,
    onDone,
    onCancel,
}: {
    startupId: string;
    onDone: () => void;
    onCancel: () => void;
}) {
    const [ratings, setRatings] = useState({ ratingUX: 0, ratingUsefulness: 0, ratingWouldPay: 0 });
    const [hovered, setHovered] = useState<{ key: string; n: number } | null>(null);
    const [authorName, setAuthorName] = useState('');
    const [comment, setComment] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const complete = DIMENSIONS.every(d => ratings[d.key] > 0);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!complete || saving) return;
        setSaving(true);
        setError(null);
        try {
            await addReview(startupId, { ...ratings, comment, authorName });
            onDone();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not save your review.');
            setSaving(false);
        }
    }

    return (
        <form className={styles.reviewForm} onSubmit={submit}>
            <div className={styles.formDimensions}>
                {DIMENSIONS.map(d => (
                    <div key={d.key} className={styles.formDim}>
                        <span className={styles.formDimLabel}>{d.label}</span>
                        <div
                            className={styles.formStars}
                            role="radiogroup"
                            aria-label={d.label}
                            onMouseLeave={() => setHovered(null)}
                        >
                            {[1, 2, 3, 4, 5].map(n => {
                                // Hovering the 4th star lights the first four, not just one.
                                const shown = hovered?.key === d.key ? hovered.n : ratings[d.key];
                                return (
                                    <button
                                        key={n}
                                        type="button"
                                        role="radio"
                                        aria-checked={ratings[d.key] === n}
                                        aria-label={`${n} out of 5`}
                                        className={styles.formStar}
                                        data-on={n <= shown || undefined}
                                        onMouseEnter={() => setHovered({ key: d.key, n })}
                                        onFocus={() => setHovered({ key: d.key, n })}
                                        onBlur={() => setHovered(null)}
                                        onClick={() => setRatings(r => ({ ...r, [d.key]: n }))}
                                    >
                                        <Star
                                            size={20}
                                            fill={n <= shown ? 'currentColor' : 'none'}
                                            strokeWidth={1.75}
                                            aria-hidden="true"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <input
                className={styles.formInput}
                placeholder="Your name (optional)"
                maxLength={60}
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                aria-label="Your name"
            />
            <textarea
                className={styles.formTextarea}
                placeholder="What worked, what didn't, and who you'd recommend it to…"
                rows={3}
                maxLength={1500}
                value={comment}
                onChange={e => setComment(e.target.value)}
                aria-label="Your review"
            />

            {error && (
                <p className={styles.formError} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.formActions}>
                <button type="button" className={styles.formCancel} onClick={onCancel}>
                    Cancel
                </button>
                <button
                    type="submit"
                    className={styles.formSubmit}
                    disabled={!complete || saving}
                    id="submit-review-btn"
                    title={complete ? undefined : 'Rate all three first'}
                >
                    {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
                    {saving ? 'Saving…' : 'Post review'}
                </button>
            </div>
        </form>
    );
}

/* ─── Founder's post composer ─── */
function PostComposer({ startupId }: { startupId: string }) {
    const [body, setBody] = useState('');
    const [images, setImages] = useState<PostImage[]>([]);
    const [video, setVideo] = useState<PostVideo | null>(null);
    const [checkingLink, setChecking] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const empty = !body.trim() && images.length === 0 && !video;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (empty || saving || checkingLink) return;
        setSaving(true);
        setError(null);
        try {
            await addPost(startupId, { body, images, video });
            setBody('');
            setImages([]);
            setVideo(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not post that update.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <form className={styles.composer} onSubmit={submit}>
            <textarea
                className={styles.composerText}
                placeholder="Share an update — a launch, a milestone, a new feature…"
                rows={3}
                maxLength={2000}
                value={body}
                onChange={e => setBody(e.target.value)}
                aria-label="Post an update"
            />

            <MediaPicker
                images={images}
                video={video}
                onImagesChange={setImages}
                onVideoChange={setVideo}
                onBusyChange={setChecking}
            />

            {error && (
                <p className={styles.formError} role="alert">
                    {error}
                </p>
            )}

            <div className={styles.composerActions}>
                <button
                    type="submit"
                    className={styles.formSubmit}
                    disabled={empty || saving || checkingLink}
                    title={checkingLink ? 'Checking that link first' : undefined}
                >
                    {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
                    {saving ? 'Posting…' : 'Post update'}
                </button>
            </div>
        </form>
    );
}

/* ─── MAIN ─── */
export default function StartupDetailClient({ slug }: { slug: string }) {
    const { data: startup, loading, error } = useStartup(slug);

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

    if (!startup) {
        return (
            <div className={`wrap ${styles.stateWrap}`}>
                <EmptyState title="We couldn't find that startup">
                    It may have been removed, or the link may be wrong.{' '}
                    <Link href="/">Back to the feed</Link>.
                </EmptyState>
            </div>
        );
    }

    return <Loaded startup={startup} />;
}

function Loaded({ startup }: { startup: Startup }) {
    const { data: posts, loading: postsLoading } = useStartupPosts(startup.id);
    const { data: reviews, loading: reviewsLoading } = useReviews(startup.id);
    const helpfulMarks = useMyHelpfulMarks();
    const likes = useMyLikes();
    const uid = useMyUid();
    const [showForm, setShowForm] = useState(false);
    const [justSubmitted, setJustSubmitted] = useState(false);

    const isOwner = Boolean(uid && startup.ownerId && uid === startup.ownerId);

    return (
        <div className={styles.page}>
            <div className="wrap">
                <Link href="/" className={styles.back}>
                    <ArrowLeft size={14} aria-hidden="true" />
                    Feed
                </Link>

                {/* Posts go live on submit, so this only appears for something a
                    moderator has since pulled — or an older pending record. Either
                    way the page still loads, and should say why it's not listed. */}
                {startup.status !== 'approved' && (
                    <div className={styles.pendingNotice} role="status">
                        <strong>
                            {startup.status === 'rejected' ? 'Removed from the feed' : 'Awaiting review'}
                        </strong>
                        <p>
                            {startup.status === 'rejected'
                                ? `${startup.name} has been taken down by a moderator. This page still works, but it won't appear in the feed or the leaderboard.`
                                : `This page is live, but ${startup.name} won't appear in the feed or the leaderboard until it's approved.`}
                        </p>
                    </div>
                )}

                <header className={styles.header}>
                    <div className={styles.headerLeft}>
                        <Logo
                            name={startup.name}
                            url={startup.logoUrl}
                            initials={startup.logoInitials}
                            size="xl"
                        />
                        <div className={styles.headerMeta}>
                            <div className={styles.headerBadges}>
                                <Badge variant="category">{startup.category}</Badge>
                                <Badge variant="region">{startup.region}</Badge>
                                {startup.isStartupOfWeek && <Badge variant="week">Startup of the Week</Badge>}
                                {startup.isTrending && <Badge variant="trending">Trending</Badge>}
                            </div>
                            <h1 className={styles.name}>{startup.name}</h1>
                            <p className={styles.tagline}>{startup.tagline}</p>
                            {startup.founders.length > 0 && (
                                <p className={styles.founders}>by {startup.founders.join(' & ')}</p>
                            )}
                        </div>
                    </div>

                    <dl className={styles.headerStats}>
                        <div className={styles.headerStat}>
                            <dt><Heart size={13} aria-hidden="true" /> Likes</dt>
                            <dd>{startup.likeCount}</dd>
                        </div>
                        <div className={styles.headerStat}>
                            <dt><MessageCircle size={13} aria-hidden="true" /> Comments</dt>
                            <dd>{startup.commentCount}</dd>
                        </div>
                        <div className={styles.headerStat}>
                            <dt><Star size={13} aria-hidden="true" /> Reviews</dt>
                            <dd>{startup.reviewCount}</dd>
                        </div>
                    </dl>
                </header>

                {(startup.website || startup.demo || startup.apk) && (
                    <div className={styles.links}>
                        {startup.website && (
                            <a href={startup.website} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                                <Globe size={14} aria-hidden="true" />
                                {startup.website.replace(/^https?:\/\//, '')}
                            </a>
                        )}
                        {startup.demo && (
                            <a href={startup.demo} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                                <Play size={14} aria-hidden="true" />
                                Demo
                            </a>
                        )}
                        {startup.apk && (
                            <a href={startup.apk} target="_blank" rel="noopener noreferrer" className={styles.extLink}>
                                <Smartphone size={14} aria-hidden="true" />
                                APK
                            </a>
                        )}
                    </div>
                )}

                {startup.description && <p className={styles.description}>{startup.description}</p>}

                <div className={styles.grid}>
                    <div className={styles.main}>
                        {/* Posts first: this is the startup's own slice of the feed. */}
                        <section aria-labelledby="updates-heading">
                            <h2 className={styles.sectionTitle} id="updates-heading">
                                Updates {startup.postCount > 0 && `(${startup.postCount})`}
                            </h2>

                            {isOwner && <PostComposer startupId={startup.id} />}

                            {postsLoading ? (
                                <p className={styles.quiet}>Loading updates…</p>
                            ) : posts.length === 0 ? (
                                <p className={styles.quiet}>No updates posted yet.</p>
                            ) : (
                                <div className={styles.posts}>
                                    {posts.map((p, i) => (
                                        <PostCard
                                            key={p.id}
                                            post={p}
                                            liked={likes.has(p.id)}
                                            isOwner={isOwner}
                                            threadPosition={
                                                posts.length < 2
                                                    ? undefined
                                                    : i === 0
                                                      ? 'first'
                                                      : i === posts.length - 1
                                                        ? 'last'
                                                        : 'middle'
                                            }
                                        />
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.reviewsSection} id="reviews" aria-labelledby="reviews-heading">
                            <div className={styles.reviewsHeader}>
                                <h2 className={styles.sectionTitle} id="reviews-heading">
                                    <MessageSquare size={15} aria-hidden="true" />
                                    Reviews ({startup.reviewCount})
                                </h2>
                                {!showForm && (
                                    <button
                                        className={styles.writeBtn}
                                        onClick={() => {
                                            setShowForm(true);
                                            setJustSubmitted(false);
                                        }}
                                        id="add-review-btn"
                                    >
                                        Write a review
                                    </button>
                                )}
                            </div>

                            {justSubmitted && (
                                <p className={styles.reviewSuccess} role="status">
                                    Thanks — your review is live.
                                </p>
                            )}

                            {showForm && (
                                <ReviewForm
                                    startupId={startup.id}
                                    onCancel={() => setShowForm(false)}
                                    onDone={() => {
                                        setShowForm(false);
                                        setJustSubmitted(true);
                                    }}
                                />
                            )}

                            {reviewsLoading ? (
                                <p className={styles.quiet}>Loading reviews…</p>
                            ) : reviews.length === 0 ? (
                                <p className={styles.quiet}>
                                    No reviews yet. Be the first to test {startup.name} and tell the
                                    community what you found.
                                </p>
                            ) : (
                                <div className={styles.reviewList}>
                                    {reviews.map(r => (
                                        <ReviewCard
                                            key={r.id}
                                            review={r}
                                            startupId={startup.id}
                                            marked={helpfulMarks.has(r.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className={styles.sidebar}>
                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}>Score</h2>
                            <div className={styles.scoreSummary}>
                                <div>
                                    <div className={styles.bigNum}>{startup.score.toLocaleString()}</div>
                                    <div className={styles.bigLabel}>
                                        {/* Rank comes from the approved set, so a pending or
                                            unranked startup has none — say that rather than
                                            printing "#0". */}
                                        {startup.rankWeek > 0
                                            ? `#${startup.rankWeek} this week`
                                            : 'Not ranked yet'}
                                    </div>
                                </div>
                            </div>

                            {startup.reviewCount === 0 ? (
                                <p className={styles.noRatings}>
                                    Ratings appear once this startup has its first review.
                                </p>
                            ) : (
                                <div className={styles.scoreDimensions}>
                                    {(
                                        [
                                            ['UX / Design', startup.avgUX],
                                            ['Usefulness', startup.avgUsefulness],
                                            ['Would you pay?', startup.avgWouldPay],
                                        ] as [string, number][]
                                    ).map(([label, val]) => (
                                        <div key={label}>
                                            <div className={styles.scoreDimHeader}>
                                                <span className={styles.scoreDimLabel}>{label}</span>
                                                <span className={styles.scoreDimVal}>{val.toFixed(1)}</span>
                                            </div>
                                            <div
                                                className={styles.scoreBar}
                                                role="meter"
                                                aria-valuenow={Number(val.toFixed(1))}
                                                aria-valuemin={0}
                                                aria-valuemax={5}
                                                aria-label={label}
                                            >
                                                <div
                                                    className={styles.scoreBarFill}
                                                    style={{ width: `${(val / 5) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className={styles.card}>
                            <h2 className={styles.cardTitle}>Rank history</h2>
                            <RankChart data={startup.rankHistory} />
                        </section>
                    </aside>
                </div>
            </div>
        </div>
    );
}
