'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import MemberAuth from '@/components/MemberAuth';
import { useMember } from '@/lib/hooks';
import { submitSpace } from '@/lib/tools';
import { SPACE_TOWNS, type SpaceType } from '@/lib/types';
import styles from './page.module.css';

export default function SubmitSpacePage() {
  const router = useRouter();
  const { user, isMember, loading } = useMember();
  const [name, setName] = useState('');
  const [town, setTown] = useState<string>(SPACE_TOWNS[0]);
  const [type, setType] = useState<SpaceType>('coworking');
  const [address, setAddress] = useState('');
  const [offers, setOffers] = useState('');
  const [price, setPrice] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await submitSpace(
        {
          name,
          town,
          type,
          address,
          offers: offers.split(',').map(s => s.trim()).filter(Boolean),
          price,
          contact,
        },
        user?.displayName ?? user?.email?.split('@')[0] ?? 'Founder',
      );
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send that. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/tools/spaces" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Spaces
        </Link>
        <h1 className={styles.title}>Add a space</h1>
        <p className={styles.subtitle}>
          Know a co-working space or internet café? Send its details. An admin checks each one
          before it appears on Spaces.
        </p>

        {loading ? null : !isMember ? (
          <div className={styles.gate}>
            <MemberAuth reason="Sign up with email to add a space. Reading Spaces is free." />
          </div>
        ) : done ? (
          <div className={styles.done}>
            <p>Thanks. Your space is waiting for admin approval.</p>
            <button type="button" className={styles.submit} onClick={() => router.push('/tools/spaces')}>
              Back to Spaces
            </button>
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Name</span>
              <input value={name} onChange={e => setName(e.target.value)} maxLength={100} required />
            </label>

            <label className={styles.field}>
              <span>Town</span>
              <select value={town} onChange={e => setTown(e.target.value)}>
                {SPACE_TOWNS.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <small>More towns are added as spaces are submitted.</small>
            </label>

            <fieldset className={styles.field}>
              <legend>Type</legend>
              <div className={styles.checks}>
                {(['coworking', 'cafe'] as SpaceType[]).map(t => (
                  <label key={t} className={clsx(styles.check, type === t && styles.checkOn)}>
                    <input type="radio" name="type" checked={type === t} onChange={() => setType(t)} />
                    {t === 'coworking' ? 'Co-working space' : 'Internet café'}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}>
              <span>Street address</span>
              <input value={address} onChange={e => setAddress(e.target.value)} maxLength={160} />
            </label>

            <label className={styles.field}>
              <span>What it offers</span>
              <input
                value={offers}
                onChange={e => setOffers(e.target.value)}
                placeholder="Hot desks, meeting rooms, fibre internet (separate with commas)"
              />
            </label>

            <label className={styles.field}>
              <span>Prices (optional)</span>
              <input
                value={price}
                onChange={e => setPrice(e.target.value)}
                maxLength={200}
                placeholder="Hot desk $10 a day, in USD, as of the date you checked"
              />
            </label>

            <label className={styles.field}>
              <span>Contact (optional)</span>
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                maxLength={120}
                placeholder="Phone, email or website"
              />
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy ? 'Sending…' : 'Send for approval'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
