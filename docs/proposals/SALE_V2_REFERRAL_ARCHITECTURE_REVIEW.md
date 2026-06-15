# The Syndicate — Referral Architecture & Revenue Attribution Review

> **⚠️ SUPERSEDED — HISTORICAL PLANNING (referral model). Retained for decision-history only.**
> This review describes the early inline "flat 5%" (`refAmt = opsSlice / 2`) draft. The protocol
> subsequently adopted the **external `CommissionRouterV1`** and **tiered referral from day one**
> (tier axis = verified referred-member count). The old flat 5% is **fully superseded** — not a tier
> and not a fallback: with no router set the sale pays NO referral (the full Operations slice goes to
> Operations); the lowest tier (Signal) pays 30% of the Operations slice (3% of gross). Any statement
> below that Sale V2 referral is "flat 5% only," or that tiers are deferred
> to a later version (V3+), is **no longer current**. Current truth:
> `docs/proposals/SALE_V2_COMMISSION_ROUTER_V1_REVIEWER_PACKET.md`,
> `docs/proposals/SALE_V2_PROTOCOL_FREEZE_REVIEW.md` (item 1), and
> `docs/proposals/SALE_V2_TIERED_REFERRAL_FEASIBILITY_AND_MINIMAL_SAFE_ARCHITECTURE.md`.

**Phase:** Final architecture review pass, immediately before the line-by-line Solidity review.
**Status:** READ-ONLY decision report. No Solidity is written, nothing is implemented, Sale V1 and
the frontend are untouched, nothing is deployed. The objective is to **freeze the referral
architecture** so the Solidity review can proceed without re-opening it.

**Grounding (actual current artifacts, no assumptions):**
- `docs/proposals/drafts/SyndicateSaleV2.draft.sol` — the live draft (`buy()`, `claimV1Membership()`,
  `claimReferral()`, the `Routed` / `ReferralAttributed` / `ReferralClaimed` events).
- `docs/REVENUE_ATTRIBUTION_LAYER.md` — RAL doctrine (Attribution schema, split rules, payout pattern).
- `docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.1 — names the writer as a `CommissionRouter` contract
  called by `MembershipSaleV2` / `ArchiveSaleV2` / future B2B wrappers.
- `docs/proposals/SALE_V2_ARCHITECTURE_AND_CONTRACT_DESIGN.md` §D (referral), §G (threats T7/T8),
  §H4 (tests), J5/J6.

> **Terminology lock used throughout this report:** the user's **"CommissionRouter"** is the same
> object doctrine calls the **RAL contract** — a dedicated, shared attribution+routing contract that
> every revenue-generating contract calls. "Inline" = the referral logic living permanently inside
> Sale V2's `buy()`, as it does in the current draft.

---

# Part 1 — Current V2 referral flow (from the actual draft)

The canonical money path the founder drew —
**Buyer → Sale V2 → Vault → Liquidity → Referrer → Operations** — is exactly the INTERACTIONS
ordering inside `buy()`. Here is every step, with no assumptions.

### 1.1 How a referral link becomes a referrer *address*
**Entirely off-chain.** The contract has **no** concept of a link, code, or campaign. The
(simulated) `/referral` route builds a shareable URL that carries a wallet **address**; the buy UI
reads it and passes it as the `referrer` argument. On-chain, the only referral input is a raw
`address`. There is no `CampaignRegistry`, no `refTag`, no code→address mapping in the draft.

### 1.2 How the address reaches the contract
As a direct parameter of the purchase call:
`buy(uint256 usdcIn, address referrer, uint256 minSynOut, bytes32[] v1Proof)`. `referrer = address(0)`
means "no referrer." Attribution is **last-verified-referrer at point of sale** — whatever address
the buyer's tx carries. There is no retroactive attribution and (in V2) no buyer-confirmed override
field.

### 1.3 How the contract validates eligibility
One boolean, evaluated in `buy()`:
```
referralValid = referrer != address(0)        // a referrer was named
             && referrer != msg.sender         // T7: no self-referral
             && knownMember[referrer];          // referrer is a recognized member
