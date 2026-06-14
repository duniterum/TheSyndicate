# The Syndicate — Referral Founder Reconciliation Decision Report

**Purpose:** Freeze exactly what "referral" means **before** the Sale V2 Solidity review — by
reconciling the conflicting tracks the *Referral Doctrine Recovery Audit* surfaced. This is a
**decision report**, not new architecture.

**Strict scope:** READ-ONLY. No Solidity, no Sale V2 change, no frontend change, no deployment. Every
recommendation below is deliberately chosen so the **existing Sale V2 draft does not have to change**;
the reconciliation work is **documentation + copy**, executed later, not now.

**Inputs:** `SALE_V2_REFERRAL_DOCTRINE_RECOVERY_AUDIT.md` (the four artifacts + contradictions C1–C7),
`SALE_V2_REFERRAL_ARCHITECTURE_REVIEW.md` (inline-for-V2 / CommissionRouter-as-standard),
`SyndicateSaleV2.draft.sol`, and the doctrine/code sources cited in the audit.

**The single throughline:** *Sale V2 ships inline, flat-5%, live, lean-event referral exactly as
drafted. Everything richer (tiers, reputation, campaign, override, multi-source) is the future
CommissionRouter. The old vision is preserved, not deleted — re-labeled "future," not "now."*

---

# 1 — Founder decision table

| Decision | Question | Ruling | One-line rationale |
| --- | --- | --- | --- |
| **A** | Is Sale V2 the moment referral payout becomes **live**? | **YES** — gated on legal sign-off before deploy | The draft pays the referrer in-tx; Sprint 0 §B4 + Arch §D ratified it. V2 is precisely the contract that flips "pending → live." |
| **B** | Is Sale V2 referral **fixed 5% only**? | **YES — V2-only** | `refAmt = opsSlice/2`, no tier table. Tiered/reputation/campaign explicitly move to the future CommissionRouter (V3+). |
| **C** | What happens to the **old tiered vision**? | **PRESERVE · do not delete · mark "future CommissionRouter / V3+" · not active in V2** | The tierTable + full RAL `Attribution` schema remain on the books as the CommissionRouter spec. |
| **D** | What happens to **/referral**? | **Stays SIMULATED until legal sign-off; then the attribution + flat-5%-from-Operations reality goes live; tiered/reputation/router previews stay labeled "future"** | Split the page: the part V2 makes real becomes live; the part only the router will deliver stays pending. |
| **E** | What **event schema** for V2? | **LEAN events + off-chain RAL projection** (closes J6 as "lean") | The draft already emits `Routed` + `ReferralAttributed` + `ReferralClaimed`; the indexer maps them onto the RAL shape. Keeps V2 immutable, cheap, and **unchanged**. |
| **F** | **Buyer-override / refTag / campaign** — V2 or future? | **Future CommissionRouter only — NOT in V2** | V2 = last-verified-referrer, no override, no tags. These belong where the full `Attribution` schema lives. |
| **G** | **Legal wording** | Allowed: *attribution · referral · referral routing · direct sales commission* (passive/mechanism framing). Forbidden: *yield · passive income · ROI · revenue share · guaranteed earnings · dividend · "earn"/"earnings" · rank-revenue tier names* | Reconciles C5: the noun "direct sales commission" is allowed; the verb "earn a commission" is not. |
| **H** | **Same-human multi-wallet self-referral** | **Accepted for V2 (bounded); rely on off-chain monitoring + legal framing; do NOT add on-chain identity logic; stronger anti-abuse → CommissionRouter later** | The skim is capped at 5% of gross from Operations only, and the referrer must already be a known member. On-chain identity in an immutable sale is the wrong tool. |

---

# 2 — Contradictions resolved

Maps each contradiction from the recovery audit to its ruling.

| ID | Contradiction (recovered) | Resolution |
| --- | --- | --- |
| **C1** | Live payout (V2) vs "recognition only / Do NOT build / PENDING / reward PENDING" (OS §2.7, `future-referral.ts`, Master Completion G3, Full Protocol View §12, Legal noindex+SIMULATED) | **V2 IS the go-live moment (Decision A).** The "future/pending" track described the *pre-V2* state and is now **superseded for the inline flat-5% payout**. It remains accurate **only** for the richer CommissionRouter features. All five docs get a scoped update (§3). |
| **C2** | Tiered (RAL) vs flat 5% (V2) vs "never tiered rebates" (OS) vs "tiers = V3" (Arch) | **Flat 5% in V2; tiers in CommissionRouter (V3+) (Decisions B, C).** "Never tiered rebates" is re-read as "never *rank-revenue* rebates" — a tier table is permitted in the router **only** if it satisfies Reputation doctrine ("never wealth"); it is simply **absent** from V2. |
| **C3** | "Attribution event locked for V1" (RAL) vs V2 lean events | **Lean events for V2 (Decision E).** The full `Attribution` struct is re-labeled the **CommissionRouter** event, not the V2 event. V2's lean events project onto it off-chain. |
| **C4** | Buyer-override present in RAL, absent in V2 | **Override is a CommissionRouter feature, not V2 (Decision F).** RAL doctrine keeps it as a future-router capability. |
| **C5** | "commission" licensed (Legal/Sprint 0) vs banned (Protocol-in-Public) | **Allow "direct sales commission" (passive framing); forbid "earn a commission" (Decision G).** Protocol-in-Public's "be eligible for a routing when CommissionRouter ships" is rescoped to the **future router**, not the live V2 payout. |
| **C6** | Reputation could feed tiers vs reputation excluded (V2/legal) | **No reputation input in V2 (Decision B).** Reputation/Builder-Record-weighted eligibility is reserved for CommissionRouter, and must obey "never wealth / gross never ≥10% weight" when built. |
| **C7** | "5%" referral vs "5%" ERC-2981 royalty | **Kept explicitly distinct (Decision G + doctrine).** Referral 5% = primary sale, from Operations, to referrer. ERC-2981 5% = secondary NFT royalty, to operations wallet, separate Archive treasury, "never marketed as revenue." Wording must never conflate them. |

