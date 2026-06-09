import { describe, it, expect } from "vitest";
import { assessPayment, exactApprovalAmount, formatUsdc } from "../payment-flow";

describe("assessPayment", () => {
  it("reports needs approval when allowance is below required", () => {
    const r = assessPayment({ balance: 100n * 10n ** 6n, allowance: 0n, required: 50n * 10n ** 6n });
    expect(r.sufficientBalance).toBe(true);
    expect(r.needsApproval).toBe(true);
    expect(r.missingAllowance).toBe(50n * 10n ** 6n);
  });

  it("reports insufficient balance", () => {
    const r = assessPayment({ balance: 1n * 10n ** 6n, allowance: 100n * 10n ** 6n, required: 50n * 10n ** 6n });
    expect(r.sufficientBalance).toBe(false);
    expect(r.missingUsdc).toBe(49n * 10n ** 6n);
  });

  it("reports ready when allowance + balance both sufficient", () => {
    const r = assessPayment({ balance: 100n * 10n ** 6n, allowance: 100n * 10n ** 6n, required: 50n * 10n ** 6n });
    expect(r.needsApproval).toBe(false);
    expect(r.sufficientBalance).toBe(true);
  });

  it("handles unknown data gracefully", () => {
    const r = assessPayment({ balance: undefined, allowance: undefined, required: 1n });
    expect(r.hasBalanceData).toBe(false);
    expect(r.hasAllowanceData).toBe(false);
    expect(r.needsApproval).toBe(false); // can't decide without data
  });
});

describe("exactApprovalAmount", () => {
  it("returns the exact required amount (no infinite approval)", () => {
    expect(exactApprovalAmount(123n)).toBe(123n);
  });
});

describe("formatUsdc", () => {
  it("formats whole and fractional parts", () => {
    expect(formatUsdc(50_000_000n)).toBe("50.00");
    expect(formatUsdc(50_500_000n)).toBe("50.50");
    expect(formatUsdc(undefined)).toBe("—");
    expect(formatUsdc(1_234_567n, 4)).toBe("1.2345");
  });
});
