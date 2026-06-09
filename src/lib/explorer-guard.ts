// Runtime guard for explorer URLs.
//
// Explorer links and "Verify on Avalanche Explorer" CTAs must only render
// when a valid URL is configured. If config is missing, broken, or points
// at a PENDING placeholder, callers should hide the link and (optionally)
// surface an honest "Explorer link pending" hint — never a dead link.
//
// See docs/CONTRACT_INTEGRATION_STATUS.md.

import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
  isTxHash,
  txExplorerUrl,
} from "./syndicate-config";

const PLACEHOLDER_TOKENS = ["pending", "tbd", "todo", "null", "undefined"];

/** True iff `url` is a non-empty https?:// URL that does not contain a
 *  placeholder address. Safe to call with any value. */
export function isValidExplorerUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (!/^https?:\/\//i.test(trimmed)) return false;
  const lower = trimmed.toLowerCase();
  if (PLACEHOLDER_TOKENS.some((t) => lower.includes(`/${t}`) || lower.endsWith(`/${t}`))) {
    return false;
  }
  // Reject when an obvious placeholder token sits in place of an address.
  try {
    const u = new URL(trimmed);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.some((p) => PLACEHOLDER_TOKENS.includes(p.toLowerCase()))) {
      return false;
    }
  } catch {
    return false;
  }
  return true;
}

/** True iff the deployed Archive contract address looks real (not a
 *  PENDING placeholder). */
export function hasArchiveContractAddress(): boolean {
  const a = ARCHIVE_NFT_CONTRACT_ADDRESS;
  return /^0x[a-fA-F0-9]{40}$/.test(a);
}

/** Primary "Verify on Avalanche Explorer" target, or null when no valid
 *  explorer URL is configured for the deployed Archive contract. */
export function archiveVerifyUrl(): string | null {
  if (!hasArchiveContractAddress()) return null;
  const url = ARCHIVE_NFT_EXPLORERS.avascan;
  return isValidExplorerUrl(url) ? url : null;
}

/** Primary transaction target. Returns null instead of emitting a broken link. */
export function archiveTxUrl(hash: string | undefined | null): string | null {
  if (!isTxHash(hash)) return null;
  const url = txExplorerUrl(hash);
  return isValidExplorerUrl(url) ? url : null;
}
