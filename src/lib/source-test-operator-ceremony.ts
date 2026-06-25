export type SourceTestOperatorStage =
  | "LOCKED"
  | "NEEDS_APPROVAL"
  | "APPROVAL_PENDING"
  | "APPROVAL_ONLY_BUY_PENDING"
  | "READY_FOR_BUY"
  | "BUY_PENDING"
  | "BUY_CONFIRMED_WAIT_READBACK";

export type SourceTestOperatorState = {
  stage: SourceTestOperatorStage;
  label: string;
  detail: string;
  approvalOnly: boolean;
  buyComplete: boolean;
};

export function deriveSourceTestOperatorState(input: {
  canPrepare: boolean;
  needsApproval: boolean;
  approvalPending: boolean;
  approvalConfirmed: boolean;
  buyPending: boolean;
  buyReceiptConfirmed: boolean;
  approveHash?: `0x${string}`;
  buyHash?: `0x${string}`;
}): SourceTestOperatorState {
  const approvalOnly = Boolean(input.approveHash && input.approvalConfirmed && !input.buyHash);
  const buyComplete = Boolean(input.buyHash && input.buyReceiptConfirmed);

  if (buyComplete) {
    return {
      stage: "BUY_CONFIRMED_WAIT_READBACK",
      label: "Buy submitted - STOP and wait for readback",
      detail:
        "This is the protocol event. Do not re-pause until the MembershipPurchasedV3 receipt, routing, source attribution, and payout are read back.",
      approvalOnly: false,
      buyComplete: true,
    };
  }

  if (input.buyPending) {
    return {
      stage: "BUY_PENDING",
      label: "Buy transaction pending",
      detail:
        "This is the MembershipSaleV3 buy. Wait for the receipt before taking any next action.",
      approvalOnly: false,
      buyComplete: false,
    };
  }

  if (!input.canPrepare) {
    return {
      stage: "LOCKED",
      label: "Locked: ceremony prerequisites incomplete",
      detail:
        "The console is showing blockers. Do not go to /join and do not attempt a separate contract call.",
      approvalOnly: false,
      buyComplete: false,
    };
  }

  if (input.approvalPending) {
    return {
      stage: "APPROVAL_PENDING",
      label: "Approval transaction pending",
      detail:
        "Approval is permission only. It does not buy membership, create a seat, emit MembershipPurchasedV3, or prove source attribution.",
      approvalOnly: false,
      buyComplete: false,
    };
  }

  if (approvalOnly) {
    return {
      stage: "APPROVAL_ONLY_BUY_PENDING",
      label: "Approval complete - buy still pending",
      detail:
        "The approval transaction only gave MembershipSaleV3 permission to spend 5 USDC. Now stay on this page and start the controlled $5 buy.",
      approvalOnly: true,
      buyComplete: false,
    };
  }

  if (input.needsApproval) {
    return {
      stage: "NEEDS_APPROVAL",
      label: "Next action: approve exactly 5 USDC",
      detail:
        "This approval only lets MembershipSaleV3 spend the test amount. It is not the buy and not the protocol receipt.",
      approvalOnly: false,
      buyComplete: false,
    };
  }

  return {
    stage: "READY_FOR_BUY",
    label: "Next action: start controlled $5 test buy",
    detail:
      "The next wallet action must be MembershipSaleV3.buy with the frozen non-zero sourceId. This is the protocol event.",
    approvalOnly: false,
    buyComplete: false,
  };
}
