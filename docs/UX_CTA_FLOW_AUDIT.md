# THE SYNDICATE — UX / CTA / DEAD-END AUDIT

For every route: what should the visitor do next? Audit only.

Legend
- **Next step**: the intended action.
- **Obvious?**: Y / partial / N.
- **Primary CTA**: dominant button.
- **Verify path**: secondary action toward proof.
- **Dead end?**: Y / N.
- **Mobile keeps CTA?**: Y / N.

| Route | Next step | Obvious? | Primary CTA | Verify path | Dead end? | Mobile CTA? |
|---|---|---|---|---|---|---|
| `/` | Buy SYN or verify | Y | Buy SYN with USDC | Open transparency | N | Y (sticky bottom not present — flag) |
| `/join` | Connect → Approve → Buy | Y | Approve / Buy | View contract on Snowtrace | N | Y |
| `/members` | Pick a wallet → see member | partial | wallet links | — | partial (no Join nudge at bottom) | Y |
| `/founders` | Pick a founder | partial | wallet links | — | partial | Y |
| `/chapters` | Open chapter | Y | chapter cards | — | partial | Y |
| `/chapters/$slug` | View members in chapter, Join | partial | none strong | — | Y (no Join CTA at end) | Y |
| `/ranks` | Find your rank, Join with right size | Y | Buy SYN | — | N | Y |
| `/activity` | Verify on Snowtrace, Join | partial | Snowtrace links | live events | partial | Y |
| `/transparency` | Verify each row, Join | Y | Verify on Snowtrace | many | N | Y |
| `/registry` | Open address on Snowtrace | Y | Snowtrace | — | Y (no return path) | Y |
| `/token` | View on Snowtrace, Add to wallet | Y | Add to MetaMask | Snowtrace | partial | Y |
| `/tokenomics` | Understand allocation, Join | partial | — (weak) | — | **Y** | Y |
| `/liquidity` | Trade / view pool | Y | Trader Joe | DexScreener | partial | Y |
| `/vault` | Understand routing, Join | partial | — (weak Join) | Snowtrace | partial | Y |
| `/docs` | Pick a doc | Y | doc cards | — | partial | Y |
| `/faq` | Read, Join | partial | — | links inline | **Y** | Y |
| `/whitepaper` | Read, Join | partial | — | inline | **Y** | Y |
| `/roadmap` | Understand timing | partial | — | — | **Y** | Y |
| `/wallet/$address` | Share, Join (if not owner), Verify | Y | Share / Join | Snowtrace | N | Y |
| `/milestone/$id` | Share, Verify | Y | Share | Snowtrace | partial | Y |

## Dead-end summary (flag for later)

Pages that end with no clear next step:
1. `/tokenomics` — donut + numbers, then silence. Needs "Join" + "Verify" CTAs.
2. `/faq` — long Q/A, no Join CTA at the end.
3. `/whitepaper` — long read, no end CTA.
4. `/roadmap` — phases listed, no Join or Activity link at end.
5. `/registry` — table of addresses, no return path or Join nudge.
6. `/chapters/$slug` — chapter detail, no Join CTA.

All of these are recoverable with a small bottom CTA block — recommend a
reusable `EndOfPageCTA` primitive (Join + Verify) added in a focused pass.
Do not implement now.

---

## Key journeys

### Visitor → Understand → Join
`/` → scroll WhyJoinSimple → HowToJoinSteps → Join CTA → `/join`.
**Status**: clean. Long page is the friction.

### Visitor → Verify → Join
`/` → Transparency CTA → `/transparency` → Snowtrace → back → `/join`.
**Status**: clean. `/transparency` is the strongest page.

### Visitor → Members → Wallet → Join
`/` → Members nav → `/members` → wallet click → `/wallet/$address` → Join.
**Status**: works; member page has Join CTA post wave-3A.

### Member → Wallet → Share
Connect → header chip → "My wallet" → wallet page → ShareActions.
**Status**: clean post wave-3A.

### Skeptic → Transparency → Explorer
`/transparency` → contract / wallet links → Snowtrace.
**Status**: clean; this is the conversion gate for skeptics.

### Returning visitor → What changed → Activity
Home → SinceYourLastVisit strip → Activity page.
**Status**: clean.

### DeFi user → Token / Liquidity → Verify
`/token` → `/liquidity` → DexScreener → back.
**Status**: works; LP pending modules clearly labeled.

---

## Wallet-state aware CTAs

- Header chip already adapts (connected / disconnected / wrong network).
- `/join` button states are wallet-aware.
- `/wallet/$address` shows `WalletContextNotice` when viewing a different
  address than the connected one.
- Other pages do not yet vary CTA by wallet state. Acceptable for phase;
  flag if conversion testing shows confusion.

## Mobile

- Header has mobile drawer; nav reachable.
- No sticky bottom-of-screen "Buy SYN" CTA on mobile — flag as the single
  biggest mobile conversion lift available without new features.

## Top UX risks (ranked)

1. Home page length — visitor may bounce before reaching mid-page CTAs.
2. Several content surfaces end as dead ends (see list).
3. No mobile sticky Join CTA.
4. Orphan `/ai` and `/nfts` routes could be discovered by curious users.
5. Identity surfaces (members / founders / chapters) overlap; risk of "what's
   the difference?" confusion.
