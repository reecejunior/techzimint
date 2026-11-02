'use client';

import { useId, useState } from 'react';
import { CheckCircle2, Flag, Loader2 } from 'lucide-react';
import styles from './RuleReport.module.css';

type State = 'idle' | 'sending' | 'sent' | 'error';

const MIN = 10;
const MAX = 800;

/**
 * "Report an error" on one rule. Opens a short form instead of a mailto link so
 * reports land in the admin inbox with the rule attached, and so a reader
 * without a mail app can still send one. `website` is a honeypot for bots.
 */
export default function RuleReport({ ruleId, ruleTitle }: { ruleId: string; ruleTitle: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const msgId = useId();
  const contactId = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/regulations/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ruleId, message, contact, website }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        let text = 'Could not send that right now. Please try again later.';
        try {
          const body = (await res.json()) as { error?: unknown };
          if (typeof body.error === 'string') text = body.error;
        } catch { /* keep the default */ }
        setError(text);
        setState('error');
        return;
      }
      setState('sent');
    } catch {
      setError('Could not send that right now. Please try again later.');
      setState('error');
    }
  }

  if (state === 'sent') {
    return (
      <p className={styles.thanks} role="status">
        <CheckCircle2 size={16} aria-hidden="true" /> Thank you. We&apos;ll check this rule against
        the source.
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.open} onClick={() => setOpen(true)}>
        <Flag size={14} aria-hidden="true" /> Report an error
      </button>
    );
  }

  const tooShort = message.trim().length < MIN;

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor={msgId} className={styles.label}>
        What is wrong or out of date in &ldquo;{ruleTitle}&rdquo;?
      </label>
      <textarea
        id={msgId}
        className={styles.input}
        rows={3}
        maxLength={MAX}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="e.g. The fee is now US$400. See the regulator's notice dated…"
        required
      />
      <label htmlFor={contactId} className={styles.label}>
        Your email or phone <span className={styles.opt}>(optional, only if we may ask you)</span>
      </label>
      <input
        id={contactId}
        className={styles.field}
        type="text"
        maxLength={120}
        value={contact}
        onChange={e => setContact(e.target.value)}
        autoComplete="email"
      />
      <input
        className={styles.trap}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={website}
        onChange={e => setWebsite(e.target.value)}
      />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.send} disabled={state === 'sending' || tooShort}>
          {state === 'sending' && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
          {state === 'sending' ? 'Sending…' : 'Send report'}
        </button>
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
