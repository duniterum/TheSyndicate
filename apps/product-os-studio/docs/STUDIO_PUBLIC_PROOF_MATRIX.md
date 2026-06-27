# STUDIO_PUBLIC_PROOF_MATRIX

> `READ-ONLY` · `SIMULATED`. The public proof layer shows **protocol-level / aggregate /
> anonymized** data only. It **must not** render wallet-personal data, and it **must** label
> simulated values as not-live. Source of truth: `src/lib/surfaces.ts`.

## Three visibility layers

1. **Public proof** — read-only, no wallet (`PROOF_SURFACES` + `RESOURCE_SURFACES`).
2. **Member personal** — simulated connected wallet (`MEMBER_NAV`).
3. **Founder / operator** — simulated founder mode.

Public ↔ member mapping is declared once (`memberPath`) and reused by the public header
"Proof" menu, the footer, homepage CTAs, and the public route table — so they can't drift.

## Proof surfaces (public ↔ member)

| Public surface | Public path | Member counterpart | Group | What the public sees |
|----------------|-------------|--------------------|-------|----------------------|
| Activity | `/activity` | `/member/activity` | Proof | Protocol heartbeat — read-only feed. |
| Economy / Transparency | `/economy` | `/member/transparency` | Proof | 70/20/10 routing + economy summary. |
| Registry | `/registry` | `/member/registry` | Proof | Contract/protocol proof summary (real addresses as READ-ONLY PRODUCTION PROOF; future concepts inert). |
| Recognition | `/recognition` | `/member/recognition` | Proof | Anonymized contribution board (not a wealth ladder). |
| Verified Introduction | `/referral-status` | `/member/referral` | Proof | Source-attribution status — V1 candidate, not live. |
| Fire Ledger | `/fire` | `/member/fire` | Proof | Proof of Fire — simulated aggregate + one READ-ONLY PRODUCTION PROOF burn (`PROOF_OF_FIRE_001`). |
| Evolution | `/evolution` | `/member/evolution` | Memory | Public episodes of how the protocol moved. |
| Chronicle | `/chronicle` | `/member/chronicle` | Memory | Curated public canon. |
| Archive / Memory | `/archive` | `/member/archive` | Memory | Memory/milestone preview — preview, not ownership. |

## Resource surfaces (standalone public pages)

These are public resource pages. Toolkit also exposes a member view (`/member/toolkit`);
Share, Press, and Learn have no gated counterpart.

| Surface | Public path | Member counterpart | Group | Notes |
|---------|-------------|--------------------|-------|-------|
| Syndicate Toolkit | `/toolkit` | `/member/toolkit` | Resources | Role-aware action toolkit. |
| Proof & Share | `/share` | — | Resources | Prototype share cards. |
| Press & Brand | `/press` | — | Resources | Brand SoT (`brand.ts`). |
| Docs / Learn | `/learn` | — | Resources | FAQ, paper, risk disclaimers. |

## Anonymization rules (enforced in `protocol-graph.ts`)

- **`PUBLIC_HEARTBEAT`** strips member-personal framing: the personal "Genesis Signal #9"
  is generalized to the artifact, no personal receipt hash, no "since you joined" deltas.
- **`getPublicRecognitionBoard()`** relabels numeric seats to opaque letters (`Seat A`,
  `Seat B`, …) because a numeric seat can coincide with a real member number; the
  member-facing board keeps numeric seats (a member recognizes their own seat).
- The "connect for your personal view" CTA (`connectCtaLabel`) is the **only** bridge from
  a public surface to its member counterpart — public surfaces never leak the personal data.

## Posture reminders shown publicly

- The `trustBoundaries` list (no yield / no passive income / no governance promise / no
  treasury claim / no public referral activation / no claim UI / no source dashboard live /
  no public source-aware buy path live / NFTs are memory, not financial rights).
- Module status labels (`LIVE NOW`, `READ-ONLY`, `IN REVIEW`, `V1 CANDIDATE`, `FUTURE`,
  `SIMULATED PROTOTYPE`) on every surface that references a module.
