'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Printer } from 'lucide-react';
import clsx from 'clsx';
import { checklistOf, checklistText, type Match, type Matched } from '@/lib/regulations';
import { CHECKED, REGULATORS } from '@/lib/regulationsData';
import styles from './RegulationsChecklist.module.css';

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
  match, done, onToggle,
}: { match: Match; done: boolean; onToggle: (id: string) => void }) {
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
    </li>
  );
}

/**
 * The result as a to-do list: tick things off, copy it as text, or print it
 * (save as PDF) to hand to a lawyer or cofounder. Ticks are remembered in this
 * browser only; the idea text never leaves the page.
 */
export default function RegulationsChecklist({
  matched, idea,
}: { matched: Matched; idea: string | null }) {
  const list = useMemo(() => checklistOf(matched), [matched]);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Read once on mount; deferred a tick like the other browser-storage reads here.
    Promise.resolve().then(() => setTicked(readTicked()));
  }, []);

  function toggle(id: string) {
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

  async function copy() {
    const text = checklistText({
      idea, list, ticked, checked: CHECKED,
      url: `${window.location.origin}/regulations`,
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
        <div className={styles.actions}>
          <button type="button" onClick={copy}>
            {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
            {copied ? 'Copied' : 'Copy as text'}
          </button>
          <button type="button" onClick={() => window.print()}>
            <Printer size={15} aria-hidden="true" /> Print or save as PDF
          </button>
        </div>
      </header>

      <p className={styles.printOnly}>
        {idea ? `Idea: ${idea}. ` : ''}Techzim Startups, rules checked {CHECKED}. Not legal advice:
        confirm with the regulator or a Zimbabwean lawyer.
      </p>

      {total > 0 && (
        <>
          <h3 className={styles.sub}>Before you launch</h3>
          <ul className={styles.list}>
            {list.before.map(m => (
              <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} />
            ))}
          </ul>
        </>
      )}
      {list.later.length > 0 && (
        <>
          <h3 className={styles.sub}>After you launch</h3>
          <ul className={styles.list}>
            {list.later.map(m => (
              <Item key={m.rule.id} match={m} done={ticked.has(m.rule.id)} onToggle={toggle} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
