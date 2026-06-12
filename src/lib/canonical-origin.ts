// Canonical public origin — client-safe.
//
// The deployed marketing/identity origin used to build verifiable share links
// (e.g. /wallet/$address, /milestone/$id). Kept in a tiny client-safe module so
// UI components can import it without pulling in any `.server.ts` code.
//
// NOTE: the OG server (src/lib/og-data.server.ts) and the wallet route declare
// the same literal for their own contexts; this module is the shared client-side
// source for share-link construction. Do not point share links at non-verifying
// pages — every share must resolve to an on-chain-provable surface.
export const CANONICAL_ORIGIN = "https://thesyndicate.money";
