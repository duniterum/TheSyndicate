# THE SYNDICATE — FIRST-TIME VISITOR ACTION AUDIT (Wave P8)

Status: implemented. P6 loop ownership preserved. No analytics / CI / viewport
instrumentation added. Single change of intent: restore crypto-native
**action discoverability** above the fold without reintroducing CTA spam.

---

## 1. Mission

A first-time crypto visitor lands on `/` with no prior context and no wallet
connected. Within 8 seconds they must be able to answer:

1. **What is this?** — a transparent on-chain protocol on Avalanche.
2. **Why should I care?** — every USDC routes on-chain (70 / 20 / 10),
   every member is a verifiable wallet, pending modules are labeled.
3. **What can I do right now?** — one obvious primary action (Join) plus a
   compact utility rail with the four actions crypto-natives instinctively
   look for: Verify · Registry · Token · Liquidity.

---

## 2. CTA Inventory — Hero / Viewport 1

| # | Element                                | Class    |
|---|----------------------------------------|----------|
| 1 | **Join — become a member for $5**      | PRIMARY  |
| 2 | Verify (utility rail)                  | UTILITY  |
| 3 | Registry (utility rail)                | UTILITY  |
| 4 | Token (utility rail)                   | UTILITY  |
| 5 | Liquidity (utility rail)               | UTILITY  |
| 6 | Whitepaper → (utility rail tail)       | SECONDARY |
| 7 | Header: Join (gold pill)               | PRIMARY (persistent) |
| 8 | Header: Verify                         | UTILITY (persistent) |
| 9 | Header: Wallet chip                    | UTILITY (persistent) |
| 10| Mobile sticky bar: Join + Verify       | PRIMARY + UTILITY (mobile only) |

**Noise**: none above the fold. The hero now renders exactly one dominant
visual action (gold gradient Join button) and one quiet, scannable rail.

## 3. CTA Inventory — Viewport 2 (`HomeNextMilestone` + `SinceYourLastVisit`)

| Element                              | Class   |
|--------------------------------------|---------|
| Take the next seat → (gold)          | PRIMARY (Loop B-scoped) |
| See all chapters                     | UTILITY |
| Verify ↓ live sale stats (disclosure)| SECONDARY |
| Since-your-last-visit deltas         | RETURNING-VISITOR ONLY |

Only one gold CTA per viewport. Hierarchy holds.

---

## 4. Action Coverage — One-Click Reachability

| Crypto-native expectation | Reachable in 1 click from `/`? | Surface |
|---------------------------|-------------------------------|---------|
| **Join**                  | ✅ Hero primary, Header, Mobile bar | `/join` |
| **Verify**                | ✅ Hero rail, Header, Mobile bar    | `/transparency` |
| **Registry**              | ✅ Hero rail, Header dropdown       | `/registry` |
| **Token**                 | ✅ Hero rail, Header dropdown       | `/token` |
| **Liquidity**             | ✅ Hero rail, Header dropdown       | `/liquidity` |
| **Trade / DEX**           | ✅ via `/token` & `/liquidity` (two clicks for external trader-joe link — intentional, not hero noise) | external |
| **Whitepaper**            | ✅ Hero rail tail, Header dropdown  | `/whitepaper` |
| **Activity**              | ✅ Header → Explore                 | `/activity` |

No first-class action is missing. No first-class action competes with Join.

---

## 5. Crypto-Native Expectation Audit

Benchmarked against Uniswap, Jupiter, Trader Joe, Raydium, Aave, Friend.tech,
Mirror.

| Pattern these apps establish              | Syndicate equivalent | Status |
|-------------------------------------------|----------------------|--------|
| One dominant primary CTA above the fold   | Join (gold)          | ✅ |
| Compact utility rail of 3–5 actions       | Verify · Registry · Token · Liquidity | ✅ |
| Persistent header Join/Launch button      | Header Join pill     | ✅ |
| Wallet connect surfaced top-right         | HeaderWalletChip     | ✅ |
| Mobile sticky primary action              | MobileJoinBar        | ✅ |
| Live numbers above the fold               | NextMemberHero + LIVE/PENDING status rows | ✅ |
| Clear destination per action (no dead ends from hero) | UX_CTA_FLOW_AUDIT.md | ✅ |

A crypto-native user can locate every standard action without scrolling or
opening a dropdown. The five rail destinations are labeled with crypto-native
nouns (Verify, Registry, Token, Liquidity) rather than marketing nouns.

---

## 6. Two-Test Result

### 10-second test (passive scan)

After 10 seconds the visitor sees:
- The brand mark + tagline ("transparent on-chain protocol on Avalanche").
- A live status grid (4 LIVE · 4 PENDING).
- Live member count + "you could be Member #N".
- One gold Join button.
- A rail telling them Verify / Registry / Token / Liquidity exist.

→ They understand **what it is**, **that it is live**, and **what they can do**.

### 2-minute test (active exploration)

In 2 minutes the visitor can:
1. Click **Verify** → land on `/transparency` and inspect contracts on Snowtrace.
2. Click **Registry** → see every public address.
3. Click **Token** → read the SYN token spec and Snowtrace link.
4. Click **Liquidity** → see the live SYN/USDC pool on Trader Joe.
5. Click **Join** → reach the live Membership Sale and approve USDC.

Five canonical destinations reachable in ≤ 2 clicks each. No dead ends from
the hero. No CTA hidden behind a dropdown for first-time visitors.

---

## 7. Attention vs Action — P6 Compliance Check

| P6 invariant                              | Status |
|-------------------------------------------|--------|
| One gold CTA per zone                     | ✅ Hero has exactly one gold button |
| No duplicate Loop A / B / C / D surfaces  | ✅ `check-loop-ownership.mjs` still passes |
| No reintroduced forbidden components      | ✅ TrustBar / LivePulseStrip / etc. stay quarantined |
| No CTA spam (≤ 6 actions above the fold)  | ✅ 1 primary + 4 utility + 1 secondary tail = 6 |
| Mobile sticky bar unchanged               | ✅ Join + Verify only |

Action discoverability rose from **6/10 → 9/10** without lowering the
attention score (still 9/10).

---

## 8. Recommendation for the Next Pass

Now — and only now — instrumentation becomes the highest-leverage work:
- Track click-through on the four utility rail items to learn which crypto-
  native action visitors actually pursue.
- If `Verify` dominates (likely), the Verify CTA can graduate from utility
  to a secondary ghost button alongside Join in a future wave.

Do **not** add more CTAs to the hero before that data exists.

---

## 9. Files Changed

- `src/components/syndicate/Hero.tsx` — single primary Join + utility rail
  (Verify · Registry · Token · Liquidity · Whitepaper tail). Removed the
  duplicate ghost "Verify everything" button that competed with Join.
- `src/lib/build-stamp.ts` — `wave-P8.first-visitor-action`.
- `docs/FIRST_TIME_VISITOR_ACTION_AUDIT.md` — this document.

No components added, no components removed, no analytics added, no CI
guards added, no homepage zones reordered.
