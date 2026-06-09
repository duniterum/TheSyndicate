// Canonical persisted tx hashes for ANY Archive1155 mint flow.
//
// Background — Founder live-test audit (docs/CONTRACT_INTEGRATION_STATUS.md
// §"Founder live-test audit — approval + explorer repair, 2026-06-06"):
// after a page refresh wagmi forgets `useWriteContract().data`, so the
// progress tracker would reset and the explorer link would disappear even
// though the approval / mint was still in-flight on-chain.
//
// The proven fix (originally shipped for ID 1 / First Signal) persists the
// latest approve+mint hashes per (wallet, contract, tokenId) so the tracker
// and `useWaitForTransactionReceipt` can pick them back up. This module is
// now the canonical helper — every Archive1155 mint component (ID 1, ID 3,
// future IDs) MUST call `useMintHashPersistence` with its own tokenId.

import { useCallback, useEffect, useState } from "react";

type Persisted = { approve?: `0x${string}`; mint?: `0x${string}` };

const KEY_PREFIX = "syndicate.mint.archive1155";
// Back-compat: ID 1 was originally persisted under the old prefix.
const LEGACY_FIRST_SIGNAL_PREFIX = "syndicate.mint.first-signal";

const keyFor = (
  wallet: string | undefined,
  contract: string,
  tokenId: string | number,
) => `${KEY_PREFIX}:${contract.toLowerCase()}:${String(tokenId)}:${wallet?.toLowerCase() ?? "anon"}`;

const legacyKeyFor = (wallet: string | undefined, contract: string) =>
  `${LEGACY_FIRST_SIGNAL_PREFIX}:${contract.toLowerCase()}:${wallet?.toLowerCase() ?? "anon"}`;

function readStorage(key: string, legacyKey?: string): Persisted {
  if (typeof window === "undefined") return {};
  try {
    let raw = window.localStorage.getItem(key);
    // Transparent migration: if the new key is empty but the legacy
    // First Signal key has a value, adopt it under the new key and
    // remove the legacy entry. Only applies when legacyKey is provided
    // (i.e. tokenId 1).
    if (!raw && legacyKey) {
      const legacyRaw = window.localStorage.getItem(legacyKey);
      if (legacyRaw) {
        window.localStorage.setItem(key, legacyRaw);
        window.localStorage.removeItem(legacyKey);
        raw = legacyRaw;
      }
    }
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Persisted;
    return {
      approve: isHash(parsed.approve) ? parsed.approve : undefined,
      mint: isHash(parsed.mint) ? parsed.mint : undefined,
    };
  } catch {
    return {};
  }
}

const isHash = (v: unknown): v is `0x${string}` =>
  typeof v === "string" && /^0x[a-fA-F0-9]{64}$/.test(v);

export function useMintHashPersistence(
  wallet: string | undefined,
  contract: string,
  tokenId: string | number = 1,
) {
  const key = keyFor(wallet, contract, tokenId);
  const legacyKey = String(tokenId) === "1" ? legacyKeyFor(wallet, contract) : undefined;
  const [hashes, setHashes] = useState<Persisted>(() => readStorage(key, legacyKey));

  // Reload from storage when the key (wallet / tokenId) changes.
  useEffect(() => {
    setHashes(readStorage(key, legacyKey));
  }, [key, legacyKey]);

  const write = useCallback(
    (next: Persisted) => {
      if (typeof window === "undefined") return;
      try {
        if (!next.approve && !next.mint) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(next));
        }
      } catch {
        /* quota or disabled storage — ignore */
      }
      setHashes(next);
    },
    [key],
  );

  const setApprove = useCallback(
    (h: `0x${string}` | undefined) => {
      write({ ...hashes, approve: h });
    },
    [hashes, write],
  );
  const setMint = useCallback(
    (h: `0x${string}` | undefined) => {
      write({ ...hashes, mint: h });
    },
    [hashes, write],
  );
  const clear = useCallback(() => write({}), [write]);

  return { approve: hashes.approve, mint: hashes.mint, setApprove, setMint, clear };
}
