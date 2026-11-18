import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import RegulationsExplorer from '@/components/RegulationsExplorer';

export const metadata: Metadata = {
  title: 'Zimbabwe startup regulations',
  description:
    'See regulations and fees for what you are building in Zimbabwe: licences, registrations, steps and sources.',
};

export default function RegulationsPage() {
  return (
    <>
      <PageHeader title="Regulations for Zimbabwean startups">
        See regulations &amp; fees for what you&apos;re building.
      </PageHeader>
      <RegulationsExplorer />
    </>
  );
}
