// WalletAvatar — deterministic, generative avatar for a wallet address.
//
// Purely a function of the address string: same wallet → same avatar, on
// server and client (SSR-safe, no Date/Math.random). Renders a GitHub-style
// mirrored block sigil over a dark base, tinted with an on-brand accent
// (gold / navy / amber / verify-cyan / emerald / violet) chosen from the hash.
//
// This is decoration only — it never encodes or implies any on-chain fact.

type AccentStop = { from: string; to: string };

// On-brand accent palette (oklch), curated to sit on the dark cockpit base.
const ACCENTS: AccentStop[] = [
  { from: "oklch(0.82 0.14 80)", to: "oklch(0.70 0.13 60)" },   // gold
  { from: "oklch(0.62 0.13 255)", to: "oklch(0.50 0.12 265)" }, // navy
  { from: "oklch(0.80 0.13 70)", to: "oklch(0.66 0.14 45)" },   // amber
  { from: "oklch(0.74 0.12 200)", to: "oklch(0.62 0.11 215)" }, // verify cyan
  { from: "oklch(0.72 0.14 155)", to: "oklch(0.58 0.13 165)" }, // emerald
  { from: "oklch(0.66 0.13 300)", to: "oklch(0.54 0.12 310)" }, // violet
];

function hashAddress(addr: string): number {
  let h = 2166136261;
  const s = addr.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Build a 5×5 mirrored cell map (columns 0–2 mirrored onto 4–3) from hash bits.
function cellMap(hash: number): boolean[] {
  const cells: boolean[] = new Array(25).fill(false);
  let bits = hash;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 3; col++) {
      const on = (bits & 1) === 1;
      bits = (bits >>> 1) | (Math.imul(bits, 2654435761) & 0x80000000);
      cells[row * 5 + col] = on;
      cells[row * 5 + (4 - col)] = on; // mirror
    }
  }
  return cells;
}

export function WalletAvatar({
  address,
  size = 64,
  className = "",
}: {
  address?: string | null;
  size?: number;
  className?: string;
}) {
  // Placeholder for disconnected / no address — dormant dashed ring.
  if (!address) {
    return (
      <div
        className={`shrink-0 rounded-2xl border border-dashed border-border/70 bg-muted/20 flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <span className="size-2 rounded-full bg-muted-foreground/40" />
      </div>
    );
  }

  const hash = hashAddress(address);
  const accent = ACCENTS[hash % ACCENTS.length];
  const cells = cellMap(hash);
  const gid = `wa-${hash.toString(36)}`;

  return (
    <div
      className={`shrink-0 rounded-2xl border border-[var(--gold)]/25 overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 24px -12px rgba(0,0,0,0.7)",
      }}
      aria-hidden
    >
      <svg viewBox="0 0 5 5" width={size} height={size} role="img">
        <defs>
          <linearGradient id={`${gid}-bg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.24 0.02 260)" />
            <stop offset="100%" stopColor="oklch(0.16 0.02 265)" />
          </linearGradient>
          <linearGradient id={`${gid}-fg`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={accent.from} />
            <stop offset="100%" stopColor={accent.to} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="5" height="5" fill={`url(#${gid}-bg)`} />
        {cells.map((on, i) =>
          on ? (
            <rect
              key={i}
              x={i % 5}
              y={Math.floor(i / 5)}
              width="1"
              height="1"
              fill={`url(#${gid}-fg)`}
              rx="0.12"
            />
          ) : null,
        )}
      </svg>
    </div>
  );
}
