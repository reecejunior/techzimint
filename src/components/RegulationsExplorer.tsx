'use client';

import Link from 'next/link';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import clsx from 'clsx';
import type { SavedChecklist } from '@/lib/types';
import {
  GROUP_ORDER, countShown, matchIdea,
  type AiPlan, type GroupKey,
} from '@/lib/regulations';
import { FAILURE_TEXT, MAX_IDEA_LENGTH, isAiFailure, type AiFailure } from '@/lib/regulationsAi';
import { CHECKED, GROUP_INFO, RULES } from '@/lib/regulationsData';
import { useMember, useSavedChecklists } from '@/lib/hooks';
import ChecklistDrawer from './ChecklistDrawer';
import { type Restore } from './RegulationsChecklist';
import RuleRow from './RuleRow';
import styles from './RegulationsExplorer.module.css';

/** The AI step's state for the current search. */
type AiState =
  | 'idle'        // nothing searched yet
  | 'pending'     // keyword results are showing, the model is still reading
  | 'done'        // the model's plan has been applied
  | 'no-opinion'  // the model answered with nothing usable
  | 'unavailable' // the model host could not be reached
  | 'disabled';   // no model is configured for this site

function aiStatusText(ai: AiState, failure: AiFailure): string {
  switch (ai) {
    case 'pending': return 'Checking with AI…';
    case 'done': return 'Checked with AI';
    case 'no-opinion': return 'Keyword matches';
    case 'unavailable': return `Keyword matches (${FAILURE_TEXT[failure]})`;
    case 'disabled': return 'Keyword matches';
    default: return '';
  }
}

/**
 * The regulations search: one box, then only the regulations that apply to the
 * idea. The full directory lives on /regulations/all. The checklist is opt-in,
 * in a drawer behind a small button.
 */
export default function RegulationsExplorer() {
  const [draft, setDraft] = useState('');
  /** The idea the results on screen belong to. null = nothing searched yet. */
  const [query, setQuery] = useState<string | null>(null);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [ai, setAi] = useState<AiState>('idle');
  const [failure, setFailure] = useState<AiFailure>('other');
  const inputId = useId();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  /** Bumped per search so a slow reply for an old idea cannot overwrite a newer one. */
  const requestId = useRef(0);
  const [searchCount, setSearchCount] = useState(0);
  /** Ticks from a saved checklist the member just opened. */
  const [restore, setRestore] = useState<Restore | null>(null);
  const [drawer, setDrawer] = useState(false);
  const { user, isMember } = useMember();
  const { data: saved } = useSavedChecklists(isMember ? user?.uid ?? null : null);

  const matched = useMemo(() => (query === null ? null : matchIdea(query, plan)), [query, plan]);
  const shown = matched ? countShown(matched) : 0;
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
    inputRef.current?.focus();
  }

  // The box grows with what is typed, up to four lines, then scrolls.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  }, [draft]);

  // Bring the results into view after a search.
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
        role="search"
        onSubmit={e => {
          e.preventDefault();
          search(draft);
        }}
      >
        <label htmlFor={inputId} className={styles.label}>
          What are you building?
        </label>
        <div className={styles.field}>
          <Search size={20} className={styles.fieldIcon} aria-hidden="true" />
          <textarea
            id={inputId}
            ref={inputRef}
            className={styles.input}
            rows={1}
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
            placeholder="e.g. a mobile wallet with SMS receipts"
            spellCheck={false}
          />
          {draft && (
            <button type="button" className={styles.clear} onClick={clear} aria-label="Clear">
              <X size={16} aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            className={styles.search}
            disabled={pending || !draft.trim()}
            aria-label={pending ? 'Searching' : 'Search'}
          >
            {pending ? (
              <Loader2 size={16} className={styles.spin} aria-hidden="true" />
            ) : (
              <ArrowRight size={16} aria-hidden="true" />
            )}
            <span className={styles.searchText}>{pending ? 'Searching…' : 'Search'}</span>
          </button>
        </div>
        <p className={styles.links}>
          <Link href="/regulations/all">Browse all {RULES.length} regulations</Link>
          {isMember && saved.length > 0 && (
            <button type="button" onClick={() => setDrawer(true)}>
              Saved checklists ({saved.length})
            </button>
          )}
        </p>
        {stale && draft.trim() && query !== null && (
          <p className={styles.stale}>You changed your idea. Press Search to update the results.</p>
        )}
      </form>

      {matched && (
        <>
          <div className={styles.bar} ref={barRef} tabIndex={-1} role="status" aria-live="polite">
            <h2 className={styles.barTitle}>
              {shown} {shown === 1 ? 'regulation applies' : 'regulations apply'} to your idea
            </h2>
            <p className={styles.barSub}>
              {pending && <Loader2 size={13} className={styles.spin} aria-hidden="true" />}
              {aiStatusText(ai, failure)}
            </p>
          </div>

          {matched.clarify && (
            <p className={styles.hint}>
              <strong>To narrow this down:</strong> {matched.clarify} Add it to your idea and
              search again.
            </p>
          )}

          {!matched.hasSector && (
            <p className={styles.hint}>
              We didn&apos;t recognise a specific sector, so these are the regulations every
              business faces. Try words like wallet, ISP, SMS, delivery, drone or insurance.
            </p>
          )}

          <div className={styles.groups}>
            {GROUP_ORDER.map((k: GroupKey) => {
              const items = matched.groups[k];
              if (items.length === 0) return null;
              const info = GROUP_INFO[k];
              return (
                <section key={k} className={styles.group} aria-labelledby={`h-${k}`}>
                  <header className={styles.groupHead}>
                    <h3 id={`h-${k}`}>{info.title}</h3>
                    <p>{info.note}</p>
                  </header>
                  <div className={styles.list}>
                    {items.map(m => <RuleRow key={m.rule.id} match={m} />)}
                  </div>
                </section>
              );
            })}

            {matched.demoted.length > 0 && (
              <details className={styles.demoted}>
                <summary>
                  {matched.demoted.length} more matched your words but probably don&apos;t apply
                </summary>
                <div className={styles.list}>
                  {matched.demoted.map(m => <RuleRow key={m.rule.id} match={m} />)}
                </div>
              </details>
            )}
          </div>

          <footer className={styles.fine}>
            <p>
              <span className={styles.verifyDot}>Verify</span> means a figure or rule is unclear,
              dated or only partly confirmed: treat it as a lead.
            </p>
            {(ai === 'pending' || ai === 'done' || ai === 'no-opinion') && (
              <p>
                Your description is sent to an open-source AI model to pick and order the
                regulations. Every fee, deadline and source comes from the directory itself.
              </p>
            )}
            <p>
              Checked {CHECKED}. A research directory, not legal advice: confirm with the
              regulator or a Zimbabwean lawyer before you act.{' '}
              <Link href="/regulations/all#gaps">What we don&apos;t cover yet</Link>
            </p>
          </footer>
        </>
      )}

      <ChecklistDrawer
        open={drawer}
        onOpenChange={setDrawer}
        matched={matched}
        idea={query}
        restore={restore}
        onOpenSaved={item => {
          openSaved(item);
        }}
      />
    </div>
  );
}
