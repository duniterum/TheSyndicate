# THE SYNDICATE — REAL USER TEST PLAN

The protocol is technically complete enough that further progress depends on
**human behavior**, not new modules. This document defines how to run
controlled MVP testing with real visitors.

> **Stop Building Rule**: do not add Referral, NFT, Governance, AI, Vault
> Automation, or new community pages until this testing surfaces a real
> bottleneck. See `docs/MVP_ECOSYSTEM_ROADMAP.md` → Observation Phase.

---

## 1. Goal

Answer one question:

> **Do real visitors understand it, trust it, join it, and share it?**

If they do not, the fix is wording, ordering, and emphasis — never new
features.

---

## 2. Test Groups (target 2–3 people per group)

| Group | Profile | Why this group matters |
|---|---|---|
| Crypto-native | Trades onchain, uses DeFi weekly | Spots fake transparency instantly |
| Meme-coin buyer | Speculates on Solana/Base coins | Tells us if "no-pump" framing repels or attracts |
| DeFi user | LPs, farms, uses Aave/Curve | Validates the routing / treasury story |
| Cautious investor | Risk-aware, slow to commit | Stress-tests trust signals |
| Non-technical friend | No wallet, no crypto background | Worst-case clarity test |
| Skeptical visitor | Distrusts crypto by default | Reveals trust leaks |
| Potential community member | Long-term builder mindset | Validates identity / society framing |

Minimum viable round: **1 person per group (7 total)**. Ideal: 2–3 per group.

---

## 3. Core Test Questions

Ask each tester these, in order, without coaching:

1. What do you think The Syndicate is?
2. Why do you think it exists?
3. What would you click first?
4. Do you understand why someone would join?
5. Do you understand what happens after joining?
6. Do you trust it? Why or why not?
7. What feels confusing?
8. What feels empty or unfinished?
9. Would you join with $5? Why or why not?
10. Would you share it? What would you share?

Record verbatim answers. Do not paraphrase. Do not defend the product.

---

## 4. Pass Criteria

A tester passes if, within **one minute** of landing on the homepage, they
can articulate in their own words:

- [ ] **What it is** — "an onchain protocol/society where members are recorded and money is publicly routed"
- [ ] **Why it exists** — transparency, long-term, no hype
- [ ] **How to join** — connect wallet, pay USDC, get recorded
- [ ] **What happens after joining** — member number, chapter, archive, verifiable
- [ ] **How to verify** — links to Snowtrace / contracts / wallets

A round passes if **≥ 70% of testers** hit ≥ 4 of 5 above.

---

## 5. Failure Modes → Action

| Symptom | Likely root cause | Action (no new features) |
|---|---|---|
| "I don't know what this is" | Hero copy too abstract | Tighten the one-liner |
| "Is this a token to buy?" | Speculation framing leaking | Rewrite Why Join, demote price talk |
| "Why would I join?" | WhyJoinSimple buried or skipped | Re-order homepage |
| "What is 70/20/10?" | Routing not explained near hero | Add inline glossary / tooltip |
| "Where's the catch?" | Trust signals not loud enough | Surface contract dossiers higher |
| "I'd never share this" | No personal hook | Strengthen MemberCard / share artifacts |

---

## 6. Cadence

- **Round 1**: 7 testers (one per group). 1 week.
- **Triage**: list top 5 confusion points and top 3 trust leaks.
- **Fix**: copy / ordering / emphasis only. No new modules.
- **Round 2**: 7 fresh testers. Compare pass rate.
- **Repeat** until ≥ 70% pass two rounds in a row.

Only then re-open the Stop Building Test for the next module.
