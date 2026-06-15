// ─── PROTOCOL METRICS REGISTRY ─────────────────────────────────────────────
// THE canonical dictionary of every protocol metric The Syndicate displays.
//
//   one metric  →  one id, one definition, one formula, one verification path
//               →  many surfaces (intelligence bar, live pulse, supply line,
//                  transparency, /registry, drawers, cards, …)
//
// This is a PURE-DATA LEAF module. It imports ONLY from `syndicate-config.ts`
// (itself a zero-import leaf) so that BOTH the React value layer
// (`protocol-truth.ts`) AND the pure verification layer
// (`data-verification-registry.ts`) can consume it without dragging React /
// wagmi into the verification side or creating an import cycle.
//
// It holds DEFINITIONS, never live values. Values are bound at the edge:
//   • `protocol-truth.ts`  binds runtime values + computes runtime status,
//     pulling label / source / formula / verifyHref FROM this registry.
//   • `data-verification-registry.ts` derives the "verify it yourself" drawer
//     entries FROM this registry.
//   • surfaces (bar, pulse, supply line) pull their display labels FROM here.
//
// Adding a metric here is the ONLY place a new metric should be defined. If a
// surface needs a metric, it references an id — it never re-states a label,
// source, or formula inline.
//
// Legal doctrine is enforced in the wording: USDC is *routed*, never "raised";
// no ROI / yield / dividend / return language; the reference price is a fixed
// protocol access rate, never a market price or a price promise.
// ────────────────────────────────────────────────────────────────────────────

import {
  CONTRACTS,
  LP_POOL,
  MEMBER_DEFINITION,
  ACCESS_RATE_USDC_PER_SYN,
  SYN_EXPLORERS,
  SYN_BURN_ADDRESS,
  PROOF_OF_FIRE_001,
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS,
  SALE_V2_LIVE,
  explorerUrlFor,
  explorerUrlForAddress,
} from "./syndicate-config";

/**
 * The active membership sale verification target. Once Sale V2 is live every
 * "Membership Sale contract" verification link points at V2 (where current
 * routing happens); the sealed V1 history still backs the cumulative totals.
 */
const ACTIVE_SALE_ADDR =
  SALE_V2_LIVE && MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
    ? MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
    : CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;

// ─── Taxonomy ──────────────────────────────────────────────────────────────

/** Conceptual grouping. Drives ordering and section headings on /registry. */
export type MetricCategory =
  | "supply"
  | "market-reference"
  | "membership"
  | "sale"
  | "protocol-wallets"
  | "liquidity"
  | "artifacts"
  | "burn"
  | "activity";

/**
 * How a metric is produced:
 *   • RAW       — a single on-chain read or a fixed protocol constant.
 *   • DERIVED   — computed from one other metric / a simple transform.
 *   • AGGREGATE — summed / counted across many reads or records.
 */
export type MetricType = "RAW" | "DERIVED" | "AGGREGATE";

/**
 * Default / intended trust status (documentation-level). The live value layer
 * may *downgrade* this at runtime (e.g. to PENDING while a read is undefined),
 * but never silently upgrade it.
 */
export type MetricStatus = "LIVE" | "PARTIAL" | "PENDING";

/** Unit of the resolved value — drives the correct formatter at the edge. */
export type MetricUnit =
  | "USD"
  | "SYN"
  | "count"
  | "percent"
  | "seconds"
  | "address"
  | "ratio"
  | "text";

/**
 * Legal sensitivity of the metric's framing. HIGH metrics (any price /
 * valuation figure) must always be presented with their non-promissory,
 * fixed-reference framing intact.
 */
export type LegalSensitivity = "none" | "low" | "medium" | "high";

export type MetricLink = { label: string; href: string };

export type MetricVerificationSpec = {
  /** Single primary link (the value layer's `verifyHref`). */
  primaryHref: string | null;
  /** Full explorer / source link set (the drawer's `links`). */
  links: MetricLink[];
  /** Refresh cadence in human language. */
  refresh: string;
};

