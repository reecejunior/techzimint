'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Copy, Lock, Printer } from 'lucide-react';
import clsx from 'clsx';
import { checklistOf, checklistText, ideaKey, type Match, type Matched } from '@/lib/regulations';
import { CHECKED, REGULATORS } from '@/lib/regulationsData';
import { saveChecklist } from '@/lib/firestore';
import { useMember, useSavedChecklists } from '@/lib/hooks';
import AskQuestion from './AskQuestion';
import MemberAuth from './MemberAuth';
import RuleSteps from './RuleSteps';
import styles from './RegulationsChecklist.module.css';

/** Ticks restored from a saved checklist. `n` changes on every restore. */
export interface Restore { n: number; ticked: string[] }

type View = 'checklist' | 'steps';

const STORE_KEY = 'techzim-regs-ticked';

function readTicked(): Set<string> {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list.filter((x): x is string => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}

function writeTicked(ticked: Set<string>) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...ticked]));
  } catch { /* private mode or blocked storage: ticks just last for this visit */ }
}

/** Open a rule's row and scroll to it, so a checklist item leads to its detail. */
function showRule(id: string) {
  const el = document.getElementById(`rule-${id}`);
  if (!el) return;
  if (el instanceof HTMLDetailsElement) el.open = true;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
}

function Item({
  match, done, onToggle, steps,
}: { match: Match; done: boolean; onToggle: (id: string) => void; steps: boolean }) {
  const { rule } = match;
  return (
    <li className={styles.item} data-done={done || undefined}>
      <label className={styles.check}>
        <input type="checkbox" checked={done} onChange={() => onToggle(rule.id)} />
        <span className={styles.title}>{rule.title}</span>
      </label>
      <span className={styles.meta}>
        <span className={styles.reg} data-potraz={rule.reg === 'POTRAZ' || undefined}>
          {REGULATORS[rule.reg].code}
        </span>
        {rule.status === 'verify' && <span className={styles.verify}>Verify</span>}
        <a
          href={`#rule-${rule.id}`}
          className={styles.more}
          onClick={e => {
            e.preventDefault();
            showRule(rule.id);
          }}
        >
          Details
        </a>
      </span>
      {steps && (
        <div className={styles.steps}>
          <RuleSteps rule={rule} heading="Steps" sources={false} />
        </div>
      )}
    </li>
  );
}

/**
 * The result as a to-do list: tick things off, copy it as text, or print it
 * (save as PDF) to hand to a lawyer or cofounder. Ticks are remembered in this
 * browser only; the idea text never leaves the page.
 */
