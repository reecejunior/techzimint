'use client';

import Link from 'next/link';
import { Calendar, MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { useReviewerProfile } from '@/lib/hooks';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import StarRating from '@/components/ui/StarRating';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './profile.module.css';

export default function ProfileClient({ username }: { username: string }) {
    const { data, loading, error } = useReviewerProfile(username);
    const { reviewer, reviews } = data;

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
                <div className={`skel ${styles.skelCard}`} />
                <div className={`skel ${styles.skelStats}`} />
                <div className={`skel ${styles.skelList}`} />
            </div>
        );
    }

    if (!reviewer) {
        return (
            <div className={`wrap ${styles.stateWrap}`}>
                <EmptyState title="No reviewer by that name">
                    The profile may have been removed. <Link href="/">Back to the leaderboard</Link>.
                </EmptyState>
            </div>
        );
    }

    const totalHelpful = reviews.reduce((n, r) => n + r.helpfulCount, 0);

    return (
        <div className={styles.page}>
            <div className="wrap">
                <header className={styles.profileCard}>
                    <Avatar
                        initials={reviewer.avatarInitials}
                        color={reviewer.avatarColor}
                        size="xl"
                        name={reviewer.name}
                    />
                    <div className={styles.profileInfo}>
                        <div className={styles.nameLine}>
                            <h1 className={styles.name}>{reviewer.name}</h1>
                            {reviewer.isTrustedTester && <Badge variant="trusted">Trusted tester</Badge>}
                        </div>
                        <p className={styles.username}>@{reviewer.username}</p>
                        {reviewer.bio && <p className={styles.bio}>{reviewer.bio}</p>}
                        {reviewer.joinedAt && (
                            <p className={styles.joinDate}>
                                <Calendar size={12} aria-hidden="true" />
                                Joined{' '}
                                {new Date(reviewer.joinedAt).toLocaleDateString('en-GB', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                        )}
                    </div>
                </header>

                {/* Counts come from the reviews actually on file, so the stat row
                    can never claim more than the list below it shows. */}
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <MessageSquare size={17} className={styles.statIcon} aria-hidden="true" />
                        <span className={styles.statNum}>{reviews.length}</span>
                        <span className={styles.statLabel}>Reviews</span>
                    </div>
                    <div className={styles.statCard}>
                        <ThumbsUp size={17} className={styles.statIcon} aria-hidden="true" />
                        <span className={styles.statNum}>{totalHelpful}</span>
                        <span className={styles.statLabel}>Found helpful</span>
                    </div>
                    <div className={styles.statCard}>
                        <Star size={17} className={styles.statIcon} aria-hidden="true" />
                        <span className={styles.statNum}>{reviewer.isTrustedTester ? 'Yes' : '—'}</span>
                        <span className={styles.statLabel}>Trusted tester</span>
                    </div>
                </div>

                {reviewer.isTrustedTester && (
                    <div className={styles.trustedBanner}>
                        <span className={styles.trustedIcon}>Trusted</span>
                        <div>
                            <strong>Trusted tester</strong>
                            <p>
                                {reviewer.name} earned this badge for consistently writing
                                high-quality reviews the community finds valuable.
                            </p>
                        </div>
                    </div>
                )}

                <section>
                    <h2 className={styles.sectionTitle}>Review history ({reviews.length})</h2>

                    {reviews.length === 0 ? (
                        <EmptyState title="No reviews yet">
                            <Link href="/">Explore startups</Link> to leave the first one.
                        </EmptyState>
                    ) : (
                        <div className={styles.reviewList}>
                            {reviews.map(r => {
                                const avg = (r.ratingUX + r.ratingUsefulness + r.ratingWouldPay) / 3;
                                return (
                                    <article key={r.id} className={styles.reviewCard}>
                                        <div className={styles.reviewTop}>
                                            <Link
                                                href={`/startups/${r.startupSlug}`}
                                                className={styles.startupLink}
                                            >
                                                {r.startupName}
                                            </Link>
                                            <StarRating value={avg} size={13} showNumber />
                                            <time className={styles.reviewDate} dateTime={r.createdAt}>
                                                {r.createdAt}
                                            </time>
                                        </div>

                                        <div className={styles.reviewDims}>
                                            <span>
                                                UX <strong>{r.ratingUX}/5</strong>
                                            </span>
                                            <span>
                                                Usefulness <strong>{r.ratingUsefulness}/5</strong>
                                            </span>
                                            <span>
                                                Would pay <strong>{r.ratingWouldPay}/5</strong>
                                            </span>
                                        </div>

                                        {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}

                                        <p className={styles.reviewFooter}>
                                            <ThumbsUp size={11} aria-hidden="true" />
                                            <span>{r.helpfulCount} found this helpful</span>
                                        </p>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
