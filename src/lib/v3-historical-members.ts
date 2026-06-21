// V3 historical-member freeze artifact, block 88496414.
// Source: contracts/script/output/v3-historical-members-root.freeze-88496414.json
//
// These wallets already own member numbers #1-#8 in protocol history. V3 direct
// buys currently use an empty proof and claimHistoricalMembership is not wired
// into the public UI, so the frontend must fail closed for these wallets.

export const V3_HISTORICAL_MEMBER_ROOT =
  "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329" as const;

export type V3HistoricalMember = {
  memberNumber: number;
  wallet: `0x${string}`;
  source: "V1" | "V2a" | "V2b";
};

export const V3_HISTORICAL_MEMBERS: readonly V3HistoricalMember[] = [
  { memberNumber: 1, wallet: "0x244531C571966f90f4849e03a507543d90f9C721", source: "V1" },
  { memberNumber: 2, wallet: "0x3488857b003104e2B08A1D198f8a23BFF28B0045", source: "V1" },
  { memberNumber: 3, wallet: "0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0", source: "V2a" },
  { memberNumber: 4, wallet: "0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a", source: "V2a" },
  { memberNumber: 5, wallet: "0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD", source: "V2a" },
  { memberNumber: 6, wallet: "0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9", source: "V2b" },
  { memberNumber: 7, wallet: "0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F", source: "V2b" },
  { memberNumber: 8, wallet: "0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081", source: "V2b" },
] as const;

const V3_HISTORICAL_MEMBER_BY_WALLET = new Map(
  V3_HISTORICAL_MEMBERS.map((member) => [member.wallet.toLowerCase(), member]),
);

export function getV3HistoricalMember(address: string | null | undefined) {
  if (!address) return undefined;
  return V3_HISTORICAL_MEMBER_BY_WALLET.get(address.toLowerCase());
}

export function isV3HistoricalMember(address: string | null | undefined): boolean {
  return getV3HistoricalMember(address) !== undefined;
}
