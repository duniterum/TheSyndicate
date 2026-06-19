import { describe, expect, it } from "vitest";
import { FUTURE_EVENT_NAMESPACES } from "../protocol-event-registry";
import { deriveProtocolHorizon, type HorizonStatus } from "../protocol-horizon";

const allowed: HorizonStatus[] = [
  "WATCHING",
  "FORMING",
  "APPROACHING",
  "SEALED",
  "ARCHIVED",
  "RESERVED_MEMORY",
  "REQUIRES_CONTRACT",
  "READ_GATED",
  "NOT_YET_LIVE",
];

describe("protocol horizon", () => {
  it("derives truthful anticipation states from live or reserved inputs", () => {
    const items = deriveProtocolHorizon({
      memberCount: 120,
      usdcRouted: 850,
      firstSignalMinted: true,
      patronSealMinted: false,
      archiveEventCount: 2,
      chronicleCandidateCount: 1,
      recognitionCandidateCount: 1,
      futureNamespaces: FUTURE_EVENT_NAMESPACES,
    });

    expect(items.map((item) => item.status).every((status) => allowed.includes(status))).toBe(true);
    expect(items.find((item) => item.track === "chapter")?.status).toBe("FORMING");
    expect(items.find((item) => item.track === "milestone")?.status).toBe("APPROACHING");
    expect(items.find((item) => item.track === "archive")?.status).toBe("ARCHIVED");
    expect(items.find((item) => item.track === "memory")?.status).toBe("WATCHING");
    expect(items.find((item) => item.track === "future-system")?.status).toBe("REQUIRES_CONTRACT");
  });

  it("keeps future systems reserved and does not emit fake-live action copy", () => {
    const text = deriveProtocolHorizon({
      memberCount: 0,
      usdcRouted: undefined,
      firstSignalMinted: false,
      patronSealMinted: false,
      archiveEventCount: 0,
      chronicleCandidateCount: 0,
      recognitionCandidateCount: 0,
      futureNamespaces: FUTURE_EVENT_NAMESPACES,
    })
      .map((item) => `${item.status} ${item.title} ${item.body} ${item.progressLabel ?? ""}`)
      .join("\n");

    expect(text).toContain("REQUIRES_CONTRACT");
    expect(text).not.toMatch(/legendary drop|limited-time rarity|guaranteed eligibility/i);
    expect(text).not.toMatch(/earn rewards now|claim soon|financial upside/i);
    expect(text).not.toMatch(/guaranteed|payout available|mintable now/i);
  });
});
