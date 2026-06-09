# My Syndicate — Final Implementation Blueprint (v2)

Status: **RATIFIED v2** — ordering corrected for OS reflex.
Supersedes: v1 of this document, `MY_SYNDICATE_BLANK_PAGE_REDESIGN.md`, all
prior cockpit concepts (A/B/C).
Authority: this is the single source of truth for `/my-syndicate` until
contracts ship.
Scope: information architecture + execution. One decisive pass, then
`/my-syndicate` is **frozen**.

---

## 0. Constitutional Amendment (ratified)

> **My Syndicate is the Member Operating System.**
>
> Identity is the **dominant** domain and owns the hero.
> Assets is the **first secondary** domain — a connected crypto user must
> see "what do I hold?" immediately after "who am I?".
> The other domains (Memory · Future · Growth · Protocol) dock in fixed
> slots so future modules dock without another redesign.

---

## 1. Final Information Architecture (v2 — locked)

```text
┌────────────────────────────────────────────────────────────┐
│  TIER 1 — HERO  (Identity, dominant)                       │
│  § 1  My Seat                                              │
│        Member № · Chapter · Block anchor · Co-witness set  │
│        Wallet pill · Seat status pill                      │
├────────────────────────────────────────────────────────────┤
│  TIER 2 — SECONDARY  (OS reflex, then story arc)           │
│  § 2  My Assets         [Assets]                           │
│        SYN · Archive1155 · SeatRecord721 (PENDING)         │
│  § 3  Activity          [Memory — recent]                  │
│        Recent on-chain movement for this wallet            │
│  § 4  What's Sealing Next  [Future]                        │
│        Real chapter + artifact thresholds                  │
│  § 5  My Chronicle      [Memory — deep]                    │
│        Full block-anchored timeline + routing receipt      │
├────────────────────────────────────────────────────────────┤
│  TIER 3 — TERTIARY  (collapsed)                            │
│  § 6  My Growth   (referral · reputation · builder)        │
│  § 7  My Horizon  (governance · marketplace · AI · B2B)    │
│  § 8  Protocol Context  (links out only)                   │
└────────────────────────────────────────────────────────────┘
```

The order is fixed. New modules dock into their domain's slot.

---

## 2. Why v2 ordering (over v1)

v1 (`Identity · Changed · Sealing · Chronicle · Assets · Growth · Future`)
satisfied the story arc but buried Assets at slot 4. A crypto-connected
user expects:

> Who am I → What do I hold → What just moved → What's next → Deeper history.

v2 satisfies that reflex while preserving the story arc:

- Identity stays the only hero.
- Assets moves to §2 — the OS reflex.
- "Activity" (§3) replaces "What changed since last visit" — same data,
  crypto-native vocabulary.
- "What's Sealing Next" (§4) sits directly under Activity → strongest
  return-loop pairing (recent → forward edge).
- "My Chronicle" (§5) is the deep timeline; the recent ticker no longer
  competes with the full history.

---

## 3. Six-domain dock map (v2)

| Domain     | Slot                                          | Rule                                   |
|------------|-----------------------------------------------|----------------------------------------|
| Identity   | § 1 Hero (Seat)                                | Only the seat lives here.              |
| Assets     | § 2 My Assets                                  | Holdings only. No prices, no PnL.      |
| Memory     | § 3 Activity · § 5 Chronicle                   | Past tense. Block-anchored.            |
| Future     | § 4 What's Sealing Next                        | Real on-chain thresholds. No timers.   |
| Growth     | § 6 My Growth                                  | Participation, not wealth.             |
| Protocol   | § 8 Protocol Context                           | Links out — never re-rendered here.    |

Future member-facing modules dock into §4 / §6 / §7 — no new sections.

---

## 4. Survives · Merges · Removes · Archives

