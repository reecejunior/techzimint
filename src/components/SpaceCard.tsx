'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight, Building2, Clock, Coffee, Globe, Mail, MapPin, MessageCircle, Navigation, Phone,
} from 'lucide-react';
import clsx from 'clsx';
import SpaceCover from './SpaceCover';
import { SPACE_TYPE_LABEL, mapsLink, phoneDigits, spaceHref, whatsappLink } from '@/lib/spaces';
import type { Space } from '@/lib/types';
import styles from './SpaceCard.module.css';

/** The space's photo, or its illustrated cover when it has none or the photo fails. */
export function SpacePicture({ space: s }: { space: Space }) {
  const [failed, setFailed] = useState(false);
  if (!s.photo || failed) return <SpaceCover id={s.id} town={s.town} type={s.type} />;
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={s.photo}
        alt={`Inside ${s.name}`}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
      {s.photoCredit && <span className={styles.credit}>Photo: {s.photoCredit}</span>}
    </>
  );
}

/** Call, WhatsApp, Email, Website and Directions, for whichever details exist. */
export function SpaceActions({ space: s, large = false }: { space: Space; large?: boolean }) {
  const cls = clsx(styles.action, large && styles.actionLarge);
  return (
    <div className={styles.actions}>
      {s.phone && (
        <a className={cls} href={`tel:+${phoneDigits(s.phone)}`}>
          <Phone size={14} aria-hidden="true" />
          Call
        </a>
      )}
      {s.whatsapp && (
        <a className={cls} href={whatsappLink(s.whatsapp)} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={14} aria-hidden="true" />
          WhatsApp
        </a>
      )}
      {s.email && (
        <a className={cls} href={`mailto:${s.email}`}>
          <Mail size={14} aria-hidden="true" />
          Email
        </a>
      )}
      {s.website && (
        <a className={cls} href={s.website} target="_blank" rel="noopener noreferrer">
          <Globe size={14} aria-hidden="true" />
          Website
        </a>
      )}
      <a className={cls} href={mapsLink(s)} target="_blank" rel="noopener noreferrer">
        <Navigation size={14} aria-hidden="true" />
        Directions
      </a>
    </div>
  );
}

/** A card in the Spaces grid. The whole card opens the space's own page. */
export default function SpaceCard({ space: s }: { space: Space }) {
  const Icon = s.type === 'cafe' ? Coffee : Building2;

  return (
    <article className={styles.card}>
      <div className={styles.cover}>
        <SpacePicture space={s} />
        <span className={styles.coverIcon} aria-hidden="true">
          <Icon size={18} />
        </span>
      </div>

      <div className={styles.body}>
        <p className={styles.kind}>
          {SPACE_TYPE_LABEL[s.type]}
          {s.area ? ` · ${s.area}` : ''}
        </p>
        <h3 className={styles.name}>
          <Link href={spaceHref(s.id)} className={styles.cardLink}>
            {s.name}
          </Link>
        </h3>

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
        </ul>

        {s.offers.length > 0 && <p className={styles.offers}>{s.offers.join(' · ')}</p>}

        <div className={styles.foot}>
          <SpaceActions space={s} />
          <span className={styles.more} aria-hidden="true">
            Details
            <ArrowUpRight size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
