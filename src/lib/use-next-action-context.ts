// use-next-action-context — the canonical NextActionContext adapter (hook).
//
// The single React entry point that gathers existing protocol state and hands
// the pure selector its exact input. It is the source of truth for the six
// journey dimensions (visitor / identity-loading / connected-non-member /
// member / collector / higher-rank), but it OWNS no decision logic: the raw
// reads are normalized by `buildNextActionContext` and classified by
// `selectNextActions`. It renders nothing.
//
// Reuse, not reinvention:
//   • It reads through the cockpit wrappers (useCockpitAccount /
//     useCockpitHolderIndex / useCockpitArchiveBalances). In production those
//     are pure pass-throughs to the real hooks; in dev they add the `?cockpit=`
//     preview AND the SSR mounted-gate that connected surfaces rely on. Using
//     them keeps every migrated consumer's behavior byte-identical.
//
// No new chain reads:
//   • The archive (collector) read is OPT-IN. With `includeCollector` false
//     (the default) we pass an empty id list, which leaves useArchiveBalances
//     disabled (enabled = address && ids.length > 0) — so a consumer that does
//     not use the collector overlay performs NO additional on-chain read.

import {
  useCockpitAccount,
  useCockpitHolderIndex,
  useCockpitArchiveBalances,
} from "@/lib/dev/cockpit-fixtures";
import {
  buildNextActionContext,
  type NextActionContextInputs,
} from "@/lib/next-action-context";
import type { NextActionContext } from "@/lib/next-best-action";

/** Tracked Archive1155 ids: First Signal (1) + Patron Seal (3). */
const COLLECTOR_ARTIFACT_IDS = [1, 3] as const;

export interface UseNextActionContextOptions {
  /**
   * Source archive ownership for the collector overlay. Defaults to false:
   * the collector dimension requires an Archive1155 read that not every
   * consumer performs, so it must be opted into to avoid adding a chain read.
   */
  includeCollector?: boolean;
}

export function useNextActionContext(
  options: UseNextActionContextOptions = {},
): NextActionContext {
  const { includeCollector = false } = options;

  const { address, isConnected } = useCockpitAccount();
  const idx = useCockpitHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  // Empty id list ⇒ useArchiveBalances stays disabled ⇒ no chain read.
  const archive = useCockpitArchiveBalances(
    includeCollector ? COLLECTOR_ARTIFACT_IDS : [],
  );

  const inputs: NextActionContextInputs = {
    isConnected,
    identityLoading: idx.isLoading,
    record,
    ownsArtifacts: archive.totalKnown > 0n,
  };

  return buildNextActionContext(inputs);
}
