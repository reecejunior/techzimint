'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
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
  poll: {
    label: 'Poll',
    titleHint: 'e.g. Which backend do you reach for first in 2026?',
    bodyHint: 'Add a little context for the options below.',
  },
};

const MAX_TAGS = 5;
const MIN_POLL_OPTIONS = 2;
const MAX_POLL_OPTIONS = 6;

/**
 * Creates a post in the developer community — a question/help thread, a
 * show-and-tell/build-in-public post, or a poll, picked with the kind
 * toggle below. Open to any signed-in visitor (the site's existing
 * anonymous-auth session, via createCommunityPost → ensureSignedIn()) —
 * there is no check anywhere in this path for an existing startup listing.
 */
export default function CommunityComposer() {
  const router = useRouter();
  const [kind, setKind] = useState<CommunityKind>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [authorName, setAuthorName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Commits whatever's typed in the tag field as a chip — on Enter/comma,
   *  or when focus leaves the field, so a tag typed and then tabbed away
   *  from isn't silently dropped. */
  function commitTagDraft() {
    const t = tagDraft.trim().toLowerCase();
    setTagDraft('');
    if (!t) return;
    setTags(prev => (prev.includes(t) || prev.length >= MAX_TAGS ? prev : [...prev, t]));
  }

  function onTagsKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitTagDraft();
    } else if (e.key === 'Backspace' && !tagDraft && tags.length > 0) {
      // Mirrors how every chip-entry field (Gmail's "To" line, etc.) treats
      // backspace on an empty field: it reaches back and removes the last
      // chip instead of doing nothing.
      setTags(prev => prev.slice(0, -1));
    }
  }

  const filledPollOptions = pollOptions.map(o => o.trim()).filter(Boolean);
  const canSubmit = Boolean(
    title.trim() && body.trim() && (kind !== 'poll' || filledPollOptions.length >= MIN_POLL_OPTIONS),
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || saving) return;
    setSaving(true);
    setError(null);
    try {
      const id = await createCommunityPost(
        {
          kind,
          title,
          body,
          tags,
          pollOptions:
            kind === 'poll' ? filledPollOptions.map((label, i) => ({ id: `o${i + 1}`, label })) : undefined,
        },
        authorName,
      );
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
        {kind === 'poll' ? 'Question' : 'Title'}
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
        {kind === 'question' ? 'Details' : kind === 'poll' ? 'Context' : 'What you built'}
      </label>
      <textarea
        id="cp-body"
        className={styles.textarea}
        rows={kind === 'poll' ? 3 : 6}
        maxLength={4000}
        placeholder={copy.bodyHint}
        value={body}
        onChange={e => setBody(e.target.value)}
      />

      {kind === 'poll' && (
        <>
          <span className={styles.label}>Options</span>
          <div className={styles.pollOptions}>
            {pollOptions.map((value, i) => (
              <div key={i} className={styles.pollOptionRow}>
                <input
                  className={styles.input}
                  placeholder={`Option ${i + 1}`}
                  maxLength={80}
                  value={value}
                  onChange={e =>
                    setPollOptions(prev => prev.map((o, j) => (j === i ? e.target.value : o)))
                  }
                  aria-label={`Poll option ${i + 1}`}
                />
                {pollOptions.length > MIN_POLL_OPTIONS && (
                  <button
                    type="button"
                    className={styles.pollOptionRemove}
                    onClick={() => setPollOptions(prev => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove option ${i + 1}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {pollOptions.length < MAX_POLL_OPTIONS && (
            <button
              type="button"
              className={styles.addOption}
              onClick={() => setPollOptions(prev => [...prev, ''])}
            >
              <Plus size={14} aria-hidden="true" />
              Add option
            </button>
          )}
        </>
      )}

      <label className={styles.label} htmlFor="cp-tags">
        Tags <span className={styles.optional}>(optional)</span>
      </label>
      <div className={styles.tagField}>
        {tags.map(t => (
          <span key={t} className={styles.tagChip}>
            #{t}
            <button
              type="button"
              className={styles.tagChipRemove}
              onClick={() => setTags(prev => prev.filter(x => x !== t))}
              aria-label={`Remove tag ${t}`}
            >
              <X size={11} aria-hidden="true" />
            </button>
          </span>
        ))}
        <input
          id="cp-tags"
          className={styles.tagInput}
          placeholder={tags.length === 0 ? 'e.g. flutter, fintech, firebase' : ''}
          value={tagDraft}
          onChange={e => setTagDraft(e.target.value)}
          onKeyDown={onTagsKeyDown}
          onBlur={commitTagDraft}
          disabled={tags.length >= MAX_TAGS}
        />
      </div>

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
          {saving
            ? 'Posting…'
            : kind === 'question'
              ? 'Post question'
              : kind === 'poll'
                ? 'Post poll'
                : 'Share your build'}
        </button>
      </div>
    </form>
  );
}
