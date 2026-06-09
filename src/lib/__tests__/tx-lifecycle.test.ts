import { describe, it, expect } from "vitest";
import { deriveLifecycle, isPendingPhase, isTerminalPhase, RETRYABLE_PHASES } from "../tx-lifecycle";

const base = {
  hasWallet: true,
  wrongNetwork: false,
  needsApproval: false,
  approvalPending: false,
  approvalConfirmed: false,
  txPending: false,
  txConfirmed: false,
};

describe("deriveLifecycle", () => {
  it("returns needs-wallet when disconnected", () => {
    expect(deriveLifecycle({ ...base, hasWallet: false }).phase).toBe("needs-wallet");
  });
  it("returns wrong-network when chain mismatched", () => {
    expect(deriveLifecycle({ ...base, wrongNetwork: true }).phase).toBe("wrong-network");
  });
  it("returns needs-approval when allowance is low", () => {
    expect(deriveLifecycle({ ...base, needsApproval: true }).phase).toBe("needs-approval");
  });
  it("approval pending beats needs-approval", () => {
    expect(deriveLifecycle({ ...base, needsApproval: true, approvalPending: true }).phase).toBe(
      "approval-pending",
    );
  });
  it("tx-confirmed is terminal even with prior states", () => {
    const r = deriveLifecycle({ ...base, txConfirmed: true, txHash: "0xabc" as `0x${string}` });
    expect(r.phase).toBe("tx-confirmed");
    expect(isTerminalPhase(r.phase)).toBe(true);
    expect(r.retryable).toBe(false);
  });
  it("failed when error present", () => {
    const r = deriveLifecycle({ ...base, error: "boom" });
    expect(r.phase).toBe("failed");
    expect(RETRYABLE_PHASES.has(r.phase)).toBe(true);
  });
  it("rejected when user cancelled", () => {
    expect(deriveLifecycle({ ...base, rejected: true }).phase).toBe("rejected");
  });
  it("isPendingPhase covers approval-pending and tx-pending", () => {
    expect(isPendingPhase("approval-pending")).toBe(true);
    expect(isPendingPhase("tx-pending")).toBe(true);
    expect(isPendingPhase("idle")).toBe(false);
  });
});
