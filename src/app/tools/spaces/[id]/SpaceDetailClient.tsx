'use client';

import Link from 'next/link';
import { useState } from 'react';
import clsx from 'clsx';
import {
  ArrowLeft, Building2, Check, Clock, Coffee, Globe, Mail, MapPin, MessageCircle,
  Phone, Tag,
} from 'lucide-react';
import SpaceCard, { SpaceActions, SpacePicture } from '@/components/SpaceCard';
import {
  SPACE_TYPE_LABEL, SUBMITTED_PREFIX, findSeedSpace, mapsEmbed, submissionToSpace,
} from '@/lib/spaces';
import { SEED_SPACES } from '@/lib/spacesData';
import { useApprovedSpaceSubmission } from '@/lib/tools';
import type { Space } from '@/lib/types';
import styles from './page.module.css';

export default function SpaceDetailClient({ id }: { id: string }) {
  const seed = findSeedSpace(id);
  const submissionId = !seed && id.startsWith(SUBMITTED_PREFIX) ? id.slice(SUBMITTED_PREFIX.length) : null;
  const { data: submission, loading } = useApprovedSpaceSubmission(submissionId);
  const space = seed ?? (submission ? submissionToSpace(submission) : null);

  if (!space) {
    return (
      <div className={`wrap ${styles.wrap}`}>
        <BackLink />
        {loading ? (
          <div className={`skel ${styles.skelHero}`} />
        ) : (
          <div className={styles.missing}>
            <h1>We couldn&apos;t find that space</h1>
            <p>It may have been removed, or the link is wrong.</p>
            <Link href="/tools/spaces">See all spaces</Link>
          </div>
        )}
      </div>
    );
  }

  return <SpaceDetail space={space} />;
}

function BackLink() {
  return (
    <Link href="/tools/spaces" className={styles.back}>
      <ArrowLeft size={15} aria-hidden="true" />
      All spaces
    </Link>
  );
}

function SpaceDetail({ space: s }: { space: Space }) {
  const Icon = s.type === 'cafe' ? Coffee : Building2;
  const [photo, setPhoto] = useState(0);
  const nearby = SEED_SPACES.filter(o => o.town === s.town && o.id !== s.id)
    .sort((a, b) => Number(b.photos.length > 0) - Number(a.photos.length > 0))
    .slice(0, 3);

  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.wrap}`}>
        <BackLink />

        <div className={styles.hero}>
          <SpacePicture space={s} index={photo} />
        </div>

        {s.photos.length > 1 && (
          <div className={styles.thumbs} role="group" aria-label="Photos">
            {s.photos.map((src, i) => (
              <button
                key={src}
                type="button"
                className={clsx(styles.thumb, i === photo && styles.thumbOn)}
                onClick={() => setPhoto(i)}
                aria-label={`Photo ${i + 1} of ${s.photos.length}`}
                aria-pressed={i === photo}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}

        <header className={styles.head}>
          <span className={styles.icon} aria-hidden="true">
            <Icon size={22} />
          </span>
          <div>
            <p className={styles.kind}>
              {SPACE_TYPE_LABEL[s.type]} · {s.area ? `${s.area}, ${s.town}` : s.town}
            </p>
            <h1 className={styles.name}>{s.name}</h1>
          </div>
        </header>

        <div className={styles.layout}>
          <div className={styles.main}>
            {s.price && (
              <section className={styles.priceBox} aria-label="Prices">
                <Tag size={18} aria-hidden="true" />
                <p>{s.price}</p>
              </section>
            )}

            {s.offers.length > 0 && (
              <section className={styles.section}>
                <h2 className={styles.h2}>What it offers</h2>
                <ul className={styles.offers}>
                  {s.offers.map(o => (
                    <li key={o}>
                      <Check size={16} aria-hidden="true" />
                      {o}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.section}>
              <h2 className={styles.h2}>Where it is</h2>
              <p className={styles.where}>
                {[s.address, s.area, s.town].filter(Boolean).join(', ')}
              </p>
              <div className={styles.map}>
                <iframe
                  title={`Map showing ${s.name}`}
                  src={mapsEmbed(s)}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <p className={styles.note}>
                The map searches for the name and address, so check the pin before you set off.
              </p>
            </section>

          </div>

          <aside className={styles.side}>
            <div className={styles.contactCard}>
              <h2 className={styles.h2}>Get in touch</h2>
              <ul className={styles.contact}>
                {s.address && (
                  <li>
                    <MapPin size={16} aria-hidden="true" />
                    <span>{s.address}</span>
                  </li>
                )}
                {s.hours && (
                  <li>
                    <Clock size={16} aria-hidden="true" />
                    <span>{s.hours}</span>
                  </li>
                )}
                {s.phone && (
                  <li>
                    <Phone size={16} aria-hidden="true" />
                    <span>{s.phone}</span>
                  </li>
                )}
                {s.whatsapp && !/^https?:/.test(s.whatsapp) && (
                  <li>
                    <MessageCircle size={16} aria-hidden="true" />
                    <span>{s.whatsapp} (WhatsApp)</span>
                  </li>
                )}
                {s.email && (
                  <li>
                    <Mail size={16} aria-hidden="true" />
                    <span>{s.email}</span>
                  </li>
                )}
                {s.website && (
                  <li>
                    <Globe size={16} aria-hidden="true" />
                    <span>{s.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
                  </li>
                )}
                {s.contact && (
                  <li>
                    <Phone size={16} aria-hidden="true" />
                    <span>{s.contact}</span>
                  </li>
                )}
              </ul>
              <SpaceActions space={s} large />
              <p className={styles.note}>
                Prices and hours change, so call ahead.{' '}
                <Link href="/tools/spaces/submit">Something wrong? Tell us</Link>.
              </p>
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section className={styles.nearby} aria-labelledby="nearby-h">
            <h2 id="nearby-h" className={styles.nearbyTitle}>More spaces in {s.town}</h2>
            <ul className={styles.grid}>
              {nearby.map(o => (
                <li key={o.id}>
                  <SpaceCard space={o} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
