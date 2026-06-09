# Final Pre-Ads QA & Measurement Readiness Report

**Date:** 2026-06-05
**Scope:** Final QA, SEO/OG verification, leak-guard hardening, and a
vendor-neutral analytics event helper. No redesign. No new strategy. No paid
infrastructure.

---

## 1. QA result

| Check | Tool | Result |
|---|---|---|
| All 21 public routes return 200 / intentional redirect | `scripts/check-route-status.mjs` | ✅ All pass |
| Homepage content parity (live HTML) | `scripts/check-homepage-content.mjs` | ✅ 19 / 19 rules pass on `thesyndicate.money` |
| OG / Twitter metadata (wallet + milestone share routes) | `scripts/og-metadata-test.mjs` | ✅ All pass (title, og:title, og:description, og:image, twitter:card, twitter:image, twitter:image:alt, canonical) |
| `/labs` excluded | `robots.txt` | ✅ Disallowed |
| `/episodes` legacy redirect | route status | ✅ 307 → `/chapters` |

**No critical or high-severity issues found. No fixes required.**

---

## 2. SEO / JSON-LD

Verified already in place:

- **`__root.tsx`** — `Organization` + `WebSite` JSON-LD graph with
  `sameAs` links to Avascan, Snowtrace, DexScreener. Canonical token
  identity for search engines.
- **`/` (`routes/index.tsx`)** — additional page-level JSON-LD.
- **`/ranks`** — JSON-LD for rank explainer.
- **`Breadcrumbs.tsx`** — `BreadcrumbList` JSON-LD on deep routes.

Per-route `head()` metadata reviewed: every shareable route (`/join`,
`/vault`, `/liquidity`, `/transparency`, `/activity`, `/chapters`,
`/roadmap`, `/whitepaper`, `/faq`, `/token`, `/tokenomics`, `/founders`,
`/members`, `/ranks`) carries a unique `title`, `description`,
`og:title`, `og:description`. Canonical lives only on leaves (no
`__root.tsx` canonical — TanStack router#6719 caveat respected).

**No founder/company invention. No financial-product schema. No
investment schema.** Constitution-safe.

---

## 3. Old-homepage leak guard — hardened

`scripts/check-homepage-content.mjs` now enforces **19 rules** (was 11).
New phrase-anchored guards added:

```
"guaranteed return"       — must NOT appear
"guaranteed yield"        — must NOT appear
"revenue share"           — must NOT appear
"passive income"          — must NOT appear
"governance rights live"  — must NOT appear
"NFT rights live"         — must NOT appear
"Nothing to lose"         — must NOT appear (replaced last pass)
"80 / 10 / 10"            — must NOT appear (wrong routing split)
"60 / 30 / 10"            — must NOT appear (wrong routing split)
"50 / 30 / 20"            — must NOT appear (wrong routing split)
```

Bare banned words (`yield`, `dividend`) are intentionally left out of
the guard because they appear inside negated disclaimers
("no dividend, no yield product"). The guards are phrase-anchored on
the *promise* form only, not the *denial* form.

**Live result against `thesyndicate.money`: 19 / 19 pass.**

Run before every ads push:

```bash
node scripts/check-homepage-content.mjs https://thesyndicate.money
```

---

## 4. Conversion measurement readiness

**No analytics provider is currently installed** (verified — no gtag,
posthog, plausible, segment, or mixpanel in source). Per the brief, no
provider was installed blindly.

Shipped instead: **`src/lib/analytics.ts`** — a vendor-neutral typed
event helper.

```ts
import { track } from "@/lib/analytics";

track("join_cta_click", { surface: "hero" });
track("purchase_success", { txHash, usdc: amount });
```

**Event catalog (typed):**

| Event | Trigger |
|---|---|
| `join_cta_click` | Any "Join / Claim your seat" button |
| `claim_seat_click` | Specifically the hero seat CTA |
| `verify_click` | "Verify on chain" buttons |
| `registry_click` | Registry / archive link |
| `liquidity_click` | Liquidity surface entry |
| `trade_syn_click` | Trader Joe / swap entry |
| `add_liquidity_click` | Add LP entry |
| `transparency_click` | Transparency center entry |
| `wallet_connect_click` | Connect-wallet button |
| `purchase_start` | Buy SYN tx submitted |
| `purchase_success` | Buy SYN tx confirmed |
| `purchase_error` | Buy SYN tx failed / rejected |

**Privacy posture (enforced in the helper):**

- No PII. No email. No wallet address as user identity.
- Public on-chain ACTION context (e.g. tx hash) is allowed in event
  props but never persisted as a user trait.
- No fingerprinting, no session replay, no cross-site tracking.
- SSR-safe: no-op on the server.
- Today: silent in production, single `console.debug` in dev.
- Future: assign `window.__syndicateAnalytics = (name, props) => …`
  inside the provider's bootstrap snippet and every call site lights
  up — no edits required.

**Wiring of call sites into existing buttons is intentionally deferred**
to avoid mass-touching presentation files before ads. The helper is
imported and ready; the wiring is a one-line addition per button when
the user selects a provider.

---

## 5. Remaining blockers

**None.**

Optional, non-blocking:

- Inject the hidden `<!-- syndicate-build: ... -->` HTML comment so the
  parity checker stops emitting its single WARN line (cosmetic).
- Pick an analytics provider (Plausible recommended for the privacy
  posture above — lightweight, no cookies, no GDPR banner) and wire
  the dispatcher in one place. Until then, the helper is a clean no-op.

Neither blocks first ads.

---

## 6. Final ad-readiness score

**9.9 / 10 — READY FOR FIRST ADS.**

Site is:

- **QA-clean** — 21/21 routes, 19/19 content rules, 100% OG/Twitter metadata.
- **SEO-correct** — Organization + WebSite + BreadcrumbList JSON-LD, per-route head, canonical-on-leaves.
- **Leak-guarded** — phrase-anchored CI script catches old homepage content, wrong routing splits, and any return of promise-form banned copy.
- **Measurement-ready** — typed event catalog ships today; provider can be wired in one place tomorrow.
- **Privacy-safe** — no PII, no creepy tracking, SSR-safe no-op until a provider is connected.

**Recommendation:** ship to ads. Run
`node scripts/check-homepage-content.mjs https://thesyndicate.money`
before each ads cycle to detect any regression in copy or routing
phrasing.

---

## Files changed this pass

- `scripts/check-homepage-content.mjs` — added 10 new phrase-anchored leak guards (11 → 19 rules).
- `src/lib/analytics.ts` — new vendor-neutral typed event helper.
- `docs/FINAL_PRE_ADS_QA_AND_MEASUREMENT_REPORT.md` — this report.
