# Protocol Chronicle — Final Readiness Review (Pre-Phase-1)

Constitutional review of the four proposed day-one Chronicle entries. No code. No implementation. The purpose of this pass is to verify that every entry is **protocol history**, not member, seat, founder, activity, or personal history — and to lock the final wording before Phase 1 begins.

Doctrine treated as fixed: Chronicle Doctrine, Chapter Sealing Doctrine, Continuity Doctrine, MVP Execution Spec §D (selection gate).

---

## Selection gate (re-stated)

An event becomes a Chronicle entry only if **all five** hold:

1. **On-chain anchor** — verifiable block + tx (or block range).
2. **Significance** — changes protocol state in a way future members must know.
3. **Permanence** — still true in ten years.
4. **Singularity** — happens once, or once per chapter.
5. **Voice fit** — describable in the protocol's first-person past/present-perfect voice without editorial framing.

Plus the **protocol-centricity test** added in this pass:

> **6. Protocol-centric, not member-centric.** The entry describes a change to the protocol. The subject is *the protocol*, not *a person*, *a wallet*, or *a seat number*.

Failing any one of the six rejects the entry.

---

## Entry-by-entry challenge

### 1. "Chapter I opened"

| Test | Verdict | Note |
|---|---|---|
| On-chain anchor | ✓ | Block of the first state change that defines Chapter I's opening (sale activation / first eligible block). |
| Significance | ✓ | Chapter I existing at all is the first protocol fact. |
| Permanence | ✓ | The fact that Chapter I opened on block N will be true in 10, 50, 100 years. |
| Singularity | ✓ | Singular by definition. Chapters open once. |
| Voice fit | ✓ | "Chapter I opened" — first-person plural natural. |
| Protocol-centric | ✓ | Subject is the chapter; the chapter is a property of the protocol. |

**Future-reader test (10y):** A reader in 2036 needs this entry to locate every subsequent fact. Without it, no later entry has temporal context.

**Precedent it creates:** Every future chapter gets an opening entry. Correct — this is the constitutionally required pattern.

**Verdict: KEEP. No wording change.**

---

### 2. "Member #1 joined" — aggressive challenge

This is the entry under the heaviest scrutiny. Run it against every framing:

#### Is this protocol history?
*Borderline.* The fact that **a first seat was claimed** is protocol history — it marks the transition from *Chapter I is open and empty* to *Chapter I has begun accumulating members*. The fact that **Member #1 is a specific wallet** is not protocol history; it is **seat history** (which belongs to that seat) and **member history** (which belongs to that wallet's own My Chronicle).

#### Is this seat history?
**Yes.** Member #1's seat record will permanently encode "joined at block N as the first seat of Chapter I." That belongs on the seat / wallet / My Chronicle surfaces, not in the protocol's Chronicle.

#### Is this founder history?
**Risk: yes, accidentally.** If the entry names a wallet, a member number, or anything member-identifying, it slowly becomes a "founder spotlight." Founder-coded language is banned by the Mythology gate (no honorary additions, no wealth-coded pride). Naming the first member in the protocol's own voice is a soft form of honour.

#### Is this Activity history?
**Yes, partially.** The transaction itself belongs in Activity as a purchase row. Activity already records it with proof.

#### Is this My Chronicle history?
**Yes.** Member #1's My Chronicle will have "First purchase — you are Member #1." That is the constitutional home for that fact.

#### Would Chronicle still work without this entry?
**Yes.** The chapter-open entry already establishes the chapter's start. The transition from *empty* to *non-empty* can be implied by the live header member count, the same way "two members" is implied today without entries for member #1 and #2 individually.

#### Would "The first seat was claimed" be more constitutional than "Member #1 joined"?
**Almost.** "The first seat was claimed" passes the protocol-centric test ("the seat" is a protocol primitive; "Member #1" is a person-coded identifier). But it still leans on a single-member event as a *Chronicle-grade transition*, and it sets a dangerous precedent: if the *first* seat earns a Chronicle entry, why not the *tenth*? *fiftieth*? *founders cohort closed*? The slippery slope is real.

#### Resolution

The protocol-centric reframing that survives is **not about the first seat** but about **the chapter's threshold**: the moment the chapter became *non-empty*. That can be expressed as a single line inside the Chapter I opened entry ("…and the first seat was claimed in the same chapter-opening window") **or** as a separate entry only if the gap between chapter-opening block and first-seat block is meaningfully large.

For day one, with two members already on-chain and the gap small, **fold the first-seat fact into Chapter I's opening entry**. Do not give Member #1 their own Chronicle entry.

**Verdict: REMOVE as a standalone entry. Fold the first-seat fact into Entry 1 (Chapter I opened) as a single sentence describing the chapter's first member-state transition.**

This preserves the *protocol fact* (chapter became non-empty) without elevating *a specific member* into Chronicle voice. Member #1's own permanent record lives — correctly — in their My Chronicle and on the future seat-record surfaces. Founder framing is avoided.

---

### 3. "First Signal became mintable"

| Test | Verdict | Note |
|---|---|---|
| On-chain anchor | ✓ | Deployment block of Archive1155 / ID 1 mint activation. |
| Significance | ✓ | Introduces the protocol's first public artifact. |
| Permanence | ✓ | The fact of unlocking is permanent regardless of subsequent mints. |
| Singularity | ✓ | An artifact unlocks once. |
| Voice fit | ✓ | "The first public artifact became mintable" — natural. |
| Protocol-centric | ✓ | Subject is the artifact, which is a protocol object. |

**Future-reader test (10y):** Needed to anchor the entire archive lineage. Without this entry, no later artifact entry has a "first" to refer back to.

