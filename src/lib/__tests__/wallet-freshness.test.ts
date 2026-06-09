import { describe, expect, it } from "vitest";
import {
  assessWalletFreshness,
  normalizeAddress,
  sameAddress,
  walletFreshnessMessage,
} from "../wallet-freshness";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";

describe("wallet freshness guard", () => {
  it("normalizes valid addresses and rejects bad values", () => {
    expect(normalizeAddress(A.toUpperCase().replace("0X", "0x"))).toBe(A);
    expect(normalizeAddress("PENDING")).toBeNull();
    expect(normalizeAddress(undefined)).toBeNull();
  });

  it("compares addresses case-insensitively", () => {
    expect(sameAddress(A, A.toUpperCase().replace("0X", "0x"))).toBe(true);
    expect(sameAddress(A, B)).toBe(false);
  });

  it("passes when Wagmi address and injected account match", () => {
    expect(assessWalletFreshness(A, [A])).toEqual({ ok: true, account: A });
  });

  it("blocks stale UI address before a transaction can be signed", () => {
    const result = assessWalletFreshness(A, [B]);
    expect(result).toMatchObject({ ok: false, code: "wallet-switched", expected: A, actual: B });
    expect(walletFreshnessMessage(result)).toMatch(/different wallet/i);
  });

  it("blocks when MetaMask exposes no active account", () => {
    const result = assessWalletFreshness(A, []);
    expect(result).toMatchObject({ ok: false, code: "wallet-unavailable", expected: A });
  });
});