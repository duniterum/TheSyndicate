---
name: Protocol-in-Public doctrine
description: Constitutional wording + cockpit IA gate — emotional product is "watch a protocol operate in public", ban shareholder/investor wording, single-status cards, mechanical public/personal IA split
type: constraint
---
The Syndicate's emotional product = **"Watch a protocol operate in public"** (Mercury + public-company transparency + blockchain explorer + Steam profile + Netflix "what's new"). Anti-DNA: brokerage portfolio, yield dashboard, DAO console, affiliate leaderboard.

**Banned wording (outside legal denials):** contribution / cumulative contribution / my share / vault share / treasury share / investor / dividend / capital raised / money raised / revenue share / passive income / yield / returns / ROI / shareholder / stake / pooled / earn-a-commission. The word "contribution" outside a denial sentence is always wrong.

**Required replacements:** purchases · USDC routed · routing proof · receipts · membership sale volume · protocol movements · treasury movements · be eligible for routing (never "earn"). The member bought SYN; the contract routed payment; the record is a receipt — not a claim, right, dividend, share, or ownership.

**Cockpit `/my-syndicate` canonical 9-card order (locked):** 1 Identity · 2 What changed since last visit (most important) · 3 Purchases & Receipts · 4 Protocol Watch (personalized) · 5 Treasury Movements (never "your share") · 6 Artifacts · 7 Referral (SIMULATED) · 8 Reputation/Builder (concept only) · 9 Future modules (PENDING). Every card carries exactly ONE status pill (LIVE/SIMULATED/PENDING/LOCKED) — mixed cards forbidden; split if needed.

**Public/personal IA split is mechanical:** `/` `/join` `/transparency` `/activity` `/chapters` `/chronicle` `/archive` `/vault` `/liquidity` `/referral` `/ranks` `/members` = protocol-centric only. `/my-syndicate` = wallet-scoped only. `/referral` is now a pure public explainer — personal link/tier/estimator/activity moved to cockpit §7.

**Treasury rule:** show movements (source→destination→amount→reason→anchor), never ownership %. "Look what happened", never "look what you own".

**Return loop:** retention comes from 7 named change triggers feeding "what changed since last visit". If none fired, say so honestly — never fabricate change.

**Lint gate for next PR:** scripts/check-ownership-wording.mjs must fail on banned terms outside an allow-listed denial sentence in: archive-config.ts ARCHIVE_DISCLAIMER · vault.tsx no-yield paragraph · whitepaper.tsx artifact denial · transparency.tsx artifact denial · WhyJoinSimple.tsx utility disclaimer · labs/WhyJoinNow.tsx. Also rename `contributionAgeDays` → `referrerAgeDays`.

Source: docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md. Composes with VISION + Unified Doctrine Map + Core Asset + Mythology + Infinite Narrative + Treasury Ledger + Revenue Attribution + Reputation + Builder Record + Legal Disclosure. All 10 Decision Lenses pass.
