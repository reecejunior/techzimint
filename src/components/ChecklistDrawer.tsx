'use client';

import { useEffect, useRef, useState } from 'react';
import { ListChecks, LogOut, Trash2, X } from 'lucide-react';
import { signOutMember } from '@/lib/account';
import { deleteSavedChecklist } from '@/lib/firestore';
import { useMember, useSavedChecklists } from '@/lib/hooks';
import type { Matched } from '@/lib/regulations';
import type { SavedChecklist } from '@/lib/types';
import RegulationsChecklist, { type Restore } from './RegulationsChecklist';
import styles from './ChecklistDrawer.module.css';

/** Open a rule's row on the page and bring it into view. */
function showRule(id: string) {
  const el = document.getElementById(`rule-${id}`);
  if (!el) return;
  if (el instanceof HTMLDetailsElement) el.open = true;
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
}

/**
 * The checklist lives in a side drawer, opened from a small button that only
 * appears once there are results. Nothing pops up on its own, and reading the
 * regulations never needs an account.
 */
export default function ChecklistDrawer({
  open, onOpenChange, matched, idea, restore, onOpenSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** null before any search: the drawer then shows saved checklists only. */
  matched: Matched | null;
  idea: string | null;
  restore: Restore | null;
  onOpenSaved: (item: SavedChecklist) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { user, isMember } = useMember();
  const { data: saved } = useSavedChecklists(isMember ? user?.uid ?? null : null);
  const [failed, setFailed] = useState('');

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [open]);

  const count = matched
    ? Object.values(matched.groups).reduce((n, g) => n + g.length, 0)
    : 0;

  async function remove(id: string) {
    setFailed('');
    try {
      await deleteSavedChecklist(id);
    } catch {
      setFailed('Could not delete that. Try again.');
    }
  }

  return (
    <>
      {matched && !open && (
        <button type="button" className={styles.fab} onClick={() => onOpenChange(true)}>
          <ListChecks size={18} aria-hidden="true" />
          Make a checklist
          <span className={styles.count}>{count}</span>
        </button>
      )}

      <dialog
        ref={ref}
        className={styles.sheet}
        aria-labelledby="drawer-h"
        onClose={() => onOpenChange(false)}
        onClick={e => { if (e.target === e.currentTarget) onOpenChange(false); }}
      >
        <div className={styles.inner}>
          <header className={styles.head}>
            <div>
              <h2 id="drawer-h">{matched ? 'Your launch checklist' : 'Saved checklists'}</h2>
              {matched && idea && <p className={styles.idea}>{idea}</p>}
            </div>
            <button type="button" className={styles.close} onClick={() => onOpenChange(false)} aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          {matched && (
            <RegulationsChecklist
              matched={matched}
              idea={idea}
              restore={restore}
              onLater={() => onOpenChange(false)}
              onShow={id => {
                onOpenChange(false);
                setTimeout(() => showRule(id), 50);
              }}
            />
          )}

          {isMember && user && (
            <footer className={styles.foot}>
              {saved.length > 0 && (
                <>
                  <h3>Saved</h3>
                  {failed && <p className={styles.msg} role="alert">{failed}</p>}
                  <ul className={styles.saved}>
                    {saved.map(item => (
                      <li key={item.id}>
                        <button type="button" className={styles.openSaved} onClick={() => onOpenSaved(item)}>
                          <span>{item.idea || 'All regulations'}</span>
                          <span className={styles.prog}>{item.done}/{item.total}</span>
                        </button>
                        <button
                          type="button"
                          className={styles.del}
                          aria-label={`Delete saved checklist: ${item.idea}`}
                          onClick={() => remove(item.id)}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {!matched && saved.length === 0 && (
                <p className={styles.msg}>Nothing saved yet. Search your idea, then save its checklist.</p>
              )}
              <p className={styles.who}>
                {user.email}
                <button type="button" onClick={() => signOutMember().catch(() => {})}>
                  <LogOut size={13} aria-hidden="true" /> Sign out
                </button>
              </p>
            </footer>
          )}
        </div>
      </dialog>
    </>
  );
}
