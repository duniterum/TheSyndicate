#!/usr/bin/env node
// check-archive-abi.mjs
//
// AAA build-time guard: compares the frontend ABI in
// src/lib/archive-nft-abi.ts against the deployed contract's verified ABI
// on Sourcify for SyndicateArchive1155 on Avalanche C-Chain (43114).
//
// Behavior:
//   - Fetches Sourcify metadata for the address; tries full_match then
//     partial_match.
//   - Parses both ABIs and compares the canonical function signatures
//     (name + arg types + state mutability + output types) for the set of
//     functions the frontend depends on:
//       getArtifactCore, remainingSupply, isMintable, mint, uri,
//       balanceOf, walletRemaining
//   - Exits 0 on match, 1 on any mismatch — fails CI when ABI drifts.
//
// Network failure (Sourcify unreachable) exits 2 with a warning, not a
// hard fail, so transient outages don't block deploys.

import fs from "node:fs/promises";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ADDRESS = "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d";
const CHAIN_ID = 43114;
const REQUIRED_FNS = [
  "getArtifactCore",
  "remainingSupply",
  "isMintable",
  "mint",
  "uri",
  "balanceOf",
  "walletRemaining",
];

const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function fail(msg) {
  console.error(`${RED}✗ ABI compat check FAILED${RESET}`);
  console.error(msg);
  process.exit(1);
}
function warnExit(msg) {
  console.warn(`${YELLOW}⚠ ABI compat check SKIPPED${RESET}`);
  console.warn(msg);
  process.exit(2);
}

function sig(fn) {
  const inputs = (fn.inputs ?? []).map((i) => i.type).join(",");
  const outputs = (fn.outputs ?? []).map((o) => o.type).join(",");
  return `${fn.name}(${inputs}) ${fn.stateMutability ?? "nonpayable"} -> (${outputs})`;
}

async function fetchSourcifyAbi() {
  const bases = [
    `https://repo.sourcify.dev/contracts/full_match/${CHAIN_ID}/${ADDRESS}/metadata.json`,
    `https://repo.sourcify.dev/contracts/partial_match/${CHAIN_ID}/${ADDRESS}/metadata.json`,
  ];
  let lastErr = "";
  for (const u of bases) {
    try {
      const res = await fetch(u, { headers: { accept: "application/json" } });
      if (!res.ok) {
        lastErr = `${u} → HTTP ${res.status}`;
        continue;
      }
      const meta = await res.json();
      const abi = meta?.output?.abi;
      if (!Array.isArray(abi)) {
        lastErr = `${u} → no abi in metadata`;
        continue;
      }
      console.log(`${GREEN}✓${RESET} Loaded Sourcify ABI from ${u}`);
      return abi;
    } catch (e) {
      lastErr = `${u} → ${e?.message ?? e}`;
    }
  }
  warnExit(`Could not fetch Sourcify metadata. Last error: ${lastErr}`);
}

async function loadFrontendAbi() {
  const file = path.join(ROOT, "src/lib/archive-nft-abi.ts");
  const src = await fs.readFile(file, "utf8");
  // Extract the array literal after `export const ARCHIVE_NFT_ABI = `.
  const match = src.match(/export const ARCHIVE_NFT_ABI\s*=\s*(\[[\s\S]*?\])\s*as const;/);
  if (!match) fail(`Could not locate ARCHIVE_NFT_ABI in ${file}`);
  // Strip TS-only bits: `as const`, trailing commas already valid in JSON5-ish.
  // The literal uses double-quoted strings already; eval via Function in a
  // sandboxed scope.
  let lit = match[1];
  try {
    // eslint-disable-next-line no-new-func
    const arr = new Function(`return (${lit});`)();
    if (!Array.isArray(arr)) throw new Error("not an array");
    return arr;
  } catch (e) {
    fail(`Failed to parse frontend ABI literal: ${e?.message ?? e}`);
  }
}

function indexByName(abi) {
  const m = new Map();
  for (const fn of abi) {
    if (fn?.type !== "function" || !fn.name) continue;
    if (!m.has(fn.name)) m.set(fn.name, []);
    m.get(fn.name).push(fn);
  }
  return m;
}

function findSignatureMatch(frontFn, deployedCandidates) {
  const want = sig(frontFn);
  // Allow output-name drift (deployed often has anonymous outputs); only
  // compare types + name + state mutability + input arity.
  return deployedCandidates.find((d) => sig(d) === want);
}

async function main() {
  const [deployedAbi, frontendAbi] = await Promise.all([
    fetchSourcifyAbi(),
    loadFrontendAbi(),
  ]);

  const deployedByName = indexByName(deployedAbi);
  const frontendByName = indexByName(frontendAbi);

  const mismatches = [];
  for (const name of REQUIRED_FNS) {
    const front = frontendByName.get(name) ?? [];
    const deployed = deployedByName.get(name) ?? [];
    if (front.length === 0) {
      mismatches.push(`MISSING in frontend ABI: ${name}`);
      continue;
    }
    if (deployed.length === 0) {
      mismatches.push(`MISSING in deployed ABI:  ${name} (front: ${sig(front[0])})`);
      continue;
    }
    for (const f of front) {
      const m = findSignatureMatch(f, deployed);
      if (!m) {
        mismatches.push(
          `SIGNATURE MISMATCH for ${name}\n  frontend: ${sig(f)}\n  deployed: ${deployed.map(sig).join(" | ")}`,
        );
      }
    }
  }

  if (mismatches.length > 0) {
    fail(`${mismatches.length} mismatch(es):\n - ${mismatches.join("\n - ")}`);
  }

  console.log(`${GREEN}✓ ABI compat check PASSED${RESET} (${REQUIRED_FNS.length} functions verified against Sourcify)`);
}

main().catch((e) => fail(e?.stack ?? e?.message ?? String(e)));
