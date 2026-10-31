'use client';

import { useId, useMemo, useState } from 'react';
import { ExternalLink, X } from 'lucide-react';
import clsx from 'clsx';
import { matchIdea, type Match, type Rule, type RuleStatus } from '@/lib/regulations';
import {
  CHECKED, GAPS, REGULATOR_ORDER, REGULATORS, RULES, SECTORS,
} from '@/lib/regulationsData';
import styles from './RegulationsExplorer.module.css';

const EXAMPLES = [
  'A mobile wallet for diaspora remittances with SMS receipts',
  'Rural Wi-Fi internet service provider',
  'Ride-hailing app for Bulawayo',
  'Online clothes store with delivery',
  'Drone delivery of medical supplies',
  'Crowdfunding platform for farmers',
  'Funeral cover app',
  'Smart meter hardware with sensors',
];

const STATUS_LABEL: Record<RuleStatus, string> = {
  official: 'From official text',
  reported: 'From reporting',
  verify: 'Verify before relying',
};

const SECTOR_LABEL = Object.fromEntries(SECTORS.map(s => [s.id, s.label]));

function StatusPill({ status }: { status: RuleStatus }) {
  return (
    <span className={styles.status} data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function RuleRow({ rule, hits, tag }: { rule: Rule; hits?: string[]; tag?: string }) {
  const reg = REGULATORS[rule.reg];
  return (
    <article className={styles.rule} id={`rule-${rule.id}`}>
      <div className={styles.reg}>
        <span className={styles.regCode}>{reg.code}</span>
        <span className={styles.regName}>{reg.name}</span>
      </div>
      <div className={styles.ruleMain}>
        <div className={styles.ruleHead}>
          <h3>{rule.title}</h3>
          <StatusPill status={rule.status} />
        </div>
        {hits && hits.length > 0 ? (
          <p className={styles.why}>
            Matches your idea:{' '}
            {hits.map(h => (
              <span key={h} className={styles.tag}>{SECTOR_LABEL[h]}</span>
            ))}
          </p>
        ) : tag ? (
          <p className={styles.why}><span className={styles.tag}>{tag}</span></p>
        ) : null}
        <p className={styles.headline}>{rule.headline}</p>
        <p className={styles.summary}>{rule.summary}</p>
        <details className={styles.details}>
          <summary>Fees, deadlines and detail</summary>
          <dl className={styles.facts}>
            {rule.facts.map(f => (
              <div key={f.label} className={styles.fact}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          {rule.note && (
            <p className={styles.note}>
              <strong>Check:</strong> {rule.note}
            </p>
          )}
        </details>
        <p className={styles.sources}>
          Sources:{' '}
          {rule.sources.map((s, i) => (
            <span key={s.u}>
              {i > 0 && ' · '}
              <a href={s.u} target="_blank" rel="noopener noreferrer">
                {s.t}
                <ExternalLink size={11} aria-hidden="true" />
              </a>
            </span>
          ))}{' '}
          · Checked {CHECKED}
        </p>
      </div>
    </article>
  );
}

function Group({
  title, caption, note, items, tag,
}: {
  title: string;
  caption: string;
  note?: string;
  items: Match[];
  tag?: (m: Match) => string | undefined;
}) {
  if (items.length === 0) return null;
  return (
    <section className={styles.group} aria-labelledby={`g-${title}`}>
      <h2 id={`g-${title}`}>
        {title} <small>{caption}</small>
      </h2>
      {note && <p className={styles.groupNote}>{note}</p>}
      {items.map(m => (
        <RuleRow key={m.rule.id} rule={m.rule} hits={m.hits} tag={tag?.(m)} />
      ))}
    </section>
  );
}

export default function RegulationsExplorer() {
  const [idea, setIdea] = useState('');
  const inputId = useId();
  const trimmed = idea.trim();
  const result = useMemo(() => (trimmed ? matchIdea(trimmed) : null), [trimmed]);

  const shown = result
    ? result.potraz.length + result.others.length + result.general.length
    : RULES.length;

  return (
    <div className={clsx('wrap', styles.root)}>
      <div className={styles.ask}>
        <label htmlFor={inputId} className={styles.label}>
          What are you building?
        </label>
        <textarea
          id={inputId}
          className={styles.input}
          rows={3}
          value={idea}
          onChange={e => setIdea(e.target.value)}
          placeholder="e.g. a mobile wallet for diaspora remittances with SMS receipts"
          spellCheck={false}
        />
        <div className={styles.examples} role="group" aria-label="Example ideas">
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" className={styles.chip} onClick={() => setIdea(ex)}>
              {ex}
            </button>
          ))}
          {idea && (
            <button type="button" className={styles.clear} onClick={() => setIdea('')}>
              <X size={13} aria-hidden="true" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className={styles.legend} aria-label="What the labels mean">
        <span><StatusPill status="official" /> read in the regulation or on the regulator&apos;s page</span>
        <span><StatusPill status="reported" /> news or a law-firm summary</span>
        <span><StatusPill status="verify" /> unclear, dated or only partly confirmed</span>
      </div>

      <p className={styles.count} role="status">
        {result
          ? `${shown} of ${RULES.length} rules apply or may apply to this idea.`
          : `${RULES.length} rules in the directory. Describe your idea above to filter them.`}
      </p>

      {result && result.recognised.length > 0 && (
        <p className={styles.recognised}>
          <strong>Recognised:</strong>{' '}
          {result.recognised.map(id => (
            <span key={id} className={styles.tag}>{SECTOR_LABEL[id]}</span>
          ))}
        </p>
      )}

      {result && !result.hasSector && (
        <div className={styles.empty}>
          <p><strong>No specific sector recognised in that description.</strong></p>
          <p>
            Showing the POTRAZ data rules and the basics every company needs. Try words like
            wallet, ISP, SMS, delivery, drone, insurance or marketplace.
          </p>
        </div>
      )}

      {result ? (
        <>
          <Group
            title="POTRAZ"
            caption="Rules for your idea, first"
            note="Telecoms licences, numbering and personal data law. Listed first because POTRAZ rules come up for most digital products."
            items={result.potraz}
            tag={m => (m.rule.baseline ? 'Applies to most products that hold personal data' : undefined)}
          />
          <Group
            title="Other regulators"
            caption="Matched to your idea"
            note="Payments, securities, insurance, transport, tax and consumer rules that fit what you described."
            items={result.others}
          />
          <Group
            title="Every company"
            caption="Baseline"
            note="Needed whatever you build."
            items={result.general}
            tag={() => 'Applies to every company'}
          />
        </>
      ) : (
        REGULATOR_ORDER.map(code => (
          <Group
            key={code}
            title={REGULATORS[code].code}
            caption={REGULATORS[code].name}
            items={RULES.filter(r => r.reg === code).map(rule => ({ rule, hits: [], score: 0 }))}
          />
        ))
      )}

      <section className={styles.gaps} aria-labelledby="gaps-h">
        <h2 id="gaps-h">Not covered yet</h2>
        <ul>
          {GAPS.map(g => <li key={g}>{g}</li>)}
        </ul>
      </section>

      <p className={styles.disclaimer}>
        This is a research directory, not legal advice. Fees and rules change; confirm with the
        regulator or a Zimbabwean lawyer before you act. Anything marked &ldquo;Verify before
        relying&rdquo; is a lead to confirm, not a fact.
      </p>
    </div>
  );
}
