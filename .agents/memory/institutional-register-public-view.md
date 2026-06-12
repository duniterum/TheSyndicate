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

## Data-status layer (reliability hardening)
- Pure `deriveRegisterStatus()` in the public leaf; priority is MOST-LIMITING-first
  and first-match-wins: `loading` > `error` (all sources failed, guarded by
  `sourcesChecked>0`) > `rpc-limited` (some failed) > `partial` (window truncated) >
  `coverage-limited` (`!coverageComplete`) > `empty` (0 entries) > `ready`.
  `isComplete` ⇔ `ready`; `canTrustEmpty` ⇔ `empty`; `lastDerivedAt` = max positive
  `dataUpdatedAt` or null. `useProtocolEvents` exposes a memoized `sources[]`
  (6 sources, each isLoading/isError/dataUpdatedAt) — additive; legacy 4-source
  isLoading/isError shape is untouched.
- **The view hardcodes `coverageComplete:false`** (no derivation change yet) →
  `ready`/`empty` (the LIVE/EMPTY pills) are PROVABLY UNREACHABLE today; healthy +
  not-truncated always resolves to `coverage-limited`. This is BY DESIGN, not a bug —
  don't "fix" the unreachable LIVE state. LIVE/EMPTY unlock only when a future change
  proves deployment-to-now coverage. `windowTruncated = events.length >= EVENT_WINDOW_LIMIT (200)`.
- **Copy-safety is test-enforced, NOT guard-enforced**: the leaf is in `EXCLUDE_FILES`
  of check-ownership-wording, so its labels/reasons/coverage notes are never scanned by
  the guard — the public test MUST run findPublicVocabularyViolations + findForbiddenLanguage
  + findHistoricClaims over all 7 labels+reasons and both coverage notes. (The VIEW
  component IS guard-scanned, so its EmptyState copy is covered both ways.)
- **Gotcha: the literal word "genesis" trips `HISTORIC_CLAIM_PATTERNS`** even in purely
  descriptive copy (it is a bare `\bgenesis\b` pattern) → say "deployment-to-now",
  never "genesis-to-now", in coverage/status strings.
- Lineage: `isLineageComplete(entry)` requires every upstream ref non-blank; an `active`
  entry with broken lineage is downgraded to DRAFT presentation (no "Finalised" date,
  explicit "Lineage incomplete" note). EntryCard suppresses the draft hint for these
  downgraded entries (gate on `entry.entryStatus==="draft"`, not the computed flag).
