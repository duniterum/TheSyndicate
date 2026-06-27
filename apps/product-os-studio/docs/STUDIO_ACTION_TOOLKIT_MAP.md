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
| Import SYN (simulated) | wallet | connected | SIMULATED PROTOTYPE | wallet-action | SYN address is READ-ONLY PRODUCTION PROOF; **no** `wallet_watchAsset` call (not wired). Disabled. |
| SYN address status (read-only proof) | wallet | connected | READ-ONLY | copy | Copies a status note pointing to the Registry; SYN address is READ-ONLY PRODUCTION PROOF, never injected into a wallet. |
| Open your wallet | wallet | connected | SIMULATED PROTOTYPE | internal-route | Balances/approvals simulated. |
| Swap on a DEX | dex | connected | BACKEND REQUIRED | external-link | **Not wired** — source required. Disabled + warned. |
| View market chart | dex | public | BACKEND REQUIRED | external-link | **Not wired** — no market data source. Disabled + warned. |
| Provide liquidity | liquidity | seated | BACKEND REQUIRED | external-link | **Not wired** — no verified pool. Disabled + warned. |
| Propose a burn | burn | seated | CONCEPT ONLY | internal-route | Founder-gated candidate; **no burn executes**. |
| Open the Fire Ledger | burn | public | SIMULATED PROTOTYPE | internal-route | Aggregate simulated; `PROOF_OF_FIRE_001` is READ-ONLY PRODUCTION PROOF; live scan ADAPTER REQUIRED. |
| Share a Proof of Fire | burn | seated | PROTOTYPE ONLY | share | Opens intents w/ prototype text; no image generated. |
| Make a share card | proof | public | PROTOTYPE ONLY | internal-route | Prototype-only; intents, no generated image. |
| Open the Registry | proof | public | READ-ONLY | internal-route | Real addresses as READ-ONLY PRODUCTION PROOF; future concepts inert. |
| Watch the heartbeat | proof | public | READ-ONLY | internal-route | Public anonymized events, simulated. |
| Anchor a memory | memory | seated | LIVE NOW | internal-route | Archive is live module; anchoring simulated. |
| Read the Chronicle | memory | public | READ-ONLY | internal-route | Canon is simulated history. |
| View recognition | recognition | public | READ-ONLY | internal-route | Public board anonymized; standing simulated. |
| Open the Workbench | builder | seated | PROTOTYPE ONLY | internal-route | Nothing sent to a backend. |
| Verified Introduction | referral | public | V1 CANDIDATE | internal-route | **No public activation**; default stays ZERO_SOURCE_ID. |
| Claim SeatRecord | identity | seated | FUTURE | future | Not deployed; no claim path. Disabled. |
| Open Founder Console | operator | **founder** | SIMULATED PROTOTYPE | internal-route | Operator mode = simulated UI gating, **not** auth. |
| Review Proof of Fire | operator | **founder** | CONCEPT ONLY | internal-route | Approving does **not** execute a burn. |

## Production-readiness classification

Beyond each action's `displayStatus`, every action falls into one of four porting buckets.
This is the lens a production engineer uses when reading the toolkit; it is **documentation
only** — no action executes anything. Real wiring attaches at the seams in
`STUDIO_ADAPTER_SEAMS.md`, using constants from the porting map (now present; real constants
are shown as `READ-ONLY PRODUCTION PROOF`, while a live read remains `ADAPTER REQUIRED`).

- **Production-backed (read-only):** the underlying module exists in production; the Studio
  shows a **simulated read** of it. *See the routing model, Open the Registry, Watch the
  heartbeat, Read the Chronicle, View recognition, Take your seat / View your receipt /
  Anchor a memory* (live *module*, simulated here). Posture: `READ-ONLY` /
  `READ-ONLY PRODUCTION PROOF`. **No writes.**
- **Adapter-required:** would be real once an adapter + porting-map constant is supplied;
  **not wired today.** *Import SYN, SYN address status, Open your wallet, Swap on a DEX,
  View market chart, Provide liquidity.* Posture: `ADAPTER REQUIRED` / `BACKEND REQUIRED` /
  `NOT WIRED` (wallet/DEX/LP remain disabled + warned).
- **Future-only:** the module is not deployed; no path exists yet. *Claim SeatRecord
  (SeatRecord721), Verified Introduction (SourceRegistryV1, V1 CANDIDATE — no public
  activation).* Posture: `FUTURE` / `V1 CANDIDATE`.
- **Preview-only:** intentionally never a transaction — UI/preview surfaces. *Share a Proof
  of Fire, Make a share card, Open the Workbench, Propose a burn (founder-gated candidate),
  Open the Fire Ledger, Open Founder Console, Review Proof of Fire.* Posture:
  `PROTOTYPE ONLY` / `CONCEPT ONLY` / `SIMULATED PROTOTYPE`. **Nothing executes; no burn,
  no image generation, no real founder action.**

## Safety mechanisms (hard rules in the registry)

- **External tools are never wired.** `dex` / `liquidity` actions are `external-link`, set
  `disabledReason` ("…not wired — source required"), carry market-risk `safetyLabels`, and
  show the shared `EXTERNAL_RISK` warning ("…Always verify the real contract address from
  an official Syndicate channel…"). `external-link-warning.tsx` confirms before opening.
- **Token import is a labeled preview only.** Even though the SYN address is a READ-ONLY
  PRODUCTION PROOF constant, no `wallet_watchAsset` call is ever made, and **no address is fabricated**.
- **Burn = Proof of Fire.** Always labeled "Retires supply · Not minting · Not yield ·
  Not a price promise". Proposals become founder-gated candidates; nothing executes.
- **Sharing is prototype-only.** Opens public share intents with prototype text; generates
  **no image** and posts nothing on the user's behalf.