---

# 3 — Docs that need updating (after founder ratifies this report)

> None of these are edited now. This is the work list the ruling implies.

| Doc · section | Current text (gist) | Required change |
| --- | --- | --- |
| `SYNDICATE_OPERATING_SYSTEM.md` §2.7 | "recognition only — never payouts, never yield, never tiered rebates" | Rescope: "**Sale V2 pays a flat 5% direct sales commission from the Operations slice, in-tx.** No yield, no rank-revenue tiered rebates. Tiered/reputation routing remains future (CommissionRouter)." |
| `src/lib/future-referral.ts` (header doctrine) | "Reward status is ALWAYS PENDING until an on-chain referral contract is deployed" | Rescope: reward PENDING **until Sale V2**; Sale V2 pays inline 5%. This reserved model now describes the **CommissionRouter** attribution event, not "no payout exists." |
| `MASTER_COMPLETION_PASS_REMAINING_WORK_MAP.md` G3 | "Referral rewards / commission — FUTURE — Do NOT build — P4" | Update: **inline V2 referral = shipping in Sale V2**; CommissionRouter (tiered/multi-source) stays FUTURE/P4. |
| `FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md` §12 | "Status: PENDING / FUTURE (all)" | Split status: **inline V2 flat-5% payout = LIVE-with-V2**; CommissionRouter / tiers / Builder Records = still FUTURE. |
| `REVENUE_ATTRIBUTION_LAYER.md` Status + "locked for V1" | "/referral SIMULATED, no contract"; full `Attribution` "locked for V1" | Clarify: **Sale V2 inline referral is the first live attribution + payout**, emitting **lean events**; the full `Attribution` struct is the **CommissionRouter** event (V3+), not V1/V2. Re-label "locked for V1" → "CommissionRouter canonical event." |
| `LEGAL_DISCLOSURE_REFERRAL.md` Jurisdictional carve-outs | "noindex + SIMULATED" pending legal review | After legal sign-off: flip the live disclosure block on, drop SIMULATED on the payout reality. Keep banned-copy list; add the allowed/forbidden wording table from Decision G. |
| `PROTOCOL_IN_PUBLIC_DOCTRINE.md` (vocab + §7 card) | "never 'earn a commission' … 'be eligible for a routing when CommissionRouter ships'"; referral card SIMULATED | Rescope the "routing when CommissionRouter ships" phrasing to **future router features**; for V2, allow "a 5% direct sales commission is routed from the Operations slice." Un-stamp the V2 parts of the card post-legal. |
| `UNIFIED_PROTOCOL_DOCTRINE_MAP.md` §2.1 | CommissionRouter writes all attribution | Add a note: **Sale V2 is a legacy inline source**; CommissionRouter becomes the writer from the next revenue contract; V2 lean events are adapted into the RAL shape off-chain. |
| `sale-v2-addendum.md` (agent memory) | — | Append the frozen doctrine block (§6) once ratified. |

---

# 4 — Frontend surfaces that need updating

> **Out of scope to change now** ("do not change frontend yet"). Listed so nothing is missed when the
> work is authorized — and **all of it is gated on legal sign-off**.

| Surface | Change required |
| --- | --- |
| `src/routes/referral.tsx` | Drop the SIMULATED stamp on the attribution + flat-5% reality (post-legal); keep tiered/router preview clearly labeled "future." |
| `src/lib/preview/referral.ts` | Reframe the commission estimator from **tiered** to **flat 5% from the Operations slice**. |
| `src/components/preview/ReferralPreview.tsx` | Mirror the flat-5% framing; remove tier ladders from the live view (keep them only in a "future" section). |
| `src/components/syndicate/MyReferralCard.tsx` | Show flat-5%, Operations-only, "direct sales commission" wording; no "earn" verbs. |
| `src/components/syndicate/ReferralAttributionNote.tsx` | Update the shared note: attribution is live; payout is the flat 5% via Sale V2 (after launch); banned terms enforced. |
| `src/components/syndicate/ReferralCapture.tsx` / `cockpit/CockpitIntroducedBy.tsx` | No mechanical change; verify copy uses allowed wording only. |

