# V2B SNAPSHOT + PARAMETER REHEARSAL — FOUNDER REPORT (F1–F14)

> **Scope:** Rehearsal **PREP ONLY**. No mainnet deploy. No referral / NFT / Archive /
> journey / wallet-provider changes. No frontend changes (Part F9 is a **plan only**).
> **Sprint goal:** V2b **replaces** the live, unaudited V2a — preserving **every**
> current member (V1 ∪ V2a), unlocking high-conviction Genesis buys ($25,000 Era I
> per-address cap), with **no duplicate seats**.
>
> **Generated:** 2026-06-16 · Chain: Avalanche C-Chain (43114) · Snapshot is **PROVISIONAL**
> (rehearsal head `88162414`, not the final pause block).

---

## F1 — Conflicts exposed FIRST (read before anything else)

Per the hard constraint, the conflicts between the founder-approved items and the
**existing locked doctrine** are surfaced before any resolution:

| # | Founder-approved item | Existing locked state | Conflict / risk | Disposition this sprint |
|---|---|---|---|---|
| C1 | **Packages = amount presets** | `src/lib/package-catalog.ts` derives `SEAT_PACKAGES` **1:1 from `RANKS_V2`** (11 rank-named packages). Doctrine comment: "a package is a friendly presentation of an EXISTING rank tier — NOT a new parallel naming system." | "Amount presets" vs "rank-named packages" is a **framing change**. Done wrong it re-introduces **package/rank confusion** (a forbidden item). | **Plan only (F9).** Resolution direction: presets keyed by **USDC amount**, rank shown as a *derived recognition* hint, never as the package's identity. **Not implemented.** |
| C2 | **9 Chapters ↔ 9 Eras**, public = "Chapter", internal = "Era" | `src/lib/chapters.ts` = **5 chapters** (story coordinates, #1–333 … #10,001+). `src/lib/eras.ts` = **9 eras** (distribution schedule). They are **deliberately two coordinate systems**. | Making "9 public Chapters" means **subdividing today's Chapter V (Open Era, #10,001+)** into 5 sub-chapters to match Eras V–IX. The current 5-chapter boundaries are used **pervasively** (homepage, /chapters, /archive, /nft, /members, /my-syndicate, /registry, /docs, /roadmap, and **future SeatRecord721 metadata**). This is a **doctrine + governance change**, not a rename. | **Plan only (F9).** Flag as governance-gated. **Not implemented.** |
| C3 | **Era I (Genesis) per-address cap $5 → $25,000** | Live V2a has `addrCaps[0] = $5` — a **defect**: it blocks every high-conviction Genesis buy (the $10k = 1,000,000 SYN "Cornerstone" amount cannot clear a $5 cap). | None doctrinally — this is the **fix**. The only care: the per-address cap is the **anti-whale control** for Genesis; $25,000 = `maxUsdcPerTx`, so a single address can take a full high-conviction seat in one tx. Confirmed intended. | **Implemented in rehearsal params (F7).** |
| C4 | **Re-snapshot over V1 ∪ V2a** (not reuse V2a's offset=2 / V1-only root) | The canonical `deploy-params.json` root was snapshotted at the **V1 pause block** (V1-only, 2 members, offset 2) **before V2a existed**. | Reusing the V1-only root would **fail to recognize the 3 V2a members** → they could be **re-issued seats** (duplicate identity = the one irreversible mistake). | **Resolved (F3–F5):** merged snapshot, offset = 5, new root. |

**Net:** C3 and C4 are executed (params + snapshot). **C1 and C2 are documented plans only** —
they are frontend/vocabulary/doctrine changes outside this rehearsal-prep sprint and (for C2)
warrant a governance decision.

---

## F2 — V2a on-chain reality (re-verified)

Re-read directly from chain (block **88,161,784**) before building anything:

| Property | Value | Note |
|---|---|---|
| V2a sale | `0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48` | the **live, unaudited** contract V2b replaces |
| `paused()` | **false** | V2a is live and sellable |
| `memberCount()` | **5** | 2 carried-over V1 (offset) + 3 fresh V2a buyers |
| active era | **Era I (Genesis)** | next seat = #6 |
| `maxUsdcPerAddressPerEra(1)` | **$5** (`5000000`) | **the defect** C3 fixes |
| `commissionRouter()` | `0x0` | referral OFF (unchanged in V2b) |
| SYN balance | **4,998,500 SYN** | funded inventory on V2a |

This is the state V2b must **continue, not reset**.

---

## F3 — Merged member roster (V1 ∪ V2a) — the identity gate

Source: `contracts/tools/export-members-merged.mjs`, which **mirrors the canonical frontend
Holder Index** (`src/lib/activity-hooks.ts` → `useLivePurchaseEvents`): scan **V1 `TokensPurchased`**
+ **V2a `Purchased`**, sort oldest-first by **(blockNumber, logIndex)**, dedupe by **first-seen**
buyer address, then number `1..N`.

| # | Address | Source | First block | First tx | logIdx |
|---|---|---|---|---|---|
| 1 | `0x244531C571966f90f4849e03a507543d90f9C721` | V1 | 87,158,947 | `0x959bf5f6…a8d07` | 13 |
| 2 | `0x3488857b003104e2B08A1D198f8a23BFF28B0045` | V1 | 87,216,573 | `0xab4cc6b6…0e89bd` | 45 |
| 3 | `0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0` | V2a | 88,105,075 | `0x46b38df9…dae0ae` | 6 |
| 4 | `0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a` | V2a | 88,151,112 | `0xa0acd4ff…df8f54` | 35 |
| 5 | `0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD` | V2a | 88,151,239 | `0xb1e90d68…4379d2` | 6 |

**Distinct members = 5.** Order is first-seen across **both** contracts, so the V2a seat
numbering (#3, #4, #5) is preserved exactly.

---

## F4 — `genesisOffset` derivation + irreversible-gate proof

- **`genesisOffset = 5`** (= the 5 distinct members above). At deploy, V2b sets
  `memberCount = 5`, the **next** seat = **#6**, and Era I stays active.
- The merged root (F5) makes **all 5** recognizable, so a returning member is recognized
  (no new seat) and only true newcomers advance the seat boundary.

**Fail-loud cross-checks (all PASS) — the irreversible-gate guard:**
1. `countMatchesOnchainMemberCount` — distinct merged count (5) **==** on-chain V2a `memberCount` (5) **at the same block**. ✅
2. `v2aFirstSeatNumberingConsistent` — every V2a `firstSeat=true` memberNumber **==** its derived first-seen number. ✅
3. `everyFirstSeatFalseHasEarlierFirstSeen` — every repeat buyer (`firstSeat=false`) has a **strictly earlier** first-seen. ✅

If any check had failed, the exporter aborts — it never emits a snapshot that could mis-number a seat.

---

## F5 — Merged Merkle root + validation

| Artifact | Value |
|---|---|
| **Merged root (V2b)** | `0xa1f2ed106c6d87372d99256765fcbad8c150441913d7bf0ea51908665f718c49` |
| Old root (V1-only, superseded) | `0xae75ae2077570c7bd09d95cc142e283cfa73fc9e263c2debf1ba3403457474ff` |
| Leaf encoding | OpenZeppelin StandardMerkleTree, `["address"]` |
| Proofs | 5 (one per member) — see `contracts/tools/v2b-merkle.json` |
| `validate-snapshot.mjs` | **OK** — root re-derived, 5 proofs replayed, no duplicates |

`gen-v1-root.mjs` and `validate-snapshot.mjs` are **source-agnostic** and were reused **unchanged**.

---

## F6 — Snapshot pipeline: reused vs newly built

| Tool | Status | Role |
|---|---|---|
| `export-members.mjs` | unchanged (not used) | V1-**only** scanner (single contract) — insufficient for V2b |
| **`export-members-merged.mjs`** | **NEW** | V1 ∪ V2a union scanner, mirrors `useLivePurchaseEvents`, fail-loud cross-checks, `process.exit(0)` to avoid the viem keep-alive hang |
| `gen-v1-root.mjs` | reused unchanged | source-agnostic root builder |
| `validate-snapshot.mjs` | reused unchanged | source-agnostic replay/validation |

RPC used: `publicnode` (`getLogs` window ≤ 50,000; `api.avax.network` caps at 2,048 and `ankr`
rate-limited a cold scan). Generated outputs (`members-merged.json`, `members-merged.snapshot.json`,
`v2b-merkle.json`) are **gitignored**.

---

## F7 — V2b deploy-params delta (`deploy-params.v2b.rehearsal.json`)

**Exactly four fields differ** from the canonical `deploy-params.json`; everything else is
**byte-identical** (token/treasury addresses, `addrCaps[1..8]`, `maxUsdcPerTx`,
`reserveThroughSeat`, all `eraCaps`, `initialRouter`):

| Field | Canonical (`deploy-params.json`) | V2b rehearsal | Why |
|---|---|---|---|
| `provisional` | `false` | **`true`** | Makes `Deploy.s.sol` **fail-closed** unless `ALLOW_PROVISIONAL_DEPLOY=1` (fork only) |
| `addrCaps[0]` | `5000000` ($5) | **`25000000000`** ($25,000) | C3 — fixes the V2a $5 defect; unlocks the $10k = 1,000,000 SYN package |
| `genesisOffset` | `2` | **`5`** | C4 — recognizes all 5 current members |
| `v1MemberRoot` | `0xae75…74ff` | **`0xa1f2…18c49`** | C4 — merged V1 ∪ V2a root |

**Architect-confirmed:** no address, `maxUsdcPerTx`, `reserveThroughSeat`, router, or `eraCap` drift.

> ⚠️ **Operator footgun:** `Deploy.s.sol` **hardcodes** `vm.readFile("script/deploy-params.json")`
> and `foundry.toml` `fs_permissions` only grants read to that one path. The rehearsal file is
> therefore **not consumed** unless it is explicitly copied/renamed to `deploy-params.json` (or the
> script/runbook is adjusted). This is intentional friction for a rehearsal-only artifact — see F8.

---

## F8 — Fork rehearsal: 15-step runbook + run status

**Test written:** `contracts/test/RehearsalForkV2b.t.sol` (sibling of the V2a `RehearsalFork.t.sol`).
It deploys the **production** `SyndicateSaleV2` on an Avalanche C-Chain fork with the exact V2b
values and asserts:
- constructor read-back: `memberCount == 5`, next seat **#6**, Era I active, **$25k** Era I addr cap echoed, `eraSynCap[1] == max`, router `0x0`, merged root;
- a merged member recognized via `claimV1Membership` mints **NO** seat;
- a fresh buy mints **#6** (500 SYN at $5);
- a returning merged member with a valid proof mints **NO 2nd seat** (asserts the SYN **delta**);
- **HEADLINE:** a **$10,000 Genesis buy** clears the new $25k cap and yields **exactly 1,000,000 SYN** (member #7) — the capability the V2a $5 cap blocked.

**Run status: BLOCKED in this environment (run-if-feasible → not feasible here).**
The Foundry **`via_ir` compile is OOM-killed** in this container (no error, no marker, process
vanished — the documented build-OOM ceiling). The test is **ready to run** in a higher-memory
Foundry environment; it self-skips when `AVAX_RPC` is unset, so it never breaks `forge test`.

**15-step fork-rehearsal runbook (for a higher-memory machine):**
1. `cd contracts` (isolated Foundry harness; `via_ir = true` is required for `buy()`).
2. Ensure libs present: `lib/forge-std`, `lib/openzeppelin-contracts`.
3. `forge build` once (warm the `via_ir` cache) — expect minutes; needs > this container's RAM.
4. Export an Avalanche **full/archive** RPC: `export AVAX_RPC=<rpc>`.
5. (Optional) pin a fork block: `export AVAX_FORK_BLOCK=88162414` (else forks at head).
6. Dry-compile the test: `forge test --match-contract RehearsalForkV2b --no-match-test x -vv` (compile only).
7. Run it: `forge test --match-contract RehearsalForkV2b -vv` (add `--evm-version cancun` if the fork rejects `paris` opcodes).
8. Confirm constructor read-back assertions (offset 5, seat #6, $25k cap, root) pass.
9. Confirm `claimV1Membership` recognizes a merged member with **no** `memberCount` change.
10. Confirm a fresh buy mints **#6** and pays 500 SYN.
11. Confirm a returning merged member (proof) mints **no** 2nd seat (SYN delta = 500).
12. Confirm the **$10,000** buy mints **#7** and pays **1,000,000 SYN** (the headline).
13. **Deploy-script rehearsal (separate):** copy `deploy-params.v2b.rehearsal.json` → `deploy-params.json` in a **scratch checkout**, then `ALLOW_PROVISIONAL_DEPLOY=1 forge script script/Deploy.s.sol --fork-url $AVAX_RPC`.
14. Verify the deployed fork instance's getters match F7; then **restore** the canonical `deploy-params.json`.
15. Record gas + the deployed address; tear down the fork. **No broadcast — fork only.**

**Evidence base while the fork run is pending:** the offline guarantees already hold — merged
snapshot + root + `validate-snapshot` OK, on-chain cross-check (count == 5), and the architect's
static verification of the constructor/`buy()` semantics against the assertions.

---

## F9 — Frontend cleanup (PLAN ONLY — not implemented)

Three required changes, **documented, not built** (per task scope). Each names the surface and the
intended direction; none were touched.

**E1 — False perk "Self-service wallet checkout".**
`src/lib/syndicate-config.ts` `RANKS_V2` lists `"Self-service wallet checkout"` as a *benefit* of
**only** the top three tiers (Keystone L123, Inner Circle L124, Cornerstone L125). This is false:
**every** tier is self-service (see `package-catalog.ts` doctrine: "any amount above the $5 minimum
is taken online via wallet checkout"). The taglines in `package-catalog.ts` (L72–74) repeat the same
implication. **Plan:** remove/neutralize "Self-service wallet checkout" from those three `benefits`
arrays and drop the "Available online via wallet checkout" tagline suffix, so no tier implies the
others are gated. (Keep `eras-and-packages.test.ts` green.)

**E2 — Packages = amount presets (C1).**
`package-catalog.ts` currently projects one package per **rank** (1:1 from `RANKS_V2`). **Plan:**
re-present packages as **USDC amount presets** (quick-buy amounts that feed the single `buy()` at the
fixed Genesis rate), with the rank surfaced only as a **derived recognition** label — never as the
package's name/identity. This keeps the "no package/rank confusion" rule intact. **Governance note:**
the 1:1 rank projection is currently *locked doctrine*; changing it is a deliberate decision.

**E3 — 9 Chapters / Chapter↔Era vocabulary (C2).**
`chapters.ts` has **5** chapters; `eras.ts` has **9** eras. **Plan (governance-gated):** to honor
"9 Chapters ↔ 9 Eras, public = Chapter / internal = Era," the public surfaces would render the
**9-entry** schedule under the word **"Chapter"** while code keeps `eras.ts` as the engine. This
**subdivides today's Chapter V (#10,001+)** into 5 sub-chapters and touches every chapter-consuming
surface (and future `SeatRecord721` metadata). **Recommend a founder/governance sign-off before any
implementation** — it changes a pervasively-used coordinate system, not just a label.

---

## F10 — Irreversible-gate risk register

| Risk | Likelihood | Guard in place | Residual |
|---|---|---|---|
| V2a member re-issued a new seat (duplicate identity) | **Critical if wrong** | Merged root + offset 5 + 3 fail-loud cross-checks; `buy()` recognizes a proof-bearing returning member and mints no seat | **Low** — proven for the rehearsal snapshot |
| Exporter diverges from frontend Holder Index | High impact | Exporter mirrors `useLivePurchaseEvents` exactly; identity sourced from `Purchased`/`TokensPurchased` (architect-confirmed equivalent; frontend's extra `Routed` join is money-split only, not identity) | **Low** |
| Snapshot taken at the wrong block | Medium | snapshotBlock recorded (`88162414`, current head) and **flagged PROVISIONAL** everywhere | **Open** — final must pin the V2a **pause** block (F13) |
| Wrong deploy-params consumed | Medium | `provisional=true` fail-closes; `Deploy.s.sol` reads only `deploy-params.json` | **Open** — operator must copy file deliberately (F7 footgun) |

---

## F11 — Forbidden-scope compliance (what was NOT touched)

- ❌ No mainnet deploy, no broadcast. ✅
- ❌ No referral / CommissionRouter change (`initialRouter = 0x0`, unchanged). ✅
- ❌ No NFT / Archive / journey / wallet-provider change. ✅
- ❌ No package/rank confusion introduced (C1/C2 are **plans only**). ✅
- ❌ No protocol-truth / canon-doc edits. ✅
- ✅ Only new/changed files: `contracts/tools/export-members-merged.mjs`,
  `contracts/script/deploy-params.v2b.rehearsal.json`, `contracts/test/RehearsalForkV2b.t.sol`,
  `contracts/tools/.gitignore` (ignore generated outputs), and this report.

---

## F12 — Architect review outcome (`evaluate_task`)

**Verdict: PASS for rehearsal-prep / static review — no observed irreversible-gate defect.**
- Exporter matches the Holder Index identity rule; the only difference (reads `Purchased` directly
  vs the frontend's `Purchased`⋈`Routed` money-split join) is **safe** because identity is sourced
  from `Purchased` and successful buys emit both.
- Params semantic diff = **exactly** the four intended fields; no drift.
- Fork-test assertions are correct against `SyndicateSaleV2` semantics; `$10,000 × 100 × 1e12 =
  1,000,000 SYN`; `deal(SYN, 50,000,000)` comfortably exceeds the reserve-through-10,000 floor
  (~4.1M SYN after offset 5) plus the tested buys.
- Caveat: the final **pause-block** re-snapshot can change `genesisOffset` and root if any V2a
  purchase lands before pause — current values are **not final**.

Recommended next actions (folded into F13).

---

## F13 — Final → mainnet readiness checklist (NOT this sprint)

1. **Pause V2a**, record the pause block + tx.
2. **Re-run `export-members-merged.mjs` pinned to the V2a pause block** → regenerate
   `genesisOffset`, merged root, proofs, and a **non-provisional** params file. Re-run
   `validate-snapshot.mjs` and the cross-checks.
3. **Execute `RehearsalForkV2b`** in a higher-memory Foundry environment (F8 runbook) — must be green.
4. Make the **deploy-script param path explicit** (rename to `deploy-params.json` deliberately, or
   parametrize the path) so an operator cannot accidentally run the stale V1-only file.
5. Confirm V2b **SYN funding** plan covers at least the $10k = 1,000,000 SYN package + the
   reserve-through floor.
6. Independent **audit** of the V2a→V2b replacement before broadcast (V2a is *unaudited*).
7. Only then: mainnet deploy + post-deploy getter verification against the final params.

---

## F14 — Steward's perspective

The protocol's one truly irreversible asset is **seat identity**. This sprint's discipline was
correct: the snapshot is a **union of both sale contracts**, numbered by first-seen, and **refuses
to emit** unless it reproduces the on-chain member count and seat order exactly. That is the
property worth protecting — the $25k cap fix (C3) and the merged root (C4) are the substance; the
fork test is the proof; everything else is operational hygiene.

Two things remain genuinely consequential and should **not** be rushed:
- The **final snapshot must be pinned to the V2a pause block**, not a rolling head. Today's values
  are a faithful *rehearsal*, not a deploy artifact.
- The **9-Chapter / amount-preset** changes (C1/C2) are **doctrine**, not cosmetics. They touch a
  coordinate system used across the whole site and the future seat-record metadata. They deserve an
  explicit founder decision on their own, separate from this rehearsal.

Held to the doctrine — *code outranks docs, every claim maps to an on-chain read, don't trust,
verify* — V2b is **ready to rehearse** and **not yet ready to deploy**, exactly as intended.
