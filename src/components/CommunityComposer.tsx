'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { createCommunityPost } from '@/lib/firestore';
import type { CommunityKind } from '@/lib/types';
import styles from './CommunityComposer.module.css';

const KIND_COPY: Record<CommunityKind, { label: string; titleHint: string; bodyHint: string }> = {
  question: {
    label: 'Question',
    titleHint: 'e.g. How do I verify EcoCash payments server-side?',
    bodyHint: 'What have you tried, and where exactly are you stuck?',
  },
  showcase: {
    label: 'Show & Tell',
    titleHint: 'e.g. Shipped offline-first sync for my logistics app',
    bodyHint: 'What did you build, and what would you like feedback on?',
  },
};

const MAX_TAGS = 5;

/**
 * Creates a post in the developer community — a question/help thread or a
 * show-and-tell/build-in-public post, picked with the kind toggle below.
 * Open to any signed-in visitor (the site's existing anonymous-auth session,
 * via createCommunityPost → ensureSignedIn()) — there is no check anywhere
 * in this path for an existing startup listing.
 */
export default function CommunityComposer() {
  const router = useRouter();
  const [kind, setKind] = useState<CommunityKind>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tags = [...new Set(
    tagsText
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean),
  )].slice(0, MAX_TAGS);

  const canSubmit = Boolean(title.trim() && body.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createCommunityPost({ kind, title, body, tags }, authorName);
      router.push(`/community/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that. Please try again.');
      setSaving(false);
    }
  }

  const copy = KIND_COPY[kind];

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.kindToggle} role="radiogroup" aria-label="Post type">
        {(Object.keys(KIND_COPY) as CommunityKind[]).map(k => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={kind === k}
            className={clsx(styles.kindBtn, kind === k && styles.kindBtnActive)}
            onClick={() => setKind(k)}
          >
            {KIND_COPY[k].label}
          </button>
        ))}
      </div>

      <label className={styles.label} htmlFor="cp-title">
        Title
      </label>
      <input
        id="cp-title"
        className={styles.input}
        placeholder={copy.titleHint}
        maxLength={140}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <label className={styles.label} htmlFor="cp-body">
        {kind === 'question' ? 'Details' : 'What you built'}
      </label>
      <textarea
        id="cp-body"
        className={styles.textarea}
        rows={6}
        maxLength={4000}
        placeholder={copy.bodyHint}
        value={body}
        onChange={e => setBody(e.target.value)}
      />

      <label className={styles.label} htmlFor="cp-tags">
        Tags <span className={styles.optional}>(optional, comma-separated)</span>
      </label>
      <input
        id="cp-tags"
        className={styles.input}
        placeholder="e.g. flutter, fintech, firebase"
        value={tagsText}
        onChange={e => setTagsText(e.target.value)}
      />
      {tags.length > 0 && (
        <ul className={styles.tagPreview}>
          {tags.map(t => (
            <li key={t} className={styles.tagChip}>
              #{t}
            </li>
          ))}
        </ul>
      )}

      <label className={styles.label} htmlFor="cp-name">
        Your name <span className={styles.optional}>(optional)</span>
      </label>
      <input
        id="cp-name"
        className={styles.input}
        placeholder="Anonymous"
        maxLength={60}
        value={authorName}
        onChange={e => setAuthorName(e.target.value)}
      />

      {error && (
        <p className={styles.formError} role="alert">
          {error}
        </p>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.submit} disabled={!canSubmit || saving}>
          {saving && <Loader2 size={14} className={styles.spin} aria-hidden="true" />}
          {saving ? 'Posting…' : kind === 'question' ? 'Post question' : 'Share your build'}
        </button>
      </div>
    </form>
  );
}
