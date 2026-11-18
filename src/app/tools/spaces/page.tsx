'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import { SEED_SPACES } from '@/lib/spacesData';
import { useApprovedSpaceSubmissions } from '@/lib/tools';
import { SPACE_TOWNS, type Space, type SpaceType } from '@/lib/types';
import styles from './page.module.css';

type TownFilter = (typeof SPACE_TOWNS)[number] | 'all';
type TypeFilter = SpaceType | 'all';

const TYPE_LABEL: Record<SpaceType, string> = { coworking: 'Co-working', cafe: 'Internet café' };

export default function SpacesPage() {
  const submitted = useApprovedSpaceSubmissions();
  const [town, setTown] = useState<TownFilter>('all');
  const [type, setType] = useState<TypeFilter>('all');

  const all = useMemo<Space[]>(
    () => [
      ...SEED_SPACES,
      ...submitted.map(s => ({
        id: `submitted-${s.id}`,
        name: s.name,
        town: s.town,
        type: s.type,
        address: s.address || null,
        offers: s.offers,
        price: s.price || null,
        contact: s.contact || null,
        sourceUrl: null,
        verified: false,
      })),
    ],
    [submitted],
  );

  const visible = all.filter(
    s => (town === 'all' || s.town === town) && (type === 'all' || s.type === type),
  );

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
        Co-working spaces and internet cafés for founders, town by town. Where we have a
        venue&apos;s own details, they are shown. Everything else is marked to confirm.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <div className={styles.filters}>
          <div role="tablist" aria-label="Town" className={styles.row}>
            {(['all', ...SPACE_TOWNS] as TownFilter[]).map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={town === t}
                className={clsx(styles.chip, town === t && styles.chipOn)}
                onClick={() => setTown(t)}
              >
                {t === 'all' ? 'All towns' : t}
              </button>
            ))}
          </div>
          <div role="tablist" aria-label="Type" className={styles.row}>
            {(['all', 'coworking', 'cafe'] as TypeFilter[]).map(t => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={type === t}
                className={clsx(styles.chip, type === t && styles.chipOn)}
                onClick={() => setType(t)}
              >
                {t === 'all' ? 'Any type' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className={styles.empty}>
            No spaces listed here yet.{' '}
            <Link href="/tools/spaces/submit">Add one you know about</Link>.
          </p>
        ) : (
          <ul className={styles.list}>
            {visible.map(s => (
              <li key={s.id}>
                <SpaceCard space={s} />
              </li>
            ))}
          </ul>
        )}

        <p className={styles.fine}>
          Prices change, and some come from 2025 articles. Check with the space before you go.
          Venues are listed as research, not as endorsements.
        </p>
      </div>
    </div>
  );
}

function SpaceCard({ space: s }: { space: Space }) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.name}>{s.name}</h2>
          <p className={styles.meta}>
            {s.town} · {TYPE_LABEL[s.type]}
          </p>
        </div>
        <span className={clsx(styles.badge, s.verified && styles.badgeOk)}>
          {s.verified ? 'From the venue' : 'To confirm'}
        </span>
      </header>

      <dl className={styles.facts}>
        <div>
          <dt>Address</dt>
          <dd>{s.address ?? 'Not confirmed yet'}</dd>
        </div>
        {s.price && (
          <div>
            <dt>Prices</dt>
            <dd>{s.price}</dd>
          </div>
        )}
        {s.contact && (
          <div>
            <dt>Contact</dt>
            <dd>{s.contact}</dd>
          </div>
        )}
      </dl>

      {s.offers.length > 0 && (
        <ul className={styles.offers} aria-label="What it offers">
          {s.offers.map(o => (
            <li key={o} className={styles.offer}>{o}</li>
          ))}
        </ul>
      )}

      {s.sourceUrl && (
        <a className={styles.source} href={s.sourceUrl} target="_blank" rel="noopener noreferrer">
          Source
          <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}
