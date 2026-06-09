/**
 * Regression: explorer URLs must always be reachable on Avalanche C-Chain.
 *
 * Bug history (June 2026):
 *   A Patron Seal USDC approval transaction succeeded on-chain but the
 *   wallet-rendered explorer link opened a dead Avascan URL:
 *
 *     https://avascan.info/tx/0x96eb...   →   404 PAGE NOT FOUND
 *
 *   Root cause: `wagmi.ts` configured `blockExplorers.default` as Avascan
 *   with a path (`https://avascan.info/blockchain/c`). MetaMask + viem
 *   strip the path and append `/tx/<hash>` to the bare origin, producing
 *   the broken URL. A second, divergent `txExplorerUrl` lived in
 *   `transaction-tags.ts` pointing at `/blockchain/c/transaction/` (also
 *   non-canonical).
 *
 *   Fix: one canonical helper in `syndicate-config.ts` (Snowtrace), the
 *   wallet-facing chain default switched to a bare Snowtrace origin,
 *   and `transaction-tags.ts` re-exports the canonical helper.
 *
 * These tests pin the contract so the bug cannot regress.
 */

import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  avascanTxExplorerUrl,
  routescanTxExplorerUrl,
  snowtraceTxExplorerUrl,
  txExplorerUrl,
  txExplorerUrls,
  explorerUrlForAddress,
} from "../syndicate-config";
import { txExplorerUrl as txExplorerUrlFromTags } from "../transaction-tags";
import { archiveTxUrl } from "../explorer-guard";
import { avalanche } from "../wagmi";

const FAILED_TX = "0x96eb7b1379be3c1d4526c7d07aeff6617a9630ff50ec663efb68f339d55362f0";
const SAMPLE_ADDR = "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d";