### Survives
- `MemberCard` — hero of §1.
- `useHolderIndex` reads — power §1 · §3 · §5.
- `SeatRecordPanel` — in §2 (Assets), PENDING.
- `MyArchivePreview` — in §2 (Assets).
- `MyPurchaseRouting` — in §5 (Chronicle).
- `MyReferralCard`, `MyReputationConceptCard` — in §6 (Growth), collapsed.
- Artifact allowlist + status pill system + source-link discipline.

### Merges
- v1's "What Changed for You" + recent purchases → **§3 Activity**.
- Old 4-section accordion → §1 hero + §3/§4/§5.
- Referral CTA + reputation preview + builder record → §6 collapsed.

### Removes (from `/my-syndicate`)
- Inline education / "how it works" copy.
- Inline governance / marketplace / AI widgets.
- Duplicate hero metric strips.
- Banlist words: `raised`, `contribution`, `investor`, `investment`,
  `share`, `claim`, `dividend`, `yield`, `revenue share`, `passive income`,
  `ROI`, `pooled`, `stake`, `earn a commission`.
- Manufactured urgency / countdowns.

### Archives (Archive Safety Net)
- `MemberCockpitCandidate` → `src/labs/components/` (LABS).

---

## 5. Page invariants (locked)

1. One hero, one object. Only §1 uses display type.
2. Linear flow. No tabs, no carousels for primary content.
3. Truth pills (LIVE / PARTIAL / PENDING) + source links on every metric.
4. Banlist words must not appear in `src/routes/my-syndicate.tsx`.
5. Domains dock — they never multiply.
6. Doctrine test asserts the v2 eyebrow order.
7. Archive Safety Net respected.
8. **Freeze after one pass.** Next focus: Referral · CommissionRouter ·
   Archive1155 verification · Membership Sale verification · SeatRecord721 ·
   contracts.

---

## 6. Doctrine Test — eyebrow contract

```
My Seat · My Assets · Activity · What's Sealing Next · My Chronicle · My Growth · My Horizon · Protocol Context
```

`SeatRecordPanel` and `MyArchivePreview` each render exactly once, inside §2.

---

## 7. Decision Lens Verdicts

| Lens         | Verdict | Note                                                                 |
|--------------|---------|----------------------------------------------------------------------|
| Founder      | ✓       | OS framing matches the amendment literally.                          |
| Investor     | ✓       | No price/yield framing; positions, not P&L.                          |
| Growth       | ✓       | Activity + Sealing = strongest return loop.                          |
| Behavioral   | ✓       | Reflex satisfied in <5s; anticipation preserved at §4.               |
| UX           | ✓       | Linear flow; matches user mental model.                              |
| Product      | ✓       | Six domains map to fixed slots; modules dock.                        |
| Staff Eng    | ✓       | Same components, re-ordered; one fewer level of nesting.             |
| QA           | ✓       | Doctrine test + ownership-wording guard = enforceable invariants.    |
| A11y         | ✓       | Linear DOM, single H1, eyebrows as semantic headings.                |
| SEO          | ✓       | Single H1, unique meta, canonical preserved.                         |

All 10 pass.

---

## 8. Execution Order (one pass — then freeze)

1. Update this blueprint to v2. ✓
2. Rewrite `src/routes/my-syndicate.tsx` to §1 → §8 above.
3. Build §2 Assets (SYN · Archive · SeatRecord PENDING).
4. Build §3 Activity (recent wallet movement, LIVE/PARTIAL/PENDING only).
5. Build §4 Sealing Next (real chapter + artifact thresholds).
6. Build §5 Chronicle (purchase routing + full timeline + link to /chronicle).
7. Build §6 Growth (collapsed; referral + reputation, SIMULATED labeled).
8. Build §7 Horizon (sealed-envelope rows, PENDING).
9. Build §8 Context (single links-out row).
10. Demote `MemberCockpitCandidate` → `src/labs/components/` + classify.
11. Rewrite `my-syndicate-doctrine.test.ts` for v2 eyebrows.
12. Run `node scripts/check-ownership-wording.mjs`,
    `node scripts/check-preview-labels.mjs`, `bunx tsc --noEmit`, and the
    doctrine test. Green = **freeze /my-syndicate**.
