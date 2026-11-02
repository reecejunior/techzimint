'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { CheckCircle2, Loader2, MessageCircleQuestion } from 'lucide-react';
import { createCommunityPost } from '@/lib/firestore';
import { useMember } from '@/lib/hooks';
import MemberAuth from './MemberAuth';
import styles from './AskQuestion.module.css';

const MAX = 1500;

/**
 * "Ask a question" from the rules directory. The question is a normal post in
 * the community under its own Regulations category, so other founders can
 * answer it, and the same post is listed in the admin panel so the team sees
 * it. Posting needs an email account, like the checklist.
 */
export default function AskQuestion({
  ruleId, ruleTitle, regCode, idea, label = 'Ask a question',
}: {
  ruleId?: string;
  ruleTitle?: string;
  regCode?: string;
  idea?: string | null;
  label?: string;
}) {
  const { isMember } = useMember();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [name, setName] = useState('');
  const [withIdea, setWithIdea] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [postId, setPostId] = useState<string | null>(null);
  const qId = useId();
  const nameId = useId();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const text = question.trim();
    if (text.length < 10) {
      setError('Write your question in a sentence or two.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const context: string[] = [];
      if (ruleTitle) context.push(`About the rule: ${ruleTitle}${regCode ? ` (${regCode})` : ''}`);
      if (withIdea && idea) context.push(`My idea: ${idea}`);
      const firstLine = text.split(/\n/)[0].replace(/\s+/g, ' ');
      const title = (ruleTitle ? `${ruleTitle}: ` : '') + firstLine;
      const id = await createCommunityPost(
        {
          kind: 'question',
          title: title.length > 140 ? `${title.slice(0, 137)}...` : title,
          body: [text, ...(context.length ? ['', ...context] : [])].join('\n'),
          tags: ['regulations', ...(regCode ? [regCode.toLowerCase()] : [])],
          category: 'regulations',
          ruleId,
        },
        name,
      );
      setPostId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post that. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  }

  if (postId) {
    return (
      <p className={styles.thanks} role="status">
        <CheckCircle2 size={16} aria-hidden="true" /> Posted to the community. The Techzim team has
        it too. <Link href={`/community/${postId}`}>See your question</Link>
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={styles.open} onClick={() => setOpen(true)}>
        <MessageCircleQuestion size={15} aria-hidden="true" /> {label}
      </button>
    );
  }

  if (!isMember) {
    return (
      <div className={styles.wrap}>
        <MemberAuth reason="Create a free account to ask a question. It is posted in the community, where other founders can answer it." />
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label className={styles.label} htmlFor={qId}>
        Your question{ruleTitle ? <> about <em>{ruleTitle}</em></> : null}
      </label>
      <textarea
        id={qId}
        className={styles.field}
        rows={4}
        maxLength={MAX}
        value={question}
        onChange={e => setQuestion(e.target.value)}
        placeholder="For example: does this apply if we only serve customers outside Zimbabwe?"
      />
      <label className={styles.label} htmlFor={nameId}>
        Name shown <span className={styles.opt}>(optional)</span>
      </label>
      <input
        id={nameId}
        className={styles.input}
        value={name}
        onChange={e => setName(e.target.value)}
        maxLength={40}
        placeholder="Anonymous"
        autoComplete="nickname"
      />
      {idea && (
        <label className={styles.check}>
          <input type="checkbox" checked={withIdea} onChange={e => setWithIdea(e.target.checked)} />
          Include my idea in the post
        </label>
      )}
      <p className={styles.fine}>
        This is posted publicly in the community under Regulations. Do not include personal or
        confidential details. Not legal advice.
      </p>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.actions}>
        <button type="submit" className={styles.send} disabled={busy}>
          {busy && <Loader2 size={15} className={styles.spin} aria-hidden="true" />}
          Post question
        </button>
        <button type="button" className={styles.cancel} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  );
}
