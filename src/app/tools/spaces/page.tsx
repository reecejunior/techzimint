'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import SpaceCard from '@/components/SpaceCard';
import { submissionToSpace } from '@/lib/spaces';
import { SEED_SPACES } from '@/lib/spacesData';
import { useApprovedSpaceSubmissions } from '@/lib/tools';
import { SPACE_TOWNS, type Space, type SpaceType } from '@/lib/types';
import styles from './page.module.css';

type TypeFilter = SpaceType | 'all';

export default function SpacesPage() {
  const submitted = useApprovedSpaceSubmissions();
  const [town, setTown] = useState<string>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');

  const all = useMemo<Space[]>(() => [...SEED_SPACES, ...submitted.map(submissionToSpace)], [submitted]);

  const towns = useMemo(() => {
    const extra = [...new Set(all.map(s => s.town))].filter(t => !(SPACE_TOWNS as readonly string[]).includes(t));
    return [...SPACE_TOWNS, ...extra.sort()];
  }, [all]);

  const q = search.trim().toLowerCase();
  const visible = all.filter(
    s =>
      (town === 'all' || s.town === town) &&
      (type === 'all' || s.type === type) &&
      (!q ||
        s.name.toLowerCase().includes(q) ||
        (s.address ?? '').toLowerCase().includes(q) ||
        (s.area ?? '').toLowerCase().includes(q) ||
        s.offers.some(o => o.toLowerCase().includes(q))),
  );
  // Spaces with a photo first within each town, so the page opens on pictures.
  const groups = towns
    .map(t => ({
      town: t,
      spaces: visible
        .filter(s => s.town === t)
        .sort((a, b) => Number(Boolean(b.photo)) - Number(Boolean(a.photo))),
    }))
    .filter(g => g.spaces.length > 0);

  return (
    <div className={styles.page}>
      <PageHeader
        eyebrow="Tools"
        title="Spaces"
        aside={
          <Link href="/tools/spaces/submit" className={styles.cta}>
            <Plus size={15} aria-hidden="true" />
            Add a space
          </Link>
        }
      >
        Places to work from in Harare, Bulawayo and Mutare: co-working spaces, innovation hubs and
        internet cafés, with prices, opening hours and how to reach them.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.toolbar}>
          <label className={styles.search}>
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, street or what it offers"
              aria-label="Search spaces"
            />
          </label>

          <div className={styles.filters}>
            <div className={styles.segment} role="group" aria-label="Town">
              {['all', ...towns].map(t => {
                const count = all.filter(s => (t === 'all' || s.town === t) && (type === 'all' || s.type === type)).length;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={town === t}
                    className={clsx(styles.segBtn, town === t && styles.segOn)}
                    onClick={() => setTown(t)}
                  >
                    {t === 'all' ? 'All towns' : t}
                    <span className={styles.count}>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.segment} role="group" aria-label="Type">
              {(['all', 'coworking', 'cafe'] as TypeFilter[]).map(t => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={type === t}
                  className={clsx(styles.segBtn, type === t && styles.segOn)}
                  onClick={() => setType(t)}
                >
                  {t === 'all' ? 'Everything' : t === 'coworking' ? 'Co-working' : 'Internet cafés'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {groups.length === 0 ? (
          <div className={styles.empty}>
            <p>No spaces match that yet.</p>
            <Link href="/tools/spaces/submit">Know one? Add it</Link>
          </div>
        ) : (
          groups.map(g => (
            <section key={g.town} className={styles.group} aria-labelledby={`town-${g.town}`}>
              <div className={styles.groupHead}>
                <h2 id={`town-${g.town}`} className={styles.townName}>{g.town}</h2>
                <span className={styles.townCount}>
                  {g.spaces.length} {g.spaces.length === 1 ? 'place' : 'places'}
                </span>
              </div>
              <ul className={styles.grid}>
                {g.spaces.map(s => (
                  <li key={s.id}>
                    <SpaceCard space={s} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}

        <p className={styles.fine}>
          Details come from the sources named on each space&apos;s page, and some are from 2022, so
          call ahead before you go. Spaces without a photo show an illustration.{' '}
          <Link href="/tools/spaces/submit">Add or correct a space</Link>.
        </p>
      </div>
    </div>
  );
}
