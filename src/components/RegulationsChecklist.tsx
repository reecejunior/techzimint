'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, BookmarkCheck, Check, Copy, Printer } from 'lucide-react';
import clsx from 'clsx';
import { checklistOf, checklistText, ideaKey, type Match, type Matched } from '@/lib/regulations';
import { CHECKED, REGULATORS } from '@/lib/regulationsData';
import { saveChecklist } from '@/lib/firestore';
import { useMember, useSavedChecklists } from '@/lib/hooks';
import AskQuestion from './AskQuestion';
import MemberAuth from './MemberAuth';
import RuleSteps from './RuleSteps';
import styles from './RegulationsChecklist.module.css';

const STORE_KEY = 'techzim-regs-ticked';

/** Ticks restored from a saved checklist. `n` changes on every restore. */
export interface Restore { n: number; ticked: string[] }

type View = 'checklist' | 'steps';

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

function Item({
  match, done, onToggle, steps, onShow,
}: {
  match: Match;
  done: boolean;
  onToggle: (id: string) => void;
  steps: boolean;
  onShow: (id: string) => void;
}) {
  const { rule } = match;
  return (
    <li className={styles.item} data-done={done || undefined}>
      <div className={styles.itemRow}>
        <label className={styles.check}>
          <input type="checkbox" checked={done} onChange={() => onToggle(rule.id)} />
          <span className={styles.title}>{rule.title}</span>
        </label>
        <span className={styles.meta}>
          <span className={styles.reg}>{REGULATORS[rule.reg].code}</span>
          {rule.status === 'verify' && <span className={styles.verify}>Verify</span>}
          <button type="button" className={styles.more} onClick={() => onShow(rule.id)}>
            Details
          </button>
        </span>
      </div>
      {steps && (
        <div className={styles.steps}>
          <RuleSteps rule={rule} heading="Steps" sources={false} />
        </div>
      )}
    </li>
  );
}

/**
 * The search result as a to-do list, inside the checklist drawer. Visitors get
 * a short, optional invitation to sign up; members can tick, save, copy and
 * print, and switch to the steps for each item.
 */
export default function RegulationsChecklist({
  matched, idea, restore, onShow, onLater,
}: {
  matched: Matched;
  idea: string | null;
  restore: Restore | null;
  /** Open a rule's row on the page (the drawer closes first). */
  onShow: (id: string) => void;
  /** "Maybe later" for visitors: closes the drawer. */
  onLater: () => void;
}) {
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
  const count = list.before.length + list.later.length;
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

  if (!isMember) {
    return (
      <div className={styles.invite}>
        <p className={styles.inviteLead}>
          Turn these {count} regulations into a checklist you can tick off, see the steps for
          each one, and come back to later.
        </p>
        <MemberAuth reason="Free, with just your email. You can still read every regulation without an account." />
        <button type="button" className={styles.later} onClick={onLater}>
          Maybe later
        </button>
      </div>
    );
  }

  const pct = total === 0 ? 100 : Math.round((done / total) * 100);

  return (
    <section className={clsx(styles.box, 'regs-print-area')} aria-label="Launch checklist">
      <p className={styles.printOnly}>
        <strong>Launch checklist{idea ? `: ${idea}` : ''}</strong>
        <br />
        Techzim Startups, regulations checked {CHECKED}. Not legal advice: confirm with the
        regulator or a Zimbabwean lawyer.
      </p>

      <div className={styles.progress}>
        <p>
          {total === 0
            ? 'Nothing specific is needed before you launch.'
            : <><strong>{done} of {total}</strong> sorted before launch</>}
        </p>
        <div className={styles.meter} aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

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

      {total > 0 && (
        <>
          <h3 className={styles.sub}>Before you launch</h3>
          <ul className={styles.list}>
            {list.before.map(m => (
              <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} steps={view === 'steps'} onShow={onShow} />
            ))}
          </ul>
        </>
      )}
      {list.later.length > 0 && (
        <>
          <h3 className={styles.sub}>After you launch</h3>
          <ul className={styles.list}>
            {list.later.map(m => (
              <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} steps={view === 'steps'} onShow={onShow} />
            ))}
          </ul>
        </>
      )}

      {saveError && <p className={styles.saveError} role="alert">{saveError}</p>}
      <div className={styles.actions}>
        <button type="button" onClick={save} disabled={saving} data-saved={isSaved || undefined}>
          {isSaved ? <BookmarkCheck size={15} aria-hidden="true" /> : <Bookmark size={15} aria-hidden="true" />}
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button type="button" onClick={copy}>
          {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button type="button" onClick={() => window.print()}>
          <Printer size={15} aria-hidden="true" /> Print
        </button>
      </div>

      <div className={styles.ask}>
        <AskQuestion idea={idea} label="Ask the community about this checklist" />
      </div>
    </section>
  );
}
