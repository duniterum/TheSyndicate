import { describe, expect, it } from "vitest";
import { interpretProtocolEvent } from "../protocol-event-intelligence";
import { enrichEvent, type EnrichContext, type ProtocolEvent } from "../protocol-events";
import { CONTRACTS, SYN_BURN_ADDRESS, SYNDICATE_CONFIG } from "../syndicate-config";

const BUYER = "0x1111111111111111111111111111111111111111";
const VALID_TX_A = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const VALID_TX_B = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const VALID_TX_C = "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc";

function event(kind: ProtocolEvent["kind"], txHash: string, ctx: EnrichContext = {}) {
  const base: ProtocolEvent = {
    id: `${kind}-${txHash}`,
    kind,
    title: `${kind} happened`,
    detail: "Test event",
    blockNumber: 1n,
    logIndex: 0,
    txHash,
    actor: ctx.from,
    badge: "live",
  };
  return enrichEvent(base, ctx);
}

describe("protocol-event-intelligence", () => {
  it("explains Membership Sale as the SYN seat entry and not a Chronicle candidate", () => {
    const intel = interpretProtocolEvent(
      event("purchase", VALID_TX_A, {
        from: BUYER,
        to: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
        amount: 25,
        token: "USDC",
        sourceContract: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
      }),
    );

    expect(intel.meaning).toContain("SYN is the seat");
    expect(intel.consequence).toContain("70 / 20 / 10");
    expect(intel.metricEffects).toContain("members");
    expect(intel.chronicleCandidate.status).toBe("NOT_ELIGIBLE");
    expect(intel.registerDisposition.status).toBe("NO_REGISTER_DISPOSITION");
  });

  it("keeps archive mints framed as memories, not seats", () => {
    const intel = interpretProtocolEvent(
      event("nft-mint-patron-seal", VALID_TX_B, {
        from: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS,
        to: BUYER,
        amount: 1,
        token: "NFT",
        sourceContract: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS,
      }),
    );

    expect(intel.meaning).toContain("protocol memory");
    expect(intel.meaning).toContain("not the seat");
    expect(intel.consequence).toContain("without changing seat status");
    expect(intel.chronicleCandidate.status).toBe("CANDIDATE");
    expect(intel.registerDisposition.status).toBe("CHRONICLE_CANDIDATE_ONLY");
  });

  it("attributes founder burns without creating financial claims", () => {
    const intel = interpretProtocolEvent(
      event("burn-founder", VALID_TX_C, {
        from: SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS,
        to: SYN_BURN_ADDRESS,
        amount: 1000,
        token: "SYN",
        sourceContract: CONTRACTS.SYN_CONTRACT_ADDRESS,
      }),
    );

    expect(intel.attribution).toContain("Founder Burn");
    expect(intel.attribution).toContain("Recognition only");
    expect(intel.attribution).toContain("no financial claim");
    expect(intel.consequence).toContain("Proof of Burn history");
  });

  it("claims an Institutional Register record only through the active tx index", () => {
    const txHash = VALID_TX_C;
    const intel = interpretProtocolEvent(event("lp-add", txHash), {
      institutionalIndex: new Map([
        [
          txHash.toLowerCase(),
          {
            entryId: "ir-test",
            title: "Active test register entry",
          },
        ],
      ]),
    });

    expect(intel.chronicleCandidate.status).toBe("CANDIDATE");
    expect(intel.registerDisposition).toMatchObject({
      status: "ACTIVE_RECORD",
      route: "/institutional-register",
      entryId: "ir-test",
      title: "Active test register entry",
    });
  });
});
