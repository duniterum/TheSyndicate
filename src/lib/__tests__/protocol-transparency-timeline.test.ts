import { describe, expect, it } from "vitest";
import {
  TRANSPARENCY_TIMELINE,
  getTransparencyTimeline,
  getTransparencyTimelineByStatus,
  type TransparencyTimelineStatus,
} from "../protocol-transparency-timeline";
import { TAGGED_TRANSACTIONS, txExplorerUrl } from "../transaction-tags";

const ALLOWED_STATUS: readonly TransparencyTimelineStatus[] = [
  "LIVE",
  "PARTIAL",
  "PENDING",
  "RESERVED",
  "REQUIRES_CONTRACT",
];

describe("protocol-transparency-timeline", () => {
  it("covers the handoff sequence without inventing a fake-live future step", () => {
    expect(getTransparencyTimeline().map((entry) => entry.stage)).toEqual([
      "Founder Deposit",
      "Product Launch",
      "Operations Payment",
      "Chronicle",
      "Member Growth",
      "Chapter Milestone",
    ]);

    for (const entry of TRANSPARENCY_TIMELINE) {
      expect(ALLOWED_STATUS).toContain(entry.status);
    }
    expect(getTransparencyTimelineByStatus("PENDING").map((entry) => entry.id)).toContain(
      "operations-payment-classification",
    );
    expect(getTransparencyTimelineByStatus("RESERVED").map((entry) => entry.id)).toContain(
      "chapter-milestone-reserved",
    );
  });

  it("uses the tagged LP seed transaction as the only live transaction proof", () => {
    const lpSeed = TAGGED_TRANSACTIONS.find((tx) => tx.tag === "LP_SEED");
    expect(lpSeed).toBeTruthy();

    const entry = getTransparencyTimeline().find((item) => item.id === "founder-deposit-liquidity-seed");
    expect(entry).toBeTruthy();
    expect(entry?.status).toBe("LIVE");
    expect(entry?.proofHref).toBe(lpSeed ? txExplorerUrl(lpSeed.txHash) : null);
  });

  it("keeps pending and reserved entries non-clickable as proof", () => {
    for (const entry of getTransparencyTimeline()) {
      if (entry.status === "PENDING" || entry.status === "RESERVED" || entry.status === "REQUIRES_CONTRACT") {
        expect(entry.proofHref, `${entry.id} must not expose a proof link`).toBeNull();
        expect(entry.proofLabel, `${entry.id} must not expose a proof label`).toBeNull();
      }
    }
  });

  it("states the key doctrine corrections in reader-facing copy", () => {
    const text = getTransparencyTimeline()
      .map((entry) => `${entry.summary} ${entry.consequence}`)
      .join("\n");

    expect(text).toContain("Buying membership delivers SYN");
    expect(text).toContain("holding SYN means the wallet is seated");
    expect(text).toContain("not yield framing");
    expect(text).toContain("No chapter milestone, artifact, or receipt is shown as live");
  });
});
