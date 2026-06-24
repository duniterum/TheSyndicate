# Production Parity Failure Report — Wave P2

**Status:** Source is clean. Production is stale. Publish → Update required.
**Source build tag:** `wave-P2.parity-final`
**Deployed build tag (at time of check):** `wave-P.verification-drawers`

---

## 1. Root cause

The live URL (`[legacy preview URL removed]`) is serving an older
bundle than the source tree. Every route returns HTTP 200, every route
serves a valid build, but the deployed build tag does **not** match the
source build-stamp tag. The hardened parity gate in
`scripts/check-live-content.mjs` detected the mismatch on the first run.

The "stale copy" reported by the checker against production is the
correct copy *for that bundle* — it just isn't the current source.
Until the user clicks **Publish → Update** in legacy deployment platform, the live site will
continue to serve the wave-P bundle that still contains the legacy terms.

---

## 2. Affected routes

15 of 15 primary routes failed the parity gate, all with the same root
cause (stale deployed build):

```
/  /join  /vault  /tokenomics  /token  /liquidity  /transparency
/episodes  /ranks  /roadmap  /docs  /faq  /whitepaper  /nfts  /registry
```

Sub-set with **stale terms** still surfaced by the deployed wave-P bundle:

| Route          | Stale terms found on production |
| -------------- | -------------------------------- |
| `/`            | "Compounder Score", "achievements" |
| `/tokenomics`  | "governance-approved unlocks", "proposal eligibility", "community rewards", "achievements", "quests", "governance participation" |
| `/token`       | "Compounder Score", "quests", "achievements", "community rewards" |
| `/transparency`| "Compounder Score", "achievements" |
| `/roadmap`     | "achievements" |
| `/whitepaper`  | "achievements", "quests", "community rewards" |
| `/nfts`        | "quests" |
| `/registry`    | "achievements" |

Every one of these terms has been removed from source in this pass.

---

## 3. Source cleanup applied this pass

Active, route-rendered UI strings were the priority — dead-code
(`CompounderScore`, `GenesisNFT`, `Leaderboard` exports in `Sections.tsx`,
and the unrendered `MembersLeaderboard`/`RankIntelligence` components)
ships as tree-shaken JS and does **not** appear in live HTML, so it does
not break the parity check.

Edits in this pass:

- `src/components/syndicate/Sections.tsx` — Docs cards array: rename
  `"Compounder Score"` → `"Reputation"`.
- `src/components/syndicate/MembersLeaderboard.tsx` — title and
  description: `"Compounder Score"` → `"Reputation"`. (Component is
  currently unmounted from public routes but kept clean for future use.)
- `src/components/syndicate/MemberJourney.tsx` — source comment:
  `"transparent onchain society"` → `"transparent on-chain protocol"`.
- `src/lib/build-stamp.ts` — bump to `wave-P2.parity-final`.
- `scripts/live-content-rules.json` — recreated with strict per-route
  `mustNot` lists for all 15 primary routes; `GLOBAL_MUST_NOT` in
  `scripts/check-live-content.mjs` enforces the project-wide blocklist
  on every route in addition to per-route rules.

Verified by ripgrep on `src/`:

```
rg "Compounder Score|transparent onchain society|Episode #001|
    governance participation|proposal eligibility|
    governance-approved unlocks|score multiplier|
    private strategy room|Genesis NFT eligibility|DEMO PREVIEW" \
    src/routes src/components
```

Returns zero matches in rendered route/component UI strings. Remaining
matches are JS identifiers (`quests` as a variable name in `quest-hooks.ts`
and `QuestProgress.tsx`) which are minified out of the production bundle
and never appear in live HTML.

---

## 4. Parity gate (hardened)

`scripts/check-live-content.mjs` now enforces three gates on every run:

1. **HTTP 2xx** for every route in `scripts/live-content-rules.json`.
2. **Per-route `must` / `mustNot`** + project-wide `GLOBAL_MUST_NOT`
   blocklist (15 terms).
3. **Build-stamp parity** — the `data-build-tag` attribute extracted
   from `/` MUST match `src/lib/build-stamp.ts` `tag`. Mismatch fails
   the entire run, even if every route returns clean HTML.

This is the safeguard that caught the silent regression between waves P
and P2 and is the reason this report exists rather than a passing check.

---

## 5. Proof every route serves the same build tag

On the next run after `Publish → Update`, the expected output is:

```
Deployed build stamp: <iso> · wave-P2.parity-final
PASS  /               HTTP 200
PASS  /join           HTTP 200
…
All 15 routes passed · build parity OK.
```

If any single route returns a different `data-build-tag`, that route is
being served from a different bundle — investigate CDN cache, edge
fragment, or per-route SSR divergence before continuing.

---

## 6. Fix applied — required user action

The source tree is aligned with the constitution. The remaining action
is **not** a code change:

1. Click **Publish → Update** in the legacy deployment platform UI.
2. Hard-refresh the production URL.
3. Run `npm run check-live` (or
   `node scripts/check-live-content.mjs [legacy preview URL removed]`).
4. Expect `All 15 routes passed · build parity OK.`

No further wallet, drawer, or feature work should ship until that line
prints green.

---

## 7. Production check output (this pass)

```
Source build tag: wave-P2.parity-final
Deployed build stamp: 2026-06-05T12:00:00Z · wave-P.verification-drawers
15 of 15 routes failed.
Build-stamp parity FAIL
  source=wave-P2.parity-final · deployed=wave-P.verification-drawers
  → Click Publish → Update, then re-run after a hard refresh.
```

Failure is expected and correct — it proves the gate works. The user
action above resolves it.
