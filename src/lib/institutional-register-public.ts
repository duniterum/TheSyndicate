// ─── Institutional Register · PUBLIC selection leaf (Sprint 7) ──────────────
// The PUBLIC, read-only VIEW over the Institutional Register exposes durable
// protocol memory as a verifiable surface. It is NOT Story, NOT Recognition, NOT
// the public Chronicle, and it PUBLISHES NOTHING — it only SELECTS which
// already-derived InstitutionalRegisterEntries are safe to show publicly.
//
// Public discipline (spec §2, §4):
//   • Show only `active` (accepted institutional memory) and `draft` (approved
//     upstream but NOT finalised — never presented as final).
//   • `held` (review / context / coverage) and `rejected` stay INTERNAL — the
//     /labs workbench renders the full set.
//   • Member-living decisions never reach this layer at all (excluded upstream).
//
// This file reads ENTRIES ONLY (the register's own types). It runs no derivation,
// reaches into no upstream layer, fabricates no fact, and asserts no on-chain
// status. Selection is status-only — held/rejected are dropped, never relabelled,
// and the copy/lineage carried on each entry is preserved verbatim.

import type {
  InstitutionalEntryStatus,
  InstitutionalRegisterEntry,
} from "./institutional-register-registry";

/** The only entry statuses safe for the public read-only view (spec §4). */
export const PUBLIC_INSTITUTIONAL_STATUSES = [
  "active",
  "draft",
] as const satisfies readonly InstitutionalEntryStatus[];

export type PublicInstitutionalStatus = (typeof PUBLIC_INSTITUTIONAL_STATUSES)[number];

/** True when an entry's status is one the public view may render. */
export function isPubliclyVisible(
  entry: Pick<InstitutionalRegisterEntry, "entryStatus">,
): boolean {
  return (PUBLIC_INSTITUTIONAL_STATUSES as readonly string[]).includes(
    entry.entryStatus,
  );
}

/**
 * Select the public-safe subset of register entries, NEWEST FIRST.
 *
 * Derivers return entries oldest → newest; the public view reads newest first.
 * `filter` returns a fresh array, so the in-place `reverse` never mutates the
 * caller's input.
 */
export function selectPublicInstitutionalEntries(
  entries: readonly InstitutionalRegisterEntry[],
): InstitutionalRegisterEntry[] {
  return entries.filter(isPubliclyVisible).reverse();
}

/**
 * Sober-language banlist for the PUBLIC view (spec §5). The institutional voice
 * stays neutral: no legend/hero framing, no person heroising, no profit / return
 * / yield / guarantee, no governance-right / investor-reward / financial-promise
 * claims. The generated entry copy is clean by construction; this is a defensive
 * guard against any future copy regression reaching the public surface.
 */
export const PUBLIC_FORBIDDEN_VOCAB: readonly string[] = [
  "legendary",
  "legend",
  "heroic",
  "founder achievement",
  "guaranteed",
  "guarantee",
  "profit",
  "returns",
  "return",
  "yield",
  "governance right",
  "investor reward",
  "financial promise",
  "roi",
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Return the §5 sober-language violations in `text`. Word-boundary, case-
 * insensitive — so "recurring", "revenue", "structural" never false-positive.
 */
export function findPublicVocabularyViolations(text: string): string[] {
  if (!text) return [];
  return PUBLIC_FORBIDDEN_VOCAB.filter((term) =>
    new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(text),
  );
}
