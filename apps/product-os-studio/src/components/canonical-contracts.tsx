// Canonical contracts list — renders CANONICAL_CONTRACTS (READ-ONLY PRODUCTION PROOF)
// THROUGH the existing ContractCopyRow. Every row is a static, canonical reference copied
// from the porting map: a copyable address + a read-only explorer link. Copying or
// following a row never wires a contract — a live read/write remains ADAPTER REQUIRED.

import { ContractCopyRow } from "@/components/contract-copy-row";
import {
  CANONICAL_CONTRACTS,
  type ContractCategory,
} from "@/lib/production-constants";
import { cn } from "@/lib/utils";

export function CanonicalContractsList({
  categories,
  keys,
  className,
}: {
  /** Restrict to one or more contract categories (in canonical order). */
  categories?: ContractCategory[];
  /** Restrict to explicit contract keys (in canonical order). */
  keys?: string[];
  className?: string;
}) {
  const items = CANONICAL_CONTRACTS.filter((c) => {
    if (keys && !keys.includes(c.key)) return false;
    if (categories && !categories.includes(c.category)) return false;
    return true;
  });

  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((c) => (
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
        />
      ))}
    </div>
  );
}
