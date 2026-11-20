import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import PageHeader from '@/components/PageHeader';
import { RULES, SECTORS } from '@/lib/regulationsData';
import { SEED_SPACES } from '@/lib/spacesData';
import { initials, toneFor } from '@/lib/talent';
import { DEVELOPERS } from '@/lib/talentData';
import styles from './page.module.css';

const LOGOS = ['zimra', 'potraz', 'rbz', 'zida', 'nssa', 'secz', 'zera'];
const FACES = DEVELOPERS.slice(0, 9);
const SPACE_TOWNS = [...new Set(SEED_SPACES.map(s => s.town))];

function listWords(items: string[]): string {
  return items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export default function ToolsPage() {
  const tools = [
    {
      href: '/tools/regulations',
      name: 'Regulations',
      text: 'The licences and registrations your startup needs, and the rules to follow once you are running.',
      stat: `${RULES.length} rules for ${SECTORS.length} kinds of business`,
      visual: (
        <div className={clsx(styles.visual, styles.visualRegs)} aria-hidden="true">
          <div className={styles.logos}>
            {LOGOS.map(l => (
              <span key={l} className={styles.logo}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/regulators/${l}.png`} alt="" />
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      href: '/tools/spaces',
      name: 'Spaces',
      text: 'Co-working spaces and internet cafés where you can sit down and work, with prices and contacts.',
      stat: `${SEED_SPACES.length} spaces in ${listWords(SPACE_TOWNS)}`,
      visual: (
        <div className={clsx(styles.visual, styles.visualPhoto)} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/spaces/eight-to-five-hub.jpg" alt="" />
        </div>
      ),
    },
    {
      href: '/tools/talent',
      name: 'Talent Directory',
      text: 'Developers you can hire, and founders looking for co-founders, staff or freelancers.',
      stat: `${DEVELOPERS.length} developers`,
      visual: (
        <div className={clsx(styles.visual, styles.visualTalent)} aria-hidden="true">
          <div className={styles.faces}>
            {FACES.map(d => (
              <span key={d.id} className={clsx(styles.face, styles[`tone_${toneFor(d.name)}`])}>
                {initials(d.name)}
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <PageHeader eyebrow="Tools" title="Tools for founders">
        Practical tools for building a startup in Zimbabwe, in one place. Free to use.
      </PageHeader>

      <div className={`wrap ${styles.wrap}`}>
        <ul className={styles.grid}>
          {tools.map(t => (
            <li key={t.href}>
              <Link href={t.href} className={styles.card}>
                {t.visual}
                <span className={styles.body}>
                  <span className={styles.name}>{t.name}</span>
                  <span className={styles.text}>{t.text}</span>
                  <span className={styles.foot}>
                    <span className={styles.stat}>{t.stat}</span>
                    <span className={styles.go}>
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
