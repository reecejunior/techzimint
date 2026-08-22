'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Star } from 'lucide-react';
import type { Startup, TechzimChoicePick } from '@/lib/types';
import { useStartups, useTechzimChoice } from '@/lib/hooks';
import Badge from '@/components/ui/Badge';
import Logo from '@/components/ui/Logo';
import PageHeader from '@/components/PageHeader';
import SubscribeForm from '@/components/SubscribeForm';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

/* ── One pick ──
   A plain container with the anchor stretched across it, so the whole row is
   one target without nesting anything interactive inside a link. */
function Row({ rank, pick, startup }: { rank: number; pick: TechzimChoicePick; startup: Startup }) {
  return (
    <article className={styles.row} data-top={rank <= 3 ? rank : undefined} id={`row-${startup.slug}`}>
      <div className={styles.rankCell}>
        <span className={styles.rankNum}>{rank}</span>
      </div>

      <div className={styles.rowLogo}>
        <Logo name={startup.name} url={startup.logoUrl} initials={startup.logoInitials} size="md" />
      </div>

      <div className={styles.rowInfo}>
        <div className={styles.rowNameLine}>
          <h3 className={styles.rowName}>
            <Link href={`/startups/${startup.slug}`} className={`${styles.rowLink} stretch-link`}>
              {startup.name}
            </Link>
          </h3>
        </div>

        <p className={styles.rowTagline}>{startup.tagline}</p>

        {pick.note && <p className={styles.rowNote}>“{pick.note}”</p>}

        <div className={styles.rowBadges}>
          <Badge variant="category">{startup.category}</Badge>
          <span className={styles.rowStat}>
            <Heart size={11} aria-hidden="true" />
            {startup.likeCount}
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
        </div>
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
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: startups, loading: startupsLoading, error: startupsError } = useStartups();
  const { data: picks, loading: picksLoading, error: picksError } = useTechzimChoice();

  const loading = startupsLoading || picksLoading;
  const error = startupsError ?? picksError;

  // Picks name a startup id; resolve against the live approved set so a
  // rejected or since-removed pick just quietly drops off the list instead
  // of crashing the page.
  const byId = useMemo(() => new Map(startups.map(s => [s.id, s])), [startups]);
  const resolved = useMemo(
    () =>
      picks
        .map(pick => ({ pick, startup: byId.get(pick.startupId) }))
        .filter((r): r is { pick: TechzimChoicePick; startup: Startup } => Boolean(r.startup)),
    [picks, byId],
  );

  const totals = useMemo(
    () => ({
      products: startups.length,
      likes: startups.reduce((n, s) => n + s.weeklyLikes, 0),
      reviews: startups.reduce((n, s) => n + s.reviewCount, 0),
    }),
    [startups],
  );

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Editorial"
        title="Techzim's Choice"
        aside={
          <>
            <span className={styles.mStat}>
              <span className={styles.mStatNum}>{loading ? '—' : totals.products}</span>
              <span className={styles.mStatLabel}>products</span>
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
          </>
        }
      >
        Five products our team is genuinely paying attention to right now — picked by us, not a
        formula.
      </PageHeader>

      <div className={`wrap ${styles.subscribeWrap}`}>
        <SubscribeForm />
      </div>

      <div className={`wrap ${styles.listWrap}`}>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <>
            <p className={styles.listMeta}>Loading Techzim&apos;s Choice…</p>
            <div className={styles.list}>
              {Array.from({ length: 5 }, (_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          </>
        ) : resolved.length === 0 ? (
          <EmptyState title="Techzim hasn't published picks yet">
            Check back soon, or browse <Link href="/">everything in the feed</Link>.
          </EmptyState>
        ) : (
          <>
            <p className={styles.listMeta}>Updated whenever Techzim changes its picks.</p>
            <div className={styles.list}>
              {resolved.map((r, i) => (
                <Row key={r.startup.id} rank={i + 1} pick={r.pick} startup={r.startup} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
