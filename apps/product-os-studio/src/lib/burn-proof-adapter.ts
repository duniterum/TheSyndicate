// THE SYNDICATE — PRODUCT OS STUDIO · BURN PROOF (PROOF OF FIRE) ADAPTER (REAL, READ-ONLY)
//
// A tiny, dependency-free JSON-RPC READ layer over the canonical PUBLIC Avalanche C-Chain RPC.
// It is PROVIDER-LESS — it never touches the user's wallet (that is wallet-adapter.ts) — and it
// is deliberately constrained to a hard allowlist of READ-ONLY JSON-RPC methods:
//
//   ALLOWED (the ONLY methods this file may ever send):
//     - eth_chainId      read the chain id
//     - eth_blockNumber  read the latest block height
//     - eth_call         read-only contract calls: balanceOf(burnSink), decimals()
//     - eth_getLogs      read-only event scan: ERC-20 Transfer(SYN) → burn sink (bounded, chunked)
//
//   FORBIDDEN (intentionally impossible here — there is NO code path for any of these):
//     - eth_sendTransaction / eth_sendRawTransaction / eth_signTransaction
//     - eth_sign / personal_sign / signTypedData (any version)
//     - approve / buy / mint / burn / claim / source activation / founder exec
//     - wallet_switchEthereumChain / wallet_addEthereumChain / wallet_watchAsset
//     - eth_requestAccounts / eth_accounts (no accounts, no wallet — this layer is provider-less)
//
// TRUTH MODEL — completeness by reconciliation:
//   The AUTHORITATIVE cumulative burned total is the LIVE balanceOf(burn sink). A burn sink only
//   ever RECEIVES (no one holds its key; nothing leaves) so its balance equals every SYN ever
//   burned. We enumerate individual burns with a bounded, chunked eth_getLogs scan and check that
//   their values sum EXACTLY to that live balance. If they do, every burn is provably accounted for
//   (any unseen burn would push the balance above the sum) → "complete", even with an early exit.
//   If they don't, we say "partial" and defer to the authoritative balance. We NEVER fake
//   completeness. Token decimals are read LIVE via decimals(); the cumulative balance is pinned at
//   the head block for a consistent (TOCTOU-free) reconciliation. The read-only guard
//   (scripts/guard-read-only.mjs) statically asserts this file only sends the 4 allowed methods and
//   stays provider-less.

import { AVALANCHE, SYN_TOKEN, PROOF_OF_FIRE } from "./production-constants";
import { snowtraceTx, snowtraceAddress } from "./mock-data";
import { formatUnits } from "./wallet-adapter";
import { getRpcUrl, rpcHost } from "./protocol-snapshot-adapter";
import type { ReadState } from "./adapters";
import type {
  BurnEventFact,
  BurnProofReadModel,
  BurnScanCompleteness,
  BurnScanCoverage,
} from "./burn-proof-types";

// The ONLY JSON-RPC methods this layer may send. Enforced at the rpcSend boundary AND by the
// read-only guard script. Adding to this list is a deliberate, reviewable act.
const ALLOWED_RPC_METHODS = ["eth_chainId", "eth_blockNumber", "eth_call", "eth_getLogs"] as const;
type AllowedRpcMethod = (typeof ALLOWED_RPC_METHODS)[number];

// Read-only ERC-20 function selectors (no ABI library).
const SELECTOR = {
  balanceOf: "0x70a08231", // balanceOf(address)
  decimals: "0x313ce567", // decimals()
} as const;

// keccak256("Transfer(address,address,uint256)") — ERC-20 Transfer event topic0.
const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const RPC_TIMEOUT_MS = 12_000;
// The public Avalanche RPC hard-caps eth_getLogs at 2048 blocks/request; stay safely under it.
const CHUNK_SIZE = 2000;
const SCAN_CONCURRENCY = 8;
// Absolute upper bound on chunks per scan (keeps work bounded even if reconciliation never lands).
const DEFAULT_MAX_CHUNKS = 1200;

function isAllowedMethod(method: string): method is AllowedRpcMethod {
  return (ALLOWED_RPC_METHODS as readonly string[]).includes(method);
}

/** Is this a 20-byte, 0x-prefixed hex address? */
function isAddress(addr: string | undefined): addr is string {
  return typeof addr === "string" && /^0x[0-9a-fA-F]{40}$/.test(addr);
}

function padAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

function msg(err: unknown): string {
  return (err as Error)?.message ?? "failed";
}

function envVal(key: string): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.[key]?.trim();
}

/** Scan start block. Defaults to the first verified burn (PROOF_OF_FIRE_001); non-secret override. */
export function getScanStartBlock(): number {
  const raw = envVal("VITE_SYN_BURN_SCAN_START_BLOCK");
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return PROOF_OF_FIRE.block;
}

