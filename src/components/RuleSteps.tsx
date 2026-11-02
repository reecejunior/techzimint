import { ExternalLink } from 'lucide-react';
import { STEPS_BASIS_LABEL, type Rule } from '@/lib/regulations';
import styles from './RuleSteps.module.css';

/**
 * The order to do a rule in. Every set says where it came from, and the
 * "check before you act" box carries what the research could not confirm,
 * so a thin source never reads as settled.
 */
export default function RuleSteps({
  rule, heading = 'Steps to comply', sources = true,
}: { rule: Rule; heading?: string; sources?: boolean }) {
  if (!rule.steps?.length) return null;
  return (
    <section className={styles.box} aria-label={`${heading}: ${rule.title}`}>
      <div className={styles.head}>
        <h4>{heading}</h4>
        {rule.stepsBasis && (
          <span className={styles.basis} data-basis={rule.stepsBasis}>
            {STEPS_BASIS_LABEL[rule.stepsBasis]}
          </span>
        )}
      </div>
      <ol className={styles.list}>
        {rule.steps.map(s => (
          <li key={s.t}>
            <strong>{s.t}</strong>
            <span>{s.d}</span>
          </li>
        ))}
      </ol>
      {rule.stepsCheck && (
        <p className={styles.check}>
          <strong>Check before you act. </strong>
          {rule.stepsCheck}
        </p>
      )}
      {sources && rule.stepsSources && rule.stepsSources.length > 0 && (
        <p className={styles.src}>
          <strong>Step sources</strong>
          {rule.stepsSources.map(s => (
            <a key={s.u} href={s.u} target="_blank" rel="noopener noreferrer">
              {s.t}
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          ))}
        </p>
      )}
    </section>
  );
}
