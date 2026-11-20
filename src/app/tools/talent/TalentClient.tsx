'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Mail, MessageCircle, Phone, Plus, Search, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import { useMember } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import { phoneDigits, whatsappLink } from '@/lib/spaces';
import { DEVELOPERS } from '@/lib/talentData';
import { deleteFinderPost, useFinderPosts } from '@/lib/tools';
import { FINDER_NEEDS, type Developer, type FinderNeed, type FinderPost } from '@/lib/types';
import styles from './page.module.css';

type Tab = 'developers' | 'team';
const PAGE = 24;

const NEED_LABEL = Object.fromEntries(FINDER_NEEDS.map(n => [n.key, n.label])) as Record<FinderNeed, string>;

/** Towns with the most developers first; the rest are searchable. */
const TOWNS = (() => {
  const counts = new Map<string, number>();
  for (const d of DEVELOPERS) if (d.town) counts.set(d.town, (counts.get(d.town) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([t]) => t);
})();

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?';
}

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
}

export default function TalentClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab: Tab = params.get('tab') === 'team' ? 'team' : 'developers';
  const { data: posts } = useFinderPosts();

  function setTab(next: Tab) {
    router.replace(next === 'team' ? `${pathname}?tab=team` : pathname, { scroll: false });
  }

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Tools"
        title="Talent Directory"
        aside={
          <Link href="/tools/talent/new" className={styles.cta}>
            <Plus size={15} aria-hidden="true" />
            Add yourself
          </Link>
        }
      >
        Developers you can hire in Zimbabwe, and founders looking for co-founders, staff and
        freelancers. Contact people directly.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.tabs} role="tablist" aria-label="Directory">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'developers'}
            className={clsx(styles.tab, tab === 'developers' && styles.tabOn)}
            onClick={() => setTab('developers')}
          >
            Developers <span className={styles.tabCount}>{DEVELOPERS.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'team'}
            className={clsx(styles.tab, tab === 'team' && styles.tabOn)}
            onClick={() => setTab('team')}
          >
            Looking for a team <span className={styles.tabCount}>{posts.length}</span>
          </button>
        </div>

        {tab === 'developers' ? <Developers /> : <Team />}
      </div>
    </div>
  );
}

/* ─── Developers ── */

function Developers() {
  const [search, setSearch] = useState('');
  const [town, setTown] = useState('');
  const [shown, setShown] = useState(PAGE);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return DEVELOPERS.filter(
      d =>
        (!town || d.town === town) &&
        (!q || `${d.name} ${d.skills} ${d.experience} ${d.town}`.toLowerCase().includes(q)),
    );
  }, [search, town]);

  return (
    <>
      <div className={styles.controls}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search skills, like Android or PHP"
            aria-label="Search developers"
          />
        </label>
        <select
          className={styles.town}
          value={town}
          onChange={e => {
            setTown(e.target.value);
            setShown(PAGE);
          }}
          aria-label="Town"
        >
          <option value="">All towns</option>
          {TOWNS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <p className={styles.count}>
        {visible.length} {visible.length === 1 ? 'developer' : 'developers'}
      </p>

      {visible.length === 0 ? (
        <p className={styles.none}>No one matches that. Try a broader skill, or all towns.</p>
      ) : (
        <ul className={styles.grid}>
          {visible.slice(0, shown).map(d => (
            <li key={d.id}>
              <DeveloperCard dev={d} />
            </li>
          ))}
        </ul>
      )}

      {visible.length > shown && (
        <button type="button" className={styles.more} onClick={() => setShown(n => n + PAGE)}>
          Show more ({visible.length - shown} left)
        </button>
      )}

      <p className={styles.fine}>
        From the{' '}
        <a href="https://www.techzim.co.zw/web-mobile-app-developer-zimbabwe/" target="_blank" rel="noopener noreferrer">
          Techzim developer directory
        </a>
        . Listings are written by the developers themselves, who work independently. Ask for past work
        before you hire.
      </p>
    </>
  );
}

function DeveloperCard({ dev: d }: { dev: Developer }) {
  const [open, setOpen] = useState(false);
  const site = d.website || d.portfolioUrl;
  const hasContact = Boolean(d.phone || d.whatsapp || d.email);

  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.avatar} aria-hidden="true">{initials(d.name)}</span>
        <div className={styles.who}>
          <h2 className={styles.name}>{d.name}</h2>
          <p className={styles.meta}>
            {[d.town, d.experience.length <= 40 ? d.experience : ''].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {d.skills && <p className={styles.skillsText}>{d.skills}</p>}

      <div className={styles.cardFoot}>
        <div className={styles.links}>
          {site && (
            <a href={site} target="_blank" rel="noopener noreferrer">
              {shortUrl(site)}
            </a>
          )}
          {d.github && (
            <a href={d.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
        </div>
        {hasContact && (
          <button type="button" className={styles.contactBtn} onClick={() => setOpen(o => !o)} aria-expanded={open}>
            {open ? 'Hide' : 'Contact'}
          </button>
        )}
      </div>

      {open && (
        <div className={styles.contact}>
          {d.phone && (
            <a href={`tel:+${phoneDigits(d.phone)}`}>
              <Phone size={14} aria-hidden="true" />
              {d.phone}
            </a>
          )}
          {(d.whatsapp || d.phone) && (
            <a href={whatsappLink(d.whatsapp || d.phone)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {d.email && (
            <a href={`mailto:${d.email}`}>
              <Mail size={14} aria-hidden="true" />
              {d.email}
            </a>
          )}
        </div>
      )}
    </article>
  );
}

/* ─── Looking for a team ── */

function Team() {
  const { data: posts, loading, error } = useFinderPosts();
  const { user } = useMember();
  const [filter, setFilter] = useState<FinderNeed | 'all'>('all');

  const visible = posts.filter(p => filter === 'all' || p.lookingFor.includes(filter));

  return (
    <>
      <div className={styles.chips}>
        {(['all', ...FINDER_NEEDS.map(n => n.key)] as (FinderNeed | 'all')[]).map(f => (
          <button
            key={f}
            type="button"
            className={clsx(styles.chip, filter === f && styles.chipOn)}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Everyone' : `Wants a ${NEED_LABEL[f].toLowerCase()}`}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className={`skel ${styles.skel}`} />
      ) : visible.length === 0 ? (
        <EmptyState title="No posts yet">
          Founders post here when they need a co-founder, staff or a freelancer.{' '}
          <Link href="/tools/talent/new">Post yours</Link>.
        </EmptyState>
      ) : (
        <ul className={styles.teamList}>
          {visible.map(p => (
            <li key={p.id}>
              <TeamPost post={p} mine={Boolean(user && user.uid === p.authorId)} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function TeamPost({ post, mine }: { post: FinderPost; mine: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm('Remove your post from the Talent Directory?')) return;
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
    <article className={styles.post}>
      <div className={styles.postHead}>
        <div>
          <h2 className={styles.name}>{post.headline}</h2>
          <p className={styles.meta}>
            {[post.authorName, post.location, post.createdAt ? timeAgo(post.createdAt) : ''].filter(Boolean).join(' · ')}
          </p>
        </div>
        {mine && (
          <button type="button" className={styles.remove} onClick={remove} disabled={busy}>
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
      <p className={styles.wants}>Looking for a {post.lookingFor.map(n => NEED_LABEL[n].toLowerCase()).join(', ')}</p>
      <p className={styles.postBody}>{post.body}</p>
      {post.skills.length > 0 && <p className={styles.skillsText}>{post.skills.join(' · ')}</p>}
      {post.contact && <p className={styles.postContact}>{post.contact}</p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
    </article>
  );
}
