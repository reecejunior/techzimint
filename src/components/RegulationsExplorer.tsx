'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ExternalLink, Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import type { SavedChecklist } from '@/lib/types';
import {
  GROUP_ORDER, browseAll, countShown, matchIdea,
  type AiPlan, type GroupKey, type Match, type RuleStatus,
} from '@/lib/regulations';
import { FAILURE_TEXT, MAX_IDEA_LENGTH, isAiFailure, type AiFailure } from '@/lib/regulationsAi';
import {
  CHECKED, GAPS, GROUP_INFO, PHASE_LABEL, REGULATORS, RULES, SECTORS,
} from '@/lib/regulationsData';
import AskQuestion from './AskQuestion';
import RegulationsChecklist, { type Restore } from './RegulationsChecklist';
import RuleReport from './RuleReport';
import RuleSteps from './RuleSteps';
import SavedChecklists from './SavedChecklists';
import styles from './RegulationsExplorer.module.css';

const EXAMPLES = [
  'Mobile wallet with SMS receipts',
  'Rural Wi-Fi internet provider',
  'Ride-hailing app',
  'Online store with delivery',
  'Solar installation business',
  'Telemedicine clinic booking',
];

const STATUS_LABEL: Record<RuleStatus, string> = {
  official: 'Official',
  reported: 'Reported',
  verify: 'Verify',
};

const STATUS_HELP: Record<RuleStatus, string> = {
  official: 'Read in the law itself or on the regulator\u2019s own page.',
  reported: 'From news or a law-firm summary. Likely right, worth a second look.',
  verify: 'Unclear, dated or only partly confirmed. A lead, not a fact.',
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

function RuleRow({ match, browsing, group }: { match: Match; browsing: boolean; group: GroupKey }) {
  const { rule, hits, ai } = match;
  const reg = REGULATORS[rule.reg];
  const addedByAi = ai && hits.length === 0 && rule.scope === 'specific';
  const showTags = !browsing && (hits.length > 0 || addedByAi);
  return (
    <details className={styles.row} id={`rule-${rule.id}`}>
      <summary className={styles.rowHead}>
        <span className={styles.reg} data-potraz={rule.reg === 'POTRAZ' || undefined}>
          <strong>{reg.code}</strong>
          <span>{reg.name}</span>
        </span>
        <span className={styles.rowMain}>
          <span className={styles.rowTitle}>{rule.title}</span>
          <span className={styles.rowHeadline}>{rule.headline}</span>
          {(showTags || group === 'general') && (
            <span className={styles.tags}>
              {group === 'general' && (
                <span className={styles.tag} data-kind="phase">{PHASE_LABEL[rule.phase]}</span>
              )}
              {hits.map(h => (
                <span key={h} className={styles.tag}>{SECTOR_LABEL[h]}</span>
              ))}
              {addedByAi && <span className={styles.tag}>Suggested by AI</span>}
            </span>
          )}
          {ai?.reason && (
            <span className={styles.aiWhy}>
              <span className={styles.aiBadge}>AI</span> {ai.reason}
            </span>
          )}
        </span>
        <StatusPill status={rule.status} />
        <ChevronDown className={styles.chev} size={18} aria-hidden="true" />
      </summary>
      <div className={styles.body}>
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
            <strong>Reviewed</strong> by {rule.reviewed.by}, {rule.reviewed.on}.
          </p>
        )}
        <div className={styles.sources}>
          <strong>Sources</strong>
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
        <div className={styles.rowActions}>
          <AskQuestion ruleId={rule.id} ruleTitle={rule.title} regCode={reg.code} />
          <RuleReport ruleId={rule.id} ruleTitle={rule.title} />
        </div>
      </div>
    </details>
  );
}

