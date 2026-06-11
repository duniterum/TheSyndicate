// ─── Protocol Language Rules ───────────────────────────────────────────────
// The single vocabulary contract for the protocol-memory layer (Chronicle
// candidates, Recognition candidates, Ledger notes, Reports). It encodes the
// APPROVED framing and the FORBIDDEN framing so every generated string can be
// validated by one helper instead of each module re-deriving the rules.
//
// Doctrine:
//   • Membership is identity and belonging — NOT a financial return.
//   • Recognition is structural acknowledgement — NOT verified real-world
//     identity. No KYC.
//   • Attribution/reward language stays PENDING until a contract exists.
//
// This is a pure-data leaf. It asserts no status and reads no chain. The
// forbidden list lives here as DATA; the doctrine test scans the OTHER
// protocol-memory modules' generated copy through `findForbiddenLanguage`,
// never this file's own definitions.

/**
 * Approved concept vocabulary. These are the words the protocol uses to
 * describe what a member does and how the protocol remembers it.
 */
export const APPROVED_CONCEPTS = [
  "Enter",
  "Take your seat",
  "Rise",
  "Seal",
  "Verify",
  "Leave a trace",
  "Be remembered",
  "Protocol memory",
  "Public record",
  "Recognition",
] as const;

/**
 * Forbidden framing. Investment / yield language is legally unsafe for an
 * experimental utility membership token; "verified identity" / "KYC" misframe
 * recognition; "raised" / "fundraising" misframe membership sales as a raise.
 * Stored lower-cased; matched case-insensitively with word boundaries so the
 * approved word "Rise" never trips the forbidden "raised".
 */
export const FORBIDDEN_LANGUAGE = [
  "investment",
  "roi",
  "yield",
  "dividend",
  "dividends",
  "passive income",
  "guaranteed return",
  "guaranteed returns",
  "fundraising",
  "raised",
  "verified identity",
  "kyc",
] as const;

const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Pre-compiled, word-boundary-aware matchers. `\b` keeps short tokens (roi,
// kyc) from matching inside larger words and protects approved words.
const FORBIDDEN_MATCHERS: ReadonlyArray<{ term: string; re: RegExp }> =
  FORBIDDEN_LANGUAGE.map((term) => ({
    term,
    re: new RegExp(`\\b${escapeForRegex(term)}\\b`, "i"),
  }));

/**
 * Return the forbidden terms present in `text` (lower-cased), empty when clean.
 * Used by Chronicle/Recognition candidate validators and the doctrine test.
 */
export function findForbiddenLanguage(text: string): string[] {
  if (!text) return [];
  const hits: string[] = [];
  for (const { term, re } of FORBIDDEN_MATCHERS) {
    if (re.test(text)) hits.push(term);
  }
  return hits;
}

/** Convenience boolean: true when `text` contains no forbidden framing. */
export function isLanguageClean(text: string): boolean {
  return findForbiddenLanguage(text).length === 0;
}
