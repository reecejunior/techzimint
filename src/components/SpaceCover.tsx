import type { SpaceType } from '@/lib/types';

/**
 * An illustrated cover for a space that has no photo of its own: a small
 * skyline, drawn from the space's id so every card looks different but the
 * same card always looks the same. Each town has its own colours.
 */

const PALETTES: Record<string, [string, string]> = {
  Harare: ['#C24C03', '#F39A55'],
  Bulawayo: ['#0E6B63', '#5DB3A5'],
  Mutare: ['#43700E', '#A3C760'],
};
const FALLBACK: [string, string] = ['#57524C', '#A8A29E'];

/** Small deterministic random numbers from a string (mulberry32). */
function seeded(id: string): () => number {
  let a = 0;
  for (let i = 0; i < id.length; i++) a = (Math.imul(a ^ id.charCodeAt(i), 2654435761) + i) | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Block {
  x: number;
  w: number;
  h: number;
  windows: { x: number; y: number }[];
}

function skyline(rand: () => number, baseline: number, maxH: number, minH: number): Block[] {
  const blocks: Block[] = [];
  let x = -10;
  while (x < 410) {
    const w = 26 + Math.floor(rand() * 34);
    const h = minH + Math.floor(rand() * (maxH - minH));
    const windows: { x: number; y: number }[] = [];
    for (let wy = baseline - h + 10; wy < baseline - 12; wy += 13) {
      for (let wx = x + 7; wx < x + w - 8; wx += 11) {
        if (rand() > 0.45) windows.push({ x: wx, y: wy });
      }
    }
    blocks.push({ x, w, h, windows });
    x += w + 3 + Math.floor(rand() * 8);
  }
  return blocks;
}

export default function SpaceCover({ id, town, type }: { id: string; town: string; type: SpaceType }) {
  const [deep, light] = PALETTES[town] ?? FALLBACK;
  const rand = seeded(id);
  const gradId = `g-${id}`;
  const sunX = 60 + Math.floor(rand() * 280);
  const sunY = 34 + Math.floor(rand() * 20);
  const back = skyline(rand, 170, 110, 55);
  const front = skyline(rand, 170, 75, 30);

  return (
    <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      <rect width="400" height="160" fill={`url(#${gradId})`} />
      <circle cx={sunX} cy={sunY} r={type === 'cafe' ? 16 : 22} fill="#fff" opacity="0.28" />
      <circle cx={sunX} cy={sunY} r={type === 'cafe' ? 30 : 38} fill="#fff" opacity="0.08" />
      {back.map((b, i) => (
        <rect key={`b${i}`} x={b.x} y={170 - b.h} width={b.w} height={b.h} rx="3" fill="#fff" opacity="0.14" />
      ))}
      {front.map((b, i) => (
        <g key={`f${i}`}>
          <rect x={b.x} y={170 - b.h} width={b.w} height={b.h} rx="3" fill={deep} opacity="0.55" />
          {b.windows.map((w, j) => (
            <rect key={j} x={w.x} y={w.y} width="5" height="6" rx="1" fill="#fff" opacity="0.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}
