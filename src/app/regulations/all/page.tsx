import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import RegulationsDirectory from '@/components/RegulationsDirectory';
import styles from '@/components/RegulationsDirectory.module.css';
import { RULES } from '@/lib/regulationsData';

export const metadata: Metadata = {
  title: 'All Zimbabwe startup regulations',
  description:
    'Every regulation in the Techzim directory in one place, grouped by regulator: POTRAZ, RBZ, ZIMRA and more, with fees, steps and sources.',
};

export default function AllRegulationsPage() {
  return (
    <>
      <PageHeader
        title="All regulations"
        aside={<Link href="/regulations" className={styles.back}>Search by your idea</Link>}
      >
        All {RULES.length} regulations in the directory, grouped by regulator.
      </PageHeader>
      <RegulationsDirectory />
    </>
  );
}
