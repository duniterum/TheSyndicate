// ─── Founder Action Classifier ─────────────────────────────────────────────
// Makes founder actions first-class in the Protocol Event Pipeline. Given an
// event's from/to/kind, classify what the Founder allocation wallet did —
// without inventing data and without ROI/return framing.
//
// The founder wallet is the single source of truth in syndicate-config, read
// through the known-address registry (never re-hardcoded). A classification is
// produced ONLY when the sender is the founder wallet.
//
// Coverage note (honest scope): founder burns and any founder→Vault USDC flow
// are already observable (the burn scanner + the Vault USDC-flow scanner feed
// the pipeline). Founder→Operations and Founder→Liquidity inflows are not
// scanned yet, so those categories are reserved here and will populate the
// instant such an event flows — no new tokenomics, no new contract.

import { isFounderWallet, labelForAddress } from "./known-addresses";
import type { ProtocolEventKind } from "./protocol-event-registry";

export type FounderActionCategory =
  | "founder-burn"
  | "founder-funded-operations"
  | "founder-funded-vault"
  | "founder-funded-liquidity"
  | "founder-allocation-movement";

export const FOUNDER_ACTION_LABEL: Record<FounderActionCategory, string> = {
  "founder-burn": "Founder Burn",
  "founder-funded-operations": "Founder funded Operations",
  "founder-funded-vault": "Founder funded Vault",
  "founder-funded-liquidity": "Founder funded Liquidity",
  "founder-allocation-movement": "Founder allocation movement",
};

/**
 * Legal-safe, recognition-only description of a founder action. No ROI, yield,
 * or return framing — founder support is structural, not a promise of profit.
 */
export const FOUNDER_ACTION_NOTE: Record<FounderActionCategory, string> = {
  "founder-burn":
    "Founder support: SYN permanently sent to the burn address. Recognition only — no buyback, no automation, no financial claim.",
  "founder-funded-operations":
    "Founder support: USDC sent to the Operations wallet to fund protocol operations. Recognition only — no return is implied.",
  "founder-funded-vault":
    "Founder support: USDC sent to the Vault wallet. Recognition only — no return is implied.",
  "founder-funded-liquidity":
    "Founder support: USDC sent to the Liquidity wallet. Recognition only — no return is implied.",
  "founder-allocation-movement":
    "Founder allocation movement recorded factually. Purpose is shown only when manually classified.",
};

/**
 * Classify a founder action from an event's endpoints + kind. Returns
 * undefined unless the sender is the founder wallet. Pure; never throws.
 */
export function classifyFounderAction(args: {
  from?: string | null;
  to?: string | null;
  kind: ProtocolEventKind;
}): FounderActionCategory | undefined {
  if (!isFounderWallet(args.from)) return undefined;
  if (args.kind === "burn-founder") return "founder-burn";
  switch (labelForAddress(args.to).role) {
    case "operations":
      return "founder-funded-operations";
    case "vault":
      return "founder-funded-vault";
    case "liquidity":
      return "founder-funded-liquidity";
    default:
      return "founder-allocation-movement";
  }
}

/** True when the kind/endpoints describe any founder action. */
export function isFounderAction(args: {
  from?: string | null;
  to?: string | null;
  kind: ProtocolEventKind;
}): boolean {
  return classifyFounderAction(args) !== undefined;
}
