/**
 * Pure tests for the NextActionContext builder — the deterministic core of the
 * canonical adapter. Asserts the six journey dimensions are interpreted in one
 * place and that, fed into the selector, they reproduce every membership-axis
 * state. (The React hook `useNextActionContext` is a thin gather-and-delegate
 * wrapper over this builder and carries no extra logic.)
 */

import { describe, expect, it } from "vitest";

import {
  buildNextActionContext,
  type NextActionContextInputs,
} from "../next-action-context";
import { selectNextActions, deriveIdentityState } from "../next-best-action";

const base: NextActionContextInputs = {
  isConnected: false,
  identityLoading: false,
  record: undefined,
  ownsArtifacts: false,
};

describe("buildNextActionContext — membership normalization", () => {
  it("disconnected wallet → non-member, zero recognition input", () => {
    const ctx = buildNextActionContext(base);
    expect(ctx).toEqual({
      isConnected: false,
      identityLoading: false,
      isMember: false,
      cumulativeUsdc: 0,
      ownsArtifacts: false,
    });
  });

  it("null and undefined records both collapse to honest non-member", () => {
    for (const record of [null, undefined] as const) {
      const ctx = buildNextActionContext({ ...base, isConnected: true, record });
      expect(ctx.isMember).toBe(false);
      expect(ctx.cumulativeUsdc).toBe(0);
    }
  });

  it("a record present ⇒ member, and carries its cumulative USDC", () => {
    const ctx = buildNextActionContext({
      ...base,
      isConnected: true,
      record: { cumulativeUsdc: 500 },
    });
    expect(ctx.isMember).toBe(true);
    expect(ctx.cumulativeUsdc).toBe(500);
  });

  it("ownsArtifacts passes through unchanged (collector overlay input)", () => {
    expect(buildNextActionContext({ ...base, ownsArtifacts: true }).ownsArtifacts).toBe(
      true,
    );
    expect(buildNextActionContext({ ...base, ownsArtifacts: false }).ownsArtifacts).toBe(
      false,
    );
  });

  it("identityLoading passes through unchanged", () => {
    expect(
      buildNextActionContext({ ...base, isConnected: true, identityLoading: true })
        .identityLoading,
    ).toBe(true);
  });

  it("is pure: repeated calls on the same inputs are equal", () => {
    const inputs: NextActionContextInputs = {
      isConnected: true,
      identityLoading: false,
      record: { cumulativeUsdc: 100 },
      ownsArtifacts: true,
    };
    expect(buildNextActionContext(inputs)).toEqual(buildNextActionContext(inputs));
  });
});

describe("buildNextActionContext → selector reproduces every state", () => {
  it("visitor: disconnected", () => {
    const ctx = buildNextActionContext(base);
    expect(deriveIdentityState(ctx)).toBe("visitor");
    expect(selectNextActions(ctx).joinIntent).toBe("join");
  });

  it("identity-loading: connected + loading (record unknown)", () => {
    const ctx = buildNextActionContext({
      ...base,
      isConnected: true,
      identityLoading: true,
    });
    expect(deriveIdentityState(ctx)).toBe("identity-loading");
    expect(selectNextActions(ctx).joinIntent).toBe("none");
  });

  it("connected-non-member: connected, loaded, no record", () => {
    const ctx = buildNextActionContext({ ...base, isConnected: true });
    expect(deriveIdentityState(ctx)).toBe("connected-non-member");
    expect(selectNextActions(ctx).joinIntent).toBe("join");
  });

  it("member with a further tier → not atTopRank, buy-more intent", () => {
    const ctx = buildNextActionContext({
      ...base,
      isConnected: true,
      record: { cumulativeUsdc: 100 },
    });
    const plan = selectNextActions(ctx);
    expect(plan.state).toBe("member");
    expect(plan.atTopRank).toBe(false);
    expect(plan.joinIntent).toBe("buy-more");
  });

  it("member at the deepest tier → atTopRank", () => {
    const ctx = buildNextActionContext({
      ...base,
      isConnected: true,
      record: { cumulativeUsdc: 10_000_000 },
    });
    const plan = selectNextActions(ctx);
    expect(plan.state).toBe("member");
    expect(plan.atTopRank).toBe(true);
  });
});
