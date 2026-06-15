#!/usr/bin/env node
// =============================================================================
//  Snapshot validator (OFFLINE, deterministic, fail-closed)
// =============================================================================
//  Independently re-derives V1_MEMBER_ROOT from members.json and reconciles it
//  against the generated v1-merkle.json:
//    1. rebuilt root == artifact root (using the SAME dedupe the generator uses)
//    2. counts agree (members == artifact.count == #proofs)
//    3. EVERY per-member proof verifies against the root
//    4. (optional) root == an EXPECTED root — the value baked into / read back
//       from the deployed Sale V2 (argv[3] or EXPECTED_ROOT)
//  Any mismatch exits non-zero. This is the "don't trust, verify" gate before
//  publishing the proof artifact or trusting a deploy.
//
//  Usage:
//    node validate-snapshot.mjs [members.json] [v1-merkle.json] [expectedRoot]
// =============================================================================
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readFileSync } from "node:fs";

const membersPath = process.argv[2] || "members.json";
const merklePath = process.argv[3] || "v1-merkle.json";
const expectedRoot = process.argv[4] || process.env.EXPECTED_ROOT || null;

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

const membersRaw = readFileSync(membersPath, "utf8").trim();
let addrs = membersRaw.startsWith("[") ? JSON.parse(membersRaw) : membersRaw.split(/\r?\n/);
addrs = addrs.map((a) => String(a).trim()).filter(Boolean);

// Re-derive using the SAME case-insensitive dedupe rule as gen-v1-root.mjs.
const seen = new Set();
const values = [];
for (const a of addrs) {
  const k = a.toLowerCase();
  if (seen.has(k)) continue;
  seen.add(k);
  values.push([a]);
}
if (values.length === 0) fail("no addresses in " + membersPath);

const rebuilt = StandardMerkleTree.of(values, ["address"]);

const merkle = JSON.parse(readFileSync(merklePath, "utf8"));
if (!merkle.root) fail("artifact missing root");
if (rebuilt.root !== merkle.root)
  fail(`root mismatch: rebuilt ${rebuilt.root} != artifact ${merkle.root}`);

if (typeof merkle.count === "number" && merkle.count !== values.length)
  fail(`count mismatch: artifact ${merkle.count} != members ${values.length}`);

const proofs = merkle.proofs || {};
const proofCount = Object.keys(proofs).length;
if (proofCount !== values.length)
  fail(`proof count mismatch: ${proofCount} proofs for ${values.length} members`);

// Replay every proof against the root.
let verified = 0;
for (const [addr, proof] of Object.entries(proofs)) {
  if (!StandardMerkleTree.verify(merkle.root, ["address"], [addr], proof))
    fail(`proof does not verify for ${addr}`);
  verified++;
}

if (expectedRoot && expectedRoot.toLowerCase() !== merkle.root.toLowerCase())
  fail(`expected root ${expectedRoot} != artifact ${merkle.root}`);

console.log("OK");
console.log("members  =", values.length);
console.log("root     =", merkle.root);
console.log("verified =", verified, "proofs");
if (expectedRoot) console.log("matches expected on-chain root:", expectedRoot);
