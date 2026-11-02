'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import type { Match } from '@/lib/regulations';
import { CHECKED, GAPS, REGULATOR_ORDER, REGULATORS, RULES } from '@/lib/regulationsData';
import RegulatorLogo from './RegulatorLogo';
import RuleRow from './RuleRow';
import styles from './RegulationsDirectory.module.css';

/** Every regulation in one place, grouped by regulator, with a quick filter. */
export default function RegulationsDirectory() {
  const [filter, setFilter] = useState('');

  const sections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return REGULATOR_ORDER.map(reg => {
      const info = REGULATORS[reg];
      const regHit = q && `${info.code} ${info.name}`.toLowerCase().includes(q);
      const rules = RULES.filter(r => r.reg === reg).filter(
        r =>
          !q ||
          regHit ||
          `${r.title} ${r.headline} ${r.summary}`.toLowerCase().includes(q),
      );
      return { reg, info, rules };
    }).filter(s => s.rules.length > 0);
  }, [filter]);

  const total = sections.reduce((n, s) => n + s.rules.length, 0);

  return (
    <div className={clsx('wrap', styles.root)}>
      <div className={styles.filter}>
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter, e.g. licence, tax, data, POTRAZ"
          aria-label="Filter regulations"
        />
      </div>
      {filter.trim() && (
        <p className={styles.count}>
          {total} {total === 1 ? 'regulation' : 'regulations'} match
        </p>
      )}

      {sections.map(({ reg, info, rules }) => (
        <section key={reg} className={styles.section} aria-labelledby={`reg-${reg}`}>
          <header className={styles.head}>
            <RegulatorLogo reg={reg} size={40} />
            <div>
              <h2 id={`reg-${reg}`}>{info.code}</h2>
              <p>{info.name}</p>
            </div>
          </header>
          <div className={styles.list}>
            {rules.map(r => {
              const m: Match = { rule: r, hits: [], score: 0 };
              return <RuleRow key={r.id} match={m} plain />;
            })}
          </div>
        </section>
      ))}

      {total === 0 && <p className={styles.count}>Nothing matches that. Try a shorter word.</p>}

      <section id="gaps" className={styles.gaps} aria-labelledby="gaps-h">
        <h2 id="gaps-h">Not covered yet</h2>
        <ul>
          {GAPS.map(g => <li key={g}>{g}</li>)}
        </ul>
      </section>

      <p className={styles.fine}>
        Items marked Verify are unclear, dated or only partly confirmed. Checked {CHECKED}. A
        research directory, not legal advice: confirm with the regulator or a Zimbabwean lawyer
        before you act.
      </p>
    </div>
  );
}
