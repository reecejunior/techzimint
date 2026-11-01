'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import {
  GROUP_ORDER, browseAll, countShown, matchIdea,
  type AiPlan, type GroupKey, type Match, type RuleStatus,
} from '@/lib/regulations';
import { MAX_IDEA_LENGTH } from '@/lib/regulationsAi';
import {
  CHECKED, GAPS, GROUP_INFO, PHASE_LABEL, REGULATORS, RULES, SECTORS,
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

/** The AI step's state for the current search. */
type AiState =
  | 'idle'        // nothing searched yet
  | 'pending'     // keyword results are showing, the model is still reading
  | 'done'        // the model's plan has been applied
  | 'no-opinion'  // the model answered with nothing usable
  | 'unavailable' // the model host could not be reached
  | 'disabled';   // no model is configured for this site

function StatusPill({ status }: { status: RuleStatus }) {
  return (
    <span className={styles.status} data-status={status}>
      {STATUS_LABEL[status]}
    </span>
  );
}

function RuleRow({ match, browsing }: { match: Match; browsing: boolean }) {
  const { rule, hits, ai } = match;
  const reg = REGULATORS[rule.reg];
  const addedByAi = ai && hits.length === 0 && rule.scope === 'specific';
  return (
    <article className={styles.rule} id={`rule-${rule.id}`}>
      <div className={styles.reg}>
        <span className={styles.regCode}>{reg.code}</span>
        <span className={styles.regName}>{reg.name}</span>
        <span className={styles.phase} data-phase={rule.phase}>{PHASE_LABEL[rule.phase]}</span>
      </div>
      <div className={styles.ruleMain}>
        <div className={styles.ruleHead}>
          <h3>{rule.title}</h3>
          <StatusPill status={rule.status} />
        </div>
        {!browsing && hits.length > 0 && (
          <p className={styles.why}>
            Matches your idea:{' '}
            {hits.map(h => (
              <span key={h} className={styles.tag}>{SECTOR_LABEL[h]}</span>
            ))}
          </p>
        )}
        {!browsing && addedByAi && (
          <p className={styles.why}><span className={styles.tag}>Suggested by AI</span></p>
        )}
        {ai?.reason && (
          <p className={styles.aiWhy}>
            <span className={styles.aiBadge}>AI</span> {ai.reason}
          </p>
        )}
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

function aiStatusText(ai: AiState): string {
  switch (ai) {
    case 'pending': return 'Refining with AI…';
    case 'done': return 'Refined with AI';
    case 'no-opinion': return 'Keyword matches (AI had no extra view)';
    case 'unavailable': return 'Keyword matches (AI unavailable)';
    case 'disabled': return 'Keyword matches';
    default: return '';
  }
}

export default function RegulationsExplorer() {
  const [draft, setDraft] = useState('');
  /** The idea the results on screen belong to. null = nothing searched yet. */
  const [query, setQuery] = useState<string | null>(null);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [ai, setAi] = useState<AiState>('idle');
  const inputId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  /** Bumped per search so a slow reply for an old idea cannot overwrite a newer one. */
  const requestId = useRef(0);
  const [searchCount, setSearchCount] = useState(0);

  const browsing = query === null;
  const matched = useMemo(
    () => (query === null ? browseAll() : matchIdea(query, plan)),
    [query, plan],
  );
  const shown = countShown(matched);
  const stale = draft.trim() !== (query ?? '');
  const pending = ai === 'pending';

  async function search(text: string) {
    const idea = text.trim().slice(0, MAX_IDEA_LENGTH);
    const id = ++requestId.current;

    if (!idea) {
      setQuery(null);
      setPlan(null);
      setAi('idle');
      return;
    }

    setDraft(idea);
    setQuery(idea);
    setPlan(null);
    setAi('pending');
    setSearchCount(n => n + 1);

    try {
      const res = await fetch('/api/regulations/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
        signal: AbortSignal.timeout(25_000),
      });
      if (id !== requestId.current) return;
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { configured?: boolean; plan?: AiPlan | null };
      if (id !== requestId.current) return;
      if (data.configured === false) setAi('disabled');
      else if (data.plan) {
        setPlan(data.plan);
        setAi('done');
      } else setAi('no-opinion');
    } catch {
      if (id === requestId.current) setAi('unavailable');
    }
  }

  function clear() {
    requestId.current += 1;
    setDraft('');
    setQuery(null);
    setPlan(null);
    setAi('idle');
  }

  // Bring the results into view after a search, so pressing the button visibly
  // does something even when the list below the fold was already there.
  useEffect(() => {
    if (searchCount === 0) return;
    const el = barRef.current;
    if (!el) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
  }, [searchCount]);

  return (
    <div className={clsx('wrap', styles.root)}>
      <form
        className={styles.ask}
        onSubmit={e => {
          e.preventDefault();
          search(draft);
        }}
      >
        <label htmlFor={inputId} className={styles.label}>
          What are you building?
        </label>
        <textarea
          id={inputId}
          className={styles.input}
          rows={3}
          maxLength={MAX_IDEA_LENGTH}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            // Enter searches; Shift+Enter adds a line. Leave IME composition alone.
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              search(draft);
            }
          }}
          placeholder="e.g. a mobile wallet for diaspora remittances with SMS receipts"
          spellCheck={false}
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.search} disabled={pending || !draft.trim()}>
            {pending ? (
              <Loader2 size={16} className={styles.spin} aria-hidden="true" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            {pending ? 'Searching…' : 'Find my rules'}
          </button>
          {(draft || query !== null) && (
            <button type="button" className={styles.clear} onClick={clear}>
              <X size={13} aria-hidden="true" /> Clear
            </button>
          )}
          {stale && draft.trim() && (
            <span className={styles.stale}>
              {browsing
                ? 'Press Find my rules to search.'
                : 'You changed the idea. Press Find my rules to update the results.'}
            </span>
          )}
        </div>
        <div className={styles.examples} role="group" aria-label="Example ideas">
          <span className={styles.examplesLabel}>Try:</span>
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" className={styles.chip} onClick={() => search(ex)}>
              {ex}
            </button>
          ))}
        </div>
      </form>

      <div className={styles.legend} aria-label="What the labels mean">
        <span><StatusPill status="official" /> read in the regulation or on the regulator&apos;s page</span>
        <span><StatusPill status="reported" /> news or a law-firm summary</span>
        <span><StatusPill status="verify" /> unclear, dated or only partly confirmed</span>
      </div>

      <div className={styles.bar} ref={barRef} tabIndex={-1} role="status" aria-live="polite">
        <div className={styles.barMain}>
          <h2 className={styles.barTitle}>
            {browsing ? `All ${RULES.length} rules` : <>Results for &ldquo;{query}&rdquo;</>}
          </h2>
          <p className={styles.barSub}>
            {browsing
              ? 'Describe your idea above and press Find my rules to narrow these down.'
              : `${shown} of ${RULES.length} rules apply or may apply.`}
          </p>
        </div>
        {!browsing && (
          <span className={styles.done} data-state={ai}>
            {pending ? (
              <Loader2 size={15} className={styles.spin} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={15} aria-hidden="true" />
            )}
            <span>
              <strong>{pending ? 'Searching' : 'Search done'}</strong>
              <span className={styles.doneSub}>{aiStatusText(ai)}</span>
            </span>
          </span>
        )}
      </div>

      {!browsing && matched.recognised.length > 0 && (
        <p className={styles.recognised}>
          <strong>Recognised:</strong>{' '}
          {matched.recognised.map(id => (
            <span key={id} className={styles.tag}>{SECTOR_LABEL[id]}</span>
          ))}
        </p>
      )}

      {matched.clarify && (
        <div className={styles.clarify}>
          <p><strong>To narrow this down:</strong> {matched.clarify}</p>
          <p>Add your answer to the description and press Find my rules again.</p>
        </div>
      )}

      {!browsing && !matched.hasSector && (
        <div className={styles.empty}>
          <p><strong>No specific sector recognised in that description.</strong></p>
          <p>
            Showing the general rules every business faces. Try words like wallet, ISP, SMS,
            delivery, drone, insurance or marketplace.
          </p>
        </div>
      )}

      <nav className={styles.jump} aria-label="Jump to a group">
        {GROUP_ORDER.map(k => (
          <a
            key={k}
            href={`#grp-${k}`}
            className={styles.jumpLink}
            data-empty={matched.groups[k].length === 0 || undefined}
          >
            <span className={styles.jumpCount}>{matched.groups[k].length}</span>
            {GROUP_INFO[k].title}
          </a>
        ))}
      </nav>

      {GROUP_ORDER.map((k: GroupKey) => {
        const items = matched.groups[k];
        const info = GROUP_INFO[k];
        // Only the idea-specific groups can be legitimately empty. When a search
        // found nothing for one, say so rather than letting the group vanish.
        if (items.length === 0 && (browsing || k === 'general')) return null;
        return (
          <section key={k} id={`grp-${k}`} className={styles.group} aria-labelledby={`h-${k}`}>
            <h2 id={`h-${k}`}>
              {info.title} <small>{info.caption}</small>
            </h2>
            <p className={styles.groupNote}>{info.note}</p>
            {items.length === 0 ? (
              <p className={styles.none}>
                {matched.hasSector
                  ? 'Nothing in the directory for this idea in this group.'
                  : 'Nothing specific recognised for this group. The general rules below still apply.'}
              </p>
            ) : (
              items.map(m => <RuleRow key={m.rule.id} match={m} browsing={browsing} />)
            )}
          </section>
        );
      })}

      {matched.demoted.length > 0 && (
        <details className={styles.demoted}>
          <summary>
            {matched.demoted.length} more matched your keywords, but the AI thinks they probably
            don&apos;t apply
          </summary>
          {matched.demoted.map(m => (
            <RuleRow key={m.rule.id} match={m} browsing={false} />
          ))}
        </details>
      )}

      {(ai === 'pending' || ai === 'done' || ai === 'no-opinion') && (
        <p className={styles.aiNote}>
          AI help is on. Your description is sent to an open-source model host to pick and order
          the rules. The AI only chooses from this directory; every fee, deadline and source
          above comes from the directory itself.
        </p>
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
