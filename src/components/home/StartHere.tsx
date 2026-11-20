'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { ArrowRight, BookOpen, PlayCircle, Wrench } from 'lucide-react';
import clsx from 'clsx';
import { STAGES, type ResourceLink, type StageKey } from '@/lib/homeContent';
import styles from './home.module.css';

const KIND_ICON = { video: PlayCircle, guide: BookOpen, tool: Wrench } as const;
const KIND_LABEL = { video: 'Video', guide: 'Guide', tool: 'Tool' } as const;

/** The stage picker: one step of the founder journey at a time. */
export default function StartHere() {
  const [active, setActive] = useState<StageKey>('idea');
  const baseId = useId();
  const index = STAGES.findIndex(s => s.key === active);
  const stage = STAGES[index];

  return (
    <div className={styles.stages}>
      <div className={styles.stageTabs} role="tablist" aria-label="Your stage">
        {STAGES.map((s, i) => (
          <button
            key={s.key}
            type="button"
            role="tab"
            id={`${baseId}-tab-${s.key}`}
            aria-selected={active === s.key}
            aria-controls={`${baseId}-panel`}
            className={clsx(styles.stageTab, active === s.key && styles.stageTabOn, i < index && styles.stageTabDone)}
            onClick={() => setActive(s.key)}
          >
            <span className={styles.stageNum}>{i + 1}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div
        className={styles.stagePanel}
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${stage.key}`}
      >
        <div className={styles.stageIntro}>
          <p className={styles.stageStep}>
            Step {index + 1} of {STAGES.length}
          </p>
          <h3 className={styles.stageQuestion}>{stage.question}</h3>
          <p className={styles.stageSummary}>{stage.summary}</p>
          {index < STAGES.length - 1 && (
            <button type="button" className={styles.stageNext} onClick={() => setActive(STAGES[index + 1].key)}>
              Next: {STAGES[index + 1].label}
              <ArrowRight size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <ul className={styles.stageResources}>
          {stage.resources.map(r => (
            <li key={r.title}>
              <Resource r={r} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Resource({ r }: { r: ResourceLink }) {
  const Icon = KIND_ICON[r.kind];
  return (
    <Link href={r.href} className={styles.resource}>
      <span className={clsx(styles.resourceIcon, styles[`kind_${r.kind}`])} aria-hidden="true">
        <Icon size={18} />
      </span>
      <span className={styles.resourceText}>
        <span className={styles.resourceKind}>{KIND_LABEL[r.kind]}</span>
        <span className={styles.resourceTitle}>{r.title}</span>
        <span className={styles.resourceMeta}>{r.meta}</span>
      </span>
      <ArrowRight size={16} className={styles.resourceArrow} aria-hidden="true" />
    </Link>
  );
}
