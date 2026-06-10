// ─────────────────────────────────────────────────────────────────────────
// DEV-ONLY preview fixtures for the connected /my-syndicate cockpit.
//
// WHY THIS EXISTS
//   Several connected member states are impossible to inspect (or screenshot)
//   in the Replit preview because they require a real Avalanche wallet with an
//   indexed purchase history: the member identity header, the wake behind you,
//   the seats around you, lit artifact memories, and rank. This module lets us
//   render those states deterministically for visual review.
//
// SAFETY CONTRACT (binding — do not weaken)
//   • Every fixture branch is gated behind `import.meta.env.DEV`. Vite replaces
//     this with the literal `false` in the production / deploy build, so the
//     branch is dead-code-eliminated and the fixture presets are tree-shaken.
//     NO fixture data ships to, or renders in, production.
//   • Activation additionally requires an explicit URL query flag
//     `?cockpit=<preset>`. With no flag (the normal case) every wrapper is a
//     pure pass-through to the real hook — the live data path is NOT altered.
//   • The flag is read from the router's parsed search, so it resolves
//     identically on server and client (no hydration mismatch). There is no
//     localStorage persistence, no nav link, and no route/sitemap entry — the
//     only way in is to type the param by hand in development.
//   • We synthesize ONLY the viewer's own identity + balances. We never
//     fabricate artifact supply, mint status, or any protocol truth — those
//     still come from the real on-chain reads. No contract or write paths.
// ─────────────────────────────────────────────────────────────────────────

import { useRouterState } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import {
  buildHolderIndex,
  useHolderIndex,
  type HolderIndex,
} from "@/lib/holder-index";
import type { PurchaseEvent } from "@/lib/activity-hooks";
import {
  useArchiveBalances,
  type ArchiveBalancesResult,
  type ArchiveBalanceRead,
} from "@/lib/archive-balances-hook";
import { useUserBalances } from "@/lib/sale-hooks";

export type CockpitPreset = "member1" | "member27";

type PresetConfig = {
  /** Member number whose seat we render. */
  memberNumber: number;
  /** Total indexed members (>= memberNumber) — drives the wake behind you. */
  totalMembers: number;
  /** Cumulative USDC for the viewer — derives their rank. */
  usdc: number;
  /** Cumulative SYN received (display only). */
  syn: number;
  /** Live SYN held (balanceOf), in base units (18 decimals). */
  synBalance: bigint;
  /** Live USDC held (balanceOf), in base units (6 decimals). */
  usdcBalance: bigint;
  /** Archive1155 balanceOf per token id — an artifact is "lit" when > 0n. */
  archive: Record<number, bigint>;
};

// First Signal = id 1 (uncapped), Patron Seal = id 3 (capped). See CockpitCollector.
const PRESETS: Record<CockpitPreset, PresetConfig> = {
  // First seat in the archive: no seat before you, First Signal held (lit),
  // Patron Seal not yet kept (dim).
  member1: {
    memberNumber: 1,
    totalMembers: 312,
    usdc: 100, // Vanguard
    syn: 10_000,
    synBalance: 10_000n * 10n ** 18n,
    usdcBalance: 240n * 10n ** 6n,
    archive: { 1: 1n, 3: 0n },
  },
  // Mid-archive seat: a real seat before and after yours, both artifacts held
  // (lit), a named secondary rank, and a large wake behind you.
  member27: {
    memberNumber: 27,
    totalMembers: 312,
    usdc: 500, // Patron
    syn: 50_000,
    synBalance: 50_000n * 10n ** 18n,
    usdcBalance: 1_180n * 10n ** 6n,
    archive: { 1: 2n, 3: 1n },
  },
};

// Deterministic, distinct, realistic-looking 20-byte address per seat. Pure
// function of the seat number so the viewer's address and their indexed record
// always agree.
function seatWallet(i: number): `0x${string}` {
  // splitmix64-style mixing, three 64-bit rounds concatenated, so entropy fills
  // the full 160-bit address space (otherwise small seats render as 0x0000…).
  const MASK64 = (1n << 64n) - 1n;
  let h = (BigInt(i) * 0x9e3779b97f4a7c15n + 0x1234567n) & MASK64;
  let acc = 0n;
  for (let k = 0; k < 3; k++) {
    h = (h ^ (h >> 30n)) & MASK64;
    h = (h * 0xbf58476d1ce4e5b9n) & MASK64;
    h = (h ^ (h >> 27n)) & MASK64;
    h = (h * 0x94d049bb133111ebn) & MASK64;
    h = (h ^ (h >> 31n)) & MASK64;
    acc = ((acc << 64n) ^ h) & ((1n << 160n) - 1n);
  }
  return `0x${acc.toString(16).padStart(40, "0")}` as `0x${string}`;
}

