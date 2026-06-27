// MOST VALUES BELOW ARE PROTOTYPE DATA (balances, member, activity, receipts, notifications).
// Canonical truths (routing split, ZERO_SOURCE_ID, module statuses, doctrine) are accurate.
//
// The ONLY real on-chain values live in PRODUCTION_PROOF below: canonical contract / address /
// burn constants copied VERBATIM from the production porting map
// (docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md). They are surfaced ONLY as clearly
// labeled READ-ONLY PRODUCTION PROOF — static references. NOTHING is wired: no chain is read,
// no ABI is imported, no contract is called. A live read/write is ADAPTER REQUIRED (Codex bridge).

// Canonical USDC routing — 70% Vault / 20% Liquidity / 10% Operations.
export const ROUTING_SPLIT = { vault: 70, liquidity: 20, operations: 10 } as const;

// Compute a routing breakdown for a given USDC amount using canonical split.
export function routeUsdc(amount: number) {
  return {
    vault: +(amount * ROUTING_SPLIT.vault / 100).toFixed(2),
    liquidity: +(amount * ROUTING_SPLIT.liquidity / 100).toFixed(2),
    operations: +(amount * ROUTING_SPLIT.operations / 100).toFixed(2),
  };
}

// ---------------------------------------------------------------------------
// READ-ONLY PRODUCTION PROOF
// Canonical on-chain constants copied VERBATIM from the production porting map
// (docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md). These are the only real values in
// this file. They are STATIC PROOF ONLY: the Studio reads no chain, imports no ABI, and calls
// no contract. A live read or write is ADAPTER REQUIRED (future Codex bridge).
// ---------------------------------------------------------------------------
export const AVALANCHE_CHAIN_ID = 43114; // Avalanche C-Chain.

/** Snowtrace (Avalanche C-Chain explorer) address URL — a static, read-only reference. */
export function snowtraceAddress(address: string): string {
  return `https://snowtrace.io/address/${address}`;
}

/** Snowtrace transaction URL — a static, read-only reference. */
export function snowtraceTx(hash: string): string {
  return `https://snowtrace.io/tx/${hash}`;
}

export const PRODUCTION_PROOF = {
  chainId: AVALANCHE_CHAIN_ID,
  chain: "Avalanche C-Chain",
  // Tokens (ERC-20)
  syn: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  usdc: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  // Membership sale engines
  membershipSaleV3: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E", // active
  membershipSaleV1: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d", // historical (sealed)
  // Source policy registry (deployed; policy PAUSED, referral not live)
  sourceRegistryV1: "0x780013bB358be6be95b401901264FC7c22a595a6",
  // Archive (ERC-1155 protocol memory)
  archive1155: "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d",
  // Routing wallets (70% / 20% / 10%)
  vaultWallet: "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  liquidityWallet: "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  operationsWallet: "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  membershipSynWallet: "0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8",
  // Liquidity venue (Trader Joe SYN/USDC LP pair)
  traderJoeLpPair: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
  // Burn
  synBurnAddress: "0x000000000000000000000000000000000000dEaD",
  // Proof of Fire #001 — verified founder burn (read-only production proof)
  proofOfFire001: {
    proofNumber: "PROOF_OF_FIRE_001",
    amountSyn: 1000,
    category: "Founder Burn",
    txHash: "0x2db110b1406bdee0bb98a0ad9a8c941052fbe02049d99b30a3b09934d6a12d47",
    block: 87703847,
  },
} as const;

