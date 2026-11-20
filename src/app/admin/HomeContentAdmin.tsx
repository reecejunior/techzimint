'use client';

import { useState } from 'react';
import { ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { ErrorState } from '@/components/ui/DataState';
import {
  EVENT_TYPES, HOME_KINDS, HOME_VISIBLE_KINDS, OPPORTUNITY_TYPES, SCENE_GROUPS, STAGES,
  type HomeItem, type HomeKind,
} from '@/lib/homeContent';
import { deleteHomeItem, emptyDraft, saveHomeItem, useHomeItems, type HomeItemDraft } from '@/lib/homeData';
import styles from './homeAdmin.module.css';

type FieldName = Exclude<keyof HomeItemDraft, 'kind'>;

interface Field {
  name: FieldName;
  label: string;
  input: 'text' | 'url' | 'textarea' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  wide?: boolean;
}

const STAGE_OPTIONS = [{ value: '', label: 'None' }, ...STAGES.map(s => ({ value: s.key, label: s.label }))];
const opts = (list: string[]) => list.map(v => ({ value: v, label: v }));

const FIELDS: Record<HomeKind, Field[]> = {
  video: [
    { name: 'title', label: 'Title', input: 'text', required: true, wide: true },
    { name: 'url', label: 'Video link', input: 'url', required: true, wide: true, placeholder: 'https://www.youtube.com/watch?v=…', hint: 'YouTube links play on the page. Other links open in a new tab.' },
    { name: 'source', label: 'Published by', input: 'text', placeholder: 'Techzim' },
    { name: 'topic', label: 'Topic', input: 'text', placeholder: 'Payments' },
    { name: 'duration', label: 'Length', input: 'text', placeholder: '12:30' },
    { name: 'stage', label: 'Show under "Start here"', input: 'select', options: STAGE_OPTIONS },
    { name: 'summary', label: 'Written summary', input: 'textarea', wide: true, hint: 'A few sentences for people who can’t stream. Optional.' },
  ],
  opportunity: [
    { name: 'title', label: 'Name', input: 'text', required: true, wide: true },
    { name: 'type', label: 'Type', input: 'select', options: opts(OPPORTUNITY_TYPES), required: true },
    { name: 'date', label: 'Closing date', input: 'date', required: true, hint: 'It drops off the page after this date.' },
    { name: 'organiser', label: 'Run by', input: 'text', required: true },
    { name: 'value', label: 'What it’s worth', input: 'text', placeholder: 'Up to US$10,000' },
    { name: 'forWho', label: 'Who can apply', input: 'text', wide: true, placeholder: 'Founders aged 18 to 35' },
    { name: 'url', label: 'Application link', input: 'url', wide: true },
  ],
  guide: [
    { name: 'title', label: 'Title', input: 'text', required: true, wide: true },
    { name: 'url', label: 'Link to the guide', input: 'url', required: true, wide: true, placeholder: 'https://techzim.co.zw/…' },
    { name: 'topic', label: 'Topic', input: 'text', placeholder: 'Payments' },
    { name: 'minutes', label: 'Reading time (minutes)', input: 'number' },
    { name: 'stage', label: 'Show under "Start here"', input: 'select', options: STAGE_OPTIONS },
    { name: 'date', label: 'Published', input: 'date', hint: 'Shown as the year, so readers can tell an old guide.' },
  ],
  story: [
    { name: 'title', label: 'Headline', input: 'text', required: true, wide: true },
    { name: 'url', label: 'Link to the story', input: 'url', wide: true },
    { name: 'founder', label: 'Founder', input: 'text' },
    { name: 'startup', label: 'Startup', input: 'text' },
    { name: 'storyType', label: 'Kind of story', input: 'select', options: [{ value: 'success', label: 'How they did it' }, { value: 'lesson', label: 'What went wrong' }] },
    { name: 'minutes', label: 'Reading time (minutes)', input: 'number' },
    { name: 'date', label: 'Published', input: 'date' },
    { name: 'quote', label: 'One line in their words', input: 'textarea', wide: true },
  ],
  event: [
    { name: 'title', label: 'Event name', input: 'text', required: true, wide: true },
    { name: 'date', label: 'Date', input: 'date', required: true, hint: 'It drops off the page after this date.' },
    { name: 'type', label: 'Type', input: 'select', options: opts(EVENT_TYPES) },
    { name: 'town', label: 'Town', input: 'text', placeholder: 'Harare' },
    { name: 'url', label: 'Event link', input: 'url' },
  ],
  scene: [
    { name: 'title', label: 'Name', input: 'text', required: true, wide: true },
    { name: 'group', label: 'Group', input: 'select', options: SCENE_GROUPS.map(g => ({ value: g.key, label: g.label })), required: true },
    { name: 'url', label: 'Website', input: 'url' },
    { name: 'description', label: 'What they do, in one line', input: 'text', wide: true },
  ],
};

function draftFor(kind: HomeKind): HomeItemDraft {
  const d = emptyDraft(kind);
  // Selects with no empty option start on their first choice.
  for (const f of FIELDS[kind]) {
    if (f.input === 'select' && f.options?.length && !f.options.some(o => o.value === '')) {
      (d as unknown as Record<string, unknown>)[f.name] = f.options[0].value;
    }
  }
  return d;
}

function fromItem(item: HomeItem): HomeItemDraft {
  const { id: _id, createdAt: _created, ...rest } = item;
  void _id;
  void _created;
  return rest;
}

function itemMeta(i: HomeItem): string {
  switch (i.kind) {
    case 'video': return [i.source, i.topic, i.duration].filter(Boolean).join(' · ');
    case 'opportunity': return [i.type, i.organiser, i.date && `closes ${i.date}`].filter(Boolean).join(' · ');
    case 'guide': return [i.topic, i.minutes ? `${i.minutes} min` : ''].filter(Boolean).join(' · ');
    case 'story': return [i.founder, i.startup].filter(Boolean).join(', ');
    case 'event': return [i.date, i.type, i.town].filter(Boolean).join(' · ');
    case 'scene': return SCENE_GROUPS.find(g => g.key === i.group)?.label ?? '';
  }
}

export default function HomeContentAdmin() {
  const { items, loading, error } = useHomeItems();
  const [kind, setKind] = useState<HomeKind>('video');
  const [draft, setDraft] = useState<HomeItemDraft>(() => draftFor('video'));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);

  const kindInfo = HOME_KINDS.find(k => k.key === kind)!;
  const hidden = !HOME_VISIBLE_KINDS.includes(kind);
  const ofKind = items.filter(i => i.kind === kind);

  function switchKind(next: HomeKind) {
    setKind(next);
    setDraft(draftFor(next));
    setEditingId(null);
    setMessage(null);
  }

  function set(name: FieldName, value: string) {
    setDraft(d => ({ ...d, [name]: name === 'minutes' ? Number(value) || 0 : value }));
  }

  function startEdit(item: HomeItem) {
    setDraft(fromItem(item));
    setEditingId(item.id);
    setMessage(null);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setDraft(draftFor(kind));
    setEditingId(null);
    setMessage(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await saveHomeItem(draft, editingId ?? undefined);
      setMessage({
        tone: 'ok',
        text: hidden
          ? 'Saved. It will show when this section is back on the home page.'
          : editingId ? 'Saved. The home page shows the change now.' : 'Posted. It’s on the home page now.',
      });
      setDraft(draftFor(kind));
      setEditingId(null);
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not save that.' });
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: HomeItem) {
    if (!window.confirm(`Delete "${item.title}" from the home page?`)) return;
    try {
      await deleteHomeItem(item.id);
      if (editingId === item.id) cancelEdit();
    } catch (err) {
      setMessage({ tone: 'error', text: err instanceof Error ? err.message : 'Could not delete that.' });
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist" aria-label="What to post">
        {HOME_KINDS.map(k => {
          const count = items.filter(i => i.kind === k.key).length;
          return (
            <button
              key={k.key}
              type="button"
              role="tab"
              aria-selected={kind === k.key}
              className={clsx(styles.tab, kind === k.key && styles.tabOn)}
              onClick={() => switchKind(k.key)}
            >
              {k.label}
              <span className={styles.tabCount}>{HOME_VISIBLE_KINDS.includes(k.key) ? count : 'hidden'}</span>
            </button>
          );
        })}
      </div>

      {hidden && (
        <p className={styles.hiddenNote}>
          {kindInfo.label} aren’t on the home page right now. You can still post them here; they’ll
          show once the section is switched back on.
        </p>
      )}

      <div className={styles.grid}>
        <form className={styles.form} onSubmit={submit}>
          <div className={styles.formHead}>
            <h3 className={styles.formTitle}>
              {editingId ? `Edit ${kindInfo.singular}` : `New ${kindInfo.singular}`}
            </h3>
            {editingId && (
              <button type="button" className={styles.linkBtn} onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>

          <div className={styles.fields}>
            {FIELDS[kind].map(f => {
              const id = `home-${kind}-${f.name}`;
              const value = String((draft as unknown as Record<string, unknown>)[f.name] ?? '');
              return (
                <div key={f.name} className={clsx(styles.field, f.wide && styles.fieldWide)}>
                  <label htmlFor={id} className={styles.label}>
                    {f.label}
                    {f.required && <span className={styles.req}> *</span>}
                  </label>
                  {f.input === 'textarea' ? (
                    <textarea id={id} className={styles.input} rows={4} value={value} required={f.required}
                      onChange={e => set(f.name, e.target.value)} placeholder={f.placeholder} />
                  ) : f.input === 'select' ? (
                    <select id={id} className={styles.input} value={value} required={f.required}
                      onChange={e => set(f.name, e.target.value)}>
                      {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      id={id}
                      className={styles.input}
                      type={f.input}
                      min={f.input === 'number' ? 0 : undefined}
                      value={f.input === 'number' && value === '0' ? '' : value}
                      required={f.required}
                      placeholder={f.placeholder}
                      onChange={e => set(f.name, e.target.value)}
                    />
                  )}
                  {f.hint && <p className={styles.hint}>{f.hint}</p>}
                </div>
              );
            })}
          </div>

          {message && (
            <p className={clsx(styles.message, message.tone === 'error' && styles.messageError)} role="status">
              {message.text}
            </p>
          )}

          <button type="submit" className={styles.submit} disabled={busy}>
            {busy ? <Loader2 size={15} className={styles.spin} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
            {editingId ? 'Save changes' : `Post ${kindInfo.singular}`}
          </button>
        </form>

        <div className={styles.listCol}>
          <h3 className={styles.listTitle}>
            On the home page <span className={styles.tabCount}>{ofKind.length}</span>
          </h3>
          {error ? (
            <ErrorState message={error} />
          ) : loading ? (
            <div className={`skel ${styles.skel}`} />
          ) : ofKind.length === 0 ? (
            <p className={styles.empty}>
              Nothing posted yet. Until you post the first {kindInfo.singular}, the home page shows the
              starter {kindInfo.label.toLowerCase()} we picked from Techzim and other sources. Posting
              one replaces that list.
            </p>
          ) : (
            <ul className={styles.items}>
              {ofKind.map(i => (
                <li key={i.id} className={clsx(styles.item, editingId === i.id && styles.itemEditing)}>
                  <div className={styles.itemText}>
                    <span className={styles.itemTitle}>{i.title}</span>
                    <span className={styles.itemMeta}>{itemMeta(i)}</span>
                  </div>
                  <div className={styles.itemActions}>
                    {i.url && (
                      <a href={i.url} target="_blank" rel="noopener noreferrer" className={styles.iconBtn} aria-label={`Open ${i.title}`}>
                        <ExternalLink size={15} />
                      </a>
                    )}
                    <button type="button" className={styles.iconBtn} onClick={() => startEdit(i)} aria-label={`Edit ${i.title}`}>
                      <Pencil size={15} />
                    </button>
                    <button type="button" className={clsx(styles.iconBtn, styles.danger)} onClick={() => void remove(i)} aria-label={`Delete ${i.title}`}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
