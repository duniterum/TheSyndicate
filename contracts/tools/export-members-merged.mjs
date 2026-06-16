#!/usr/bin/env node
// =============================================================================
//  MERGED V1 ∪ V2a member snapshot exporter (READ-ONLY)  — for Sale V2b
// =============================================================================
//  Sale V2b REPLACES the live, unaudited V2a. To preserve EVERY current member
//  and never re-issue a seat, V2b's genesisOffset + member root MUST cover the
//  union of:
//    • V1  (SyndicateMembershipSale, sealed) — `TokensPurchased(buyer, ...)`
//    • V2a (SyndicateSaleV2, live)          — `Purchased(buyer, memberNumber,
//                                              era, ..., firstSeat)`
//
//  This is the SUPERSET of the V1-only `export-members.mjs` (which produced the
//  canonical V2a artifact and is preserved). It mirrors the EXACT master-identity
//  ordering the frontend Holder Index uses (src/lib/activity-hooks.ts
//  `useLivePurchaseEvents` + src/lib/holder-index.ts): combine both sources,
//  sort oldest-first by (blockNumber, logIndex), dedupe FIRST-SEEN by
//  case-insensitive buyer → member numbers 1..N. Because V2a's deploy block is
//  after V1's pause, every V1 first-appearance precedes every V2a one, so the
//  merged order is [V1 members…] then [V2a-new members…] — consistent with
//  V2a's on-chain GENESIS_OFFSET and memberCount.
//
//  READ-ONLY. No private keys, no on-chain writes. FAIL-CLOSED: any RPC chunk
//  failure, or any numbering inconsistency vs on-chain V2a truth, aborts WITHOUT
//  writing an artifact. "Don't trust, verify."
//
//  Output feeds the SOURCE-AGNOSTIC gen-v1-root.mjs / validate-snapshot.mjs:
//    members-merged.json           ["0x…", …]  first-seen order
//    members-merged.snapshot.json  full provenance + cross-checks
//
//  Env (all optional; defaults target live mainnet):
//    RPC_URLS         comma-separated Avalanche C-Chain RPCs (fallback order)
//    SNAPSHOT_BLOCK   pin the scan + the on-chain memberCount read to ONE block
//                     (default = current head). FINAL must pin the real V2a
//                     PAUSE block; a current-head run is a REHEARSAL snapshot.
//    V1_SALE_ADDRESS / V1_DEPLOY_BLOCK / V1_PAUSE_BLOCK
//    V2_SALE_ADDRESS / V2_DEPLOY_BLOCK
//    LOG_CHUNK (default 2000)   CONCURRENCY (default 4)
//
//  Usage:  node export-members-merged.mjs
// =============================================================================
import { createPublicClient, http, fallback, parseAbiItem, getAddress } from "viem";
import { avalanche } from "viem/chains";
import { writeFileSync } from "node:fs";

const RPCS = (
  process.env.RPC_URLS ||
  "https://api.avax.network/ext/bc/C/rpc,https://rpc.ankr.com/avalanche,https://avalanche-c-chain-rpc.publicnode.com"
).split(",").map((s) => s.trim()).filter(Boolean);

const V1 = process.env.V1_SALE_ADDRESS || "0x0020Df30C127306f0F5B44E6a6E4368D2855842d";
const V2 = process.env.V2_SALE_ADDRESS || "0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48";
const V1_FROM = BigInt(process.env.V1_DEPLOY_BLOCK || "87157852");
const V1_PAUSE = BigInt(process.env.V1_PAUSE_BLOCK || "88087947");
const V2_FROM = BigInt(process.env.V2_DEPLOY_BLOCK || "88095827");
const CHUNK = BigInt(process.env.LOG_CHUNK || "2000");
const CONCURRENCY = Math.max(1, Number(process.env.CONCURRENCY || "4"));

