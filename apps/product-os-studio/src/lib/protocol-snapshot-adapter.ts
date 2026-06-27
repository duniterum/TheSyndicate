// THE SYNDICATE — PRODUCT OS STUDIO · PROTOCOL SNAPSHOT ADAPTER (REAL, READ-ONLY)
//
// A tiny, dependency-free JSON-RPC READ layer over the canonical PUBLIC Avalanche C-Chain RPC.
// It is PROVIDER-LESS — it never touches the user's wallet (that is wallet-adapter.ts) — and it
// is deliberately constrained to a hard allowlist of READ-ONLY JSON-RPC methods:
//
//   ALLOWED (the ONLY methods this file may ever send):
//     - eth_chainId      read the chain id
//     - eth_blockNumber  read the latest block height
//     - eth_call         read-only contract calls: balanceOf(address), decimals()
//
//   FORBIDDEN (intentionally impossible here — there is NO code path for any of these):
//     - eth_sendTransaction / eth_sendRawTransaction / eth_signTransaction
//     - eth_sign / personal_sign / signTypedData (any version)
//     - approve / buy / mint / burn / claim / source activation / founder exec
//     - wallet_switchEthereumChain / wallet_addEthereumChain / wallet_watchAsset
//     - eth_requestAccounts / eth_accounts (no accounts, no wallet — this layer is provider-less)
//
// Nothing here moves funds, signs, approves, or changes any network. Token decimals are read
// LIVE via decimals() and never hardcoded; if a read fails the dependent fact is dropped (and
// surfaced as an error / partial state) rather than inventing a value. The read-only guard
// (scripts/guard-read-only.mjs) statically asserts this file only ever sends the 3 allowed
// methods and stays provider-less.

import { AVALANCHE, SYN_TOKEN, USDC_TOKEN, getCanonicalContract } from "./production-constants";
import { formatUnits } from "./wallet-adapter";
import type { ReadState } from "./adapters";
import type {
  AdapterRequiredFact,
  ChainContextFact,
  ProtocolSnapshot,
  SnapshotGroup,
  SnapshotTokenSymbol,
  TokenBalanceFact,
} from "./protocol-snapshot-types";

// The ONLY JSON-RPC methods this layer may send. Enforced at the rpcCall boundary AND by the
// read-only guard script. Adding to this list is a deliberate, reviewable act.
const ALLOWED_RPC_METHODS = ["eth_chainId", "eth_blockNumber", "eth_call"] as const;
type AllowedRpcMethod = (typeof ALLOWED_RPC_METHODS)[number];

// Read-only ERC-20 function selectors (no ABI library).
const SELECTOR = {
  balanceOf: "0x70a08231", // balanceOf(address)
  decimals: "0x313ce567", // decimals()
} as const;

const RPC_TIMEOUT_MS = 10_000;

/** Resolve the public RPC URL. Optional, non-secret HTTPS override via VITE_AVALANCHE_RPC_URL. */
export function getRpcUrl(): string {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const override = env?.VITE_AVALANCHE_RPC_URL?.trim();
  if (override && override.toLowerCase().startsWith("https://")) return override;
  return AVALANCHE.publicRpcUrl;
}

export function rpcHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

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

interface JsonRpcResponse {
  result?: unknown;
  error?: { code?: number; message?: string };
}

/**
 * Send a single READ-ONLY JSON-RPC request. Throws if the method is not on the allowlist, on
 * transport/timeout failure, or on a JSON-RPC error. Never sends credentials.
 */
async function rpcCall(method: AllowedRpcMethod, params: unknown[]): Promise<string> {
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
    if (typeof json.result !== "string") throw new Error("Unexpected RPC result");
    return json.result;
  } finally {
    clearTimeout(timer);
  }
}

function tokenAddressFor(token: SnapshotTokenSymbol): string {
  return token === "SYN" ? SYN_TOKEN.address : USDC_TOKEN.address;
}

async function readChainId(): Promise<number> {
  return parseInt(await rpcCall("eth_chainId", []), 16);
}

async function readBlockNumber(): Promise<number> {
  return parseInt(await rpcCall("eth_blockNumber", []), 16);
}

/** Live, read-only decimals() — returns null if unreadable (never invents a value). */
async function readDecimals(token: string): Promise<number | null> {
  if (!isAddress(token)) return null;
  const res = await rpcCall("eth_call", [{ to: token, data: SELECTOR.decimals }, "latest"]);
  if (!res || res === "0x") return null;
  const n = parseInt(res, 16);
  return Number.isFinite(n) && n >= 0 && n <= 36 ? n : null;
}

/** Live, read-only balanceOf(holder) raw integer. */
async function readBalanceOf(token: string, holder: string): Promise<bigint> {
  if (!isAddress(token) || !isAddress(holder)) {
    throw new Error("Invalid token/holder address");
  }
  const data = SELECTOR.balanceOf + padAddress(holder);
  const res = await rpcCall("eth_call", [{ to: token, data }, "latest"]);
  return BigInt(res && res !== "0x" ? res : "0x0");
}

