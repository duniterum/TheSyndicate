// Protocol Health Registry — single source of truth for module-by-module
// health of The Syndicate. Consumed by:
//   • scripts/check-protocol-health.mjs (CLI health check)
//   • src/lib/__tests__/protocol-health.test.ts (invariant tests)
//
// Authority: docs/REALITY_REFLECTION_AUDIT.md (latest snapshot) +
//            docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md (gate policy).
//
// Rules:
//   • BLOCKER stops activation / deployment / release.
//   • HIGH must be fixed before next major release wave.
//   • WARN is reported, never blocks.
//   • MEDIUM/LOW go to docs/DEFERRED_WORK_LEDGER.md, not here.
//   • Small UI/copy changes do NOT require updating this registry.
//
// Keep entries terse. Long-form findings belong in audit docs.

export type ModuleStatus =
  | "LIVE"
  | "PARTIAL"
  | "PENDING"
  | "ROADMAP"
  | "BLOCKED";

export type HealthLevel = "PASS" | "WARN" | "BLOCKER";

export type CheckCategory =
  | "chain"
  | "registry"
  | "ui"
  | "docs"
  | "explorer"
  | "wallet"
  | "indexer"
  | "deferred"
  | "next-milestone";

export interface HealthFinding {
  category: CheckCategory;
  level: HealthLevel;
  message: string;
}

export interface ProtocolModule {
  moduleId: string;
  moduleName: string;
  /** Owner / primary source files. */
  sources: string[];
  /** Canonical data sources (registries, hooks, on-chain reads). */
  dataSources: string[];
  /** Live user-facing routes. */
  routes: string[];
  /** Contract registry keys involved (from src/lib/contract-registry.ts). */
  contracts: string[];
  status: ModuleStatus;
  health: HealthLevel;
  /** Categories validated for this module. */
  checks: CheckCategory[];
  /** Known deferred items (pointers, not full descriptions). */
  deferred: string[];
  /** Last verified source. */
  lastVerified: string;
  /** What blocks the next milestone for this module. "" = nothing. */
  nextMilestoneBlocker: string;
  /** Active findings — surfaced by the health script. */
  findings: HealthFinding[];
}

