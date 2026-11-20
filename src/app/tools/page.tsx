import Link from 'next/link';
import { ArrowRight, Coffee, FileCheck2, Users } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import styles from './page.module.css';

const TOOLS = [
  {
    href: '/tools/regulations',
    icon: FileCheck2,
    name: 'Regulations',
    text: 'The licences and registrations your startup needs, and the rules to follow once you are running.',
  },
  {
    href: '/tools/spaces',
    icon: Coffee,
    name: 'Spaces',
    text: 'Co-working spaces and internet cafés in Harare, Bulawayo and Mutare, with what each one offers.',
  },
  {
    href: '/tools/talent',
    icon: Users,
    name: 'Talent Directory',
    text: 'Developers and designers for hire, and founders looking for co-founders, staff or freelancers.',
  },
];

export default function ToolsPage() {
  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Tools" title="Tools for founders">
        Practical tools for building a startup in Zimbabwe, in one place.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <ul className={styles.grid}>
          {TOOLS.map(t => (
            <li key={t.href}>
              <Link href={t.href} className={styles.card}>
                <span className={styles.icon} aria-hidden="true">
                  <t.icon size={20} />
                </span>
                <span className={styles.name}>{t.name}</span>
                <span className={styles.text}>{t.text}</span>
                <span className={styles.open}>
                  Open
                  <ArrowRight size={14} aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