**Precedent it creates:** Every artifact's *unlock* (not every mint) gets one entry. Correct — this is the doctrinal pattern.

**Verdict: KEEP. Minor wording change to emphasise *the artifact*, not the brand name, as subject (see §B).**

---

### 4. "Patron Seal became mintable"

| Test | Verdict | Note |
|---|---|---|
| On-chain anchor | ✓ | ID 3 activation block. |
| Significance | ✓ | Second artifact; first artifact-of-a-different-kind. |
| Permanence | ✓ | Same as First Signal. |
| Singularity | ✓ | One unlock per artifact. |
| Voice fit | ✓ | Natural. |
| Protocol-centric | ✓ | Subject is the artifact. |

**Future-reader test (10y):** Needed to establish that the archive is a *series*, not a single object. The existence of artifact two is what proves artifact one was not an isolated event.

**Precedent it creates:** Same as First Signal — only *unlocks* qualify, never individual mints.

**Verdict: KEEP. Same minor wording note as First Signal (see §B).**

---

## A. Final day-one Chronicle entry list

Three entries, oldest first:

1. **Chapter I opened.**
   The protocol's first chapter began, and the first seat within it was claimed in the same window.
   *Anchor:* opening block + first-purchase tx (both linked).

2. **The first artifact became mintable — First Signal.**
   *Anchor:* Archive1155 deployment block / ID 1 activation tx.

3. **A second artifact joined the archive — Patron Seal.**
   *Anchor:* ID 3 activation tx.

Total: **3 entries** for day one.

A fourth entry (e.g. "Liquidity pool created" or the first treasury threshold crossing) becomes eligible only when its on-chain anchor is independently verifiable and survives the gate. It is not part of day-one launch; it appears the moment it qualifies.

---

## B. Wording changes

| # | Was | Now | Rationale |
|---|---|---|---|
| 1 | "Chapter I opened" + separate "Member #1 joined" | **"Chapter I opened"** (single entry; first-seat fact folded into the body as one sentence) | Removes member-centric framing. Keeps the protocol fact that the chapter became non-empty. |
| 2 | "First Signal became mintable" | **"The first artifact became mintable — First Signal."** | Subject is *the artifact* (a protocol class), the brand name is the specifier, not the subject. Establishes the precedent that artifact entries describe the *class transition* (first, second, …), not the brand. |
| 3 | "Patron Seal became mintable" | **"A second artifact joined the archive — Patron Seal."** | Same reframing — subject is the archive's growth, the brand is the specifier. |

All entries written in the protocol's first-person plural / impersonal past tense. No founder voice. No member naming. No CTAs. No adjectives from the banned-vocabulary list.

---

## C. Entry removed

**"Member #1 joined"** is removed as a standalone entry.

Reasons:

- It is **seat history** (belongs to the seat record), not protocol history.
- It is **member history** (belongs to My Chronicle), not Chronicle.
- It is **Activity history** (the tx is already recorded with proof), not Chronicle.
- Elevating it sets a precedent that forces editorial decisions about which members to memorialise — exactly the founder-spotlight failure mode the Mythology gate forbids.
- The *protocol fact* that survives (the chapter became non-empty) is preserved as one sentence inside Entry 1.
- Chronicle works correctly without it. Member #1's permanence is fully preserved by their seat, their My Chronicle, and Activity.

---

## D. Protocol-centric confirmation

After this review the Chronicle's day-one subject distribution is:

| Entry | Subject | Protocol primitive? |
|---|---|---|
| 1 | The chapter | ✓ |
| 2 | The archive (first artifact class) | ✓ |
| 3 | The archive (second artifact class) | ✓ |

**Zero entries name a wallet, a member number, or a person.** Every subject is a protocol-level object. Member identity is preserved in the surfaces that own it (Activity, My Chronicle, future seat records), never elevated into the protocol's own voice.

The protocol-centricity test is satisfied. The Mythology gate is satisfied (no honorary additions, no founder spotlights, no wealth-coded language). The selection gate is satisfied on all three entries.

---

## Phase 1 — go condition

With this review:

- Final entry list is **3 entries**, not 4.
- Wording is locked.
- The first-seat fact is preserved inside Entry 1, not as a separate entry.
- No further constitutional review is required to begin Phase 1 implementation.

Phase 1 may now proceed exactly as specified in `docs/PROTOCOL_CHRONICLE_MVP_EXECUTION_SPEC.md §H`, with the entry registry seeded by the 3 entries above and the Member-#1 entry omitted.

---

## Decision Lens Verdicts

| # | Lens | Verdict | Note |
|---|---|---|---|
| 1 | Founder | ✓ | Removes the only member-centric entry; protects Chronicle voice. |
| 2 | Investor | ✓ | Page reads as protocol history; no person-of-the-week framing. |
| 3 | Growth | ✓ | Smaller, denser day-one Chronicle is more readable and more shareable than four entries that include a person. |
| 4 | Behavioral | ✓ | No founder-spotlight precedent that would later force per-member entries. |
| 5 | UX | ✓ | Three entries are still enough to establish the genre. |
| 6 | Product | ✓ | Selection gate now has a sixth (protocol-centric) clause; mechanical to enforce. |
| 7 | Staff Eng | ✓ | Entry registry shrinks by one; implementation simpler. |
| 8 | QA | ✓ | New protocol-centricity test is testable: subject must be a protocol primitive, not a wallet or member number. |
| 9 | A11y | ✓ | No change. |
| 10 | SEO | ✓ | Distinct, durable subjects per entry; no person-named anchors that age poorly. |

Review locked. Phase 1 cleared to implement.
