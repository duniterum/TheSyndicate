# 06 — FINANCIAL TRACE & MONEY/SIGNAL GUARDRAILS

Status: **binding.** Sibling to `05_FOUNDATION_FREEZE.md`. Where 05 freezes the
five-layer architecture, this file freezes **one specific danger**: money quietly
becoming prestige. It defines what economic data *is* (the **Financial Trace**),
what it **may** feed, and the hard line it must **never** cross.

> The One Rule still applies: on-chain truth wins; this doc consolidates and
> constrains, it does not override code or contracts.

---

## 1. The Financial Trace (definition)

The **Financial Trace** is a member's verifiable, on-chain record of **economic
participation** — what they routed, when, and how often:

| Field | Source | Status |
|---|---|---|
| Cumulative USDC routed | sale events / `holder-index.ts` | LIVE |
| Purchase count | sale events / `holder-index.ts` | LIVE |
| First / last participation block | sale events | LIVE |
| 70/20/10 routing of each purchase | `USDC_ROUTING`, sale ABI | LIVE |

**It is economic *memory*, not economic *reward*.** Its purpose is transparency
("don't trust, verify") and a member's own record of how they participated.

### What the Financial Trace is **not**
- Not a leaderboard, ranking, or "top spender" board.
- Not prestige, standing, or primacy.
- Not a promise, projection, or measure of return.
- Not a governance weight or an access gate beyond the rank thresholds that
  already exist.

The Financial Trace is **distinct from Historical Prestige.** Prestige (Signals,
Chronicle, recognition) is *curated, scarce, and earned through participation
over time*; the Financial Trace is *raw, complete, and money-derived*. They must
never be conflated.

> **Future-approved expansion (NOT yet the definition):** the founder has approved
> widening the Trace to also derive from **token burns, NFT mints, referrals, and
> wallet history** (see `08_PROTOCOL_OPERATING_PRINCIPLE.md`). That is *approved
> direction*, not current truth: the table above (sale-derived, all-LIVE) remains
> the binding definition until each new input is wired, and every added input enters
> only at its own status (burn LIVE · mint PARTIAL · **referral FUTURE** ·
> wallet-history LIVE-read). Derivation never upgrades an input's status.

---

## 2. The money → prestige guardrail

Money is a legitimate **input** to some surfaces and a forbidden **cause** of
others. This is the operational form of `05_FOUNDATION_FREEZE.md` §3–§4 (the
Signal types/tiers and the **scarcity law: person-subject monetary size never raises a tier
into permanent prestige** — §4.5; *protocol-subject* economic milestones may be S3+).

### Money MAY feed (as one input among others)
- **Rank** — recognition derived from cumulative USDC. Mutable, secondary,
  confers nothing (`03_GLOSSARY.md`, `RANK_CONSTITUTIONAL_RULING.md`).
- **Financial Trace** — §1 above.
- **Member Journey** — the personal participation timeline (§4).
- **Reports / Ledger / Activity** — transparent, complete, public records.

### Person-subject money MUST NOT, by itself
*("By itself" = monetary magnitude with no non-money fact attached. The **subject** decides
standing — see `05_FOUNDATION_FREEZE.md` §4.5.)*
- Raise a **person-subject Signal tier above S2**, or create an **S3+ person-subject signal**.
- Create a **Chronicle candidate** (Chronicle excludes person/purchase/rank
  kinds by construction — keep it that way; **no buyer attribution** even when a person's purchase
  happens to trigger a protocol-subject milestone).
- Confer or imply **governance**, a vote, or a right.
- Imply **ROI, yield, dividend, profit, returns, or reward** (banned vocabulary,
  `03_GLOSSARY.md`).

> Rule of thumb: money can describe *how much someone participated*; it can never
> by itself decide *how much someone matters*.

### Protocol-subject economic milestones MAY be S3+
Money is one of the core truths of The Syndicate — economic activity is proof the machine is alive,
shown proudly, truthfully, verifiably. A milestone whose **subject is the protocol** (Vault /
Liquidity / USDC-routed / SYN-sold threshold crossed, chapter sealed, a major economic level
crossed) is a *structural* fact about the protocol, not a person, and **may** be an S3+ Signal
candidate, a Chronicle candidate, and a Report highlight. *Guardrails:* thresholds must be
**pre-declared** (no retroactive invention, `08`); **no buyer attribution** in Chronicle wording; no
price / ROI / yield claims. Full ruling: `05_FOUNDATION_FREEZE.md` §4.5 (Rules A–E).

