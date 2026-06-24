# Transparency Route Truth Repair Report — Wave P3

**Status:** `/transparency` source repaired and rendered preview scan clean.  
**Build tag:** `wave-P3.transparency-truth`

---

## Exact stale phrases addressed

| Phrase | Classification | Replacement / action |
| --- | --- | --- |
| `What is live, what is pending, what is a preview` | REWRITE | `What is live, what is partial, what is pending` |
| `PREVIEW` transparency bucket | REMOVE | Removed public trust-page preview bucket entirely. |
| `Activity feed` under preview | REWRITE | `Purchase Event Stream` with `PARTIAL`; empty state says 0 purchases until first event. |
| `Members count` under preview | REWRITE | `Member Total` with `PARTIAL`; derived from holder index / sale events. |
| `Founder Number contract` | REMOVE | Replaced with member/founder recognition derived from holder index purchase order; no separate contract implied. |
| `Episodes` on trust page | REMOVE | Demoted out of `/transparency`; route now keeps trust primitives only. |
| `NFT count` | REMOVE | NFT appears only as `PENDING — contract not deployed`, not as a preview metric. |
| `AI analyst / governance / risk modules` | REWRITE | `No AI module is live.` |
| Broad governance wording | REWRITE | `No governance rights are live or promised.` |

---

## Status classification changes

- **Activity / event stream:** `PREVIEW` → `PARTIAL`.
- **Member total:** `PREVIEW` → `PARTIAL`.
- **Member number / founder recognition:** `Founder Number contract` → `PARTIAL`, derived from holder index purchase order.
- **Member directory:** `PREVIEW` → `PARTIAL`, derived from indexed purchase events.
- **NFT:** preview metric removed; contract remains `PENDING`.
- **Governance:** `PENDING — no governance rights are live or promised.`
- **AI Layer:** `PENDING — no AI module is live.`

---

## Transparency route order after repair

`/transparency` now follows the requested trust order:

1. What is **LIVE / PARTIAL / PENDING**
2. Verify claims
3. Treasury / routing
4. Revenue history
5. LP status
6. Risk notice

The overloaded proof-card, duplicate sale-contract, duplicate live-activity, and old verify-flow sections were removed from this trust route.

---

## Rule hardening

`scripts/live-content-rules.json` now makes `/transparency` fail if it contains:

- `what is live, what is pending, what is a preview`
- `Founder Number contract`
- `Episodes`
- `NFT count`
- `Members count`
- `Activity feed`
- `PREVIEW`
- `AI analyst / governance / risk modules`

Rules were also added for `/activity`, `/members`, `/founders`, and `/chapters`.

---

## Rendered route check output

Checked rendered HTML/text output for:

`/`, `/join`, `/transparency`, `/tokenomics`, `/token`, `/vault`, `/liquidity`, `/activity`, `/ranks`, `/members`, `/founders`, `/chapters`, `/roadmap`, `/docs`, `/faq`, `/whitepaper`, `/registry`

Terms searched:

`preview`, `episodes`, `Founder Number contract`, `Compounder Score`, `quests`, `achievements`, `community rewards`, `governance participation`, `proposal eligibility`, `governance-approved unlocks`, `Genesis NFT eligibility`, `private strategy room`, `score multiplier`, `DEMO PREVIEW`

Result:

```txt
BASE [legacy preview URL removed]
/              HTTP 200 CLEAN
/join          HTTP 200 CLEAN
/transparency  HTTP 200 CLEAN
/tokenomics    HTTP 200 CLEAN
/token         HTTP 200 CLEAN
/vault         HTTP 200 CLEAN
/liquidity     HTTP 200 CLEAN
/activity      HTTP 200 CLEAN
/ranks         HTTP 200 CLEAN
/members       HTTP 200 CLEAN
/founders      HTTP 200 CLEAN
/chapters      HTTP 200 CLEAN
/roadmap       HTTP 200 CLEAN
/docs          HTTP 200 CLEAN
/faq           HTTP 200 CLEAN
/whitepaper    HTTP 200 CLEAN
/registry      HTTP 200 CLEAN

BASE [legacy preview URL removed]
/              HTTP 200 CLEAN
/join          HTTP 200 CLEAN
/transparency  HTTP 200 CLEAN
/tokenomics    HTTP 200 CLEAN
/token         HTTP 200 CLEAN
/vault         HTTP 200 CLEAN
/liquidity     HTTP 200 CLEAN
/activity      HTTP 200 CLEAN
/ranks         HTTP 200 CLEAN
/members       HTTP 200 CLEAN
/founders      HTTP 200 CLEAN
/chapters      HTTP 200 CLEAN
/roadmap       HTTP 200 CLEAN
/docs          HTTP 200 CLEAN
/faq           HTTP 200 CLEAN
/whitepaper    HTTP 200 CLEAN
/registry      HTTP 200 CLEAN
```

---

## Confirmation

- `/transparency` now uses only **LIVE / PARTIAL / PENDING**.
- No preview taxonomy remains on trust-critical rendered routes in the preview scan.
- No wallet flow, drawer expansion, CTA tracking, or new feature work was started.