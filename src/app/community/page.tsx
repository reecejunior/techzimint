'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MessageCircleQuestion, Sparkles } from 'lucide-react';
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
];

export default function CommunityPage() {
  const [tab, setTab] = useState<CommunityKind | 'all'>('all');
  const { data: posts, loading, error } = useCommunityFeed(tab);
  const likes = useMyCommunityLikes();

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
        Questions, help threads and build-in-public posts from Zimbabwean and African developers —
        open to anyone, whether or not you have a startup listed here.
      </PageHeader>

      <div className={`wrap ${styles.body}`}>
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
                : 'Nothing posted yet. '}
            <Link href="/community/new">Be the first to post</Link>.
          </EmptyState>
        ) : (
          <div className={styles.list}>
            {posts.map(post => (
              <CommunityCard key={post.id} post={post} liked={likes.has(post.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
