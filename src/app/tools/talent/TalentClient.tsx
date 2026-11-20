'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Mail, MapPin, MessageCircle, Phone, Plus, Search, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import { EmptyState, ErrorState } from '@/components/ui/DataState';
import { useMember } from '@/lib/hooks';
import { timeAgo } from '@/lib/ranking';
import { phoneDigits, whatsappLink } from '@/lib/spaces';
import { SKILL_FILTERS, initials, pageList, skillTags, toneFor, townsOf } from '@/lib/talent';
import { DEVELOPERS } from '@/lib/talentData';
import { deleteFinderPost, useFinderPosts } from '@/lib/tools';
import { FINDER_NEEDS, type Developer, type FinderNeed, type FinderPost } from '@/lib/types';
import styles from './page.module.css';

type Tab = 'developers' | 'team';
const PER_PAGE = 12;
const MAX_TAGS = 4;

const NEED_LABEL = Object.fromEntries(FINDER_NEEDS.map(n => [n.key, n.label])) as Record<FinderNeed, string>;

const TAGGED = DEVELOPERS.map(dev => ({ dev, tags: skillTags(dev.skills) }));
const TOWNS = townsOf(DEVELOPERS);
/** A few faces for the header, picked so the colours vary. */
const CROWD = ['Pamela Sillah', 'Ronald Maravanyika', 'Eliazer Chikadzi', 'iCode Consultancy']
  .map(n => DEVELOPERS.find(d => d.name === n))
  .filter((d): d is Developer => Boolean(d));

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
          <>
            <div className={styles.crowd}>
              <span className={styles.faces} aria-hidden="true">
                {CROWD.map(d => (
                  <span key={d.id} className={clsx(styles.face, styles[`tone_${toneFor(d.name)}`])}>
                    {initials(d.name)}
                  </span>
                ))}
              </span>
              <span className={styles.crowdText}>
                <strong>{DEVELOPERS.length}</strong> developers
              </span>
            </div>
            <Link href="/tools/talent/new" className={styles.cta}>
              <Plus size={15} aria-hidden="true" />
              Add yourself
            </Link>
          </>
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
  const [skill, setSkill] = useState('');
  const [page, setPage] = useState(1);
  const topRef = useRef<HTMLParagraphElement>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TAGGED.filter(
      ({ dev: d, tags }) =>
        (!town || d.town === town) &&
        (!skill || tags.includes(skill)) &&
        (!q || `${d.name} ${d.skills} ${d.experience} ${d.town}`.toLowerCase().includes(q)),
    );
  }, [search, town, skill]);

  const pages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PER_PAGE;
  const onPage = visible.slice(from, from + PER_PAGE);

  function goTo(n: number) {
    setPage(n);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
              setPage(1);
            }}
            placeholder="Search by name or skill"
            aria-label="Search developers"
          />
        </label>
        <select
          className={styles.town}
          value={town}
          onChange={e => {
            setTown(e.target.value);
            setPage(1);
          }}
          aria-label="Town"
        >
          <option value="">All towns</option>
          {TOWNS.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className={styles.skills} role="group" aria-label="Skill">
        {['', ...SKILL_FILTERS].map(s => (
          <button
            key={s || 'all'}
            type="button"
            className={clsx(styles.skill, skill === s && styles.skillOn)}
            aria-pressed={skill === s}
            onClick={() => {
              setSkill(s);
              setPage(1);
            }}
          >
            {s || 'All skills'}
          </button>
        ))}
      </div>

      <p className={styles.count} ref={topRef}>
        {visible.length === 0
          ? 'No developers'
          : pages > 1
            ? `${from + 1}–${from + onPage.length} of ${visible.length} developers`
            : `${visible.length} ${visible.length === 1 ? 'developer' : 'developers'}`}
      </p>

      {visible.length === 0 ? (
        <p className={styles.none}>No one matches that. Try a broader skill, or all towns.</p>
      ) : (
        <ul className={styles.grid}>
          {onPage.map(({ dev, tags }) => (
            <li key={dev.id}>
              <DeveloperCard dev={dev} tags={tags} />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && <Pager current={current} total={pages} onChange={goTo} />}

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

function Pager({ current, total, onChange }: { current: number; total: number; onChange: (n: number) => void }) {
  return (
    <nav className={styles.pager} aria-label="Pages">
      <button
        type="button"
        className={styles.pageStep}
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </button>
      <ol className={styles.pageNums}>
        {pageList(current, total).map((n, i) =>
          n === null ? (
            <li key={`gap-${i}`} className={styles.pageGap} aria-hidden="true">…</li>
          ) : (
            <li key={n}>
              <button
                type="button"
                className={clsx(styles.pageNum, n === current && styles.pageOn)}
                onClick={() => onChange(n)}
                aria-label={`Page ${n}`}
                aria-current={n === current ? 'page' : undefined}
              >
                {n}
              </button>
            </li>
          ),
        )}
      </ol>
      <button
        type="button"
        className={styles.pageStep}
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}

function DeveloperCard({ dev: d, tags }: { dev: Developer; tags: string[] }) {
  const [open, setOpen] = useState(false);
  const site = d.website || d.portfolioUrl;
  const hasContact = Boolean(d.phone || d.whatsapp || d.email);
  const shortExperience = d.experience.length <= 40 ? d.experience : '';

  return (
    <article className={clsx(styles.card, open && styles.cardOpen)}>
      <div className={styles.cardTop}>
        <span className={clsx(styles.avatar, styles[`tone_${toneFor(d.name)}`])} aria-hidden="true">
          {initials(d.name)}
        </span>
        <div className={styles.who}>
          <h2 className={styles.name}>{d.name}</h2>
          <p className={styles.meta}>
            {d.town && (
              <span className={styles.place}>
                <MapPin size={13} aria-hidden="true" />
                {d.town}
              </span>
            )}
            {shortExperience && <span>{shortExperience}</span>}
          </p>
        </div>
      </div>

      {tags.length > 0 ? (
        <ul className={styles.tags} aria-label="Skills">
          {tags.slice(0, MAX_TAGS).map(t => (
            <li key={t}>{t}</li>
          ))}
          {tags.length > MAX_TAGS && <li className={styles.tagMore}>+{tags.length - MAX_TAGS}</li>}
        </ul>
      ) : (
        d.skills && <p className={styles.skillsText}>{d.skills}</p>
      )}

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
        {(hasContact || tags.length > 0) && (
          <button type="button" className={styles.contactBtn} onClick={() => setOpen(o => !o)} aria-expanded={open}>
            {open ? 'Close' : hasContact ? 'Contact' : 'More'}
          </button>
        )}
      </div>

      {open && (
        <div className={styles.contact}>
          {tags.length > 0 && d.skills && <p className={styles.fullSkills}>{d.skills}</p>}
          {d.experience && !shortExperience && <p className={styles.fullSkills}>{d.experience}</p>}
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
