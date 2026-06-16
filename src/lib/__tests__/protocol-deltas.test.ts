// Protocol-wide delta helper — pure diff math shared by the two
// "since your last visit" surfaces. Guards undefined-safety, sign handling,
// and that exactly the four canonical metrics are covered.

import { describe, it, expect } from "vitest";
import {
  computeProtocolDeltas,
  PROTOCOL_DELTA_METRICS,
} from "../protocol-deltas";

describe("protocol-deltas · computeProtocolDeltas", () => {
  it("returns undefined for a metric when either side is missing", () => {
    expect(computeProtocolDeltas({ members: 5 }, {}).members).toBeUndefined();
    expect(computeProtocolDeltas({}, { members: 5 }).members).toBeUndefined();
    expect(computeProtocolDeltas({}, {}).usdcRaised).toBeUndefined();
  });

  it("computes positive, zero, and negative deltas", () => {
    const d = computeProtocolDeltas(
      { members: 10, usdcRaised: 500, purchases: 3, vaultUsdc: 100 },
      { members: 7, usdcRaised: 500, purchases: 5, vaultUsdc: 40 },
    );
    expect(d.members).toBe(3); // positive
    expect(d.usdcRaised).toBe(0); // zero
    expect(d.purchases).toBe(-2); // negative
    expect(d.vaultUsdc).toBe(60);
  });

  it("covers exactly the four canonical metrics", () => {
    expect([...PROTOCOL_DELTA_METRICS].sort()).toEqual(
      ["members", "purchases", "usdcRaised", "vaultUsdc"],
    );
    const d = computeProtocolDeltas(
      { members: 1, usdcRaised: 1, purchases: 1, vaultUsdc: 1 },
      { members: 0, usdcRaised: 0, purchases: 0, vaultUsdc: 0 },
    );
    expect(Object.keys(d).sort()).toEqual(
      ["members", "purchases", "usdcRaised", "vaultUsdc"],
    );
  });
});