function aiStatusText(ai: AiState, failure: AiFailure): string {
  switch (ai) {
    case 'pending': return 'Refining with AI…';
    case 'done': return 'Refined with AI';
    case 'no-opinion': return 'Keyword matches (AI had no extra view)';
    case 'unavailable': return `Keyword matches (${FAILURE_TEXT[failure]})`;
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
  const [failure, setFailure] = useState<AiFailure>('other');
  const inputId = useId();
  const barRef = useRef<HTMLDivElement>(null);
  const listsRef = useRef<HTMLDivElement>(null);
  const setAllOpen = (open: boolean) =>
    listsRef.current?.querySelectorAll('details').forEach(d => { d.open = open; });
  /** Bumped per search so a slow reply for an old idea cannot overwrite a newer one. */
  const requestId = useRef(0);
  const [searchCount, setSearchCount] = useState(0);
  /** Ticks from a saved checklist the member just opened. */
  const [restore, setRestore] = useState<Restore | null>(null);

  const browsing = query === null;
  const matched = useMemo(
    () => (query === null ? browseAll() : matchIdea(query, plan)),
    [query, plan],
  );
  const shown = countShown(matched);
  const stale = draft.trim() !== (query ?? '');
  const pending = ai === 'pending';

  async function search(text: string, keepRestore = false) {
    if (!keepRestore) setRestore(null);
    const idea = text.trim().slice(0, MAX_IDEA_LENGTH);
    const id = ++requestId.current;

    if (!idea) {
      setQuery(null);
      setPlan(null);
      setAi('idle');
      return;
    }

    // Count what kind of idea this was (sector ids and a yes/no, never the text).
    const seen = matchIdea(idea);
    fetch('/api/regulations/stat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectors: seen.recognised, noSector: !seen.hasSector }),
      keepalive: true,
    }).catch(() => {});

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
      if (!res.ok) {
        // 429 here is our own per-IP limit; a 502 carries the model host's reason.
        let reason: AiFailure = res.status === 429 ? 'limit' : 'other';
        try {
          const body = (await res.json()) as { reason?: unknown };
          if (isAiFailure(body.reason)) reason = body.reason;
        } catch { /* no JSON body: keep the default */ }
        if (id === requestId.current) {
          setFailure(reason);
          setAi('unavailable');
        }
        return;
      }
      const data = (await res.json()) as { configured?: boolean; plan?: AiPlan | null };
      if (id !== requestId.current) return;
      if (data.configured === false) setAi('disabled');
      else if (data.plan) {
        setPlan(data.plan);
        setAi('done');
      } else setAi('no-opinion');
    } catch (e) {
      if (id === requestId.current) {
        setFailure(e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network');
        setAi('unavailable');
      }
    }
  }

  function openSaved(item: SavedChecklist) {
    setRestore({ n: Date.now(), ticked: item.ticked });
    void search(item.idea, true);
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
      <SavedChecklists onOpen={openSaved} />

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
        <div className={styles.field}>
          <textarea
            id={inputId}
            className={styles.input}
            rows={2}
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
          <button type="submit" className={styles.search} disabled={pending || !draft.trim()}>
            {pending ? (
              <Loader2 size={16} className={styles.spin} aria-hidden="true" />
            ) : (
              <Search size={16} aria-hidden="true" />
            )}
            {pending ? 'Searching…' : 'Find my rules'}
          </button>
        </div>
        <div className={styles.examples} role="group" aria-label="Example ideas">
          <span className={styles.examplesLabel}>Try:</span>
          {EXAMPLES.map(ex => (
            <button key={ex} type="button" className={styles.chip} onClick={() => search(ex)}>
              {ex}
            </button>
          ))}
          {(draft || query !== null) && (
            <button type="button" className={styles.clear} onClick={clear}>
              <X size={14} aria-hidden="true" /> Start over
            </button>
          )}
        </div>
        {stale && draft.trim() && (
          <p className={styles.stale}>
            {browsing
              ? 'Press Find my rules to search.'
              : 'You changed the idea. Press Find my rules to update the results.'}
          </p>
        )}
      </form>

      <div className={styles.bar} ref={barRef} tabIndex={-1} role="status" aria-live="polite">
        <div className={styles.barMain}>
          <h2 className={styles.barTitle}>
            {browsing ? `All ${RULES.length} rules` : <>Rules for &ldquo;{query}&rdquo;</>}
          </h2>
          <p className={styles.barSub}>
            {browsing
              ? 'Describe your idea above to narrow these down.'
              : `${shown} of ${RULES.length} rules apply or may apply.`}
          </p>
        </div>
        {!browsing && (
          <span className={styles.done} data-state={ai}>
            {pending ? (
              <Loader2 size={16} className={styles.spin} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={16} aria-hidden="true" />
            )}
            <strong>{pending ? 'Searching…' : 'Search done'}</strong>
            <span className={styles.doneSub}>{aiStatusText(ai, failure)}</span>
          </span>
        )}
      </div>

      {matched.clarify && (
        <div className={styles.clarify}>
          <p><strong>To narrow this down:</strong> {matched.clarify}</p>
          <p>Add your answer to the description and press Find my rules again.</p>
        </div>
      )}

      {!browsing && !matched.hasSector && (
        <div className={styles.empty}>
          <p><strong>We didn&apos;t recognise a specific sector.</strong> Showing the general
            rules every business faces. Try words like wallet, ISP, SMS, delivery, drone,
            insurance or marketplace.</p>
        </div>
      )}

      {!browsing && <RegulationsChecklist matched={matched} idea={query} restore={restore} />}

      <div className={styles.toolbar}>
        <nav className={styles.jump} aria-label="Jump to a group">
          {GROUP_ORDER.map(k => (
            <a
              key={k}
              href={`#grp-${k}`}
              className={styles.jumpLink}
              data-empty={matched.groups[k].length === 0 || undefined}
            >
              {GROUP_INFO[k].title}
              <span className={styles.jumpCount}>{matched.groups[k].length}</span>
            </a>
          ))}
        </nav>
        <div className={styles.expandAll}>
          <button type="button" onClick={() => setAllOpen(true)}>Expand all</button>
          <button type="button" onClick={() => setAllOpen(false)}>Collapse all</button>
        </div>
      </div>

      <div className={styles.groups} ref={listsRef}>
        {GROUP_ORDER.map((k: GroupKey) => {
          const items = matched.groups[k];
          const info = GROUP_INFO[k];
          // Only the idea-specific groups can be legitimately empty. When a search
          // found nothing for one, say so rather than letting the group vanish.
          if (items.length === 0 && (browsing || k === 'general')) return null;
          return (
            <section
              key={k}
              id={`grp-${k}`}
              className={styles.group}
              data-group={k}
              aria-labelledby={`h-${k}`}
            >
              <header className={styles.groupHead}>
                <h2 id={`h-${k}`}>{info.title}</h2>
                <span className={styles.groupCount}>
                  {items.length} {items.length === 1 ? 'rule' : 'rules'}
                </span>
              </header>
              <p className={styles.groupNote}>{info.note}</p>
              {items.length === 0 ? (
                <p className={styles.none}>
                  {matched.hasSector
                    ? 'Nothing in the directory for this idea in this group.'
                    : 'Nothing specific recognised for this group. The general rules below still apply.'}
                </p>
              ) : (
                <div className={styles.list}>
                  {items.map(m => (
                    <RuleRow key={m.rule.id} match={m} browsing={browsing} group={k} />
                  ))}
                </div>
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
            <div className={styles.list}>
              {matched.demoted.map(m => (
                <RuleRow key={m.rule.id} match={m} browsing={false} group="watch" />
              ))}
            </div>
          </details>
        )}
      </div>

      {(ai === 'pending' || ai === 'done' || ai === 'no-opinion') && (
        <p className={styles.aiNote}>
          AI help is on. Your description is sent to an open-source model host to pick and order
          the rules. The AI only chooses from this directory; every fee, deadline and source
          comes from the directory itself.
        </p>
      )}

      <section className={styles.key} aria-labelledby="key-h">
        <h2 id="key-h">How sure are we?</h2>
        <ul>
          {(['official', 'reported', 'verify'] as RuleStatus[]).map(st => (
            <li key={st}>
              <StatusPill status={st} />
              <span>{STATUS_HELP[st]}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.gaps} aria-labelledby="gaps-h">
        <h2 id="gaps-h">Not covered yet</h2>
        <ul>
          {GAPS.map(g => <li key={g}>{g}</li>)}
        </ul>
      </section>

      <p className={styles.disclaimer}>
        This is a research directory, not legal advice. Fees and rules change; confirm with the
        regulator or a Zimbabwean lawyer before you act.
      </p>
    </div>
  );
}
