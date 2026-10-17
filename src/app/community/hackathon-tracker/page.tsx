'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Link2, Search, X } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { WINNERS, type Winner } from './data';
import styles from './page.module.css';

/** Rarest-to-most-common ordering used everywhere a status appears — charts,
 *  the legend, the pills, the sort fallback — so "Active" always reads as the
 *  good end and "No trace" as the quiet end. */
const STATUSES = ['Active', 'Some later activity', 'Unclear', 'Too recent', 'No trace'] as const;
type Status = (typeof STATUSES)[number];

const STATUS_COLOR: Record<Status, string> = {
  Active: 'var(--tr-active)',
  'Some later activity': 'var(--tr-some)',
  Unclear: 'var(--tr-unclear)',
  'Too recent': 'var(--tr-recent)',
  'No trace': 'var(--tr-notrace)',
};

const fmtNum = (n: number) => n.toLocaleString('en-US');
const fmtUsd = (n: number) => `US$${fmtNum(Math.round(n))}`;
const fmtPct = (n: number) => `${Math.round(n * 100)}%`;

/** A team formed purely to enter one hackathon/healthathon/challenge, as
 *  opposed to an existing outfit that happened to enter one — the distinction
 *  Finding 2 below is about. */
function isPureHackathonEntry(r: Winner) {
  return (
    r.alreadyOperating === 'No' &&
    /hackathon|healthathon|hack4|hackingforsdgs|ideathon|e-novate|innovation drive challenge/i.test(
      `${r.programme} ${r.award}`,
    )
  );
}

type SortKey = 'name' | 'programme' | 'year' | 'prizeUsd' | 'status';

/** One row of a stacked-bar chart: a category label, its total, and a count
 *  for every status. `Record<Status, number>` (exact keys) rather than
 *  `Record<string, number>` (an open index signature), which would conflict
 *  with `group` being a string. */
type CategoryRow = { group: string; total: number } & Record<Status, number>;

/** A click on a tile, a chart segment, a dot or a finding all resolve to one
 *  of these — a named slice of WINNERS, optionally with a sort to open it in.
 *  Keeping them in one table means the tiles, the findings list and the
 *  charts share exactly the same filtering logic rather than three
 *  reimplementations of "what counts as active". */
const PRESETS: Record<
  string,
  { label: string | null; test: ((r: Winner) => boolean) | null; sort?: [SortKey, 1 | -1] }
> = {
  all: { label: null, test: null },
  active: { label: 'Clearly still active', test: r => r.status === 'Active' },
  notrace: { label: 'No public trace', test: r => r.status === 'No trace' },
  money: {
    label: 'Paid in US$, largest first',
    test: r => Boolean(r.prizeUsd),
    sort: ['prizeUsd', -1],
  },
  preexisting: {
    label: 'Active and already operating before the win',
    test: r => r.status === 'Active' && r.alreadyOperating === 'Yes',
  },
  'f-survivors': {
    label: 'Finding: active ventures, and whether they pre-existed',
    test: r => r.status === 'Active',
  },
  'f-hack': {
    label: 'Finding: teams formed just for one challenge',
    test: isPureHackathonEntry,
  },
  'f-zwl': {
    label: 'Finding: Zimbabwe-dollar or sub-US$3,500 prizes',
    test: r => /Zimbabwe dollars/.test(r.prize) || (Boolean(r.prizeUsd) && (r.prizeUsd as number) <= 3500),
    sort: ['prizeUsd', 1],
  },
  'f-followon': {
    label: 'Finding: the only documented follow-on round',
    test: r => /seed from NVCCZ/i.test(r.evidence),
  },
  'f-unnamed': {
    label: 'Finding: winners reported without founders named',
    test: r => /^not named|unnamed/i.test(r.people),
  },
  'f-sectors': {
    label: 'Finding: what the active ventures do',
    test: r => r.status === 'Active',
  },
};

