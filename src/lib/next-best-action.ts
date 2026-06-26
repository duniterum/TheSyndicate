// next-best-action — the protocol's journey backbone, extracted.
//
// This is the pure, reusable answer to "given who this wallet is right now,
// what should it do next?" It is NOT a UI surface and renders nothing. It
// formalizes decision logic that already lives, hardcoded and duplicated,
// inside cockpit components (CockpitNextMove's primary-step + ctaLabel
// ternaries) and the rank/progression helpers — without changing any visible
// behavior. The backbone is:
//
//     Identity State → Next Best Action → Protocol Actions → CTA/UI
//
// DOCTRINE (binding):
//   • Pure: no React, no hooks, no chain reads, no JSX, no side effects. The
//     selector consumes ALREADY-COMPUTED state; it never fetches anything.
//   • Ids only: output is an ordered list of ProtocolActionId. Labels, copy and
//     destinations come from protocol-actions.ts at render time — never here.
//   • Live-only: the selector may emit ONLY `live` / `live-unaudited` actions.
//     PREVIEW (e.g. Patron Seal), PENDING (referral / campaign / merch /
//     SeatRecord721 / marketplace) and SEALED (Sale V1 history) are NEVER
//     emitted. This is STRICTER than isLiveProtocolAction(), which also admits
//     `preview`.
//   • Output is always a subset of the registry's emittable actions.
//   • Recognition only: contribution-depth band is capital footprint, never the
//     whole identity and never a reward, payout, right, or rate change. "Reach
//     <band>" vs "Buy More SYN" is a label concern carried by `joinIntent`, not
//     a difference in emitted ids.
//
// Wallet connection is the IDENTITY layer, not a protocol action: it has no
// ProtocolActionId. A disconnected visitor surfaces `requiresConnect: true`
// alongside the post-connect recommendation.

import {
  PROTOCOL_ACTIONS,
  type ProtocolActionId,
  type ProtocolActionStatus,
} from "./protocol-actions";
import { rankForUsdc } from "./syndicate-config";

// ─── Identity state (membership axis) ───────────────────────────────────────
// The primary classification that drives the journey. Collector and
// top capital-band status is an OVERLAY on these states (a member can also
// collect and can also sit at the top band), surfaced as `isCollector` /
// `atTopRank` on the
// plan rather than as mutually-exclusive states — that is the honest
// normalization of states that genuinely co-occur.
export type IdentityState =
  | "visitor" // wallet disconnected
  | "identity-loading" // connected, holder index still loading (neutral)
  | "connected-non-member" // connected, loaded, no holder-index record
  | "member"; // holder-index record present (any rank)

/** Which copy variant of the single `joinMembership` action applies. */
export type JoinIntent = "join" | "buy-more" | "none";

// ─── Selector input ─────────────────────────────────────────────────────────
// Built by the caller from existing protocol state — the selector never reads
// these itself. Field → source mapping (for future consumers):
//   isConnected     ← wagmi useAccount().isConnected
//   identityLoading ← useHolderIndex().isLoading
//   isMember        ← useHolderIndex().getByWallet(address) !== undefined
//   cumulativeUsdc  ← holderRecord.cumulativeUsdc (0 for non-members)
//   ownsArtifacts   ← useArchiveBalances(ids).totalKnown > 0n
export interface NextActionContext {
  isConnected: boolean;
  identityLoading: boolean;
  isMember: boolean;
  cumulativeUsdc: number;
  ownsArtifacts: boolean;
}

// ─── Selector output ────────────────────────────────────────────────────────
export interface NextActionPlan {
  /** Primary membership-axis state. */
  state: IdentityState;
  /** Owns ≥1 Archive1155 artifact (collection axis overlay). */
  isCollector: boolean;
  /** Member at the deepest capital-footprint band (no further band). */
  atTopRank: boolean;
  /** Connect the wallet first (identity layer precondition). */
  requiresConnect: boolean;
  /** Copy variant for the join action; never changes the emitted id. */
  joinIntent: JoinIntent;
  /** Ordered, deduped, emittable-only protocol action ids. */
  actions: ProtocolActionId[];
}

