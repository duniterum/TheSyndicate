// ─── Known Address Registry ────────────────────────────────────────────────
// ONE canonical label system for every protocol-recognized address. The
// Protocol Event Pipeline (and any surface that renders an event's from/to)
// resolves addresses through here so a wallet is named identically everywhere.
//
// Hard rule: NEVER re-hardcode an address here. Every entry REFERENCES the
// single source of truth in syndicate-config.ts (CONTRACTS / SYNDICATE_CONFIG /
// SYN_BURN_ADDRESS). If an address changes there, it changes here for free.
//
// This registry labels rows; it does not assert status or value.

import {
  CONTRACTS,
  SYNDICATE_CONFIG,
  SYN_BURN_ADDRESS,
} from "./syndicate-config";

/** Canonical role of a known address. `unknown` = not protocol-recognized. */
export type AddressRole =
  | "founder"
  | "vault"
  | "liquidity"
  | "operations"
  | "membership-sale"
  | "membership-syn-wallet"
  | "syn-token"
  | "usdc"
  | "archive"
  | "lp-pair"
  | "burn"
  | "unknown";

export type KnownAddress = {
  /** Lower-cased on lookup; stored as the canonical-cased source value. */
  address: string;
  role: AddressRole;
  /** Human label surfaced on event rows / the workbench. */
  label: string;
};

/**
 * The canonical table. Order is documentation order (contracts → wallets →
 * burn). Each `address` points at the single source of truth — do not inline
 * a literal address string.
 */
export const KNOWN_ADDRESSES: readonly KnownAddress[] = [
  { address: CONTRACTS.SYN_CONTRACT_ADDRESS,             role: "syn-token",              label: "SYN Token" },
  { address: CONTRACTS.USDC_CONTRACT_ADDRESS,            role: "usdc",                   label: "USDC" },
  { address: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS, role: "membership-sale",        label: "Membership Sale" },
  { address: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS,     role: "archive",                label: "Archive (SyndicateArchive1155)" },
  { address: CONTRACTS.LP_PAIR_ADDRESS,                  role: "lp-pair",                label: "Trader Joe SYN/USDC LP" },
  { address: SYNDICATE_CONFIG.FOUNDER_WALLET_ADDRESS,    role: "founder",                label: "Founder Wallet" },
  { address: CONTRACTS.VAULT_WALLET,                     role: "vault",                  label: "Vault Wallet" },
  { address: CONTRACTS.LIQUIDITY_WALLET,                 role: "liquidity",              label: "Liquidity Wallet" },
  { address: CONTRACTS.OPERATIONS_WALLET,                role: "operations",             label: "Operations Wallet" },
  { address: CONTRACTS.MEMBERSHIP_SYN_WALLET,            role: "membership-syn-wallet",  label: "Membership Distribution Wallet" },
  { address: SYN_BURN_ADDRESS,                           role: "burn",                   label: "Proof of Fire / Burn Address" },
] as const;

// Lower-cased lookup index, built once. A checksummed and an all-lowercase
// address resolve to the same entry.
const BY_ADDRESS: ReadonlyMap<string, KnownAddress> = new Map(
  KNOWN_ADDRESSES.map((e) => [e.address.toLowerCase(), e]),
);

/** Protocol wallets that hold value (excludes contracts, token, and burn). */
const PROTOCOL_WALLET_ROLES: ReadonlySet<AddressRole> = new Set<AddressRole>([
  "vault",
  "liquidity",
  "operations",
  "membership-syn-wallet",
]);

/**
 * Resolve any address to its canonical role + label. Unknown addresses return
 * a truncated `0x…` label and role "unknown" — never throws, never fabricates.
 */
export function labelForAddress(addr?: string | null): { role: AddressRole; label: string } {
  if (!addr) return { role: "unknown", label: "—" };
  const hit = BY_ADDRESS.get(addr.toLowerCase());
  if (hit) return { role: hit.role, label: hit.label };
  return { role: "unknown", label: `${addr.slice(0, 6)}…${addr.slice(-4)}` };
}

/** True only for the Founder allocation wallet. Drives Founder-vs-Community burn. */
export function isFounderWallet(addr?: string | null): boolean {
  return Boolean(addr) && labelForAddress(addr).role === "founder";
}

/** True for value-holding protocol wallets (vault / liquidity / operations / distribution). */
export function isProtocolWallet(addr?: string | null): boolean {
  return PROTOCOL_WALLET_ROLES.has(labelForAddress(addr).role);
}

/** True for the standard dead address (Proof of Fire / burn). */
export function isBurnAddress(addr?: string | null): boolean {
  return Boolean(addr) && labelForAddress(addr).role === "burn";
}
