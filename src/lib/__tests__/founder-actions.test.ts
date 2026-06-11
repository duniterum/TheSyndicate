// Founder-action classifier. Proves a classification is produced ONLY when the
// sender is the founder wallet, that each destination maps to the right
// category, and that the human-facing notes carry no investment/return framing.

import { describe, it, expect } from "vitest";
import {
  classifyFounderAction,
  isFounderAction,
  FOUNDER_ACTION_LABEL,
  FOUNDER_ACTION_NOTE,
  type FounderActionCategory,
} from "../founder-actions";
import { SYNDICATE_CONFIG, CONTRACTS, SYN_BURN_ADDRESS } from "../syndicate-config";
import { findForbiddenLanguage } from "../protocol-language";

const FOUNDER = SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS;
const STRANGER = "0x1111111111111111111111111111111111111111";

describe("founder-actions · classifyFounderAction", () => {
  it("returns undefined when the sender is not the founder wallet", () => {
    expect(classifyFounderAction({ from: STRANGER, to: CONTRACTS.VAULT_WALLET, kind: "vault-in" })).toBeUndefined();
    expect(classifyFounderAction({ from: undefined, to: CONTRACTS.VAULT_WALLET, kind: "vault-in" })).toBeUndefined();
    expect(isFounderAction({ from: STRANGER, to: SYN_BURN_ADDRESS, kind: "burn-community" })).toBe(false);
  });

  it("classifies a founder burn", () => {
    expect(classifyFounderAction({ from: FOUNDER, to: SYN_BURN_ADDRESS, kind: "burn-founder" })).toBe("founder-burn");
  });

  it("classifies founder funding by destination wallet", () => {
    expect(classifyFounderAction({ from: FOUNDER, to: CONTRACTS.OPERATIONS_WALLET, kind: "vault-out" })).toBe("founder-funded-operations");
    expect(classifyFounderAction({ from: FOUNDER, to: CONTRACTS.VAULT_WALLET, kind: "vault-in" })).toBe("founder-funded-vault");
    expect(classifyFounderAction({ from: FOUNDER, to: CONTRACTS.LIQUIDITY_WALLET, kind: "vault-out" })).toBe("founder-funded-liquidity");
  });

  it("falls back to allocation-movement for an unrecognized destination", () => {
    expect(classifyFounderAction({ from: FOUNDER, to: STRANGER, kind: "vault-out" })).toBe("founder-allocation-movement");
  });

  it("labels and notes exist for every category and carry no forbidden framing", () => {
    const cats: FounderActionCategory[] = [
      "founder-burn",
      "founder-funded-operations",
      "founder-funded-vault",
      "founder-funded-liquidity",
      "founder-allocation-movement",
    ];
    for (const c of cats) {
      expect(FOUNDER_ACTION_LABEL[c]).toBeTruthy();
      expect(FOUNDER_ACTION_NOTE[c]).toBeTruthy();
      expect(findForbiddenLanguage(FOUNDER_ACTION_NOTE[c]), `note for ${c}`).toEqual([]);
    }
  });
});
