// ─── Global identity adapter ──────────────────────────────────────────────
//
// The single, SSR-safe source of "is this visitor a connected wallet, and is
// that wallet a Syndicate Member?" for GLOBAL chrome only — the header, the
// mobile action bar, and the wallet dropdown. It exists so those surfaces can
// make their entry CTAs state-aware WITHOUT coupling to the cockpit's
// next-action context (which is cockpit-scoped and not global-safe).
//
// Doctrine:
//   • Connect ≠ membership. Connecting / opening context is NOT joining.
//   • A wallet becomes a Member only by buying through the Sale and being
//     recorded in the Holder Index (the master identity — see holder-index.ts).
//   • Identity is "loading" until the client has mounted AND (when connected)
//     the holder index has resolved. During loading we emit a NEUTRAL fallback
//     and NEVER assert member / non-member — so we can never flash the wrong
//     CTA (e.g. "Buy More SYN" at a non-member, "Become a Member" at a member).
//
// Sources: useWalletSession + useHolderIndex ONLY. The holder-index query is
// shared site-wide (one cached getLogs scan), so subscribing here adds NO new
// chain read.
//
// The derivation is a pure function (resolveGlobalIdentity) so the full state
// machine is unit-testable without rendering; the hook is a thin wrapper.

import { useEffect, useMemo, useState } from "react";
import { useWalletSession } from "./wallet-session";
import { useHolderIndex } from "./holder-index";

// Canonical entry vocabulary (see replit.md copy canon). Full + compact forms;
// the compact form is for width-constrained chrome (the mobile action bar).
const LABEL = {
  joinFull: "Join The Syndicate",
  joinShort: "Join",
  becomeFull: "Become a Syndicate Member",
  becomeShort: "Become Member",
  buyMore: "Buy More SYN",
  dashboard: "My Syndicate",
} as const;

export interface GlobalIdentity {
  /** True only after client mount + a connected wallet with an address. */
  isConnected: boolean;
  /** True until mount completes, and (when connected) until the index cleanly
   *  resolves. A holder-index ERROR also keeps this true (truth unknown → neutral). */
  isLoadingIdentity: boolean;
  /** Wallet is recorded in the Holder Index (joined via a sale contract). */
  isMember: boolean;
  /** Connected wallet that has NOT joined (resolved — not while loading). */
  isConnectedNonMember: boolean;
  /** Lowercased 0x address, or null when not connected. */
  address: `0x${string}` | null;

  /** Full canon membership CTA label for the current state (routes to /join). */
  primaryMembershipLabel: string;
  /** Compact form of the same label, for width-constrained bars. */
  primaryMembershipLabelShort: string;
  /** Dashboard CTA label (routes to /my-syndicate). */
  dashboardLabel: string;

  /** Any connected wallet may open its dashboard (the page handles member vs visitor). */
  shouldShowMySyndicate: boolean;
  /** Member-only membership-continuation CTA. */
  shouldShowBuyMoreSyn: boolean;
  /** Connected-non-member acquisition CTA. */
  shouldShowBecomeMember: boolean;
}

export interface GlobalIdentityInput {
  /** Client has mounted (false during SSR + first client render). */
  mounted: boolean;
  /** Raw wagmi connection flag. */
  isConnected: boolean;
  /** Normalized lowercased address, or null. */
  address: `0x${string}` | null;
  /** Holder index is still resolving. */
  idxLoading: boolean;
  /** Holder index resolved to an ERROR (RPC / scan failure) — truth is unknown. */
  idxError: boolean;
  /** A holder-index record exists for this address (only meaningful once resolved). */
  hasRecord: boolean;
}

/**
 * Pure derivation of the global identity state machine. Kept side-effect-free so
 * every state (not-mounted / disconnected / loading / non-member / member) can be
 * asserted in a unit test without a React tree or wallet provider.
 */
export function resolveGlobalIdentity(input: GlobalIdentityInput): GlobalIdentity {
  const connected = input.mounted && input.isConnected && !!input.address;
  const address = connected ? input.address : null;

  // Holder-index truth is "unresolved" while it is loading OR if it errored. An
  // RPC/scan failure means we CANNOT trust an empty record — a real member would
  // otherwise look like a non-member and get the wrong CTA. Either way: stay neutral.
  const idxUnresolved = connected && (input.idxLoading || input.idxError);

  // Loading until mounted, and (while connected) until the index resolves.
  const isLoadingIdentity = !input.mounted || idxUnresolved;

  // Membership is only asserted once connected AND cleanly resolved — never during
  // load, and never while the index is in an error state.
  const isMember =
    connected && !input.idxLoading && !input.idxError && input.hasRecord;
  const isConnectedNonMember = connected && !isLoadingIdentity && !isMember;

  let primaryMembershipLabel: string = LABEL.joinFull;
  let primaryMembershipLabelShort: string = LABEL.joinShort;
  if (isMember) {
    primaryMembershipLabel = LABEL.buyMore;
    primaryMembershipLabelShort = LABEL.buyMore;
  } else if (isConnectedNonMember) {
    primaryMembershipLabel = LABEL.becomeFull;
    primaryMembershipLabelShort = LABEL.becomeShort;
  }
  // disconnected OR loading → "Join" (neutral; asserts no membership status).

  return {
    isConnected: connected,
    isLoadingIdentity,
    isMember,
    isConnectedNonMember,
    address,
    primaryMembershipLabel,
    primaryMembershipLabelShort,
    dashboardLabel: LABEL.dashboard,
    // Any connected wallet may open the dashboard; /my-syndicate renders its own
    // visitor vs member state, so this is a destination, not a membership claim.
    shouldShowMySyndicate: connected,
    shouldShowBuyMoreSyn: isMember,
    shouldShowBecomeMember: isConnectedNonMember,
  };
}

export function useGlobalIdentity(): GlobalIdentity {
  // Mounted gate: server + first client render report false, so the rendered
  // markup matches across hydration (no mismatch) and we start neutral.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const session = useWalletSession();
  const idx = useHolderIndex();

  const address = session.address;
  const record = address ? idx.getByWallet(address) : undefined;

  return useMemo(
    () =>
      resolveGlobalIdentity({
        mounted,
        isConnected: session.isConnected,
        address,
        idxLoading: idx.isLoading,
        idxError: idx.isError,
        hasRecord: !!record,
      }),
    [mounted, session.isConnected, address, idx.isLoading, idx.isError, record],
  );
}
