import { describe, expect, it } from "vitest";
import {
  buildArtifactMintCommerceReceipt,
  buildMembershipCommerceReceipt,
} from "../protocol-commerce-receipt";
import { txExplorerUrl } from "../syndicate-config";

describe("protocol commerce receipt", () => {
  it("builds a membership receipt with seat, SYN, USDC, routing, and proof", () => {
    const receipt = buildMembershipCommerceReceipt({
      wallet: "0x1111111111111111111111111111111111111111",
      memberNumber: 42,
      usdcPaid: "$25",
      synReceived: "2,500 SYN",
      vaultAmount: "$17.50",
      liquidityAmount: "$5",
      operationsAmount: "$2.50",
      capitalFootprintBand: "Operator",
      proof: {
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        explorerUrl: txExplorerUrl("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      },
    });

    expect(receipt).toMatchObject({
      kind: "membership",
      status: "LIVE",
      title: "Membership Sale receipt",
      wallet: "0x1111111111111111111111111111111111111111",
      proof: {
        txHash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      },
    });
    expect(receipt.lines).toEqual([
      { label: "Wallet seated", value: "Member #42" },
      { label: "SYN received", value: "2,500 SYN" },
      { label: "USDC paid", value: "$25" },
      { label: "Capital footprint", value: "Operator" },
    ]);
    expect(receipt.routingEffects).toEqual([
      { label: "Vault", pct: 70, value: "$17.50" },
      { label: "Liquidity", pct: 20, value: "$5" },
      { label: "Operations", pct: 10, value: "$2.50" },
    ]);
  });

  it("does not fabricate a member number while indexing lags", () => {
    const receipt = buildMembershipCommerceReceipt({
      usdcPaid: "$5",
      synReceived: "500 SYN",
      vaultAmount: "$3.50",
      liquidityAmount: "$1",
      operationsAmount: "$0.50",
      proof: {
        txHash: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        explorerUrl: txExplorerUrl("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"),
      },
    });

    expect(receipt.lines[0]).toEqual({
      label: "Wallet seated",
      value: "Seated wallet; member number indexing",
    });
  });

  it("builds an artifact mint receipt without membership, financial, claim, or governance framing", () => {
    const receipt = buildArtifactMintCommerceReceipt({
      wallet: "0x2222222222222222222222222222222222222222",
      artifactName: "The First Signal",
      tokenId: "1",
      quantity: "1",
      usdcPaid: "0.50 USDC",
      ownershipStatus: "Ownership refresh pending",
      proof: {
        txHash: "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
        explorerUrl: txExplorerUrl("0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"),
      },
    });

    expect(receipt).toMatchObject({
      kind: "artifact-mint",
      status: "LIVE",
      title: "The First Signal receipt",
      wallet: "0x2222222222222222222222222222222222222222",
    });
    expect(receipt.summary).toContain("Artifacts are protocol memories");
    expect(receipt.lines).toContainEqual({
      label: "Rights",
      value: "Collectible record only; no membership, financial, claim, or governance rights",
    });
    expect(receipt.routingEffects).toEqual([]);

    const text = `${receipt.summary} ${receipt.lines.map((line) => `${line.label} ${line.value}`).join(" ")}`;
    expect(text).not.toMatch(/\b(?:earned|reward|revenue share|profit|dividend|seat granted)\b/i);
  });
});
