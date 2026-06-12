// ─── Referral Attribution (ATTRIBUTION-ONLY, off-chain) ─────────────────────
// Captures and reads a `?ref=<memberNumber>` parameter so a new visitor can be
// attributed to the member who brought them. This is ATTRIBUTION ONLY:
//
//   • No reward. No commission. No payout. No contract.
//   • Stored locally in the browser only (first-touch). Never written on-chain.
//   • A captured ref is only ever *displayed* once it RESOLVES to a real member
//     in the canonical holder index (resolution happens in the UI layer).
//
// The reserved on-chain referral MODEL lives in src/lib/future-referral.ts and
// keeps reward status permanently PENDING until a contract is deployed. This
// module reuses that legal note so every surface speaks the same language.

import { FUTURE_REFERRAL_NOTE } from "./future-referral";

/** URL query parameter carrying the referrer's public member number. */
export const REF_PARAM = "ref";

/** localStorage key for the first-touch attribution record. */
export const REF_STORAGE_KEY = "syn:ref-attribution";

/** Attribution-only legal note, re-exported so UI imports a single source. */
export const REFERRAL_ATTRIBUTION_NOTE = FUTURE_REFERRAL_NOTE;

export type StoredReferral = {
  /** Referrer's public member number (a positive integer). Never an identity. */
  memberNumber: number;
  /** Unix ms when first captured. First-touch wins; never overwritten. */
  capturedAt: number;
};

/**
 * Parse a raw `?ref` value into a positive integer member number, or null.
 * Anything non-numeric, zero, negative, or non-integer is rejected — we never
 * fabricate or coerce an attribution.
 */
export function parseRefValue(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const n = Number(trimmed);
  if (!Number.isInteger(n) || n < 1) return null;
  return n;
}

/** Read the stored first-touch attribution, or null. SSR-safe. */
export function getStoredReferral(): StoredReferral | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(REF_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReferral>;
    const memberNumber = parseRefValue(
      parsed?.memberNumber != null ? String(parsed.memberNumber) : null,
    );
    if (memberNumber == null) return null;
    return {
      memberNumber,
      capturedAt:
        typeof parsed.capturedAt === "number" ? parsed.capturedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

/** Convenience: the stored referrer member number, or null. */
export function getStoredRefNumber(): number | null {
  return getStoredReferral()?.memberNumber ?? null;
}

/**
 * Capture a `?ref` from a location search string (defaults to the current URL).
 * First-touch wins: if a valid attribution is already stored it is preserved.
 * Returns the active stored member number after capture, or null. SSR-safe.
 */
export function captureReferralFromLocation(search?: string): number | null {
  if (typeof window === "undefined") return null;
  const existing = getStoredReferral();
  if (existing) return existing.memberNumber;

  const qs = search ?? window.location.search;
  let value: string | null = null;
  try {
    value = new URLSearchParams(qs).get(REF_PARAM);
  } catch {
    value = null;
  }
  const memberNumber = parseRefValue(value);
  if (memberNumber == null) return null;

  try {
    const record: StoredReferral = { memberNumber, capturedAt: Date.now() };
    window.localStorage.setItem(REF_STORAGE_KEY, JSON.stringify(record));
  } catch {
    // best-effort; attribution is non-essential
  }
  return memberNumber;
}

/**
 * Append `?ref=<memberNumber>` to a verifiable base URL so a shared link
 * attributes the visitor to the sharer. Returns the base URL unchanged when
 * the member number is not a positive integer.
 */
export function buildReferralShareUrl(
  baseUrl: string,
  memberNumber: number | null | undefined,
): string {
  const n = parseRefValue(memberNumber != null ? String(memberNumber) : null);
  if (n == null) return baseUrl;
  const sep = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${sep}${REF_PARAM}=${n}`;
}
