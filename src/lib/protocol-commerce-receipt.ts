// Shared commerce receipt model.
//
// This is a pure data layer for confirmed protocol commerce. It does not read
// chain state, infer balances, or make future systems look live. Callers pass
// only values they already know from a confirmed transaction or indexed event.

export type CommerceReceiptKind =
  | "membership"
  | "artifact-mint"
  | "future-reward"
  | "future-product";

export type CommerceReceiptStatus =
  | "LIVE"
  | "PARTIAL"
  | "PENDING"
  | "RESERVED"
  | "REQUIRES_CONTRACT"
  | "PREVIEW"
  | "FUTURE";

export interface CommerceReceiptProof {
  txHash: `0x${string}`;
  explorerUrl: string;
}

export interface CommerceReceiptLine {
  label: string;
  value: string;
}

export interface CommerceReceiptEffect {
  label: "Vault" | "Liquidity" | "Operations";
  pct: 70 | 20 | 10;
  value: string;
}

export interface ProtocolCommerceReceipt {
  kind: CommerceReceiptKind;
  status: CommerceReceiptStatus;
  title: string;
  summary: string;
  wallet?: `0x${string}`;
  proof: CommerceReceiptProof;
  lines: CommerceReceiptLine[];
  routingEffects: CommerceReceiptEffect[];
}

export interface MembershipCommerceReceiptInput {
  wallet?: `0x${string}`;
  memberNumber?: number;
  usdcPaid: string;
  synReceived: string;
  vaultAmount: string;
  liquidityAmount: string;
  operationsAmount: string;
  proof: CommerceReceiptProof;
  capitalFootprintBand?: string;
}

export interface ArtifactMintCommerceReceiptInput {
  wallet?: `0x${string}`;
  artifactName: string;
  tokenId: string;
  quantity: string;
  usdcPaid: string;
  proof: CommerceReceiptProof;
  ownershipStatus?: string;
}

export function buildMembershipCommerceReceipt({
  wallet,
  memberNumber,
  usdcPaid,
  synReceived,
  vaultAmount,
  liquidityAmount,
  operationsAmount,
  proof,
  capitalFootprintBand,
}: MembershipCommerceReceiptInput): ProtocolCommerceReceipt {
  const seatValue =
    memberNumber !== undefined ? `Member #${memberNumber}` : "Seated wallet; member number indexing";
  const lines: CommerceReceiptLine[] = [
    { label: "Wallet seated", value: seatValue },
    { label: "SYN received", value: synReceived },
    { label: "USDC paid", value: usdcPaid },
  ];

  if (capitalFootprintBand) {
    lines.push({ label: "Capital footprint", value: capitalFootprintBand });
  }

  return {
    kind: "membership",
    status: "LIVE",
    title: "Membership Sale receipt",
    summary:
      "Membership purchase confirmed. SYN is the seat; the transaction and 70 / 20 / 10 routing are verifiable on-chain.",
    wallet,
    proof,
    lines,
    routingEffects: [
      { label: "Vault", pct: 70, value: vaultAmount },
      { label: "Liquidity", pct: 20, value: liquidityAmount },
      { label: "Operations", pct: 10, value: operationsAmount },
    ],
  };
}

export function buildArtifactMintCommerceReceipt({
  wallet,
  artifactName,
  tokenId,
  quantity,
  usdcPaid,
  proof,
  ownershipStatus,
}: ArtifactMintCommerceReceiptInput): ProtocolCommerceReceipt {
  const lines: CommerceReceiptLine[] = [
    { label: "Artifact", value: artifactName },
    { label: "Token ID", value: tokenId },
    { label: "Quantity", value: quantity },
    { label: "USDC paid", value: usdcPaid },
    { label: "Rights", value: "Collectible record only; no membership, financial, claim, or governance rights" },
  ];

  if (ownershipStatus) {
    lines.push({ label: "Wallet ownership", value: ownershipStatus });
  }

  return {
    kind: "artifact-mint",
    status: "LIVE",
    title: `${artifactName} receipt`,
    summary:
      "Archive mint confirmed. Artifacts are protocol memories, not membership seats or financial rights.",
    wallet,
    proof,
    lines,
    routingEffects: [],
  };
}