// ─── Emittable status policy (Section D) ─────────────────────────────────────
/** The ONLY statuses the selector may surface. Excludes `preview` by design. */
export const EMITTABLE_STATUSES: readonly ProtocolActionStatus[] = [
  "live",
  "live-unaudited",
];

export function isEmittableAction(id: ProtocolActionId): boolean {
  return EMITTABLE_STATUSES.includes(PROTOCOL_ACTIONS[id].status);
}

// ─── Journey constants (the extracted, proven sequences) ─────────────────────
// Each is ids only; ordering is the recommendation order. Every id here is
// `live` / `live-unaudited` (asserted in tests + filtered at runtime).

/** Visitor: connect (identity layer) → then join. */
export const VISITOR_ACTIONS: readonly ProtocolActionId[] = ["joinMembership"];

/** Connected non-member: join → see your seat → verify. */
export const NON_MEMBER_ACTIONS: readonly ProtocolActionId[] = [
  "joinMembership",
  "openMySyndicate",
  "verifyProtocol",
];

/** Member: open My Syndicate → buy more → mint → verify → add liquidity. */
export const MEMBER_ACTIONS: readonly ProtocolActionId[] = [
  "openMySyndicate",
  "joinMembership",
  "mintFirstSignal",
  "verifyProtocol",
  "addLiquidity",
];

/** Collector overlay: My Archive (My Syndicate) → next artifact → chronicle/verify. */
export const COLLECTOR_ACTIONS: readonly ProtocolActionId[] = [
  "openMySyndicate",
  "mintFirstSignal",
  "verifyProtocol",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function mergeOrdered(
  base: readonly ProtocolActionId[],
  extra: readonly ProtocolActionId[],
): ProtocolActionId[] {
  const out: ProtocolActionId[] = [...base];
  for (const id of extra) if (!out.includes(id)) out.push(id);
  return out;
}

function dedupe(ids: readonly ProtocolActionId[]): ProtocolActionId[] {
  const seen = new Set<ProtocolActionId>();
  const out: ProtocolActionId[] = [];
  for (const id of ids) {
    if (!seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

// ─── Derivation ──────────────────────────────────────────────────────────────
export function deriveIdentityState(ctx: NextActionContext): IdentityState {
  if (!ctx.isConnected) return "visitor";
  if (ctx.identityLoading) return "identity-loading";
  if (ctx.isMember) return "member";
  return "connected-non-member";
}

function journeyFor(
  state: IdentityState,
  isCollector: boolean,
): ProtocolActionId[] {
  switch (state) {
    case "identity-loading":
      // Neutral: do not recommend join OR buy-more until identity is known.
      return [];
    case "visitor":
      return [...VISITOR_ACTIONS];
    case "connected-non-member":
      return isCollector
        ? mergeOrdered(NON_MEMBER_ACTIONS, COLLECTOR_ACTIONS)
        : [...NON_MEMBER_ACTIONS];
    case "member":
      return isCollector
        ? mergeOrdered(MEMBER_ACTIONS, COLLECTOR_ACTIONS)
        : [...MEMBER_ACTIONS];
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

// ─── The selector ─────────────────────────────────────────────────────────────
export function selectNextActions(ctx: NextActionContext): NextActionPlan {
  const state = deriveIdentityState(ctx);
  const isCollector = ctx.ownsArtifacts === true;

  // Capital-footprint band is a pure derivation from already-computed routed USDC.
  const { next } = rankForUsdc(ctx.cumulativeUsdc);
  const atTopRank = ctx.isMember && next === null;

  // dedupe + the live-only safety net guarantee the output invariant even if a
  // journey constant is ever edited to include a non-emittable id.
  const actions = dedupe(journeyFor(state, isCollector)).filter(
    isEmittableAction,
  );

  const joinIntent: JoinIntent =
    state === "visitor" || state === "connected-non-member"
      ? "join"
      : state === "member"
        ? "buy-more"
        : "none";

  return {
    state,
    isCollector,
    atTopRank,
    requiresConnect: state === "visitor",
    joinIntent,
    actions,
  };
}
