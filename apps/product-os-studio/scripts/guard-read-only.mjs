#!/usr/bin/env node
// THE SYNDICATE — PRODUCT OS STUDIO · READ-ONLY SAFETY GUARD
//
// A dependency-free static check (there is no test runner) that enforces the read-only posture
// of the Studio's on-chain layers. It does NOT replace `npm run typecheck` / `npm run build` —
// it is a focused safety net:
//
//   1) Each provider-less read-only on-chain adapter may ONLY ever send the JSON-RPC methods on
//      its own allowlist and must stay provider-less (no wallet):
//        - protocol-snapshot-adapter.ts: eth_chainId, eth_blockNumber, eth_call
//        - burn-proof-adapter.ts:        eth_chainId, eth_blockNumber, eth_call, eth_getLogs
//   2) NO file under src/ may send a forbidden write / sign / network-switch JSON-RPC method.
//
// It scans comment-stripped source (string literals are kept) so the documented "FORBIDDEN"
// method lists that live in code comments never cause a false positive. Exits non-zero on any
// violation. Run: `npm run guard:read-only`.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "src");

// Each read-only on-chain adapter declares the EXACT JSON-RPC methods it is permitted to send. The
// guard asserts each adapter sends only its allowlisted methods, uses every method it claims (so a
// refactor drift is caught), and stays provider-less. eth_getLogs lives ONLY in the burn adapter.
const ADAPTERS = [
  {
    file: join(SRC, "lib", "protocol-snapshot-adapter.ts"),
    allowlist: new Set(["eth_chainId", "eth_blockNumber", "eth_call"]),
  },
  {
    file: join(SRC, "lib", "burn-proof-adapter.ts"),
    allowlist: new Set(["eth_chainId", "eth_blockNumber", "eth_call", "eth_getLogs"]),
  },
];

// Write / sign / network-switch methods that must never be sent anywhere in src.
const FORBIDDEN = new Set([
  "eth_sendTransaction",
  "eth_sendRawTransaction",
  "eth_signTransaction",
  "eth_sign",
  "personal_sign",
  "eth_signTypedData",
  "eth_signTypedData_v1",
  "eth_signTypedData_v3",
  "eth_signTypedData_v4",
  "wallet_switchEthereumChain",
  "wallet_addEthereumChain",
  "wallet_revokePermissions",
]);

const METHOD_LITERAL = /["'`](eth_[A-Za-z0-9_]+|wallet_[A-Za-z0-9_]+|personal_[A-Za-z0-9_]+)["'`]/g;

// Remove // and /* */ comments while KEEPING string contents (so method literals survive).
// String modes also end at a newline as a defensive measure against an exotic regex literal
// desyncing the scan; this only ever risks a single-line miss, never a false positive.
function stripComments(src) {
  let out = "";
  let mode = "code"; // code | line | block | sq | dq | tpl
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const d = i + 1 < src.length ? src[i + 1] : "";
    if (mode === "code") {
      if (c === "/" && d === "/") { mode = "line"; i++; continue; }
      if (c === "/" && d === "*") { mode = "block"; i++; continue; }
      if (c === "'") { mode = "sq"; out += c; continue; }
      if (c === '"') { mode = "dq"; out += c; continue; }
      if (c === "`") { mode = "tpl"; out += c; continue; }
      out += c;
      continue;
    }
    if (mode === "line") {
      if (c === "\n") { mode = "code"; out += c; }
      continue;
    }
    if (mode === "block") {
      if (c === "*" && d === "/") { mode = "code"; i++; }
      continue;
    }
    // string modes
    if (c === "\\") { out += c + d; i++; continue; }
    out += c;
    if (mode === "sq" && (c === "'" || c === "\n")) mode = "code";
    else if (mode === "dq" && (c === '"' || c === "\n")) mode = "code";
    else if (mode === "tpl" && c === "`") mode = "code";
  }
  return out;
}

function listFiles(dir) {
  const result = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) result.push(...listFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) result.push(full);
  }
  return result;
}

function methodsIn(text) {
  const found = new Set();
  METHOD_LITERAL.lastIndex = 0;
  let m;
  while ((m = METHOD_LITERAL.exec(text)) !== null) found.add(m[1]);
  return found;
}

const violations = [];

// (2) Global forbidden-method scan.
for (const file of listFiles(SRC)) {
  const stripped = stripComments(readFileSync(file, "utf8"));
  for (const method of methodsIn(stripped)) {
    if (FORBIDDEN.has(method)) {
      violations.push(`FORBIDDEN method "${method}" used in ${relative(SRC, file)}`);
    }
  }
}

// (1) Per-adapter allowlist + provider-less checks.
for (const { file, allowlist } of ADAPTERS) {
  const name = relative(SRC, file);
  const stripped = stripComments(readFileSync(file, "utf8"));
  for (const method of methodsIn(stripped)) {
    if (!allowlist.has(method)) {
      violations.push(
        `${name} sends non-allowlisted method "${method}" (allowed: ${[...allowlist].join(", ")})`,
      );
    }
  }
  for (const allowed of allowlist) {
    if (!stripped.includes(allowed)) {
      violations.push(`${name} is expected to use "${allowed}" but it was not found (refactor drift?)`);
    }
  }
  if (/getInjectedProvider|window\.ethereum/.test(stripped)) {
    violations.push(`${name} must stay provider-less (found getInjectedProvider / window.ethereum)`);
  }
}

if (violations.length > 0) {
  console.error("\u2717 read-only guard FAILED:");
  for (const v of violations) console.error("  - " + v);
  process.exit(1);
}
console.log(
  "\u2713 read-only guard passed: the provider-less snapshot adapter sends only eth_chainId, eth_blockNumber, eth_call; the provider-less burn-proof adapter sends only eth_chainId, eth_blockNumber, eth_call, eth_getLogs; neither touches a wallet; and no write / sign / network-switch JSON-RPC method appears anywhere in src/. (Scope: this guards the read-only on-chain adapters' posture and forbids mutating methods — it does not police the separate, pre-existing user-initiated wallet read/import layer.)",
);