const FINDINGS: { preset: keyof typeof PRESETS; title: string; body: string }[] = [
  {
    preset: 'f-survivors',
    title: 'Survivors were already businesses.',
    body: 'Almost every active venture had revenue, registration or earlier awards before it won. The challenges mostly reward traction; they rarely create it.',
  },
  {
    preset: 'f-hack',
    title: 'Pure hackathon teams vanish.',
    body: 'No team formed just for a POTRAZ, Cimas or bank hackathon shows up later as a running company.',
  },
  {
    preset: 'f-zwl',
    title: 'The money is too small or arrived in the wrong currency.',
    body: 'Early POTRAZ prizes were paid in Zimbabwe dollars and mostly went to university hubs; Cimas and bank hackathon prizes are a few hundred to a few thousand US dollars.',
  },
  {
    preset: 'f-followon',
    title: 'Follow-on capital is almost absent.',
    body: "KumbaCare's seed round from NVCCZ and Old Mutual is the only documented post-win funding in the list.",
  },
  {
    preset: 'f-unnamed',
    title: 'Nobody tracks outcomes.',
    body: 'Many winners are reported without founders or a description, and no organiser publishes an alumni report.',
  },
  {
    preset: 'f-sectors',
    title: 'What lasts is physical or impact-driven.',
    body: 'Health, agri-processing, energy and recycling ventures dominate the active list; generic tech and creative winners rarely reappear.',
  },
];

interface Filters {
  q: string;
  group: string;
  programme: string;
  status: string;
  op: string;
  year: string;
  preset: string;
}

const EMPTY_FILTERS: Filters = { q: '', group: '', programme: '', status: '', op: '', year: '', preset: 'all' };