describe("Canonical explorer URL helpers", () => {
  it("txExplorerUrl returns a Snowtrace /tx/<hash> URL", () => {
    expect(txExplorerUrl(FAILED_TX)).toBe(`https://snowtrace.io/tx/${FAILED_TX}`);
  });

  it("txExplorerUrl NEVER returns the broken bare-Avascan form", () => {
    const url = txExplorerUrl(FAILED_TX);
    expect(url).not.toBe(`https://avascan.info/tx/${FAILED_TX}`);
    expect(url).not.toMatch(/^https:\/\/avascan\.info\/tx\//);
  });

  it("archiveTxUrl resolves to the canonical Snowtrace URL", () => {
    expect(archiveTxUrl(FAILED_TX)).toBe(`https://snowtrace.io/tx/${FAILED_TX}`);
  });

  it("archiveTxUrl returns null for an invalid hash (no broken link rendered)", () => {
    expect(archiveTxUrl("")).toBeNull();
    expect(archiveTxUrl(undefined)).toBeNull();
    expect(archiveTxUrl("0xnope")).toBeNull();
  });

  it("Avascan helper uses the /blockchain/c/tx/ path, not bare /tx/", () => {
    expect(avascanTxExplorerUrl(FAILED_TX)).toBe(
      `https://avascan.info/blockchain/c/tx/${FAILED_TX}`,
    );
  });

  it("Snowtrace and Routescan helpers use bare /tx/<hash>", () => {
    expect(snowtraceTxExplorerUrl(FAILED_TX)).toBe(`https://snowtrace.io/tx/${FAILED_TX}`);
    expect(routescanTxExplorerUrl(FAILED_TX)).toBe(`https://routescan.io/tx/${FAILED_TX}`);
  });

  it("txExplorerUrls fans out to all three explorers with valid shapes", () => {
    const urls = txExplorerUrls(FAILED_TX);
    expect(urls.map((u) => u.label).sort()).toEqual(["Avascan", "Routescan", "Snowtrace"]);
    for (const { href } of urls) {
      expect(href).toMatch(/^https:\/\//);
      expect(href).toContain(FAILED_TX);
    }
  });

  it("txExplorerUrls returns [] when the hash is malformed", () => {
    expect(txExplorerUrls("not-a-hash")).toEqual([]);
  });

  it("explorerUrlForAddress uses Avascan's /blockchain/c/address/ path", () => {
    expect(explorerUrlForAddress(SAMPLE_ADDR)).toBe(
      `https://avascan.info/blockchain/c/address/${SAMPLE_ADDR}`,
    );
  });

  it("transaction-tags.txExplorerUrl is the same canonical helper (no second definition)", () => {
    expect(txExplorerUrlFromTags).toBe(txExplorerUrl);
    expect(txExplorerUrlFromTags(FAILED_TX)).toBe(`https://snowtrace.io/tx/${FAILED_TX}`);
  });
});

describe("Wallet-facing chain config (wagmi)", () => {
  it("blockExplorers.default is a bare origin so MetaMask can append /tx/<hash> safely", () => {
    const def = avalanche.blockExplorers.default;
    expect(def.url).toBe("https://snowtrace.io");
    // Must not contain a path segment — MetaMask strips paths and would
    // otherwise produce dead URLs like avascan.info/tx/<hash>.
    const u = new URL(def.url);
    expect(u.pathname).toBe("/");
  });

  it("avascan entry keeps its full /blockchain/c path for in-app links", () => {
    expect(avalanche.blockExplorers.avascan.url).toBe("https://avascan.info/blockchain/c");
  });

  it("default + appended /tx/<hash> resolves to a valid Snowtrace URL", () => {
    const composed = `${avalanche.blockExplorers.default.url}/tx/${FAILED_TX}`;
    expect(composed).toBe(`https://snowtrace.io/tx/${FAILED_TX}`);
    // Sanity: this is exactly the path MetaMask's "View on block
    // explorer" button generates from chain config.
    expect(composed).not.toMatch(/avascan\.info\/tx\//);
  });
});

describe("No component hand-builds explorer tx URLs", () => {
  // Walk src/ and ensure no source file (outside the canonical helpers
  // and tests) contains a literal "avascan.info/tx/" or
  // "snowtrace.io/tx/" string template — every such URL must flow
  // through the canonical helpers above.
  const ROOT = join(__dirname, "..", "..", "..");
  const SRC = join(ROOT, "src");
  const ALLOWLIST = new Set([
    "src/lib/syndicate-config.ts",
    "src/lib/transaction-tags.ts",
    "src/lib/explorer-guard.ts",
    "src/lib/chain-registry.ts",
    "src/lib/wagmi.ts",
    "src/lib/__tests__/explorer-urls.test.ts",
    "src/lib/__tests__/archive1155-canonical.test.ts",
    "src/lib/__tests__/chain-registry-guard.test.ts",
  ]);

  function walk(dir: string, acc: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const st = statSync(full);
      if (st.isDirectory()) walk(full, acc);
      else if (/\.(ts|tsx|js|mjs)$/.test(entry)) acc.push(full);
    }
    return acc;
  }

  it("no source file hand-builds an Avascan or Snowtrace /tx/ URL", () => {
    const offenders: Array<{ file: string; match: string }> = [];
    for (const file of walk(SRC)) {
      const rel = relative(ROOT, file).replace(/\\/g, "/");
      if (ALLOWLIST.has(rel)) continue;
      const src = readFileSync(file, "utf8");
      const m1 = src.match(/https?:\/\/avascan\.info[^"'`\s)]*\/tx\/[^"'`\s)]*/);
      const m2 = src.match(/https?:\/\/snowtrace\.io[^"'`\s)]*\/tx\/[^"'`\s)]*/);
      const m3 = src.match(/https?:\/\/routescan\.io[^"'`\s)]*\/tx\/[^"'`\s)]*/);
      if (m1) offenders.push({ file: rel, match: m1[0] });
      if (m2) offenders.push({ file: rel, match: m2[0] });
      if (m3) offenders.push({ file: rel, match: m3[0] });
    }
    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
  });

  it("MintPatronSeal and MintFirstSignal use archiveTxUrl, not raw explorer strings", () => {
    for (const f of ["src/components/syndicate/MintPatronSeal.tsx", "src/components/syndicate/MintFirstSignal.tsx"]) {
      const src = readFileSync(join(ROOT, f), "utf8");
      expect(src, `${f} missing archiveTxUrl import`).toContain("archiveTxUrl");
      expect(src, `${f} hand-builds an Avascan URL`).not.toMatch(/https?:\/\/avascan\.info\//);
      expect(src, `${f} hand-builds a Snowtrace URL`).not.toMatch(/https?:\/\/snowtrace\.io\//);
    }
  });
});