### Magnitude marker (surfacing, not prestige)
Large person-subject economic events may carry a **magnitude marker** (e.g. *largest purchase 24h /
this week*, *major-purchase event*) — **temporary visibility only.** It is **not** a Signal Tier,
does **not** live in `signal-registry.ts`, must **not** feed Chronicle automatically or Recognition
permanently, and must **never** become a top-spender leaderboard (`05` §4.5 Rule C).

---

## 3. Money-weighted score quarantine (A/B/C/D)

Some surfaces compute a **money-weighted score**. These are quarantined and
classified so a future Signal Engine cannot silently consume them as prestige.
Each lives behind a `QUARANTINE: money-weighted score` code marker.

| Symbol | File | Formula (summary) | Class |
|---|---|---|---|
| `archiveWeight` / `computeScore` | `src/lib/leaderboard-hooks.ts` | `sqrt(usdc) × (1 + log2(1 + purchases))` | **A** display · **B** Trace-eligible · **C** forbidden in Signal/Chronicle/Recognition |
| `builderScore` | `src/lib/preview/referral.ts` | retention/durability-led; gross commission = tiebreaker | **A** preview · **D** simulated-only |
| `commissionPct` / `commissionUsdc` / `grossCommissionUsdc` | `src/lib/preview/referral.ts` | preview commission figures | **D** simulated-only — never "earned"/live |

**Class key**
- **A — Display only.** Labs / leaderboard / preview ordering. Never authoritative.
- **B — Trace-eligible.** May feed the Financial Trace (economic-participation
  history), where money is expected and money is the subject.
- **C — Forbidden for prestige.** Must never be imported or consumed by the
  recognition, chronicle, or signal-tier derivation.
- **D — Simulated only.** Preview/illustrative; never rendered as live or earned.

**Enforcement:** `src/lib/__tests__/signal-money-guardrail.test.ts` asserts the
prestige-deriving modules (`recognition-candidates.ts`, `chronicle-candidates.ts`)
contain none of these symbols and never import `leaderboard-hooks` or
`preview/referral`, and that the quarantine markers stay in place.

---

## 4. Member Journey — future readiness (doctrine only, PENDING)

No implementation here — this records the constraints a future member-journey
view must obey, so it is built right the first time.

**Canonical journey (the spine):**
Observe → Take a Seat → Participate → Leave a Trace → Become Remembered.

A future **Member Journey / Financial Trace view** may show a member their own
participation timeline (joins, purchases, routing, rank recognition over time).
It must:
- Follow the journey spine above; **rank/money is texture, never the spine.**
- Present the Financial Trace as *memory*, never as return, projection, or reward.
- Keep Permanent signals (Chronicle, Seals) distinct from Temporary texture
  (rank, recent activity) — `05_FOUNDATION_FREEZE.md` §5.
- Carry correct status pills (LIVE / PARTIAL / PENDING) per surface.
- Never introduce a ranking/leaderboard of members by money.

Status: **PENDING** — bucket 12 (Future Modules). Build only after the Signal
Engine lands, consuming MEMORY per the Adjacency Law.

---

## 5. Naming lock (Sprint A.7) — context for this guardrail

The rank ladder was renamed so identity/support/governance words stop colliding
with ranks (see `05_FOUNDATION_FREEZE.md` §12, `03_GLOSSARY.md` rulings #1–#2):

| Old rank | New rank | Reserved word freed |
|---|---|---|
| Patron ($500) | **Steward** | "Patron" → support family (Patron Seal / Support / Actions / Recognition) |
| Council Candidate ($1,000) | **Custodian** | — |
| Council ($2,500) | **Keystone** | "Council" → future governance only |

Thresholds, SYN amounts, USDC, and economics are unchanged — only labels moved.
This keeps the Financial Trace (money) and the rank ladder (recognition) cleanly
separable from the support and governance vocabularies they used to overload.

---

*Read with: `05_FOUNDATION_FREEZE.md` (architecture freeze), `03_GLOSSARY.md`
(vocabulary + collision rulings), `RANK_CONSTITUTIONAL_RULING.md` (rank doctrine).*
