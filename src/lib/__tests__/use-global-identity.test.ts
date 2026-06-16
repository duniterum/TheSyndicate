import { describe, it, expect } from "vitest";
import {
  resolveGlobalIdentity,
  type GlobalIdentityInput,
} from "@/lib/use-global-identity";

const ADDR = "0xabc0000000000000000000000000000000000001" as const;

function base(overrides: Partial<GlobalIdentityInput> = {}): GlobalIdentityInput {
  return {
    mounted: true,
    isConnected: false,
    address: null,
    idxLoading: false,
    idxError: false,
    hasRecord: false,
    ...overrides,
  };
}

describe("resolveGlobalIdentity — global identity state machine", () => {
  it("SSR / pre-mount → neutral, nothing asserted, no dashboard", () => {
    const r = resolveGlobalIdentity(base({ mounted: false, isConnected: true, address: ADDR, hasRecord: true }));
    expect(r.isConnected).toBe(false);
    expect(r.isLoadingIdentity).toBe(true);
    expect(r.isMember).toBe(false);
    expect(r.isConnectedNonMember).toBe(false);
    expect(r.shouldShowMySyndicate).toBe(false);
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
    expect(r.primaryMembershipLabelShort).toBe("Join");
  });

  it("disconnected visitor → Join, no member-only surfaces", () => {
    const r = resolveGlobalIdentity(base({ isConnected: false }));
    expect(r.isConnected).toBe(false);
    expect(r.isLoadingIdentity).toBe(false);
    expect(r.shouldShowMySyndicate).toBe(false);
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
  });

  it("connected + index still loading → neutral fallback, dashboard reachable, NO membership flash", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: ADDR, idxLoading: true, hasRecord: false }));
    expect(r.isConnected).toBe(true);
    expect(r.isLoadingIdentity).toBe(true);
    expect(r.isMember).toBe(false);
    expect(r.isConnectedNonMember).toBe(false);
    // dashboard is a destination, available to any connected wallet
    expect(r.shouldShowMySyndicate).toBe(true);
    // the two membership claims must NOT show while loading
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
  });

  it("connected non-member (resolved) → Become a Syndicate Member", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: ADDR, idxLoading: false, hasRecord: false }));
    expect(r.isConnected).toBe(true);
    expect(r.isLoadingIdentity).toBe(false);
    expect(r.isMember).toBe(false);
    expect(r.isConnectedNonMember).toBe(true);
    expect(r.shouldShowBecomeMember).toBe(true);
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowMySyndicate).toBe(true);
    expect(r.primaryMembershipLabel).toBe("Become a Syndicate Member");
    expect(r.primaryMembershipLabelShort).toBe("Become Member");
  });

  it("member (resolved) → Buy More SYN, never Become a Member", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: ADDR, idxLoading: false, hasRecord: true }));
    expect(r.isConnected).toBe(true);
    expect(r.isLoadingIdentity).toBe(false);
    expect(r.isMember).toBe(true);
    expect(r.isConnectedNonMember).toBe(false);
    expect(r.shouldShowBuyMoreSyn).toBe(true);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.shouldShowMySyndicate).toBe(true);
    expect(r.primaryMembershipLabel).toBe("Buy More SYN");
    expect(r.primaryMembershipLabelShort).toBe("Buy More SYN");
  });

  it("connected + index ERROR → neutral fallback, NO non-member flash (truth unknown)", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: ADDR, idxLoading: false, idxError: true, hasRecord: false }));
    expect(r.isConnected).toBe(true);
    expect(r.isLoadingIdentity).toBe(true);
    expect(r.isMember).toBe(false);
    expect(r.isConnectedNonMember).toBe(false);
    // dashboard is still reachable (a destination, not a membership claim)
    expect(r.shouldShowMySyndicate).toBe(true);
    // neither membership claim may render when index truth is unavailable
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
  });

  it("INVARIANT: an index error never lets a member-with-record assert membership", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: ADDR, idxLoading: false, idxError: true, hasRecord: true }));
    expect(r.isMember).toBe(false);
    expect(r.shouldShowBuyMoreSyn).toBe(false);
    expect(r.shouldShowBecomeMember).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
  });

  it("connected but no address yet → treated as not connected (neutral)", () => {
    const r = resolveGlobalIdentity(base({ isConnected: true, address: null }));
    expect(r.isConnected).toBe(false);
    expect(r.shouldShowMySyndicate).toBe(false);
    expect(r.primaryMembershipLabel).toBe("Join The Syndicate");
  });

  it("INVARIANT: Become-Member and Buy-More are mutually exclusive and never both during load", () => {
    for (const idxLoading of [true, false]) {
      for (const hasRecord of [true, false]) {
        const r = resolveGlobalIdentity(
          base({ isConnected: true, address: ADDR, idxLoading, hasRecord }),
        );
        expect(r.shouldShowBuyMoreSyn && r.shouldShowBecomeMember).toBe(false);
        if (r.isLoadingIdentity) {
          expect(r.shouldShowBuyMoreSyn).toBe(false);
          expect(r.shouldShowBecomeMember).toBe(false);
        }
      }
    }
  });
});
