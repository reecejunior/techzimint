/**
 * Matching for the /regulations directory: turn a founder's one-line idea into
 * the rules that apply to it, sorted into the four groups they are read in.
 * Pure functions only, so scripts/logic-check.mts can exercise them without a
 * browser or a network.
 *
 * Two layers decide what shows up:
 *
 *   1. Keyword matching (always on). Explainable ("matched because you wrote
 *      'wallet'") and instant. A wrong match costs a founder one irrelevant
 *      row, never a missing obligation.
 *
 *   2. An optional AI plan (see regulationsAi.ts and /api/regulations/match).
 *      The model only ever rates rules that already exist in the directory,
 *      by id. It cannot write a rule, a fee or a deadline: every fact on the
 *      page still comes from regulationsData.ts. It can add rules that
 *      keywords missed, mark keyword hits as unlikely, and say why.
 */
import { RULES, SECTORS } from './regulationsData.ts';

export type Regulator =
  | 'POTRAZ' | 'RBZ' | 'FIU' | 'SECZ' | 'IPEC'
  | 'TRANSPORT' | 'ZIMRA' | 'CAAZ' | 'CONSUMER' | 'REGISTRAR';

/** How firmly a rule is sourced. See the header of regulationsData.ts. */
export type RuleStatus = 'official' | 'reported' | 'verify';

/** Does the rule depend on what you build, or does everyone face it? */
export type Scope = 'general' | 'specific';

/** A gate before you start, a duty once you run, or still moving. */
export type Phase = 'before' | 'running' | 'watch';

/** The four buckets results are read in, in display order. */
export type GroupKey = 'before' | 'general' | 'running' | 'watch';
export const GROUP_ORDER: GroupKey[] = ['before', 'general', 'running', 'watch'];

export interface Sector {
  id: string;
  label: string;
  /** Regular-expression source, matched case-insensitively against the idea. */
  pattern: string;
}

export interface Rule {
  id: string;
  reg: Regulator;
  scope: Scope;
  phase: Phase;
  /** Sector ids that make a specific rule relevant. General rules need none. */
  tags: string[];
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

export type Relevance = 'high' | 'medium' | 'unlikely';

/** What the model said about one rule. `reason` is model-written text. */
export interface AiPick {
  relevance: Relevance;
  reason: string;
}

export interface AiPlan {
  picks: Record<string, AiPick>;
  /** One question that would sharpen the answer, if the idea was vague. */
  clarify?: string;
}

export interface Match {
  rule: Rule;
  /** Sector ids whose keywords matched this rule. */
  hits: string[];
  score: number;
  ai?: AiPick;
}

export interface Matched {
  /** Sector ids found in the idea by keyword, most mentioned first. */
  recognised: string[];
  /** True when something more specific than "personal data" was identified. */
  hasSector: boolean;
  groups: Record<GroupKey, Match[]>;
  /** Keyword hits the AI rated unlikely. Shown collapsed, never dropped. */
  demoted: Match[];
  clarify?: string;
  aiUsed: boolean;
}

/** Which group a rule is read in. */
export function groupOf(rule: Rule): GroupKey {
  if (rule.scope === 'general') return 'general';
  return rule.phase;
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

const RELEVANCE_RANK: Record<Relevance, number> = { high: 0, medium: 1, unlikely: 2 };

function emptyGroups(): Record<GroupKey, Match[]> {
  return { before: [], general: [], running: [], watch: [] };
}

/** POTRAZ first, then what the AI is surest of, then keyword strength. */
function sortMatches(items: Match[]): Match[] {
  const order = new Map(RULES.map((r, i) => [r.id, i]));
  return [...items].sort((a, b) => {
    const potraz = Number(b.rule.reg === 'POTRAZ') - Number(a.rule.reg === 'POTRAZ');
    if (potraz) return potraz;
    const ai = (a.ai ? RELEVANCE_RANK[a.ai.relevance] : 2) - (b.ai ? RELEVANCE_RANK[b.ai.relevance] : 2);
    if (ai) return ai;
    if (b.score !== a.score) return b.score - a.score;
    return order.get(a.rule.id)! - order.get(b.rule.id)!;
  });
}

/**
 * Sort rules for a founder's idea into the four groups. General rules are
 * always included: the AI can annotate them but never remove them, because the
 * cost of wrongly hiding a baseline duty is higher than showing one extra row.
 */
export function matchIdea(text: string, plan?: AiPlan | null): Matched {
  const found = analyse(text);
  const groups = emptyGroups();
  const demoted: Match[] = [];
  let aiAdded = false;

  for (const rule of RULES) {
    const hits = rule.tags.filter(t => found[t]);
    const score = hits.reduce((n, t) => n + found[t], 0);
    const pick = plan?.picks[rule.id];
    const keep = pick && pick.relevance !== 'unlikely' ? pick : undefined;
    const m: Match = { rule, hits, score, ai: keep };

    if (rule.scope === 'general') {
      groups.general.push(m);
    } else if (pick?.relevance === 'unlikely') {
      if (score > 0) demoted.push({ rule, hits, score, ai: pick });
    } else if (keep || score > 0) {
      groups[groupOf(rule)].push(m);
      if (keep && score === 0) aiAdded = true;
    }
  }

  const recognised = Object.keys(found).sort((a, b) => found[b] - found[a]);
  for (const k of GROUP_ORDER) groups[k] = sortMatches(groups[k]);

  return {
    recognised,
    hasSector: recognised.some(id => id !== 'data') || aiAdded,
    groups,
    demoted: sortMatches(demoted),
    clarify: plan?.clarify,
    aiUsed: Boolean(plan),
  };
}

/** Every rule in its group, for browsing before anything has been typed. */
export function browseAll(): Matched {
  const groups = emptyGroups();
  for (const rule of RULES) groups[groupOf(rule)].push({ rule, hits: [], score: 0 });
  for (const k of GROUP_ORDER) groups[k] = sortMatches(groups[k]);
  return { recognised: [], hasSector: false, groups, demoted: [], aiUsed: false };
}

/** Total rules shown across all four groups. */
export function countShown(m: Matched): number {
  return GROUP_ORDER.reduce((n, k) => n + m.groups[k].length, 0);
}

const MAX_REASON = 220;
const MAX_CLARIFY = 200;

function cleanText(v: unknown, max: number): string {
  if (typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim().slice(0, max);
}

/**
 * Turn whatever the model returned into an AiPlan, or null if nothing usable
 * came back. Anything not on the allow-list is dropped: unknown rule ids,
 * unknown relevance values, non-string reasons. The model's text is only ever
 * rendered as plain text, but it is trimmed and length-capped regardless.
 */
export function parseAiPlan(raw: unknown): AiPlan | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as { picks?: unknown; clarify?: unknown };
  if (!Array.isArray(body.picks)) return null;

  const known = new Set(RULES.map(r => r.id));
  const picks: Record<string, AiPick> = {};
  for (const item of body.picks) {
    if (!item || typeof item !== 'object') continue;
    const { id, relevance, reason } = item as Record<string, unknown>;
    if (typeof id !== 'string' || !known.has(id)) continue;
    if (relevance !== 'high' && relevance !== 'medium' && relevance !== 'unlikely') continue;
    if (picks[id]) continue;
    picks[id] = { relevance, reason: cleanText(reason, MAX_REASON) };
  }
  if (Object.keys(picks).length === 0) return null;

  const clarify = cleanText(body.clarify, MAX_CLARIFY);
  return clarify ? { picks, clarify } : { picks };
}
