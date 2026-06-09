import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TOKENOMICS_ALLOCATION,
  USDC_ROUTING,
  CONTRACTS,
  TOKEN_SPEC,
  ALLOCATION_WALLETS,
  ALLOCATION_EXPECTED_SYN,
  LEGAL_DISCLAIMER,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { Section, SectionHeader, GlassCard, Pill } from "./Primitives";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ─────────────────────────────────────────────────────────────────────────
 * Tokenomics Donut Charts
 *
 * Features:
 *  • Two donut charts (Supply Allocation, USDC Routing) with hover tooltips
 *  • LIVE / PARTIAL / PENDING filter — toggles slices & table rows
 *  • Data freshness badge with auto-updating "synced X ago" + refresh
 *  • Hover tooltips on every Verify ↗ link explaining which Avascan fields to check
 *  • CSV export button for the token distribution table
 *  • Reconciliation panel listing every runtime guard check + mismatch report
 * ────────────────────────────────────────────────────────────────────── */

type SliceStatus = "LIVE" | "PARTIAL" | "PENDING";

type AllocationMeta = {
  status: SliceStatus;
  lock: string;
  color: string;
};

const STATUS_DEFINITIONS: Record<SliceStatus, { title: string; body: string }> = {
  LIVE: {
    title: "LIVE — verifiable right now",
    body:
      "Wallet exists on Avalanche C-Chain and its current SYN or USDC balance can be read directly from the contract. No trust required — open Avascan and confirm.",
  },
  PARTIAL: {
    title: "PARTIAL — partially deployed",
    body:
      "Some of this allocation is already in use on-chain (for example, seeded into the SYN/USDC pool). The remainder is held in the public wallet and is fully visible.",
  },
  PENDING: {
    title: "PENDING — public wallet, unlocks gated",
    body:
      "The wallet is public and its balance is visible, but funds cannot move until a governance vote or vesting milestone unlocks them. No silent transfers possible.",
  },
};

const ALLOC_META: Record<string, AllocationMeta> = {
  "Membership Distribution": {
    status: "LIVE",
    lock: "Distributing via Sale",
    color: "oklch(0.78 0.14 80)",
  },
  "Vault Reserve": {
    status: "LIVE",
    lock: "Locked · governance release",
    color: "oklch(0.34 0.06 255)",
  },
  Founder: {
    status: "LIVE",
    lock: "12-mo cliff · 36-mo vest",
    color: "oklch(0.55 0.12 30)",
  },
  Liquidity: {
    status: "PARTIAL",
    lock: "Seeded LP · reinforcement ongoing",
    color: "oklch(0.62 0.13 220)",
  },
  Partnerships: {
    status: "PENDING",
    lock: "Public unlock required",
    color: "oklch(0.70 0.10 110)",
  },
  Contributors: {
    status: "LIVE",
    lock: "Held for builder payments",
    color: "oklch(0.58 0.10 300)",
  },
  "Future Ecosystem": {
    status: "PENDING",
    lock: "Reserved · may be burned by vote",
    color: "oklch(0.55 0.03 260)",
  },
};

const ALL_STATUSES: SliceStatus[] = ["LIVE", "PARTIAL", "PENDING"];

// ── Verify-link tooltip copy ────────────────────────────────────────────
// Tells the visitor exactly which Avascan page they'll land on and which
// fields to read to confirm what the donut/table claims.
function verifyTooltip(kind: "supply" | "routing", label: string): { title: string; body: string } {
  if (kind === "supply") {
    return {
      title: `Open ${label} wallet on Avascan`,
      body:
        "On the explorer page check: 1) the SYN token balance in the Tokens tab matches the Expected SYN column, 2) the transfer history shows no admin-style movements, and 3) the wallet has no contract code (it is a plain EOA — no hidden logic).",
    };
  }
  return {
    title: `Open ${label} on Avascan`,
    body:
      "On the explorer page check: 1) incoming USDC transfers come from the Membership Sale contract, 2) the per-tx amount matches this slice's % of the buyer's purchase, and 3) outflows (if any) are consistent with the wallet's purpose (LP deposit, builder payment, Vault accumulation).",
  };
}