// MUST match the on-chain events exactly (see src/lib/sale-abi.ts / activity-hooks.ts).
const V1_EVENT = parseAbiItem(
  "event TokensPurchased(address indexed buyer, uint256 indexed purchaseId, uint256 usdcAmount, uint256 synAmount, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount)",
);
const V2_EVENT = parseAbiItem(
  "event Purchased(address indexed buyer, uint256 indexed memberNumber, uint16 indexed era, uint256 usdcIn, uint256 synOut, uint64 synPerUsdc, bool firstSeat)",
);
const MEMBER_COUNT_ABI = [
  { type: "function", name: "memberCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
];

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

const client = createPublicClient({
  chain: avalanche,
  transport: fallback(RPCS.map((u) => http(u, { retryCount: 3, retryDelay: 400, timeout: 20_000 }))),
});

const head = await client.getBlockNumber();
const SNAP = process.env.SNAPSHOT_BLOCK ? BigInt(process.env.SNAPSHOT_BLOCK) : head;
if (SNAP > head) fail(`SNAPSHOT_BLOCK ${SNAP} > current head ${head}`);
const IS_REHEARSAL = !process.env.SNAPSHOT_BLOCK || SNAP === head;

// Cap the V1 scan at its pause block (V1 is sealed; nothing after it). V2a scans
// through the pinned snapshot block.
const v1To = V1_PAUSE < SNAP ? V1_PAUSE : SNAP;
console.error(`snapshot block = ${SNAP}${IS_REHEARSAL ? "  (REHEARSAL: current head — FINAL must pin the V2a pause block)" : ""}`);
console.error(`V1 ${V1}  ${V1_FROM}..${v1To}`);
console.error(`V2a ${V2}  ${V2_FROM}..${SNAP}`);

// Bounded-concurrency chunked scan. FAIL-CLOSED: the first chunk that throws
// after RPC fallback+retries aborts the whole export (no partial artifact).
async function scanRange(address, event, from, to) {
  if (from > to) return [];
  const ranges = [];
  for (let s = from; s <= to; s += CHUNK) {
    const e = s + CHUNK - 1n > to ? to : s + CHUNK - 1n;
    ranges.push([s, e]);
  }
  const out = [];
  let idx = 0;
  let aborted = null;
  async function worker() {
    while (idx < ranges.length && !aborted) {
      const [s, e] = ranges[idx++];
      try {
        const logs = await client.getLogs({ address, event, fromBlock: s, toBlock: e });
        out.push(...logs);
      } catch (err) {
        aborted = `getLogs ${address} ${s}..${e}: ${err.shortMessage || err.message}`;
        throw new Error(aborted);
      }
    }
  }
  const workers = Array.from({ length: Math.min(CONCURRENCY, ranges.length) }, () => worker());
  try {
    await Promise.all(workers);
  } catch {
    fail(aborted || "scan failed");
  }
  return out;
}

const v1Logs = await scanRange(V1, V1_EVENT, V1_FROM, v1To);
const v2Logs = await scanRange(V2, V2_EVENT, V2_FROM, SNAP);
console.error(`scanned: V1 logs=${v1Logs.length}  V2a logs=${v2Logs.length}`);

// Normalize to a single comparable shape.
const events = [];
for (const l of v1Logs) {
  if (!l.args?.buyer) fail(`V1 log missing buyer @ ${l.transactionHash}`);
  events.push({ source: "v1", buyer: l.args.buyer, block: l.blockNumber, logIndex: l.logIndex, tx: l.transactionHash });
}
for (const l of v2Logs) {
  const a = l.args || {};
  if (!a.buyer || a.memberNumber === undefined || a.firstSeat === undefined)
    fail(`V2a Purchased log missing fields @ ${l.transactionHash}`);
  events.push({
    source: "v2",
    buyer: a.buyer,
    block: l.blockNumber,
    logIndex: l.logIndex,
    tx: l.transactionHash,
    memberNumber: a.memberNumber,
    firstSeat: a.firstSeat,
  });
}

// Oldest-first by (blockNumber, logIndex) — identical to mergePurchaseEvents' order.
events.sort((a, b) => (a.block === b.block ? a.logIndex - b.logIndex : a.block < b.block ? -1 : 1));

// First-seen dedupe → member numbers 1..N (the Holder Index founderNumber rule).
const firstSeenPos = new Map(); // key -> {block, logIndex, idx}
const numberByKey = new Map(); // key -> 1-indexed member number
const members = [];
const provenance = [];
for (let i = 0; i < events.length; i++) {
  const ev = events[i];
  let key;
  try { key = getAddress(ev.buyer).toLowerCase(); } catch { key = ev.buyer.toLowerCase(); }
  if (firstSeenPos.has(key)) continue;
  const num = members.length + 1;
  firstSeenPos.set(key, { block: ev.block, logIndex: ev.logIndex, idx: i });
  numberByKey.set(key, num);
  const checksum = getAddress(ev.buyer);
  members.push(checksum);
  provenance.push({
    memberNumber: num,
    address: checksum,
    source: ev.source,
    firstBlock: Number(ev.block),
    firstTxHash: ev.tx,
    firstLogIndex: ev.logIndex,
  });
}

if (members.length === 0) fail("no members found across V1 ∪ V2a");

// ── FAIL-LOUD cross-checks against on-chain V2a truth ──────────────────────
// 1. distinct merged count == V2a.memberCount read at the SAME pinned block.
let onchainMemberCount;
try {
  onchainMemberCount = await client.readContract({
    address: V2, abi: MEMBER_COUNT_ABI, functionName: "memberCount", blockNumber: SNAP,
  });
} catch (e) {
  fail(`could not read V2a memberCount @ block ${SNAP}: ${e.shortMessage || e.message}`);
}
if (BigInt(members.length) !== onchainMemberCount)
  fail(`distinct member count ${members.length} != on-chain V2a memberCount ${onchainMemberCount} @ block ${SNAP} — numbering divergence`);

// 2. V2a numbering consistency, event by event.
const cmp = (p, ev) => (p.block === ev.block ? p.logIndex - ev.logIndex : p.block < ev.block ? -1 : 1);
for (let i = 0; i < events.length; i++) {
  const ev = events[i];
  if (ev.source !== "v2") continue;
  let key;
  try { key = getAddress(ev.buyer).toLowerCase(); } catch { key = ev.buyer.toLowerCase(); }
  const fs = firstSeenPos.get(key);
  if (ev.firstSeat === true) {
    // A new seat: this event MUST be the buyer's first-ever appearance AND the
    // on-chain memberNumber MUST equal the derived first-seen number.
    if (fs.idx !== i)
      fail(`V2a firstSeat=true for ${ev.buyer} @ ${ev.tx} but buyer was already seen earlier — V2a re-seated an existing member (DUPLICATE SEAT)`);
    if (BigInt(numberByKey.get(key)) !== ev.memberNumber)
      fail(`V2a firstSeat=true memberNumber ${ev.memberNumber} != derived first-seen #${numberByKey.get(key)} for ${ev.buyer}`);
  } else {
    // Recognized / repeat buy: buyer MUST have a STRICTLY earlier first-seen.
    if (cmp(fs, ev) >= 0)
      fail(`V2a firstSeat=false for ${ev.buyer} @ ${ev.tx} but this is their first-ever appearance — unrecognized member numbering bug`);
  }
}

const genesisOffset = members.length;
const snapshot = {
  purpose: "V2b merged member snapshot (V1 ∪ V2a)",
  rehearsal: IS_REHEARSAL,
  chainId: avalanche.id,
  snapshotBlock: Number(SNAP),
  v1: { address: V1, fromBlock: Number(V1_FROM), toBlock: Number(v1To), event: "TokensPurchased" },
  v2a: { address: V2, fromBlock: Number(V2_FROM), toBlock: Number(SNAP), event: "Purchased" },
  scannedAt: new Date().toISOString(),
  count: members.length,
  genesisOffset,
  onchainV2aMemberCount: Number(onchainMemberCount),
  crossChecks: {
    countMatchesOnchainMemberCount: true,
    v2aFirstSeatNumberingConsistent: true,
    everyFirstSeatFalseHasEarlierFirstSeen: true,
  },
  members: provenance,
};

writeFileSync("members-merged.json", JSON.stringify(members, null, 2));
writeFileSync("members-merged.snapshot.json", JSON.stringify(snapshot, null, 2));

console.error(`\nOK — distinct members (V1 ∪ V2a) = ${members.length}  (matches on-chain V2a memberCount ${onchainMemberCount})`);
console.error("genesisOffset =", genesisOffset);
console.error("written = members-merged.json, members-merged.snapshot.json");
console.error("next: node gen-v1-root.mjs members-merged.json   then   node validate-snapshot.mjs members-merged.json v1-merkle.json");
console.log(genesisOffset);
// viem's HTTP keep-alive sockets can hold the event loop open; exit explicitly.
process.exit(0);
