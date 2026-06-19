import { LP_POOL } from "./syndicate-config";
import { TAGGED_TRANSACTIONS, txExplorerUrl } from "./transaction-tags";

export type TransparencyTimelineStatus =
  | "LIVE"
  | "PARTIAL"
  | "PENDING"
  | "RESERVED"
  | "REQUIRES_CONTRACT";

export type TransparencyTimelineStage =
  | "Founder Deposit"
  | "Operations Payment"
  | "Product Launch"
  | "Chronicle"
  | "Member Growth"
  | "Chapter Milestone";

export type TransparencyTimelineEntry = {
  id: string;
  order: number;
  stage: TransparencyTimelineStage;
  status: TransparencyTimelineStatus;
  title: string;
  summary: string;
  consequence: string;
  source: string;
  routeHref: string | null;
  proofHref: string | null;
  proofLabel: string | null;
};

const lpSeed = TAGGED_TRANSACTIONS.find((t) => t.tag === "LP_SEED");

export const TRANSPARENCY_TIMELINE: readonly TransparencyTimelineEntry[] = [
  {
    id: "founder-deposit-liquidity-seed",
    order: 10,
    stage: "Founder Deposit",
    status: "LIVE",
    title: "Liquidity seed recorded",
    summary:
      `The ${LP_POOL.dex} ${LP_POOL.dexVersion} ${LP_POOL.pair} pair is live on Avalanche and anchored to its creation transaction.`,
    consequence:
      "LP Pool is the market access layer. It is infrastructure, not yield framing.",
    source: "src/lib/transaction-tags.ts - LP_SEED",
    routeHref: "/liquidity",
    proofHref: lpSeed ? txExplorerUrl(lpSeed.txHash) : null,
    proofLabel: lpSeed ? "Verify seed tx" : null,
  },
  {
    id: "product-launch-membership-sale",
    order: 20,
    stage: "Product Launch",
    status: "LIVE",
    title: "Membership Sale and routing live",
    summary:
      "SYN, Membership Sale, USDC routing wallets, Archive1155, and the LP pair are exposed through the public Registry.",
    consequence:
      "Entry means Membership Sale. Buying membership delivers SYN; holding SYN means the wallet is seated.",
    source: "src/lib/syndicate-config.ts - TRANSPARENCY_ITEMS",
    routeHref: "/registry",
    proofHref: "/registry",
    proofLabel: "Open Registry",
  },
  {
    id: "operations-payment-classification",
    order: 30,
    stage: "Operations Payment",
    status: "PENDING",
    title: "Operations payment classification",
    summary:
      "Outgoing Operations payments appear only after a real transaction is tagged and classified. Nothing is inferred from intention.",
    consequence:
      "Future spend can become transparent without silently inventing purpose, amount, or receipt state.",
    source: "src/lib/transaction-tags.ts - no untagged operation payment promoted",
    routeHref: "/transparency",
    proofHref: null,
    proofLabel: null,
  },
  {
    id: "chronicle-publication",
    order: 40,
    stage: "Chronicle",
    status: "PARTIAL",
    title: "Chronicle publication is gated",
    summary:
      "Chronicle surfaces exist, but entries move through review, admission, and publication gates before becoming institutional story.",
    consequence:
      "Activity can become meaning, but only after curation. The Chronicle is not a live hype feed.",
    source: "src/lib/chronicle-admission-registry.ts - src/lib/chronicle-entry-registry.ts",
    routeHref: "/chronicle",
    proofHref: "/chronicle",
    proofLabel: "Read Chronicle",
  },
  {
    id: "member-growth-holder-index",
    order: 50,
    stage: "Member Growth",
    status: "PARTIAL",
    title: "Member growth derives from the Holder Index",
    summary:
      "Membership growth is derived from indexed Membership Sale events. Missing index data stays partial; member counts are not fabricated.",
    consequence:
      "Growth remains verifiable as wallet seats, not a marketing counter.",
    source: "src/lib/holder-index.ts - src/lib/protocol-truth.ts",
    routeHref: "/members",
    proofHref: "/members",
    proofLabel: "Open Members",
  },
  {
    id: "chapter-milestone-reserved",
    order: 60,
    stage: "Chapter Milestone",
    status: "RESERVED",
    title: "Chapter milestone remains reserved",
    summary:
      "Chapter closing, milestone artifacts, and future chapter records stay reserved until a real threshold/event exists.",
    consequence:
      "No chapter milestone, artifact, or receipt is shown as live before the protocol produces the event.",
    source: "src/lib/protocol-knowledge-map.ts - chapter/milestone coverage notes",
    routeHref: "/chapters",
    proofHref: null,
    proofLabel: null,
  },
];

export function getTransparencyTimeline(): TransparencyTimelineEntry[] {
  return [...TRANSPARENCY_TIMELINE].sort((a, b) => a.order - b.order);
}

export function getTransparencyTimelineByStatus(
  status: TransparencyTimelineStatus,
): TransparencyTimelineEntry[] {
  return getTransparencyTimeline().filter((entry) => entry.status === status);
}
