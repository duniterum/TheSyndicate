// Minimal ABIs for the Membership Sale flow. Read functions per project spec.

export const ERC20_ABI = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

export const SALE_ABI = [
  { type: "function", name: "availableSyn", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalUsdcRaised", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSynSold", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalBuyers", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "purchaseCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "vaultWallet", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "liquidityWallet", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "operationsWallet", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "buyerUsdcTotal", stateMutability: "view", inputs: [{ name: "buyer", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "buyerSynTotal", stateMutability: "view", inputs: [{ name: "buyer", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "quoteSyn", stateMutability: "view", inputs: [{ name: "usdcAmount", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "buy", stateMutability: "nonpayable", inputs: [{ name: "usdcAmount", type: "uint256" }], outputs: [] },
  {
    type: "event",
    name: "TokensPurchased",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "purchaseId", type: "uint256", indexed: true },
      { name: "usdcAmount", type: "uint256", indexed: false },
      { name: "synAmount", type: "uint256", indexed: false },
      { name: "vaultAmount", type: "uint256", indexed: false },
      { name: "liquidityAmount", type: "uint256", indexed: false },
      { name: "operationsAmount", type: "uint256", indexed: false },
    ],
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────
// Sale V2 (Model 2 continuation). Distinct from SALE_ABI: buy() takes 4 args
// (usdcIn, referrer, minSynOut, v1Proof[]), emits Purchased + Routed, and adds
// claimV1Membership + a richer view surface used for read-back assertions.
// Used ONLY when SALE_V2_LIVE; the V1 path above is untouched.
// ─────────────────────────────────────────────────────────────────────────
export const SALE_V2_ABI = [
  // ── writes ──
  {
    type: "function", name: "buy", stateMutability: "nonpayable",
    inputs: [
      { name: "usdcIn", type: "uint256" },
      { name: "referrer", type: "address" },
      { name: "minSynOut", type: "uint256" },
      { name: "v1Proof", type: "bytes32[]" },
    ],
    outputs: [],
  },
  { type: "function", name: "claimV1Membership", stateMutability: "nonpayable", inputs: [{ name: "proof", type: "bytes32[]" }], outputs: [] },
  // ── quote / sizing views ──
  {
    type: "function", name: "quote", stateMutability: "view",
    inputs: [{ name: "usdcIn", type: "uint256" }],
    outputs: [
      { name: "synOut", type: "uint256" },
      { name: "era", type: "uint16" },
      { name: "synPerUsdc", type: "uint64" },
      { name: "seatIfFirst", type: "uint256" },
      { name: "available", type: "uint256" },
      { name: "eraCapRemaining", type: "uint256" },
    ],
  },
  { type: "function", name: "availableSyn", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "sellableSynForNextSeat", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "currentReserveFloor", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "nextSeatNumber", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "currentEra", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  { type: "function", name: "remainingEraCap", stateMutability: "view", inputs: [{ name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isConcluded", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  // ── identity / continuity views ──
  { type: "function", name: "memberCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "GENESIS_OFFSET", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "V1_MEMBER_ROOT", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "knownMember", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "memberNumberOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "usdcContributed", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  // ── economics / read-back views ──
  { type: "function", name: "totalUsdcRaised", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSynSold", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "VAULT", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "LIQUIDITY", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "OPERATIONS", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "MAX_USDC_PER_TX", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "RESERVE_THROUGH_SEAT", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "eraSynCap", stateMutability: "view", inputs: [{ name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxUsdcPerAddressPerEra", stateMutability: "view", inputs: [{ name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "usdcByAddressEra", stateMutability: "view", inputs: [{ name: "account", type: "address" }, { name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "activeEra", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  // ── router / governance views ──
  { type: "function", name: "commissionRouter", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pendingCommissionRouter", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "RECOVERY_TIMELOCK", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "ROUTER_TIMELOCK", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "pendingOwner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  // ── events ──
  {
    type: "event", name: "Purchased",
    inputs: [
      { name: "buyer", type: "address", indexed: true },
      { name: "memberNumber", type: "uint256", indexed: true },
      { name: "era", type: "uint16", indexed: true },
      { name: "usdcIn", type: "uint256", indexed: false },
      { name: "synOut", type: "uint256", indexed: false },
      { name: "synPerUsdc", type: "uint64", indexed: false },
      { name: "firstSeat", type: "bool", indexed: false },
    ],
  },
  {
    type: "event", name: "Routed",
    inputs: [
      { name: "memberNumber", type: "uint256", indexed: true },
      { name: "vaultAmount", type: "uint256", indexed: false },
      { name: "liquidityAmount", type: "uint256", indexed: false },
      { name: "operationsAmount", type: "uint256", indexed: false },
      { name: "referralAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event", name: "V1MembershipRecognized",
    inputs: [{ name: "member", type: "address", indexed: true }],
  },
] as const;

// Uniswap V2-style pair (Trader Joe v1 uses this interface).
export const PAIR_ABI = [
  { type: "function", name: "token0",      stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "token1",      stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "decimals",    stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  {
    type: "function",
    name: "getReserves",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "_reserve0", type: "uint112" },
      { name: "_reserve1", type: "uint112" },
      { name: "_blockTimestampLast", type: "uint32" },
    ],
  },
] as const;