// ── Runtime canonical-data guard ────────────────────────────────────────
type GuardCheck = { id: string; label: string; ok: boolean; detail?: string };
type GuardResult = { ok: boolean; checks: GuardCheck[]; reasons: string[] };

function validateCanonicalData(): GuardResult {
  const checks: GuardCheck[] = [];

  const supplyPct = TOKENOMICS_ALLOCATION.reduce((s, a) => s + a.pct, 0);
  checks.push({
    id: "supply-pct",
    label: "Supply allocation sums to 100%",
    ok: Math.abs(supplyPct - 100) <= 0.001,
    detail: `got ${supplyPct}%`,
  });

  const supplySyn = TOKENOMICS_ALLOCATION.reduce((s, a) => s + a.syn, 0);
  checks.push({
    id: "supply-syn",
    label: `Supply allocation sums to ${TOKEN_SPEC.totalSupply.toLocaleString("en-US")} SYN`,
    ok: supplySyn === TOKEN_SPEC.totalSupply,
    detail: `got ${supplySyn.toLocaleString("en-US")}`,
  });

  const missingWallets = TOKENOMICS_ALLOCATION.filter((a) => !ALLOCATION_WALLETS[a.label]).map(
    (a) => a.label,
  );
  checks.push({
    id: "alloc-wallets",
    label: "Every supply slice has a public wallet",
    ok: missingWallets.length === 0,
    detail: missingWallets.length ? `missing: ${missingWallets.join(", ")}` : "all 7 mapped",
  });

  const missingMeta = TOKENOMICS_ALLOCATION.filter((a) => !ALLOC_META[a.label]).map((a) => a.label);
  checks.push({
    id: "alloc-meta",
    label: "Every supply slice has a status + lock label",
    ok: missingMeta.length === 0,
    detail: missingMeta.length ? `missing: ${missingMeta.join(", ")}` : "all 7 labeled",
  });

  const expectedDrift = TOKENOMICS_ALLOCATION.filter((a) => {
    const e = ALLOCATION_EXPECTED_SYN[a.label];
    return e !== undefined && e !== a.syn;
  }).map((a) => a.label);
  checks.push({
    id: "expected-drift",
    label: "Expected SYN matches allocation table",
    ok: expectedDrift.length === 0,
    detail: expectedDrift.length ? `drift on: ${expectedDrift.join(", ")}` : "no drift",
  });

  const routingPct = USDC_ROUTING.reduce((s, r) => s + r.pct, 0);
  checks.push({
    id: "routing-sum",
    label: "USDC routing sums to 100%",
    ok: routingPct === 100,
    detail: `got ${routingPct}%`,
  });

  const expectedRouting: Record<string, number> = {
    VAULT_WALLET: 70,
    LIQUIDITY_WALLET: 20,
    OPERATIONS_WALLET: 10,
  };
  const routingDrift = USDC_ROUTING.filter((r) => expectedRouting[r.key] !== r.pct).map(
    (r) => `${r.key}=${r.pct}% (expected ${expectedRouting[r.key]}%)`,
  );
  checks.push({
    id: "routing-canon",
    label: "Canonical 70 / 20 / 10 routing preserved",
    ok: routingDrift.length === 0,
    detail: routingDrift.length ? routingDrift.join(" · ") : "Vault 70 / Liquidity 20 / Operations 10",
  });

  const missingContracts = USDC_ROUTING.filter(
    (r) => !CONTRACTS[r.key as keyof typeof CONTRACTS],
  ).map((r) => r.key);
  checks.push({
    id: "routing-contracts",
    label: "Every routing wallet has a CONTRACTS address",
    ok: missingContracts.length === 0,
    detail: missingContracts.length ? `missing: ${missingContracts.join(", ")}` : "all 3 mapped",
  });

  // Cross-label check: the "Liquidity" SYN slice and the "Liquidity Wallet"
  // USDC routing share a wallet — confirm they reconcile to the same address.
  const lpSynAddr = ALLOCATION_WALLETS["Liquidity"];
  const lpUsdcAddr = CONTRACTS.LIQUIDITY_WALLET;
  checks.push({
    id: "cross-liquidity",
    label: "Liquidity SYN allocation wallet === USDC Liquidity Wallet",
    ok:
      !!lpSynAddr &&
      !!lpUsdcAddr &&
      lpSynAddr.toLowerCase() === lpUsdcAddr.toLowerCase(),
    detail:
      lpSynAddr && lpUsdcAddr
        ? `${lpSynAddr.slice(0, 8)}… vs ${lpUsdcAddr.slice(0, 8)}…`
        : "address missing",
  });

  // Cross-label check: the "Vault Reserve" SYN slice and the "Vault Wallet"
  // USDC routing share the same wallet address.
  const vaultSynAddr = ALLOCATION_WALLETS["Vault Reserve"];
  const vaultUsdcAddr = CONTRACTS.VAULT_WALLET;
  checks.push({
    id: "cross-vault",
    label: "Vault Reserve SYN wallet === USDC Vault Wallet",
    ok:
      !!vaultSynAddr &&
      !!vaultUsdcAddr &&
      vaultSynAddr.toLowerCase() === vaultUsdcAddr.toLowerCase(),
    detail:
      vaultSynAddr && vaultUsdcAddr
        ? `${vaultSynAddr.slice(0, 8)}… vs ${vaultUsdcAddr.slice(0, 8)}…`
        : "address missing",
  });

  const reasons = checks.filter((c) => !c.ok).map((c) => `${c.label} — ${c.detail ?? ""}`);
  return { ok: reasons.length === 0, checks, reasons };
}

