/**
 * Regression matrix for the /my-syndicate Member Cockpit collector loop
 * (CockpitCollector.tsx). These tests pin the TRUTH-GATING contract of the
 * status pill, the Collect CTA, and the supply-progress bar in source so the
 * hard doctrine rules cannot silently regress.
 *
 * Doctrine being protected:
 *   • A card may assert an active collect state ONLY when the contract explicitly
 *     reports active === true AND paused === false. Read-gated artifacts must
 *     say READ GATED instead of flattening wallet checks into "mint open."
 *   • An unknown pause state (paused undefined + pausedError) must degrade to an
 *     honest "unverifiable" state — it must NEVER imply mint-open.
 *   • The First Signal is a fixed edition of 10,000 (on-chain maxSupply) →
 *     shown as edition size + remaining, NEVER a scarcity progress bar.
 *   • The Patron Seal renders a progress bar ONLY when a live minted count and
 *     denominator are derivable; otherwise availability-only, no fabricated bar.
 *   • The Seat Record is a pending future ERC-721 — never mintable, no Collect.
 *
 * Like patron-seal-cta.test.ts, these are intentionally source-string based:
 * they protect the branching contract without spinning up a React + wagmi
 * runtime. Behavioural drift in any of these branches breaks the build.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const COLLECTOR = "src/components/syndicate/cockpit/CockpitCollector.tsx";
const src = readFileSync(join(ROOT, COLLECTOR), "utf8");

describe("CockpitCollector — mint-open status gating", () => {
  it("only asserts an active collect state when active === true AND paused === false", () => {
    // The success pill is guarded by BOTH explicit reads, never active alone.
    expect(src).toMatch(
      /active === true && paused === false\)\s*\{\s*statusLabel = item\.readGated \? "ACTIVE · READ GATED" : "ACTIVE · MINT OPEN";/,
    );
    // There must be no looser pill branch that claims ACTIVE on active alone.
    expect(src).not.toMatch(/active === true\)\s*\{\s*statusLabel = "ACTIVE · MINT OPEN";/);
    expect(src).not.toMatch(/active === true\)\s*\{\s*statusLabel = item\.readGated/);
  });

  it("derives an explicit pauseUnknown state from paused undefined + pausedError", () => {
    expect(src).toMatch(
      /const pauseUnknown = paused === undefined && Boolean\(pausedError\);/,
    );
  });

  it("evaluates pause states BEFORE asserting active (pending → paused → pauseUnknown → active)", () => {
    const pendingIdx = src.indexOf('statusLabel = "PENDING · ERC-721";');
    const pausedIdx = src.indexOf('statusLabel = "PAUSED ON-CHAIN";');
    const unknownIdx = src.indexOf('statusLabel = "PAUSE UNREADABLE";');
    const activeIdx = src.indexOf('statusLabel = item.readGated ? "ACTIVE · READ GATED" : "ACTIVE · MINT OPEN";');
    const inactiveIdx = src.indexOf('statusLabel = "CONFIGURED · NOT ACTIVE";');
    for (const i of [pendingIdx, pausedIdx, unknownIdx, activeIdx, inactiveIdx]) {
      expect(i).toBeGreaterThan(-1);
    }
    // Pause-unknown must be resolved before the mint-open assertion.
    expect(pausedIdx).toBeLessThan(unknownIdx);
    expect(unknownIdx).toBeLessThan(activeIdx);
    expect(activeIdx).toBeLessThan(inactiveIdx);
  });
});

describe("CockpitCollector — Collect CTA gating", () => {
  it("renders the Collect link to /nft ONLY when active === true && paused === false", () => {
    // Pin the gate and the link independently (rather than across one long
    // distance-bounded match) so benign className/style edits between them can
    // never cause a false failure — only the gating contract is asserted.
    // 1. The CTA branch is gated on BOTH explicit reads.
    expect(src).toMatch(/: active === true && paused === false \? \(/);
    // 2. The only Collect link points at /nft, with read-gated copy when needed.
    expect(src).toMatch(/to="\/nft"[\s\S]{0,500}item\.readGated \? "Check mintability →" : "Collect →"/);
    // 3. Negative guard: the Collect link must NOT be reachable from an
    //    active-only gate (the doctrine regression we are protecting against).
    expect(src).not.toMatch(/: active === true \? \([\s\S]{0,400}to="\/nft"/);
  });

  it("pause-unknown shows an unverifiable note, not a Collect CTA", () => {
    expect(src).toMatch(/pauseUnknown \? \([\s\S]{0,200}Mint status unverifiable/);
    // The unverifiable branch must come before the Collect branch.
    const unknownCtaIdx = src.indexOf("Mint status unverifiable");
    const collectIdx = src.search(/to="\/nft"/);
    expect(unknownCtaIdx).toBeGreaterThan(-1);
    expect(collectIdx).toBeGreaterThan(-1);
    expect(unknownCtaIdx).toBeLessThan(collectIdx);
  });

  it("active === false shows 'Mint not open yet', never a Collect CTA", () => {
    expect(src).toMatch(/active === false \? \([\s\S]{0,200}Mint not open yet/);
  });

  it("the wallet-limit note is itself gated by active === true && paused === false", () => {
    expect(src).toMatch(
      /isConnected && active === true && paused === false && isMintableConnected === false/,
    );
  });
});

describe("CockpitCollector — Seat Record (pending future ERC-721)", () => {
  it("Seat Record (id 2) is catalogued as a pending, non-mintable future contract", () => {
    expect(src).toMatch(
      /id: 2,\s*configId: "seat-record",[\s\S]{0,400}status: "PENDING_CONTRACT",\s*supplyMode: "pending",/,
    );
  });

  it("pending artifacts show the PENDING pill and the SeatRecord721 ships note, no Collect", () => {
    expect(src).toMatch(/if \(pending\) \{\s*statusLabel = "PENDING · ERC-721";/);
    expect(src).toMatch(/pending \? \([\s\S]{0,200}SyndicateSeatRecord721 ships/);
    // The MintProgress block treats pending as a future, non-mintable contract.
    expect(src).toMatch(
      /supplyMode === "pending"[\s\S]{0,200}Future ERC-721 · not mintable yet/,
    );
  });
});

describe("CockpitCollector — supply bar truth (fixed-edition vs capped)", () => {
  it("The First Signal (id 1) is a fixed edition of 10,000 (on-chain cap), not uncapped", () => {
    expect(src).toMatch(
      /id: 1,\s*configId: "first-signal",[\s\S]{0,400}supplyMode: "fixed-edition",\s*catalogMaxSupply: 10_000,/,
    );
    // The stale "uncapped" claim must be gone for the First Signal.
    expect(src).not.toMatch(
      /configId: "first-signal",[\s\S]{0,400}supplyMode: "uncapped"/,
    );
    // No public-facing "Uncapped supply" label may survive anywhere.
    expect(src).not.toContain("Uncapped supply");
  });

  it("fixed-edition artifacts return BEFORE any bar math — no progress bar path", () => {
    const fixedIdx = src.indexOf('if (item.supplyMode === "fixed-edition")');
    const editionLabelIdx = src.indexOf("Edition of ");
    // The pct-based bar (width style) is the only progress bar; it must live
    // AFTER the fixed-edition early return, so a fixed edition can never reach it.
    const barIdx = src.indexOf("width: `${pct * 100}%`");
    expect(fixedIdx).toBeGreaterThan(-1);
    expect(editionLabelIdx).toBeGreaterThan(-1);
    expect(barIdx).toBeGreaterThan(-1);
    expect(fixedIdx).toBeLessThan(barIdx);
    expect(editionLabelIdx).toBeLessThan(barIdx);
  });

  it("Patron Seal (id 3) is capped with a clearly-labeled catalog fallback denominator", () => {
    expect(src).toMatch(
      /id: 3,\s*configId: "patron-seal",[\s\S]{0,400}supplyMode: "capped",\s*catalogMaxSupply: 10_000,/,
    );
  });

  it("a capped bar renders ONLY when live minted AND denominator are derivable", () => {
    // Without a derivable minted count or denominator, the component returns an
    // availability-only message BEFORE computing pct — no fabricated bar.
    expect(src).toMatch(
      /if \(mintedNum === undefined \|\| denom === undefined \|\| denom <= 0\)[\s\S]{0,300}availability shown when live/,
    );
    // The minted count is derived from live reads only (totalMinted, or live
    // maxSupply minus remainingSupply) — never a hardcoded number.
    expect(src).toMatch(/liveMax - Number\(remainingSupply\)/);
    // The denominator labels itself live vs catalog so a fallback is never
    // passed off as on-chain truth.
    expect(src).toMatch(/denomLive \? "live" : "catalog"/);
  });
});
