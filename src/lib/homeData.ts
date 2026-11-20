/**
 * Firestore for the home page: the `homeContent` collection, which admins
 * post to from the admin panel. Anyone can read it; only admins can write
 * (see firestore.rules).
 */
import { useEffect, useState } from 'react';
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';
import { HOME_KINDS, SCENE_GROUPS, STAGES, type HomeItem, type HomeKind } from './homeContent';

const KINDS = HOME_KINDS.map(k => k.key);
const STAGE_KEYS = STAGES.map(s => s.key);
const GROUP_KEYS = SCENE_GROUPS.map(g => g.key);

/** Every stored field and its length limit. Mirrors validHomeItem() in firestore.rules. */
const TEXT_LIMITS = {
  title: 200,
  url: 500,
  source: 80,
  topic: 60,
  duration: 12,
  summary: 2000,
  stage: 20,
  type: 40,
  organiser: 120,
  value: 120,
  forWho: 160,
  date: 10,
  founder: 120,
  startup: 120,
  quote: 400,
  storyType: 10,
  town: 60,
  group: 20,
  description: 400,
} as const;

type TextField = keyof typeof TEXT_LIMITS;
export type HomeItemDraft = Omit<HomeItem, 'id' | 'createdAt'>;

export function emptyDraft(kind: HomeKind): HomeItemDraft {
  const draft = { kind, minutes: 0 } as HomeItemDraft;
  for (const f of Object.keys(TEXT_LIMITS) as TextField[]) (draft as Record<string, unknown>)[f] = '';
  return draft;
}

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function mapItem(snap: QueryDocumentSnapshot<DocumentData>): HomeItem {
  const d = snap.data();
  const item = { id: snap.id } as HomeItem;
  for (const [f, max] of Object.entries(TEXT_LIMITS)) (item as unknown as Record<string, unknown>)[f] = str(d[f], max);
  item.kind = KINDS.includes(d.kind) ? d.kind : 'video';
  item.stage = STAGE_KEYS.includes(d.stage) ? d.stage : '';
  item.group = GROUP_KEYS.includes(d.group) ? d.group : '';
  item.storyType = d.storyType === 'success' || d.storyType === 'lesson' ? d.storyType : '';
  item.minutes = typeof d.minutes === 'number' ? d.minutes : 0;
  item.createdAt = d.createdAt instanceof Timestamp ? d.createdAt.toDate().toISOString() : '';
  return item;
}

/** Cleans a draft into exactly the fields the rules allow. */
function toData(draft: HomeItemDraft): Record<string, unknown> {
  const data: Record<string, unknown> = { kind: draft.kind };
  for (const [f, max] of Object.entries(TEXT_LIMITS)) {
    data[f] = str((draft as unknown as Record<string, unknown>)[f], max);
  }
  if (!STAGE_KEYS.includes(data.stage as never)) data.stage = '';
  if (!GROUP_KEYS.includes(data.group as never)) data.group = '';
  if (data.storyType !== 'success' && data.storyType !== 'lesson') data.storyType = '';
  if (data.date && !/^\d{4}-\d{2}-\d{2}$/.test(data.date as string)) data.date = '';
  const minutes = Math.round(Number(draft.minutes) || 0);
  data.minutes = Math.min(Math.max(minutes, 0), 600);
  return data;
}

export async function saveHomeItem(draft: HomeItemDraft, id?: string): Promise<void> {
  if (!draft.title.trim()) throw new Error('Add a title.');
  const data = toData(draft);
  const db = getDb();
  if (id) {
    await updateDoc(doc(db, 'homeContent', id), { ...data, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, 'homeContent'), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  }
}

export async function deleteHomeItem(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'homeContent', id));
}

/** Every posted item, newest first. */
export function useHomeItems(): { items: HomeItem[]; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ items: HomeItem[]; loading: boolean; error: string | null }>({
    items: [],
    loading: isFirebaseConfigured,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(collection(getDb(), 'homeContent'), orderBy('createdAt', 'desc'), limit(300));
    return onSnapshot(
      q,
      snap => setState({ items: snap.docs.map(mapItem), loading: false, error: null }),
      err => setState({ items: [], loading: false, error: err.message }),
    );
  }, []);

  return state;
}
