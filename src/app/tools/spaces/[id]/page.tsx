import type { Metadata } from 'next';
import { findSeedSpace } from '@/lib/spaces';
import { SEED_SPACES } from '@/lib/spacesData';
import SpaceDetailClient from './SpaceDetailClient';

type Props = { params: Promise<{ id: string }> };

/** Researched spaces are built ahead of time; approved founder submissions load in the browser. */
export function generateStaticParams() {
  return SEED_SPACES.map(s => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const s = findSeedSpace(decodeURIComponent(id));
  if (!s) return { title: 'Space' };
  const what = s.type === 'cafe' ? 'Internet café' : 'Co-working space';
  return {
    title: `${s.name}, ${s.town}`,
    description: [`${what} in ${s.town}.`, s.address, s.price].filter(Boolean).join(' '),
  };
}

export default async function SpacePage({ params }: Props) {
  const { id } = await params;
  return <SpaceDetailClient id={decodeURIComponent(id)} />;
}
