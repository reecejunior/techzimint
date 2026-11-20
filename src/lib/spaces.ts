import { SEED_SPACES } from './spacesData';
import type { Space, SpaceSubmission, SpaceType } from './types';

export const SPACE_TYPE_LABEL: Record<SpaceType, string> = {
  coworking: 'Co-working space',
  cafe: 'Internet café',
};

/** Approved founder submissions get this id prefix, so their pages can't clash with researched ones. */
export const SUBMITTED_PREFIX = 'submitted-';

export function findSeedSpace(id: string): Space | undefined {
  return SEED_SPACES.find(s => s.id === id);
}

export function spaceHref(id: string): string {
  return `/tools/spaces/${encodeURIComponent(id)}`;
}

export function submissionToSpace(s: SpaceSubmission): Space {
  return {
    id: `${SUBMITTED_PREFIX}${s.id}`,
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
  };
}

/** Zimbabwean numbers in international form, for tel: and wa.me links. */
export function phoneDigits(number: string): string {
  const d = number.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) return d.slice(1);
  if (d.startsWith('0') && d.length >= 9) return `263${d.slice(1)}`;
  return d;
}

export function whatsappLink(value: string): string {
  return /^https?:\/\//.test(value) ? value : `https://wa.me/${phoneDigits(value)}`;
}

function mapsQuery(s: Space): string {
  return [s.name, s.address, s.area, s.town, 'Zimbabwe'].filter(Boolean).join(', ');
}

export function mapsLink(s: Space): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery(s))}`;
}

/** A keyless Google Maps embed, for the map on a space's own page. */
export function mapsEmbed(s: Space): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(mapsQuery(s))}&z=16&output=embed`;
}
