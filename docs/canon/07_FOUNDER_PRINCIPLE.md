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
| **FS-1** | **Future Signal Engine — source taxonomy** (evaluate signals grouped as Financial / Protocol / Memory Trace — detail below) | Let the protocol grow *more interpretive without new truth*: Signals answer "why does this matter?" over facts that already exist, feeding richer recognition / curation / reports | **SIGNALS** (interpretation over EVENTS; `05` §3) | a reward / score / leaderboard; a new store of truth; a layer that *replaces* the event it reads | `05`'s SIGNALS leaf built first (`signalType()` / `signalTier()`); **+ any Memory-derived fact re-expressed as an EVENT first (founder ruling — `05` §2.1; FS-1 below)** |
| **FS-2** | **Dedicated RPC + lightweight event indexer** (keyed Avalanche RPC provider + a normalized event-projection store/API the frontend reads — detail below) | Scale beyond browser-RPC / explorer / cached reads: serve fast, normalized reads for every current + future event source from our own API, while on-chain stays the only truth | **TRUTH → EVENTS infrastructure** (a read/ingest + normalized projection feeding the EVENTS layer; not a new layer in the five-layer model) | a claimed source of truth; a substitute for on-chain verification; a store whose values may override or contradict a chain read — explorer links stay the verification layer | Keyed RPC provider chosen; indexer/API + normalized event schema designed across the sources listed below (FS-2) |
| **FS-3** | **Public Member Profile Pages** (human-facing member URLs like `/member/27`, projected from the holder index, wallet verification preserved — detail below) | Give every member a clean, shareable *human* identity surface addressed by founder number rather than a raw `0x` address — the page you send to a person, while the wallet page stays the page you send to a skeptic | **Identity projection** (read-only projection over the EVENTS-derived holder index; not a new layer in the five-layer model) | a profile with fabricated / off-chain identity (bios, handles, avatars); a wealth leaderboard; a surface whose values bypass on-chain verification | holder index (LIVE) — **minimal route shipped this wave**; richer enrichment (embedded activity / artifacts / Chronicle, certificates) remains future (see FS-3 detail) |
| **FS-4** | **Genesis Seat Certificates** (future evolution of the share card: Member #N · Chapter · Rank · Verified on Avalanche · permanent public URL · shareable image — detail below) | A premium, permanent, shareable identity artifact per member — the membership card matured into a certificate | **Identity projection / MEMORY render** (render over the holder index + a permanent `/member/N` URL; not a new truth layer) | a tradable / transferable asset implying value; a certificate of return or equity; an artifact conflated with the verifiable seat (cf. **Artifact ≠ Seat**, `SeatRecord721` doctrine) | FS-3 permanent `/member/N` URLs (minimal LIVE); richer card / certificate design; **must not imply a `SeatRecord721` NFT until that contract ships** |
| **FS-5** | **Protocol Search** (search by member number · wallet · chapter · rank — detail below) | One fast entry point to find any member or cohort across the protocol, built on indexed data | **TRUTH → EVENTS infrastructure consumer** (a query surface over FS-2's normalized projection; not a new layer) | a sort-by-wealth leaderboard; a search that surfaces fabricated / off-chain identity; a claimed source of truth over the chain | **FS-2** indexer / API (search needs indexed data to scale past the per-browser RPC scan) |
| **FS-6** | **Protocol Timeline** (clean historical timeline: joins · burns · artifacts · chapter moments · verified milestones — detail below) | A legible living-history view of the protocol — supports the TV-series / living-history vision | **MEMORY** (chronology overlay over EVENTS; obeys `05` Adjacency Law + the chronology doctrine — verified-block ordering only) | a curated-for-marketing or fabricated timeline; an ordering by anything but verified block; a wealth narrative | EVENTS + chronology layer (registry exists); a completeness flag for true "firsts"; **FS-2** for full historical coverage at scale |

---

### FS-1 · Future Signal Engine — source taxonomy

**Approved direction.** The Future Signal Engine should eventually evaluate signals from
three groupings of *existing* protocol facts:

| Trace | Approved sources (founder) | Maps to frozen Signal Type(s) — `05` §3.2 | Reads from |
|---|---|---|---|
| **Financial Trace** *(economic-participation facts; cf. the Financial Trace record of `06` / `08` — see note)* | purchases · burns · support actions · artifact mints | Participation · Conviction (burn) · Support | EVENTS |
| **Protocol Trace** | referrals · chapter participation · milestone participation · protocol-growth participation | Growth (referral — FUTURE) · Structural | EVENTS |
| **Memory Trace** | Chronicle appearances · historical firsts · Proof of Burn · recognition milestones | Historic · Timing · Conviction | **EVENTS only.** Firsts + Proof of Burn are events; Chronicle appearance / recognition milestone must be **re-expressed as EVENTS first** (founder ruling — `05` §2.1). SIGNALS never read MEMORY. |

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

**Guardrails (carried from `05` §3–§4):** *person-subject* monetary size never raises a tier into
permanent prestige — the precise scope is `05` §4.5: *protocol-subject* economic milestones (Vault /
Liquidity / USDC-routed / SYN-sold thresholds, chapter sealed) **may** be S3+, while person-subject
money alone stays Financial Trace / Participation Depth and may carry a magnitude marker (outside the
Signal layer). A Signal grants nothing (no reward, right, identity, or yield); the three Traces are
*source groupings*, not new architectures — they fold into the frozen seven Signal Types, never
beside them. Repeated buying / continued participation is **Participation Depth, not Conviction**
(`05` §4.5 Rule D); Conviction stays reserved for irreversible actions (Proof of Burn / burns).

**Resolved — founder ruling (`05` §2.1).** The Memory-Trace adjacency question is
**closed: no carve-out. SIGNALS read EVENTS only and must never read MEMORY.** Chronicle
appearance and recognition milestone are **MEMORY outputs, not Signal inputs** — decision
**(b)**: if a future Signal needs such a fact, *re-express its underlying source as an
EVENT* and derive the Signal from that EVENT. Correct flow **EVENT → SIGNAL →
RECOGNITION / CHRONICLE**; forbidden flow **MEMORY → SIGNAL** (it would make the
architecture circular). The same resolution applies to `05` §3.2's **Historic** type: it
derives from the originating EVENT, never by reading Chronicle.

---

### FS-2 · Dedicated RPC + lightweight event indexer

**Approved direction.** Current browser-RPC / explorer / cached reads are acceptable for
V1 but are not the best scalable architecture. For **V1.5 / V2**, move toward a **keyed
Avalanche RPC provider** plus a **lightweight indexer / API** that stores **normalized event
projections (read models)**, so the frontend reads fast indexed data from our own API while
**explorer links remain the verification layer**. The indexer is a *projection*, not the
canonical EVENTS layer — on-chain logs remain the events of record.

**Event sources to normalize (current + future):**

- Sale V1
- Sale V2 *(future)*
- Archive mints
- burns
- LP / liquidity
- Referral / CommissionRouter *(future)*
- SeatRecord721 *(future)*
- Marketplace *(future)*
- Signal Chamber *(future)*
- AI layer *(future)*
- Cross-chain *(future)*

**Goal.** The frontend reads fast, normalized indexed data from our own API; the public
explorer (Snowtrace / Avascan / Routescan / Sourcify) remains the **independent
verification layer**. "Don't trust, verify" is preserved — the indexer is a performance
*projection* over on-chain truth, never a substitute for it.

**Where it sits in the architecture.** This is infrastructure *beneath* the five-layer
model: a **TRUTH → EVENTS** read/ingest path. The keyed RPC is how we *read* TRUTH; the
indexer is a *normalized projection* that feeds the **EVENTS** layer. It introduces no new
layer and must obey `05`'s Adjacency Law for anything built on top of it.

**Guardrail (doctrine — `00_AUTHORITY_MAP.md` precedence).** On-chain truth wins. The
indexer may make reads fast and normalized, but it must **never**: (a) become a claimed
source of truth, (b) let an indexed value override or contradict a chain read, or (c)
remove the per-fact explorer verification link. Every surface fed by the indexer must
still resolve to an on-chain read or be labeled **PENDING**.

**Status:** APPROVED DIRECTION — **NOT IMPLEMENTED.** Do not build yet. Graduate to
`docs/DEFERRED_WORK_LEDGER.md` (and link back here for the *why*) only once it has a
concrete surface + fix — e.g. chosen RPC provider, indexer/API contract, and the
normalized event schema for the sources above.

---

### FS-3 · Public Member Profile Pages

**Approved direction.** Give every member a human-facing identity URL addressed by
**founder number** — `/member/27` — instead of a raw `0x` address. The page is a
**read-only projection of the same holder index** that powers `/wallet/$address` and the
Member Wall; it introduces no new truth and no off-chain identity.

**Division of labour (intentional — do not blur).**
- `/member/N` — the *human* surface. "Who is Member #27?" Recognition only: number,
  chapter, rank, SYN received, the share card. The page you send to a person.
- `/wallet/$address` — the *verification* surface. Full purchase trail, 70/20/10 routing
  totals, eligibility flags, live balance. The page you send to a skeptic.

**Hierarchy (founder).** Member #N → chapter / Genesis status → rank → Verified on
Avalanche → short wallet address + explorer link → seat proof / share card → activity /
artifacts / Chronicle *if already available* → link to full wallet intelligence. The full
`0x` address is never the main visual element; the short address links out to the explorer
and the wallet page.

**Guardrails.** No bios, no handles, no avatars, no fabricated identity. Never a wealth
leaderboard or sort-by-contribution. Rank stays recognition only. Every claim resolves to
an on-chain read or is labeled PENDING; the explorer + wallet page remain the verification
layer.

**Status:** **MINIMAL ROUTE SHIPPED.** `/member/$number` is live (hero, chapter, rank, SYN
received, the share card preferring the `/member/N` URL, seats-around context, and verify
links to the wallet page + Avascan). The Member Wall search + tiles and the share cards on
`/wallet` and `/my-syndicate` now prefer `/member/N`. **Richer enrichment remains FUTURE:**
embedded activity / artifacts / Chronicle, a per-member OG image, and the certificate
evolution (FS-4). Graduate each to `docs/DEFERRED_WORK_LEDGER.md` when it gains a concrete
surface.

---

### FS-4 · Genesis Seat Certificates

**Approved direction.** Mature the share card into a **Genesis Seat Certificate** — a
premium, permanent, shareable identity artifact: **Member #N · Chapter · Rank · Verified on
Avalanche** — with a permanent public URL (`/member/N`, FS-3) and a shareable image.

**Where it sits.** A render / projection over the holder index + the permanent `/member/N`
URL. Not a new truth layer; not (yet) an on-chain artifact.

**Guardrail (doctrine).** A certificate is **recognition, not value**. It must never become
a tradable or transferable asset, imply return / equity / yield, or be conflated with the
verifiable seat itself (**Artifact ≠ Seat**). It must **not** imply a `SeatRecord721` NFT
until that contract actually ships (cf. `05` future-module doctrine). Verification stays
on-chain.

**Status:** APPROVED DIRECTION — **NOT IMPLEMENTED.** The current share card (FS-3) is the
seed; the certificate is its future evolution.

---

### FS-5 · Protocol Search

**Approved direction.** One fast search entry point across the protocol: by **member number
· wallet · chapter · rank**, built on top of **future indexed data** (FS-2).

**Where it sits.** A query surface / consumer of FS-2's normalized event projection — not a
new layer in the five-layer model, and never a source of truth over the chain.

**Guardrail.** Never a sort-by-wealth leaderboard; never surfaces fabricated or off-chain
identity; results resolve to on-chain reads or are labeled PENDING. (The Member Wall search
already resolves member number / wallet against the live holder index today; FS-5 is the
*scaled* version over the indexer.)

**Prerequisite.** **FS-2** — search needs indexed data to scale beyond the per-browser RPC
scan.

**Status:** APPROVED DIRECTION — **NOT IMPLEMENTED** (depends on FS-2).

---

### FS-6 · Protocol Timeline

**Approved direction.** A clean, legible **historical timeline** of the protocol: **joins ·
burns · artifacts · chapter moments · verified milestones.** This supports the TV-series /
living-history vision.

**Where it sits.** **MEMORY** — a chronology overlay over EVENTS. It obeys `05`'s Adjacency
Law and the **chronology doctrine**: ordering is by **verified block only**; a tx proves
existence, not order; only the verified path carries a date. True protocol-wide "firsts"
stay gated behind a completeness flag (cf. windowed-first-claims doctrine).

**Guardrail.** Never a curated-for-marketing or fabricated timeline; never ordered by
anything but verified block; never a wealth narrative. Every entry resolves to an on-chain
event or is labeled PENDING.

**Prerequisite.** EVENTS + the chronology layer (registry exists); a completeness flag for
true firsts; **FS-2** for full historical coverage at scale.

**Status:** APPROVED DIRECTION — **NOT IMPLEMENTED** (depends on FS-2 + chronology
completeness).
