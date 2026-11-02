'use client';

import { useState } from 'react';
import { ChevronDown, LogOut, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { signOutMember } from '@/lib/account';
import { deleteSavedChecklist } from '@/lib/firestore';
import { useMember, useSavedChecklists } from '@/lib/hooks';
import type { SavedChecklist } from '@/lib/types';
import styles from './SavedChecklists.module.css';

/**
 * Shown to signed-in members only: who they are signed in as, and their saved
 * checklists. Opening one runs that idea's search again and puts the ticks back.
 */
export default function SavedChecklists({
  onOpen,
}: { onOpen: (item: SavedChecklist) => void }) {
  const { user, isMember } = useMember();
  const { data, loading, error } = useSavedChecklists(isMember ? user?.uid ?? null : null);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState('');

  if (!isMember || !user) return null;

  async function remove(id: string) {
    setFailed('');
    try {
      await deleteSavedChecklist(id);
    } catch {
      setFailed('Could not delete that. Try again.');
    }
  }

  return (
    <section className={styles.bar} aria-label="Your account">
      <div className={styles.top}>
        <p className={styles.who}>
          Signed in as <strong>{user.email}</strong>
        </p>
        <div className={styles.topActions}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            Saved checklists{loading ? '' : ` (${data.length})`}
            <ChevronDown size={15} className={clsx(styles.chev, open && styles.flip)} aria-hidden="true" />
          </button>
          <button type="button" className={styles.out} onClick={() => signOutMember().catch(() => {})}>
            <LogOut size={14} aria-hidden="true" /> Sign out
          </button>
        </div>
      </div>

      {open && (
        <div className={styles.panel}>
          {error && <p className={styles.msg}>Could not load your saved checklists.</p>}
          {!error && !loading && data.length === 0 && (
            <p className={styles.msg}>
              Nothing saved yet. Search your idea, then press Save on its checklist.
            </p>
          )}
          {failed && <p className={styles.msg} role="alert">{failed}</p>}
          <ul className={styles.list}>
            {data.map(item => (
              <li key={item.id} className={styles.item}>
                <button type="button" className={styles.openBtn} onClick={() => onOpen(item)}>
                  <span className={styles.idea}>{item.idea || 'All rules'}</span>
                  <span className={styles.prog}>
                    {item.done} of {item.total} done
                  </span>
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
        </div>
      )}
    </section>
  );
}