**Note:** the live `?ref=` capture (`src/lib/referral-attribution.ts`) is **already correct** as
attribution-only and needs no change — it simply continues to feed the `referrer` arg.

---

# 5 — Solidity impact: **UNCHANGED**

Every ruling was chosen to keep the draft frozen:

| Decision | Would it touch `SyndicateSaleV2.draft.sol`? |
| --- | --- |
| A — V2 is go-live | No — the draft already pays in-tx. Go-live is a docs/legal/copy flip, not a code change. |
| B — flat 5% only | No — `refAmt = opsSlice/2` is already flat. |
| C — preserve tiered vision as future | No — nothing tiered exists in the draft to remove. |
| D — /referral reframe | No — frontend/docs only. |
| E — lean events | No — the draft already emits lean events; choosing "lean" **closes J6 with zero code change**. (Choosing the full struct **would** have reopened Solidity — which is exactly why lean is recommended.) |
| F — no override/refTag/campaign | No — the draft already omits them. |
| G — legal wording | No — copy/docs only. |
| H — multi-wallet self-referral accepted | No — deliberately **not** adding on-chain identity logic; the existing `referrer != msg.sender` stands. |

**Conclusion: the Sale V2 Solidity draft can proceed to line-by-line review completely unchanged.**
The only open contract-review item this report touched — **J6 (event schema)** — is hereby closed as
**lean events**, which is what the draft already does.

---

# 6 — Final recommended referral doctrine (the frozen block)

> Paste-ready doctrine statement. Advisory until the founder ratifies; on ratification it supersedes
> the conflicting lines listed in §3.

**LIVE NOW (no contract):**
Off-chain `?ref=<memberNumber>` attribution only — first-touch, browser-local, never on-chain, **no
reward, no payout**. The `/referral` page is **SIMULATED** and **noindex** until legal sign-off.

**SALE V2 WILL DO (on launch, after legal sign-off):**
A **flat 5% direct sales commission**, carved **only from the 10% Operations slice** (Vault 70% and
Liquidity 20% never diluted), **paid in the same transaction** to an eligible referrer
(`referrer != 0 && referrer != buyer && knownMember[referrer]`), with **push-then-escrow** settlement
and a `claimReferral()` fallback. Attribution is **last-verified-referrer** only. V2 emits **lean
events** (`Routed`, `ReferralAttributed`, `ReferralClaimed`); the indexer projects them onto the RAL
`Attribution` shape off-chain. **No tiers, no reputation input, no campaign/refTag, no buyer-override.**
This is **V2-only**.

**COMMISSIONROUTER WILL DO LATER (V3+):**
Become the **shared** attribution+routing contract for all revenue sources
(`MembershipSaleV2` / `ArchiveSaleV2` / B2B / affiliate). It owns the **full `Attribution` struct**
(`source, campaign, token, gross, buyer, referrer, tier, splits[5], paymentMode, attribution,
refTag`), the **tier table** (upgrade-gated; must satisfy "never wealth"), the **governance-gated
`source` allow-list**, **buyer-override**, **campaign/refTag**, and **stronger anti-abuse**
(reputation/Builder-Record-weighted eligibility, off-chain proofs). The old tiered vision is
**preserved here**, not deleted.

**REMAINS FUTURE:**
CommissionRouter itself, tiered/reputation-weighted commission, Builder Records + Reputation as live
surfaces, campaign analytics, buyer-override, multi-source attribution, and on-chain anti-Sybil
beyond `referrer != msg.sender`.

**KNOWN ACCEPTED V2 LIMITATION:**
Same-human multi-wallet self-referral is **not** prevented on-chain (only `referrer != msg.sender`
is). Accepted for V2 because the skim is bounded (≤5% of gross, Operations-only) and the referrer must
already be a known member; mitigated by **off-chain monitoring + legal framing**; stronger
enforcement deferred to CommissionRouter. The contract is intentionally **not** complicated to chase
on-chain identity.

**LEGAL WORDING (binding):**
Allowed — *attribution, referral, referral routing, direct sales commission* (passive/mechanism
framing, e.g. "a 5% direct sales commission is routed from the Operations slice"). Forbidden — *yield,
passive income, ROI, revenue share, guaranteed earnings, dividend, "earn"/"earnings," and any tier
name implying rank-based revenue ownership.*

**DOCS / CODE TO UPDATE (on ratification):** the nine items in §3.
**FRONTEND TO UPDATE (separately authorized, legal-gated):** the surfaces in §4.
**SOLIDITY REVIEW:** **proceeds unchanged** — see §5. J6 closed as **lean events**.

---

*This document is advisory and read-only. It modifies no protocol code, configuration, canon doc, or
contract, and triggers no deployment. The rulings become binding only on founder ratification, at
which point the §3 doc edits and §4 frontend edits (the latter legal-gated) may be authorized as
separate, explicitly-approved tasks.*