// The fixed set of READ-ONLY balance facts this snapshot exposes. Holder addresses come from
// CANONICAL_CONTRACTS (READ-ONLY PRODUCTION PROOF). Notes are deliberately precise so no number
// implies availability, valuation, price, yield, or entitlement.
interface BalanceSpec {
  key: string;
  label: string;
  group: SnapshotGroup;
  holderKey: string;
  token: SnapshotTokenSymbol;
  note: string;
}

const BALANCE_SPECS: BalanceSpec[] = [
  {
    key: "vault-usdc",
    label: "Vault wallet — USDC held",
    group: "routing",
    holderKey: "VaultWallet",
    token: "USDC",
    note: "USDC currently held by the Vault routing wallet (70% destination). A live on-chain balance — NOT the simulated \u201ctotal routed\u201d figure, and not a claim, yield, or entitlement.",
  },
  {
    key: "liquidity-usdc",
    label: "Liquidity wallet — USDC held",
    group: "routing",
    holderKey: "LiquidityWallet",
    token: "USDC",
    note: "USDC currently held by the Liquidity routing wallet (20% destination). Live on-chain balance only.",
  },
  {
    key: "operations-usdc",
    label: "Operations wallet — USDC held",
    group: "routing",
    holderKey: "OperationsWallet",
    token: "USDC",
    note: "USDC currently held by the Operations routing wallet (10% destination). Live on-chain balance only.",
  },
  {
    key: "sale-syn",
    label: "MembershipSaleV3 — SYN held",
    group: "sale",
    holderKey: "MembershipSaleV3",
    token: "SYN",
    note: "SYN currently held by the MembershipSaleV3 contract. A raw balanceOf read — NOT \u201cSYN available to buy\u201d, not a price, and not a promise.",
  },
  {
    key: "membership-syn",
    label: "Membership SYN wallet — SYN held",
    group: "membership",
    holderKey: "MembershipSynWallet",
    token: "SYN",
    note: "SYN currently held by the Membership SYN wallet. Live on-chain balance only.",
  },
  {
    key: "burn-syn",
    label: "Burn sink — SYN held",
    group: "burn",
    holderKey: "SynBurnAddress",
    token: "SYN",
    note: "SYN currently held at the canonical burn sink (0x\u2026dEaD). Burning retires supply — never minted, never a price promise. This live balance is the cumulative sink total; it is DISTINCT from the verified Proof of Fire #001 (a specific 1,000 SYN founder burn shown as READ-ONLY PRODUCTION PROOF).",
  },
  {
    key: "lp-syn",
    label: "Trader Joe LP pair — SYN held",
    group: "liquidity",
    holderKey: "TraderJoeLpPair",
    token: "SYN",
    note: "SYN tokens held by the SYN/USDC LP pair contract. A raw token balance — NOT a price, reserve valuation, APY, or promised return.",
  },
  {
    key: "lp-usdc",
    label: "Trader Joe LP pair — USDC held",
    group: "liquidity",
    holderKey: "TraderJoeLpPair",
    token: "USDC",
    note: "USDC tokens held by the SYN/USDC LP pair contract. A raw token balance — NOT a price, reserve valuation, APY, or promised return.",
  },
];

// Facts the Studio intentionally does NOT read live — they need a future production adapter.
const ADAPTER_REQUIRED_FACTS: AdapterRequiredFact[] = [
  {
    key: "member-count",
    label: "Member count / holder index",
    reason: "Requires scanning MembershipSaleV3 purchase logs (buildHolderIndex) — ADAPTER REQUIRED.",
  },
  {
    key: "era-epoch",
    label: "Era / epoch / pricing tier",
    reason: "Requires contract-specific reads beyond balanceOf/decimals — ADAPTER REQUIRED.",
  },
  {
    key: "paused-state",
    label: "Sale / source paused state",
    reason: "Requires a contract paused() read; source policy is known PAUSED but not live-read here — ADAPTER REQUIRED.",
  },
  {
    key: "burn-scan",
    label: "Proof of Fire burn-event scan",
    reason: "Requires a log scan of the burn sink (useSynBurnEvents) — ADAPTER REQUIRED. Execution is never wired.",
  },
];

function baseSnapshot(state: ReadState, chain: ChainContextFact | null, errors: string[]): ProtocolSnapshot {
  const url = getRpcUrl();
  return {
    state,
    chain,
    balances: [],
    adapterRequired: ADAPTER_REQUIRED_FACTS,
    errors,
    rpcUrl: url,
    rpcHost: rpcHost(url),
  };
}

/** Options that scope which live reads a snapshot performs. */
export interface SnapshotOptions {
  /**
   * Which balance groups to read live. `undefined` reads every group (full snapshot);
   * `[]` reads chain context only (NO decimals / balanceOf calls are issued at all).
   */
  groups?: SnapshotGroup[];
}