function GuardBanner({ reasons }: { reasons: string[] }) {
  return (
    <GlassCard className="p-4 border-amber-500/40 bg-amber-500/5">
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-amber-600 dark:text-amber-400 mb-2">
        Canonical data check failed
      </div>
      <ul className="list-disc pl-5 space-y-1 text-xs text-foreground/80">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-muted-foreground">
        The donut chart will not render until syndicate-config.ts matches the canonical protocol model
        (1B SYN supply, 70 / 20 / 10 USDC routing, and the seven public allocations).
      </p>
    </GlassCard>
  );
}

// ── SVG arc geometry ────────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutArc(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number,
) {
  const sweep = Math.min(end - start, 359.999);
  const a = start;
  const b = start + sweep;
  const largeArc = sweep > 180 ? 1 : 0;
  const p0 = polar(cx, cy, rOuter, a);
  const p1 = polar(cx, cy, rOuter, b);
  const p2 = polar(cx, cy, rInner, b);
  const p3 = polar(cx, cy, rInner, a);
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p3.x} ${p3.y}`,
    "Z",
  ].join(" ");
}

type DonutSlice = { key: string; pct: number; color: string; status: SliceStatus };

function Donut({
  slices,
  size = 240,
  thickness = 36,
  active,
  onHover,
  enabledStatuses,
  centerTop,
  centerMain,
  centerSub,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  active: string | null;
  onHover: (k: string | null) => void;
  enabledStatuses: Set<SliceStatus>;
  centerTop: string;
  centerMain: string;
  centerSub: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size / 2 - 4;
  const rInner = rOuter - thickness;
  let cursor = 0;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto max-w-[280px] mx-auto"
      role="img"
      aria-label="Allocation donut chart"
    >
      {slices.map((s) => {
        const start = (cursor / 100) * 360;
        const end = ((cursor + s.pct) / 100) * 360;
        cursor += s.pct;
        const filteredOut = !enabledStatuses.has(s.status);
        const dimmed = (active && active !== s.key) || filteredOut;
        return (
          <path
            key={s.key}
            d={donutArc(cx, cy, rOuter, rInner, start, end)}
            fill={s.color}
            opacity={dimmed ? (filteredOut ? 0.1 : 0.25) : 1}
            stroke="white"
            strokeWidth={1.25}
            onMouseEnter={() => onHover(s.key)}
            onMouseLeave={() => onHover(null)}
            style={{ transition: "opacity 160ms ease" }}
          >
            <title>{`${s.key} · ${s.pct}% · ${s.status}`}</title>
          </path>
        );
      })}
      <g pointerEvents="none">
        <text
          x={cx}
          y={cy - 14}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, letterSpacing: 2, fontFamily: "var(--font-mono, ui-monospace)" }}
        >
          {centerTop.toUpperCase()}
        </text>
        <text
          x={cx}
          y={cy + 6}
          textAnchor="middle"
          className="fill-foreground"
          style={{ fontSize: 18, fontWeight: 600, fontFamily: "var(--font-mono, ui-monospace)" }}
        >
          {centerMain}
        </text>
        <text
          x={cx}
          y={cy + 22}
          textAnchor="middle"
          className="fill-muted-foreground"
          style={{ fontSize: 9, letterSpacing: 1.5, fontFamily: "var(--font-mono, ui-monospace)" }}
        >
          {centerSub}
        </text>
      </g>
    </svg>
  );
}

function StatusPill({ s }: { s: SliceStatus }) {
  const tone = s === "LIVE" ? "success" : s === "PARTIAL" ? "gold" : "muted";
  const def = STATUS_DEFINITIONS[s];
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-help" tabIndex={0} aria-label={def.title}>
          <Pill tone={tone}>{s}</Pill>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[260px] text-left">
        <div className="mono text-[9px] uppercase tracking-[0.18em] opacity-80 mb-1">
          {def.title}
        </div>
        <div className="text-[11px] leading-snug">{def.body}</div>
      </TooltipContent>
    </Tooltip>
  );
}

function VerifyLink({
  href,
  kind,
  label,
}: {
  href: string;
  kind: "supply" | "routing";
  label: string;
}) {
  const tip = verifyTooltip(kind, label);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground hover:text-[var(--gold)]"
        >
          Verify ↗
        </a>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-left">
        <div className="mono text-[9px] uppercase tracking-[0.18em] opacity-80 mb-1">
          {tip.title}
        </div>
        <div className="text-[11px] leading-snug">{tip.body}</div>
      </TooltipContent>
    </Tooltip>
  );
}

function fmtSyn(n: number) {
  return n.toLocaleString("en-US");
}

// ── Status filter toolbar ───────────────────────────────────────────────
function StatusFilter({
  enabled,
  toggle,
  reset,
}: {
  enabled: Set<SliceStatus>;
  toggle: (s: SliceStatus) => void;
  reset: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Filter:
      </span>
      {ALL_STATUSES.map((s) => {
        const on = enabled.has(s);
        const tone =
          s === "LIVE"
            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
            : s === "PARTIAL"
            ? "border-amber-500/40 text-amber-700 dark:text-amber-400"
            : "border-border/60 text-muted-foreground";
        return (
          <button
            key={s}
            type="button"
            onClick={() => toggle(s)}
            aria-pressed={on}
            className={`mono text-[9px] uppercase tracking-[0.18em] rounded-full border px-2 py-0.5 transition ${tone} ${
              on ? "bg-background" : "opacity-40 line-through"
            }`}
          >
            {s}
          </button>
        );
      })}
      <button
        type="button"
        onClick={reset}
        className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        reset
      </button>
    </div>
  );
}

// ── Data freshness badge ────────────────────────────────────────────────
function FreshnessBadge({
  syncedAt,
  onRefresh,
}: {
  syncedAt: Date;
  onRefresh: () => void;
}) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const secs = Math.max(0, Math.floor((Date.now() - syncedAt.getTime()) / 1000));
  const rel =
    secs < 60
      ? `${secs}s ago`
      : secs < 3600
      ? `${Math.floor(secs / 60)}m ago`
      : `${Math.floor(secs / 3600)}h ago`;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onRefresh}
          className="mono inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
        >
          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Snapshot · synced {rel}
          <span className="opacity-60">· refresh</span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-left">
        <div className="mono text-[9px] uppercase tracking-[0.18em] opacity-80 mb-1">
          Onchain snapshot
        </div>
        <div className="text-[11px] leading-snug">
          Synced at {syncedAt.toUTCString()}. Click to re-read the canonical config and re-run guard
          checks. Per-wallet live balances on the long-form table below refresh on their own every
          60 seconds.
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

// ── CSV export ──────────────────────────────────────────────────────────
function csvEscape(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportDistributionCsv() {
  const headers = ["Allocation", "%", "SYN", "Lock", "Status", "Wallet", "ExplorerURL"];
  const rows = TOKENOMICS_ALLOCATION.map((a) => {
    const meta = ALLOC_META[a.label];
    const addr = ALLOCATION_WALLETS[a.label] ?? "";
    const url = addr ? explorerUrlForAddress(addr) ?? "" : "";
    return [a.label, a.pct, a.syn, meta?.lock ?? "", meta?.status ?? "", addr, url];
  });
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = url;
  a.download = `syndicate-token-distribution-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Supply Allocation Donut ─────────────────────────────────────────────