export const PROTOCOL_HEALTH_REGISTRY: ProtocolModule[] = [
  {
    moduleId: "core-site",
    moduleName: "Core site / navigation",
    sources: ["src/routes/__root.tsx", "src/router.tsx", "src/routes/index.tsx"],
    dataSources: ["src/lib/syndicate-config.ts"],
    routes: ["/", "/faq", "/risk", "/roadmap", "/docs"],
    contracts: [],
    status: "LIVE",
    health: "PASS",
    checks: ["ui", "docs"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "syn-token",
    moduleName: "SYN token",
    sources: ["src/lib/contract-registry.ts", "src/routes/token.tsx", "src/routes/tokenomics.tsx"],
    dataSources: ["src/lib/contract-registry.ts"],
    routes: ["/token", "/tokenomics"],
    contracts: ["SYN_TOKEN"],
    status: "LIVE",
    health: "PASS",
    checks: ["chain", "registry", "ui", "explorer"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "membership-sale",
    moduleName: "Membership Sale",
    sources: ["src/lib/sale-hooks.ts", "src/lib/sale-abi.ts", "src/components/syndicate/MembershipSale*"],
    dataSources: ["src/lib/contract-registry.ts", "src/lib/sale-hooks.ts"],
    routes: ["/join", "/"],
    contracts: ["MEMBERSHIP_SALE", "SYN_TOKEN", "USDC"],
    status: "LIVE",
    health: "PASS",
    checks: ["chain", "registry", "ui", "wallet", "explorer"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "wallet-payment",
    moduleName: "Wallet / session / payment flow",
    sources: [
      "src/lib/wallet-session.ts",
      "src/lib/wallet-freshness.ts",
      "src/lib/payment-flow.ts",
      "src/lib/tx-lifecycle.ts",
      "src/lib/tx-history.ts",
    ],
    dataSources: ["wagmi", "src/lib/chain-registry.ts"],
    routes: ["/my-syndicate", "/wallet/$address", "/labs/invariants"],
    contracts: ["USDC"],
    status: "LIVE",
    health: "PASS",
    checks: ["wallet", "chain", "explorer"],
    deferred: [],
    lastVerified: "docs/SALE_FLOW_INVARIANTS.md",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "nft-archive",
    moduleName: "Archive memory / Archive1155",
    sources: [
      "src/lib/archive-id-registry.ts",
      "src/lib/archive-config.ts",
      "src/lib/archive-nft-hooks.ts",
      "src/components/syndicate/MintFirstSignal.tsx",
      "src/components/syndicate/MintPatronSeal.tsx",
    ],
    dataSources: ["src/lib/archive-id-registry.ts", "useArchiveId()"],
    routes: ["/nft", "/nfts", "/archive"],
    contracts: ["ARCHIVE_1155"],
    status: "PARTIAL",
    health: "PASS",
    checks: ["chain", "registry", "ui", "explorer", "wallet"],
    deferred: ["ID 9 Protocol Chronicle not configured (intentional)"],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker:
      "Protocol Chronicle (ID 9) requires per-ID UI surface (~1 day) before activation.",
    findings: [],
  },
  {
    moduleId: "registry",
    moduleName: "Registry",
    sources: ["src/routes/registry.tsx", "src/lib/data-verification-registry.ts"],
    dataSources: ["src/lib/contract-registry.ts", "src/lib/chain-registry.ts"],
    routes: ["/registry"],
    contracts: ["SYN_TOKEN", "USDC", "MEMBERSHIP_SALE", "ARCHIVE_1155"],
    status: "LIVE",
    health: "PASS",
    checks: ["registry", "ui", "explorer"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "my-syndicate",
    moduleName: "My Syndicate / Member OS",
    sources: ["src/routes/my-syndicate.tsx", "src/lib/archive-balances-hook.ts"],
    dataSources: ["useArchiveBalances", "wagmi"],
    routes: ["/my-syndicate"],
    contracts: ["ARCHIVE_1155", "SYN_TOKEN"],
    status: "LIVE",
    health: "PASS",
    checks: ["chain", "ui", "wallet"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "activity-indexer",
    moduleName: "Activity / indexer",
    sources: [
      "src/lib/activity-hooks.ts",
      "src/lib/archive-indexer.ts",
      "src/lib/archive-indexer-health.ts",
      "src/lib/freshness-signals.ts",
      "src/components/syndicate/IndexerFreshnessBadge.tsx",
      "src/routes/api/public/indexer/health.ts",
    ],
    dataSources: ["RPC", "indexer probe"],
    routes: ["/activity"],
    contracts: ["ARCHIVE_1155", "MEMBERSHIP_SALE"],
    status: "PARTIAL",
    health: "WARN",
    checks: ["indexer", "chain"],
    deferred: ["Indexer probe currently returns PENDING (mock) — surfaced honestly in UI"],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [
      {
        category: "indexer",
        level: "WARN",
        message:
          "Indexer probe is mock/PENDING — visible in IndexerFreshnessBadge; RPC fallback is live.",
      },
    ],
  },
  {
    moduleId: "vault-transparency",
    moduleName: "Vault / routing / transparency",
    sources: ["src/routes/transparency.tsx", "src/routes/vault.tsx", "src/components/syndicate/TreasuryComposition.tsx"],
    dataSources: ["src/lib/treasury-hooks.ts", "src/lib/chain-registry.ts"],
    routes: ["/transparency", "/vault"],
    contracts: ["MEMBERSHIP_SALE"],
    status: "LIVE",
    health: "PASS",
    checks: ["chain", "ui", "docs", "explorer"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "liquidity",
    moduleName: "Liquidity / LP",
    sources: ["src/routes/liquidity.tsx", "src/components/syndicate/LpStatus.tsx"],
    dataSources: ["Trader Joe pair on Avalanche"],
    routes: ["/liquidity"],
    contracts: [],
    status: "LIVE",
    health: "PASS",
    checks: ["chain", "ui", "explorer"],
    deferred: [],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "docs",
    moduleName: "Docs / FAQ / whitepaper",
    sources: ["src/routes/docs.tsx", "src/routes/faq.tsx", "src/routes/whitepaper.tsx", "docs/"],
    dataSources: ["docs/DOCUMENTATION_AUTHORITY_MAP.md"],
    routes: ["/docs", "/faq", "/whitepaper"],
    contracts: [],
    status: "LIVE",
    health: "WARN",
    checks: ["docs", "ui"],
    deferred: [
      "Historical audit docs (NFT_ARCHIVE_EXPLAINED.md, NFT_FINAL_ARCHITECTURE_AUDIT.md, NFT_ARCHIVE_VERIFIABILITY_MATRIX.md, SMART_CONTRACTS_DEFERRED.md) describe Patron Seal as DEFERRED — historical snapshot. ID 3 is now LIVE. Each doc carries a top-of-file historical note pointing to /protocol-health and REALITY_REFLECTION_AUDIT.md as current truth.",
    ],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [
      {
        category: "docs",
        level: "WARN",
        message:
          "Stale 'Patron Seal DEFERRED' language remains in historical docs, but each affected doc now carries a top-of-file historical note. Current routes /nft, /transparency, /whitepaper are accurate.",
      },
    ],
  },
  {
    moduleId: "explorer-links",
    moduleName: "Explorer links",
    sources: ["src/lib/chain-registry.ts", "src/lib/explorer-preference.ts", "src/lib/explorer-guard.ts"],
    dataSources: ["chain-registry helpers"],
    routes: ["/x/tx/$hash"],
    contracts: [],
    status: "LIVE",
    health: "WARN",
    checks: ["explorer"],
    deferred: ["4 residual hand-built explorer literals remain: 3 in MetaMaskExplorerFix.tsx (intentional — that component demonstrates and repairs broken wallet-side explorer URLs) and 1 in src/labs/components/ShareableCards.tsx (labs/noindex, low-risk)."],
    lastVerified: "scripts/check-explorer-canonical.mjs (2026-06-08)",
    nextMilestoneBlocker: "",
    findings: [
      {
        category: "explorer",
        level: "WARN",
        message:
          "4 residual manual explorer URLs detected (down from 30 after canonical migration). All in MetaMaskExplorerFix.tsx (intentional — that component literally exists to fix wallet-side broken URLs) or src/labs/ (noindex). No known-broken avascan.info/tx/<hash> patterns present.",
      },
    ],
  },
  {
    moduleId: "deferred-ledger",
    moduleName: "Deferred Work Ledger",
    sources: ["docs/DEFERRED_WORK_LEDGER.md"],
    dataSources: ["docs/DEFERRED_WORK_LEDGER.md"],
    routes: [],
    contracts: [],
    status: "LIVE",
    health: "PASS",
    checks: ["docs"],
    deferred: [],
    lastVerified: "docs/DEFERRED_WORK_LEDGER.md",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "execution-gates",
    moduleName: "Execution Gates",
    sources: ["src/lib/execution-gates.ts", "scripts/check-execution-gates.mjs"],
    dataSources: ["docs/PROTOCOL_EXECUTION_CONTROL_SYSTEM.md"],
    routes: [],
    contracts: [],
    status: "LIVE",
    health: "PASS",
    checks: ["registry", "docs"],
    deferred: [],
    lastVerified: "scripts/check-execution-gates.mjs",
    nextMilestoneBlocker: "",
    findings: [],
  },
  {
    moduleId: "protocol-chronicle",
    moduleName: "Future: Protocol Chronicle (ID 9)",
    sources: ["src/lib/archive-id-registry.ts"],
    dataSources: ["TBD — currently NOT_CONFIGURED on chain"],
    routes: [],
    contracts: ["ARCHIVE_1155"],
    status: "ROADMAP",
    health: "PASS",
    checks: ["next-milestone"],
    deferred: ["Per-ID UI surface; on-chain configure(9, …) call"],
    lastVerified: "docs/REALITY_REFLECTION_AUDIT.md (2026-06-08)",
    nextMilestoneBlocker:
      "Requires: (1) ID 9 visual + copy direction, (2) configure(9) tx, (3) /nft section, (4) registry update.",
    findings: [],
  },
  {
    moduleId: "seat-record-721",
    moduleName: "Future: SeatRecord721",
    sources: ["src/lib/contract-registry.ts"],
    dataSources: ["TBD — address: null in registry, status PENDING"],
    routes: [],
    contracts: ["SEAT_RECORD_721"],
    status: "ROADMAP",
    health: "PASS",
    checks: ["next-milestone"],
    deferred: ["Solidity, deployment, ABI, integration — all pending product decision"],
    lastVerified: "docs/SEAT_RECORD_ARCHITECTURE_DECISION.md",
    nextMilestoneBlocker:
      "Frozen pending architecture decision. Do not start until Protocol Chronicle is live.",
    findings: [],
  },
];

export interface AggregatedHealth {
  totalModules: number;
  blockers: number;
  warnings: number;
  passes: number;
  byStatus: Record<ModuleStatus, number>;
  worstLevel: HealthLevel;
}

export function aggregateHealth(modules: ProtocolModule[] = PROTOCOL_HEALTH_REGISTRY): AggregatedHealth {
  const byStatus: Record<ModuleStatus, number> = {
    LIVE: 0, PARTIAL: 0, PENDING: 0, ROADMAP: 0, BLOCKED: 0,
  };
  let blockers = 0, warnings = 0, passes = 0;
  for (const m of modules) {
    byStatus[m.status]++;
    const hasBlocker = m.health === "BLOCKER" || m.findings.some((f) => f.level === "BLOCKER");
    const hasWarn = m.health === "WARN" || m.findings.some((f) => f.level === "WARN");
    if (hasBlocker) blockers++;
    else if (hasWarn) warnings++;
    else passes++;
  }
  const worstLevel: HealthLevel = blockers > 0 ? "BLOCKER" : warnings > 0 ? "WARN" : "PASS";
  return { totalModules: modules.length, blockers, warnings, passes, byStatus, worstLevel };
}