/**
 * Build a READ-ONLY protocol snapshot from the public RPC. NEVER throws — failures degrade to
 * partial/error states with collected error messages. Reads are SCOPED by `options.groups`, so a
 * chain-only or single-group view never issues unrelated token reads. Call only at runtime in the
 * browser (never at module top-level / build time).
 */
export async function buildProtocolSnapshot(options: SnapshotOptions = {}): Promise<ProtocolSnapshot> {
  const { groups } = options;
  const url = getRpcUrl();
  const errors: string[] = [];

  // 1) Chain context. chainId is required to call this a live snapshot at all.
  let chainId: number | null = null;
  try {
    chainId = await readChainId();
  } catch (err) {
    errors.push(`chainId: ${(err as Error)?.message ?? "failed"}`);
  }
  let blockNumber: number | null = null;
  try {
    blockNumber = await readBlockNumber();
  } catch (err) {
    errors.push(`blockNumber: ${(err as Error)?.message ?? "failed"}`);
  }

  const chain: ChainContextFact | null =
    chainId === null
      ? null
      : {
          chainId,
          chainIdHex: "0x" + chainId.toString(16),
          expectedChainId: AVALANCHE.chainId,
          isExpectedChain: chainId === AVALANCHE.chainId,
          name: AVALANCHE.name,
          blockNumber,
          rpcUrl: url,
          rpcHost: rpcHost(url),
        };

  // If we couldn't even read the chain id, the RPC is unreachable — return error (no values).
  if (chainId === null) {
    return baseSnapshot("error", chain, errors);
  }

  // Scope the token reads. `undefined` => full snapshot; `[]` (or a group with no specs) =>
  // chain-context only, which issues NO decimals/balanceOf calls.
  const selectedSpecs =
    groups === undefined ? BALANCE_SPECS : BALANCE_SPECS.filter((spec) => groups.includes(spec.group));

  // 2) Live decimals — only for the tokens the SELECTED specs actually need. If a token's
  // decimals can't be read, its balances are dropped (never formatted with a guessed value).
  const needSyn = selectedSpecs.some((spec) => spec.token === "SYN");
  const needUsdc = selectedSpecs.some((spec) => spec.token === "USDC");
  const [synDecimals, usdcDecimals] = await Promise.all([
    needSyn ? readDecimals(SYN_TOKEN.address).catch(() => null) : Promise.resolve<number | null>(null),
    needUsdc ? readDecimals(USDC_TOKEN.address).catch(() => null) : Promise.resolve<number | null>(null),
  ]);
  if (needSyn && synDecimals === null) errors.push("SYN decimals(): unreadable — SYN balances dropped.");
  if (needUsdc && usdcDecimals === null) errors.push("USDC decimals(): unreadable — USDC balances dropped.");
  const decimalsFor = (t: SnapshotTokenSymbol) => (t === "SYN" ? synDecimals : usdcDecimals);

  // 3) Balances (parallel) over the SELECTED specs only. Each spec resolves to a fact or null;
  // never throws out.
  const balanceResults = await Promise.all(
    selectedSpecs.map(async (spec): Promise<TokenBalanceFact | null> => {
      const holder = getCanonicalContract(spec.holderKey);
      const decimals = decimalsFor(spec.token);
      const tokenAddress = tokenAddressFor(spec.token);
      if (!holder || !isAddress(holder.address)) {
        errors.push(`${spec.key}: holder address unavailable.`);
        return null;
      }
      if (decimals === null) {
        // decimals error already recorded once above.
        return null;
      }
      try {
        const raw = await readBalanceOf(tokenAddress, holder.address);
        return {
          key: spec.key,
          label: spec.label,
          group: spec.group,
          holderKey: spec.holderKey,
          holderAddress: holder.address,
          holderExplorerUrl: holder.explorerUrl,
          token: spec.token,
          tokenAddress,
          decimals,
          raw: raw.toString(),
          formatted: formatUnits(raw, decimals),
          note: spec.note,
        };
      } catch (err) {
        errors.push(`${spec.key}: ${(err as Error)?.message ?? "balanceOf failed"}`);
        return null;
      }
    }),
  );
  const balances = balanceResults.filter((b): b is TokenBalanceFact => b !== null);

  // 4) Classify aggregate state against what was REQUESTED (not the full spec list). chainId
  // already succeeded above, so we always have at least live chain context — never "error" here.
  const state: ReadState =
    balances.length === selectedSpecs.length && blockNumber !== null && errors.length === 0
      ? "live"
      : "partial";

  return {
    state,
    asOf: new Date().toISOString(),
    chain,
    balances,
    adapterRequired: ADAPTER_REQUIRED_FACTS,
    errors,
    rpcUrl: url,
    rpcHost: rpcHost(url),
  };
}
