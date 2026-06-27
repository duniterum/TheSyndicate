// THE SYNDICATE — PRODUCT OS STUDIO · CANONICAL EXTERNAL LINKS
//
// Every link here is derived ONLY from canonical PRODUCTION_PROOF constants and verified
// URL shapes. No URL is invented. If a canonical link shape is unknown for something, it is
// NOT added here — the surface keeps it visible as NOT WIRED / ADAPTER REQUIRED instead.
//
// Verified canonical shapes:
//   - Snowtrace (Avalanche C-Chain explorer): /address/<addr>, /tx/<hash>
//   - DexScreener pair page:  https://dexscreener.com/avalanche/<pairAddress>
//   - Trader Joe (LFJ) trade: https://lfj.gg/avalanche/trade?inputCurrency=<addr>&outputCurrency=<addr>
//     (traderjoexyz.com 303-redirects to lfj.gg; lfj.gg is canonical)
//
// All of these are EXTERNAL tools: open in a new tab, behind a warning, never a promised return.

import { PRODUCTION_PROOF, snowtraceAddress, snowtraceTx } from "./mock-data";

export const EXPLORER_NAME = "Snowtrace";

export function explorerAddress(address: string): string {
  return snowtraceAddress(address);
}

export function explorerTx(hash: string): string {
  return snowtraceTx(hash);
}

/** Canonical DexScreener pair page for the SYN/USDC pair (deterministic from the pair address). */
export function dexScreenerPair(pair: string = PRODUCTION_PROOF.traderJoeLpPair): string {
  return `https://dexscreener.com/avalanche/${pair}`;
}

/** Canonical Trader Joe (LFJ) trade route: spend USDC to receive SYN. */
export function traderJoeTradeUsdcToSyn(): string {
  return `https://lfj.gg/avalanche/trade?inputCurrency=${PRODUCTION_PROOF.usdc}&outputCurrency=${PRODUCTION_PROOF.syn}`;
}

export const EXTERNAL_LINKS = {
  synExplorer: snowtraceAddress(PRODUCTION_PROOF.syn),
  usdcExplorer: snowtraceAddress(PRODUCTION_PROOF.usdc),
  lpPairExplorer: snowtraceAddress(PRODUCTION_PROOF.traderJoeLpPair),
  lpPairChart: dexScreenerPair(),
  swapUsdcToSyn: traderJoeTradeUsdcToSyn(),
  burnAddressExplorer: snowtraceAddress(PRODUCTION_PROOF.synBurnAddress),
  proofOfFireTx: snowtraceTx(PRODUCTION_PROOF.proofOfFire001.txHash),
} as const;

export const EXTERNAL_LINK_WARNING =
  "You're leaving the Studio for a canonical third-party tool (opens in a new tab). Markets carry risk, slippage, and impermanent loss — nothing here is a promised return. Always re-verify the contract address from an official Syndicate channel before interacting.";
