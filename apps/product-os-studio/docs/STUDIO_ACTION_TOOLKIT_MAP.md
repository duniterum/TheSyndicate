# STUDIO_ACTION_TOOLKIT_MAP

> `SIMULATED` · `PROTOTYPE ONLY`. Source of truth: `src/lib/actions.ts` (`ACTION_REGISTRY`).
> **No action executes a real transaction, posts on-chain, or moves funds.** Pages
> (public toolkit, member toolkit, wallet, economy, share, Founder Console) render *from*
> this registry so an action's access requirement, status, and safety labels never drift.

## Action shape

Each `ProtocolAction` carries: `category`, `tier` (`primary | proof | future`),
`visibility` (`public | connected | seated | founder`), `displayStatus` (the shared
StatusBadge label), `actionType`, `sourceTruth` (honest real-vs-simulated note), and
optional `safetyLabels`, `externalWarning`, `disabledReason`, `proofOutput`, `graphOutput`.

- Locked actions are **still shown** with a role-lock affordance (`actionLockReason`).
- External tools are **shown but disabled** (`disabledReason`) behind an `externalWarning`.
- The **operator** category is **hidden** from non-founders entirely.

## Categories (`ACTION_CATEGORIES`, ordered)

`membership` · `wallet` · `dex` · `liquidity` · `burn` · `proof` · `memory` ·
`recognition` · `builder` · `referral` · `identity` · `operator`.

## The registry (23 actions)

| Action | Category | Visibility | Display status | Type | Truth posture |
|--------|----------|-----------|----------------|------|---------------|
| Take your seat | membership | connected | LIVE NOW | internal-route | Engine is live module; connect/route simulated. |
| View your receipt | membership | seated | LIVE NOW | internal-route | Receipt values simulated. |
| See the routing model | membership | public | READ-ONLY | internal-route | Public anonymized figures, simulated. |
| Import SYN (simulated) | wallet | connected | SIMULATED PROTOTYPE | wallet-action | Address mocked → **no** `wallet_watchAsset` call. Disabled. |
| SYN address status (simulated) | wallet | connected | SIMULATED PROTOTYPE | copy | Copies a status note; **no address fabricated**. |
| Open your wallet | wallet | connected | SIMULATED PROTOTYPE | internal-route | Balances/approvals simulated. |
| Swap on a DEX | dex | connected | BACKEND REQUIRED | external-link | **Not wired** — source required. Disabled + warned. |
| View market chart | dex | public | BACKEND REQUIRED | external-link | **Not wired** — no market data source. Disabled + warned. |
| Provide liquidity | liquidity | seated | BACKEND REQUIRED | external-link | **Not wired** — no verified pool. Disabled + warned. |
| Propose a burn | burn | seated | CONCEPT ONLY | internal-route | Founder-gated candidate; **no burn executes**. |
| Open the Fire Ledger | burn | public | SIMULATED PROTOTYPE | internal-route | Burn total simulated; no real burn tx. |
| Share a Proof of Fire | burn | seated | PROTOTYPE ONLY | share | Opens intents w/ prototype text; no image generated. |
| Make a share card | proof | public | PROTOTYPE ONLY | internal-route | Prototype-only; intents, no generated image. |
| Open the Registry | proof | public | READ-ONLY | internal-route | Addresses mocked; explorer links inert. |
| Watch the heartbeat | proof | public | READ-ONLY | internal-route | Public anonymized events, simulated. |
| Anchor a memory | memory | seated | LIVE NOW | internal-route | Archive is live module; anchoring simulated. |
| Read the Chronicle | memory | public | READ-ONLY | internal-route | Canon is simulated history. |
| View recognition | recognition | public | READ-ONLY | internal-route | Public board anonymized; standing simulated. |
| Open the Workbench | builder | seated | PROTOTYPE ONLY | internal-route | Nothing sent to a backend. |
| Verified Introduction | referral | public | V1 CANDIDATE | internal-route | **No public activation**; default stays ZERO_SOURCE_ID. |
| Claim SeatRecord | identity | seated | FUTURE | future | Not deployed; no claim path. Disabled. |
| Open Founder Console | operator | **founder** | SIMULATED PROTOTYPE | internal-route | Operator mode = simulated UI gating, **not** auth. |
| Review Proof of Fire | operator | **founder** | CONCEPT ONLY | internal-route | Approving does **not** execute a burn. |

## Safety mechanisms (hard rules in the registry)

- **External tools are never wired.** `dex` / `liquidity` actions are `external-link`, set
  `disabledReason` ("…not wired — source required"), carry market-risk `safetyLabels`, and
  show the shared `EXTERNAL_RISK` warning ("…Always verify the real contract address from
  an official Syndicate channel…"). `external-link-warning.tsx` confirms before opening.
- **Token import is a labeled preview only.** Because the SYN address is mocked, no real
  `wallet_watchAsset` call is ever made, and **no address is fabricated**.
- **Burn = Proof of Fire.** Always labeled "Retires supply · Not minting · Not yield ·
  Not a price promise". Proposals become founder-gated candidates; nothing executes.
- **Sharing is prototype-only.** Opens public share intents with prototype text; generates
  **no image** and posts nothing on the user's behalf.
