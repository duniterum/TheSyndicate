import { describe, expect, it } from "vitest";
import {
  getV3HistoricalMember,
  isV3HistoricalMember,
  V3_HISTORICAL_MEMBER_ROOT,
  V3_HISTORICAL_MEMBERS,
} from "@/lib/v3-historical-members";

describe("V3 historical member guard", () => {
  it("freezes the numbered historical member root and eight-wallet roster", () => {
    expect(V3_HISTORICAL_MEMBER_ROOT).toBe(
      "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329",
    );
    expect(V3_HISTORICAL_MEMBERS).toHaveLength(8);
    expect(V3_HISTORICAL_MEMBERS.map((member) => member.memberNumber)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("recognizes historical wallets case-insensitively", () => {
    for (const member of V3_HISTORICAL_MEMBERS) {
      expect(isV3HistoricalMember(member.wallet)).toBe(true);
      expect(isV3HistoricalMember(member.wallet.toLowerCase())).toBe(true);
      expect(getV3HistoricalMember(member.wallet)?.memberNumber).toBe(member.memberNumber);
    }
  });

  it("does not classify unknown or empty wallets as historical members", () => {
    expect(isV3HistoricalMember(undefined)).toBe(false);
    expect(isV3HistoricalMember(null)).toBe(false);
    expect(isV3HistoricalMember("0x000000000000000000000000000000000000dEaD")).toBe(false);
  });
});
