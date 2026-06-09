// ─── Vendor-neutral analytics helper ──────────────────────────────────────
// Goal: ship clean event call sites NOW, without committing to a provider.
// When/if a provider is added later (Plausible, PostHog, GA4, etc.), wire it
// in ONE place — the `dispatch` function below — and every call site lights
// up automatically.
//
// Privacy posture:
//   • No PII. No email. No wallet address as a user identity.
//   • Public wallet ACTION context is allowed in event props (e.g. tx hash
//     of a completed purchase) but never persisted as a user trait.
//   • No cross-site tracking, no fingerprinting, no session replay.
//
// Until a provider is connected, events are no-ops in production and emit a
// single `console.debug` line in dev so call sites can be verified.

export type AnalyticsEvent =
  | "join_cta_click"
  | "claim_seat_click"
  | "verify_click"
  | "registry_click"
  | "liquidity_click"
  | "trade_syn_click"
  | "add_liquidity_click"
  | "transparency_click"
  | "wallet_connect_click"
  | "wallet_account_resync"
  | "purchase_start"
  | "purchase_success"
  | "purchase_error"
  | "nft_archive_cta_click"
  | "my_syndicate_cta_click"
  | "docs_cta_click"
  | "view_archive_page"
  | "view_join_page"
  | "archive_mint_connect_click"
  | "archive_approve_submit"
  | "archive_approve_confirmed"
  | "archive_mint_submit"
  | "archive_mint_success"
  | "archive_mint_refresh_status"
  | "archive_mint_retry"
  | "patron_seal_approve_submit"
  | "patron_seal_approve_confirmed"
  | "patron_seal_mint_submit"
  | "patron_seal_mint_success"
  | "patron_seal_connect_click"
  | "metamask_explorer_fix_click"
  | "metamask_explorer_fix_success"
  | "metamask_explorer_fix_error"
  | "explorer_preference_change"
  | "theme_toggle";

export type EventProps = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    // Reserved for a future provider hook — assigned by the provider's
    // bootstrap snippet (e.g. `window.__syndicateAnalytics = (name, props) => …`).
    __syndicateAnalytics?: (name: AnalyticsEvent, props?: EventProps) => void;
  }
}

function dispatch(name: AnalyticsEvent, props?: EventProps): void {
  // 1) Provider hook (set by a future provider bootstrap).
  if (typeof window !== "undefined" && typeof window.__syndicateAnalytics === "function") {
    try { window.__syndicateAnalytics(name, props); } catch { /* swallow */ }
    return;
  }
  // 2) Dev visibility — silent in production.
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", name, props ?? {});
  }
}

/** Fire a typed analytics event. Safe during SSR (no-op). */
export function track(name: AnalyticsEvent, props?: EventProps): void {
  if (typeof window === "undefined") return;
  dispatch(name, props);
}