export type ProtocolMetric = {
  /** Canonical, stable id. Lower-camelCase. The one true name. */
  id: string;
  /**
   * Legacy / surface-specific keys that resolve to this metric. Lets existing
   * property names (`lpTvlUsd`, `vaultUsdc`, …) and drawer keys
   * (`lpTvl`, `vaultRouted`, `?verify=…`) keep working unchanged.
   */
  aliases: string[];
  /** Canonical full label (drawer headers, cards). */
  label: string;
  /** Compact label for dense surfaces (bar / pulse cells). Falls back to label. */
  shortLabel?: string;
  category: MetricCategory;
  type: MetricType;
  status: MetricStatus;
  unit: MetricUnit;
  /** WHAT the number represents — one plain-language line. */
  description: string;
  /** WHERE the data comes from — RPC / contract / address, plain language. */
  source: string;
  /** HOW the value is derived — the formula. */
  formula: string;
  /** Verification path — primary link, full link set, refresh cadence. */
  verification: MetricVerificationSpec;
  legalSensitivity: LegalSensitivity;
  /** Lower = more prominent. Used to order metrics within a surface. */
  displayPriority: number;
  /** Recommended surfaces (advisory — not enforced). */
  surfaces: string[];
  /** Canonical ids this metric is derived from. */
  dependencies: string[];
  /** Plain-language owning hook / source reference. */
  hook: string;
  /** Optional note about empty / loading semantics. */
  emptyState?: string;
};

// ─── Link helpers (pure) ────────────────────────────────────────────────────

const link = (addr: string, label: string): MetricLink | null => {
  const href = explorerUrlForAddress(addr);
  return href ? { label, href } : null;
};

const links = (...xs: Array<MetricLink | null>): MetricLink[] =>
  xs.filter((x): x is MetricLink => x !== null);

const SYN_HREF = explorerUrlFor("SYN_CONTRACT_ADDRESS");
const SALE_HREF = explorerUrlForAddress(ACTIVE_SALE_ADDR);
const PAIR_HREF = explorerUrlForAddress(LP_POOL.pairAddress);
const VAULT_HREF = explorerUrlForAddress(CONTRACTS.VAULT_WALLET);
const LIQ_HREF = explorerUrlForAddress(CONTRACTS.LIQUIDITY_WALLET);
const OPS_HREF = explorerUrlForAddress(CONTRACTS.OPERATIONS_WALLET);
const DEAD_HREF = explorerUrlForAddress(SYN_BURN_ADDRESS);
const ARCHIVE_HREF = explorerUrlForAddress(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS);

const synLink = link(CONTRACTS.SYN_CONTRACT_ADDRESS, "SYN contract");
const usdcLink = link(CONTRACTS.USDC_CONTRACT_ADDRESS, "USDC contract");
const saleLink = link(ACTIVE_SALE_ADDR, "Membership Sale contract");
const avascanLink: MetricLink = { label: "Avascan token", href: SYN_EXPLORERS.avascan };

const REFRESH_PULSE = "Every 60 seconds; cached for 30 seconds.";
const REFRESH_SUPPLY = "Every 120 seconds; cached for 60 seconds.";
const REFRESH_FIXED = "Fixed — set in protocol config; does not change.";
const REFRESH_MANUAL = "Updated when the append-only registry is amended.";

// ─── The canonical metric set ───────────────────────────────────────────────

const m = (x: ProtocolMetric): ProtocolMetric => x;

