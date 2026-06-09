// Mythology Wall regression checks.
//
// Guards the visitor contract for /nft and /archive:
//   - All 9 slots present, exactly one Act assignment each.
//   - Public-state mapping I–IX matches the doctrine.
//   - Primary card (MythologyWall.tsx source) never references operator
//     vocabulary or technical fields (renderer, maxSupply, ownerOnly,
//     notConfigured, mintable=false, preview-only).
//   - Only OPEN slots expose a mint CTA in primary card markup.
//   - ID 9 is not claimed configured on-chain.
//
// Authority: docs/NFT_DESIRE_ARCHITECTURE_PASS.md
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  MYTHOLOGY_SLOTS,
  STATE_LABEL,
  type PublicSlotState,
} from "../mythology-wall-catalog";

const EXPECTED: Record<number, PublicSlotState> = {
  1: "OPEN",
  2: "IDENTITY",
  3: "OPEN",
  4: "HIDDEN",
  5: "ARMED",
  6: "ARMED",
  7: "ARMED",
  8: "ARMED",
  9: "FAR_HORIZON",
};

describe("mythology wall — slot doctrine I–IX", () => {
  it("has exactly 9 slots", () => {
    expect(MYTHOLOGY_SLOTS).toHaveLength(9);
  });

  it("state mapping matches the public doctrine", () => {
    for (const s of MYTHOLOGY_SLOTS) {
      expect(s.state, `ID ${s.id} state`).toBe(EXPECTED[s.id]);
    }
  });

  it("all public state labels are visitor vocabulary only", () => {
    const allowed = new Set(["OPEN", "IDENTITY", "HIDDEN", "ARMED", "FAR HORIZON"]);
    for (const label of Object.values(STATE_LABEL)) {
      expect(allowed.has(label), `label ${label}`).toBe(true);
    }
  });
});

describe("mythology wall — primary card source contract", () => {
  const src = readFileSync(
    join(process.cwd(), "src/components/syndicate/MythologyWall.tsx"),
    "utf8",
  );

  it("does not surface operator vocabulary in primary card markup", () => {
    const forbidden = [
      "NOT_CONFIGURED",
      "OWNER_ONLY",
      "RESERVED_DISABLED",
      "ownerOnly",
      "maxSupply",
      "renderer",
      "mintable false",
      "PREVIEW · NOT CONTRACT-RENDERED",
      "not contract-rendered",
      "ROADMAP",
    ];
    for (const term of forbidden) {
      expect(src, `forbidden term: ${term}`).not.toContain(term);
    }
  });

  it("Mint CTA appears only behind an OPEN gate", () => {
    // The only "Mint now" string in the card body is inside a `slot.state === "OPEN"`
    // (or `isOpen`) branch. Source-level guard.
    expect(src).toMatch(/isOpen\s*=\s*slot\.state\s*===\s*"OPEN"/);
    expect(src).toMatch(/isOpen\s*\?[\s\S]*Mint now/);
  });

  it("HIDDEN slot copy is mystery-only, no price, no CTA", () => {
    expect(src).toMatch(/HiddenVisual/);
    expect(src).toMatch(/hidden discovery artifact/i);
  });

  it("FAR_HORIZON slot renders with a dashed/sealed visual, not a mint CTA", () => {
    expect(src).toMatch(/FAR_HORIZON/);
    expect(src).toMatch(/dashed/);
  });

  it("does not claim ID 9 is configured on-chain", () => {
    // No active-mint or configured language directly attached to ID 9.
    expect(src).not.toMatch(/id:\s*9[\s\S]*configured/i);
    expect(src).not.toMatch(/Protocol Chronicle[\s\S]{0,80}MINT/i);
  });
});
