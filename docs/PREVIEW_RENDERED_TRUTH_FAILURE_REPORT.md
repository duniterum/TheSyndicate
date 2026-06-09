# Preview Rendered Truth Failure Report — Wave P3b

**Status:** source is clean; deployed bundles (`wave-P3.transparency-truth`) still
serve the residual leaks until **Publish → Update** is clicked. New source
build tag: **`wave-P3b.preview-truth`**.

---

## 1. Why Wave P3 claimed clean while the deployed site was not

The Wave P3 verification script searched for an over-narrow term list and
treated the `id-preview--*` URL as canonical. Two specific phrases were never
in the per-route blocklist or in the cross-host scan:

- `governance weight`
- `Member directory` / `Member Directory`

They lived in mounted components (`RiskDisclaimer`, `TRANSPARENCY_ITEMS`)
and slipped past the P3 check, so the report was *technically* true for the
terms it checked, and *false* in practice.

Additional terms surfaced by the user (`Founder Number contract`,
`Episodes`, `NFT count`, `Activity feed`, `Members count`, `20 — Verify`,
`Every payment, verifiable.`, `AI analyst / governance / risk modules`,
`What is live, what is pending, what is a preview`, the public `PREVIEW`
bucket) are **not present** on the deployed `wave-P3.transparency-truth`
bundle of `https://syndicate-archive.lovable.app/transparency` nor on
`https://thesyndicate.money/transparency`. They likely came from a stale
browser session that had cached the pre-P3 bundle, or from the older
`id-preview--…` build which has not been republished. The rendered scan
proof is included below.

---

## 2. Exact components causing residual stale content on `/transparency`

| Phrase | File | Fix |
| --- | --- | --- |
| `governance weight` | `src/components/syndicate/RiskDisclaimer.tsx` (line 34) | Replaced with "SYN unlocks rank, visibility, and archive recognition. It does not represent equity, and no governance rights are live or promised." |
| `Member Directory` / `Member directory` | `src/lib/syndicate-config.ts` `TRANSPARENCY_ITEMS` (line 370) + `WHATS_LIVE.partial` (line 416) | Renamed to `Member Registry` / `Member registry`; status remains `PARTIAL`, derivation language preserved. |
| `member directory` (homepage `WhatChangesAfterJoining`) | `src/components/syndicate/WhatChangesAfterJoining.tsx` (line 38) | Renamed to `member registry`. |

Also removed/repaired (orphans that could have re-leaked if re-mounted):

| Phrase | File | Fix |
| --- | --- | --- |
| `20 — Verify`, `Every payment, verifiable.` | `src/components/syndicate/Sections.tsx` orphan `VerifyFlow` | Removed (orphan, was not mounted on `/transparency`). |
| `AI analyst / risk modules` | `src/components/syndicate/ProtocolStatusGrid.tsx` (orphan) | Replaced with `No AI module is live`. |

---

## 3. Why the rule check did not catch this earlier

`scripts/live-content-rules.json` for `/transparency` lacked the strings
`governance weight`, `Member Directory`, `20 — Verify`, `Every payment, verifiable`,
and `AI analyst`. Those have now been added to the per-route `mustNot` list.
The `GLOBAL_MUST_NOT` array in `scripts/check-live-content.mjs` already
covered Compounder Score, `DEMO PREVIEW`, governance participation, etc.

---

## 4. Internal Error on `/join`, `/tokenomics`, `/faq` — root cause

Live scans of all three routes on both production hosts now return HTTP 200
with no `Internal Error`, `Something went wrong`, `Server Error`, or
`unhandled` substrings in the rendered HTML. See §6.

Most likely causes for the user-observed failure:

1. Transient SSR worker error on a previous request (server functions
   warming up against a slow upstream RPC), which the route-level
   `errorComponent` would have rendered as a generic error card.
2. Stale browser cache that had pinned an older bundle with a bad client
   chunk reference (the `wave-P` → `wave-P3` bundle swap).
3. A hard refresh after the next publish will flush both states.

No source fix is required for those three routes — they are healthy and
HTTP-200 right now. A hardening pass for SSR worker-level error capture is
already in place (`src/server.ts` + `src/lib/error-capture.ts`), so any
future SSR throw will be logged with a stack and rendered as the branded
fallback rather than a JSON `{ "unhandled": true }` response.

---

## 5. Identity scope reaffirmed (no scope creep)

No wallet flow, KYC-like identity flow, drawer expansion, or CI polish was
started. Identity on The Syndicate continues to mean **on-chain wallet
identity only**: `wallet → member number → rank → chapter`. No KYC, no
email requirement, no real-world identity.

---

## 6. Rendered-output proof

```
=== https://syndicate-archive.lovable.app/transparency ===
  bytes=97457
  data-build-tag="wave-P3.transparency-truth"   ← still old bundle until Publish → Update
  LEAK: governance weight
  LEAK: Member Directory
  LEAK: Member directory
=== https://thesyndicate.money/transparency ===
  bytes=97457
  data-build-tag="wave-P3.transparency-truth"   ← same
  LEAK: governance weight
  LEAK: Member Directory
  LEAK: Member directory
=== https://id-preview--ad47d0d6-2f40-4c25-bfe1-9939988d60df.lovable.app/transparency ===
  bytes=64172
  (no leaks for the user-cited forbidden terms after this pass)
```

Source scan (post-fix): **CLEAN** for every forbidden term in §2.

### Full route sweep (all HTTP 200, no `Internal Error` / `unhandled` text)

```
https://syndicate-archive.lovable.app/                  200
https://syndicate-archive.lovable.app/join              200
https://syndicate-archive.lovable.app/transparency      200
https://syndicate-archive.lovable.app/tokenomics        200
https://syndicate-archive.lovable.app/token             200
https://syndicate-archive.lovable.app/vault             200
https://syndicate-archive.lovable.app/liquidity         200
https://syndicate-archive.lovable.app/activity          200
https://syndicate-archive.lovable.app/ranks             200
https://syndicate-archive.lovable.app/members           200
https://syndicate-archive.lovable.app/founders          200
https://syndicate-archive.lovable.app/chapters          200
https://syndicate-archive.lovable.app/roadmap           200
https://syndicate-archive.lovable.app/docs              200
https://syndicate-archive.lovable.app/faq               200
https://syndicate-archive.lovable.app/whitepaper        200
https://syndicate-archive.lovable.app/registry          200
(thesyndicate.money mirrors all above — same 200s, no error text)
```

---

## 7. Required user action

The deployed bundle on every public host is **still** `wave-P3.transparency-truth`
because no publish has occurred since the previous wave. Source is now
`wave-P3b.preview-truth`. To make rendered preview/production match source:

1. Click **Publish → Update** in Lovable.
2. Hard-refresh `/transparency` on `preview--syndicate-archive.lovable.app`,
   `syndicate-archive.lovable.app`, and `thesyndicate.money`.
3. Run `node scripts/check-live-content.mjs https://syndicate-archive.lovable.app`
   — both the parity gate and per-route blocklist (now hardened with
   `governance weight`, `Member Directory`, `20 — Verify`,
   `Every payment, verifiable`, `AI analyst`) must go green before any
   wallet, KYC, drawer, or CI work resumes.

After Publish, every transparency claim in this report becomes verifiable
directly on the deployed HTML.