export const PROTOCOL_METRICS: ProtocolMetric[] = [
  // ── Supply ────────────────────────────────────────────────────────────────
  m({
    id: "totalSupply",
    aliases: ["synSupply", "totalSupplySyn"],
    label: "Total Supply",
    shortLabel: "Total Supply",
    category: "supply",
    type: "RAW",
    status: "LIVE",
    unit: "SYN",
    description:
      "Total SYN in existence. The full 1,000,000,000 SYN was minted once at genesis; the contract has no mint function, so this number can never go up. Burns are transfers to the standard dead address — they remove SYN from circulation without lowering totalSupply, so this stays fixed at 1,000,000,000.",
    source: "Avalanche C-Chain RPC. Reads totalSupply() on the SYN ERC20 contract.",
    formula: "ERC20 totalSupply() — fixed at genesis, no mint function",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink, avascanLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 10,
    surfaces: ["intelligence-bar", "supply-line", "transparency", "registry"],
    dependencies: [],
    hook: "useSynSupply → ERC20 totalSupply()",
  }),
  m({
    id: "circulatingSupply",
    aliases: ["circulating"],
    label: "Circulating Supply",
    shortLabel: "Circulating",
    category: "supply",
    type: "DERIVED",
    status: "LIVE",
    unit: "SYN",
    description:
      "Total supply minus the SYN still held in the seven protocol allocation wallets (Vault, Founder, Liquidity, Partnerships, Contributors, Future Ecosystem, and undistributed Membership) and minus SYN burned to the standard dead address. This is the SYN actually in public hands.",
    source:
      "Avalanche C-Chain RPC. totalSupply() minus the live balanceOf() of each allocation wallet and minus the dead-address balance (burned).",
    formula: "totalSupply − Σ allocationWallet balanceOf() − burnedSupply",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 11,
    surfaces: ["intelligence-bar", "supply-line", "transparency", "registry"],
    dependencies: ["totalSupply", "nonCirculatingSupply", "burnedSupply"],
    hook: "useCirculatingSupply",
  }),
  m({
    id: "nonCirculatingSupply",
    aliases: [],
    label: "Non-Circulating Supply",
    shortLabel: "Non-Circulating",
    category: "supply",
    type: "DERIVED",
    status: "LIVE",
    unit: "SYN",
    description:
      "SYN held across the protocol allocation wallets — not yet in public hands. The complement of circulating supply.",
    source:
      "Avalanche C-Chain RPC. Sum of the live balanceOf() of each allocation wallet on the SYN ERC20 contract.",
    formula: "Σ allocationWallet balanceOf()",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 12,
    surfaces: ["transparency", "registry"],
    dependencies: [],
    hook: "useCirculatingSupply (nonCirculating)",
  }),
  m({
    id: "burnedSupply",
    aliases: ["synBurned", "burned"],
    label: "Burned Supply",
    shortLabel: "Burned",
    category: "supply",
    type: "RAW",
    status: "LIVE",
    unit: "SYN",
    description:
      "SYN permanently removed from circulation by sending it to the standard dead address (0x…dEaD), read live as the balanceOf() of that address. One verified burn has occurred — Proof of Burn #001, a 1,000 SYN Founder Burn. A burn here is a transfer, so totalSupply is unchanged; there is no automated burn — any future burn would be a manual, verifiable transfer.",
    source:
      "Avalanche C-Chain RPC. Reads balanceOf() of the standard dead address on the SYN ERC20 contract.",
    formula: "ERC20 balanceOf(0x…dEaD)",
    verification: {
      primaryHref: DEAD_HREF ?? SYN_HREF,
      links: links(synLink, avascanLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "medium",
    displayPriority: 13,
    surfaces: ["intelligence-bar", "supply-line", "activity", "registry"],
    dependencies: [],
    hook: "useSynSupply → balanceOf(0x…dEaD)",
    emptyState: "Reads the live dead-address balance; 0 only if nothing has ever been burned.",
  }),
  m({
    id: "membershipAllocation",
    aliases: ["membershipAllocationSyn"],
    label: "Membership Allocation",
    shortLabel: "Membership Allocation",
    category: "supply",
    type: "RAW",
    status: "LIVE",
    unit: "SYN",
    description:
      "The SYN reserved for membership distribution — the slice the Membership Sale draws from. A fixed share of the total supply.",
    source: "src/lib/syndicate-config.ts · TOKENOMICS_ALLOCATION (Membership Distribution slice).",
    formula: "constant — 35% of the fixed total supply",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink),
      refresh: REFRESH_FIXED,
    },
    legalSensitivity: "low",
    displayPriority: 14,
    surfaces: ["transparency", "registry"],
    dependencies: ["totalSupply"],
    hook: "TOKENOMICS_ALLOCATION",
  }),

  // ── Market reference (fixed access-rate framing — never a market price) ─────
  m({
    id: "referencePrice",
    aliases: [],
    label: "SYN Reference Price",
    shortLabel: "SYN Reference Price",
    category: "market-reference",
    type: "RAW",
    status: "LIVE",
    unit: "USD",
    description:
      "The fixed access rate at which the Membership Sale delivers SYN: 1 SYN = $0.01 USDC. A protocol-set parameter — not a traded or market price, and not a price prediction or promise.",
    source: "src/lib/syndicate-config.ts · ACCESS_RATE_USDC_PER_SYN (fixed protocol access rate).",
    formula: `fixed access rate · 1 SYN = $${ACCESS_RATE_USDC_PER_SYN.toFixed(2)} USDC`,
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_FIXED,
    },
    legalSensitivity: "high",
    displayPriority: 20,
    surfaces: ["intelligence-bar", "registry"],
    dependencies: [],
    hook: "ACCESS_RATE_USDC_PER_SYN (config constant)",
  }),
  m({
    id: "referenceMarketCap",
    aliases: [],
    label: "Reference Market Cap",
    shortLabel: "Reference Market Cap",
    category: "market-reference",
    type: "DERIVED",
    status: "LIVE",
    unit: "USD",
    description:
      "An illustrative figure: the fixed reference price applied to circulating supply. Not a market valuation — SYN has no guaranteed or traded price.",
    source: "Derived from the fixed reference price and the live circulating supply.",
    formula: "referencePrice × circulatingSupply",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink, saleLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "high",
    displayPriority: 21,
    surfaces: ["intelligence-bar", "registry"],
    dependencies: ["referencePrice", "circulatingSupply"],
    hook: "derived (referencePrice × circulatingSupply)",
  }),
  m({
    id: "fdv",
    aliases: [],
    label: "Fully-Diluted Value",
    shortLabel: "FDV",
    category: "market-reference",
    type: "DERIVED",
    status: "LIVE",
    unit: "USD",
    description:
      "An illustrative figure: the fixed reference price applied to total supply. Not a market valuation or a price promise.",
    source: "Derived from the fixed reference price and the live total supply.",
    formula: "referencePrice × totalSupply",
    verification: {
      primaryHref: SYN_HREF,
      links: links(synLink, saleLink),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "high",
    displayPriority: 22,
    surfaces: ["intelligence-bar", "registry"],
    dependencies: ["referencePrice", "totalSupply"],
    hook: "derived (referencePrice × totalSupply)",
  }),

  // ── Membership ─────────────────────────────────────────────────────────────
  m({
    id: "members",
    aliases: [],
    label: MEMBER_DEFINITION.label,
    shortLabel: "Members",
    category: "membership",
    type: "AGGREGATE",
    status: "LIVE",
    unit: "count",
    description: MEMBER_DEFINITION.description,
    source: MEMBER_DEFINITION.source,
    formula: MEMBER_DEFINITION.formula,
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink, synLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 30,
    surfaces: ["intelligence-bar", "live-pulse", "home", "members", "registry"],
    dependencies: [],
    hook: "useHolderIndex (via useProtocolPulse)",
    emptyState: "Shows 0 until the first TokensPurchased event is mined.",
  }),
  m({
    id: "nextMember",
    aliases: ["nextMemberNumber"],
    label: "Next Member",
    shortLabel: "Next Member",
    category: "membership",
    type: "DERIVED",
    status: "LIVE",
    unit: "count",
    description:
      "Founder archive number that will be assigned to the next unique wallet to join. Derived: members count + 1.",
    source: "Derived deterministically from the Members count. Not a separate on-chain read.",
    formula: "members + 1",
    verification: {
      primaryHref: SALE_HREF,
      links: links(synLink, saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 31,
    surfaces: ["live-pulse", "home", "registry"],
    dependencies: ["members"],
    hook: "useHolderIndex (via useProtocolPulse)",
    emptyState: 'Shows "#1" before any wallet has joined; updates as soon as the first join is indexed.',
  }),
  m({
    id: "chapterProgress",
    aliases: [],
    label: "Chapter Progress",
    shortLabel: "Chapter Progress",
    category: "membership",
    type: "DERIVED",
    status: "LIVE",
    unit: "text",
    description:
      "The current membership chapter and how many seats remain until it seals.",
    source: "Derived from members against the canonical chapters table (src/lib/protocol-truth.ts CHAPTERS).",
    formula: "first chapter where members < capacity; remaining = capacity − members",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 32,
    surfaces: ["intelligence-bar", "home", "registry"],
    dependencies: ["members"],
    hook: "useHolderIndex (via useProtocolPulse)",
  }),
  m({
    id: "rankDistribution",
    aliases: [],
    label: "Rank Distribution",
    shortLabel: "Rank Distribution",
    category: "membership",
    type: "AGGREGATE",
    status: "PENDING",
    unit: "count",
    description:
      "How many members sit at each recognition rank. Rank is structural recognition derived from cumulative USDC and confers nothing. Not yet surfaced as a live aggregate.",
    source: "Derived from cumulative USDC per member against the canonical rank thresholds (rankForUsdc).",
    formula: "count(members) grouped by rankForUsdc(cumulativeUsdc)",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 33,
    surfaces: ["members", "registry"],
    dependencies: ["members"],
    hook: "RANKS_V2 / rankForUsdc (not yet aggregated)",
  }),

  // ── Sale ───────────────────────────────────────────────────────────────────
  m({
    id: "synSold",
    aliases: [],
    label: "SYN Sold",
    shortLabel: "SYN Sold",
    category: "sale",
    type: "RAW",
    status: "LIVE",
    unit: "SYN",
    description:
      "Cumulative SYN distributed by the Membership Sale contract since deployment — equals USDC routed ÷ 0.01.",
    source: "Avalanche C-Chain RPC. Reads totalSynSold() on the SyndicateMembershipSale contract.",
    formula: "usdcRouted ÷ 0.01 USDC per SYN (fixed rate)",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink, link(CONTRACTS.MEMBERSHIP_SYN_WALLET, "Membership SYN wallet")),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 40,
    surfaces: ["intelligence-bar", "live-pulse", "registry"],
    dependencies: ["usdcRouted"],
    hook: "useSaleStats (via useProtocolPulse)",
  }),
  m({
    id: "usdcRouted",
    aliases: ["usdcRaised"],
    label: "USDC Routed",
    shortLabel: "USDC Routed",
    category: "sale",
    type: "RAW",
    status: "LIVE",
    unit: "USD",
    description:
      "Cumulative USDC received by the Membership Sale contract since deployment — every buy() call adds to this total, which is then split 70/20/10.",
    source: "Avalanche C-Chain RPC. Reads totalUsdcRaised() on the SyndicateMembershipSale contract.",
    formula: "sum(usdcIn) for every executed buy() call",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink, usdcLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 41,
    surfaces: ["intelligence-bar", "live-pulse", "home", "registry"],
    dependencies: [],
    hook: "useSaleStats (via useProtocolPulse)",
  }),
  m({
    id: "purchaseCount",
    aliases: [],
    label: "Purchases",
    shortLabel: "Purchases",
    category: "sale",
    type: "RAW",
    status: "LIVE",
    unit: "count",
    description: "Total number of executed buy() calls on the Membership Sale since deployment.",
    source: "Avalanche C-Chain RPC. Reads purchaseCount() on the SyndicateMembershipSale contract.",
    formula: "count of executed buy() calls since deployment",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 42,
    surfaces: ["registry"],
    dependencies: [],
    hook: "useSaleStats (via useProtocolPulse)",
  }),
  m({
    id: "lastBuy",
    aliases: ["lastBuyAgoSeconds"],
    label: "Last Buy",
    shortLabel: "Last Buy",
    category: "sale",
    type: "RAW",
    status: "LIVE",
    unit: "seconds",
    description:
      "Time elapsed since the most recent TokensPurchased event emitted by the Membership Sale contract.",
    source: "Avalanche C-Chain RPC. Scans recent blocks for TokensPurchased(buyer, usdcIn, synOut) events.",
    formula: "(currentBlock − lastBuyBlock) × 2s (Avalanche block time)",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 43,
    surfaces: ["live-pulse", "registry"],
    dependencies: [],
    hook: "useLivePurchaseEvents (via useProtocolPulse)",
    emptyState: 'Renders "Awaiting first buy" if no event has been mined yet.',
  }),
  m({
    id: "lastBuyBuyer",
    aliases: [],
    label: "Last Buyer",
    shortLabel: "Last Buyer",
    category: "sale",
    type: "RAW",
    status: "LIVE",
    unit: "address",
    description: "The wallet address of the most recent purchaser, from the latest TokensPurchased event.",
    source: "Avalanche C-Chain RPC. The most recent TokensPurchased event on the Membership Sale contract.",
    formula: "argmax(blockNumber) over TokensPurchased.buyer",
    verification: {
      primaryHref: SALE_HREF,
      links: links(saleLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 44,
    surfaces: ["registry"],
    dependencies: [],
    hook: "useProtocolPulse (lastBuyBuyer)",
  }),

  // ── Protocol wallets (live USDC balances of the routing wallets) ───────────
  m({
    id: "protocolWalletsTotal",
    aliases: [],
    label: "Protocol Wallets",
    shortLabel: "Protocol Wallets",
    category: "protocol-wallets",
    type: "AGGREGATE",
    status: "LIVE",
    unit: "USD",
    description:
      "Combined live USDC balance across the three routing wallets (Vault + Liquidity + Operations). Current balances, not lifetime totals.",
    source: "Avalanche C-Chain RPC. Sum of USDC.balanceOf() across the Vault, Liquidity, and Operations wallets.",
    formula: "vaultWalletUsdc + liquidityWalletUsdc + operationsWalletUsdc",
    verification: {
      primaryHref: VAULT_HREF,
      links: links(
        link(CONTRACTS.VAULT_WALLET, "Vault Wallet"),
        link(CONTRACTS.LIQUIDITY_WALLET, "Liquidity Wallet"),
        link(CONTRACTS.OPERATIONS_WALLET, "Operations Wallet"),
        usdcLink,
      ),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 50,
    surfaces: ["intelligence-bar", "transparency", "registry"],
    dependencies: ["vaultWalletUsdc", "liquidityWalletUsdc", "operationsWalletUsdc"],
    hook: "derived (sum of routing wallet USDC balances)",
  }),
  m({
    id: "vaultWalletUsdc",
    aliases: ["vaultUsdc", "vaultRouted"],
    label: "Vault Wallet · USDC",
    shortLabel: "Vault Wallet",
    category: "protocol-wallets",
    type: "RAW",
    status: "LIVE",
    unit: "USD",
    description:
      "Live USDC balance held in the Vault Wallet. Every purchase routes 70% of the USDC atomically to this address. This is the current balance, not a lifetime total.",
    source: `Avalanche C-Chain RPC. ERC20 USDC.balanceOf(${CONTRACTS.VAULT_WALLET}).`,
    formula: "current ERC20 USDC balance of the Vault routing wallet",
    verification: {
      primaryHref: VAULT_HREF,
      links: links(link(CONTRACTS.VAULT_WALLET, "Vault Wallet"), usdcLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 51,
    surfaces: ["intelligence-bar", "live-pulse", "transparency", "registry"],
    dependencies: [],
    hook: "useProtocolPulse → USDC.balanceOf(VAULT_WALLET)",
    emptyState:
      "Reflects current balance, not lifetime inflow — outflows from the Vault Wallet will reduce this figure.",
  }),
  m({
    id: "liquidityWalletUsdc",
    aliases: ["liquidityUsdc"],
    label: "Liquidity Wallet · USDC",
    shortLabel: "Liquidity Wallet",
    category: "protocol-wallets",
    type: "RAW",
    status: "LIVE",
    unit: "USD",
    description:
      "Live USDC balance held in the Liquidity Wallet. Every purchase routes 20% of the USDC atomically to this address. Current balance, not a lifetime total.",
    source: `Avalanche C-Chain RPC. ERC20 USDC.balanceOf(${CONTRACTS.LIQUIDITY_WALLET}).`,
    formula: "current ERC20 USDC balance of the Liquidity routing wallet",
    verification: {
      primaryHref: LIQ_HREF,
      links: links(link(CONTRACTS.LIQUIDITY_WALLET, "Liquidity Wallet"), usdcLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 52,
    surfaces: ["intelligence-bar", "transparency", "registry"],
    dependencies: [],
    hook: "useProtocolPulse → USDC.balanceOf(LIQUIDITY_WALLET)",
  }),
  m({
    id: "operationsWalletUsdc",
    aliases: ["operationsUsdc"],
    label: "Operations Wallet · USDC",
    shortLabel: "Operations Wallet",
    category: "protocol-wallets",
    type: "RAW",
    status: "LIVE",
    unit: "USD",
    description:
      "Live USDC balance held in the Operations Wallet. Every purchase routes 10% of the USDC atomically to this address. Current balance, not a lifetime total.",
    source: `Avalanche C-Chain RPC. ERC20 USDC.balanceOf(${CONTRACTS.OPERATIONS_WALLET}).`,
    formula: "current ERC20 USDC balance of the Operations routing wallet",
    verification: {
      primaryHref: OPS_HREF,
      links: links(link(CONTRACTS.OPERATIONS_WALLET, "Operations Wallet"), usdcLink),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "medium",
    displayPriority: 53,
    surfaces: ["intelligence-bar", "transparency", "registry"],
    dependencies: [],
    hook: "useProtocolPulse → USDC.balanceOf(OPERATIONS_WALLET)",
  }),

  // ── Liquidity (Trader Joe v1 SYN/USDC pair) ────────────────────────────────
  m({
    id: "lpTvl",
    aliases: ["lpTvlUsd"],
    label: "LP TVL",
    shortLabel: "LP TVL",
    category: "liquidity",
    type: "DERIVED",
    status: "LIVE",
    unit: "USD",
    description:
      "Total value locked in the SYN/USDC Trader Joe pair — computed as USDC reserve × 2 (symmetric pair valuation).",
    source: "Avalanche C-Chain RPC. Calls getReserves() on the Trader Joe v1 SYN/USDC pair contract.",
    formula: "usdcReserve × 2 (symmetric pair valuation)",
    verification: {
      primaryHref: PAIR_HREF,
      links: links(
        link(LP_POOL.pairAddress, "LP pair contract"),
        { label: "Trader Joe pool", href: LP_POOL.traderJoeUrl },
        { label: "DexScreener", href: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}` },
      ),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "low",
    displayPriority: 60,
    surfaces: ["intelligence-bar", "live-pulse", "transparency", "registry"],
    dependencies: [],
    hook: "useLpStats (via useProtocolPulse)",
  }),
  m({
    id: "synSpotPrice",
    aliases: ["synPriceUsd"],
    label: "SYN Spot",
    shortLabel: "SYN Spot",
    category: "liquidity",
    type: "DERIVED",
    status: "LIVE",
    unit: "USD",
    description:
      "SYN price implied live by the SYN/USDC LP reserves. Market-driven and volatile — distinct from the fixed reference price, and not a protocol promise.",
    source: "Avalanche C-Chain RPC. Calls getReserves() on the Trader Joe v1 SYN/USDC pair contract.",
    formula: "usdcReserve ÷ synReserve",
    verification: {
      primaryHref: PAIR_HREF,
      links: links(
        link(LP_POOL.pairAddress, "LP pair contract"),
        { label: "Trader Joe pool", href: LP_POOL.traderJoeUrl },
      ),
      refresh: REFRESH_PULSE,
    },
    legalSensitivity: "high",
    displayPriority: 61,
    surfaces: ["transparency", "registry"],
    dependencies: [],
    hook: "useLpStats (via useProtocolPulse)",
  }),

  // ── Artifacts (Archive1155 — deployed, validation phase) ───────────────────
  m({
    id: "artifactsTotal",
    aliases: [],
    label: "Artifacts Minted",
    shortLabel: "Artifacts",
    category: "artifacts",
    type: "AGGREGATE",
    status: "PARTIAL",
    unit: "count",
    description:
      "Total Archive1155 artifacts minted across all ids. The contract is deployed and read-only today; no artifact drop is activated yet, so this reads 0.",
    source: "Avalanche C-Chain RPC. Sum of totalSupply(id) across known ids on the Archive1155 contract.",
    formula: "Σ Archive1155.totalSupply(id)",
    verification: {
      primaryHref: ARCHIVE_HREF,
      links: links(link(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, "Archive1155 contract")),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 70,
    surfaces: ["nft", "archive", "registry"],
    dependencies: ["firstSignalMinted", "patronSealMinted"],
    hook: "Archive1155.totalSupply(id) (read-only)",
    emptyState: "Reads 0 until an artifact drop is activated on the deployed contract.",
  }),
  m({
    id: "firstSignalMinted",
    aliases: [],
    label: "First Signal Minted",
    shortLabel: "First Signal",
    category: "artifacts",
    type: "RAW",
    status: "PARTIAL",
    unit: "count",
    description:
      "Units minted of the First Signal artifact (Archive1155 id 1). Contract deployed and read-only; drop not yet activated.",
    source: "Avalanche C-Chain RPC. Reads totalSupply(1) on the Archive1155 contract.",
    formula: "Archive1155.totalSupply(1)",
    verification: {
      primaryHref: ARCHIVE_HREF,
      links: links(link(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, "Archive1155 contract")),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 71,
    surfaces: ["nft", "archive", "registry"],
    dependencies: [],
    hook: "Archive1155.totalSupply(1) (read-only)",
  }),
  m({
    id: "patronSealMinted",
    aliases: [],
    label: "Patron Seal Minted",
    shortLabel: "Patron Seal",
    category: "artifacts",
    type: "RAW",
    status: "PARTIAL",
    unit: "count",
    description:
      "Units minted of the Patron Seal artifact (Archive1155 id 3). Contract deployed and read-only; drop not yet activated.",
    source: "Avalanche C-Chain RPC. Reads totalSupply(3) on the Archive1155 contract.",
    formula: "Archive1155.totalSupply(3)",
    verification: {
      primaryHref: ARCHIVE_HREF,
      links: links(link(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, "Archive1155 contract")),
      refresh: REFRESH_SUPPLY,
    },
    legalSensitivity: "low",
    displayPriority: 72,
    surfaces: ["nft", "archive", "registry"],
    dependencies: [],
    hook: "Archive1155.totalSupply(3) (read-only)",
  }),

  // ── Burn (recognition-only — never a buyback / scarcity claim) ──────────────
  m({
    id: "proofOfBurnCount",
    aliases: [],
    label: "Proof of Burn",
    shortLabel: "Proof of Burn",
    category: "burn",
    type: "AGGREGATE",
    status: "LIVE",
    unit: "count",
    description:
      "Count of verified, recognition-only SYN burns — manual transfers to the standard dead address. One has occurred: Proof of Burn #001, a 1,000 SYN Founder Burn. No price, scarcity, or value claim attaches to a burn.",
    source: "src/lib/syndicate-config.ts · Proof of Burn records, each verifiable as a transfer to the dead address.",
    formula: "count of recorded Proof of Burn burn records",
    verification: {
      primaryHref: DEAD_HREF ?? SYN_HREF,
      links: links(synLink, avascanLink),
      refresh: REFRESH_FIXED,
    },
    legalSensitivity: "medium",
    displayPriority: 80,
    surfaces: ["activity", "registry"],
    dependencies: ["burnedSupply"],
    hook: "Proof of Burn #001 (config) / balanceOf(0x…dEaD)",
  }),
  m({
    id: "latestBurn",
    aliases: [],
    label: "Latest Burn",
    shortLabel: "Latest Burn",
    category: "burn",
    type: "RAW",
    status: "LIVE",
    unit: "text",
    description: `The most recent verified SYN burn — ${PROOF_OF_FIRE_001.label} (${PROOF_OF_FIRE_001.category}, ${PROOF_OF_FIRE_001.amountSyn.toLocaleString("en-US")} SYN). A manual, recognition-only transfer.`,
    source: "src/lib/syndicate-config.ts · Proof of Burn #001, verifiable on-chain as a transfer to the dead address.",
    formula: "most recent Proof of Burn record",
    verification: {
      primaryHref: DEAD_HREF ?? SYN_HREF,
      links: links(synLink, avascanLink),
      refresh: REFRESH_FIXED,
    },
    legalSensitivity: "medium",
    displayPriority: 81,
    surfaces: ["activity", "registry"],
    dependencies: ["burnedSupply"],
    hook: "Proof of Burn #001 (config)",
  }),

  // ── Activity (movements / classified transactions) ─────────────────────────
  m({
    id: "transactions",
    aliases: [],
    label: "Classified Transactions",
    shortLabel: "Transactions",
    category: "activity",
    type: "AGGREGATE",
    status: "LIVE",
    unit: "count",
    description:
      "The append-only registry of manually-classified protocol transactions, each linking to its on-chain proof.",
    source: "src/lib/transaction-tags.ts · canonical registry; every entry links to its on-chain tx.",
    formula: "append-only registry, each entry verified on an explorer",
    verification: {
      primaryHref: null,
      links: links(saleLink),
      refresh: REFRESH_MANUAL,
    },
    legalSensitivity: "low",
    displayPriority: 90,
    surfaces: ["transparency", "registry"],
    dependencies: [],
    hook: "TAGGED_TRANSACTIONS",
  }),
  m({
    id: "classifiedSpend",
    aliases: ["classifiedUsdcOut"],
    label: "Classified Spend",
    shortLabel: "Classified Spend",
    category: "activity",
    type: "AGGREGATE",
    status: "LIVE",
    unit: "USD",
    description:
      "Sum of USDC outflows across all manually-classified, on-chain-verified protocol transactions.",
    source: "Derived from TAGGED_TRANSACTIONS (USDC-tagged outflows).",
    formula: "sum(amount) where asset = USDC",
    verification: {
      primaryHref: null,
      links: links(usdcLink),
      refresh: REFRESH_MANUAL,
    },
    legalSensitivity: "medium",
    displayPriority: 91,
    surfaces: ["transparency", "registry"],
    dependencies: [],
    hook: "classifiedUsdcByTag",
  }),
];

// ─── Indexes + accessors ────────────────────────────────────────────────────

const BY_ID = new Map<string, ProtocolMetric>();
const ALIAS_INDEX = new Map<string, ProtocolMetric>();

for (const metric of PROTOCOL_METRICS) {
  if (BY_ID.has(metric.id)) {
    throw new Error(`[protocol-metrics-registry] duplicate metric id: "${metric.id}"`);
  }
  BY_ID.set(metric.id, metric);
  ALIAS_INDEX.set(metric.id, metric);
  for (const alias of metric.aliases) {
    const existing = ALIAS_INDEX.get(alias);
    if (existing && existing.id !== metric.id) {
      throw new Error(
        `[protocol-metrics-registry] alias "${alias}" maps to both "${existing.id}" and "${metric.id}"`,
      );
    }
    ALIAS_INDEX.set(alias, metric);
  }
}

/** All canonical ids, in registry (display-priority-authored) order. */
export const METRIC_IDS: string[] = PROTOCOL_METRICS.map((x) => x.id);

/** Resolve a metric by its canonical id OR any registered alias. */
export function getMetric(idOrAlias: string): ProtocolMetric | undefined {
  return ALIAS_INDEX.get(idOrAlias);
}

/**
 * Resolve a metric or throw — use at module top-level / binding sites where a
 * missing metric is a programming error that must fail loudly, never silently.
 */
export function requireMetric(idOrAlias: string): ProtocolMetric {
  const metric = ALIAS_INDEX.get(idOrAlias);
  if (!metric) {
    throw new Error(`[protocol-metrics-registry] no metric for "${idOrAlias}"`);
  }
  return metric;
}

/** The compact label if defined, else the full label. */
export function metricLabel(idOrAlias: string, compact = false): string | undefined {
  const metric = ALIAS_INDEX.get(idOrAlias);
  if (!metric) return undefined;
  return compact ? metric.shortLabel ?? metric.label : metric.label;
}

/** All metrics in a category, ordered by displayPriority. */
export function metricsByCategory(category: MetricCategory): ProtocolMetric[] {
  return PROTOCOL_METRICS.filter((x) => x.category === category).sort(
    (a, b) => a.displayPriority - b.displayPriority,
  );
}

/** All metrics recommended for a surface, ordered by displayPriority. */
export function metricsForSurface(surface: string): ProtocolMetric[] {
  return PROTOCOL_METRICS.filter((x) => x.surfaces.includes(surface)).sort(
    (a, b) => a.displayPriority - b.displayPriority,
  );
}

/** Every metric, ordered by displayPriority. */
export function allMetrics(): ProtocolMetric[] {
  return [...PROTOCOL_METRICS].sort((a, b) => a.displayPriority - b.displayPriority);
}
