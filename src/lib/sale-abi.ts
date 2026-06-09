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
