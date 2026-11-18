'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import MemberAuth from '@/components/MemberAuth';
import { useMember } from '@/lib/hooks';
import { createFinderPost } from '@/lib/tools';
import { FINDER_NEEDS, type FinderNeed } from '@/lib/types';
import styles from './page.module.css';

export default function NewFinderPostPage() {
  const router = useRouter();
  const { user, isMember, loading } = useMember();
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  const [lookingFor, setLookingFor] = useState<FinderNeed[]>([]);
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(need: FinderNeed) {
    setLookingFor(cur => (cur.includes(need) ? cur.filter(n => n !== need) : [...cur, need]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await createFinderPost(
        {
          headline,
          body,
          lookingFor,
          skills: skills.split(',').map(s => s.trim()).filter(Boolean),
          location,
          contact,
        },
        user?.displayName ?? user?.email?.split('@')[0] ?? 'Founder',
      );
      router.push('/tools/finder');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that. Try again.');
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.wrap}`}>
        <Link href="/tools/finder" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Finder
        </Link>
        <h1 className={styles.title}>Post yourself on Finder</h1>
        <p className={styles.subtitle}>
          Say what you have built, what you have done before and what you are looking for. Your
          post goes live straight away.
        </p>

        {loading ? null : !isMember ? (
          <div className={styles.gate}>
            <MemberAuth reason="Sign up with email to post on Finder. Reading it is free." />
          </div>
        ) : (
          <form className={styles.form} onSubmit={submit}>
            <label className={styles.field}>
              <span>Headline</span>
              <input
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                maxLength={120}
                placeholder="Full-stack developer, 4 years, fintech"
                required
              />
            </label>

            <label className={styles.field}>
              <span>Your work and experience</span>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                maxLength={2000}
                rows={6}
                placeholder="What you have built, where you worked, what you are good at and what you want next."
                required
              />
            </label>

            <fieldset className={styles.field}>
              <legend>Looking for (choose one or more)</legend>
              <div className={styles.checks}>
                {FINDER_NEEDS.map(n => (
                  <label key={n.key} className={clsx(styles.check, lookingFor.includes(n.key) && styles.checkOn)}>
                    <input
                      type="checkbox"
                      checked={lookingFor.includes(n.key)}
                      onChange={() => toggle(n.key)}
                    />
                    {n.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className={styles.field}>
              <span>Skills</span>
              <input
                value={skills}
                onChange={e => setSkills(e.target.value)}
                placeholder="React, Node.js, product design (separate with commas)"
              />
            </label>

            <label className={styles.field}>
              <span>Location</span>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                maxLength={80}
                placeholder="Harare, remote, or open to relocate"
              />
            </label>

            <label className={styles.field}>
              <span>How people can contact you (optional)</span>
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                maxLength={120}
                placeholder="Email, WhatsApp number or website"
              />
              <small>This is shown publicly on your post.</small>
            </label>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy ? 'Posting…' : 'Post on Finder'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
