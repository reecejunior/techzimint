import { ChevronDown, ExternalLink } from 'lucide-react';
import type { Match } from '@/lib/regulations';
import { CHECKED, REGULATORS } from '@/lib/regulationsData';
import AskQuestion from './AskQuestion';
import RegulatorLogo from './RegulatorLogo';
import RuleReport from './RuleReport';
import RuleSteps from './RuleSteps';
import styles from './RuleRow.module.css';

/**
 * One regulation: logo, title and the one line that matters, opening to the
 * detail, the steps and the sources. `plain` drops the logo and regulator line
 * for lists already grouped under their regulator.
 */
export default function RuleRow({ match, plain = false }: { match: Match; plain?: boolean }) {
  const { rule, ai } = match;
  const reg = REGULATORS[rule.reg];
  return (
    <details className={styles.row} id={`rule-${rule.id}`} data-plain={plain || undefined}>
      <summary className={styles.head}>
        {!plain && <RegulatorLogo reg={rule.reg} />}
        <span className={styles.main}>
          {!plain && (
            <span className={styles.reg}>
              {reg.code} · {reg.name}
              {rule.kind === 'follow' && <span className={styles.notLicence}>Rule to follow, not a licence</span>}
            </span>
          )}
          <span className={styles.title}>
            {rule.title}
            {rule.status === 'verify' && (
              <span className={styles.verify} title="Unclear, dated or only partly confirmed">
                Verify
              </span>
            )}
          </span>
          {rule.when && (
            <span className={styles.when} data-need={rule.kind === 'follow' ? 'follow' : rule.need}>
              <span className={styles.whenLabel}>
                {rule.kind === 'follow'
                  ? 'Applies'
                  : rule.need === 'worth' || rule.need === 'choice' ? 'Optional' : 'Needed'}
              </span>
              {rule.when.replace(/^Optional\.\s*/, '')}
            </span>
          )}
          <span className={styles.headline}>{rule.headline}</span>
          {ai?.reason && <span className={styles.why}>{ai.reason}</span>}
        </span>
        <ChevronDown className={styles.chev} size={18} aria-hidden="true" />
      </summary>

      <div className={styles.body}>
        {rule.benefits && rule.benefits.length > 0 && (
          <div className={styles.benefits}>
            <span className={styles.label}>
              {rule.need === 'worth' ? "Why it's worth doing" : 'What you get'}
            </span>
            <ul>
              {rule.benefits.map(b => <li key={b}>{b}</li>)}
            </ul>
          </div>
        )}
        <p className={styles.summary}>{rule.summary}</p>
        <dl className={styles.facts}>
          {rule.facts.map(f => (
            <div key={f.label} className={styles.fact}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <RuleSteps rule={rule} />
        {rule.note && (
          <p className={styles.note}>
            <strong>Check before relying on this. </strong>
            {rule.note}
          </p>
        )}
        {rule.reviewed && (
          <p className={styles.reviewed}>
            Reviewed by {rule.reviewed.by}, {rule.reviewed.on}.
          </p>
        )}
        <div className={styles.sources}>
          <span className={styles.label}>Sources</span>
          <ul>
            {rule.sources.map(src => (
              <li key={src.u}>
                <a href={src.u} target="_blank" rel="noopener noreferrer">
                  {src.t}
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <span className={styles.checked}>Checked {CHECKED}</span>
        </div>
        <div className={styles.actions}>
          <AskQuestion ruleId={rule.id} ruleTitle={rule.title} regCode={reg.code} />
          <RuleReport ruleId={rule.id} ruleTitle={rule.title} />
        </div>
      </div>
    </details>
  );
}
