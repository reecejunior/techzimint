import type { Notification } from './types';

/**
 * How a notification reads as a sentence — shared between the in-app bell
 * and the email jobs, so the wording never drifts between the two surfaces.
 * Framework-agnostic on purpose: no React, no DOM, safe to import from a
 * server Route Handler as well as a client component.
 */
export function messageFor(n: Pick<Notification, 'type' | 'startupName' | 'actorName' | 'snippet'>): string {
  switch (n.type) {
    case 'reply':
      // Attributed to the startup, not the founder's typed name — replying
      // as the founder is the whole point of this one.
      return `${n.startupName} replied: "${n.snippet}"`;
    case 'comment':
      return `${n.actorName || 'Someone'} commented on ${n.startupName}: "${n.snippet}"`;
    case 'review':
      return n.snippet
        ? `${n.actorName || 'Someone'} reviewed ${n.startupName}: "${n.snippet}"`
        : `${n.actorName || 'Someone'} reviewed ${n.startupName}.`;
    case 'like':
      return `Someone liked ${n.startupName}.`;
  }
}
