import type { Developer } from './types';

/**
 * Skills are free text in the directory ("Websites, Web Apps, Android
 * Applications"). These patterns turn that text into short tags for the cards
 * and the skill filter. Order sets which tags show first on a card.
 */
export const SKILL_TAGS: { tag: string; test: RegExp }[] = [
  { tag: 'Web', test: /web|website|html|cms/i },
  { tag: 'Mobile', test: /mobile|android|\bios\b|iphone|ipad|ionic|flutter|kotlin|swift/i },
  { tag: 'Android', test: /android/i },
  { tag: 'iOS', test: /\bios\b|iphone|ipad|swift/i },
  { tag: 'PHP', test: /\bphp/i },
  { tag: 'Java', test: /\bjava\b(?!\s*script)/i },
  { tag: 'JavaScript', test: /javascript|\bjs\b|jquery|node|react|angular|vue/i },
  { tag: 'WordPress', test: /wordpress/i },
  { tag: 'Python', test: /python|django/i },
  { tag: 'C# / .NET', test: /c#|\.net|asp/i },
  { tag: 'Databases', test: /mysql|sql|mongo|database|oracle|postgres/i },
  { tag: 'Design', test: /design|ui\/ux|\bux\b|graphic/i },
  { tag: 'E-commerce', test: /e-?commerce|online shop|payment/i },
  { tag: 'Desktop', test: /desktop/i },
];

export function skillTags(skills: string): string[] {
  return SKILL_TAGS.filter(s => s.test.test(skills)).map(s => s.tag);
}

/** Skills worth a quick filter: common enough to narrow the list usefully. */
export const SKILL_FILTERS = ['Web', 'Mobile', 'Android', 'iOS', 'PHP', 'Java', 'JavaScript', 'WordPress', 'Python', 'Design'];

const TONES = ['orange', 'green', 'blue', 'plum', 'sand'] as const;
export type Tone = (typeof TONES)[number];

/** A steady colour per person, so the same developer always looks the same. */
export function toneFor(name: string): Tone {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

export function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean);
  return ((words[0]?.[0] ?? '') + (words[1]?.[0] ?? '')).toUpperCase() || '?';
}

/** Towns with at least two developers, most first. */
export function townsOf(devs: Developer[]): string[] {
  const counts = new Map<string, number>();
  for (const d of devs) if (d.town) counts.set(d.town, (counts.get(d.town) ?? 0) + 1);
  return [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

/**
 * Page numbers to show: always the first and last, the current page and its
 * neighbours, with null where a run is skipped.
 */
export function pageList(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach(n => keep.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach(n => keep.add(n));
  const nums = [...keep].filter(n => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | null)[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push(null);
    out.push(n);
  });
  return out;
}