/** Hard cap on chunks per scan. Non-secret override via VITE_SYN_BURN_MAX_CHUNKS. */
export function getMaxChunks(): number {
  const raw = envVal("VITE_SYN_BURN_MAX_CHUNKS");
  if (raw) {
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return DEFAULT_MAX_CHUNKS;
}

interface JsonRpcResponse {
  result?: unknown;
  error?: { code?: number; message?: string };
}

/** Raw eth_getLogs log shape (only the fields we read). */
interface RawLog {
  topics?: unknown;
  data?: unknown;
  blockNumber?: unknown;
  transactionHash?: unknown;
  logIndex?: unknown;
}

/**
 * Send a single READ-ONLY JSON-RPC request. Throws if the method is not on the allowlist, on
 * transport/timeout failure, or on a JSON-RPC error. Never sends credentials. Returns the raw
 * `result` (string for reads, array for eth_getLogs) — callers validate the concrete shape.
 */
async function rpcSend(method: AllowedRpcMethod, params: unknown[]): Promise<unknown> {
  if (!isAllowedMethod(method)) {
    // Defense in depth — unreachable through the typed API.
    throw new Error(`Blocked non-allowlisted RPC method: ${method}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);
  try {
    const res = await fetch(getRpcUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      credentials: "omit",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = (await res.json()) as JsonRpcResponse;
    if (json.error) throw new Error(json.error.message ?? "RPC error");
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

/** Read whose result MUST be a hex string (eth_chainId / eth_blockNumber / eth_call). */
async function rpcStringCall(method: AllowedRpcMethod, params: unknown[]): Promise<string> {
  const result = await rpcSend(method, params);
  if (typeof result !== "string") throw new Error("Unexpected RPC result (expected string)");
  return result;
}

/** Read whose result MUST be an array of logs (eth_getLogs). Validates the array shape. */
async function rpcLogsCall(params: unknown[]): Promise<RawLog[]> {
  const result = await rpcSend("eth_getLogs", params);
  if (!Array.isArray(result)) throw new Error("Unexpected eth_getLogs result (expected array)");
  return result as RawLog[];
}

async function readChainId(): Promise<number> {
  return parseInt(await rpcStringCall("eth_chainId", []), 16);
}

async function readBlockNumber(): Promise<number> {
  return parseInt(await rpcStringCall("eth_blockNumber", []), 16);
}

/** Live, read-only decimals() — returns null if unreadable (never invents a value). */
async function readDecimals(token: string): Promise<number | null> {
  if (!isAddress(token)) return null;
  const res = await rpcStringCall("eth_call", [{ to: token, data: SELECTOR.decimals }, "latest"]);
  if (!res || res === "0x") return null;
  const n = parseInt(res, 16);
  return Number.isFinite(n) && n >= 0 && n <= 36 ? n : null;
}

/** Live, read-only balanceOf(holder) raw integer, pinned at a specific block tag. */
async function readBalanceOfAt(token: string, holder: string, blockTag: string): Promise<bigint> {
  if (!isAddress(token) || !isAddress(holder)) throw new Error("Invalid token/holder address");
  const data = SELECTOR.balanceOf + padAddress(holder);
  const res = await rpcStringCall("eth_call", [{ to: token, data }, blockTag]);
  return BigInt(res && res !== "0x" ? res : "0x0");
}

/** The Transfer "to" topic for the canonical burn sink (left-padded to 32 bytes). */
function burnTopic(): string {
  return "0x" + padAddress(PROOF_OF_FIRE.burnAddress);
}

interface DecodedBurn {
  blockNumber: number;
  logIndex: number;
  value: bigint;
  transactionHash: string;
  from: string;
}

/** Decode a raw Transfer→burn-sink log. Returns null on any malformed field (never guesses). */
function decodeBurnLog(log: RawLog): DecodedBurn | null {
  if (!log || !Array.isArray(log.topics) || log.topics.length < 3) return null;
  const [, fromTopic] = log.topics as string[];
  if (
    typeof fromTopic !== "string" ||
    typeof log.data !== "string" ||
    typeof log.blockNumber !== "string" ||
    typeof log.transactionHash !== "string" ||
    typeof log.logIndex !== "string"
  ) {
    return null;
  }
  let value: bigint;
  try {
    value = BigInt(log.data && log.data !== "0x" ? log.data : "0x0");
  } catch {
    return null;
  }
  const blockNumber = parseInt(log.blockNumber, 16);
  const logIndex = parseInt(log.logIndex, 16);
  if (!Number.isFinite(blockNumber) || !Number.isFinite(logIndex)) return null;
  return {
    blockNumber,
    logIndex,
    value,
    transactionHash: log.transactionHash,
    from: "0x" + fromTopic.slice(-40).toLowerCase(),
  };
}

export interface BuildBurnProofOptions {
  /** Run the heavy chunked event enumeration. Default true. When false, only the light, fast
   *  context read (chainId · head · decimals · pinned balanceOf) is performed. */
  enumerate?: boolean;
  /** Progress callback as scan chunks complete. */
  onProgress?: (scanned: number, planned: number) => void;
}

/**
 * Build the READ-ONLY Proof of Fire model from the public RPC. NEVER throws — failures degrade to
 * partial/error states with collected error messages. Call only at runtime in the browser.
 */
export async function buildBurnProof(options: BuildBurnProofOptions = {}): Promise<BurnProofReadModel> {
  const { enumerate = true, onProgress } = options;
  const url = getRpcUrl();
  const host = rpcHost(url);
  const errors: string[] = [];
  const burnAddress = PROOF_OF_FIRE.burnAddress;
  const tokenAddress = SYN_TOKEN.address;
  const burnAddressExplorerUrl = snowtraceAddress(burnAddress);
  const tokenExplorerUrl = snowtraceAddress(tokenAddress);

  // 1) Chain context. chainId is required to call this a live read at all.
  let chainId: number | null = null;
  try {
    chainId = await readChainId();
  } catch (err) {
    errors.push(`chainId: ${msg(err)}`);
  }
  let headBlock: number | null = null;
  try {
    headBlock = await readBlockNumber();
  } catch (err) {
    errors.push(`blockNumber: ${msg(err)}`);
  }

  const chainIdHex = chainId === null ? null : "0x" + chainId.toString(16);
  const isExpectedChain = chainId === AVALANCHE.chainId;

  // 2) Live decimals + authoritative cumulative burned (balanceOf of the sink, pinned at head).
  let decimals: number | null = null;
  let cumulative: bigint | null = null;
  if (chainId !== null) {
    try {
      decimals = await readDecimals(tokenAddress);
      if (decimals === null) errors.push("SYN decimals(): unreadable.");
    } catch (err) {
      errors.push(`SYN decimals(): ${msg(err)}`);
    }
    // Pin the authoritative cumulative to the SAME head block the scan will bound to — this is what
    // makes reconciliation TOCTOU-free. We deliberately do NOT fall back to "latest" on failure: a
    // later block could include a burn the scan never sees, which would both weaken the "pinned at
    // block N" claim and risk a misleading comparison. If the pinned read fails we fail honestly
    // (error state below) rather than silently read the balance at a different block.
    const blockTag = headBlock !== null ? "0x" + headBlock.toString(16) : "latest";
    try {
      cumulative = await readBalanceOfAt(tokenAddress, burnAddress, blockTag);
    } catch (err) {
      errors.push(`burn-sink balanceOf: ${msg(err)}`);
    }
  }

  const staticFields = {
    chainId,
    chainIdHex,
    expectedChainId: AVALANCHE.chainId,
    isExpectedChain,
    chainName: AVALANCHE.name,
    headBlock,
    decimals,
    burnAddress,
    burnAddressExplorerUrl,
    tokenAddress,
    tokenExplorerUrl,
    rpcUrl: url,
    rpcHost: host,
  };

  // Without chain id, live decimals, AND the authoritative cumulative balance we have no honest
  // value to show — return an error model (no invented numbers).
  if (chainId === null || decimals === null || cumulative === null) {
    return {
      ...staticFields,
      state: "error",
      cumulativeRaw: cumulative === null ? null : cumulative.toString(),
      cumulativeFormatted:
        cumulative !== null && decimals !== null ? formatUnits(cumulative, decimals) : null,
      events: [],
      eventsSumRaw: "0",
      eventsSumFormatted: "0",
      completeness: "not-scanned",
      reconciled: false,
      coverage: null,
      errors,
    };
  }

  const cumulativeRaw = cumulative.toString();
  const cumulativeFormatted = formatUnits(cumulative, decimals);

  // Context-only (light) read — authoritative cumulative is live; events not enumerated yet.
  if (!enumerate) {
    return {
      ...staticFields,
      state: "live",
      asOf: new Date().toISOString(),
      cumulativeRaw,
      cumulativeFormatted,
      events: [],
      eventsSumRaw: "0",
      eventsSumFormatted: "0",
      completeness: "not-scanned",
      reconciled: false,
      coverage: null,
      errors,
    };
  }

  // Enumeration needs a head block to bound the scan range.
  if (headBlock === null) {
    errors.push("block height unreadable — burn events not enumerated.");
    return {
      ...staticFields,
      state: "partial",
      asOf: new Date().toISOString(),
      cumulativeRaw,
      cumulativeFormatted,
      events: [],
      eventsSumRaw: "0",
      eventsSumFormatted: "0",
      completeness: "partial",
      reconciled: false,
      coverage: null,
      errors,
    };
  }

  // 3) Bounded, chunked eth_getLogs scan from the start block toward head, with early-exit once
  //    the enumerated sum reconciles to the authoritative live balance.
  const startBlock = getScanStartBlock();
  const maxChunks = getMaxChunks();
  const plan: Array<[number, number]> = [];
  for (let from = startBlock; from <= headBlock && plan.length < maxChunks; from += CHUNK_SIZE) {
    plan.push([from, Math.min(from + CHUNK_SIZE - 1, headBlock)]);
  }
  const topic = burnTopic();
  const decoded: DecodedBurn[] = [];
  let chunksScanned = 0;
  let chunksFailed = 0;
  let lastBlockScanned = startBlock > 0 ? startBlock - 1 : 0;
  let earlyExitReconciled = false;
  let sum = 0n;

  for (let i = 0; i < plan.length; i += SCAN_CONCURRENCY) {
    const batch = plan.slice(i, i + SCAN_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async ([from, to]) => {
        try {
          const logs = await rpcLogsCall([
            {
              address: tokenAddress,
              topics: [TRANSFER_TOPIC, null, topic],
              fromBlock: "0x" + from.toString(16),
              toBlock: "0x" + to.toString(16),
            },
          ]);
          return { ok: true as const, to, logs };
        } catch (err) {
          return { ok: false as const, to, error: msg(err) };
        }
      }),
    );
    for (const r of results) {
      chunksScanned++;
      if (!r.ok) {
        chunksFailed++;
        errors.push(`getLogs chunk ≤ block ${r.to}: ${r.error}`);
        continue;
      }
      for (const log of r.logs) {
        const d = decodeBurnLog(log);
        if (d) decoded.push(d);
      }
      if (r.to > lastBlockScanned) lastBlockScanned = r.to;
    }
    sum = decoded.reduce((acc, d) => acc + d.value, 0n);
    onProgress?.(chunksScanned, plan.length);
    // Reconciliation reached: every burned token is accounted for — no need to scan further.
    if (sum === cumulative) {
      earlyExitReconciled = i + SCAN_CONCURRENCY < plan.length;
      break;
    }
  }

  // 4) Deterministic ordering + Proof of Fire numbering.
  decoded.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);
  const events: BurnEventFact[] = decoded.map((d, idx) => {
    const proofNumber = idx + 1;
    return {
      proofNumber,
      proofLabel: `PROOF_OF_FIRE_${String(proofNumber).padStart(3, "0")}`,
      blockNumber: d.blockNumber,
      logIndex: d.logIndex,
      transactionHash: d.transactionHash,
      from: d.from,
      raw: d.value.toString(),
      formatted: formatUnits(d.value, decimals),
      txExplorerUrl: snowtraceTx(d.transactionHash),
      fromExplorerUrl: snowtraceAddress(d.from),
      isProofOfFire001: d.transactionHash.toLowerCase() === PROOF_OF_FIRE.txHash.toLowerCase(),
    };
  });
  const eventsSum = decoded.reduce((acc, d) => acc + d.value, 0n);

  // 5) Completeness BY RECONCILIATION against the authoritative live balance.
  let completeness: BurnScanCompleteness;
  if (eventsSum === cumulative) completeness = "complete";
  else if (eventsSum > cumulative) completeness = "anomaly";
  else completeness = "partial";
  const reconciled = completeness === "complete";

  const naturalChunks = Math.ceil((headBlock - startBlock + 1) / CHUNK_SIZE);
  const coverage: BurnScanCoverage = {
    fromBlock: startBlock,
    toBlock: lastBlockScanned,
    headBlock,
    chunkSize: CHUNK_SIZE,
    chunksPlanned: plan.length,
    chunksScanned,
    chunksFailed,
    reachedHead: lastBlockScanned >= headBlock,
    earlyExitReconciled,
    capHit: naturalChunks > maxChunks,
  };

  // Map completeness → aggregate read state HONESTLY (never collapse anomaly into partial):
  //   complete ⇒ "live"     (reconciled; the balance invariant holds even on early-exit / failed chunk)
  //   anomaly  ⇒ "anomaly"  (event-sum exceeds the authoritative balance — contradictory, needs review)
  //   partial  ⇒ "partial"  (honest incompleteness; the cumulative balance remains the authority)
  // anomaly is intentionally NOT "error": the live cumulative read DID succeed and is shown; only the
  // enumeration is inconsistent, so the panel keeps the LIVE READ cumulative and flags the anomaly.
  const state: ReadState =
    completeness === "complete" ? "live" : completeness === "anomaly" ? "anomaly" : "partial";

  return {
    ...staticFields,
    state,
    asOf: new Date().toISOString(),
    cumulativeRaw,
    cumulativeFormatted,
    events,
    eventsSumRaw: eventsSum.toString(),
    eventsSumFormatted: formatUnits(eventsSum, decimals),
    completeness,
    reconciled,
    coverage,
    errors,
  };
}
