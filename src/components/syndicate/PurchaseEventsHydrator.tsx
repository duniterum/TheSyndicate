import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import { CONTRACTS, SALE_DEPLOYMENT_BLOCK } from "@/lib/syndicate-config";
import {
  loadPurchaseEventsSnapshot,
  purchaseEventsCacheKey,
} from "@/lib/purchase-events-cache";

const SALE = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;

/**
 * P1 — instant holder-index hydration.
 *
 * On the client only (this runs in an effect, post-hydration, so there is no
 * SSR mismatch — the server has no localStorage and renders the loading state,
 * and we seed the cache afterwards) this restores the last-known canonical
 * `live-purchases` snapshot into TanStack Query.
 *
 * The seeded data is tagged with its TRUE age (`updatedAt`) so the query is
 * treated as STALE → a background refresh fires immediately, and the snapshot
 * is never presented as freshly-LIVE (the LIVE / lag signals are derived from
 * event-block age vs the chain tip, not from cache time).
 *
 * Renders nothing and does nothing on the server.
 */
export function PurchaseEventsHydrator() {
  const queryClient = useQueryClient();
  const chainId = useChainId();

  useEffect(() => {
    const fromBlock = SALE_DEPLOYMENT_BLOCK;
    const snapshot = loadPurchaseEventsSnapshot(
      purchaseEventsCacheKey({ chainId, sale: SALE, fromBlock }),
    );
    if (!snapshot || snapshot.events.length === 0) return;

    // Must match the canonical key in useLivePurchaseEvents exactly.
    const queryKey = ["live-purchases", String(fromBlock), SALE];
    const state = queryClient.getQueryState(queryKey);
    // Never clobber data already as fresh as (or fresher than) the snapshot.
    if (state?.data && state.dataUpdatedAt >= snapshot.updatedAt) return;

    queryClient.setQueryData(queryKey, snapshot.events, {
      updatedAt: snapshot.updatedAt,
    });
  }, [queryClient, chainId]);

  return null;
}
