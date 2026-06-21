#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { concat, encodeAbiParameters, getAddress, keccak256 } from "viem";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_INPUT = resolve(__dirname, "input/v3-historical-members.freeze-88496414.json");
const DEFAULT_OUTPUT = resolve(__dirname, "output/v3-historical-members-root.freeze-88496414.json");
const OLD_DOCUMENTED_ROOT = "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329";

function argValue(name, fallback) {
  const eq = process.argv.find((a) => a.startsWith(`${name}=`));
  if (eq) return eq.slice(name.length + 1);
  const idx = process.argv.indexOf(name);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function asHex32(value, label) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) fail(`${label} is not bytes32: ${value}`);
  return value.toLowerCase();
}

function compareHex(a, b) {
  const aa = BigInt(a);
  const bb = BigInt(b);
  return aa < bb ? -1 : aa > bb ? 1 : 0;
}

function hashPair(a, b) {
  const [left, right] = compareHex(a, b) <= 0 ? [a, b] : [b, a];
  return keccak256(concat([left, right])).toLowerCase();
}

function leafFor(wallet, memberNumber) {
  const inner = keccak256(
    encodeAbiParameters(
      [{ type: "address" }, { type: "uint256" }],
      [wallet, BigInt(memberNumber)],
    ),
  );
  return keccak256(concat([inner])).toLowerCase();
}

function buildTree(leaves) {
  if (leaves.length === 0) fail("cannot build a tree with no leaves");
  const levels = [leaves.map((leaf) => leaf.toLowerCase())];
  while (levels.at(-1).length > 1) {
    const current = levels.at(-1);
    const next = [];
    for (let i = 0; i < current.length; i += 2) {
      if (i + 1 === current.length) next.push(current[i]);
      else next.push(hashPair(current[i], current[i + 1]));
    }
    levels.push(next);
  }
  return levels;
}

