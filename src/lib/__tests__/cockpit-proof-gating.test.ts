/**
 * Regression matrix for the /my-syndicate cockpit proof surface
 * (CockpitProof.tsx — Wave C5: "Verify & Context" + "Claim → Source").
 *
 * Doctrine being protected (source-string based, like the other cockpit
 * gating tests, so the contract cannot silently regress):
 *   • Addresses + status come ONLY from syndicate-config CONTRACTS via
 *     isLiveAddress / explorerUrlFor — never hardcoded 0x… literals.
 *   • Status vocabulary is LIVE / PENDING only — never SIMULATED / MOCK / DEMO.
 *   • SeatRecord721 is shown as a PENDING, not-deployed row — no fake
 *     supply, no "Genesis NFT".
 *   • Artifact mintability claim documents the active && !paused gate.
 *   • Claim sources are limited to the four honest kinds.
 *   • No financial-return / countdown language leaks in.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const PROOF = "src/components/syndicate/cockpit/CockpitProof.tsx";
const src = readFileSync(join(ROOT, PROOF), "utf8");

// Comments document the forbidden vocabulary ("never SIMULATED / MOCK …"), so
// the negative assertions scan code with comments stripped — the rendered
// surface, not the doctrine notes describing it.
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/\/\/.*$/gm, "");

describe("CockpitProof — address provenance", () => {
  it("reads contracts ONLY from syndicate-config helpers", () => {
    expect(src).toMatch(/from "@\/lib\/syndicate-config"/);
    for (const helper of [
      "CONTRACTS",
      "isLiveAddress",
      "explorerUrlFor",
      "explorerUrlForAddress",
    ]) {
      expect(src).toContain(helper);
    }
  });

  it("never hardcodes a full on-chain address literal", () => {
    // No 40-hex-char 0x literal may appear inline; addresses come from config.
    expect(src).not.toMatch(/0x[a-fA-F0-9]{40}/);
  });

  it("covers the contracts that power the cockpit", () => {
    for (const key of [
      "SYN_CONTRACT_ADDRESS",
      "MEMBERSHIP_SALE_CONTRACT_ADDRESS",
      "ARCHIVE_NFT_CONTRACT_ADDRESS",
      "LP_PAIR_ADDRESS",
      "VAULT_WALLET",
      "LIQUIDITY_WALLET",
      "OPERATIONS_WALLET",
    ]) {
      expect(src).toContain(key);
    }
  });

  it("derives each row's status from isLiveAddress, not a literal", () => {
    expect(src).toMatch(/isLiveAddress\(addr\)/);
    expect(src).toMatch(/live \? "LIVE" : "PENDING"/);
  });
});

describe("CockpitProof — honest PENDING, no fakes", () => {
  it("shows SeatRecord721 as a not-deployed PENDING row", () => {
    expect(src).toContain("SeatRecord721 (future ERC-721)");
    expect(src).toMatch(/not deployed/);
  });

  it("uses only the canonical LIVE / PENDING status vocabulary", () => {
    expect(code).not.toMatch(/SIMULATED|MOCK|"DEMO"|Coming Soon|Genesis NFT/);
  });

  it("carries no financial-return, scarcity, or countdown language", () => {
    expect(code).not.toMatch(
      /\b(ROI|APY|yield|guaranteed|profit|dividend|passive income|countdown|days left|sells out|hurry)\b/i,
    );
  });
});

describe("CockpitProof — claim → source integrity", () => {
  it("documents the artifact mintability active && !paused gate", () => {
    expect(src).toMatch(/active and not paused|active \+ paused/);
  });

  it("limits source kinds to the four honest categories", () => {
    for (const kind of [
      "contract read",
      "indexed event",
      "derived config",
      "pending",
    ]) {
      expect(src).toContain(kind);
    }
  });

  it("maps the core cockpit claims to a source", () => {
    for (const claim of [
      "Member number",
      "SYN received",
      "USDC routed",
      "Artifacts owned",
      "Chapter",
      "Rank / recognition",
      "Live activity",
    ]) {
      expect(src).toContain(claim);
    }
  });
});