export default function RegulationsChecklist({
  matched, idea, restore,
}: { matched: Matched; idea: string | null; restore: Restore | null }) {
  const list = useMemo(() => checklistOf(matched), [matched]);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<View>('checklist');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const { user, isMember } = useMember();
  const { data: saved } = useSavedChecklists(isMember ? user?.uid ?? null : null);
  /** Set when the member changes a tick, so a restore never writes back. */
  const dirty = useRef(false);

  useEffect(() => {
    // Read once on mount; deferred a tick like the other browser-storage reads here.
    Promise.resolve().then(() => setTicked(readTicked()));
  }, []);

  // A saved checklist was opened: put its ticks back.
  useEffect(() => {
    if (!restore) return;
    dirty.current = false;
    Promise.resolve().then(() => setTicked(new Set(restore.ticked)));
  }, [restore]);

  function toggle(id: string) {
    dirty.current = true;
    setTicked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeTicked(next);
      return next;
    });
  }

  const total = list.before.length;
  const done = list.before.filter(m => ticked.has(m.rule.id)).length;
  const key = ideaKey(idea);
  const savedId = user ? `${user.uid}__${key}` : '';
  const isSaved = saved.some(s => s.id === savedId);
  const allIds = useMemo(
    () => [...list.before, ...list.later].map(m => m.rule.id),
    [list],
  );

  async function save() {
    if (saving) return;
    setSaving(true);
    setSaveError('');
    try {
      await saveChecklist({
        idea: idea ?? '',
        key,
        ticked: allIds.filter(id => ticked.has(id)),
        total,
        done,
      });
      dirty.current = false;
    } catch {
      setSaveError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  // Once saved, later ticks are kept up to date without another click.
  useEffect(() => {
    if (!isSaved || !dirty.current) return;
    const timer = setTimeout(() => {
      saveChecklist({
        idea: idea ?? '',
        key,
        ticked: allIds.filter(id => ticked.has(id)),
        total,
        done,
      }).then(() => { dirty.current = false; }).catch(() => setSaveError('Could not save your latest ticks.'));
    }, 700);
    return () => clearTimeout(timer);
  }, [ticked, isSaved, idea, key, allIds, total, done]);

  async function copy() {
    const text = checklistText({
      idea, list, ticked, checked: CHECKED,
      url: `${window.location.origin}/regulations`,
      steps: view === 'steps',
    });
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy your checklist:', text);
    }
  }

  return (
    <section className={clsx(styles.box, 'regs-print-area')} aria-labelledby="checklist-h">
      <header className={styles.head}>
        <div>
          <h2 id="checklist-h">Your launch checklist</h2>
          <p className={styles.progress}>
            {total === 0
              ? 'Nothing specific is needed before you launch.'
              : `${done} of ${total} things to sort out before you launch`}
          </p>
        </div>
        {isMember && (
          <div className={styles.actions}>
            <button type="button" onClick={save} disabled={saving} data-saved={isSaved || undefined}>
              {isSaved ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
              {isSaved ? 'Saved to your account' : 'Save checklist'}
            </button>
            <button type="button" onClick={copy}>
              {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {copied ? 'Copied' : 'Copy as text'}
            </button>
            <button type="button" onClick={() => window.print()}>
              <Printer size={15} aria-hidden="true" /> Print or save as PDF
            </button>
          </div>
        )}
      </header>

      {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}

      <p className={styles.printOnly}>
        {idea ? `Idea: ${idea}. ` : ''}Techzim Startups, rules checked {CHECKED}. Not legal advice:
        confirm with the regulator or a Zimbabwean lawyer.
      </p>

      {!isMember ? (
        <div className={styles.locked}>
          <p className={styles.lockNote}>
            <Lock size={15} aria-hidden="true" /> Sign up with your email to tick things off, save
            this checklist and come back to it, and see the steps for each item.
          </p>
          <MemberAuth reason="Free. Your checklist is saved to your account." />
          <ul className={styles.preview} aria-hidden="true">
            {[...list.before, ...list.later].slice(0, 4).map(m => (
              <li key={m.rule.id}>{m.rule.title}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Checklist view">
            {(['checklist', 'steps'] as const).map(v => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                data-active={view === v || undefined}
                onClick={() => setView(v)}
              >
                {v === 'checklist' ? 'Checklist' : 'Steps'}
              </button>
            ))}
          </div>
          {view === 'steps' && (
            <p className={styles.stepsNote}>
              The order to do each item in. Each set says where it came from. Fees and forms change,
              so confirm with the regulator before you pay or file.
            </p>
          )}

          {total > 0 && (
            <>
              <h3 className={styles.sub}>Before you launch</h3>
              <ul className={styles.list}>
                {list.before.map(m => (
                  <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} steps={view === 'steps'} />
                ))}
              </ul>
            </>
          )}
          {list.later.length > 0 && (
            <>
              <h3 className={styles.sub}>After you launch</h3>
              <ul className={styles.list}>
                {list.later.map(m => (
                  <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} steps={view === 'steps'} />
                ))}
              </ul>
            </>
          )}

          <div className={styles.ask}>
            <AskQuestion idea={idea} label="Ask a question about this checklist" />
          </div>
        </>
      )}
    </section>
  );
}