```
`knownMember[x]` is true if `x` already bought in V2, **or** if `x` is a V1 member who registered via
`claimV1Membership(proof)` (a one-time, gasless-to-the-buyer Merkle self-registration that grants no
new seat and does not advance the seat counter — it exists precisely so V1 members can act as
referrers). If `referralValid` is false, `refAmt = 0` and Operations silently keeps the full 10%.

### 1.4 The split (referral is carved ONLY from Operations)
```
vaultAmt = usdcIn * 70 / 100;                 // 70% — never diluted
liqAmt   = usdcIn * 20 / 100;                 // 20% — never diluted
opsSlice = usdcIn - vaultAmt - liqAmt;        // exact remainder ≈ 10%
refAmt   = referralValid ? opsSlice / 2 : 0;  // fixed 5% of gross (half of Operations)
opsAmt   = opsSlice - refAmt;                 // Operations keeps the rest (5–10%)
```
Vault (70%) and Liquidity (20%) are **mathematically unaffected** by referrals. The referrer fee is a
fixed 5% of gross — there is **no tier table** in V2 (tiered/reputation boosts are explicitly V3/future).

### 1.5 When the payment occurs
In the **same `buy()` transaction**, under strict checks-effects-interactions. All state is written
first (seat assignment, `soldInEra`, per-address spend, totals), **then** funds move in this order:
1. Pull the **full** `usdcIn` into the contract (`transferFrom`).
2. `USDC → VAULT` (70%).
3. `USDC → LIQUIDITY` (20%).
4. `USDC → referrer` (5%) — **the contract pays the referrer directly**, never the Operations wallet afterward.
5. `USDC → OPERATIONS` (net 5–10%).
6. `SYN → buyer`.

The referrer is therefore paid **by the contract, atomically, at purchase time** — not by a later
sweep from Operations.

### 1.6 What happens if the referral payment fails
The push is wrapped so a bad referrer can **never block the buy** (threat T8 — Circle USDC can
blacklist an address, making `transfer` revert):
```
try USDC.transfer(referrer, refAmt) returns (bool ok) {
    if (!ok) { referralOwed[referrer] += refAmt; escrowed = true; }
} catch       { referralOwed[referrer] += refAmt; escrowed = true; }
```
On any failure the amount is **escrowed** to `referralOwed[referrer]` and the buy proceeds normally.
`opsAmt` was already computed net of `refAmt`, so Operations receives its reduced slice regardless
(the escrowed 5% is held by the contract for the referrer, not redirected to Operations). The
referrer later withdraws via `claimReferral()` (`nonReentrant`, reverts `NothingToClaim` if zero).
This push-then-escrow pattern is the doctrine-mandated way to support smart-contract / DAO referrers.

### 1.7 What events are emitted
- `ReferralAttributed(referrer, buyer, memberNumber, amount, escrowed)` — only when `refAmt > 0`;
  carries the escrow flag.
- `Routed(memberNumber, vault, liquidity, operations, referral)` — the deterministic money split.
- `Purchased(buyer, memberNumber, era, usdcIn, synOut, synPerUsdc, firstSeat)`.
- `ReferralClaimed(referrer, amount)` — on escrow withdrawal.
- `V1MembershipRecognized(member)` — if a V1 member was recognized in-flow or via `claimV1Membership`.

**Critically:** V2 does **not** emit the full RAL `Attribution{ source, campaign, token, gross, buyer,
referrer, tier, splits[5], paymentMode, attribution, refTag }` struct. It emits the **lean**
`Routed` + `ReferralAttributed` pair, which the indexer can project onto the RAL shape off-chain.
There is no on-chain `source`, `campaign`, `tier` snapshot, `refTag`, or buyer-override in V2.

---

# Part 2 — Inline referral (A) vs CommissionRouter (B)

**Option A** — referral logic lives permanently inside Sale V2 (the current draft).
**Option B** — Sale V2 calls an external, shared `CommissionRouter` (the RAL contract) which validates,
splits, pays, and emits the canonical `Attribution` event for *every* protocol sale.

Scored 1–10 (10 = better) **for the decision in front of us: shipping the first immutable
membership sale.** The same criteria are revisited protocol-wide in Part 3.

| Criterion | A — Inline | B — CommissionRouter | Notes |
| --- | :---: | :---: | --- |
| Security | **9** | 6 | A has no external call in the money hot path; B adds a cross-contract call (reentrancy/trust surface) and an immutable router address V2 must commit to before the router itself is proven. |
| Gas | **9** | 6 | A: a few transfers. B: extra external call + (if canonical) a larger `Attribution` emit per buy. |
| Audit complexity | **9** | 5 | A: one self-contained contract. B: two contracts + their interface + the trust assumptions between them, all before first launch. |
| Maintainability | 5 | **9** | Inline logic is frozen by V2's immutability; a router centralizes tier/source logic in one upgrade-gated place. |
| Upgradeability | 3 | **9** | V2 inline = immutable forever. Router params (tier table, source allow-list) are governance-upgrade-gated without touching the sale. |
| Future protocol growth | 3 | **10** | One sale needs no router; six future revenue contracts do. |
| Legal clarity | 8 | 8 | Both keep "the contract pays, the referrer does not earn a return." B adds one consistent disclosure surface; A keeps V2's story minimal. Even. |
| Analytics | 6 | **10** | A relies on off-chain projection from lean events (workable). B emits canonical `source/campaign/refTag/splits[5]` natively. |
| Attribution tracking | 6 | **10** | A: address-only, flat 5%, last-verified. B: tier snapshot, buyer-override, multi-source, campaign tags. |
| Future integrations | 3 | **10** | A cannot serve Archive/B2B/affiliate/Sale V3. B is built for exactly that. |
| **Total** | **61** | **83** | A wins the *single-sale* sub-scores (security/gas/audit/launch-risk); B wins everything *multi-contract*. |

**Reading the scores.** This is not "A is bad / B is good." A decisively wins the four criteria that
govern **launching one immutable contract safely and soon** (security, gas, audit, and the implicit
launch-risk of not coupling to an unproven router). B decisively wins the six criteria that govern a
**multi-contract protocol over time**. The right answer therefore depends on *which contract* and
*when* — which is Part 3.

---

# Part 3 — Long-term protocol compatibility

Which architecture creates less technical debt, per surface:

| Surface | Inline-in-V2 (A) | CommissionRouter (B) | Debt verdict |
| --- | --- | --- | --- |
| **Sale V2** (membership, immutable, about to audit) | Self-contained, minimal surface, fastest to ship | Forces V2 to depend on an external router that must be audited and address-committed first | **A** — less debt for V2 itself |
| **Sale V3** (future market-conditions contract) | Would re-inline the same logic again (copy #2) | Plugs in as another `source` caller; no new referral code | **B** |
| **Archive1155** (artifact sales; proceeds to Archive owner) | Needs its own inline copy (copy #3), with different split routing | One router, `source = ARCHIVE_SALE`, consistent splits | **B** |
| **Patron Seal / future NFT sales** | Yet another inline copy | Config/source addition, no contract change | **B** |
| **SeatRecord721** (seat-as-NFT, future) | Inline again or no attribution | Router handles primary + (with marketplace) secondary attribution | **B** |
| **Marketplace** (secondary, royalties) | No shared attribution to hook into | Router is the natural home for secondary-sale attribution + royalty splits | **B** |
| **Signal Chamber** (signals; reads EVENTS) | Must read N different event shapes | Reads ONE canonical `Attribution` shape | **B** |
| **AI Layer** (analytics/agents over revenue) | Stitches heterogeneous per-contract events | One immutable, uniform attribution stream | **B** |
| **B2B campaigns** (`source = BD_NETWORK/WHITELABEL`) | Impossible without new contracts each time | Governance-gated `source` allow-list, zero contract change | **B** |
| **Affiliate programs** (`source = AFFILIATE`) | New inline logic per program | Namespace already reserved in the RAL schema | **B** |
| **Future revenue sharing** (`SPONSORSHIP/TREASURY_DEAL`) | New contracts each time | Reserved sources; config-only | **B** |

**Verdict.** For **one** contract (V2), inline is less debt. For the **other ten** surfaces, a shared
CommissionRouter is dramatically less debt — inline would mean re-implementing, re-auditing, and
re-indexing attribution logic for every new revenue contract, and leaving Signal Chamber / AI Layer /
Treasury Ledger to reconcile a zoo of incompatible event shapes. The roadmap is unambiguously a
**multi-source** future, and multi-source is exactly the problem CommissionRouter exists to solve.

---

# Part 4 — Revenue Attribution Layer doctrine, revisited

The RAL doctrine and the Unified Map already answer the ownership question — and they are consistent
with each other:

- **Should Sale V2 own referral logic?** For its **own** sale, yes — temporarily. V2 is a single,
  immutable, membership-only contract; inlining a fixed-5% referral with RAL-compatible lean events
  is the doctrine's stated V1/V2 posture ("RAL contract deferred"; "tiered boosts = V3/future").
- **Should CommissionRouter own attribution logic?** Yes — as the **protocol-wide** standard. Unified
  Map §2.1 literally assigns the writer as "`CommissionRouter` smart contract, called by
  `MembershipSaleV2` / `ArchiveSaleV2` / future B2B wrappers." It is the canonical home of the
  `Attribution` event, the tier table, the source allow-list, and push-then-escrow payout.
- **Should both exist?** **Yes — but not simultaneously coupled.** V2 ships inline; CommissionRouter
  is introduced with the first *additional* revenue contract and becomes the standard from then on.
  V2 remains a **legacy inline source** whose lean events the indexer maps onto the RAL `Attribution`
  shape. No attribution history is lost or rewritten.
- **Should one be deprecated?** No deprecation now. V2's inline logic is never "removed" (it's
  immutable); it is simply **superseded going forward** by the router for all new contracts.

**Cleanest architecture (the doctrine's own design, made explicit):**
1. Sale V2 keeps inline referral, with the lean `Routed` + `ReferralAttributed` events **deliberately
   shaped to project onto the RAL `Attribution` schema** off-chain. (Already true in the draft.)
2. The **only** forward commitment V2 needs to honor is the one doctrine already names: the
   `Attribution.source` is a governance-gated `bytes32` allow-list — so B2B/white-label/affiliate
   expansion is a config change, never a contract migration. V2 doesn't implement this; it just must
   not contradict it. It doesn't.
3. CommissionRouter (the RAL contract) is built **with** Archive1155 / Sale V3 — the moment a *second*
   revenue source exists — and every revenue contract from that point calls it.

---

# Part 5 — Future migration risk

### If we launch V2 with inline referrals (the draft):
- **What becomes difficult later?** Almost nothing structural. The only thing you can never do is
  *enrich V2's own on-chain referral* (add tiers, campaign tags, buyer-override, or a `source` field
  to V2 itself) — V2 is immutable. But V2 is membership-only and those features are explicitly V3+.
- **What can remain unchanged?** Everything in V2. Vault/Liquidity/Operations destinations, the
  70/20/10 split, the fixed-5% referral, the escrow fallback, and the lean events all stay as audited.
- **What requires migration?** **No migration of V2.** When CommissionRouter ships, V2 continues
  untouched as a legacy source; the indexer adds a small adapter mapping V2's lean events to the RAL
  `Attribution` shape so historical membership referrals appear in the same analytics as router-era
  sales. That adapter is off-chain work, not a contract migration.

### If we launch V2 already wired to CommissionRouter:
- **What complexity is added today?** A second contract must be designed, written, audited, and
  address-committed **before** the membership sale can launch; V2 gains an external call in its money
  hot path (reentrancy/trust surface, more gas, more audit scope); and the first immutable sale's
  safety now depends on a brand-new router being correct. This materially raises launch risk and
  delays the membership sale for features no single-source membership sale needs yet.
- **What future work disappears?** The off-chain V2→RAL adapter, and you would never write inline
  referral logic again. Real, but small relative to the risk of gating the *first* sale on an
  unproven shared router.

**Asymmetry:** launching inline costs a tiny, well-understood off-chain adapter later. Launching
router-coupled costs audit scope, gas, attack surface, and schedule **on the first immutable
contract** — the worst possible place to absorb new risk.

---

# Part 6 — Recommendations by role

- **Founder.** Ship the membership sale clean and soon. Keep V2 inline; it is the simplest thing that
  is correct and the trust story is airtight ("the contract pays, the referrer earns no return").
  Commit publicly to CommissionRouter as the standard for everything after V2. Reframe the simulated
  `/referral` tiered preview to fixed-5% before V2 goes live (marketing/frontend, not a contract change).
- **CTO.** Do not couple the first immutable contract to an unaudited router. Inline for V2 is the
  smaller, faster, safer audit. Build CommissionRouter as its own audited contract alongside
  Archive1155 / Sale V3, with the `Attribution` schema and source allow-list from doctrine.
- **Security reviewer.** Inline keeps `buy()`'s external surface to plain ERC-20 transfers under
  `nonReentrant` + CEI, with the proven push-then-escrow guard (T7/T8 covered). A router adds a
  cross-contract call and a trust dependency into the value path. Prefer inline for V2.
- **Economist.** Referral economics are identical either way (5% of gross from Operations only;
  Vault/Liquidity never diluted). The router adds **future** value (tiered incentives, campaign ROI
  measurement, multi-source attribution) that a single membership sale cannot exploit yet. No economic
  reason to pay that cost on V2.
- **Growth lead.** Tiers, campaigns, and affiliate/B2B programs are the growth unlock — and they all
  live in CommissionRouter, not in an immutable membership sale. Inline V2 loses nothing growth needs
  *today*; the router is where growth gets built *next*.
- **Protocol architect.** The doctrine already is the answer: lean RAL-compatible events in each
  early sale now, one shared `CommissionRouter` owning canonical attribution as soon as there is more
  than one revenue source. V2 is the last contract that should be inline; everything after is a router
  client.

### ONE final recommendation (no fence)
**A — keep referrals inline inside Sale V2.** Ship the membership sale exactly as drafted. Then make
**CommissionRouter (B) the protocol-wide standard from the very next revenue contract** (Archive1155 /
Sale V3) onward. In one sentence: *the protocol's final referral architecture is CommissionRouter, and
the correct place to introduce it is the second revenue source — never retrofitted into the first
immutable sale.* Choosing inline for V2 is **not** a vote against the router; it is the precondition
for launching the router safely later, because V2's lean events are already RAL-shaped.

---

# Part 7 — Impact on the Solidity review

**"Sale V2 Solidity draft can proceed to line-by-line review unchanged."**

Why, exactly:
1. The recommendation is **A (inline)**, which is precisely what the draft already implements — fixed
   5% from Operations only, `knownMember` eligibility, push-then-escrow, lean RAL-compatible events.
   Nothing in the recommendation calls for a contract change.
2. Introducing CommissionRouter is **future work on a separate contract**; it requires **zero**
   modification to the V2 draft. V2's only obligation to that future is to not contradict the RAL
   schema's governance-gated `source` allow-list — and it doesn't (it simply doesn't emit a `source`,
   which the indexer supplies as `MEMBERSHIP_SALE`).
3. Deliberately **do not** add `source` / `refTag` / `tier` / buyer-override fields to V2 to "future-
   proof" it. They would enlarge an immutable contract for a system that will supersede V2's logic
   anyway, and they expand audit scope for no V2-era benefit. The lean events + off-chain adapter are
   the correct, lower-risk bridge.

The **only** referral-related follow-up is non-contract and out of this phase's scope: reframe the
simulated `/referral` tiered marketing preview to the fixed-5% reality before launch (frontend), and
plan the off-chain V2→RAL event adapter for when CommissionRouter ships. Neither blocks the Solidity
review.

**Referral architecture is hereby frozen: inline in Sale V2; CommissionRouter as the standard for all
subsequent revenue contracts. The draft is review-ready as-is.**

---

*This document is advisory and read-only. It modifies no protocol code, configuration, or canon, and
makes no deployment.*
