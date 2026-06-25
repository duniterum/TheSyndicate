import { describe, expect, it } from "vitest";
import { deriveSourceTestOperatorState } from "../source-test-operator-ceremony";

const APPROVE_HASH = `0x${"a".repeat(64)}` as const;
const BUY_HASH = `0x${"b".repeat(64)}` as const;

describe("source test operator ceremony state", () => {
  it("treats approval as permission only, not as the completed buy", () => {
    const state = deriveSourceTestOperatorState({
      canPrepare: true,
      needsApproval: false,
      approvalPending: false,
      approvalConfirmed: true,
      buyPending: false,
      buyReceiptConfirmed: false,
      approveHash: APPROVE_HASH,
    });

    expect(state.stage).toBe("APPROVAL_ONLY_BUY_PENDING");
    expect(state.approvalOnly).toBe(true);
    expect(state.buyComplete).toBe(false);
    expect(state.label).toContain("buy still pending");
    expect(state.detail).toContain("only gave MembershipSaleV3 permission");
  });

  it("requires buy transaction evidence before declaring the protocol event complete", () => {
    const approvalOnly = deriveSourceTestOperatorState({
      canPrepare: true,
      needsApproval: false,
      approvalPending: false,
      approvalConfirmed: true,
      buyPending: false,
      buyReceiptConfirmed: true,
      approveHash: APPROVE_HASH,
    });

    expect(approvalOnly.stage).toBe("APPROVAL_ONLY_BUY_PENDING");
    expect(approvalOnly.buyComplete).toBe(false);

    const buyComplete = deriveSourceTestOperatorState({
      canPrepare: true,
      needsApproval: false,
      approvalPending: false,
      approvalConfirmed: true,
      buyPending: false,
      buyReceiptConfirmed: true,
      approveHash: APPROVE_HASH,
      buyHash: BUY_HASH,
    });

    expect(buyComplete.stage).toBe("BUY_CONFIRMED_WAIT_READBACK");
    expect(buyComplete.buyComplete).toBe(true);
    expect(buyComplete.detail).toContain("MembershipPurchasedV3");
  });

  it("keeps the next action on the buy when approval already exists", () => {
    const state = deriveSourceTestOperatorState({
      canPrepare: true,
      needsApproval: false,
      approvalPending: false,
      approvalConfirmed: false,
      buyPending: false,
      buyReceiptConfirmed: false,
    });

    expect(state.stage).toBe("READY_FOR_BUY");
    expect(state.detail).toContain("MembershipSaleV3.buy");
    expect(state.buyComplete).toBe(false);
  });
});