function SupplyDonut({ enabledStatuses }: { enabledStatuses: Set<SliceStatus> }) {
  const [active, setActive] = useState<string | null>(null);
  const slices: DonutSlice[] = TOKENOMICS_ALLOCATION.map((a) => ({
    key: a.label,
    pct: a.pct,
    color: ALLOC_META[a.label]?.color ?? "oklch(0.55 0.03 260)",
    status: ALLOC_META[a.label]?.status ?? "PENDING",
  }));
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
          Supply Allocation
        </div>
        <div className="flex items-center gap-2">
          <Pill tone="navy">{TOKEN_SPEC.symbol} · 1B fixed</Pill>
          <button
            type="button"
            onClick={exportDistributionCsv}
            className="mono inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
            aria-label="Export token distribution as CSV"
          >
            ⬇ CSV
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_1fr] gap-5 items-start">
        <Donut
          slices={slices}
          active={active}
          onHover={setActive}
          enabledStatuses={enabledStatuses}
          centerTop="Total Supply"
          centerMain="1,000,000,000"
          centerSub="SYN · Avalanche"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                <th className="py-2 pr-2">Allocation</th>
                <th className="py-2 px-1 text-right">%</th>
                <th className="py-2 px-1 text-right">SYN</th>
                <th className="py-2 px-1">Lock</th>
                <th className="py-2 pl-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {TOKENOMICS_ALLOCATION.map((a) => {
                const meta = ALLOC_META[a.label];
                const status = meta?.status ?? "PENDING";
                if (!enabledStatuses.has(status)) return null;
                const addr = ALLOCATION_WALLETS[a.label];
                const url = addr ? explorerUrlForAddress(addr) : null;
                const dimmed = active && active !== a.label;
                return (
                  <tr
                    key={a.label}
                    onMouseEnter={() => setActive(a.label)}
                    onMouseLeave={() => setActive(null)}
                    className={`border-b border-border/20 last:border-0 transition-opacity ${
                      dimmed ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <td className="py-2 pr-2 align-top">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-2.5 rounded-sm shrink-0"
                          style={{ background: meta?.color }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground truncate text-[11px]">
                            {a.label}
                          </div>
                          {url && <VerifyLink href={url} kind="supply" label={a.label} />}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right mono align-top text-gradient-gold font-semibold">
                      {a.pct}%
                    </td>
                    <td className="py-2 px-1 text-right mono align-top text-muted-foreground">
                      {fmtSyn(a.syn)}
                    </td>
                    <td className="py-2 px-1 text-[10px] text-muted-foreground align-top">
                      {meta?.lock}
                    </td>
                    <td className="py-2 pl-1 align-top">
                      {meta && <StatusPill s={meta.status} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        Hover any <span className="font-semibold">LIVE / PARTIAL / PENDING</span> pill for the
        verification meaning, or any <span className="font-semibold">Verify ↗</span> link for the
        exact fields to check on Avascan. Use the filter above to isolate slices by verification
        status, or export the full distribution as CSV.
      </p>
    </GlassCard>
  );
}

// ── USDC Routing Donut (70 / 20 / 10) ───────────────────────────────────
function RoutingDonut({ enabledStatuses }: { enabledStatuses: Set<SliceStatus> }) {
  const [active, setActive] = useState<string | null>(null);
  const colorFor = (key: string) =>
    key === "VAULT_WALLET"
      ? "oklch(0.78 0.14 80)"
      : key === "LIQUIDITY_WALLET"
      ? "oklch(0.34 0.06 255)"
      : "oklch(0.62 0.13 220)";
  const slices: DonutSlice[] = USDC_ROUTING.map((r) => ({
    key: r.key,
    pct: r.pct,
    color: colorFor(r.key),
    status: "LIVE",
  }));
  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
          USDC Routing
        </div>
        <Pill tone="success">LIVE · enforced on-chain</Pill>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,220px)_1fr] gap-5 items-start">
        <Donut
          slices={slices}
          active={active}
          onHover={setActive}
          enabledStatuses={enabledStatuses}
          centerTop="Atomic Split"
          centerMain="70 / 20 / 10"
          centerSub="per USDC purchase"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                <th className="py-2 pr-2">Wallet</th>
                <th className="py-2 px-1 text-right">Split</th>
                <th className="py-2 px-1">Purpose</th>
                <th className="py-2 pl-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {USDC_ROUTING.map((r) => {
                if (!enabledStatuses.has("LIVE")) return null;
                const addr = CONTRACTS[r.key];
                const url = explorerUrlForAddress(addr);
                const dimmed = active && active !== r.key;
                const purpose =
                  r.key === "VAULT_WALLET"
                    ? "Long-term Vault reserve."
                    : r.key === "LIQUIDITY_WALLET"
                    ? "Reinforces SYN/USDC depth on Trader Joe."
                    : "Build, infra, contributors.";
                return (
                  <tr
                    key={r.key}
                    onMouseEnter={() => setActive(r.key)}
                    onMouseLeave={() => setActive(null)}
                    className={`border-b border-border/20 last:border-0 transition-opacity ${
                      dimmed ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <td className="py-2 pr-2 align-top">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="size-2.5 rounded-sm shrink-0"
                          style={{ background: colorFor(r.key) }}
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-foreground text-[11px]">
                            {r.label}
                          </div>
                          {url && <VerifyLink href={url} kind="routing" label={r.label} />}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-1 text-right mono align-top text-gradient-gold font-semibold">
                      {r.pct}%
                    </td>
                    <td className="py-2 px-1 text-[10px] text-muted-foreground align-top">
                      {purpose}
                    </td>
                    <td className="py-2 pl-1 align-top">
                      <StatusPill s="LIVE" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">
        Every USDC paid into the Membership Sale is split atomically by the contract in the same
        transaction as SYN delivery. The 70 / 20 / 10 ratio is enforced on-chain — not by a multisig,
        not by an operator.
      </p>
    </GlassCard>
  );
}

// ── Reconciliation panel ────────────────────────────────────────────────
function ReconciliationPanel({ checks }: { checks: GuardCheck[] }) {
  const pass = checks.filter((c) => c.ok).length;
  const fail = checks.length - pass;
  return (
    <GlassCard className="p-5 mt-5">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
          Reconciliation
        </div>
        <div className="flex items-center gap-2">
          <span className="mono text-[9px] uppercase tracking-[0.18em] rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-0.5">
            {pass} pass
          </span>
          <span
            className={`mono text-[9px] uppercase tracking-[0.18em] rounded-full border px-2 py-0.5 ${
              fail === 0
                ? "border-border/60 text-muted-foreground"
                : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
            }`}
          >
            {fail} fail
          </span>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
        Each line is a runtime guard that runs before the donut renders. If any check fails the chart
        is replaced with a warning banner — you should never see drift between the donut routing and
        the allocation table labels.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
              <th className="py-2 pr-2">Check</th>
              <th className="py-2 px-1">Detail</th>
              <th className="py-2 pl-1 text-right">Result</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id} className="border-b border-border/20 last:border-0 align-top">
                <td className="py-2 pr-2 text-[11px] text-foreground/90">{c.label}</td>
                <td className="py-2 px-1 mono text-[10px] text-muted-foreground">{c.detail}</td>
                <td className="py-2 pl-1 text-right">
                  <span
                    className={`mono text-[9px] uppercase tracking-[0.18em] rounded-full border px-2 py-0.5 ${
                      c.ok
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {c.ok ? "PASS" : "FAIL"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}

// ── Compliance disclaimer ───────────────────────────────────────────────
function ComplianceDisclaimer() {
  const items: { title: string; body: string }[] = [
    {
      title: "Utility access only",
      body:
        "SYN is an experimental utility membership token. Holding SYN grants access to the membership archive, on-chain identity, and future protocol features — nothing more.",
    },
    {
      title: "No profit promises",
      body:
        "Nothing on this page is a forecast, dividend, yield product, profit-share, share of revenue, or investment return. The Syndicate does not promise returns of any kind.",
    },
    {
      title: "On-chain verifiability scope",
      body:
        "Every figure on this chart maps to a public wallet or contract on Avalanche C-Chain. Live balances may differ from expected balances as the Membership Sale distributes SYN and the LP pool absorbs liquidity. Always cross-check on Avascan.",
    },
    {
      title: "Risk of total loss",
      body:
        "Participation in early-stage on-chain protocols can result in total loss of funds. Only participate with amounts you can afford to lose and that comply with your local regulations.",
    },
  ];
  return (
    <GlassCard className="p-5 mt-5">
      <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-3">
        Compliance & verifiability
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i) => (
          <div key={i.title} className="rounded-md border border-border/40 p-3">
            <div className="text-xs font-semibold text-foreground mb-1">{i.title}</div>
            <div className="text-[11px] text-muted-foreground leading-relaxed">{i.body}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted-foreground italic leading-relaxed">
        {LEGAL_DISCLAIMER}
      </p>
    </GlassCard>
  );
}

export function TokenomicsDonut() {
  const [nonce, setNonce] = useState(0);
  const [syncedAt, setSyncedAt] = useState<Date>(() => new Date());
  const guard = useMemo(() => validateCanonicalData(), [nonce]);

  const [enabled, setEnabled] = useState<Set<SliceStatus>>(() => new Set(ALL_STATUSES));
  const toggle = useCallback((s: SliceStatus) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      // Never allow zero-selection — that would hide everything silently.
      if (next.size === 0) return new Set(ALL_STATUSES);
      return next;
    });
  }, []);
  const reset = useCallback(() => setEnabled(new Set(ALL_STATUSES)), []);

  const refresh = useCallback(() => {
    setSyncedAt(new Date());
    setNonce((n) => n + 1);
  }, []);

  return (
    <TooltipProvider delayDuration={120}>
      <Section id="tokenomics-donut">
        <SectionHeader
          eyebrow="At a glance"
          title={
            <>
              Where every <span className="text-gradient-gold">SYN</span> and every{" "}
              <span className="text-gradient-gold">USDC</span> goes
            </>
          }
          description="Two views of the same protocol: the fixed 1,000,000,000 SYN supply across seven public wallets, and the canonical 70 / 20 / 10 USDC routing enforced by the Membership Sale contract. Hover any status pill, Verify link, or wallet row for verification context."
        />

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <StatusFilter enabled={enabled} toggle={toggle} reset={reset} />
          <FreshnessBadge syncedAt={syncedAt} onRefresh={refresh} />
        </div>

        {!guard.ok && (
          <div className="mb-5">
            <GuardBanner reasons={guard.reasons} />
          </div>
        )}
        {guard.ok && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SupplyDonut enabledStatuses={enabled} />
              <RoutingDonut enabledStatuses={enabled} />
            </div>
            <ReconciliationPanel checks={guard.checks} />
            <ComplianceDisclaimer />
          </>
        )}
      </Section>
    </TooltipProvider>
  );
}
