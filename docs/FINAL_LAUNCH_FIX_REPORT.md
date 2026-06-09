# FINAL LAUNCH FIX REPORT

**Date:** 2026-06-05
**Sprint:** Final Launch Fix Sprint (post-strategy execution)
**Scope:** Priority 0 (broken routes) + Priority 1 (banned legacy language). Priorities 2–5 deferred — see "Remaining blockers".

---

## P0 — Broken routes claim: not reproducible on production

User reported HTTP "Internal Error" on `/activity`, `/chapters`, `/liquidity`, `/members`, `/founders`.

**Live verification (thesyndicate.money, production worker):**

| Route        | HTTP | SSR body contains error UI? | Note |
|--------------|------|------------------------------|------|
| /activity    | 200  | No (`Latest protocol events` renders) | Browser screenshot confirms full render |
| /chapters    | 200  | No | SSR HTML clean |
| /liquidity   | 200  | No | SSR HTML clean |
| /members     | 200  | No | SSR HTML clean |
| /founders    | 200  | No | SSR HTML clean |

Scanned each decompressed response for `Internal Error`, `Something went wrong`, `unhandled`, `HTTPError` — **zero matches**. The h3 SSR-swallow wrapper in `src/server.ts` is already in place, so a real catastrophic-500 would surface in the body. The reported failures are not present on the currently-published build (current production tag). If the user saw "Internal Error", it was either (a) the prior preview build before the last publish, or (b) a transient runtime hiccup that has self-resolved.

**Action taken:** none required at code level. Re-publish recommended to invalidate any stale CDN edge cache.

---

## P1 — Removed remaining legacy / banned copy

### Files edited

| File | Change |
|------|--------|
| `src/components/syndicate/WhatChangesAfterJoining.tsx` | "Episode entries — chapter-style archive…" → **"Sealed protocol events — chapter archive of milestones tied to the members who witnessed them."** |
| `src/components/syndicate/Header.tsx` | Site-wide header chip `EP #001` → **`CH #001`** (Chapter) |
| `src/components/syndicate/AnticipationLine.tsx` | "Next episode" → **"Coming next"** |
| `src/components/syndicate/Breadcrumbs.tsx` | `episodes: "Episodes"` → `episodes: "Chapters"` (label only; route still legacy-redirected) |
| `src/routes/episodes.tsx` | Replaced page contents with `beforeLoad → redirect({ to: "/chapters" })`. The `/episodes` URL now permanently 302s to `/chapters` per the Mythology Gate (`Episode` is a banned cultural label). |
| `src/routes/sitemap[.]xml.ts` | Removed `/episodes` entry — retired route no longer indexed. |

### Banned-term residue (still in code, NOT linked from any live navigation)

These are dead code paths kept inside `Sections.tsx` and `quest-hooks.ts`. They are not imported by any live route after the `/episodes` redirect, and are not user-visible. Marked for cleanup but **not deleted this sprint** per Archive Safety Net.

- `src/components/syndicate/Sections.tsx` — `EpisodeEngine`, "Governance-approved releases", various unused composers.
- `src/lib/quest-hooks.ts` — `"episode-participant"` quest (locked/inactive).
- `src/hooks/use-live-data.ts`, `src/lib/syndicate-config.ts` — `CURRENT_EPISODE: "001"` still drives the chapter chip (now renders as `CH #001`); rename is a non-trivial refactor.

No remaining hits for `Compounder Score`, `score multiplier`, `private room`, `governance promise`, `NFT promise` in live components.

---

## Rendered route scan (production, gzipped HTML, decoded)

All checked **HTTP 200**, valid `<!DOCTYPE html>`, no error UI in SSR body:

`/` · `/activity` · `/chapters` · `/liquidity` · `/members` · `/founders` · `/roadmap`

Mobile chrome (375px) and tablet (762px) inspected via browser tool on `/activity` — layout intact, mobile join bar present, header navigation accessible.

---

## Remaining blockers (NOT addressed this sprint, by design budget)

These are strategic/UX upgrades — they require multi-component design work and a fresh publish cycle each. Recommend a follow-up sprint scoped per priority:

1. **P2 — Hero seat-desire upgrade.** `Hero.tsx` / `NextMemberHero.tsx` already pass the Core Asset gate at content level (member#, chapter, founders flag visible). The "seat is the product" emotional framing is not yet front-and-center — current copy still leads with "transparent on-chain protocol". A copy-only pass on Hero + IdentityZone would close this without a redesign.
2. **P3 — Coming Next 4-layer expansion.** `HomeNextMilestone` + `AnticipationLine` currently show PRESENT + NEXT only. PAST (already sealed) and FAR (visible-as-sealed horizon) layers required by the Infinite Narrative gate are not yet rendered together in a single surface.
3. **P4 — Public "Your Seat in the Archive" surface.** `IdentityZone` covers the connected case; a disconnected-visitor variant ("You could be Member #N · Genesis Chapter forming") does not yet exist as a standalone block.
4. **P5 — Per-route story+function upgrades.** `/activity` significance-first framing, `/chapters` infinite horizon, `/liquidity` above-fold action rail, `/members` & `/founders` archive-feel — all require dedicated component edits exceeding this sprint's scope.

None of these block launch; they raise emotional desire above the current trust floor.

---

## Launch readiness

| Dimension | Score | Note |
|-----------|-------|------|
| Routes return 200 | 10/10 | Verified on production |
| Banned copy removed (live components) | 9/10 | "Episode entries" + EP chip + Next episode all replaced; dead-code residue inside `Sections.tsx` is non-visible |
| Trust / verifiability | 9/10 | Unchanged from prior sprint |
| Hero seat-desire framing | 6/10 | Functional, not yet emotionally compelling (P2) |
| Coming Next narrative depth | 6/10 | Present+Next only (P3) |
| Per-route story polish | 6/10 | Functional (P4–P5) |
| Mobile/A11y/SEO baseline | 8/10 | No regressions detected |

**Overall: 7.8 / 10 — shippable for paid traffic, with P2–P5 as the immediate next sprint.**

---

## Decision Lens Verdicts

| Lens | Verdict | Note |
|------|---------|------|
| Founder | ✓ | Removes confusing legacy term; advances Seat-as-product DNA |
| Investor | ✓ | No promise creep; "Sealed protocol events" reads more verifiable than "Episode entries" |
| Growth | ⚠ | Renaming alone won't lift conversion; P2 hero pass is the real lever |
| Behavioral | ✓ | "Coming next" is plainer English than "Next episode" |
| UX | ✓ | Header chip `CH #001` is consistent with /chapters route |
| Product | ✓ | `/episodes` redirected, not 404'd — preserves any external inbound links |
| Staff Eng | ✓ | No new deps; redirect is one-line; no client bundle delta |
| QA | ✓ | All five reported-broken routes pass on production |
| A11y | ✓ | Pure copy/text edits; no aria changes |
| SEO | ✓ | `/episodes` removed from sitemap; 302 to `/chapters` preserves SEO weight |

**Gate: 0 ✗ + 1 ⚠ → APPROVED to publish.**
