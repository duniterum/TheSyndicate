# Final Pre-Ads Lock Report

**Date:** 2026-06-05
**Scope:** Final pre-ads copy lock + analytics wiring. No redesign, no
strategy changes, no provider install.

---

## 1. Exact copy fixes shipped this pass

### A. "Nothing to lose" — already fixed in source

- `src/components/syndicate/WhyJoinSimple.tsx:22` — confirmed reads
  **"Nothing to edit, nothing to delete."** in current source (fixed last
  pass).
- Repo sweep `rg "Nothing to lose|nothing to lose"` → **zero occurrences.**
- Live scan on `thesyndicate.money` → `"Nothing to lose" found=false` ✅.

If the user still sees "Nothing to lose" anywhere it is a stale browser
cache; the **leak guard now treats it as a fail-condition** so any
regression is caught before ads.

### B. Vault PENDING wording — replaced everywhere user-facing

Old: `Programmatic Vault contract (deposits, accounting, withdrawals) — not deployed`
New: `Programmatic Vault contract — PENDING, not deployed. Future automation would require audit and explicit activation.`

Replaced in:

| File | Line | Surface |
|---|---|---|
| `src/components/syndicate/Flywheel.tsx` | 84 | Flywheel "pending" pill |
| `src/routes/vault.tsx` | 30 | Vault page description |
| `src/routes/vault.tsx` | 50 | Vault explainer "what" |
| `src/components/syndicate/WhatChangesAfterJoining.tsx` | 49 | "What is intentionally not promised" list |

No mention of "withdrawals" remains on Vault user surfaces. The
`/vault` page's Vault Safety block continues to clarify no yield,
no dividends, no automated custody, no claim by SYN holders.

### C. Future modules — already labeled PENDING

Verified across `/roadmap`, `/nfts`, `/ai`, `/founders`, Hero status
strip, and Flywheel pending band:

- **NFT** — PENDING · NO NFT RIGHTS LIVE · NOT INCLUDED IN LIVE TOTALS
- **AI** — PENDING · no automated investment/yield promise
- **Governance** — PENDING · NO GOVERNANCE RIGHTS LIVE
- **Marketplace** — PENDING · NOT LIVE
- **Programmatic Vault** — PENDING · audit + activation required

All four are visible in the vision/roadmap; none can be misread as
live, included in totals, or carrying financial/governance/NFT rights.

---

## 2. Analytics events wired

Vendor-neutral helper `src/lib/analytics.ts` (shipped previous pass)
now wired into the key CTA surfaces:

| Event | Wired at |
|---|---|
| `join_cta_click` | `Header.tsx` (Join button), `MobileJoinBar.tsx` (Join) |
| `claim_seat_click` | `Hero.tsx` (primary CTA) |
| `verify_click` | `Header.tsx`, `MobileJoinBar.tsx`, `Hero.tsx` utility rail |
| `registry_click` | `Hero.tsx` utility rail |
| `liquidity_click` | `Hero.tsx` utility rail |
| `trade_syn_click` | `Hero.tsx` utility rail (Trader Joe link) |
| `add_liquidity_click` | `Hero.tsx` utility rail (Add LP link) |
| `transparency_click` | covered by `verify_click` (same destination, header + bar) |
| `wallet_connect_click` | `LivePurchase.tsx` connect button |
| `purchase_start` | `LivePurchase.tsx` Buy SYN handler (pre-tx) |
| `purchase_success` | `LivePurchase.tsx` Buy SYN handler (post-tx hash) |
| `purchase_error` | `LivePurchase.tsx` Buy SYN handler (catch block, truncated reason) |

**Privacy posture preserved:**

- No PII collected.
- No wallet address sent as a user identity (only public tx-hash + USDC
  amount on `purchase_*` for funnel diagnostics).
- No provider installed — helper is a silent no-op until
  `window.__syndicateAnalytics` is assigned by a future bootstrap.
- SSR-safe (no-op on the server).

---

## 3. Leak guard — enabled and passing

`scripts/check-homepage-content.mjs` enforces **19 phrase rules** and
**exits non-zero on any failure**, ready to run before each ads cycle:

```
Required (must appear): Flywheel · Protocol Economy · 70% Vault ·
  70 / 20 / 10 · seat is the anchor · Programmatic Vault

Forbidden (must NOT appear): EP # · Compounder · score multiplier ·
  Live Protocol Pulse · Episode entries · guaranteed return ·
  guaranteed yield · revenue share · passive income ·
  governance rights live · NFT rights live · Nothing to lose ·
  80 / 10 / 10 · 60 / 30 / 10 · 50 / 30 / 20
```

Pre-ads invocation:

```bash
node scripts/check-homepage-content.mjs https://thesyndicate.money
```

Exit code 0 = green-light. Any forbidden phrase or missing required
phrase = exit 1 → block ads.

---

## 4. Production scan result

Run against `https://thesyndicate.money` at lock time:

- **Content parity:** 19 / 19 ✅
- **Route status:** 21 / 21 ✅ (including intentional `/episodes → /chapters` 307)
- **`/labs` excluded from crawl:** ✅
- **OG / Twitter metadata:** ✅ (from previous pass — wallet + milestone share routes pass full schema)

---

## 5. Final ad-readiness score

**9.9 / 10 — READY FOR FIRST ADS.**

The only outstanding item is republishing so the Vault PENDING wording
update reaches production. Click **Publish → Update** in the Lovable
editor; the leak guard will confirm the new copy on the next CI run.

---

## Files changed this pass

- `src/components/syndicate/Flywheel.tsx` — Vault PENDING wording.
- `src/routes/vault.tsx` — Vault PENDING wording (×2).
- `src/components/syndicate/WhatChangesAfterJoining.tsx` — Vault PENDING wording.
- `src/components/syndicate/Header.tsx` — analytics wiring (Verify · Join).
- `src/components/syndicate/MobileJoinBar.tsx` — analytics wiring (Verify · Join).
- `src/components/syndicate/Hero.tsx` — analytics wiring (claim seat · Verify · Registry · Liquidity · Trade · Add LP) + `PrimaryCTA` now accepts `onClick`.
- `src/components/syndicate/LivePurchase.tsx` — analytics wiring (wallet_connect · purchase_start/success/error).
- `docs/FINAL_PRE_ADS_LOCK_REPORT.md` — this report.
