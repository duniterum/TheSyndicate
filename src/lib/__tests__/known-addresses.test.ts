// Guard: the known-address registry must label every protocol-recognized
// address consistently and never fabricate a label for an unknown one. The
// Protocol Event Pipeline renders from/to labels through here.

import { describe, it, expect } from "vitest";
import {
  KNOWN_ADDRESSES,
  labelForAddress,
  isFounderWallet,
  isProtocolWallet,
  isBurnAddress,
} from "../known-addresses";
import { CONTRACTS, SYNDICATE_CONFIG, SYN_BURN_ADDRESS } from "../syndicate-config";

describe("known-address registry", () => {
  it("resolves every registered address to its role + label (case-insensitive)", () => {
    for (const entry of KNOWN_ADDRESSES) {
      const lower = labelForAddress(entry.address.toLowerCase());
      const upper = labelForAddress(entry.address.toUpperCase());
      expect(lower.role).toBe(entry.role);
      expect(lower.label).toBe(entry.label);
      // Checksummed vs lower-cased resolve to the same entry.
      expect(upper.role).toBe(entry.role);
    }
  });

  it("returns role 'unknown' and a truncated label for an unrecognized address", () => {
    const random = "0x1234567890abcdef1234567890abcdef12345678";
    const r = labelForAddress(random);
    expect(r.role).toBe("unknown");
    expect(r.label).toBe("0x1234…5678");
  });

  it("handles null/undefined/empty without throwing", () => {
    expect(labelForAddress(undefined).role).toBe("unknown");
    expect(labelForAddress(null).role).toBe("unknown");
    expect(labelForAddress("").role).toBe("unknown");
  });

  it("isFounderWallet is true only for the Founder allocation wallet", () => {
    expect(isFounderWallet(SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS)).toBe(true);
    expect(isFounderWallet(CONTRACTS.VAULT_WALLET)).toBe(false);
    expect(isFounderWallet(SYN_BURN_ADDRESS)).toBe(false);
    expect(isFounderWallet(undefined)).toBe(false);
  });

  it("isProtocolWallet covers value-holding wallets, not contracts/token/burn/founder", () => {
    expect(isProtocolWallet(CONTRACTS.VAULT_WALLET)).toBe(true);
    expect(isProtocolWallet(CONTRACTS.LIQUIDITY_WALLET)).toBe(true);
    expect(isProtocolWallet(CONTRACTS.OPERATIONS_WALLET)).toBe(true);
    expect(isProtocolWallet(CONTRACTS.MEMBERSHIP_SYN_WALLET)).toBe(true);
    expect(isProtocolWallet(CONTRACTS.SYN_CONTRACT_ADDRESS)).toBe(false);
    expect(isProtocolWallet(SYN_BURN_ADDRESS)).toBe(false);
    expect(isProtocolWallet(SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS)).toBe(false);
  });

  it("isBurnAddress is true only for the standard dead address", () => {
    expect(isBurnAddress(SYN_BURN_ADDRESS)).toBe(true);
    expect(isBurnAddress(CONTRACTS.VAULT_WALLET)).toBe(false);
  });
});
