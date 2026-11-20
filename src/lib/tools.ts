/**
 * Firestore for the Tools section: Finder posts and Spaces submissions.
 * Finder posts go live as soon as they are written. Space submissions wait in
 * a queue until an admin approves them.
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
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { isMemberUser } from './account';
import { ensureSignedIn, getDb, isFirebaseConfigured } from './firebase';
import type {
  FinderNeed,
  FinderPost,
  FinderPostDraft,
  SpaceSubmission,
  SpaceType,
} from './types';

const FINDER_NEEDS: FinderNeed[] = ['cofounder', 'employee', 'freelancer'];

function iso(value: unknown): string {
  return value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();
}

function strings(value: unknown, max: number, each: number): string[] {
  return Array.isArray(value) ? value.map(String).map(s => s.slice(0, each)).slice(0, max) : [];
}

/* ─── Finder ─────────────────────────────────────────────── */

function mapFinderPost(snap: QueryDocumentSnapshot<DocumentData>): FinderPost {
  const d = snap.data();
  return {
    id: snap.id,
    authorId: String(d.authorId ?? ''),
    authorName: String(d.authorName ?? 'Anonymous'),
    headline: String(d.headline ?? ''),
    body: String(d.body ?? ''),
    lookingFor: strings(d.lookingFor, 3, 20).filter((n): n is FinderNeed =>
      FINDER_NEEDS.includes(n as FinderNeed),
    ),
    skills: strings(d.skills, 8, 30),
    location: String(d.location ?? ''),
    contact: typeof d.contact === 'string' && d.contact ? d.contact : null,
    createdAt: iso(d.createdAt),
  };
}

export async function createFinderPost(draft: FinderPostDraft, authorName: string): Promise<string> {
  const headline = draft.headline.trim();
  const body = draft.body.trim();
  if (!headline) throw new Error('Add a headline, such as what you do.');
  if (!body) throw new Error('Tell people about your work and experience.');
  const lookingFor = draft.lookingFor.filter(n => FINDER_NEEDS.includes(n));
  if (lookingFor.length === 0) throw new Error('Choose at least one thing you are looking for.');

  const user = await ensureSignedIn();
  if (!isMemberUser(user)) throw new Error('Sign up with email to post on Finder.');

  const skills = [...new Set(draft.skills.map(s => s.trim()).filter(Boolean))].slice(0, 8);
  const ref = await addDoc(collection(getDb(), 'finderPosts'), {
    authorId: user.uid,
    authorName: authorName.trim().slice(0, 60) || 'Anonymous',
    headline: headline.slice(0, 120),
    body: body.slice(0, 2000),
    lookingFor,
    skills: skills.map(s => s.slice(0, 30)),
    location: draft.location.trim().slice(0, 80),
    contact: draft.contact.trim().slice(0, 120) || null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteFinderPost(postId: string): Promise<void> {
  await deleteDoc(doc(getDb(), 'finderPosts', postId));
}

export function useFinderPosts(): { data: FinderPost[]; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ data: FinderPost[]; loading: boolean; error: string | null }>({
    data: [],
    loading: isFirebaseConfigured,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(collection(getDb(), 'finderPosts'), orderBy('createdAt', 'desc'), limit(100));
    return onSnapshot(
      q,
      snap => setState({ data: snap.docs.map(mapFinderPost), loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  return state;
}

/* ─── Spaces ─────────────────────────────────────────────── */

function mapSubmission(snap: QueryDocumentSnapshot<DocumentData>): SpaceSubmission {
  const d = snap.data();
  return {
    id: snap.id,
    name: String(d.name ?? ''),
    town: String(d.town ?? ''),
    type: d.type === 'cafe' ? 'cafe' : 'coworking',
    address: String(d.address ?? ''),
    offers: strings(d.offers, 10, 40),
    price: String(d.price ?? ''),
    contact: String(d.contact ?? ''),
    submittedBy: String(d.submittedBy ?? ''),
    status: d.status === 'approved' ? 'approved' : d.status === 'rejected' ? 'rejected' : 'pending',
    createdAt: iso(d.createdAt),
  };
}

export interface SpaceSubmissionDraft {
  name: string;
  town: string;
  type: SpaceType;
  address: string;
  offers: string[];
  price: string;
  contact: string;
}

export async function submitSpace(draft: SpaceSubmissionDraft, submittedBy: string): Promise<void> {
  const name = draft.name.trim();
  if (!name) throw new Error('Give the space a name.');
  if (!draft.town.trim()) throw new Error('Choose or type the town.');

  const user = await ensureSignedIn();
  if (!isMemberUser(user)) throw new Error('Sign up with email to submit a space.');

  await addDoc(collection(getDb(), 'spaceSubmissions'), {
    name: name.slice(0, 100),
    town: draft.town.trim().slice(0, 60),
    type: draft.type === 'cafe' ? 'cafe' : 'coworking',
    address: draft.address.trim().slice(0, 160),
    offers: draft.offers.map(o => o.trim().slice(0, 40)).filter(Boolean).slice(0, 10),
    price: draft.price.trim().slice(0, 200),
    contact: draft.contact.trim().slice(0, 120),
    submittedBy: submittedBy.trim().slice(0, 60) || 'Anonymous',
    submittedById: user.uid,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
}

/** Approved submissions only: what the public directory shows. */
export function useApprovedSpaceSubmissions(): SpaceSubmission[] {
  const [data, setData] = useState<SpaceSubmission[]>([]);

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(
      collection(getDb(), 'spaceSubmissions'),
      where('status', '==', 'approved'),
      limit(200),
    );
    return onSnapshot(q, snap => setData(snap.docs.map(mapSubmission)), () => setData([]));
  }, []);

  return data;
}

/** Every submission, for the admin queue. Only works for signed-in admins. */
export function useSpaceSubmissionsForAdmin(): { data: SpaceSubmission[]; loading: boolean; error: string | null } {
  const [state, setState] = useState<{ data: SpaceSubmission[]; loading: boolean; error: string | null }>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const q = query(collection(getDb(), 'spaceSubmissions'), limit(200));
    return onSnapshot(
      q,
      snap => setState({ data: snap.docs.map(mapSubmission), loading: false, error: null }),
      err => setState({ data: [], loading: false, error: err.message }),
    );
  }, []);

  return state;
}

export async function decideSpaceSubmission(id: string, status: 'approved' | 'rejected'): Promise<void> {
  await updateDoc(doc(getDb(), 'spaceSubmissions', id), { status });
}

/** One approved submission, for its own page. null when missing or not approved. */
export function useApprovedSpaceSubmission(id: string | null): { data: SpaceSubmission | null; loading: boolean } {
  const [state, setState] = useState<{ data: SpaceSubmission | null; loading: boolean; forId: string | null }>({
    data: null,
    loading: Boolean(id) && isFirebaseConfigured,
    forId: id,
  });

  useEffect(() => {
    if (!id || !isFirebaseConfigured) return;
    return onSnapshot(
      doc(getDb(), 'spaceSubmissions', id),
      snap =>
        setState({
          data: snap.exists() && snap.data().status === 'approved'
            ? mapSubmission(snap as QueryDocumentSnapshot<DocumentData>)
            : null,
          loading: false,
          forId: id,
        }),
      () => setState({ data: null, loading: false, forId: id }),
    );
  }, [id]);

  return state.forId === id ? state : { data: null, loading: Boolean(id) && isFirebaseConfigured };
}
