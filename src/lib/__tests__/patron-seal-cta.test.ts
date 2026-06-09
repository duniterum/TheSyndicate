/**
 * Regression: Patron Seal CTA must never render "Not active yet" while the
 * Archive1155 contract reports getArtifactCore(3).active === true.
 *
 * Bug history:
 *   The previous gate required `liveActive === true && isMintableConnected
 *   === true` to mount the mint surface. When no wallet was connected,
 *   isMintableConnected was undefined, which silently fell through to a
 *   "Not active yet" label — collapsing a wallet-specific unknown into a
 *   global on-chain inactive signal. This file pins the corrected state
 *   model in source so it cannot regress.
 *
 * These tests are intentionally source-string based: they protect the
 * branching contract of PatronSealReadiness + MintPatronSeal without
 * spinning up a React + wagmi runtime.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("Patron Seal CTA — global vs wallet-specific state", () => {
  const READINESS = "src/components/syndicate/PatronSealReadiness.tsx";
  const MINT = "src/components/syndicate/MintPatronSeal.tsx";

  it("PatronSealReadiness mounts MintPatronSeal when liveActive === true (no isMintableConnected gate)", () => {
    const src = read(READINESS);
    // The mounting branch must depend on liveActive only, not on the
    // wallet-specific isMintableConnected flag.
    expect(src).toMatch(/liveActive === true && read \?[\s\S]{0,600}<MintPatronSeal\s/);
    // The forbidden composite gate must NOT come back.
    expect(src).not.toMatch(/isMintableConnected === true && read \? \(\s*<MintPatronSeal/);
  });

  it('PatronSealReadiness only renders "Not active yet" when liveActive === false', () => {
    const src = read(READINESS);
    // The string is present in exactly one branch, guarded by an explicit
    // `liveActive === false` check.
    expect(src).toMatch(/liveActive === false \? \(([\s\S]{0,400})Not active yet/);
    // It must not be the generic fallback label anymore.
    expect(src).not.toMatch(/\? "Reading on-chain state…"\s*:\s*"Not active yet"/);
  });

  it("MintPatronSeal exposes a needs-wallet phase with a Connect wallet label", () => {
    const src = read(MINT);
    expect(src).toContain('"needs-wallet"');
    expect(src).toContain("Connect wallet to mint");
    // The needs-wallet branch fires on `!isConnected`, AFTER paused/inactive
    // global gates but BEFORE wrong-chain / approve / mint.
    expect(src).toMatch(/else if \(!isConnected\) \{[\s\S]{0,400}"needs-wallet"/);
  });

  it('MintPatronSeal only renders "Not active yet" when isActive === false', () => {
    const src = read(MINT);
    // The literal label lives behind an `isActive === false` branch.
    expect(src).toMatch(/else if \(isActive === false\)[\s\S]{0,400}"not-active"/);
    // The unknown-eligibility branch must stay in "verifying", not collapse
    // to "Not active yet".
    expect(src).toMatch(/!eligibilityOk[\s\S]{0,400}PHASE_LABEL\.verifying/);
    expect(src).not.toMatch(/!eligibilityOk[\s\S]{0,200}label:\s*"Not active yet"/);
  });

  it("Sold-out and Paused gates remain in PatronSealReadiness ahead of the mint surface", () => {
    const src = read(READINESS);
    const pausedIdx = src.indexOf("{livePaused === true ?");
    const soldIdx = src.indexOf("remainingSupply === 0n");
    // Match the JSX usage, not the comment that mentions <MintPatronSeal />.
    const mintIdx = src.search(/<MintPatronSeal\s*\n/);
    expect(pausedIdx).toBeGreaterThan(-1);
    expect(soldIdx).toBeGreaterThan(-1);
    expect(mintIdx).toBeGreaterThan(-1);
    expect(pausedIdx).toBeLessThan(mintIdx);
    expect(soldIdx).toBeLessThan(mintIdx);
  });

  it("MintPatronSeal stays hardcoded to ID 3 and quantity 1", () => {
    const src = read(MINT);
    expect(src).toContain("const PATRON_SEAL_ID = 3n;");
    expect(src).toContain("const QUANTITY = 1n;");
  });
});
