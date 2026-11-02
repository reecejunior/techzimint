import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import RegulationsExplorer from '@/components/RegulationsExplorer';

export const metadata: Metadata = {
  title: 'Zimbabwe startup regulations',
  description:
    'Describe what you want to build and see the Zimbabwean regulations that apply: licences, registrations, fees and steps, each with its source.',
};

export default function RegulationsPage() {
  return (
    <>
      <PageHeader title="Regulations for Zimbabwean startups">
        Describe what you&apos;re building and see the licences, registrations and rules that
        apply, with fees, steps and sources.
      </PageHeader>
      <RegulationsExplorer />
    </>
  );
}
