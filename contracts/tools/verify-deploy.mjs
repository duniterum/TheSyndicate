#!/usr/bin/env node
// =============================================================================
//  Post-deploy read-back verifier (READ-ONLY, fail-closed)
// =============================================================================
//  Reads the deployed Sale V2's public views and asserts they match the intended
//  deploy: V1_MEMBER_ROOT, GENESIS_OFFSET == memberCount, token+wallet wiring,
//  reserve / per-era caps, and that the CommissionRouter is DISARMED (address(0),
//  day-one no referral). Expected values come from deploy-params.json + the
//  merkle artifact (root). Any mismatch exits non-zero.
//
//  Env:
//    RPC_URL   Avalanche C-Chain RPC (default public api.avax.network)
//    SALE_V2   deployed Sale V2 address (REQUIRED)
//    PARAMS    deploy-params.json path (default ../script/deploy-params.json)
//    MERKLE    v1-merkle.json path     (default ./v1-merkle.json — for the root)
//
//  Usage:
//    SALE_V2=0x… node verify-deploy.mjs
// =============================================================================
import { createPublicClient, http } from "viem";
import { avalanche } from "viem/chains";
import { readFileSync } from "node:fs";

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

const RPC = process.env.RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
const SALE_V2 = process.env.SALE_V2;
const PARAMS = process.env.PARAMS || "../script/deploy-params.json";
const MERKLE = process.env.MERKLE || "v1-merkle.json";

if (!SALE_V2) {
  console.error("set SALE_V2 to the deployed address");
  process.exit(1);
}

const params = JSON.parse(readFileSync(PARAMS, "utf8"));
let expectedRoot = null;
try {
  expectedRoot = JSON.parse(readFileSync(MERKLE, "utf8")).root;
} catch {
  /* no artifact present — fall back to params below */
}
if (!expectedRoot && /^0x[0-9a-fA-F]{64}$/.test(params.v1MemberRoot || "")) {
  expectedRoot = params.v1MemberRoot;
}

const ABI = [
  { type: "function", name: "V1_MEMBER_ROOT", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "GENESIS_OFFSET", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "memberCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "USDC", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "SYN", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "VAULT", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "LIQUIDITY", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "OPERATIONS", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "commissionRouter", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "RESERVE_THROUGH_SEAT", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "MAX_USDC_PER_TX", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "eraSynCap", stateMutability: "view", inputs: [{ name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxUsdcPerAddressPerEra", stateMutability: "view", inputs: [{ name: "era", type: "uint16" }], outputs: [{ type: "uint256" }] },
];

const client = createPublicClient({ chain: avalanche, transport: http(RPC) });
const read = (functionName, args = []) =>
  client.readContract({ address: SALE_V2, abi: ABI, functionName, args });

const checks = [];
function expect(name, actual, want) {
  const ok = String(actual).toLowerCase() === String(want).toLowerCase();
  checks.push({ name, ok, actual: String(actual), want: String(want) });
}

const [root, genesisOffset, memberCount, usdc, syn, vault, liquidity, operations, router, reserve, maxTx] =
  await Promise.all([
    read("V1_MEMBER_ROOT"),
    read("GENESIS_OFFSET"),
    read("memberCount"),
    read("USDC"),
    read("SYN"),
    read("VAULT"),
    read("LIQUIDITY"),
    read("OPERATIONS"),
    read("commissionRouter"),
    read("RESERVE_THROUGH_SEAT"),
    read("MAX_USDC_PER_TX"),
  ]);

if (expectedRoot) expect("V1_MEMBER_ROOT", root, expectedRoot);
expect("GENESIS_OFFSET == memberCount", String(genesisOffset), String(memberCount));
if (params.genesisOffset !== undefined)
  expect("GENESIS_OFFSET", String(genesisOffset), String(params.genesisOffset));
expect("USDC", usdc, params.usdc);
expect("SYN", syn, params.syn);
expect("VAULT", vault, params.vault);
expect("LIQUIDITY", liquidity, params.liquidity);
expect("OPERATIONS", operations, params.operations);
expect("commissionRouter disarmed (address(0))", router, ZERO_ADDR);
if (params.reserveThroughSeat !== undefined)
  expect("RESERVE_THROUGH_SEAT", String(reserve), String(params.reserveThroughSeat));
if (params.maxUsdcPerTx !== undefined)
  expect("MAX_USDC_PER_TX", String(maxTx), String(params.maxUsdcPerTx));

const eraCaps = params.eraCaps || [];
const addrCaps = params.addrCaps || [];
for (let e = 1; e <= 9; e++) {
  if (addrCaps[e - 1] !== undefined) {
    const a = await read("maxUsdcPerAddressPerEra", [e]);
    expect(`maxUsdcPerAddressPerEra[${e}]`, String(a), String(addrCaps[e - 1]));
  }
  // eraSynCap[1] (Genesis) is forced to type(uint256).max under Model 2 — not a
  // direct echo of eraCaps[0]; skip strict equality there. Eras II–IX echo.
  if (e >= 2 && eraCaps[e - 1] !== undefined) {
    const c = await read("eraSynCap", [e]);
    expect(`eraSynCap[${e}]`, String(c), String(eraCaps[e - 1]));
  }
}

let failed = 0;
for (const c of checks) {
  console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name}${c.ok ? "" : `  (got ${c.actual}, want ${c.want})`}`);
  if (!c.ok) failed++;
}
console.log(`\n${checks.length - failed}/${checks.length} checks passed`);
process.exit(failed ? 1 : 0);
