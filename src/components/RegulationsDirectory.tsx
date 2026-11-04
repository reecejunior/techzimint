'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import type { Match } from '@/lib/regulations';
import { CHECKED, DIRECTORY_SECTIONS, GAPS, REGULATORS, RULES } from '@/lib/regulationsData';
import RuleRow from './RuleRow';
import styles from './RegulationsDirectory.module.css';

/** Every regulation in one place, grouped by kind of business, with a quick filter. */
export default function RegulationsDirectory() {
  const [filter, setFilter] = useState('');

  const sections = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const byId = new Map(RULES.map(r => [r.id, r]));
    return DIRECTORY_SECTIONS.map(s => {
      const rules = s.ids
        .map(id => byId.get(id))
        .filter((r): r is (typeof RULES)[number] => Boolean(r))
        .filter(r => {
          if (!q) return true;
          const reg = REGULATORS[r.reg];
          return `${s.title} ${reg.code} ${reg.name} ${r.title} ${r.headline} ${r.summary}`
            .toLowerCase()
            .includes(q);
        });
      return { ...s, rules };
    }).filter(s => s.rules.length > 0);
  }, [filter]);

  const total = sections.reduce((n, s) => n + s.rules.length, 0);
  // Rules to follow are listed once, after every licence, in section order.
  const followRules = sections.flatMap(s => s.rules.filter(r => r.kind === 'follow'));

  return (
    <div className={clsx('wrap', styles.root)}>
      <div className={styles.filter}>
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter, e.g. payments, tax, delivery, POTRAZ"
          aria-label="Filter regulations"
        />
      </div>
      {filter.trim() && (
        <p className={styles.count}>
          {total} {total === 1 ? 'regulation' : 'regulations'} match
        </p>
      )}

      <p className={styles.legend}>
        Licences and registrations come first, grouped by kind of business. Rules you just follow,
        with nothing to apply for, are listed separately at the bottom.
      </p>

      {sections.map(({ title, note, rules }) => {
        const toGet = rules.filter(r => r.kind !== 'follow');
        if (toGet.length === 0) return null;
        return (
          <section key={title} className={styles.section} aria-label={title}>
            <header className={styles.head}>
              <div>
                <h2>{title}</h2>
                <p>{note}</p>
              </div>
            </header>
            <div className={styles.list}>
              {toGet.map(r => <RuleRow key={r.id} match={{ rule: r, hits: [], score: 0 } as Match} />)}
            </div>
          </section>
        );
      })}

      {followRules.length > 0 && (
        <details className={styles.rulesBlock} open={Boolean(filter.trim()) || undefined}>
          <summary>
            <span className={styles.kindFollow}>Rules to follow ({followRules.length})</span>
            <span className={styles.subNote}>
              Not licences: nothing to apply for, but the law expects these once they apply to you.
            </span>
          </summary>
          <div className={styles.list} data-kind="follow">
            {followRules.map(r => <RuleRow key={r.id} match={{ rule: r, hits: [], score: 0 } as Match} />)}
          </div>
        </details>
      )}

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
