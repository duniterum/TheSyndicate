# Sprint 9 — Institutional Register Seeding + GENESIS_EVENT Classification

**Scope:** Seed the public Institutional Register (`/institutional-register`) with real, verified
protocol-birth memory, and fix `GENESIS_EVENT` classification so a **verified** institutional genesis
**fact** is allowed while **hype / unverified** genesis stays blocked.

**Posture:** small / precise / additive · "held is better than invented" · no Story, no Recognition,
no governance, no member-memory · no architecture rewrite. Design = architect-approved **Option C**:
a parallel genesis **seed** leaf builds entries directly; the promotion-fed deriver is **unchanged**.

**Status:** complete. Architect `evaluate_task` verdict = **PASS — sign off.**

---

## 1. Files changed

| File | Change | Kind |
|---|---|---|
| `src/lib/institutional-register-genesis.ts` | **NEW** — genesis seed leaf: `GENESIS_FACTS` registry + pure `deriveGenesisRegisterEntries()` | additive |
| `src/lib/institutional-register-registry.ts` | `availability` union gains `"seeded"`; four classes flipped to `seeded` + `initial distribution` class added; adjacency comment amended | additive / comment |
| `src/lib/institutional-register-public.ts` | **NEW** pure `mergeInstitutionalEntries(seed, derived)` (dedup by tx hash, seed wins) | additive |
| `src/components/syndicate/InstitutionalRegisterView.tsx` | wire `genesisEntries` memo → merge before `selectPublicInstitutionalEntries`; `"seeded"` class chip + section description; stale comment corrected | additive |
| `src/lib/institutional-register.ts` | adjacency doc comment names the lawful 2nd source — **deriver logic unchanged** | comment-only |
| `src/lib/__tests__/signal-adjacency.test.ts` | **NEW** `GENESIS_SEED_MODULES` describe block (CONFIG→SEED edge guard) | test |
| `src/lib/__tests__/institutional-register-genesis.test.ts` | **NEW** 27-test suite (spec §9) | test |

Diff size: 5 tracked files `+120 / −12`; 2 new source/test files. The deriver diff is 8 lines, all comment.

## 2. Entries seeded

Nine curated facts, canonical chronology (oldest → newest). Six **active** (public), three **held** (internal).

| # | id | class | category | status | disposition | anchor |
|---|---|---|---|---|---|---|
| 1 | `syn-token-deployment` | TOKEN_DEPLOYMENT | genesis | verified | active | SYN contract address |
| 2 | `initial-distribution` | INITIAL_DISTRIBUTION | genesis | verified | active | SYN contract address |
| 3 | `membership-sale-deployment` | CONTRACT_DEPLOYMENT | genesis | locked | active | creation tx + block `87,157,852` |
| 4 | `first-liquidity` | FIRST_LIQUIDITY | liquidity | locked | active | LP pool creation tx |
| 5 | `archive-contract-deployment` | CONTRACT_DEPLOYMENT | genesis | verified | active | Archive1155 address |
| 6 | `proof-of-fire-001` | FIRST_BURN | burn | locked | active | burn tx + block `87,703,847` |
| 7 | `earliest-member` | FIRST_MEMBER | membership | coverage-limited | **held** | — |
| 8 | `earliest-artifact` | FIRST_ARTIFACT | artifact | coverage-limited | **held** | — |
| 9 | `earliest-milestone` | FIRST_MILESTONE | milestone | coverage-limited | **held** | — |

Each active fact's copy is protocol-centric and person-free; every fact's `copyViolations` array is empty
(validated against the live historic-claim + forbidden-language + public-vocab guards, not a bespoke check).

## 3. GENESIS_EVENT decision

**Ruling:** genesis is a legitimate **institutional fact** only when it is independently verifiable; as a
marketing flourish it remains banned.

- `findHistoricClaims(text, verificationStatus)` is **verification-aware** (pre-existing — no guard logic
  was touched this sprint): for `verified` / `locked` it returns `[]` (the word is a fact); for
  `coverage-limited` the same `genesis` / `first X` patterns flag as a violation.
- The seeds honour this: the word "genesis" appears **only** on contract-anchored (`verified`) or
  tx/block-pinned (`locked`) facts. The three coverage-limited ordinals deliberately use **"earliest …
  held pending coverage"** and assert no "first".
- Tests prove both directions: a verified/locked "genesis" string passes; the identical string at
  `coverage-limited` is blocked; hype copy ("legendary founder achievement, guaranteed profit") is still
  rejected by the unchanged public-vocab + protocol-language guards.

Net: **verified institutional genesis → allowed; unverified / hype genesis → blocked.** No safety weakened.

## 4. Sources used

All anchors are public on-chain data, read from `src/lib/syndicate-config.ts` (code outranks docs):

- `CONTRACTS.SYN_CONTRACT_ADDRESS` — token deployment + initial distribution (verified).
- `MEMBERSHIP_SALE_CREATION_TX` (`0x30e1378a…`) + `SALE_DEPLOYMENT_BLOCK` (`87_157_852n`) — sale deployment (locked).
- `LP_POOL.creationTx` (`0x60f04521…`) — first liquidity (locked).
- `CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS` (`0xB2AE1eb7…`) — archive deployment (verified).
- `PROOF_OF_FIRE_001.txHash` + `.blockNumber` (`87_703_847n`) — first supply burn (locked).

