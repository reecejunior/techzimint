import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';
import RegulationsDirectory from '@/components/RegulationsDirectory';
import styles from '@/components/RegulationsDirectory.module.css';

export const metadata: Metadata = {
  title: 'All Zimbabwe startup regulations',
  description:
    'Every regulation in the Techzim directory in one place, grouped by the kind of business it applies to, with fees, steps and sources.',
};

export default function AllRegulationsPage() {
  return (
    <>
      <PageHeader
        title="All licences and regulations"
        aside={<Link href="/regulations" className={styles.back}>Search by your idea</Link>}
      >
        Licences and registrations by kind of business, then the rules to follow.
      </PageHeader>
      <RegulationsDirectory />
    </>
  );
}
