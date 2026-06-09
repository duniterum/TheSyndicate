/**
 * Chain / Contract / Archive1155-ID registry guards.
 *
 * Locks the invariants in:
 *   - src/lib/chain-registry.ts
 *   - src/lib/contract-registry.ts
 *   - src/lib/archive-id-registry.ts
 *   - docs/CANONICAL_REGISTRY.md
 *   - docs/ACTIVATION_RUNBOOK.md
 *
 * READ-ONLY. Does not import wagmi/viem. Does not touch contracts.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  CHAIN_REGISTRY,
  EXPLORER_REGISTRY,
  txUrl,
  addressUrl,
  tokenUrl,
  contractUrl,
  erc1155TokenUrl,
} from "../chain-registry";
import {
  CONTRACT_REGISTRY,
  contractByKey,
  pendingContracts,
} from "../contract-registry";
import {
  ARCHIVE_ID_REGISTRY,
  archiveIdEntry,
  isPublicMintEligible,
  publicMintIds,
} from "../archive-id-registry";
import { CONTRACTS } from "../syndicate-config";
import { avalanche } from "../wagmi";

const ROOT = join(__dirname, "..", "..", "..");
const SRC = join(ROOT, "src");

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "dist") continue;
      walk(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

const SRC_FILES = walk(SRC);
const SAMPLE_TX = "0x96eb7b1379be3c1d4526c7d07aeff6617a9630ff50ec663efb68f339d55362f0";

// ─── Chain registry ───────────────────────────────────────────────────────

describe("CHAIN_REGISTRY", () => {
  it("is Avalanche C-Chain 43114 with AVAX native currency", () => {
    expect(CHAIN_REGISTRY.id).toBe(43114);
    expect(CHAIN_REGISTRY.nativeCurrency.symbol).toBe("AVAX");
    expect(CHAIN_REGISTRY.name).toBe("Avalanche C-Chain");
  });

  it("has a primary + fallback RPC", () => {
    expect(CHAIN_REGISTRY.rpc.primary).toMatch(/^https:\/\//);
    expect(CHAIN_REGISTRY.rpc.fallback).toMatch(/^https:\/\//);
  });

  it("wagmi default explorer is a bare origin (MetaMask-safe)", () => {
    const u = new URL(avalanche.blockExplorers.default.url);
    expect(u.pathname).toBe("/");
  });
});

describe("EXPLORER_REGISTRY paths", () => {
  it("Avascan tx path MUST be /blockchain/c/tx/{hash}, never bare /tx/", () => {
    expect(EXPLORER_REGISTRY.avascan.paths.tx).toBe("/blockchain/c/tx/{hash}");
    expect(EXPLORER_REGISTRY.avascan.unsupported.bareTxPath).toBe("/tx/{hash}");
  });

  it("Snowtrace tx path is bare /tx/{hash}", () => {
    expect(EXPLORER_REGISTRY.snowtrace.paths.tx).toBe("/tx/{hash}");
  });
});

describe("Canonical explorer helpers", () => {
  it("txUrl returns Snowtrace and rejects bad input", () => {
    expect(txUrl(SAMPLE_TX)).toBe(`https://snowtrace.io/tx/${SAMPLE_TX}`);
    expect(txUrl(null)).toBeNull();
    expect(txUrl("not-a-hash")).toBeNull();
  });

  it("addressUrl / contractUrl uses Avascan C-Chain /address/", () => {
    expect(addressUrl(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS)).toBe(
      `https://avascan.info/blockchain/c/address/${CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS}`,
    );
    expect(contractUrl("PENDING")).toBeNull();
    expect(addressUrl(null)).toBeNull();
  });

  it("tokenUrl points to Snowtrace token page", () => {
    expect(tokenUrl(CONTRACTS.SYN_CONTRACT_ADDRESS)).toBe(
      `https://snowtrace.io/token/${CONTRACTS.SYN_CONTRACT_ADDRESS}`,
    );
  });

  it("erc1155TokenUrl includes contract + token id", () => {
    const u = erc1155TokenUrl(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS, 3);
    expect(u).toContain(CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS);
    expect(u).toContain("a=3");
  });
});

// ─── Contract registry ────────────────────────────────────────────────────

describe("CONTRACT_REGISTRY", () => {
  it("every LIVE entry has an explorer URL and a live address", () => {
    for (const c of CONTRACT_REGISTRY) {
      if (c.status === "LIVE") {
        expect(c.address, c.key).toMatch(/^0x[a-fA-F0-9]{40}$/);
        expect(c.explorerUrl, c.key).toMatch(/^https:\/\//);
        expect(c.chainId).toBe(43114);
      }
    }
  });

  it("every PENDING entry MUST have address:null (no inferred addresses)", () => {
    for (const c of pendingContracts()) {
      expect(c.address, c.key).toBeNull();
      expect(c.explorerUrl, c.key).toBeNull();
    }
  });

  it("SEAT_RECORD_721 is PENDING with address null", () => {
    const e = contractByKey("SEAT_RECORD_721")!;
    expect(e.status).toBe("PENDING");
    expect(e.address).toBeNull();
  });

  it("Archive1155 + SYN + USDC + Sale + LP are LIVE", () => {
    for (const k of ["ARCHIVE_1155", "SYN_TOKEN", "USDC", "MEMBERSHIP_SALE", "LP_PAIR"]) {
      expect(contractByKey(k)?.status, k).toBe("LIVE");
    }
  });
});

// ─── Archive ID registry ──────────────────────────────────────────────────

describe("ARCHIVE_ID_REGISTRY", () => {
  it("covers IDs 1–9", () => {
    expect(ARCHIVE_ID_REGISTRY.map((e) => e.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("ID 1 (First Signal) is LIVE public mint at 0.50 USDC", () => {
    const e = archiveIdEntry(1)!;
    expect(e.activation).toBe("LIVE_PUBLIC_MINT");
    expect(e.priceUsdc).toBe(0.5);
    expect(e.publicMintAllowed).toBe(true);
  });

  it("ID 3 (Patron Seal) is LIVE public mint at 5.00 USDC, wallet limit 5, supply 10,000", () => {
    const e = archiveIdEntry(3)!;
    expect(e.activation).toBe("LIVE_PUBLIC_MINT");
    expect(e.priceUsdc).toBe(5);
    expect(e.walletLimit).toBe(5);
    expect(e.maxSupply).toBe(10_000);
  });

  it("ID 2 NEVER allows public mint", () => {
    const e = archiveIdEntry(2)!;
    expect(e.activation).toBe("RESERVED_DISABLED");
    expect(e.publicMintAllowed).toBe(false);
    expect(isPublicMintEligible(2)).toBe(false);
  });

  it("IDs 4–8 are OWNER_ONLY (no public CTA)", () => {
    for (const id of [4, 5, 6, 7, 8]) {
      const e = archiveIdEntry(id)!;
      expect(e.activation, `ID ${id}`).toBe("OWNER_ONLY");
      expect(e.publicMintAllowed, `ID ${id}`).toBe(false);
    }
  });

  it("ID 9 (Protocol Chronicle) is NOT_CONFIGURED on-chain", () => {
    const e = archiveIdEntry(9)!;
    expect(e.activation).toBe("NOT_CONFIGURED");
    expect(e.configuredOnChain).toBe(false);
    expect(e.publicMintAllowed).toBe(false);
  });

  it("publicMintIds() returns exactly [1, 3]", () => {
    expect(publicMintIds().sort()).toEqual([1, 3]);
  });
});

// ─── Source-tree duplication guards ───────────────────────────────────────

describe("No duplicated address literals outside the registry", () => {
  // Address literals must originate in `src/lib/syndicate-config.ts` and be
  // accessed through `CONTRACTS` everywhere else. The files below are
  // legacy user-facing copy or static SEO/JSON-LD payloads that pre-date
  // the canonical registry. They are JUSTIFIED here (not silenced) so the
  // list cannot silently grow — every new entry needs a code-review note.
  const JUSTIFIED_LEGACY: Record<string, string[]> = {
    // SEO JSON-LD sameAs payload — static structured-data block.
    "src/routes/__root.tsx": ["SYN_CONTRACT_ADDRESS"],
    // Hand-curated FAQ copy that quotes the SYN address verbatim.
    "src/components/syndicate/FaqRebuilt.tsx": ["SYN_CONTRACT_ADDRESS"],
    // Marketing copy + footer proof links in Sections.tsx + risk + activity.
    // TODO(prevention-pass): migrate these to chain-registry helpers when
    // the next Sections refactor lands. Until then they MUST quote the
    // canonical address verbatim and never invent a new one.
    "src/components/syndicate/Sections.tsx": [
      "SYN_CONTRACT_ADDRESS",
      "MEMBERSHIP_SALE_CONTRACT_ADDRESS",
    ],
    "src/routes/risk.tsx": ["SYN_CONTRACT_ADDRESS", "MEMBERSHIP_SALE_CONTRACT_ADDRESS"],
    "src/routes/activity.tsx": ["MEMBERSHIP_SALE_CONTRACT_ADDRESS"],
  };

  const FORBIDDEN: Array<{ key: string; addr: string; allow: string[] }> = [
    { key: "SYN_CONTRACT_ADDRESS", addr: CONTRACTS.SYN_CONTRACT_ADDRESS, allow: ["src/lib/syndicate-config.ts"] },
    { key: "MEMBERSHIP_SALE_CONTRACT_ADDRESS", addr: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, allow: ["src/lib/syndicate-config.ts"] },
    { key: "USDC_CONTRACT_ADDRESS", addr: CONTRACTS.USDC_CONTRACT_ADDRESS, allow: ["src/lib/syndicate-config.ts"] },
  ];

  for (const { key, addr, allow } of FORBIDDEN) {
    it(`address ${addr.slice(0, 8)}… (${key}) is only declared in canonical files + justified legacy`, () => {
      const offenders: string[] = [];
      const re = new RegExp(addr, "i");
      for (const file of SRC_FILES) {
        const rel = relative(ROOT, file).replace(/\\/g, "/");
        if (allow.includes(rel)) continue;
        if (rel.includes("__tests__")) continue;
        if (rel === "src/lib/contract-registry.ts") continue;
        if (JUSTIFIED_LEGACY[rel]?.includes(key)) continue;
        const src = readFileSync(file, "utf8");
        if (re.test(src)) offenders.push(rel);
      }
      expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
    });
  }
});

describe("No component hardcodes explorer base URLs", () => {
  const ALLOW = new Set([
    "src/lib/syndicate-config.ts",
    "src/lib/chain-registry.ts",
    "src/lib/transaction-tags.ts",
    "src/lib/explorer-guard.ts",
    "src/lib/wagmi.ts",
  ]);

  it("forbids hand-built avascan.info/tx, snowtrace.io/tx, routescan.io/tx and bare /blockchain/c/tx/", () => {
    const offenders: Array<{ file: string; match: string }> = [];
    const patterns = [
      /https?:\/\/avascan\.info\/tx\//,
      /https?:\/\/snowtrace\.io\/tx\//,
      /https?:\/\/routescan\.io\/tx\//,
      /avascan\.info\/blockchain\/c\/tx\//,
    ];
    for (const file of SRC_FILES) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (ALLOW.has(rel)) continue;
      if (rel.includes("__tests__")) continue;
      const src = readFileSync(file, "utf8");
      for (const p of patterns) {
        const m = src.match(p);
        if (m) offenders.push({ file: rel, match: m[0] });
      }
    }
    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
  });
});

describe("MetaMask + Avascan known issue is documented", () => {
  it("chain-registry.ts documents the bare-Avascan 404 cause", () => {
    const src = readFileSync(join(ROOT, "src/lib/chain-registry.ts"), "utf8");
    expect(src).toMatch(/avascan/i);
    expect(src).toMatch(/\/blockchain\/c\/tx\//);
    expect(src).toMatch(/MetaMask/);
  });

  it("ACTIVATION_RUNBOOK doc exists", () => {
    const src = readFileSync(join(ROOT, "docs/ACTIVATION_RUNBOOK.md"), "utf8");
    expect(src.length).toBeGreaterThan(500);
    expect(src).toMatch(/freezeArtifactDefinition/);
    expect(src).toMatch(/setDropActive/);
  });

  it("CANONICAL_REGISTRY doc exists", () => {
    const src = readFileSync(join(ROOT, "docs/CANONICAL_REGISTRY.md"), "utf8");
    expect(src.length).toBeGreaterThan(500);
  });
});

describe("Wallet write paths require fresh injected account", () => {
  it("NFT mint and SYN sale writes call assertFreshWallet before writeContractAsync", () => {
    for (const rel of [
      "src/components/syndicate/MintFirstSignal.tsx",
      "src/components/syndicate/MintPatronSeal.tsx",
      "src/components/syndicate/LivePurchase.tsx",
    ]) {
      const src = readFileSync(join(ROOT, rel), "utf8");
      expect(src, `${rel} missing stale-wallet guard`).toMatch(/assertFreshWallet/);
      expect(src, `${rel} missing account pin`).toMatch(/account:\s*(wallet|address)/);
    }
  });

  it("root mounts the global wallet account synchronizer", () => {
    const src = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
    expect(src).toMatch(/WalletAccountSynchronizer/);
  });
});
