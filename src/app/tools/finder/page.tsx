'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import { useMember } from '@/lib/hooks';
import { deleteFinderPost, useFinderPosts } from '@/lib/tools';
import { timeAgo } from '@/lib/ranking';
import { FINDER_NEEDS, type FinderNeed, type FinderPost } from '@/lib/types';
import styles from './page.module.css';

type Filter = FinderNeed | 'all';

const NEED_LABEL = Object.fromEntries(FINDER_NEEDS.map(n => [n.key, n.label])) as Record<FinderNeed, string>;

export default function FinderPage() {
  const { data: posts, loading, error } = useFinderPosts();
  const { user } = useMember();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(
      p =>
        (filter === 'all' || p.lookingFor.includes(filter)) &&
        (!q ||
          p.headline.toLowerCase().includes(q) ||
          p.body.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.skills.some(s => s.toLowerCase().includes(q))),
    );
  }, [posts, filter, search]);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Tools"
        title="Finder"
        aside={
          <Link href="/tools/finder/new" className={styles.cta}>
            <Plus size={15} aria-hidden="true" />
            Post yourself
          </Link>
        }
      >
        Founders and developers share what they have built, their experience and what they need.
        Find a co-founder, an employee or a freelancer.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.controls}>
          <div role="tablist" aria-label="Looking for" className={styles.tabs}>
            {(['all', ...FINDER_NEEDS.map(n => n.key)] as Filter[]).map(f => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={clsx(styles.tab, filter === f && styles.tabOn)}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Everyone' : NEED_LABEL[f]}
              </button>
            ))}
          </div>
          <label className={styles.search}>
            <Search size={15} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills, places or work"
              aria-label="Search Finder"
            />
          </label>
        </div>

        {error ? (
          <ErrorState message={error} />
        ) : loading ? (
          <div className={styles.list}>
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className={`skel ${styles.skel}`} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <EmptyState title={posts.length === 0 ? 'No posts yet' : 'Nothing matches that'}>
            {posts.length === 0
              ? 'Be the first to post what you have built and what you need.'
              : 'Try another filter or search term.'}
          </EmptyState>
        ) : (
          <ul className={styles.list}>
            {visible.map(p => (
              <li key={p.id}>
                <FinderCard post={p} mine={Boolean(user && user.uid === p.authorId)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function FinderCard({ post, mine }: { post: FinderPost; mine: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm('Remove this post from Finder?')) return;
    setBusy(true);
    setError(null);
    try {
      await deleteFinderPost(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove that post.');
      setBusy(false);
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.cardHead}>
        <div>
          <h2 className={styles.headline}>{post.headline}</h2>
          <p className={styles.meta}>
            {post.authorName}
            {post.location ? ` · ${post.location}` : ''}
            {post.createdAt ? ` · ${timeAgo(post.createdAt)}` : ''}
          </p>
        </div>
        {mine && (
          <button type="button" className={styles.remove} onClick={remove} disabled={busy}>
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </header>

      <p className={styles.need}>
        Looking for:{' '}
        {post.lookingFor.map(n => NEED_LABEL[n]).join(', ')}
      </p>
      <p className={styles.body}>{post.body}</p>

      {post.skills.length > 0 && (
        <ul className={styles.skills} aria-label="Skills">
          {post.skills.map(s => (
            <li key={s} className={styles.skill}>{s}</li>
          ))}
        </ul>
      )}

      {post.contact && (
        <p className={styles.contact}>
          Contact: <span>{post.contact}</span>
        </p>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </article>
  );
}
