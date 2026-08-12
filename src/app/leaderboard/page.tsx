'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Flame, Heart, MessageCircle, Minus, Star, TrendingDown, TrendingUp } from 'lucide-react';
import { categories, regions, type Period, type Startup } from '@/lib/types';
import { useLeaderboard, useStartups } from '@/lib/hooks';
import Badge from '@/components/ui/Badge';
import Logo from '@/components/ui/Logo';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

/* ── Rank movement since the last recorded standings ── */
function Delta({ d }: { d: number }) {
  if (d > 0)
    return (
      <span className={styles.deltaUp}>
        <TrendingUp size={11} aria-hidden="true" />
        {d}
        <span className="sr-only">places up</span>
      </span>
    );
  if (d < 0)
    return (
      <span className={styles.deltaDown}>
        <TrendingDown size={11} aria-hidden="true" />
        {Math.abs(d)}
        <span className="sr-only">places down</span>
      </span>
    );
  return (
    <span className={styles.deltaFlat}>
      <Minus size={11} aria-hidden="true" />
      <span className="sr-only">No change</span>
    </span>
  );
}

/* ── One row ──
   A plain container with the anchor stretched across it, so the whole row is one
   target without nesting anything interactive inside a link. */
function Row({ startup, period }: { startup: Startup; period: Period }) {
  const rank = period === 'week' ? startup.rankWeek : startup.rankMonth;
  const delta = period === 'week' ? startup.rankDeltaWeek : startup.rankDeltaMonth;
  const likes = period === 'week' ? startup.weeklyLikes : startup.monthlyLikes;
  const score = period === 'week' ? startup.scoreWeek : startup.scoreMonth;

  return (
    <article className={styles.row} data-top={rank <= 3 ? rank : undefined} id={`row-${startup.slug}`}>
      <div className={styles.rankCell}>
        <span className={styles.rankNum}>{rank}</span>
        <Delta d={delta} />
      </div>

      <div className={styles.rowLogo}>
        <Logo
          name={startup.name}
          url={startup.logoUrl}
          initials={startup.logoInitials}
          size="md"
        />
      </div>

      <div className={styles.rowInfo}>
        <div className={styles.rowNameLine}>
          <h3 className={styles.rowName}>
            <Link href={`/startups/${startup.slug}`} className={`${styles.rowLink} stretch-link`}>
              {startup.name}
            </Link>
          </h3>
          {startup.isTrending && (
            <Badge variant="trending">
              <Flame size={9} aria-hidden="true" />
              Trending
            </Badge>
          )}
        </div>

        <p className={styles.rowTagline}>{startup.tagline}</p>

        {/* The three signals that produced the score, in weight order. */}
        <div className={styles.rowBadges}>
          <Badge variant="category">{startup.category}</Badge>
          <span className={styles.rowStat}>
            <Heart size={11} aria-hidden="true" />
            {likes}
            <span className="sr-only"> likes</span>
          </span>
          <span className={styles.rowStat}>
            <MessageCircle size={11} aria-hidden="true" />
            {startup.commentCount}
            <span className="sr-only"> comments</span>
          </span>
          <span className={styles.rowStat}>
            <Star size={11} aria-hidden="true" />
            {startup.reviewCount}
            <span className="sr-only">
              {startup.reviewCount === 1 ? ' review' : ' reviews'}
            </span>
          </span>
          <span className={styles.rowScoreInline}>{score.toLocaleString()} pts</span>
        </div>
      </div>

      <div className={styles.rowScore}>
        <span className={styles.rowScoreNum}>{score.toLocaleString()}</span>
        <span className={styles.rowScoreLabel}>score</span>
      </div>
    </article>
  );
}

function RowSkeleton() {
  return (
    <div className={styles.row} aria-hidden="true">
      <div className={styles.rankCell}>
        <div className={`skel ${styles.skelRank}`} />
      </div>
      <div className={styles.rowLogo}>
        <div className={`skel ${styles.skelLogo}`} />
      </div>
      <div className={styles.rowInfo}>
        <div className={`skel ${styles.skelLine}`} />
        <div className={`skel ${styles.skelLineShort}`} />
      </div>
      <div className={styles.rowScore} />
    </div>
  );
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('week');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');

  const { data: startups, loading, error } = useStartups();
  const ranked = useLeaderboard(startups, period, category, region);

  const totals = useMemo(
    () => ({
      startups: startups.length,
      likes: startups.reduce((n, s) => n + s.weeklyLikes, 0),
      reviews: startups.reduce((n, s) => n + s.reviewCount, 0),
    }),
    [startups],
  );

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className={`wrap ${styles.mastheadInner}`}>
          <div className={styles.mastheadLeft}>
            <h1 className={styles.pageTitle}>Leaderboard</h1>
            <p className={styles.pageDesc}>
              Ranked by what the community does in the feed — likes, comments and reviews.
            </p>
          </div>

          <div className={styles.mastheadStats}>
            <span className={styles.mStat}>
              <span className={styles.mStatNum}>{loading ? '—' : totals.startups}</span>
              <span className={styles.mStatLabel}>startups</span>
            </span>
            <span className={styles.mStat}>
              <span className={styles.mStatNum}>
                {loading ? '—' : totals.likes.toLocaleString()}
              </span>
              <span className={styles.mStatLabel}>likes this week</span>
            </span>
            <span className={styles.mStat}>
              <span className={styles.mStatNum}>{loading ? '—' : totals.reviews}</span>
              <span className={styles.mStatLabel}>reviews</span>
            </span>
          </div>
        </div>
      </header>

      <div className={styles.controls}>
        <div className={`wrap ${styles.controlsInner}`}>
          <div className={styles.toggle} role="group" aria-label="Ranking period">
            <button
              id="period-week-btn"
              className={styles.toggleBtn}
              data-active={period === 'week' || undefined}
              aria-pressed={period === 'week'}
              onClick={() => setPeriod('week')}
            >
              This week
            </button>
            <button
              id="period-month-btn"
              className={styles.toggleBtn}
              data-active={period === 'month' || undefined}
              aria-pressed={period === 'month'}
              onClick={() => setPeriod('month')}
            >
              This month
            </button>
          </div>

          <div className={styles.chipScroller}>
            <div className={styles.chips} role="group" aria-label="Filter by category">
              <button
                id="filter-all-btn"
                className={styles.chip}
                data-active={category === 'all' || undefined}
                aria-pressed={category === 'all'}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              {categories.map(c => (
                <button
                  key={c}
                  id={`filter-${c.toLowerCase()}-btn`}
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

          <select
            id="region-select"
            className={styles.regionSelect}
            value={region}
            onChange={e => setRegion(e.target.value)}
            aria-label="Filter by region"
          >
            <option value="all">All regions</option>
            {regions.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`wrap ${styles.listWrap}`}>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <>
            <p className={styles.listMeta}>Loading the leaderboard…</p>
            <div className={styles.list}>
              {Array.from({ length: 6 }, (_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          </>
        ) : ranked.length === 0 ? (
          <EmptyState title="No startups match your filters">
            Try a different category, or <Link href="/submit">submit a startup</Link>.
          </EmptyState>
        ) : (
          <>
            <p className={styles.listMeta} aria-live="polite">
              {ranked.length} startup{ranked.length !== 1 ? 's' : ''} ·{' '}
              {period === 'week' ? 'this week' : 'this month'}
            </p>
            <div className={styles.list}>
              {ranked.map(s => (
                <Row key={s.id} startup={s} period={period} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
