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

| # | Idea | Why proposed (intent) | Layer | Must never become | Prerequisite |
|---|---|---|---|---|---|
| **FS-1** | **Future Signal Engine — source taxonomy** (evaluate signals grouped as Financial / Protocol / Memory Trace — detail below) | Let the protocol grow *more interpretive without new truth*: Signals answer "why does this matter?" over facts that already exist, feeding richer recognition / curation / reports | **SIGNALS** (interpretation over EVENTS; `05` §3) | a reward / score / leaderboard; a new store of truth; a layer that *replaces* the event it reads | `05`'s SIGNALS leaf built first (`signalType()` / `signalTier()`); **+ resolve the Memory-Trace adjacency question (FS-1 below)** |

---

### FS-1 · Future Signal Engine — source taxonomy

**Approved direction.** The Future Signal Engine should eventually evaluate signals from
three groupings of *existing* protocol facts:

| Trace | Approved sources (founder) | Maps to frozen Signal Type(s) — `05` §3.2 | Reads from |
|---|---|---|---|
| **Financial Trace** *(economic-participation facts; cf. the Financial Trace record of `06` / `08` — see note)* | purchases · burns · support actions · artifact mints | Participation · Conviction (burn) · Support | EVENTS |
| **Protocol Trace** | referrals · chapter participation · milestone participation · protocol-growth participation | Growth (referral — FUTURE) · Structural | EVENTS |
| **Memory Trace** | Chronicle appearances · historical firsts · Proof of Fire · recognition milestones | Historic · Timing · Conviction | EVENTS for firsts + Proof of Fire; **MEMORY for Chronicle appearance / recognition milestone — see open question** |

**On the word "Trace".** These three Traces are *signal-source groupings* — how the future
engine **reads** facts for meaning — not the same object as the **Financial Trace data
record** in `06` / `08` (a member's economic-participation fields). They overlap but
classify differently: a **referral** is a future *field* of the economic Trace record in
`06` / `08`, yet here it sits under **Protocol Trace**, because its *signal meaning* is
**Growth**, not money. Same underlying fact — grouped by record-membership in `06` / `08`
vs by signal-meaning here. Where they coincide (purchases, burns, mints) both agree.
FS-1's taxonomy is the founder's latest and governs *signal grouping*; `06` / `08`
continue to govern the *Financial Trace data record*.

**The doctrine (founder):** *Signals explain "why does this matter?" without replacing the
underlying truth. The Signal layer is interpretation; the Event layer remains the source
of truth.* This is exactly `05` §2 (the Adjacency Law — SIGNALS consume EVENTS) and §3.1
(a Signal is a classified event annotated with Tier × Type). The engine **derives**
interpretation from facts that already exist; it invents no new store (`08`).

**Guardrails (carried from `05` §3–§4, unchanged):** monetary size never raises a tier; a
Signal grants nothing (no reward, right, identity, or yield); the three Traces are *source
groupings*, not new architectures — they fold into the frozen seven Signal Types, never
beside them.

**Open question — Memory-Trace adjacency (founder decision required).** Two Memory-Trace
sources — **Chronicle appearance** and **recognition milestone** — live in the MEMORY
layer, which sits *downstream* of SIGNALS in `05`'s chain
(TRUTH → EVENTS → SIGNALS → MEMORY → STORY). Evaluating them as signal inputs would have
SIGNALS read MEMORY, which the Adjacency Law does **not** currently sanction (its one
carve-out is MEMORY ingesting EVENTS, not the reverse). Before FS-1 is built, choose one:
(a) compute these at the MEMORY layer as Recognition, not as Signals; (b) re-express the
underlying fact as an EVENT the Signal layer can read; or (c) ratify a new, explicit
Adjacency carve-out in `05`. **Do not silently let SIGNALS read MEMORY.** *(The same
tension already exists in `05` §3.2's "Historic" type, which is sourced from Chronicle —
resolve both together.)*
