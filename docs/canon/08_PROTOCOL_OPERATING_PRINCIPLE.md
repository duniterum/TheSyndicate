# 08 — PROTOCOL OPERATING PRINCIPLE (Derive, Don't Invent)

Status: **binding · constitutional.** Companion to `05_FOUNDATION_FREEZE.md`. Where
05 freezes *what the layers are* and 06 freezes *one danger* (money ≠ prestige), this
file states the single operating principle behind both:

> **The protocol should always be capable of becoming more intelligent without
> rebuilding itself.**

> The One Rule still applies: on-chain truth wins. This principle constrains *how we
> build on top of* truth; it never overrides code, contracts, or the precedence law in
> `00_AUTHORITY_MAP.md`.

---

## The principle

**Whenever possible: derive — instead of invent.**

New capability should emerge from *re-reading the truths the protocol already has*,
not from standing up new stores of truth beside them. New intelligence is new
**insight over existing truth**, never a new **database of duplicated truth**.

```
existing truths → new insights      ✅  (derive)
new databases   → duplicated truths  ✗  (invent)
```

This is the *why* behind 05's Adjacency Law and its anti-drift rulings — #8 (duplicated
metrics), #9 (duplicated event logic), #14 (parallel architecture for a new module). 05
is the **mechanism**; this file is the **principle** it enforces. A system that obeys
05's layers but still stands up a parallel store of an existing fact has violated this
principle.

---

## Derivation map (every higher system derives from lower truth)

The protocol's existing systems already obey this — each is a *projection* of the
layer(s) beneath it, not a new source of fact:

| System | Derives from | Layer (05) | Status |
|---|---|---|---|
| **Recognition** | a member's meaningful signals (S2+ person-signals) | MEMORY ← SIGNALS | PARTIAL · Signal layer FUTURE |
| **Chronicle** | *meaningful* signals (curated, protocol-subject / S3+) | MEMORY ← SIGNALS | PARTIAL / curated |
| **Financial Trace** | purchases, burns, mints, referrals, wallet history | MEMORY ← EVENTS / TRUTH | see status note |
| **Reports** | Activity, Recognition, Chronicle, Ledger | MEMORY (rollup) | PENDING |
| **Member Journey** | the member's own protocol history | STORY ← MEMORY | PENDING |

**Status note — truth-labeling survives derivation.** Deriving a view never upgrades
the status of its inputs. A Financial Trace is only as live as its weakest source:
purchases LIVE, token burn LIVE (Proof of Fire), NFT mints PARTIAL, **referral
FUTURE / PENDING**, wallet history LIVE-read. Every derived surface must still carry
the weakest input's status pill (LIVE / PARTIAL / PENDING / FUTURE). Derivation changes
*where insight comes from*, never *what may be claimed as true* — "don't trust, verify"
still holds.

**Definition note — current vs. expanded Trace.** The *currently frozen* Financial
Trace is the sale-derived, all-LIVE definition in
`06_FINANCIAL_TRACE_AND_GUARDRAILS.md` §1 (cumulative USDC, purchase count, first / last
block, routing). The burns / mints / referrals / wallet-history inputs in the row above
are the founder's **approved expansion** of the Trace — approved direction, not all wired
today. 06 §1 stays the binding definition until the expansion is built; this file does
not authorize the new inputs into the Trace today.

---

## How to apply (the build-time test)

Before building any new system, ask — in this order:

1. **What existing truth or layer can this derive from?** (TRUTH → EVENTS → SIGNALS → MEMORY → STORY.)
2. Only if nothing upstream can supply it: **what genuinely new truth must be captured, and at which single layer does it enter?**
3. **Never** create a second store of a fact that already exists upstream. If two systems need the same fact, both *derive* it from the one source — neither persists its own copy.

If a proposed system can exist only by duplicating an upstream truth into a new
database, it is misplaced: re-home it as a derivation, or it does not get built.

---

## Relationship to the canon

- `05_FOUNDATION_FREEZE.md` — the layers + Adjacency Law this principle rides on.
- `06_FINANCIAL_TRACE_AND_GUARDRAILS.md` — the Financial Trace, the worked example of derive-don't-invent for economic data.
- `07_FOUNDER_PRINCIPLE.md` — approved-but-unbuilt direction; every item there must satisfy this principle before it is built.

Authoritative-by-convention; not yet machine-enforced by the doctrine guard (same
decoupling noted in `00` / `05`).
