# 07 — FOUNDER PRINCIPLE (Approved Direction, Not Implemented)

Status: **binding intent · NOT IMPLEMENTED.** This file records strategic
direction the founder has approved but that is deliberately *not built yet*. It
is the opposite-altitude sibling of `docs/DEFERRED_WORK_LEDGER.md`: the ledger
tracks tactical engineering deferrals (a known surface, a concrete fix); this
file holds founder-level *concepts and direction* before they have code,
contract, or UI.

> The One Rule still applies: on-chain truth wins. Nothing here is current truth,
> and nothing here overrides code, contracts, or the canon precedence law in
> `00_AUTHORITY_MAP.md`.

---

## Why this file exists

The Syndicate will likely exist longer than any single chat, audit, sprint, or
developer. Many ideas discussed by the founder are intentionally not implemented
immediately.

This file prevents:

- re-brainstorming solved ideas
- losing strategic direction
- creating parallel architectures
- rebuilding the same concept under different names
- forgetting why a system was originally proposed

---

## Status of everything in this file

**APPROVED DIRECTION — but NOT IMPLEMENTED.**

Items here are sanctioned destinations, not work orders. An item carries no
implementation authority until it is lifted out of this file into a real plan
(and, for engineering-ready work, into `DEFERRED_WORK_LEDGER.md`).

---

## What this file never overrides

Nothing in this file overrides the canonical chain:

```
TRUTH → EVENTS → SIGNALS → MEMORY → STORY
```

(the five-layer architecture frozen in `05_FOUNDATION_FREEZE.md`). Any future
implementation must still pass the canonical architecture rules: it occupies
exactly one layer and obeys 05's Adjacency Law (including its sanctioned
exceptions), and it defers to the precedence law. An approved direction that
cannot be placed in the five-layer model is not yet ready to build — it is still
a concept, not a plan.

---

## How to use this file

- **Add** an item when the founder approves a direction that is *not* being built now.
- **Each item must record:** the idea (one line) · why it was proposed (the intent it serves) · which layer it would occupy (Truth / Events / Signals / Memory / Story) · what it must never become (the guardrail) · what must be true before it is built (prerequisite).
- **Never** duplicate an item that already lives in `docs/DEFERRED_WORK_LEDGER.md`. If an approved direction matures into a concrete, surface-level engineering task, move it to the ledger and link back here for the *why*.
- **Remove** an item only when it ships (link the commit) or is formally retired (say why it was dropped).
- This file is authoritative-by-convention and is **not** machine-enforced by the doctrine guard today (same decoupling noted in `00`/`05`).

---

## Relationship to the other future-direction records

Future direction is recorded in a few places; this file is the **strategic front
door** for it. Keep them one system, never parallel ones:

- **Bucket 12 — Future Modules** in `00_AUTHORITY_MAP.md` (Referral · Reward ·
  Burn · Governance · SeatRecord721): the *catalog* of unbuilt modules and their
  PENDING / FUTURE status. This file holds the *why / intent* behind approving any
  of them.
- **`05_FOUNDATION_FREEZE.md` future-systems list** (Signal layer, Recognition,
  Reporting, Patron evolution, SeatRecord721, Governance, Marketplace, AI): the
  *layer* each future system must occupy. 05 says *where it must plug in*; this
  file says *whether and why* the founder approved the direction.
- **`docs/DEFERRED_WORK_LEDGER.md`**: *tactical* engineering deferrals only. A few
  pre-existing rows there are strategic-altitude (e.g. "Referral / invite / reward
  system") and are **grandfathered**; new founder-approved strategic direction is
  recorded here, and an item graduates here → ledger once it has a concrete surface
  and fix.

---

## Approved direction (not implemented)

> Empty register. No approved-but-unbuilt directions have been recorded yet.
> Add them below using the format in *How to use this file*.

| Idea | Why proposed (intent) | Layer | Must never become | Prerequisite |
|---|---|---|---|---|
| _(none yet)_ | | | | |
