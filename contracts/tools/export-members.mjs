#!/usr/bin/env node
// =============================================================================
//  V1 member snapshot exporter (READ-ONLY)
// =============================================================================
//  Scans the LIVE V1 Membership Sale for `TokensPurchased` logs and emits the
//  unique member set in FIRST-SEEN order — the exact master-identity ordering
//  the Holder Index uses (first appearance by block, then log index). The output
//  `members.json` feeds `gen-v1-root.mjs`, which produces V1_MEMBER_ROOT + the
//  per-member Merkle proofs.
//
//  READ-ONLY. No private keys, no on-chain writes. Safe to run any time. This is
//  the "snapshot" half of the V2 handoff: pause V1 (≤ #333) first, then export.
//
//  Env (all optional; defaults target the live mainnet V1):
//    RPC_URL          Avalanche C-Chain RPC (default public api.avax.network)
//    V1_SALE_ADDRESS  V1 Membership Sale  (default = live)
//    V1_DEPLOY_BLOCK  first block to scan (default = live deployment block)
//    V1_TO_BLOCK      last block to scan  (default = current head; bound it for
//                     a quick dry-run instead of scanning the whole chain)
//    LOG_CHUNK        getLogs block window (default 2048 — public RPC range cap)
//
//  Usage:
//    npm install          # once (viem)
//    node export-members.mjs
//
//  Output:
//    members.json           ["0x…", …]  first-seen order  (gen-v1-root input)
//    members.snapshot.json  provenance { saleAddress, range, per-member firstSeen }
// =============================================================================
import { createPublicClient, http, parseAbiItem } from "viem";
import { avalanche } from "viem/chains";
import { writeFileSync } from "node:fs";

const RPC = process.env.RPC_URL || "https://api.avax.network/ext/bc/C/rpc";
const SALE = process.env.V1_SALE_ADDRESS || "0x0020Df30C127306f0F5B44E6a6E4368D2855842d";
const FROM = BigInt(process.env.V1_DEPLOY_BLOCK || "87157852");
const CHUNK = BigInt(process.env.LOG_CHUNK || "2048");

// MUST match the V1 sale's event exactly (see src/lib/sale-abi.ts SALE_ABI).
const EVENT = parseAbiItem(
  "event TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)"
);

const client = createPublicClient({ chain: avalanche, transport: http(RPC) });

const chainHead = await client.getBlockNumber();
const head = process.env.V1_TO_BLOCK ? BigInt(process.env.V1_TO_BLOCK) : chainHead;
console.error(`scanning V1 ${SALE} blocks ${FROM}..${head} (head ${chainHead}, chunk ${CHUNK})`);

const logs = [];
for (let start = FROM; start <= head; start += CHUNK) {
  const end = start + CHUNK - 1n > head ? head : start + CHUNK - 1n;
  let batch;
  try {
    batch = await client.getLogs({ address: SALE, event: EVENT, fromBlock: start, toBlock: end });
  } catch (e) {
    console.error(`  ! getLogs ${start}..${end} failed: ${e.shortMessage || e.message}`);
    process.exitCode = 1;
    continue;
  }
  for (const l of batch) logs.push(l);
  if (batch.length) console.error(`  ${start}..${end}: +${batch.length} (total ${logs.length})`);
}

// First-seen order: sort ascending by (blockNumber, logIndex), then dedupe by buyer.
logs.sort((a, b) =>
  a.blockNumber === b.blockNumber
    ? a.logIndex - b.logIndex
    : a.blockNumber < b.blockNumber
      ? -1
      : 1
);

const seen = new Set();
const members = [];
const provenance = [];
for (const l of logs) {
  const buyer = l.args.buyer;
  const key = buyer.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  members.push(buyer);
  provenance.push({
    address: buyer,
    firstBlock: Number(l.blockNumber),
    firstTxHash: l.transactionHash,
    firstLogIndex: l.logIndex,
  });
}

writeFileSync("members.json", JSON.stringify(members, null, 2));
writeFileSync(
  "members.snapshot.json",
  JSON.stringify(
    {
      saleAddress: SALE,
      chainId: avalanche.id,
      fromBlock: Number(FROM),
      toBlock: Number(head),
      scannedAt: new Date().toISOString(),
      count: members.length,
      members: provenance,
    },
    null,
    2
  )
);

console.error(`\nunique V1 members = ${members.length}`);
console.error("written = members.json, members.snapshot.json");
console.log(members.length);
