/**
 * Archive1155 — Canonical architecture regression guards.
 *
 * Locks the invariants in docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md.
 * READ-ONLY — does not import wagmi/viem, does not touch contracts.
 *
 * Past failures these tests prevent:
 *   • ABI drift / hand-built ABIs in components
 *   • Duplicated Archive1155 address literals
 *   • Hand-built explorer URLs (wrong chain, wrong subdomain)
 *   • Stale status labels (e.g. "CONFIGURED · NOT ACTIVE" after activation)
 *   • Public-mint CTAs leaking onto IDs 2, 4–8, 9
 *   • ID 9 claiming to be configured on-chain
 *   • Patron Seal price drifting from 5.00 USDC
 *   • Write paths sent against the wrong artifact ID
 *   • Quantity selector creeping onto ID 3
 *   • Equity / yield / dividend / governance language anywhere in a mint UI
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
  AVALANCHE_CHAIN_ID,
} from "../syndicate-config";
import { PREVIEW_ARTIFACTS } from "../archive-preview-catalog";
import { ARCHIVE_ARTIFACTS, ARCHIVE_CATEGORIES } from "../archive-config";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".git" || name === "dist") continue;
      walk(p, out);
    } else if (/\.(ts|tsx)$/.test(name)) {
      out.push(p);
    }
  }
  return out;
}

const SRC = join(ROOT, "src");
const SRC_FILES = walk(SRC);

const ADDRESS_LITERAL = /0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d/i;
const ALLOWED_ADDRESS_LITERAL_FILES = new Set([
  // The single declaration site.
  join(ROOT, "src/lib/syndicate-config.ts"),
  // ABI file comments reference the contract address for traceability.
  join(ROOT, "src/lib/archive-nft-abi.ts"),
]);

describe("Archive1155 canonical sources", () => {
  it("contract address is on Avalanche C-Chain (43114)", () => {
    expect(AVALANCHE_CHAIN_ID).toBe(43114);
    expect(ARCHIVE_NFT_CONTRACT_ADDRESS).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  it("address literal exists in exactly one runtime source (no duplicates)", () => {
    const offenders = SRC_FILES.filter((f) => {
      if (ALLOWED_ADDRESS_LITERAL_FILES.has(f)) return false;
      if (f.includes(`${"__tests__"}`)) return false; // tests may reference for context
      const txt = readFileSync(f, "utf8");
      return ADDRESS_LITERAL.test(txt);
    });
    expect(offenders, `address literal duplicated in: ${offenders.join(", ")}`).toEqual([]);
  });

  it("explorer URLs come from one canonical helper set", () => {
    expect(ARCHIVE_NFT_EXPLORERS.avascan).toContain(ARCHIVE_NFT_CONTRACT_ADDRESS);
    expect(ARCHIVE_NFT_EXPLORERS.snowtrace).toContain(ARCHIVE_NFT_CONTRACT_ADDRESS);
    expect(ARCHIVE_NFT_EXPLORERS.routescan).toContain("43114");
    expect(ARCHIVE_NFT_EXPLORERS.sourcify).toContain("43114");
  });

  it("mint components never hand-build explorer URLs (must use archiveTxUrl/archiveAddrUrl)", () => {
    for (const f of [
      "src/components/syndicate/MintFirstSignal.tsx",
      "src/components/syndicate/MintPatronSeal.tsx",
    ]) {
      const src = read(f);
      // No raw avascan/snowtrace string templates in mint components.
      expect(src, `${f} hand-builds an Avascan URL`).not.toMatch(/https:\/\/avascan\.info\//);
      expect(src, `${f} hand-builds a Snowtrace URL`).not.toMatch(/https:\/\/snowtrace\.io\//);
    }
  });

  it("ABI is imported from the canonical source (no inline ABI literals in mint components)", () => {
    for (const f of [
      "src/components/syndicate/MintFirstSignal.tsx",
      "src/components/syndicate/MintPatronSeal.tsx",
    ]) {
      const src = read(f);
      expect(src).toMatch(/from\s+["']@\/lib\/archive-nft-abi["']/);
      // Refuse new inline ABI objects in mint components.
      expect(src, `${f} declares an inline ABI literal`).not.toMatch(
        /\bconst\s+[A-Z0-9_]*ABI[A-Z0-9_]*\s*=\s*\[\s*\{\s*type:\s*"function"/,
      );
    }
  });
});

describe("Per-ID rules (locked by doctrine)", () => {
  const byId = new Map(PREVIEW_ARTIFACTS.map((a) => [a.id, a]));

  it("ID 1 — The First Signal — public mint active", () => {
    const a = byId.get(1)!;
    expect(a.name).toBe("The First Signal");
    expect(a.status).toBe("ACTIVE_MINT_OPEN");
    expect(a.mintModel).toBe("PUBLIC_MINT_ACTIVE");
  });

  it("ID 2 — reserved, NEVER public mint in Archive1155", () => {
    const a = byId.get(2)!;
    expect(a.status).toBe("RESERVED_DISABLED");
    expect(a.mintModel).not.toBe("PUBLIC_MINT_ACTIVE");
    expect(a.mintModel).not.toBe("PUBLIC_MINT_PLANNED");
  });

  it("ID 3 — Patron Seal — live · 5.00 USDC · wallet limit 5", () => {
    const a = byId.get(3)!;
    expect(a.name).toBe("Patron Seal");
    expect(a.status).toBe("ACTIVE_MINT_OPEN");
    expect(a.mintModel).toBe("PUBLIC_MINT_ACTIVE");
    expect(a.targetPriceUsdc).toBe(5);
    expect(a.proposedWalletLimit).toBe(5);
  });

  it("IDs 4–8 — ownerOnly protocol memory, no public mint", () => {
    for (const id of [4, 5, 6, 7, 8]) {
      const a = byId.get(id)!;
      expect(a, `ID ${id} missing`).toBeDefined();
      expect(a.status, `ID ${id} status`).toBe("ROADMAP");
      expect(a.mintModel, `ID ${id} mintModel`).not.toBe("PUBLIC_MINT_ACTIVE");
      expect(a.mintModel, `ID ${id} mintModel`).not.toBe("PUBLIC_MINT_PLANNED");
    }
  });

  it("ID 9 — Protocol Chronicle — roadmap only, NOT configured on-chain", () => {
    const a = byId.get(9)!;
    expect(a.status).toBe("ROADMAP");
    expect(a.mintModel).not.toBe("PUBLIC_MINT_ACTIVE");
    // The catalog blurb / description must not claim it is configured on-chain.
    expect(a.description.toLowerCase()).not.toMatch(/configured on[- ]chain/);
  });

  it("archive-config Patron Seal is ACTIVE_MINT_OPEN at 5 USDC (no stale 'CONFIGURED_NOT_ACTIVE')", () => {
    const patronCategory = ARCHIVE_CATEGORIES.find((c) => c.id === "patron")!;
    expect(patronCategory.status).toBe("ACTIVE_MINT_OPEN");
    const patron = ARCHIVE_ARTIFACTS.find((a) => a.id === "patron-seal")!;
    expect(patron.status).toBe("ACTIVE_MINT_OPEN");
    expect(patron.targetPriceUsdc).toBe(5);
  });
});

describe("Mint engine pattern (ID 1 + ID 3 share the same write-path contract)", () => {
  const ID1 = read("src/components/syndicate/MintFirstSignal.tsx");
  const ID3 = read("src/components/syndicate/MintPatronSeal.tsx");

  it("both components hardcode their ID and qty (no ID arg, no qty selector)", () => {
    expect(ID1).toMatch(/FIRST_SIGNAL_ID\s*=\s*1n/);
    expect(ID3).toMatch(/PATRON_SEAL_ID\s*=\s*3n/);
    expect(ID3).toMatch(/QUANTITY\s*=\s*1n/);
    // No quantity selector input in ID 3.
    expect(ID3).not.toMatch(/<input[^>]+type=["']number["']/);
    expect(ID3).not.toMatch(/setQuantity|quantityState/);
  });

  it("both components mint via the same Archive1155.mint(id, qty) shape", () => {
    expect(ID1).toMatch(/functionName:\s*"mint"[\s\S]*?args:\s*\[FIRST_SIGNAL_ID,\s*QUANTITY\]/);
    expect(ID3).toMatch(/functionName:\s*"mint"[\s\S]*?args:\s*\[PATRON_SEAL_ID,\s*QUANTITY\]/);
  });

  it("both use the canonical USDC ERC20 approve(address,amount) pattern", () => {
    for (const src of [ID1, ID3]) {
      expect(src).toMatch(/functionName:\s*"approve"/);
      expect(src).toMatch(/ARCHIVE_NFT_CONTRACT_ADDRESS|ARCHIVE\b/);
    }
  });

  it("both verify the injected wallet before approve/mint writes and pin account", () => {
    for (const src of [ID1, ID3]) {
      expect(src).toMatch(/assertFreshWallet/);
      expect(src).toMatch(/verifyFreshWallet/);
      expect(src).toMatch(/account:\s*wallet/);
    }
  });

  it("both refetch on-chain state after mint receipt success", () => {
    for (const src of [ID1, ID3]) {
      expect(src).toMatch(/mintReceipt\.isSuccess/);
      expect(src).toMatch(/refetch|invalidateQueries/);
    }
  });

  it("both surface a tx hash + explorer link in success state", () => {
    for (const src of [ID1, ID3]) {
      expect(src).toMatch(/archiveTxUrl|explorer/i);
    }
  });

  it("no banned positive financial claims in any mint UI", () => {
    // Limited to terms that are ONLY ever wrong as a positive claim.
    // (dividend / revenue share are also banned but always appear here in
    // disclaimer form — covered by the doctrine guard, not this regex.)
    const BANNED =
      /\b(ROI|yield product|profit share|guaranteed appreciation|passive income)\b/i;
    for (const f of [
      "src/components/syndicate/MintFirstSignal.tsx",
      "src/components/syndicate/MintPatronSeal.tsx",
      "src/components/syndicate/PatronSealReadiness.tsx",
    ]) {
      const src = read(f);
      expect(src, `${f} contains a banned positive financial claim`).not.toMatch(BANNED);
    }
  });

  it("no write path can target the wrong ID (ID 3 component never references 1n / 2n / 9n as mint args)", () => {
    expect(ID3).not.toMatch(/args:\s*\[\s*1n\b/);
    expect(ID3).not.toMatch(/args:\s*\[\s*2n\b/);
    expect(ID3).not.toMatch(/args:\s*\[\s*9n\b/);
    expect(ID1).not.toMatch(/args:\s*\[\s*3n\b/);
  });
});

describe("Global vs wallet-specific state separation", () => {
  it("MintPatronSeal exposes 'paused' phase distinct from wallet-limit / wrong-chain", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    // Each is its own phase so the global status pill stays honest.
    for (const phase of [
      '"paused"',
      '"wallet-limit"',
      '"wrong-chain"',
      '"sold-out"',
      '"needs-usdc"',
      '"needs-approval"',
      '"ready"',
      '"minting"',
      '"confirmed"',
    ]) {
      expect(src, `phase ${phase} missing`).toContain(phase);
    }
  });

  it("PatronSealReadiness keeps the live global pill read-gated even when a wallet-specific issue blocks the CTA", () => {
    const src = read("src/components/syndicate/PatronSealReadiness.tsx");
    expect(src).toContain("Live · read gated");
    // Wallet-specific blocks live in the CTA, not the status pill.
    expect(src).toContain("Mint limit reached");
  });
});
