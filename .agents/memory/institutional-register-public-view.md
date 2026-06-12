---
name: Institutional Register public view
description: Doctrine + IA + SSR behaviour of the read-only public /institutional-register surface
---

# Public Institutional Register view (`/institutional-register`)

The first PUBLIC, read-only surface over the Institutional Register. It exposes
durable protocol memory as a verifiable record. It is NOT Story, NOT Recognition,
NOT the public Chronicle, NOT a member register, NOT DAO/governance, and it
publishes nothing.

## IA ruling
- Surface = a STANDALONE additive route `src/routes/institutional-register.tsx`.
- **Why not nest** under `/registry` or `/chronicle`: those route files are
  single-page leaves; adding a dotted child turns them into layouts that need an
  `<Outlet/>` (flat-route gotcha) — an invasive refactor. Nesting under
  `/chronicle` is ALSO doctrinally wrong (implies it IS the public Chronicle /
  Story, which it must not).
- Restraint: NOT in main nav. Cross-linked from Registry "more" section + Chronicle
  footer. Indexable + canonical, low-priority sitemap entry.

## Selection layer (presentation, NOT a derivation layer)
- `src/lib/institutional-register-public.ts` is OUTSIDE the adjacency guard. The
  guard (`signal-adjacency.test.ts`) only constrains `REGISTER_MODULES`
  (institutional-register-registry.ts + institutional-register.ts) and
  `SIGNAL_MODULES`. So the public view may freely import `deriveInstitutionalRegister`
  + the full pipeline (mirrors `labs.institutional-register.tsx`).
- Public shows ONLY `active` + `draft` (`PUBLIC_INSTITUTIONAL_STATUSES`).
  held/rejected stay internal (labs renders the full set). `draft` MUST be labelled
  "approved upstream, awaiting finalisation — not yet durable" (no hidden claim as
  final). `selectPublicInstitutionalEntries` = `filter().reverse()` → newest-first,
  never mutates input.
- New §5 sober banlist `PUBLIC_FORBIDDEN_VOCAB`/`findPublicVocabularyViolations`.
  Because the file LISTS its own banned words, it must be added to `EXCLUDE_FILES`
  in `scripts/check-ownership-wording.mjs`; coverage restored by the bucket-iterating
  copy test (findPublicVocabularyViolations + findForbiddenLanguage + findHistoricClaims
  over every `INSTITUTIONAL_COPY_BUCKETS` + fallback).

## SSR behaviour (gotcha)
- The view runs `useProtocolEvents`, which is LOADING during SSR → SSR HTML renders
  the **"Loading on-chain events…"** branch, NOT the empty/entry copy. So an SSR
  curl/audit must assert the LOADING branch; the empty state ("No finalised
  institutional memory yet") and entry cards are CLIENT-only. SSR-safe: no wallet
  dependency, bigint `sourceBlock` rendered via `.toString()` only (never a query key).
- Dates: format active-entry `createdAt` as deterministic UTC `toISOString().slice(0,10)`
  — `toLocaleDateString` risks an SSR/client tz hydration mismatch.