function resolvePreset(flag: unknown): CockpitPreset | null {
  return flag === "member1" || flag === "member27" ? flag : null;
}

/**
 * Active preview preset, or null. Returns null in any production build (the
 * `import.meta.env.DEV` gate constant-folds to false) and whenever the
 * `?cockpit=` flag is absent or unrecognised.
 */
function usePreviewPreset(): CockpitPreset | null {
  // Called unconditionally to satisfy the rules of hooks. `location.search` is
  // resolved on both server and client, so the value is stable across hydration.
  const flag = useRouterState({
    select: (s) => (s.location.search as Record<string, unknown> | undefined)?.cockpit,
  });
  if (!import.meta.env.DEV) return null;
  return resolvePreset(flag);
}

// ─── Fixture builders ──────────────────────────────────────────────────────

function buildPreviewIndex(cfg: PresetConfig, real: HolderIndex): HolderIndex {
  // Synthesize one purchase event per seat and feed them through the REAL
  // index builder, so the resulting shape, ordering, rank derivation, and
  // totals are exactly what production would produce.
  const events: PurchaseEvent[] = [];
  for (let i = 1; i <= cfg.totalMembers; i++) {
    const viewer = i === cfg.memberNumber;
    const usdc = viewer ? cfg.usdc : 25; // neighbours: Operator-tier, no amounts shown anyway
    const syn = viewer ? cfg.syn : 2_500;
    events.push({
      buyer: seatWallet(i),
      purchaseId: BigInt(i),
      usdcAmount: usdc,
      synAmount: syn,
      vaultAmount: usdc * 0.7,
      liquidityAmount: usdc * 0.2,
      operationsAmount: usdc * 0.1,
      blockNumber: BigInt(1_000_000 + i * 120),
      txHash: `0x${i.toString(16).padStart(64, "0")}`,
      logIndex: 0,
    });
  }

  const built = buildHolderIndex(events);
  const latest = [...built.ordered].sort((a, b) =>
    a.lastPurchaseBlock === b.lastPurchaseBlock
      ? 0
      : a.lastPurchaseBlock > b.lastPurchaseBlock
        ? -1
        : 1,
  );

  return {
    ...real,
    isLoading: false,
    isError: false,
    hasData: true,
    byWallet: built.byWallet,
    ordered: built.ordered,
    latest,
    totals: built.totals,
    getByWallet: (address?: string | null) =>
      address ? built.byWallet.get(address.toLowerCase()) : undefined,
  };
}

// ─── Wrapper hooks (pass-through unless a preset is active in dev) ──────────

export function useCockpitAccount(): {
  address: `0x${string}` | undefined;
  isConnected: boolean;
} {
  const real = useAccount();
  const preset = usePreviewPreset();
  if (import.meta.env.DEV && preset) {
    return { address: seatWallet(PRESETS[preset].memberNumber), isConnected: true };
  }
  return { address: real.address, isConnected: real.isConnected };
}

export function useCockpitHolderIndex(): HolderIndex {
  const real = useHolderIndex();
  const preset = usePreviewPreset();
  if (import.meta.env.DEV && preset) return buildPreviewIndex(PRESETS[preset], real);
  return real;
}

export function useCockpitUserBalances(): ReturnType<typeof useUserBalances> {
  const real = useUserBalances();
  const preset = usePreviewPreset();
  if (import.meta.env.DEV && preset) {
    return {
      ...real,
      isLoading: false,
      synBalance: PRESETS[preset].synBalance,
      usdcBalance: PRESETS[preset].usdcBalance,
    };
  }
  return real;
}

export function useCockpitArchiveBalances(
  ids: readonly number[],
): ArchiveBalancesResult {
  const real = useArchiveBalances(ids);
  const preset = usePreviewPreset();
  if (import.meta.env.DEV && preset) {
    const cfg = PRESETS[preset];
    const balances: Record<number, ArchiveBalanceRead> = {};
    let total = 0n;
    for (const id of ids) {
      const bal = cfg.archive[id] ?? 0n;
      total += bal;
      balances[id] = { id, balance: bal, error: null };
    }
    return {
      isLoading: false,
      isFetching: false,
      isError: false,
      connectedWallet: seatWallet(cfg.memberNumber),
      balances,
      totalKnown: total,
    };
  }
  return real;
}
