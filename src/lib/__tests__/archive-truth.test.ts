/**
 * Lightweight regression checks for Archive + Seat Record truth copy.
 *
 * These tests are intentionally string-based: they protect canonical copy
 * that the protocol doctrine treats as load-bearing. They are NOT a
 * substitute for visual review — they only prevent silent regressions
 * back to ambiguous or incorrect language.
 *
 * Scope (locked):
 *   - Archive ID 1 fallback copy never regresses to "no public mint yet".
 *   - Archive pending section is scoped beyond ID 1.
 *   - Seat Record truth state uses PENDING_SEAT_RECORD_CONTRACT
 *     (NOT the legacy PENDING_NFT_CONTRACT).
 *   - Seat Record hint stays exactly worded.
 *   - Archive roadmap ledger stays exactly worded.
 *
 * Does NOT touch contracts, ABI, addresses, mint price, or wallet limit.
 */

import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  TRUTH_STATE_HINT,
  TRUTH_STATE_LABEL,
  type TruthState,
} from "../archive-truth-states";


const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("Archive + Seat Record truth copy (regression guard)", () => {
  it("Archive ID 1 fallback says 'Public mint OPEN — refreshing on-chain status.'", () => {
    const src = read("src/components/syndicate/MyArchivePreview.tsx");
    expect(src).toContain("Public mint OPEN — refreshing on-chain status.");
    // Anti-regression: the old ambiguous phrasing must NOT come back as a
    // rendered fallback for ID 1.
    expect(src).not.toMatch(/^\s*"no public mint yet"/m);
  });

  it("Archive sealed section header is scoped beyond the two open mints (post-Patron-Seal-LIVE)", () => {
    const src = read("src/routes/archive.tsx");
    expect(src).toContain("sealed beyond the two open mints");
    // The legacy single-mint scoping must be gone.
    expect(src).not.toContain("What is pending beyond ID 1?");
  });

  it("Seat Record truth state key is PENDING_SEAT_RECORD_CONTRACT (not PENDING_NFT_CONTRACT)", () => {
    const key: TruthState = "PENDING_SEAT_RECORD_CONTRACT";
    expect(TRUTH_STATE_LABEL[key]).toBe("PENDING SEAT RECORD CONTRACT");

    // Whole-tree sweep: the legacy identifier must be fully retired.
    const files = [
      "src/lib/archive-truth-states.ts",
      "src/lib/archive-indexer.ts",
      "src/lib/archive-indexer-health.ts",
      "src/components/syndicate/SeatRecordPanel.tsx",
      "src/routes/api/public/indexer/health.ts",
    ];
    for (const f of files) {
      expect(read(f), `${f} still references PENDING_NFT_CONTRACT`).not.toContain(
        "PENDING_NFT_CONTRACT",
      );
    }
  });

  it("Seat Record hint stays exactly worded", () => {
    expect(TRUTH_STATE_HINT.PENDING_SEAT_RECORD_CONTRACT).toBe(
      "Requires the future SyndicateSeatRecord721 contract. Archive1155 is deployed; Seat Records are not.",
    );

  });

  it("NFT Collection hierarchy pills stay exactly worded", () => {
    const src = read("src/components/syndicate/ArchiveGalleryPreview.tsx");
    // Post-activation doctrine: ID 1 and ID 3 are both LIVE; IDs 4–9 are
    // protocol-memory. ID 2 has its own identity band.
    expect(src).toContain("ID 1 · MINT OPEN");
    expect(src).toContain("ID 3 · MINT OPEN");
    expect(src).toContain("IDS 4–9 · PROTOCOL MEMORY");
    // The legacy "configured · not active" wording for ID 3 must be gone.
    expect(src).not.toContain("ID 3 · CONFIGURED · NOT ACTIVE");
  });

  // ── Patron Seal (ID 3) — LIVE-state regression guards ────────────────────
  it("Patron Seal panel is gated by live on-chain state and shows 5.00 USDC", () => {
    const src = read("src/components/syndicate/PatronSealReadiness.tsx");
    // Live-state-gated CTA: MintPatronSeal mounts when GLOBAL active=true
    // (wallet-specific eligibility is owned by MintPatronSeal itself).
    expect(src).toContain("liveActive === true && read");
    // CRITICAL anti-regression: the global mount gate must NOT include
    // isMintableConnected, which collapses a wallet-specific unknown into
    // a global "not active" signal.
    expect(src).not.toContain(
      "liveActive === true && read?.isMintableConnected === true && read",
    );
    // The "Live · mint open" status band must be present for the active path.
    expect(src).toContain("Live · mint open");
    // No writeContract / approve / mint write path may be wired in this panel.
    expect(src).not.toMatch(/\buseWriteContract\b|\.writeContractAsync\(/);

    // Catalog price fallback must be 5.00 USDC (matches on-chain priceUsdc=5_000_000).
    expect(src).toContain("CATALOG_PRICE_USDC = 5.0");
    // Rights must be explicitly non-financial.
    expect(src).toContain("no equity, yield");
    // Must not imply any of the banned financial rights.
    expect(src).not.toMatch(/revenue share[^,]/i);
    // The old "not active yet" readiness paragraph must NOT come back.
    expect(src).not.toContain(
      "Minting is not active yet while the final visual and mint-flow check is completed.",
    );
  });

  it("Patron Seal price catalog is 5.00 USDC (matches on-chain priceUsdc)", () => {
    const cat = read("src/lib/archive-preview-catalog.ts");
    expect(cat).toMatch(/id:\s*3,[\s\S]*?targetPriceUsdc:\s*5\.0,/m);
    const cfg = read("src/lib/archive-config.ts");
    expect(cfg).toMatch(/id:\s*"patron-seal",[\s\S]*?targetPriceUsdc:\s*5,/m);
    // The legacy 9 USDC price must be retired.
    expect(cfg).not.toMatch(/targetPriceUsdc:\s*9,/);
  });

  it("/nft page mounts PatronSealReadiness and gallery does not duplicate ID 3 card", () => {
    // /nft is code-split: the route file only exports Route; the page body
    // (including <PatronSealReadiness/>) lives in NftPage.
    const page = read("src/components/syndicate/NftPage.tsx");
    expect(page).toContain("PatronSealReadiness");
    const gallery = read("src/components/syndicate/ArchiveGalleryPreview.tsx");
    // The 'Next public NFT' sub-section that previously duplicated ID 3 must be gone.
    expect(gallery).not.toContain("Next public NFT");
    // The identity band for ID 2 and the Protocol Memory shelf for IDs 4–9 must remain.
    expect(gallery).toContain("ID 2 · Identity · Reserved");
    expect(gallery).toContain("Protocol Memory · sealed by on-chain events");
  });

  // ── Chapter doctrine guard ────────────────────────────────────────────────
  it("ProtocolMoments uses canonical chapter doctrine (no 'Member #100/#500' or '(10 members)')", () => {
    const src = read("src/components/syndicate/ProtocolMoments.tsx");
    // Banned legacy member-doctrine labels:
    expect(src).not.toMatch(/Member #100\b/);
    expect(src).not.toMatch(/Member #500\b/);
    expect(src).not.toMatch(/Genesis sealed \(10 members\)/);
    // Canonical chapter milestones must be present (from src/lib/chapters.ts):
    expect(src).toContain("Genesis Signal sealed at #333");
    expect(src).toContain("First Thousand sealed at #1,000");
    expect(src).toContain("The Expansion sealed at #3,333");
    // Treasury/routing milestones survive (they are NOT chapter milestones):
    expect(src).toContain("First $100 routed");
    expect(src).toContain("First $1,000 routed");
    expect(src).toContain("First $10,000 routed");
  });

  it("archive-config Milestone Artifacts copy uses canonical milestone language (no 'Member #100')", () => {
    const src = read("src/lib/archive-config.ts");
    expect(src).not.toMatch(/Member #100\b/);
    expect(src).toContain("Genesis Signal sealed (#333)");
  });

  // ── Patron Seal write-path (ID 3) — render-gate + safety guards ───────────
  it("PatronSealReadiness mounts MintPatronSeal when liveActive === true (wallet-state owned by MintPatronSeal)", () => {
    const src = read("src/components/syndicate/PatronSealReadiness.tsx");
    // The mount gate is global-only. Wallet-specific phases are owned by
    // MintPatronSeal (Connect wallet / wrong-chain / approve / mint limit).
    expect(src).toContain("liveActive === true && read");
    expect(src).toContain("<MintPatronSeal");
    // "Not active yet" must ONLY render behind an explicit `liveActive === false`
    // branch — never as a fallback for undefined / pending wallet state.
    expect(src).toMatch(/liveActive === false \? \(([\s\S]{0,400})Not active yet/);
    // The readiness panel itself must NOT call writeContract directly —
    // all writes are inside MintPatronSeal, behind the render gate.
    expect(src).not.toMatch(/\buseWriteContract\b|\.writeContractAsync\(/);
  });

  it("MintPatronSeal is hardcoded to ID 3, qty 1, and Archive1155.mint", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    // HARDCODED id + qty constants — both must remain literal.
    expect(src).toContain("const PATRON_SEAL_ID = 3n;");
    expect(src).toContain("const QUANTITY = 1n;");
    // Mint call must target the Archive1155 mint() with [PATRON_SEAL_ID, QUANTITY].
    expect(src).toMatch(/functionName:\s*"mint"[\s\S]*?args:\s*\[PATRON_SEAL_ID,\s*QUANTITY\]/);
    // Approve target must be the Archive contract address (not arbitrary).
    expect(src).toMatch(/functionName:\s*"approve"[\s\S]*?args:\s*\[ARCHIVE,\s*requiredUsdc\]/);
    // Defensive re-check before submitting mint — eligibilityOk, chain, paused.
    expect(src).toContain(
      "if (!eligibilityOk || wrongChain || needsApprove || insufficientUsdc || pausedNow) return;",
    );
    // Eligibility invariant must include active=true and isMintableConnected=true.
    expect(src).toContain("isActive &&");
    expect(src).toContain("isMintableConnected === true");
    // Wallet limit must be enforced from on-chain walletLimit (not a hardcoded number).
    expect(src).toContain("ownedBal >= walletLimit");
    // Rights/financial-language hygiene: no banned words in this file.
    expect(src).not.toMatch(/\b(?:ROI|dividend|yield product|profit share|revenue share|guaranteed appreciation|passive income)\b/i);
  });

  it("MintPatronSeal targets ID 3, never ID 1 / ID 2 / IDs 4-9", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    // PATRON_SEAL_ID must literally be 3n and nothing else.
    expect(src).toMatch(/PATRON_SEAL_ID\s*=\s*3n\b/);
    // No accidental references to other ids in args.
    expect(src).not.toMatch(/args:\s*\[\s*1n\b/);
    expect(src).not.toMatch(/args:\s*\[\s*2n\b/);
    expect(src).not.toMatch(/args:\s*\[\s*9n\b/);
  });

  it("ID 1 (MintFirstSignal) is the only other Archive1155 write surface and remains scoped to ID 1", () => {
    const src = read("src/components/syndicate/MintFirstSignal.tsx");
    expect(src).toContain("FIRST_SIGNAL_ID = 1n");
    // ID 1 must still call mint() with FIRST_SIGNAL_ID, not PATRON_SEAL_ID.
    expect(src).toMatch(/functionName:\s*"mint"[\s\S]*?args:\s*\[FIRST_SIGNAL_ID,\s*QUANTITY\]/);
  });

  // ── Patron Seal paused / refetch / success-panel guards ──────────────────
  it("Archive ABI exposes paused() so the UI can read the global pause flag", () => {
    const src = read("src/lib/archive-nft-abi.ts");
    expect(src).toMatch(/name:\s*"paused"[\s\S]*?inputs:\s*\[\][\s\S]*?outputs:\s*\[\s*\{\s*type:\s*"bool"/);
  });

  it("useArchiveArtifactReads returns paused + uses fast refetch so the UI flips after activation", () => {
    const src = read("src/lib/archive-nft-hooks.ts");
    expect(src).toContain("paused: boolean | undefined;");
    expect(src).toContain("functionName: \"paused\"");
    // Refetch must be faster than 30s so post-activation flips are visible
    // without a page reload.
    expect(src).toMatch(/refetchInterval:\s*(?:1\d|20|25)_000/);
  });

  it("PatronSealReadiness blocks the CTA when paused and shows 'Minting is temporarily paused.'", () => {
    const src = read("src/components/syndicate/PatronSealReadiness.tsx");
    expect(src).toContain("livePaused = q.paused");
    expect(src).toContain("livePaused !== true");
    expect(src).toContain("livePaused === true");
    expect(src).toContain("Minting is temporarily paused.");
    expect(src).toMatch(/>\s*Paused\s*</);
  });

  it("MintPatronSeal refuses approve and mint while paused and has a 'paused' phase", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain('paused: "Paused"');
    // Both the approve and the mint onClick paths must short-circuit on paused.
    expect(src).toMatch(/if\s*\(\s*pausedNow\s*\)\s*return;/);
    expect(src).toMatch(/!eligibilityOk \|\| wrongChain \|\| needsApprove \|\| insufficientUsdc \|\| pausedNow/);
    // Quantity remains fixed at 1, id fixed at 3.
    expect(src).toContain("const QUANTITY = 1n;");
    expect(src).toContain("const PATRON_SEAL_ID = 3n;");
  });

  it("PatronSealReadiness shows 'Sold out' when remainingSupply is 0", () => {
    const src = read("src/components/syndicate/PatronSealReadiness.tsx");
    expect(src).toContain("Sold out");
    expect(src).toContain("All Patron Seals have been minted.");
  });

  it("MintPatronSeal owns the 'Mint limit reached' wallet-specific state", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain('"wallet-limit": "Mint limit reached"');
    expect(src).toContain("This wallet has reached the Patron Seal limit.");
  });

  it("MintPatronSeal shows 'Sold out' when supplyRemaining is 0n", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain('"sold-out": "Sold out"');
    expect(src).toContain("All Patron Seals have been minted.");
  });

  it("MintPatronSeal shows 'Mint limit reached' when wallet limit is reached", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain('"wallet-limit": "Mint limit reached"');
    expect(src).toContain("This wallet has reached the Patron Seal limit.");
  });

  it("Quantity remains fixed at 1 and ID at 3 in all states", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain("const QUANTITY = 1n;");
    expect(src).toContain("const PATRON_SEAL_ID = 3n;");
  });
});




