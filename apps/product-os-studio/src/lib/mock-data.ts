// ALL VALUES BELOW ARE PROTOTYPE DATA.
// Canonical truths (routing split, ZERO_SOURCE_ID, module statuses, doctrine) are accurate.
// Addresses and balances are SIMULATED unless explicitly marked canonical.

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

  // Protocol-level snapshot for the flagship hero. PROTOTYPE / SIMULATED values —
  // no canonical on-chain figures exist in the repo. Routing math is canonical 70/20/10
  // (routeUsdc(usdcRouted) yields vault 5,915 / liquidity 1,690 / operations 845).
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

  // Wallet endpoints for routing. SIMULATED addresses (not canonical in prototype).
  routingWallets: [
    { name: "Vault", pct: 70, address: "0xVAULT...SIMULATED", mocked: true, purpose: "Protocol-controlled reserve" },
    { name: "Liquidity", pct: 20, address: "0xLIQ...SIMULATED", mocked: true, purpose: "Liquidity depth" },
    { name: "Operations", pct: 10, address: "0xOPS...SIMULATED", mocked: true, purpose: "Operational capacity" },
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

  // Contract architecture layers. No canonical addresses exist in the prototype, so every
  // address is MOCKED and explorer links are inert. Statuses/read models reflect doctrine intent.
  contractLayers: [
    { name: "MembershipSaleV3", status: "LIVE NOW", address: "0xMEMBERSHIP...SIMULATED", explorerUrl: "#", mocked: true, purpose: "Process USDC into SYN", action: "Buy", event: "MembershipPurchased", readModel: "Subgraph indexing", uiSurface: "/join", risk: "Low", activationGate: "Founder Multisig" },
    { name: "SourceRegistryV1", status: "IN REVIEW", address: "0xSOURCE...SIMULATED", explorerUrl: "#", mocked: true, purpose: "Track verified introductions", action: "None", event: "SourceRegistered", readModel: "Direct Contract Read", uiSurface: "/referral", risk: "Low", activationGate: "Internal Review" },
    { name: "SYN token", status: "LIVE NOW", address: "0xSYN...SIMULATED", explorerUrl: "#", mocked: true, purpose: "Accounting unit", action: "Hold", event: "Transfer", readModel: "ERC20 Standard", uiSurface: "/wallet", risk: "Low", activationGate: "Live" },
    { name: "USDC", status: "LIVE NOW", address: "0xUSDC...SIMULATED", explorerUrl: "#", mocked: true, purpose: "Capital input", action: "Approve/Spend", event: "Approval/Transfer", readModel: "ERC20 Standard", uiSurface: "/join", risk: "Low", activationGate: "Live" },
    { name: "Archive1155", status: "LIVE NOW", address: "0xARCHIVE...SIMULATED", explorerUrl: "#", mocked: true, purpose: "Memory artifacts", action: "Collect", event: "TransferSingle", readModel: "ERC1155 Standard", uiSurface: "/archive", risk: "Low", activationGate: "Live" },
    { name: "SeatRecord721", status: "FUTURE", address: "Not yet deployed", explorerUrl: "#", mocked: true, purpose: "Identity", action: "Claim", event: "Issue", readModel: "ERC721 Standard", uiSurface: "/seat-record", risk: "Medium", activationGate: "V2 Roadmap" },
    { name: "ProductSaleRouter", status: "FUTURE", address: "Not yet deployed", explorerUrl: "#", mocked: true, purpose: "B2B allocations & products", action: "Route Funds", event: "ProductRouted", readModel: "Custom Indexer", uiSurface: "External B2B", risk: "High", activationGate: "V3 Roadmap" },
    { name: "SwapRail", status: "FUTURE", address: "Not yet deployed", explorerUrl: "#", mocked: true, purpose: "Provider layer swaps", action: "Swap", event: "RailExecuted", readModel: "Aggregator API", uiSurface: "Internal/Hidden", risk: "High", activationGate: "V3 Roadmap" }
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