function proofFor(levels, index) {
  const proof = [];
  let idx = index;
  for (let level = 0; level < levels.length - 1; level += 1) {
    const layer = levels[level];
    const pairIndex = idx % 2 === 0 ? idx + 1 : idx - 1;
    if (pairIndex < layer.length) proof.push(layer[pairIndex]);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

function verifyProof(leaf, proof, root) {
  let computed = leaf.toLowerCase();
  for (const sibling of proof) computed = hashPair(computed, asHex32(sibling, "proof sibling"));
  return computed === root.toLowerCase();
}

const inputPath = resolve(argValue("--input", DEFAULT_INPUT));
const outputPath = resolve(argValue("--output", DEFAULT_OUTPUT));
const displayInputPath = relative(process.cwd(), inputPath).replaceAll("\\", "/");
const displayOutputPath = relative(process.cwd(), outputPath).replaceAll("\\", "/");
const expectedCountArg = argValue("--expected-count", undefined);
const inputBytes = readFileSync(inputPath);
const inputText = inputBytes.toString("utf8").replace(/^\uFEFF/, "");
const inputHash = `sha256:${createHash("sha256").update(inputBytes).digest("hex")}`;
const input = JSON.parse(inputText);

if (!Number.isSafeInteger(input.freezeBlock) || input.freezeBlock <= 0) fail("freezeBlock must be a positive integer");
if (!Array.isArray(input.members) || input.members.length === 0) fail("members must be a non-empty array");
if (expectedCountArg && input.members.length !== Number(expectedCountArg)) fail(`member count ${input.members.length} != expected ${expectedCountArg}`);
if (input.readinessScan?.distinctFirstSeenWallets && input.members.length !== input.readinessScan.distinctFirstSeenWallets) {
  fail(`member count ${input.members.length} != readiness distinct count ${input.readinessScan.distinctFirstSeenWallets}`);
}

const sorted = [...input.members].sort((a, b) => {
  if (a.firstBlock !== b.firstBlock) return a.firstBlock - b.firstBlock;
  if (a.logIndex !== b.logIndex) return a.logIndex - b.logIndex;
  return String(a.firstTransaction).localeCompare(String(b.firstTransaction));
});

const seenWallets = new Set();
const seenNumbers = new Set();
const members = sorted.map((m, idx) => {
  if (!Number.isInteger(m.memberNumber) || m.memberNumber <= 0) fail(`invalid memberNumber for ${m.wallet}`);
  if (m.memberNumber !== idx + 1) fail(`memberNumber ${m.memberNumber} is not first-seen sequence ${idx + 1}`);
  const wallet = getAddress(m.wallet);
  const key = wallet.toLowerCase();
  if (seenWallets.has(key)) fail(`duplicate wallet after dedupe: ${wallet}`);
  if (seenNumbers.has(m.memberNumber)) fail(`duplicate member number: ${m.memberNumber}`);
  seenWallets.add(key);
  seenNumbers.add(m.memberNumber);
  if (!Number.isSafeInteger(m.firstBlock) || m.firstBlock <= 0) fail(`invalid firstBlock for ${wallet}`);
  if (!Number.isSafeInteger(m.logIndex) || m.logIndex < 0) fail(`invalid logIndex for ${wallet}`);
  if (!/^0x[0-9a-fA-F]{64}$/.test(m.firstTransaction)) fail(`invalid firstTransaction for ${wallet}`);
  const leaf = leafFor(wallet, m.memberNumber);
  return { ...m, wallet, leaf };
});

const leaves = members.map((m) => m.leaf);
const levels = buildTree(leaves);
const root = levels.at(-1)[0];

const membersWithProofs = members.map((m, index) => {
  const proof = proofFor(levels, index);
  if (!verifyProof(m.leaf, proof, root)) fail(`generated proof does not verify for member #${m.memberNumber}`);
  return { ...m, proof };
});

const verification = {
  allProofsVerify: membersWithProofs.every((m) => verifyProof(m.leaf, m.proof, root)),
  wrongWalletFails: !verifyProof(leafFor("0x000000000000000000000000000000000000dEaD", 1), membersWithProofs[0].proof, root),
  wrongMemberNumberFails: !verifyProof(leafFor(membersWithProofs[0].wallet, 2), membersWithProofs[0].proof, root),
  memberNumberZeroRejectedByGenerator: true,
  duplicateWalletRejectedByGenerator: true,
  duplicateMemberNumberRejectedByGenerator: true,
  rootMismatchFails: !verifyProof(membersWithProofs[0].leaf, membersWithProofs[0].proof, "0x" + "00".repeat(32)),
};
if (!Object.values(verification).every(Boolean)) fail("verification summary contains a failed invariant");

const output = {
  schema: "syndicate.v3.historical-members.root.v1",
  generatedAt: new Date().toISOString(),
  exactCommandUsed: `node contracts/script/generate-v3-historical-members-root.mjs --input ${displayInputPath} --output ${displayOutputPath} --expected-count ${members.length}`,
  inputPath: displayInputPath,
  outputPath: displayOutputPath,
  inputHash,
  freezeBlock: input.freezeBlock,
  chainId: input.chainId,
  memberCount: members.length,
  root,
  previousDocumentedRoot: OLD_DOCUMENTED_ROOT,
  rootMatchesPreviousDocumentedRoot: root.toLowerCase() === OLD_DOCUMENTED_ROOT.toLowerCase(),
  leafFormat: "keccak256(bytes.concat(keccak256(abi.encode(wallet, memberNumber))))",
  treeAlgorithm: "First-seen ordered leaves; adjacent pair hashing with sorted bytes32 pairs at each level; odd leaf promoted; proofs verify with OpenZeppelin MerkleProof.verify.",
  sourceOrder: input.orderingRule,
  verification,
  members: membersWithProofs,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`root=${root}`);
console.log(`inputHash=${inputHash}`);
console.log(`memberCount=${members.length}`);
console.log(`output=${outputPath}`);
if (!output.rootMatchesPreviousDocumentedRoot) {
  console.log(`note=generated root differs from previous documented root ${OLD_DOCUMENTED_ROOT}; committed artifact root is authoritative for this tree algorithm.`);
}


