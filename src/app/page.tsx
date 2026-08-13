'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Loader2, Trophy } from 'lucide-react';
import { useAdminAuth, useFeed, useMyLikes, useMyUid, useStartups } from '@/lib/hooks';
import { categories } from '@/lib/types';
import PostCard from '@/components/PostCard';
import Logo from '@/components/ui/Logo';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

export default function FeedPage() {
  const { data: posts, loading, error, hasMore, loadingMore, loadMore } = useFeed();
  const likes = useMyLikes();
  const uid = useMyUid();
  const { isAdmin } = useAdminAuth();
  const { data: startups } = useStartups();
  const [category, setCategory] = useState('all');

  /* Category lives on the startup, not the post, so filter through the
     startups we already have subscribed rather than denormalising it again.
     Ownership is looked up the same way: posts don't carry the startup's
     ownerId, and this list — already loaded for the sidebar — has it. */
  const categoryById = useMemo(
    () => new Map(startups.map(s => [s.id, s.category])),
    [startups],
  );
  const ownerById = useMemo(
    () => new Map(startups.map(s => [s.id, s.ownerId])),
    [startups],
  );

  const visible = useMemo(
    () =>
      category === 'all'
        ? posts
        : posts.filter(p => categoryById.get(p.startupId) === category),
    [posts, category, categoryById],
  );

  const topThree = useMemo(
    () => [...startups].sort((a, b) => a.rankWeek - b.rankWeek).slice(0, 3),
    [startups],
  );

  return (
    <div className={styles.page}>
      <header className={`wrap ${styles.masthead}`}>
        <h1 className={styles.title}>Find startups</h1>
        <p className={styles.desc}>
          What Zimbabwean and African founders are shipping. Like what works, ask questions in
          the comments, and leave a review once you&apos;ve tried it — that&apos;s what moves the{' '}
          <Link href="/leaderboard" className={styles.inlineLink}>
            leaderboard
          </Link>
          .
        </p>
      </header>

      <div className={styles.layout}>
        <main className={styles.feedColumn}>
          <div className={styles.filterBar}>
            <div className={styles.chipScroller}>
              <div className={styles.chips} role="group" aria-label="Filter by category">
                <button
                  className={styles.chip}
                  data-active={category === 'all' || undefined}
                  aria-pressed={category === 'all'}
                  onClick={() => setCategory('all')}
                >
                  Everything
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    className={styles.chip}
                    data-active={category === c || undefined}
                    aria-pressed={category === c}
                    onClick={() => setCategory(category === c ? 'all' : c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error ? (
            <ErrorState message={error} />
          ) : loading ? (
            <div className={styles.feed}>
              {Array.from({ length: 3 }, (_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <EmptyState
              title={category === 'all' ? 'Nothing posted yet' : 'Nothing in that category yet'}
            >
              {category === 'all' ? (
                <>
                  Be the first — <Link href="/submit">post your startup</Link>.
                </>
              ) : (
                <>
                  Try another category, or <Link href="/submit">post your startup</Link>.
                </>
              )}
            </EmptyState>
          ) : (
            <>
              <div className={styles.feed}>
                {visible.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    liked={likes.has(post.id)}
                    isOwner={Boolean(uid) && ownerById.get(post.startupId) === uid}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>

              {hasMore && category === 'all' && (
                <button className={styles.more} onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <Loader2 size={15} className={styles.spin} aria-hidden="true" />
                      Loading
                    </>
                  ) : (
                    'Show older posts'
                  )}
                </button>
              )}
            </>
          )}
        </main>

        {/* Standings as a quiet aside, so the feed keeps the attention. */}
        <aside className={styles.sidebar}>
          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>
              <Trophy size={14} aria-hidden="true" />
              Top this week
            </h2>

            {topThree.length === 0 ? (
              <p className={styles.sideEmpty}>Ranks appear once startups are posted.</p>
            ) : (
              <ol className={styles.topList}>
                {topThree.map(s => (
                  <li key={s.id} className={styles.topItem}>
                    <span className={styles.topRank}>{s.rankWeek}</span>
                    <Logo name={s.name} url={s.logoUrl} initials={s.logoInitials} size="sm" />
                    <Link href={`/startups/${s.slug}`} className={styles.topName}>
                      {s.name}
                    </Link>
                    <span className={styles.topScore}>{s.scoreWeek.toLocaleString()}</span>
                  </li>
                ))}
              </ol>
            )}

            <Link href="/leaderboard" className={styles.sideLink}>
              Full leaderboard
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          </section>

          <section className={styles.sideCard}>
            <h2 className={styles.sideTitle}>Building something?</h2>
            <p className={styles.sideText}>
              Post your startup with screenshots and a demo video. The community tries it and
              tells you what they think.
            </p>
            <Link href="/submit" className={styles.sideCta}>
              Post your startup
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className={styles.skelCard} aria-hidden="true">
      <div className={styles.skelHead}>
        <div className={`skel ${styles.skelLogo}`} />
        <div>
          <div className={`skel ${styles.skelName}`} />
          <div className={`skel ${styles.skelMeta}`} />
        </div>
      </div>
      <div className={`skel ${styles.skelBody}`} />
      <div className={`skel ${styles.skelMedia}`} />
    </div>
  );
}
