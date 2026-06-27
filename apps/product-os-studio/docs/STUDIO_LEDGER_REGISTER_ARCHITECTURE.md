# STUDIO_LEDGER_REGISTER_ARCHITECTURE

> `SIMULATED` · `PROTOTYPE ONLY`. This describes how the prototype's "organism" connects its
> organs. **Nothing reads a live chain, posts, or executes.** Every concrete instance is
> simulated; only the routing split, `ZERO_SOURCE_ID`, doctrine, and module-status
> vocabulary are canonical.

## The protocol graph (`src/lib/protocol-graph.ts`) — the nervous system

A shared read-model so the organs talk to each other instead of being isolated pages.

### Pipeline (the backbone, 7 stages)

`raw-event → activity → candidate → memory → share → founder-review → public-update`

Each `PipelineNode` names its organ + the surface it shows on (e.g. activity → `/member/activity`,
candidate → `/member/graph`, founder-review → `/member/founder-review`, public-update → `/press`).

### Classifications (branches off "candidate")

`recognition` · `evolution` · `chronicle` · `archive` · `share` · `fire`. Each has a rule —
e.g. chronicle "requires founder approval to enter canon; most events never qualify",
fire "a proposed SYN burn… never minting, never a price promise, never yield".

### Protocol events (`PROTOCOL_EVENTS`)

10 simulated events. Each has `classifications[]`, the furthest `stage` reached, a
`founderDecision` (`n/a | pending | approved | declined | never`), a `source`
(`simulated | future`), and `activityRef` linking back to `MOCK_DATA.activities` (so the
heartbeat is the single origin). Selectors: `getEventsForClassification`,
`getFounderQueues` (drives the Founder Console review queues), `getPendingCandidateCount`.

### Organ distinctions (deliberately different things)

Activity = heartbeat · Evolution = series · Chronicle = curated canon · Archive = memory
object (ERC-1155) · Registry = contract proof · Transparency = capital truth · My Syndicate
= personal return · Founder Console = control room · Shareability = external propagation.

## Chronicle (`CHRONICLE`)

Curated institutional canon — **selective**, not Activity. States: `canon` / `eligible` /
`activity-only`. Selectors `getChronicleCanon`, `getChronicleEligible`, `getActivityOnly`.
Routine events (a vault allocation, a config toggle) are explicitly **activity-only** — they
are heartbeat, never canon on their own.

## Recognition (`RECOGNITION_BOARD` + `RECOGNITION_PATH`)

Multi-axis standing across 11 axes (`MOCK_DATA.recognitionAxes`). Contributors carry
`signals` (a count of proof-backed signals, **not money**) and a `standing`, never a
balance. Path: Event → Candidate (axis) → Founder Review → Member Signal. The public board
is anonymized (opaque seat letters). **Not a wealth leaderboard, not yield, not rewards.**

## Fire Ledger (`src/lib/fire-ledger.ts`) — Proof of Fire

A typed **derived** projection over the `fire`-classified protocol events — it does **not**
invent a parallel truth. Hard rules baked in:

- A burn **retires SYN supply**. It is **NOT** minting, **NOT** yield, **NOT** a price pump,
  **NOT** a promised return.
- **Nothing executes a burn.** Prototype entries carry no fake hashes/explorer links. The one
  exception is `PROOF_OF_FIRE_001` — a real Founder Burn (1,000 SYN, confirmed block) plus
  `SYN_BURN_ADDRESS`, shown as `READ-ONLY PRODUCTION PROOF` with read-only explorer links,
  **separate** from the simulated aggregate (`getProofOfFire()`). A live scan is `ADAPTER REQUIRED`.
- The aggregate `burnedSyn` total (`MOCK_DATA.protocolStats.burnedSyn = 10000`) is
  **SIMULATED** and always labeled. `getBurnSummary()` always returns
  `simulated: true`, `statusLabel: "SIMULATED PROTOTYPE"`.
- `FIRE_LEDGER` has 3 entries (founder / community / protocol) summing to the simulated
  total (5000 + 2500 + 2500 = 10000). `FIRE_SOURCE = "future"`.

## Registry / contract architecture (`MOCK_DATA.contractLayers`)

9 layers, each carrying a `proof` boolean. **`proof: true` rows are `READ-ONLY PRODUCTION
PROOF`** — the real deployed address copied from the porting map, shown with a **read-only
explorer link** (nothing wired). **`proof: false` rows stay prototype placeholders** with inert
`#` links — concepts **not** in the porting map (`FUTURE`), not production truth.

| Layer | Status | Source | Purpose |
|-------|--------|--------|---------|
| MembershipSaleV3 | LIVE NOW (`proof: true`) | porting map (real) | Active V3 sale: USDC in, SYN acquired (default `ZERO_SOURCE_ID`). |
| MembershipSaleV1 | READ-ONLY (`proof: true`) | porting map (real) | Historical V1 sale (sealed). |
| SourceRegistryV1 | PAUSED (`proof: true`) | porting map (real) | Deployed; policy PAUSED — referral/claim not live. |
| SYN token | LIVE NOW (`proof: true`) | porting map (real) | Accounting unit (ERC-20). |
| USDC | LIVE NOW (`proof: true`) | porting map (real) | Capital input (ERC-20). |
| Archive1155 | LIVE NOW (`proof: true`) | porting map (real) | Memory artifacts (ERC-1155) — not a seat, no financial rights. |
| SeatRecord721 | FUTURE (`proof: false`) | not in map | Identity (ERC-721) — reserved as Archive ID 2 pointer; not deployed. |
| ProductSaleRouter | FUTURE (`proof: false`) | not in map | Studio concept only — not production truth. |
| SwapRail | FUTURE (`proof: false`) | not in map | Studio concept only — not production truth. |

`contract-copy-row.tsx` renders each row by `proof`: `proof: true` rows expose the real address
with a **read-only** explorer link (reference only — nothing wired); `proof: false` rows stay
prototype placeholders whose links go nowhere.

**Posture (reconciliation pass):** the canonical address constants live in
`docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`, which is **now present in this export**.
Real deployed rows (`proof: true`) are shown as `READ-ONLY PRODUCTION PROOF` (static, with
read-only explorer links); rows not in the map (`proof: false`) stay `FUTURE` prototype
placeholders with inert links. **Nothing is wired** — a live read is still `ADAPTER REQUIRED`.
The production-shaped read seam is `ContractRegistryAdapter` in `src/lib/adapters.ts`; see
`STUDIO_ADAPTER_SEAMS.md`.

## Capital truth (routing) — canonical math

`ROUTING_SPLIT = 70 / 20 / 10` (Vault / Liquidity / Operations) and `routeUsdc(amount)` are
**canonical**. The routing wallet endpoints (`routingWallets`) are now **`READ-ONLY PRODUCTION
PROOF`** — canonical wallets from the porting map (`proof: true`, `mocked: false`), shown static
with read-only explorer links (nothing wired). The routed *totals* displayed remain simulated.

## Truth-Drift Detector (Founder Console, READ-ONLY)

A coherence check: the same concept (e.g. "Verified Introduction") is named across several
arrays (Live Board, Contract Registry, Economy ecosystem, Evolution episodes). The detector
compares the status each source reports and flags disagreement (`aligned | review |
conflict`) so a founder can reconcile drift before shipping. **It mutates nothing**, reads
only data already in the repo, and never touches a live chain.
