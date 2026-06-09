# THE SYNDICATE — MVP CONFUSION SIGNALS

A confusion signal is any visitor behavior or question that indicates the
site failed to communicate. Confusion signals are **data**, not failures.
Catch them early and fix wording — never reach for new features.

---

## 1. Behavioral Signals

| Signal | What it likely means | Fix surface |
|---|---|---|
| Many Verify clicks, no Join clicks | Trust is fine; value is unclear | Hero / WhyJoinSimple |
| Many Docs clicks before Join | Visitor needs to "study" before acting | Add inline explainer near CTA |
| Repeated FAQ visits | Same questions unanswered upfront | Promote FAQ answers to homepage |
| Wallet connect, then leave | Purchase screen feels risky | Trust pills near LivePurchase |
| Clicks Trade / Add Liquidity before Join | CTA hierarchy is off | Demote LP / trade further |
| Long time on homepage, no clicks | Reading but not understanding | Tighten hero copy |
| Quick bounce (< 15s) | First impression failed entirely | Hero rewrite |
| Opens Snowtrace, returns, leaves | Verified something specific that broke trust | Audit that specific contract / wallet |
| Visits Members / Founders / Chapters but does not join | Empty stadium feel | Reframe empty states as opportunity |
| Connects wallet, opens calculator, never buys | Price clarity or minimum confusion | Tighten access-rate copy |

---

## 2. Verbal Signals (questions testers ask)

Track every literal question. Each question = a documented clarity bug.

| Question | Root cause | Fix |
|---|---|---|
| "What is 70/20/10?" | Routing label without explanation | Inline tooltip / mini diagram |
| "What is the Vault?" | Vocabulary not introduced | Glossary chip / `VaultDisambiguation` placement |
| "What do I get?" | Member value not visible above fold | Strengthen WhyJoinSimple / MemberCard preview |
| "Is this an investment?" | Frame is being misread | Reinforce "not a security" disclaimer near CTA |
| "Will I make money?" | Speculation lens applied | Hold the line — restate participation, never returns |
| "Why join now?" | "Early matters" not landing | Re-emphasize formation framing |
| "Who runs this?" | Founder / team transparency low | Surface founder wallet / commitment |
| "Is this safe?" | Trust signals not loud enough | Pull contract dossiers higher |
| "What's the catch?" | Same-rate / no-insider not visible | Promote "Same terms for everyone" |
| "Is there a Discord?" | Community surface expected | Hold — society ≠ Discord; restate |
| "What chain is this?" | Avalanche not visible enough | Surface chain pill near CTA |
| "Can I sell it?" | SYN secondary market unclear | Link to `/token` and Trader Joe pool status |

---

## 3. Silent Signals (absence of expected behavior)

| Expected behavior | If missing it suggests | Fix |
|---|---|---|
| Visiting `/wallet/$address` after buying | Personal identity not surfaced post-join | Post-buy confirmation links to wallet page |
| Sharing MemberCard | Pride / shareability low | Stronger share CTAs after join |
| Returning within 24h | No reason to come back | Surface "since your last visit" |
| Bringing one friend | No referral or invitation hook | **DO NOT** add referral yet — re-test wording first |

---

## 4. Severity Triage

- **P0 (blocks testing)**: visitors cannot describe what The Syndicate is.
- **P1 (blocks conversion)**: visitors understand but do not trust.
- **P2 (blocks distribution)**: visitors join but do not share.
- **P3 (polish)**: minor wording or layout friction.

Fix P0 → P1 → P2 → P3, in that order. Never skip to P3 because it is easier.

---

## 5. Anti-Pattern: Treating Confusion as a Feature Request

If a tester says *"you should add X,"* treat it as a **confusion signal**
about the existing surface, not a feature request. Ask:

> "What were you trying to do when you wanted X?"

Almost always, the answer points to a wording or ordering fix — not a new
module. This is the Stop Building Rule in practice.
