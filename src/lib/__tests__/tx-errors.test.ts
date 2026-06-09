import { describe, it, expect } from "vitest";
import { classifyTxError } from "../tx-errors";

describe("classifyTxError", () => {
  it("detects user rejection (code 4001)", () => {
    const r = classifyTxError({ code: 4001, message: "User rejected the request" });
    expect(r.kind).toBe("user-rejected-tx");
    expect(r.retryable).toBe(true);
  });

  it("distinguishes approval rejection", () => {
    const r = classifyTxError({ code: 4001, message: "User rejected approval" });
    expect(r.kind).toBe("user-rejected-approval");
  });

  it("detects insufficient gas", () => {
    expect(classifyTxError(new Error("insufficient funds for gas * price + value")).kind).toBe(
      "insufficient-gas",
    );
  });

  it("detects insufficient USDC balance", () => {
    expect(classifyTxError(new Error("insufficient USDC balance")).kind).toBe("insufficient-usdc");
  });

  it("detects low allowance", () => {
    expect(classifyTxError(new Error("ERC20: insufficient allowance")).kind).toBe("allowance-too-low");
  });

  it("detects paused contract", () => {
    expect(classifyTxError(new Error("Pausable: paused")).kind).toBe("contract-paused");
  });

  it("detects sold out", () => {
    expect(classifyTxError(new Error("max supply exceeded")).kind).toBe("sold-out");
  });

  it("detects revert", () => {
    expect(classifyTxError(new Error("execution reverted")).kind).toBe("tx-reverted");
  });

  it("falls back to unknown without throwing", () => {
    expect(classifyTxError(null).kind).toBe("unknown");
    expect(classifyTxError(undefined).kind).toBe("unknown");
    expect(classifyTxError({}).kind).toBe("unknown");
  });

  it("always returns a non-empty title and message", () => {
    const r = classifyTxError(new Error("totally novel rpc explosion"));
    expect(r.title.length).toBeGreaterThan(0);
    expect(r.message.length).toBeGreaterThan(0);
  });
});
