'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BarChart3, ChevronRight, MessageCircleQuestion, Search, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { useCommunityFeed, useMyCommunityLikes } from '@/lib/hooks';
import type { CommunityKind } from '@/lib/types';
import CommunityCard from '@/components/CommunityCard';
import PageHeader from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import styles from './page.module.css';

const TABS: { key: CommunityKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'question', label: 'Questions' },
  { key: 'showcase', label: 'Show & Tell' },
  { key: 'poll', label: 'Polls' },
];

/** How many distinct tags to surface as filter chips — the feed is capped at
 *  100 posts (see subscribeToCommunityFeed), so this is a bound on the chip
 *  row's width, not an attempt to summarise every tag that's ever been used. */
const MAX_TAG_CHIPS = 10;

export default function CommunityPage() {
  const [tab, setTab] = useState<CommunityKind | 'all'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { data: posts, loading, error } = useCommunityFeed(tab);
  const likes = useMyCommunityLikes();

  // Tags and search are both plain client-side filters over the already-
  // live-subscribed set — the same "start simple" precedent useCommunityFeed
  // itself follows, rather than a new where() per tag (which would mean a
  // new composite index for every kind+tag pairing).
  const tagChips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, MAX_TAG_CHIPS)
      .map(([tag]) => tag);
  }, [posts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      p =>
        (!activeTag || p.tags.includes(activeTag)) &&
        (!q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q)),
    );
  }, [posts, activeTag, search]);

  const filtering = Boolean(activeTag) || search.trim().length > 0;

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Community"
        title="Developer community"
        aside={
          <div className={styles.headerCtas}>
            <Link href="/community/new" className={styles.ctaSecondary}>
              <MessageCircleQuestion size={15} aria-hidden="true" />
              Ask a question
            </Link>
            <Link href="/community/new" className={styles.cta}>
              <Sparkles size={15} aria-hidden="true" />
              Share your build
            </Link>
          </div>
        }
      >
        Questions, help threads, polls and build-in-public posts from Zimbabwean and African
        developers — open to anyone, whether or not you have a startup listed here.
      </PageHeader>

      <div className={`wrap ${styles.body}`}>
        <Link href="/community/hackathon-tracker" className={styles.promo}>
          <BarChart3 size={16} aria-hidden="true" />
          <span>
            <strong>Where are Zim&apos;s hackathon winners now?</strong> A tracker of named POTRAZ, Old
            Mutual VCC and Cimas Healthathon winners — and what happened to them after.
          </span>
          <ChevronRight size={16} aria-hidden="true" className={styles.promoArrow} />
        </Link>

        <div className={styles.controls}>
          <div className={styles.tabs} role="tablist" aria-label="Filter posts">
            {TABS.map(t => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={clsx(styles.tab, tab === t.key && styles.tabActive)}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
            <input
              className={styles.search}
              type="search"
              placeholder="Search posts…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Search community posts"
            />
          </div>
        </div>

        {tagChips.length > 0 && (
          <div className={styles.chipScroller}>
            <div className={styles.chips} role="group" aria-label="Filter by tag">
              {tagChips.map(tag => (
                <button
                  key={tag}
                  type="button"
                  className={styles.chip}
                  data-active={activeTag === tag || undefined}
                  aria-pressed={activeTag === tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <div className={styles.list}>
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className={`skel ${styles.skelCard}`} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <EmptyState title="Nothing here yet">
            {tab === 'question'
              ? 'No questions yet. '
              : tab === 'showcase'
                ? 'No builds shared yet. '
                : tab === 'poll'
                  ? 'No polls yet. '
                  : 'Nothing posted yet. '}
            <Link href="/community/new">Be the first to post</Link>.
          </EmptyState>
        ) : visible.length === 0 && filtering ? (
          <EmptyState title="Nothing matches that">
            Try a different search, or clear the tag filter.
          </EmptyState>
        ) : (
          <div className={styles.list}>
            {visible.map(post => (
              <CommunityCard key={post.id} post={post} liked={likes.has(post.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
