import type { Metadata } from 'next';
import { Suspense } from 'react';
import TalentClient from './TalentClient';

export const metadata: Metadata = {
  title: 'Talent Directory',
  description: 'Developers for hire in Zimbabwe, and founders looking for co-founders, staff and freelancers.',
};

export default function TalentPage() {
  return (
    <Suspense>
      <TalentClient />
    </Suspense>
  );
}
