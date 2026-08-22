'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Heart, MessageCircle, Search, Star } from 'lucide-react';
import { useStartups } from '@/lib/hooks';
import { categories, type Startup } from '@/lib/types';
import PageHeader from '@/components/PageHeader';
import Badge from '@/components/ui/Badge';
import Logo from '@/components/ui/Logo';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

export default function StartupsPage() {
  const { data: startups, loading, error } = useStartups();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return startups
      .filter(s => category === 'all' || s.category === category)
      .filter(
        s =>
          !q ||
          s.name.toLowerCase().includes(q) ||
          s.tagline.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [startups, category, query]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Directory"
        title="Startups"
        aside={
          !loading && (
            <span className={styles.count}>
              <strong className="tnum">{startups.length}</strong> listed
            </span>
          )
        }
      >
        Every product on the platform, A–Z. Open one to read what its founders have been
        shipping.
      </PageHeader>

      <div className={`wrap ${styles.controls}`}>
        <div className={styles.searchWrap}>
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.search}
            type="search"
            placeholder="Search by name or what it does…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search startups"
          />
        </div>

        <div className={styles.chipScroller}>
          <div className={styles.chips} role="group" aria-label="Filter by category">
            <button
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

      <div className={`wrap ${styles.body}`}>
        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={`skel ${styles.skelCard}`} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title="Nothing matches that">
            Try a different search or category, or <Link href="/submit">post a startup</Link>.
          </EmptyState>
        ) : (
          <>
            <p className={styles.meta} aria-live="polite">
              {visible.length} startup{visible.length === 1 ? '' : 's'}
            </p>
            <div className={styles.grid}>
              {visible.map(s => (
                <Card key={s.id} startup={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ startup }: { startup: Startup }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <Logo name={startup.name} url={startup.logoUrl} initials={startup.logoInitials} size="lg" />
        <div className={styles.cardHead}>
          <h2 className={styles.cardName}>
            <Link href={`/startups/${startup.slug}`} className={`${styles.cardLink} stretch-link`}>
              {startup.name}
            </Link>
          </h2>
          <p className={styles.cardTagline}>{startup.tagline}</p>
        </div>
      </div>

      <div className={styles.cardMeta}>
        <Badge variant="category">{startup.category}</Badge>
        <Badge variant="region">{startup.region}</Badge>
      </div>

      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt><Heart size={12} aria-hidden="true" /><span className="sr-only">Likes</span></dt>
          <dd className="tnum">{startup.likeCount}</dd>
        </div>
        <div className={styles.stat}>
          <dt><MessageCircle size={12} aria-hidden="true" /><span className="sr-only">Comments</span></dt>
          <dd className="tnum">{startup.commentCount}</dd>
        </div>
        <div className={styles.stat}>
          <dt><Star size={12} aria-hidden="true" /><span className="sr-only">Reviews</span></dt>
          <dd className="tnum">{startup.reviewCount}</dd>
        </div>
        <span className={styles.posts}>
          {startup.postCount} update{startup.postCount === 1 ? '' : 's'}
        </span>
      </dl>
    </article>
  );
}
