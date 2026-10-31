import type { Metadata } from 'next';
import PageHeader from '@/components/PageHeader';
import RegulationsExplorer from '@/components/RegulationsExplorer';
import { CHECKED } from '@/lib/regulationsData';

export const metadata: Metadata = {
  title: 'Zimbabwe startup regulations',
  description:
    'Say what you want to build and see the Zimbabwean rules that apply, POTRAZ first: licences, fees, data protection, payments, e-hailing, drones and more, each with its source.',
};

export default function RegulationsPage() {
  return (
    <>
      <PageHeader eyebrow="Rules" title="Regulations for Zimbabwean startups">
        Say what you want to build. POTRAZ rules come first, then other regulators, then the
        basics every company needs. Checked {CHECKED}.
      </PageHeader>
      <RegulationsExplorer />
    </>
  );
}
