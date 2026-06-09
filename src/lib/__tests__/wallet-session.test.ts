import { describe, it, expect } from "vitest";
import { shortAddress } from "../wallet-session";

describe("shortAddress", () => {
  it("returns shortened form for valid addresses", () => {
    expect(shortAddress("0x1234567890abcdef1234567890abcdef12345678")).toBe("0x1234…5678");
  });
  it("returns null for invalid input", () => {
    expect(shortAddress(undefined)).toBeNull();
    expect(shortAddress("not-an-address")).toBeNull();
    expect(shortAddress("0x123")).toBeNull();
  });
});
