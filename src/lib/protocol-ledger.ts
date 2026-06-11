// ─── Protocol Ledger ───────────────────────────────────────────────────────
// A factual money-movement ledger derived from the canonical event pipeline.
// It answers "where did value move, and why" WITHOUT inventing a purpose.
//
// Rule (mirrors transaction-tags.ts): a purpose is shown ONLY when a tx has
// been manually classified in TAGGED_TRANSACTIONS. Otherwise the purpose reads
// the literal string "unknown". No category or purpose is ever inferred from
// vibes — every field traces to an on-chain log or an explicit manual tag.
//
// This is a pure leaf: it joins events with the tag registry by tx hash and
// resolves labels through the known-address registry. It reads no chain.

import type { CanonicalProtocolEvent, EventToken } from "./protocol-events";
import { labelForAddress } from "./known-addresses";
import { TAGGED_TRANSACTIONS, type TaggedTransaction } from "./transaction-tags";

export type LedgerCategory =
  | "membership-sale"
  | "vault-flow"
  | "liquidity-flow"
  | "operations-flow"
  | "founder-funding"
  | "burn"
  | "nft-mint-proceeds"
  | "lp-flow"
  | "unknown";

export const LEDGER_CATEGORY_LABEL: Record<LedgerCategory, string> = {
  "membership-sale": "Membership Sale",
  "vault-flow": "Vault Flow",
  "liquidity-flow": "Liquidity Flow",
  "operations-flow": "Operations Flow",
  "founder-funding": "Founder Funding",
  burn: "Burn",
  "nft-mint-proceeds": "Artifact Mint",
  "lp-flow": "LP Flow",
  unknown: "Unknown",
};

/** The literal purpose used when a transaction has no manual classification. */
export const UNKNOWN_PURPOSE = "unknown";

export const LEDGER_LEGAL_NOTE =
  "Factual on-chain accounting. A purpose is shown only when a transaction has " +
  "been manually classified; otherwise it reads 'unknown'. No category or " +
  "purpose is inferred or invented.";

export type ProtocolLedgerEntry = {
  id: string;
  txHash: string;
  from?: string;
  to?: string;
  fromLabel: string;
  toLabel: string;
  token?: EventToken;
  amount?: number;
  category: LedgerCategory;
  /** Manually-tagged description, else the literal "unknown" — never invented. */
  purpose: string;
  isManualTag: boolean;
  /** Canonical explorer link (empty when the tx hash is unverifiable). */
  verifyHref: string;
  legalNote: string;
};

/** Derive the ledger category from an event's classification + founder action. */
export function categoryForEvent(e: CanonicalProtocolEvent): LedgerCategory {
  if (e.founderAction) return "founder-funding";
  switch (e.category) {
    case "membership-sale":
      return "membership-sale";
    case "burn":
      return "burn";
    case "archive":
      return "nft-mint-proceeds";
    case "lp":
      return "lp-flow";
    case "protocol-wallet": {
      const role = labelForAddress(e.to).role !== "unknown"
        ? labelForAddress(e.to).role
        : labelForAddress(e.from).role;
      if (role === "vault") return "vault-flow";
      if (role === "operations") return "operations-flow";
      if (role === "liquidity") return "liquidity-flow";
      return "unknown";
    }
    case "syn-transfer":
    default:
      return "unknown";
  }
}

/**
 * Join canonical events with the manual tag registry to produce ledger entries.
 * Pure. `purpose` is the tagged description on a tx-hash match, else "unknown";
 * `isManualTag` reflects whether a manual classification was found.
 */
export function deriveLedgerEntries(
  events: ReadonlyArray<CanonicalProtocolEvent>,
  tagged: ReadonlyArray<TaggedTransaction> = TAGGED_TRANSACTIONS,
): ProtocolLedgerEntry[] {
  const byHash = new Map<string, TaggedTransaction>();
  for (const t of tagged) {
    const k = t.txHash.toLowerCase();
    if (!byHash.has(k)) byHash.set(k, t);
  }

  return events.map((e) => {
    const tag = e.txHash ? byHash.get(e.txHash.toLowerCase()) : undefined;
    return {
      id: `ledger-${e.id}`,
      txHash: e.txHash,
      from: e.from,
      to: e.to,
      fromLabel: e.fromLabel ?? labelForAddress(e.from).label,
      toLabel: e.toLabel ?? labelForAddress(e.to).label,
      token: e.token,
      amount: e.amount,
      category: categoryForEvent(e),
      purpose: tag ? tag.description : UNKNOWN_PURPOSE,
      isManualTag: Boolean(tag),
      verifyHref: e.verificationLink,
      legalNote: LEDGER_LEGAL_NOTE,
    };
  });
}
