import { describe, it, expect } from "vitest";
import { classifyMintError, decideMintCta, type CtaInputs } from "@/lib/mint-phase";

const base: CtaInputs = {
  eligibilityOk: true,
  isConnected: true,
  wrongChain: false,
  isMintableConnected: true,
  balance: 1_000_000n, // 1 USDC
  allowance: 0n,
  required: 500_000n, // 0.50 USDC
  mintConfirmed: false,
  mintInFlight: false,
};

describe("decideMintCta", () => {
  it("verifying when artifact not eligible yet", () => {
    expect(decideMintCta({ ...base, eligibilityOk: false })).toBe("verifying");
  });

  it("needs-wallet when disconnected", () => {
    expect(decideMintCta({ ...base, isConnected: false })).toBe("needs-wallet");
  });

  it("wrong-chain wins over balance/allowance", () => {
    expect(decideMintCta({ ...base, wrongChain: true })).toBe("wrong-chain");
  });

  it("checking while wallet reads are pending", () => {
    expect(decideMintCta({ ...base, balance: undefined })).toBe("checking");
    expect(decideMintCta({ ...base, allowance: undefined })).toBe("checking");
    expect(decideMintCta({ ...base, isMintableConnected: undefined })).toBe("checking");
  });

  it("wallet-limit when isMintable is false", () => {
    expect(decideMintCta({ ...base, isMintableConnected: false })).toBe("wallet-limit");
  });

  it("needs-usdc when balance below required", () => {
    expect(decideMintCta({ ...base, balance: 100_000n })).toBe("needs-usdc");
  });

  it("needs-approval when allowance below required", () => {
    expect(decideMintCta({ ...base, allowance: 0n })).toBe("needs-approval");
  });

  it("ready as soon as allowance >= required (never stuck on approval)", () => {
    expect(decideMintCta({ ...base, allowance: 500_000n })).toBe("ready");
    expect(decideMintCta({ ...base, allowance: 10_000_000n })).toBe("ready");
  });

  it("minting once write is in flight", () => {
    expect(decideMintCta({ ...base, allowance: 500_000n, mintInFlight: true })).toBe("minting");
  });

  it("confirmed wins over everything", () => {
    expect(decideMintCta({ ...base, mintConfirmed: true, allowance: 0n })).toBe("confirmed");
  });

  it("simulation: approve → allowance refresh → ready, no stuck state", () => {
    // 1. Before approval
    let phase = decideMintCta({ ...base, allowance: 0n });
    expect(phase).toBe("needs-approval");
    // 2. Wallet read in flight after approve confirms
    phase = decideMintCta({ ...base, allowance: undefined });
    expect(phase).toBe("checking");
    // 3. Allowance refreshed to exactly required
    phase = decideMintCta({ ...base, allowance: 500_000n });
    expect(phase).toBe("ready");
  });
});

describe("classifyMintError", () => {
  it("returns null when no errors", () => {
    expect(classifyMintError({})).toBeNull();
  });
  it("detects user-rejected approval", () => {
    const e = classifyMintError({ approveWrite: "User rejected request" })!;
    expect(e.code).toBe("user-rejected-approve");
    expect(e.action).toMatch(/wallet/i);
  });
  it("detects allowance error on mint write", () => {
    const e = classifyMintError({ mintWrite: "ERC20: insufficient allowance" })!;
    expect(e.code).toBe("insufficient-allowance");
  });
  it("detects mint reverted on receipt", () => {
    const e = classifyMintError({ mintReceipt: "execution reverted: wallet limit" })!;
    expect(e.code).toBe("mint-reverted");
    expect(e.action).toMatch(/wallet limit|remaining/i);
  });
  it("detects wrong-chain", () => {
    const e = classifyMintError({ approveWrite: 'Chain "Foo" not configured' })!;
    expect(e.code).toBe("wrong-chain");
  });
  it("flags missing explorer link for a real tx hash", () => {
    const e = classifyMintError({ explorerMissingForTx: "0xabc123def4567890" })!;
    expect(e.code).toBe("explorer-unavailable");
  });
});