export const MOCK_DATA = {
  wallet: "0xDDF3...02BD0",
  walletFull: "0xDDF3a1B2c3D4e5F60718293a4b5C6d7E8f902BD0",
  memberNumber: "#9",
  chapter: "Genesis Signal",
  usdcRouted: 150,
  synAcquired: 15000,
  contributionDepth: "Foundational",
  sourceStatus: "paused",
  defaultSourceId: "ZERO_SOURCE_ID",
  buyTarget: "MembershipSaleV3",
  referralActive: false,
  claimUiActive: false,
  sourceDashboardLive: false,
  seatRecordLive: false,
  avaxBalance: 12.4,
  usdcBalance: 2500,
  synBalance: 15000,
  network: "Avalanche C-Chain",

  routingSplit: ROUTING_SPLIT,

  // Protocol-level snapshot for the flagship hero. PROTOTYPE / SIMULATED counts —
  // illustrative, not live chain reads. Routing math is canonical 70% / 20% / 10%
  // (routeUsdc(usdcRouted) yields vault 5,915 / liquidity 1,690 / operations 845).
  // NOTE: burnedSyn is a SIMULATED aggregate; the only verified burn is the READ-ONLY
  // PRODUCTION PROOF PROOF_OF_FIRE_001 (1,000 SYN) — see PRODUCTION_PROOF + fire-ledger.ts.
  protocolStats: {
    chapter: "Genesis Signal",
    chapterIndex: 10,
    chapterTotal: 333,
    members: 10,
    seatAvailable: 11,
    usdcRouted: 8450,
    protocolControlled: 7605,
    burnedSyn: 10000,
    mocked: true,
  },

  // Doctrine line — verbatim, used across surfaces.
  doctrine: "The Syndicate recognizes capital without reducing identity to capital.",

  // The emotional loop the product reinforces.
  loop: ["Join", "Prove", "Remember", "Return", "Evolve"],

  // Live Now board statuses for public home + evolution.
  liveBoard: [
    { name: "Membership / Join", status: "LIVE NOW", surface: "/member/join" },
    { name: "My Syndicate", status: "LIVE NOW", surface: "/member/my-syndicate" },
    { name: "Activity", status: "READ-ONLY", surface: "/member/activity" },
    { name: "Economy / Transparency", status: "READ-ONLY", surface: "/member/transparency" },
    { name: "Registry", status: "READ-ONLY", surface: "/member/registry" },
    { name: "Evolution", status: "READ-ONLY", surface: "/member/evolution" },
    { name: "Archive / NFT Memory", status: "LIVE NOW", surface: "/member/archive" },
    { name: "Referral / Verified Introduction", status: "V1 CANDIDATE", surface: "/member/referral" },
    { name: "SeatRecord721", status: "FUTURE", surface: "/member/seat-record" },
    { name: "ProductSaleRouter", status: "FUTURE", surface: "/member/architecture" },
    { name: "SwapRail", status: "FUTURE", surface: "/member/architecture" },
  ],

  // Trust boundaries — short, professional, shown on public + economy surfaces.
  trustBoundaries: [
    "No yield",
    "No passive income",
    "No governance promise",
    "No treasury claim",
    "No public referral activation",
    "No claim UI",
    "No source dashboard live",
    "No public source-aware buy path live",
    "NFTs are memory, not financial rights",
  ],

  // Eleven recognition axes — multi-axis standing, not a pay-to-win ladder.
  recognitionAxes: [
    { name: "Capital", level: 72, note: "Verified USDC routed through receipts." },
    { name: "Connector", level: 18, note: "Verified introductions (V1 candidate)." },
    { name: "Builder", level: 34, note: "Contributions to protocol surfaces." },
    { name: "Operator", level: 12, note: "Operational participation." },
    { name: "Verifier", level: 41, note: "Proof and transparency engagement." },
    { name: "Historian", level: 28, note: "Archive and chronicle participation." },
    { name: "Steward", level: 22, note: "Long-term protocol care." },
    { name: "Infrastructure", level: 9, note: "Infra contributions." },
    { name: "Security", level: 14, note: "Security review participation." },
    { name: "Legal / Compliance", level: 6, note: "Compliance contributions." },
    { name: "Time / Loyalty", level: 55, note: "Tenure since Genesis Signal." },
  ],

  // Wallet endpoints for routing. READ-ONLY PRODUCTION PROOF addresses copied from the
  // porting map (PRODUCTION_PROOF) — static references with read-only explorer links only.
  // Nothing is wired; a live balance read is ADAPTER REQUIRED.
  routingWallets: [
    { name: "Vault", pct: 70, address: PRODUCTION_PROOF.vaultWallet, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.vaultWallet), mocked: false, proof: true, purpose: "Protocol-controlled reserve (70%)" },
    { name: "Liquidity", pct: 20, address: PRODUCTION_PROOF.liquidityWallet, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.liquidityWallet), mocked: false, proof: true, purpose: "Liquidity depth (20%)" },
    { name: "Operations", pct: 10, address: PRODUCTION_PROOF.operationsWallet, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.operationsWallet), mocked: false, proof: true, purpose: "Operational capacity (10%)" },
  ],

  activities: [
    { id: 1, type: "membership", category: "Member", title: "Membership Acquired", date: "10 mins ago", value: "150 USDC", status: "confirmed", proof: "On-chain", hash: "0x8fa3...b2c9" },
    { id: 2, type: "routing", category: "Economy", title: "Vault Allocation", date: "11 mins ago", value: "105 USDC", status: "confirmed", proof: "On-chain", hash: "0x8fa3...b2c9" },
    { id: 3, type: "routing", category: "Economy", title: "Liquidity Allocation", date: "11 mins ago", value: "30 USDC", status: "confirmed", proof: "On-chain", hash: "0x8fa3...b2c9" },
    { id: 4, type: "routing", category: "Economy", title: "Operations Allocation", date: "11 mins ago", value: "15 USDC", status: "confirmed", proof: "On-chain", hash: "0x8fa3...b2c9" },
    { id: 5, type: "archive", category: "Memory", title: "Archive Artifact Anchored", date: "2 hours ago", value: "Genesis Signal #9", status: "confirmed", proof: "ERC-1155", hash: "0x2bc1...9d4e" },
    { id: 6, type: "source", category: "Source", title: "Source Attribution Recorded", date: "5 hours ago", value: "ZERO_SOURCE_ID", status: "internal", proof: "Internal", hash: "0x5ed4...3a1f" },
    { id: 7, type: "membership", category: "Member", title: "Membership Acquired", date: "8 hours ago", value: "500 USDC", status: "confirmed", proof: "On-chain", hash: "0x91ab...77de" },
    { id: 8, type: "milestone", category: "Chapter", title: "Chapter Advanced: Genesis Signal", date: "1 day ago", value: "Protocol Milestone", status: "milestone", proof: "Protocol", hash: "" },
    { id: 9, type: "source", category: "Source", title: "Source Registry Paused", date: "1 day ago", value: "SourceRegistryV1", status: "internal", proof: "Internal", hash: "0x2C4A...9B3D" },
    { id: 10, type: "milestone", category: "Chapter", title: "V3 Engine Activated", date: "3 days ago", value: "Protocol Milestone", status: "milestone", proof: "Protocol", hash: "" }
  ],

  protocolEpisodes: [
    { id: 1, name: "Membership V3 Engine", status: "LIVE NOW", date: "Jan 2024", desc: "Core membership layer live." },
    { id: 2, name: "Activity & Transparency", status: "LIVE NOW", date: "Feb 2024", desc: "Verifiable feeds activated." },
    { id: 3, name: "Source Attribution", status: "IN REVIEW", date: "Pending", desc: "Internal proof of source routing." },
    { id: 4, name: "Verified Introduction", status: "V1 CANDIDATE", date: "Candidate", desc: "Manual source attribution." },
    { id: 5, name: "SeatRecord721", status: "FUTURE", date: "Future", desc: "Identity as NFT." }
  ],

  // SIMULATED transactions. Hashes are not real; explorer links are inert in the prototype.
  transactions: [
    { id: "tx1", hash: "0x123...abc", type: "Approve USDC", status: "confirmed", time: "2h ago", explorerUrl: "#", mocked: true },
    { id: "tx2", hash: "0x456...def", type: "Buy Membership", status: "pending", time: "1m ago", explorerUrl: "#", mocked: true },
    { id: "tx3", hash: "0x789...ghi", type: "Simulated Claim", status: "failed", time: "1d ago", explorerUrl: "#", mocked: true },
  ],

  approvals: [
    { token: "USDC", contract: "MembershipSaleV3", amount: "Unlimited", status: "approved" },
    { token: "SYN", contract: "FutureStakingV1", amount: "0.0", status: "revoked" }
  ],

  archiveItems: [
    { id: "m1", name: "Genesis Signal Artifact", type: "ERC1155", date: "Jan 2024", description: "Proof of early protocol alignment." },
    { id: "m2", name: "V3 Participant", type: "ERC1155", date: "Feb 2024", description: "Memory of V3 launch." }
  ],

  // Contract architecture layers.
  // Production-deployed contracts carry their canonical address as READ-ONLY PRODUCTION PROOF
  // (from PRODUCTION_PROOF / the porting map): a static reference with a read-only explorer
  // link — nothing is wired (a live read/write is ADAPTER REQUIRED). Undeployed/roadmap and
  // Studio-only concepts stay FUTURE with no canonical address (proof: false).
  contractLayers: [
    { name: "MembershipSaleV3", status: "LIVE NOW", proof: true, address: PRODUCTION_PROOF.membershipSaleV3, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.membershipSaleV3), mocked: false, purpose: "Active V3 membership sale: USDC in, SYN acquired (default ZERO_SOURCE_ID)", action: "None (ADAPTER REQUIRED)", event: "MembershipPurchasedV3", readModel: "Purchase-event scan (adapter)", uiSurface: "/join", risk: "Low", activationGate: "Live (active V3 engine)" },
    { name: "MembershipSaleV1", status: "READ-ONLY", proof: true, address: PRODUCTION_PROOF.membershipSaleV1, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.membershipSaleV1), mocked: false, purpose: "Historical V1 membership sale (sealed)", action: "None", event: "MembershipPurchased", readModel: "Historical event scan (adapter)", uiSurface: "/registry", risk: "Low", activationGate: "Historical" },
    { name: "SourceRegistryV1", status: "PAUSED", proof: true, address: PRODUCTION_PROOF.sourceRegistryV1, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.sourceRegistryV1), mocked: false, purpose: "Source policy registry — deployed; policy PAUSED, referral/claim not live", action: "None", event: "SourceRegistered", readModel: "Direct contract read (adapter)", uiSurface: "/referral", risk: "Low", activationGate: "Paused (founder review)" },
    { name: "SYN token", status: "LIVE NOW", proof: true, address: PRODUCTION_PROOF.syn, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.syn), mocked: false, purpose: "Accounting unit (ERC-20)", action: "Hold", event: "Transfer", readModel: "ERC-20 standard (adapter)", uiSurface: "/wallet", risk: "Low", activationGate: "Live" },
    { name: "USDC", status: "LIVE NOW", proof: true, address: PRODUCTION_PROOF.usdc, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.usdc), mocked: false, purpose: "Capital input (ERC-20)", action: "Approve/Spend (ADAPTER REQUIRED)", event: "Approval/Transfer", readModel: "ERC-20 standard (adapter)", uiSurface: "/join", risk: "Low", activationGate: "Live" },
    { name: "Archive1155", status: "LIVE NOW", proof: true, address: PRODUCTION_PROOF.archive1155, explorerUrl: snowtraceAddress(PRODUCTION_PROOF.archive1155), mocked: false, purpose: "Protocol-memory artifacts (ERC-1155) — not a seat, not source-aware, no financial rights", action: "Collect (ADAPTER REQUIRED)", event: "TransferSingle", readModel: "ERC-1155 standard (adapter)", uiSurface: "/archive", risk: "Low", activationGate: "Live" },
    { name: "SeatRecord721", status: "FUTURE", proof: false, address: "Not yet deployed", explorerUrl: "#", mocked: true, purpose: "Future identity record (ERC-721) — reserved as Archive ID 2 pointer; not deployed", action: "None", event: "Issue", readModel: "ERC-721 standard (future)", uiSurface: "/seat-record", risk: "Medium", activationGate: "V2 roadmap" },
    { name: "ProductSaleRouter", status: "FUTURE", proof: false, address: "Not in production porting map", explorerUrl: "#", mocked: true, purpose: "Studio concept only — not part of production truth (absent from the porting map)", action: "None", event: "—", readModel: "—", uiSurface: "/architecture", risk: "—", activationGate: "Concept (not in porting map)" },
    { name: "SwapRail", status: "FUTURE", proof: false, address: "Not in production porting map", explorerUrl: "#", mocked: true, purpose: "Studio concept only — not part of production truth (absent from the porting map)", action: "None", event: "—", readModel: "—", uiSurface: "/architecture", risk: "—", activationGate: "Concept (not in porting map)" }
  ],

  // Three-tier economy framing for the Economy / Transparency surface.
  economy: {
    protocol: {
      totalUsdcRouted: "8,450 USDC",
      vault: "5,915 USDC",
      liquidity: "1,690 USDC",
      operations: "845 USDC",
    },
    ecosystem: [
      { name: "Live membership engine", status: "LIVE NOW" },
      { name: "Archive memory", status: "LIVE NOW" },
      { name: "Verified Introduction (source acquisition)", status: "V1 CANDIDATE" },
      { name: "ProductSaleRouter", status: "FUTURE" },
      { name: "SwapRail", status: "FUTURE" },
      { name: "Institutional services", status: "FUTURE" },
    ],
  },

  receipts: {
    lastPurchase: {
      txHash: "0x8fa3...b2c9",
      amount: "150 USDC",
      synAcquired: "15,000 SYN",
      routing: "Vault (105) / Liquidity (30) / Operations (15)",
      timestamp: new Date().toISOString(),
    },
    sampleReceipts: [
      { id: "rcpt_1", hash: "0x8fa3...b2c9", amount: "150 USDC", routing: "70% Vault / 20% Liquidity / 10% Operations", timestamp: "Jan 12, 2024 14:32 UTC" },
      { id: "rcpt_2", hash: "0x2bc1...9d4e", amount: "500 USDC", routing: "70% Vault / 20% Liquidity / 10% Operations", timestamp: "Jan 15, 2024 09:15 UTC" },
      { id: "rcpt_3", hash: "0x5ed4...3a1f", amount: "2000 USDC", routing: "70% Vault / 20% Liquidity / 10% Operations", timestamp: "Jan 20, 2024 18:45 UTC" }
    ]
  },

  // SIMULATED notifications for the member notification center. Prototype only.
  notifications: [
    { id: "n1", category: "Receipt", title: "Receipt anchored", body: "Your 150 USDC membership receipt is confirmed and verifiable in Activity.", time: "10 mins ago", unread: true, surface: "/member/activity" },
    { id: "n2", category: "Evolution", title: "The institution moved", body: "Activity & Transparency feeds updated while you were away.", time: "3 days ago", unread: true, surface: "/member/evolution" },
    { id: "n3", category: "Source", title: "Source status unchanged", body: "Verified Introduction remains a V1 candidate. No public source link is live.", time: "1 day ago", unread: false, surface: "/member/referral" },
    { id: "n4", category: "Release", title: "Module under review", body: "SourceRegistryV1 is in founder review before any activation.", time: "2 days ago", unread: false, surface: "/member/registry" },
    { id: "n5", category: "Security", title: "Simulated session", body: "This is a prototype session. No real wallet is connected and no transactions are sent.", time: "Now", unread: false, surface: "/member/settings" },
  ],
};
