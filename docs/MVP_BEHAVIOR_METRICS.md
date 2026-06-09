# THE SYNDICATE — MVP BEHAVIOR METRICS

What to observe during MVP testing. Track manually at first — no heavy
analytics until approved.

---

## 1. Philosophy

We do not optimize for engagement. We measure whether visitors **understand,
trust, join, and verify**. Every metric below maps to one of those four.

Never track: scroll heatmaps optimized for ad placement, dark-pattern
funnels, fake "social proof" counters, or anything that pressures behavior.

---

## 2. Primary Metrics

| # | Metric | What it tells us | Bucket |
|---|---|---|---|
| 1 | Homepage visitors | Top-of-funnel volume | Reach |
| 2 | Join CTA clicks | Intent to participate | Convert |
| 3 | Verify CTA clicks | Trust-seeking behavior | Trust |
| 4 | Wallet connects | Hard intent | Convert |
| 5 | Buy attempts (tx sent) | Conversion friction point | Convert |
| 6 | Successful buys (tx confirmed) | True conversion | Convert |
| 7 | Member page visits | Social-proof seeking | Trust |
| 8 | Founders page visits | Identity / archive interest | Identity |
| 9 | Chapters page visits | Belonging / cohort interest | Identity |
| 10 | Ranks page visits | Progression interest | Identity |
| 11 | Wallet page visits (`/wallet/$address`) | Personal identity engagement | Identity |
| 12 | Share button clicks | Distribution intent | Share |
| 13 | External explorer clicks (Snowtrace etc.) | Verification action | Trust |
| 14 | Time on homepage | Comprehension depth | Understand |
| 15 | Bounce from homepage | Failed first impression | Understand |
| 16 | FAQ / docs clicks | Comprehension gaps | Understand |

---

## 3. Healthy Ratios (rough targets, MVP scale)

These are **directional**, not KPIs. At early scale, qualitative > quantitative.

- Join clicks ÷ visitors → **≥ 5%** (clarity of value)
- Verify clicks ÷ visitors → **≥ 3%** (trust seeking is healthy)
- Wallet connects ÷ Join clicks → **≥ 30%** (CTA actually leads somewhere)
- Buy attempts ÷ wallet connects → **≥ 20%** (no purchase-screen friction)
- Successful buys ÷ buy attempts → **≥ 60%** (contract / UX is smooth)
- Share clicks ÷ successful buys → **≥ 25%** (post-join pride)
- Bounce rate → **≤ 70%** (homepage carries weight)

---

## 4. Manual Tracking (Round 1)

Until lightweight analytics is approved, log testers' sessions manually
during the interview:

- Note every click in order.
- Note every URL change.
- Note every visible hesitation (> 3 seconds without action).
- Note every back-button press.
- Note every explorer / external link opened.

A spreadsheet with `tester_id | step | action | timestamp | notes` is enough
for the first round.

---

## 5. If Analytics Is Approved Later

Prefer:

- **Plausible** or **Umami** — privacy-respecting, no cookies, no PII.
- Self-hosted if possible.

Avoid:

- Google Analytics (privacy + cookie banner overhead).
- Mixpanel / Amplitude (overkill at MVP scale, identity-heavy).
- Session replay tools (privacy risk for wallet UIs).

Track only the 16 metrics above. No event sprawl. No custom dimensions
beyond `page` and `cta_id`.

---

## 6. What These Metrics Cannot Tell Us

Numbers cannot answer: *"do they understand what this is?"* That requires
the qualitative test in `docs/REAL_USER_TEST_PLAN.md`.

Use behavior metrics to **locate** friction. Use interviews to **understand** it.
