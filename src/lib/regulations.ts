/**
 * Matching for the /regulations directory: turn a founder's one-line idea into
 * the rules that apply to it. Pure functions only, so scripts/logic-check.mts
 * can exercise them without a browser.
 *
 * The data lives in regulationsData.ts. Matching is deliberately plain keyword
 * matching: it is explainable ("matched because you wrote 'wallet'") and a
 * wrong match costs a founder one irrelevant row, never a missing obligation
 * they were told did not apply. The baseline rules are shown for every idea.
 */
import { RULES, SECTORS } from './regulationsData.ts';

export type Regulator =
  | 'POTRAZ' | 'RBZ' | 'FIU' | 'SECZ' | 'IPEC'
  | 'TRANSPORT' | 'ZIMRA' | 'CAAZ' | 'CONSUMER' | 'REGISTRAR';

/** How firmly a rule is sourced. See the header of regulationsData.ts. */
export type RuleStatus = 'official' | 'reported' | 'verify';

export interface Sector {
  id: string;
  label: string;
  /** Regular-expression source, matched case-insensitively against the idea. */
  pattern: string;
}

export interface Rule {
  id: string;
  reg: Regulator;
  /** Sector ids that make this rule relevant. */
  tags: string[];
  /** POTRAZ data-protection rules: shown for any idea, even with no sector hit. */
  baseline: boolean;
  /** Needed by every company whatever it builds (tax, incorporation). */
  general: boolean;
  status: RuleStatus;
  title: string;
  /** The one line a founder should come away with. */
  headline: string;
  summary: string;
  facts: { label: string; value: string }[];
  /** What could not be confirmed, or why a figure may be out of date. */
  note?: string;
  sources: { t: string; u: string }[];
}

export interface Match {
  rule: Rule;
  /** Sector ids that matched this rule. Empty for baseline and general rules. */
  hits: string[];
  score: number;
}

export interface Matched {
  /** Sector ids found in the idea, most mentioned first. Includes "data". */
  recognised: string[];
  /** True when the idea mentioned something more specific than "data". */
  hasSector: boolean;
  potraz: Match[];
  others: Match[];
  general: Match[];
}

/** Count how many times each sector's keywords appear in the idea. */
export function analyse(text: string): Record<string, number> {
  const lower = text.toLowerCase();
  const found: Record<string, number> = {};
  for (const s of SECTORS) {
    const m = lower.match(new RegExp(s.pattern, 'g'));
    if (m) found[s.id] = m.length;
  }
  return found;
}

/**
 * Sort rules for a founder's idea. POTRAZ rules come first (the sector-matched
 * ones, then the data-protection baseline), then other regulators that matched,
 * then the rules every company needs.
 */
export function matchIdea(text: string): Matched {
  const found = analyse(text);
  const scored: Match[] = RULES.map(rule => {
    const hits = rule.tags.filter(t => found[t]);
    return { rule, hits, score: hits.reduce((n, t) => n + found[t], 0) };
  });
  const byScore = (a: Match, b: Match) => b.score - a.score;

  const recognised = Object.keys(found).sort((a, b) => found[b] - found[a]);
  return {
    recognised,
    hasSector: recognised.some(id => id !== 'data'),
    potraz: scored.filter(m => m.rule.reg === 'POTRAZ' && (m.score > 0 || m.rule.baseline)).sort(byScore),
    others: scored.filter(m => m.rule.reg !== 'POTRAZ' && !m.rule.general && m.score > 0).sort(byScore),
    general: scored.filter(m => m.rule.general),
  };
}
