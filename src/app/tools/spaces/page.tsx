'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Building2, Clock, Coffee, ExternalLink, Globe, Mail, MapPin, MessageCircle, Navigation,
  Phone, Plus, Search,
} from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import SpaceCover from '@/components/SpaceCover';
import { SEED_SPACES } from '@/lib/spacesData';
import { useApprovedSpaceSubmissions } from '@/lib/tools';
import { SPACE_TOWNS, type Space, type SpaceType } from '@/lib/types';
import styles from './page.module.css';

type TypeFilter = SpaceType | 'all';

const TYPE_LABEL: Record<SpaceType, string> = { coworking: 'Co-working space', cafe: 'Internet café' };

/** Zimbabwean numbers in international form, for tel: and wa.me links. */
function digits(number: string): string {
  const d = number.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d.slice(1);
  if (d.startsWith('0') && d.length >= 9) return `263${d.slice(1)}`;
  return d;
}

function whatsappLink(value: string): string {
  return /^https?:\/\//.test(value) ? value : `https://wa.me/${digits(value)}`;
}

function mapsLink(s: Space): string {
  const q = [s.name, s.address, s.area, s.town, 'Zimbabwe'].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export default function SpacesPage() {
  const submitted = useApprovedSpaceSubmissions();
  const [town, setTown] = useState<string>('all');
  const [type, setType] = useState<TypeFilter>('all');
  const [search, setSearch] = useState('');

  const all = useMemo<Space[]>(
    () => [
      ...SEED_SPACES,
      ...submitted.map(
        (s): Space => ({
          id: `submitted-${s.id}`,
          name: s.name,
          town: s.town,
          type: s.type,
          area: null,
          address: s.address || null,
          offers: s.offers,
          price: s.price || null,
          hours: null,
          phone: null,
          whatsapp: null,
          email: null,
          website: null,
          contact: s.contact || null,
          photo: null,
          photoCredit: null,
          sources: [{ label: 'Added by a founder', url: null }],
        }),
      ),
    ],
    [submitted],
  );

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
  const groups = towns
    .map(t => ({ town: t, spaces: visible.filter(s => s.town === t) }))
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
          Details come from the sources named on each card, and some are from 2022, so call ahead
          before you go. Photos are credited to the venue that published them; the rest are illustrations.{' '}
          <Link href="/tools/spaces/submit">Add or correct a space</Link>.
        </p>
      </div>
    </div>
  );
}

function SpaceCard({ space: s }: { space: Space }) {
  const Icon = s.type === 'cafe' ? Coffee : Building2;
  // A venue photo that stops loading falls back to the illustrated cover.
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = Boolean(s.photo) && !photoFailed;

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        {showPhoto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.photo ?? undefined}
              alt={`Inside ${s.name}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setPhotoFailed(true)}
            />
            {s.photoCredit && <span className={styles.credit}>Photo: {s.photoCredit}</span>}
          </>
        ) : (
          <SpaceCover id={s.id} town={s.town} type={s.type} />
        )}
        <span className={styles.coverIcon} aria-hidden="true">
          <Icon size={18} />
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.kind}>
          {TYPE_LABEL[s.type]}
          {s.area ? ` · ${s.area}` : ''}
        </p>
        <h3 className={styles.name}>{s.name}</h3>

        {s.price && <p className={styles.price}>{s.price}</p>}

        <ul className={styles.facts}>
          {s.address && (
            <li>
              <MapPin size={15} aria-hidden="true" />
              <span>{s.address}</span>
            </li>
          )}
          {s.hours && (
            <li>
              <Clock size={15} aria-hidden="true" />
              <span>{s.hours}</span>
            </li>
          )}
          {s.contact && (
            <li>
              <Phone size={15} aria-hidden="true" />
              <span>{s.contact}</span>
            </li>
          )}
        </ul>

        {s.offers.length > 0 && <p className={styles.offers}>{s.offers.join(' · ')}</p>}

        <div className={styles.actions}>
          {s.phone && (
            <a className={styles.action} href={`tel:+${digits(s.phone)}`}>
              <Phone size={14} aria-hidden="true" />
              Call
            </a>
          )}
          {s.whatsapp && (
            <a className={styles.action} href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={14} aria-hidden="true" />
              WhatsApp
            </a>
          )}
          {s.email && (
            <a className={styles.action} href={`mailto:${s.email}`}>
              <Mail size={14} aria-hidden="true" />
              Email
            </a>
          )}
          {s.website && (
            <a className={styles.action} href={s.website} target="_blank" rel="noopener noreferrer">
              <Globe size={14} aria-hidden="true" />
              Website
            </a>
          )}
          <a className={styles.action} href={mapsLink(s)} target="_blank" rel="noopener noreferrer">
            <Navigation size={14} aria-hidden="true" />
            Directions
          </a>
        </div>

        <p className={styles.source}>
          Info from{' '}
          {s.sources.map((src, i) => (
            <span key={src.label}>
              {i > 0 && ', '}
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer">
                  {src.label}
                  <ExternalLink size={11} aria-hidden="true" />
                </a>
              ) : (
                src.label
              )}
            </span>
          ))}
        </p>
      </div>
    </article>
  );
}
