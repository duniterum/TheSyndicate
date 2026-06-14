#!/usr/bin/env node
// =============================================================================
//  V1_MEMBER_ROOT generator for SyndicateSaleV2
// =============================================================================
//  Reproduces EXACTLY the on-chain leaf hashing used by the sale:
//      leaf = keccak256(bytes.concat(keccak256(abi.encode(memberAddress))))
//  which is the canonical double-hashed leaf of OpenZeppelin's
//  StandardMerkleTree with leaf encoding ["address"], and is verified on-chain
//  by OpenZeppelin MerkleProof.verify (commutative, sorted-pair internal nodes).
//
//  Requires (install isolated from the main app, or use npx):
//      cd contracts/tools && npm init -y && npm i @openzeppelin/merkle-tree
//
//  Usage:
//      node gen-v1-root.mjs members.json   # ["0xabc…", "0xdef…"]
//      node gen-v1-root.mjs members.txt    # one address per line
//
//  Output:
//      stdout : V1_MEMBER_ROOT + member count
//      file   : v1-merkle.json { root, count, proofs, tree }
//  Each proofs[address] is what that member passes to
//  claimV1Membership(proof) or buy(..., v1Proof).
// =============================================================================
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { readFileSync, writeFileSync } from "node:fs";

const path = process.argv[2];
if (!path) {
  console.error("usage: node gen-v1-root.mjs <members.json|members.txt>");
  process.exit(1);
}

const raw = readFileSync(path, "utf8").trim();
let addrs = raw.startsWith("[") ? JSON.parse(raw) : raw.split(/\r?\n/);
addrs = addrs.map((a) => String(a).trim()).filter(Boolean);

// De-duplicate case-insensitively — a duplicate leaf would corrupt proofs.
const seen = new Set();
const values = [];
for (const a of addrs) {
  const key = a.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);
  values.push([a]);
}
if (values.length === 0) {
  console.error("error: no addresses found in", path);
  process.exit(1);
}

const tree = StandardMerkleTree.of(values, ["address"]);

const proofs = {};
for (const [i, v] of tree.entries()) {
  proofs[v[0]] = tree.getProof(i);
}

writeFileSync(
  "v1-merkle.json",
  JSON.stringify({ root: tree.root, count: values.length, proofs, tree: tree.dump() }, null, 2)
);

console.log("V1_MEMBER_ROOT =", tree.root);
console.log("members        =", values.length);
console.log("written        = v1-merkle.json");
