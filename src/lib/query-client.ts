import { QueryClient } from "@tanstack/react-query";
import { hashFn } from "wagmi/query";

/**
 * Shared QueryClient factory (P1).
 *
 * Performance-oriented defaults applied app-wide. Individual queries keep
 * their own overrides — the live chain scans set their own staleTime /
 * refetchInterval, tx-proof reads set staleTime: Infinity, etc. — because an
 * explicit per-query option always wins over these defaults.
 *
 *  • queryKeyHashFn: wagmi's hashFn — TanStack's DEFAULT key hash is
 *    JSON.stringify, which THROWS "Do not know how to serialize a BigInt" on
 *    wagmi keys that carry bigint args (e.g. balanceOf(account, BigInt(id)) in
 *    useArchiveBalances). Wagmi's own hooks pass this hashFn per-query, but app
 *    code that touches a wagmi key DIRECTLY — queryClient.getQueryState /
 *    setQueryData when seeding persisted reads (archive-balances, sale-hooks,
 *    PurchaseEventsHydrator) — fell back to the default hash and crashed the
 *    connected /my-syndicate render into the root CatchBoundary. Setting the
 *    SAME hashFn globally makes those direct ops (a) bigint-safe and (b) land on
 *    the exact entry wagmi uses, so seeding still works. It is a drop-in for the
 *    default: identical output for bigint-free keys (same sorted-object JSON),
 *    so nothing else re-hashes.
 *  • refetchOnWindowFocus: false — stop re-scanning chain history every time
 *    the tab regains focus (the focus-refetch "storm").
 *  • refetchOnReconnect: true    — but DO recover after the network drops.
 *  • retry: 2                    — bounded retries on transient RPC failures.
 *  • gcTime: 24h                 — keep results across navigation/reloads so a
 *    revisit hydrates from cache instead of starting from zero.
 *  • staleTime: 60s              — sensible default; per-query overrides win.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: hashFn,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 2,
        gcTime: 24 * 60 * 60 * 1000,
        staleTime: 60_000,
      },
    },
  });
}