export default function HackathonTrackerPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [openId, setOpenId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  function applyPreset(preset: string) {
    const next = preset === filters.preset ? 'all' : preset;
    setFilters({ ...EMPTY_FILTERS, preset: next });
    const sort = PRESETS[next]?.sort;
    if (sort) {
      setSortKey(sort[0]);
      setSortDir(sort[1]);
    }
    if (next !== 'all') {
      requestAnimationFrame(() => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }

  function openRow(id: string) {
    setOpenId(id);
    setFilters(EMPTY_FILTERS);
    requestAnimationFrame(() => {
      document.querySelector(`[data-row-id="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  const groups = useMemo(() => [...new Set(WINNERS.map(r => r.group))], []);
  const programmes = useMemo(() => [...new Set(WINNERS.map(r => r.programme))].sort(), []);

  const summary = useMemo(() => {
    const byStatus = (s: Status) => WINNERS.filter(r => r.status === s).length;
    const active = WINNERS.filter(r => r.status === 'Active');
    const preexisting = active.filter(r => r.alreadyOperating === 'Yes').length;
    const prizeUsdTotal = WINNERS.reduce((sum, r) => sum + (r.prizeUsd ?? 0), 0);
    const prizeUsdTeams = WINNERS.filter(r => Boolean(r.prizeUsd)).length;
    const prizeUsdActive = active.reduce((sum, r) => sum + (r.prizeUsd ?? 0), 0);
    return {
      total: WINNERS.length,
      active: active.length,
      noTrace: byStatus('No trace'),
      noTraceShare: byStatus('No trace') / WINNERS.length,
      preexisting,
      preexistingShare: active.length ? preexisting / active.length : 0,
      prizeUsdTotal,
      prizeUsdTeams,
      prizeUsdActive,
    };
  }, []);

  function countsByStatus(rows: Winner[], group: string): CategoryRow {
    const row = { group, total: 0 } as CategoryRow;
    STATUSES.forEach(s => {
      const n = rows.filter(r => r.status === s).length;
      row[s] = n;
      row.total += n;
    });
    return row;
  }

  const byProgramme = useMemo(() => {
    return groups
      .map(group => countsByStatus(WINNERS.filter(r => r.group === group), group))
      .sort((a, b) => b.total - a.total);
  }, [groups]);

  const byYear = useMemo(() => {
    const years = [...new Set(WINNERS.map(r => r.year))].sort((a, b) => a - b);
    return years.map(year => ({
      ...countsByStatus(WINNERS.filter(r => r.year === year), String(year)),
      year,
    }));
  }, []);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    const preset = PRESETS[filters.preset] ?? PRESETS.all;
    return WINNERS.filter(
      r =>
        (!preset.test || preset.test(r)) &&
        (!filters.group || r.group === filters.group) &&
        (!filters.programme || r.programme === filters.programme) &&
        (!filters.status || r.status === filters.status) &&
        (!filters.op || r.alreadyOperating === filters.op) &&
        (!filters.year || String(r.year) === filters.year) &&
        (!q ||
          [r.name, r.people, r.award, r.whatItDoes, r.evidence, r.programme, r.group, r.prize]
            .join(' ')
            .toLowerCase()
            .includes(q)),
    );
  }, [filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: string | number = a[sortKey] ?? (sortKey === 'prizeUsd' ? -1 : '');
      let vb: string | number = b[sortKey] ?? (sortKey === 'prizeUsd' ? -1 : '');
      if (sortKey === 'status') {
        va = STATUSES.indexOf(va as Status);
        vb = STATUSES.indexOf(vb as Status);
      }
      return (va > vb ? 1 : va < vb ? -1 : 0) * sortDir;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(key === 'prizeUsd' || key === 'year' ? -1 : 1);
    }
  }

  const activePreset = PRESETS[filters.preset] ?? PRESETS.all;
  const hasChips =
    filters.preset !== 'all' || filters.group || filters.programme || filters.status || filters.year || filters.op || filters.q;

  return (
    <div className={styles.page}>
      <div className={`wrap ${styles.backRow}`}>
        <Link href="/community" className={styles.back}>
          <ArrowLeft size={14} aria-hidden="true" />
          Developer community
        </Link>
      </div>

      <header className={styles.header}>
        <div className={`wrap ${styles.headerInner}`}>
          <span className={styles.eyebrow}>Community tracker</span>
          <h1 className={styles.title}>Where are Zim&apos;s hackathon winners now?</h1>
          <p className={styles.lede}>
            Of {fmtNum(summary.total)} named winners and finalists across POTRAZ, Old Mutual VCC, Cimas
            Healthathon and other named Zimbabwean challenges, {fmtNum(summary.active)} are clearly still
            operating and {fmtPct(summary.noTraceShare)} leave no public trace. {fmtPct(summary.preexistingShare)}{' '}
            of the active ones were already running before they won, and they received only{' '}
            {fmtUsd(summary.prizeUsdActive)} of the {fmtUsd(summary.prizeUsdTotal)} in US$ prizes tracked.
          </p>
          <p className={styles.hint}>
            Compiled from press and university reports, 15 Oct 2026 — a point-in-time check, not a live
            feed. Tiles, chart segments, dots and findings all filter the list at the bottom; click any of
            them.
          </p>
        </div>
      </header>

      <div className={`wrap ${styles.body}`}>
        <div className={styles.tiles}>
          <Tile
            label="Winners & finalists traced"
            value={fmtNum(summary.total)}
            sub="Click to show everyone"
            active={filters.preset === 'all' && !hasChips}
            onClick={() => applyPreset('all')}
          />
          <Tile
            label="Clearly still active"
            value={fmtNum(summary.active)}
            sub="Evidence of operations in 2025–26"
            active={filters.preset === 'active'}
            onClick={() => applyPreset('active')}
          />
          <Tile
            label="No public trace after winning"
            value={fmtPct(summary.noTraceShare)}
            sub="Share of all entries"
            active={filters.preset === 'notrace'}
            onClick={() => applyPreset('notrace')}
          />
          <Tile
            label="US$ prize money tracked"
            value={fmtUsd(summary.prizeUsdTotal)}
            sub={`Across ${summary.prizeUsdTeams} entries paid in US$`}
            active={filters.preset === 'money'}
            onClick={() => applyPreset('money')}
          />
          <Tile
            label="Active ones already operating before the win"
            value={fmtPct(summary.preexistingShare)}
            sub="Of the active ventures"
            active={filters.preset === 'preexisting'}
            onClick={() => applyPreset('preexisting')}
          />
        </div>

        <div className={styles.grid2}>
          <section className={styles.card}>
            <h2>Outcome by programme group</h2>
            <p className={styles.note}>
              Named winners and finalists by what a web search found about them today. Click a segment to
              list those entries. &quot;UN, bank &amp; other&quot; covers UNDP YouthConnektZim, the UNDP
              Multi-City Challenge, the Hult Prize accelerator, UNICEF imaGen, the ZITF hackathon, the MSU ×
              NMB Bank hackathon and Econet E-NOVATE.
            </p>
            <StatusLegend activeStatus={filters.status} onToggle={s => setFilters(f => ({ ...f, status: f.status === s ? '' : s }))} />
            <StackedBar
              rows={byProgramme}
              categoryKey="group"
              activeCategory={filters.group}
              activeStatus={filters.status}
              onBarClick={(group, status) =>
                setFilters(f => ({
                  ...EMPTY_FILTERS,
                  group: f.group === group && f.status === status ? '' : group,
                  status: f.group === group && f.status === status ? '' : status,
                }))
              }
              onLabelClick={group => setFilters(f => ({ ...EMPTY_FILTERS, group: f.group === group ? '' : group }))}
            />
          </section>

          <section className={styles.card}>
            <h2>Outcome by year won</h2>
            <p className={styles.note}>
              Older cohorts have had more time to grow, yet the 2020–2021 winners are mostly gone. Click a
              bar to list that year.
            </p>
            <StackedBar
              rows={byYear}
              categoryKey="group"
              activeCategory={filters.year}
              activeStatus={filters.status}
              onBarClick={(year, status) =>
                setFilters(f => ({
                  ...EMPTY_FILTERS,
                  year: f.year === year && f.status === status ? '' : year,
                  status: f.year === year && f.status === status ? '' : status,
                }))
              }
              onLabelClick={year => setFilters(f => ({ ...EMPTY_FILTERS, year: f.year === year ? '' : year }))}
            />
          </section>
        </div>

        <section className={styles.card}>
          <h2>Did bigger prizes buy better outcomes?</h2>
          <p className={styles.note}>
            Each dot is one team paid in US dollars, placed by prize size (log scale). Hover for the name,
            click to open its row. The largest cheques sit in &quot;No trace&quot; and &quot;Unclear&quot;.
          </p>
          <MoneyScatter
            openId={openId}
            visibleIds={new Set(filtered.map(r => r.id))}
            onDotClick={openRow}
            onLabelClick={s => setFilters(f => ({ ...EMPTY_FILTERS, preset: 'money', status: f.status === s ? '' : s }))}
          />
        </section>

        <section className={styles.card}>
          <h2>What the evidence suggests</h2>
          <p className={styles.note}>
            Deductions from the list. Click one to see the entries behind it. &quot;No trace&quot; means
            nothing findable online, not proof a venture failed.
          </p>
          <ol className={styles.findings}>
            {FINDINGS.map((f, i) => (
              <li key={f.preset}>
                <button
                  type="button"
                  aria-pressed={filters.preset === f.preset}
                  onClick={() => applyPreset(f.preset)}
                >
                  <span className={styles.findingNum}>{i + 1}</span>
                  <span className={styles.findingBody}>
                    <b>{f.title}</b> {f.body}
                  </span>
                  <span className={styles.findingGo}>Show →</span>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.card} ref={tableRef} id="list">
          <h2>All winners and finalists</h2>
          <p className={styles.note}>Search, filter or sort. Click a row for the full record and its evidence link.</p>

          <div className={styles.controls}>
            <div className={styles.searchWrap}>
              <Search size={15} className={styles.searchIcon} aria-hidden="true" />
              <input
                className={styles.search}
                type="search"
                placeholder="Search name, people, award…"
                aria-label="Search"
                value={filters.q}
                onChange={e => setFilters(f => ({ ...f, q: e.target.value }))}
              />
            </div>
            <select
              aria-label="Programme group"
              className={styles.select}
              value={filters.group}
              onChange={e => setFilters(f => ({ ...f, group: e.target.value }))}
            >
              <option value="">All groups</option>
              {groups.map(g => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select
              aria-label="Programme"
              className={styles.select}
              value={filters.programme}
              onChange={e => setFilters(f => ({ ...f, programme: e.target.value }))}
            >
              <option value="">All programmes</option>
              {programmes.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              aria-label="Status"
              className={styles.select}
              value={filters.status}
              onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            >
              <option value="">All statuses</option>
              {STATUSES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Operating before the win"
              className={styles.select}
              value={filters.op}
              onChange={e => setFilters(f => ({ ...f, op: e.target.value }))}
            >
              <option value="">Operating before: any</option>
              <option value="Yes">Operating before: yes</option>
              <option value="No">Operating before: no</option>
              <option value="Unknown">Operating before: unknown</option>
            </select>
          </div>

          <div className={styles.chips}>
            {activePreset.label && <Chip text={activePreset.label} onClear={() => applyPreset('all')} />}
            {filters.group && <Chip text={`Group: ${filters.group}`} onClear={() => setFilters(f => ({ ...f, group: '' }))} />}
            {filters.programme && <Chip text={filters.programme} onClear={() => setFilters(f => ({ ...f, programme: '' }))} />}
            {filters.status && <Chip text={`Status: ${filters.status}`} onClear={() => setFilters(f => ({ ...f, status: '' }))} />}
            {filters.year && <Chip text={`Year: ${filters.year}`} onClear={() => setFilters(f => ({ ...f, year: '' }))} />}
            {filters.op && <Chip text={`Operating before: ${filters.op}`} onClear={() => setFilters(f => ({ ...f, op: '' }))} />}
            {filters.q && <Chip text={`Search: "${filters.q}"`} onClear={() => setFilters(f => ({ ...f, q: '' }))} />}
            {!hasChips && <span className={styles.chipsHint}>No filters — click anything above to narrow the list.</span>}
            {hasChips && (
              <button type="button" className={styles.clearAll} onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear all
              </button>
            )}
            <span className={styles.count}>
              Showing {fmtNum(sorted.length)} of {fmtNum(WINNERS.length)}
            </span>
          </div>

          <div className={styles.tableBox}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <SortHeader label="Venture / team" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Programme" k="programme" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader label="Year" k="year" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <SortHeader
                    label="Prize (US$)"
                    k="prizeUsd"
                    sortKey={sortKey}
                    sortDir={sortDir}
                    onSort={toggleSort}
                    align="right"
                  />
                  <SortHeader label="Status now" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                  <th className={styles.hideSm}>Operating before?</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => (
                  <WinnerRow key={r.id} row={r} open={openId === r.id} onToggle={() => setOpenId(id => (id === r.id ? null : r.id))} />
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>
                      Nothing matches that — try a different search or clear a filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  sub,
  active,
  onClick,
}: {
  label: string;
  value: string;
  sub: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.tile} aria-pressed={active} onClick={onClick}>
      <div className={styles.tileLabel}>{label}</div>
      <div className={`${styles.tileValue} tnum`}>{value}</div>
      <div className={styles.tileSub}>{sub}</div>
    </button>
  );
}

function StatusLegend({ activeStatus, onToggle }: { activeStatus: string; onToggle: (s: Status) => void }) {
  return (
    <div className={styles.legend}>
      {STATUSES.map(s => (
        <button
          key={s}
          type="button"
          aria-pressed={activeStatus === s}
          onClick={() => onToggle(s)}
        >
          <i className={styles.swatch} style={{ background: STATUS_COLOR[s] }} />
          {s}
        </button>
      ))}
    </div>
  );
}

function Chip({ text, onClear }: { text: string; onClear: () => void }) {
  return (
    <button type="button" className={styles.chip} onClick={onClear}>
      {text}
      <X size={12} aria-hidden="true" />
    </button>
  );
}

function SortHeader({
  label,
  k,
  sortKey,
  sortDir,
  onSort,
  align,
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: 1 | -1;
  onSort: (k: SortKey) => void;
  align?: 'right';
}) {
  const active = sortKey === k;
  return (
    <th
      className={align === 'right' ? styles.alignRight : undefined}
      aria-sort={active ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}
    >
      <button type="button" onClick={() => onSort(k)}>
        {label}
        {active && <span aria-hidden="true">{sortDir === 1 ? ' ↑' : ' ↓'}</span>}
      </button>
    </th>
  );
}

function WinnerRow({ row, open, onToggle }: { row: Winner; open: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className={styles.row}
        data-row-id={row.id}
        tabIndex={0}
        aria-expanded={open}
        onClick={onToggle}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <td className={styles.nameCell}>
          {row.name}
          {row.whatItDoes !== '—' && <div className={styles.what}>{row.whatItDoes}</div>}
        </td>
        <td>{row.programme}</td>
        <td className="tnum">{row.year}</td>
        <td className={`${styles.alignRight} tnum`}>{row.prizeUsd ? fmtNum(row.prizeUsd) : '—'}</td>
        <td>
          <span className={styles.pill} data-status={row.status}>
            {row.status}
          </span>
        </td>
        <td className={styles.hideSm}>{row.alreadyOperating}</td>
      </tr>
      {open && (
        <tr className={styles.detailRow}>
          <td colSpan={6}>
            <div className={styles.detailGrid}>
              <DetailItem k="People named" v={row.people} />
              <DetailItem k="Award" v={row.award} />
              <DetailItem k="Programme group" v={row.group} />
              <DetailItem k="Prize details" v={row.prize} />
              <DetailItem k="Operating before the win?" v={row.alreadyOperating} />
              <DetailItem k="What we found" v={row.evidence} />
              {row.source.startsWith('https://') && (
                <DetailItem
                  k="Evidence link"
                  v={null}
                  node={
                    <a href={row.source} target="_blank" rel="noopener noreferrer" className={styles.evidenceLink}>
                      <Link2 size={13} aria-hidden="true" />
                      {safeHost(row.source)}
                    </a>
                  }
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailItem({ k, v, node }: { k: string; v: string | null; node?: React.ReactNode }) {
  return (
    <div className={styles.detailItem}>
      <div className={styles.detailKey}>{k}</div>
      <div className={styles.detailValue}>{node ?? v ?? '—'}</div>
    </div>
  );
}

function safeHost(url: string) {
  try {
    return `${new URL(url).hostname.replace(/^www\./, '')} ↗`;
  } catch {
    return 'Open source ↗';
  }
}

/** A horizontal stacked bar per category (programme group or year), one
 *  segment per status. Shared by both charts above — the only difference
 *  between them is which column of `rows` is the category label. */
function StackedBar({
  rows,
  categoryKey,
  activeCategory,
  activeStatus,
  onBarClick,
  onLabelClick,
}: {
  rows: CategoryRow[];
  categoryKey: 'group';
  activeCategory: string;
  activeStatus: string;
  onBarClick: (category: string, status: Status) => void;
  onLabelClick: (category: string) => void;
}) {
  return (
    <div className={styles.chart} style={{ height: Math.max(140, rows.length * 44) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={rows}
          layout="vertical"
          margin={{ top: 4, right: 36, bottom: 4, left: 4 }}
          barCategoryGap={14}
        >
          <CartesianGrid horizontal={false} stroke="var(--hairline)" />
          <XAxis type="number" hide />
          <YAxis
            dataKey={categoryKey}
            type="category"
            width={150}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: 'var(--ink-700)' }}
            onClick={(e: unknown) => {
              const label = (e as { value?: string })?.value;
              if (label) onLabelClick(label);
            }}
            style={{ cursor: 'pointer' }}
          />
          <RechartsTooltip
            cursor={{ fill: 'var(--surface)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className={styles.chartTooltip}>
                  <strong>{label}</strong>
                  {payload
                    .filter(p => typeof p.value === 'number' && p.value > 0)
                    .map(p => (
                      <span key={String(p.dataKey)}>
                        {String(p.dataKey)}: {p.value}
                      </span>
                    ))}
                </div>
              ) : null
            }
          />
          {STATUSES.map(s => (
            <Bar key={s} dataKey={s} stackId="stack" fill={STATUS_COLOR[s]} radius={0} maxBarSize={24}>
              {rows.map((row, i) => (
                <Cell
                  key={i}
                  cursor="pointer"
                  opacity={
                    (activeCategory && activeCategory !== row.group) || (activeStatus && activeStatus !== s)
                      ? 0.3
                      : 1
                  }
                  onClick={() => onBarClick(row.group, s)}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Measures a container's width so the hand-drawn SVG charts below can lay
 *  out responsively without pulling in a layout library just for this page. */
function useContainerWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** A log-scale strip plot: one dot per team paid in US dollars, grouped into
 *  a lane per status. Recharts has no log-scale scatter with this kind of
 *  jittered dodging, so this is hand-drawn SVG — the same approach the
 *  original dashboard this page is based on used. */
function MoneyScatter({
  openId,
  visibleIds,
  onDotClick,
  onLabelClick,
}: {
  openId: string | null;
  visibleIds: Set<string>;
  onDotClick: (id: string) => void;
  onLabelClick: (s: Status) => void;
}) {
  const [ref, width] = useContainerWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ row: Winner; x: number; y: number } | null>(null);
  const points = useMemo(() => WINNERS.filter(r => Boolean(r.prizeUsd)), []);

  const W = Math.max(300, width || 600);
  const margin = { l: 112, r: 18, t: 8, b: 26 };
  const bandH = 50;
  const H = margin.t + margin.b + bandH * STATUSES.length;
  const domain: [number, number] = [150, 120000];
  const logX = (v: number) =>
    margin.l + ((Math.log(v) - Math.log(domain[0])) / (Math.log(domain[1]) - Math.log(domain[0]))) * (W - margin.l - margin.r);
  const laneY = (s: Status) => margin.t + STATUSES.indexOf(s) * bandH + bandH / 2;
  const ticks = [200, 1000, 5000, 10000, 50000, 100000].filter(t => logX(t) <= W - margin.r);
  const tickLabel = (t: number) => (t >= 1000 ? `$${t / 1000}k` : `$${t}`);
  const rad = Math.max(4, Math.min(6, W / 120));

  // Dodge overlapping dots within a lane, same stacking idea as the hbar
  // chart's "nudge up/down until clear" approach.
  const placed = useMemo(() => {
    const byLane: Record<string, [number, number][]> = {};
    const out = new Map<string, { cx: number; cy: number }>();
    [...points].sort((a, b) => (a.prizeUsd as number) - (b.prizeUsd as number)).forEach(p => {
      const cx = logX(p.prizeUsd as number);
      const lane = p.status;
      byLane[lane] = byLane[lane] || [];
      const mid = laneY(lane);
      let k = 0;
      let cy = mid;
      for (;;) {
        const off = (k === 0 ? 0 : (k % 2 ? 1 : -1) * Math.ceil(k / 2)) * (rad * 2 + 1);
        cy = mid + off;
        const clear = !byLane[lane].some(([qx, qy]) => Math.hypot(qx - cx, qy - cy) < rad * 2 + 0.5);
        if (clear || Math.abs(off) > bandH / 2 - rad) break;
        k++;
      }
      byLane[lane].push([cx, cy]);
      out.set(p.id, { cx, cy });
    });
    return out;
  }, [points, W]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.chart} ref={ref} style={{ position: 'relative', minHeight: H }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={logX(t)} x2={logX(t)} y1={margin.t} y2={H - margin.b} stroke="var(--hairline)" />
            <text x={logX(t)} y={H - margin.b + 16} textAnchor="middle" fontSize={11} fill="var(--ink-400)">
              {tickLabel(t)}
            </text>
          </g>
        ))}
        {STATUSES.map(s => (
          <text
            key={s}
            x={margin.l - 10}
            y={laneY(s)}
            dy="0.35em"
            textAnchor="end"
            fontSize={12}
            fill="var(--ink-700)"
            style={{ cursor: 'pointer' }}
            onClick={() => onLabelClick(s)}
          >
            {s}
          </text>
        ))}
        {points.map(p => {
          const pos = placed.get(p.id);
          if (!pos) return null;
          const dim = !visibleIds.has(p.id);
          return (
            <circle
              key={p.id}
              cx={pos.cx}
              cy={pos.cy}
              r={openId === p.id ? rad + 2 : rad}
              fill={STATUS_COLOR[p.status]}
              stroke={openId === p.id ? 'var(--ink-900)' : 'var(--white)'}
              strokeWidth={openId === p.id ? 2 : 1}
              opacity={dim ? 0.2 : 1}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHover({ row: p, x: pos.cx, y: pos.cy })}
              onMouseLeave={() => setHover(null)}
              onClick={() => onDotClick(p.id)}
            />
          );
        })}
      </svg>
      {hover && (
        <div
          className={styles.scatterTip}
          style={{ left: Math.min(hover.x + 12, W - 180), top: Math.max(0, hover.y - 34) }}
        >
          <span className={styles.scatterTipMuted}>
            {hover.row.programme} · {hover.row.year}
          </span>
          <strong>{hover.row.name}</strong>
          <span>
            {fmtUsd(hover.row.prizeUsd as number)} · {hover.row.status}
          </span>
        </div>
      )}
    </div>
  );
}
