'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, Mail } from 'lucide-react';
import { subscribeEmail } from '@/lib/firestore';
import styles from './SubscribeForm.module.css';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await subscribeEmail(email);
      setDone(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not subscribe right now.');
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <p className={styles.done} role="status">
        <CheckCircle2 size={16} aria-hidden="true" />
        You&apos;re in — the first digest lands Monday.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <Mail size={16} className={styles.icon} aria-hidden="true" />
      <div className={styles.copy}>
        <span className={styles.title}>Get this in your inbox</span>
        <span className={styles.subtitle}>Top movers and new launches, every Monday.</span>
      </div>
      <div className={styles.row}>
        <input
          type="email"
          required
          className={styles.input}
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          aria-label="Email address"
        />
        <button type="submit" className={styles.submit} disabled={saving}>
          {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
          {saving ? 'Adding…' : 'Subscribe'}
        </button>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
