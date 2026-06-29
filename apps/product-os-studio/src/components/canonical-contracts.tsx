// Canonical contracts list — renders CANONICAL_CONTRACTS (READ-ONLY PRODUCTION PROOF)
// THROUGH the existing ContractCopyRow. Every row is a static, canonical reference copied
// from the porting map: a copyable address + a read-only explorer link. Copying or
// following a row never wires a contract — a live read/write remains ADAPTER REQUIRED.

import { ContractCopyRow } from "@/components/contract-copy-row";
import {
  CANONICAL_CONTRACTS,
  type ContractCategory,
} from "@/lib/protocol-truth-registry";
import { BALANCE_HOLDER_KEYS } from "@/lib/protocol-snapshot-adapter";
import type { TokenBalanceFact } from "@/lib/protocol-snapshot-types";
import { cn } from "@/lib/utils";

export function CanonicalContractsList({
  categories,
  keys,
  className,
  liveBalances,
  loading,
}: {
  /** Restrict to one or more contract categories (in canonical order). */
  categories?: ContractCategory[];
  /** Restrict to explicit contract keys (in canonical order). */
  keys?: string[];
  className?: string;
  /** Flat list of live, read-only balances. Passing this (even empty) enables live mode: rows
   *  whose holder has a balance fact render an inline live-balance line. Omit to render none. */
  liveBalances?: TokenBalanceFact[];
  loading?: boolean;
}) {
  const items = CANONICAL_CONTRACTS.filter((c) => {
    if (keys && !keys.includes(c.key)) return false;
    if (categories && !categories.includes(c.category)) return false;
    return true;
  });

  if (items.length === 0) return null;

  const liveEnabled = liveBalances !== undefined;
  const byHolder: Record<string, TokenBalanceFact[]> = {};
  for (const b of liveBalances ?? []) {
    (byHolder[b.holderKey] ??= []).push(b);
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((c) => {
        const expectsBalance = liveEnabled && BALANCE_HOLDER_KEYS.includes(c.key);
        return (
          <ContractCopyRow
            key={c.key}
            layer={{
              name: c.label,
              status: c.status,
              address: c.address,
              explorerUrl: c.explorerUrl,
              proof: true,
              purpose: c.note,
            }}
            liveBalances={expectsBalance ? (byHolder[c.key] ?? []) : undefined}
            liveLoading={expectsBalance ? loading : false}
          />
        );
      })}
    </div>
  );
}