No chain is read at runtime; the leaf is pure and deterministic. No new secret or external dependency.

## 5. Entries held or excluded

- **Held (3, internal only):** `earliest-member`, `earliest-artifact`, `earliest-milestone`. Their categories
  are real and the systems are live, but an "earliest/first" **ordinal** cannot be proven without
  deployment-range coverage the public window never asserts. They are seeded as `held` + `coverage-limited`
  so the *decision to hold* is itself on the record, and `isPubliclyVisible` excludes them (held ∉ active/draft).
- **Excluded entirely (1):** *first campaign funding* — no verifiable on-chain source exists, so per spec §1
  it is omitted, not invented.

## 6. Coverage limitations

- `coverageComplete` stays **false**: the public view never proves it covers the full deployment range, so
  it remains honestly `coverage-limited`. Seeding genesis does **not** upgrade coverage.
- The seeds fill the *pre-scanner* gap (foundational facts older than the bounded event window) without
  claiming the window itself is complete.
- Ordinals ("first/earliest") stay held precisely because coverage is unproven — consistent with the
  existing windowed-first-claims doctrine.

## 7. Founder / protocol-steward handling

Every steward (protocol-wallet) action is framed as a **protocol fact**, never a person's achievement:
"protocol seeded first liquidity", "protocol executed first supply burn". No founder identity, no member
wallet, no member `#N`, no money-raised / ROI framing anywhere in seeded copy (asserted by tests and the
ownership-wording guard). This is institutional history, not Recognition or Story.

## 8. Maintainer suggestions

- The `availability: "seeded"` class state now documents, in the registry vocabulary itself, that a class is
  fed by curated genesis facts rather than the live scanner — keep new pre-scanner facts pointed at it.
- If a future foundational fact is **both** verified and tx-bearing, note that the merge currently lets any
  tx-bearing seed win dedup (see §13); keep the "tx-anchored ⇒ locked" invariant or tighten the predicate.
- When the event scanner's coverage is eventually proven across the deployment range, the three held ordinals
  can graduate to active via the normal pipeline — no seed edit required.

## 9. Register quality check

- Public view renders **only** the six active seeds (held filtered), newest-first, with `proof-of-fire-001`
  topping the seed block; SSR returns HTTP 200 with the `seeded` class chip present.
- Merge is pure, dedups on lowercased `sourceTxHash` (locked seed wins), preserves `[...seed, ...derived]`
  ordering; with the public selection's reverse, derived-newest surface above seeds.
- Lineage is complete for every seed via honest sentinels (`genesis-seed:<id>` / `predates-scanner` /
  `genesis-fact:<id>`), so `isLineageComplete()` holds while the trail truthfully reads "predates scanner".

## 10. What was intentionally not touched

- The promotion-fed **deriver** (`institutional-register.ts`) — comment-only.
- `findHistoricClaims` / `findForbiddenLanguage` / `findPublicVocabularyViolations` guard **logic** — reused, not changed.
- Story, Recognition, Chronicle Phase 2, governance, member-memory — out of scope, untouched.
- `coverageComplete` semantics, the event window, and the production build (known OOM) — left as-is.

## 11. Tests added

- `institutional-register-genesis.test.ts` — **27 tests**: copy safety per fact; genesis allowed only as
  verified/locked; verified-vs-coverage-limited classification; held ordinals carry no "first"; campaign
  funding excluded; on-chain anchor present per active fact; complete lineage; explicit `genesis-seed`
  provenance; fixed curation timestamp + determinism; member/wallet identity absent; membership ordinal held
  & not public; public selection clean + newest-first; merge dedup (seed wins) + distinct-tx kept.
- `signal-adjacency.test.ts` — **new `GENESIS_SEED_MODULES` block**: forbids imports of event / signal /
  memory / chronicle-review / chronicle-promotion layers; asserts the registry vocabulary import (CONFIG→SEED edge).

## 12. QA results

| Check | Result |
|---|---|
| `bunx tsc --noEmit` | clean |
| genesis suite | 27/27 pass |
| signal-adjacency suite | 83/83 pass |
| institutional-register-public + register suites | 81/81 pass |
| chronicle-promotion suite | 31/31 pass |
| `node scripts/check-ownership-wording.mjs` | OK (350 files) |
| SSR `GET /institutional-register` | HTTP 200, `seeded` chip rendered |

Per-file vitest (full run OOMs in this environment, per known ceiling).

## 13. Remaining risks

- **Merge dedup wording vs behaviour (non-blocking):** the comment says "locked seed wins" but the code lets
  *any* tx-bearing seed win. Today all tx-anchored seeds are locked, so behaviour matches the doc; revisit if
  a verified-but-tx-bearing seed is ever added.
- **All-sources-error degrade (non-blocking):** when reliability status is `error`, the view hides the
  chain-independent genesis seeds too. This is an intentional degrade-don't-fabricate posture, acceptable for now.
- **Signal-layer import regex (cosmetic):** the Signal `FORBIDDEN_IMPORTS` patterns end at `institutional-register`
  and would not catch a hypothetical signal import of `institutional-register-genesis`; the forward edge is
  implausible but cheap to harden later.

---

*This sprint did exactly two things: seed verified institutional history into the register, and make
`GENESIS_EVENT` a safe institutional vocabulary. It is not Story, not Recognition, not Chronicle Phase 2.*
