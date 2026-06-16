# V2B SNAPSHOT + PARAMETER REHEARSAL — FOUNDER REPORT (F1–F14)

> **Scope:** Rehearsal **PREP ONLY**. No mainnet deploy. No referral / NFT / Archive /
> journey / wallet-provider changes. No frontend changes (Part F9 is a **plan only**).
> **Sprint goal:** V2b **replaces** the live, unaudited V2a — preserving **every**
> current member (V1 ∪ V2a), unlocking high-conviction Genesis buys ($25,000 Era I
> per-address cap), with **no duplicate seats**.
>
> **Generated:** 2026-06-16 · Chain: Avalanche C-Chain (43114) · Snapshot is **PROVISIONAL**
> (rehearsal head `88162414`, not the final pause block).
>
> **Rehearsal status: EXECUTED — ✅ PASS.** The forked-mainnet test `RehearsalForkV2b` ran
> **green** on an Avalanche C-Chain fork (`--evm-version cancun`; `1 passed / 0 failed`), and the
> `Deploy.s.sol` param-path footgun is now **fixed and proven by simulation** (see F7 / F8).

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

> ✅ **Operator footgun — FIXED (proven in F8.2).** `Deploy.s.sol` previously hardcoded
> `vm.readFile("script/deploy-params.json")`, so the rehearsal file could only be consumed by
> **overwriting** the canonical file (a stale-file hazard). It now (1) reads an **explicit,
> env-selected path** `DEPLOY_PARAMS` (default `script/deploy-params.json`), (2) **logs the path it
> actually loaded**, and (3) enforces a **double-entry guard** — if `EXPECT_GENESIS_OFFSET` /
> `EXPECT_V1_ROOT` are set and don't match the loaded file, the script **reverts**
> (`Deploy: genesisOffset != EXPECT_GENESIS_OFFSET (stale snapshot?)`). `foundry.toml`
> `fs_permissions` now grants read to `./script` (the directory, not a single hardcoded file).
> `provisional=true` still **fail-closes** unless `ALLOW_PROVISIONAL_DEPLOY=1` (fork only).
>
> ⚠️ **Operational rule (mandatory):** the `EXPECT_*` guard only protects you if it is **set** — an
> operator who omits `EXPECT_GENESIS_OFFSET` / `EXPECT_V1_ROOT` can still load the default file
> unguarded. Treat **both `EXPECT_*` values as REQUIRED** at every rehearsal/deploy (F13 #4); the
> residual risk in F10 is exactly this human-discipline step.

---

## F8 — Fork rehearsal: EXECUTED ✅ (forked mainnet, cancun)

**Test:** `contracts/test/RehearsalForkV2b.t.sol` deploys the **production `SyndicateSaleV2` source**
(same semantics — see the compile caveat below; this is a behavior rehearsal, **not** production-bytecode
equivalence) on an Avalanche C-Chain fork using the exact `deploy-params.v2b.rehearsal.json` values and
proves the full member lifecycle (A–H). It self-skips when `AVAX_RPC` is unset, so the default
`forge test` is unaffected. **Scope note:** the fork samples **one V1 proof (member #1) + one V2a proof
(member #3)**; full "all 5 prior members preserved" rests on the `offset=5` constructor read-back
(`memberCount==5`) **plus** the offline merged-snapshot validation (F3–F5), not an on-fork replay of all
five proofs.

**Result:** `Suite result: ok. 1 passed; 0 failed; 0 skipped` — fork test **green in 3.35s** (warm cache).

```
[PASS] test_forkRehearsalV2b_fullFlow()
deployed V2b SyndicateSaleV2 at: 0x5615dEB798BB3E4dFa0139dFa1b3D433Cc23b72f
V2b FORK REHEARSAL OK: 5 prior members preserved, no duplicate seats,
  ladder $5/$25/$100/$1k/$10k all funded, 70/20/10 routed, router unset.
```

**Exact command + environment (reproducible):**
```bash
cd contracts
# 1) warm the cancun cache once — full via_ir compile (~67s); runs=1 fits container RAM
FOUNDRY_OPTIMIZER_RUNS=1 forge build --evm-version cancun
# 2) run the fork test against a public Avalanche RPC
AVAX_RPC="https://avalanche-c-chain-rpc.publicnode.com" \
  FOUNDRY_OPTIMIZER_RUNS=1 \
  forge test --match-contract RehearsalForkV2b -vv --evm-version cancun
```

- **`--evm-version cancun` is REQUIRED.** Under the default `paris` spec the forked **SYN** token
  bytecode (PUSH0) reverts `EvmError: NotActivated` on the first `balanceOf`. Cancun matches the
  live chain spec. (Section A constructor read-backs pass under paris; execution against the real
  tokens does not.)
- **`FOUNDRY_OPTIMIZER_RUNS=1` is an ENVIRONMENT workaround, not a behavior change.** The cold
  `cancun` via_ir compile at the production `runs=200` is **OOM-killed** in this 16 GiB container
  (the documented build-OOM ceiling). `runs=1` cuts via_ir Yul-optimizer memory enough to compile
  (~67s) with **identical runtime semantics** for a behavior rehearsal. Production bytecode is still
  built at the canonical `paris` / `runs=200`.
- `AVAX_FORK_BLOCK` is optional (defaults to chain head). RPC: `publicnode` (api.avax.network also
  works; ankr now needs an API key).

**Lifecycle assertions — all PASS:**

| § | Proof | Result |
|---|---|---|
| A | constructor read-back | `memberCount==5`, next seat **#6**, Era I active, Era I addr cap **$25,000**, `eraSynCap[1]==max`, router `0x0`, merged root ✅ |
| B | V2a member #3 recognized via `claimV1Membership` | `knownMember==true`, `memberCount` stays **5** (no seat) ✅ |
| C | fresh newcomer first buy ($5) | mints **#6**, **+500 SYN**, cumulative USDC `$5` ✅ |
| D | returning V1 member #1 (valid proof, $5) | **no 2nd seat** (`memberCount` stays 6, `memberNumberOf==0`), still **+500 SYN** ✅ |
| E | amount ladder $25 / $100 | **#7 (+2,500 SYN)**, **#8 (+10,000 SYN)** ✅ |
| F | 70/20/10 routing on $1,000 → **#9** | Vault **+$700**, Liquidity **+$200**, Operations **+$100**; router still `0x0` ✅ |
| G | **HEADLINE** $10,000 Genesis → **#10** | **+1,000,000 SYN** — the package the V2a $5 cap blocked ✅ |
| H | repeat buy by member #6 ($25) | **no 2nd seat**, **+2,500 SYN**, cumulative USDC → **$30** ✅ |
| — | final invariants | `commissionRouter==0x0` throughout; still Era I (all new seats ≤ #333) ✅ |

**Buy simulations (deliverable):**

| Buy | USDC (6dp) | SYN out (×100/USDC) | Seat | Routing (Vault / Liq / Ops) |
|---|---|---|---|---|
| $5 newcomer | 5,000,000 | 500 | **#6** (new) | 70/20/10 |
| $5 returning V1 #1 | 5,000,000 | 500 | — (recognized, no seat) | 70/20/10 |
| $25 | 25,000,000 | 2,500 | **#7** (new) | 70/20/10 |
| $100 | 100,000,000 | 10,000 | **#8** (new) | 70/20/10 |
| $1,000 | 1,000,000,000 | 100,000 | **#9** (new) | **$700 / $200 / $100 (asserted)** |
| $10,000 | 10,000,000,000 | 1,000,000 | **#10** (new) | 70/20/10 |
| $25 repeat (by #6) | 25,000,000 | 2,500 | — (keeps #6) | 70/20/10 |

Every ladder amount clears the new **$25,000** Era I per-address cap; the $10,000 buy is the largest
Genesis package and directly confirms the C3 fix the V2a `$5` cap blocked.

### F8.1 — SYN funding requirement (production)

`buy()` mints only if enough SYN **remains** to seat every reservable seat (`m+1 … 10,000`) at each
seat's own era minimum (`_reserveSyn`, O(9) over the era table). Computed from the live schedule
(Era I 100 SYN/USDC·min $5 → #333; II 50·$10 → #1,000; III 40·$10 → #3,333; IV 16·$25 → #10,000):

| Quantity | SYN (18dp) | Derivation |
|---|---|---|
| Reserve floor at deploy (`_reserveSyn(5)`, seats #6–#10,000) | **4,097,500** | (333−5)·500 + 667·500 + 2333·400 + 6667·400 |
| Largest single Genesis package ($10,000 × 100) | **1,000,000** | headline buy |
| Full max-per-tx Genesis buy ($25,000 × 100) | **2,500,000** | `MAX_USDC_PER_TX` × 100 |
| **Fund to honor one fresh $10k buy (seat #6)** | **≥ 5,097,000** | 1,000,000 + `_reserveSyn(6)` 4,097,000 |
| **Fund to honor one full $25k buy (seat #6)** | **≥ 6,597,000** | 2,500,000 + `_reserveSyn(6)` 4,097,000 |

> ⚠️ **Funding gap (carry-over blocker).** V2a currently holds **4,998,500 SYN** (F2). A like-for-like
> balance transfer to V2b would **not** fund even one full $10,000 Genesis package — only ≈ **$9,015**
> of Genesis SYN is sellable above the reserve floor. **V2b must be funded ABOVE the V2a balance**
> (≥ 5,097,000 SYN to open $10k buys; ≥ 6,597,000 SYN for a full $25k buy) before opening. The fork
> test sidesteps this by `deal`-ing 50,000,000 SYN to the contract; production needs a real funding tx
> (the constructor pulls no SYN).

### F8.2 — Deploy-script footgun fix: proven by simulation

Three `forge script script/Deploy.s.sol:Deploy --rpc-url <avax> --evm-version cancun` dry-runs (no
broadcast) prove the fix end-to-end:

| Case | Inputs | Outcome |
|---|---|---|
| 1 — happy path | `DEPLOY_PARAMS=…rehearsal.json`, `EXPECT_GENESIS_OFFSET=5`, `EXPECT_V1_ROOT=0xa1f2…18c49`, `ALLOW_PROVISIONAL_DEPLOY=1` | **SIMULATION COMPLETE** — `memberCount=5`, `activeEra=1`, `commissionRouter=0x0` |
| 2 — stale double-entry | rehearsal file but `EXPECT_GENESIS_OFFSET=2` | **REVERT** `Deploy: genesisOffset != EXPECT_GENESIS_OFFSET (stale snapshot?)` |
| 3 — the footgun (default stale file) | default `deploy-params.json` (offset 2) but operator `EXPECT_GENESIS_OFFSET=5` | **REVERT** + logs `deploy params file: script/deploy-params.json` (operator sees the file used) |

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
| Wrong deploy-params consumed | Medium | `provisional=true` fail-closes; `Deploy.s.sol` now reads an **explicit `DEPLOY_PARAMS` path**, **logs it**, and a **double-entry `EXPECT_GENESIS_OFFSET`/`EXPECT_V1_ROOT` guard reverts on a stale/mismatched file** (proven F8.2) | **Closed** for the path footgun; residual = human discipline to pass the `EXPECT_*` values |

---

## F11 — Forbidden-scope compliance (what was NOT touched)

- ❌ No mainnet deploy, no broadcast. ✅
- ❌ No referral / CommissionRouter change (`initialRouter = 0x0`, unchanged). ✅
- ❌ No NFT / Archive / journey / wallet-provider change. ✅
- ❌ No package/rank confusion introduced (C1/C2 are **plans only**). ✅
- ❌ No protocol-truth / canon-doc edits. ✅
- ✅ Only new/changed files: `contracts/tools/export-members-merged.mjs`,
  `contracts/script/deploy-params.v2b.rehearsal.json`, `contracts/test/RehearsalForkV2b.t.sol`,
  `contracts/script/Deploy.s.sol` (explicit `DEPLOY_PARAMS` path + `EXPECT_*` guard — F7/F8.2),
  `contracts/foundry.toml` (`fs_permissions` read `./script`), `contracts/tools/.gitignore`
  (ignore generated outputs), and this report. **No `contracts/src/` (contract) change.**

---

## F12 — Architect review outcome (`evaluate_task`)

**Verdict: PASS for the executed rehearsal — no observed irreversible-gate or correctness defect.**
- **Funding math confirmed:** `_reserveSyn(5)=4,097,500`, `_reserveSyn(6)=4,097,000`; fresh $10k buy
  needs **≥ 5,097,000 SYN**, full $25k needs **≥ 6,597,000 SYN**; V2a's 4,998,500 SYN leaves only
  ≈ **$9,015** of headroom for the next fresh seat — the funding gap is real (F8.1).
- **Env workaround sound:** `FOUNDRY_OPTIMIZER_RUNS=1` does not change Solidity semantics (absent a
  compiler bug) and `cancun` is required to execute forked live-token bytecode. **Caveat:** this is a
  **same-source behavior rehearsal, NOT production-bytecode equivalence** (production is `paris`/`runs=200`).
- **Test proves the core properties:** constructor read-back, `claimV1Membership` recognition with no
  `memberCount` change, V1-proof buy with no 2nd seat, fresh seats #6–#10, $10k → 1,000,000 SYN,
  repeat buy with no 2nd seat, and the 70/20/10 deltas with router unset. **Caveat:** the fork samples
  **one V1 + one V2a proof**; full "all 5 preserved" rests on the `offset=5` read-back + offline
  snapshot validation, not an on-fork replay of all five proofs.
- **Deploy guard safe:** `provisional=true` still requires `ALLOW_PROVISIONAL_DEPLOY=1`; the path
  override + logging + `EXPECT_*` guard are correct. **Residual:** the `EXPECT_*` guard is only
  effective if operators **set it** — so it must be a **mandatory** deploy gate (now stated in F7/F13),
  not optional.
- Caveat: the final **pause-block** re-snapshot can change `genesisOffset` and root if any V2a
  purchase lands before pause — current values are **not final**.

Recommended next actions (folded into F7 / F13). Severe issues: none.

---

## F13 — Final → mainnet readiness checklist (NOT this sprint)

1. **Pause V2a**, record the pause block + tx.
2. **Re-run `export-members-merged.mjs` pinned to the V2a pause block** → regenerate
   `genesisOffset`, merged root, proofs, and a **non-provisional** params file. Re-run
   `validate-snapshot.mjs` and the cross-checks.
3. ✅ **`RehearsalForkV2b` executed green** (F8) under `--evm-version cancun` + `FOUNDRY_OPTIMIZER_RUNS=1`.
   **Re-run after the pause-block re-snapshot** (offset/root may change) before broadcast.
4. ✅ **Deploy-script param path made explicit** — `Deploy.s.sol` reads `DEPLOY_PARAMS`
   (default `script/deploy-params.json`), logs the path, and an `EXPECT_GENESIS_OFFSET`/`EXPECT_V1_ROOT`
   double-entry guard reverts on a stale file (F7 / F8.2). Operators **must pass the `EXPECT_*` values** at deploy.
5. ⚠️ **Fund V2b ABOVE the V2a balance.** Need **≥ 5,097,000 SYN** to honor one $10k Genesis buy
   (1,000,000 + reserve 4,097,000) or **≥ 6,597,000 SYN** for a full $25k buy. V2a holds only
   **4,998,500 SYN** → a like-for-like transfer is **insufficient** (F8.1).
6. Independent **audit** of the V2a→V2b replacement before broadcast (V2a is *unaudited*).
7. Only then: mainnet deploy + post-deploy getter verification (`verify-deploy.mjs`) against the final params.

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
verify* — the V2b rehearsal is now **executed and green on a forked mainnet** (every prior member
preserved, no duplicate seats, the full $5–$10k ladder funded, 70/20/10 routed, router unset), and
the deploy-script footgun is closed. V2b nonetheless remains **not yet deployable**: the snapshot is
still **provisional** (final must pin the V2a pause block), V2b must be **funded above the V2a
balance** (F8.1), and the V2a→V2b replacement is **unaudited**. **Rehearsed and proven — not yet
deployable**, exactly as intended.
