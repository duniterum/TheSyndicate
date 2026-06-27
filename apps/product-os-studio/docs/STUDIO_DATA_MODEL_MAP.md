# STUDIO_DATA_MODEL_MAP

> `SIMULATED` · `PROTOTYPE ONLY`. There is **no database, no API, no chain**. All data is
> static TypeScript in `src/lib/` plus a few `localStorage` flags. **Mock data is not live
> data.** Real deployed constants from the porting map appear as `READ-ONLY PRODUCTION PROOF`
> (static, inert); **nothing is wired.**

## Canonical vs simulated

`mock-data.ts` is explicit at the top: *"Canonical truths (routing split, ZERO_SOURCE_ID,
module statuses, doctrine) are accurate. Addresses and balances are SIMULATED unless
explicitly marked canonical."*

- **Canonical (accurate):**
  - `ROUTING_SPLIT = { vault: 70, liquidity: 20, operations: 10 }` and `routeUsdc(amount)`.
  - `defaultSourceId: "ZERO_SOURCE_ID"`.
  - `doctrine`: "The Syndicate recognizes capital without reducing identity to capital."
  - Module status vocabulary: `LIVE NOW` / `READ-ONLY` / `IN REVIEW` / `V1 CANDIDATE` / `FUTURE` / `SIMULATED PROTOTYPE`.
- **Simulated (everything else):** wallet/addresses, balances, member identity, receipts,
  activity, transactions, approvals, recognition standing, burns, chronicle, contract addresses.

## `MOCK_DATA` (key fields)

- **Identity / session (simulated):** `wallet`, `walletFull`, `memberNumber` (`#9`),
  `chapter` (`Genesis Signal`), `network` (`Avalanche C-Chain`).
- **Capital:** `usdcRouted`, `synAcquired`, `avaxBalance`, `usdcBalance`, `synBalance` are
  **simulated**. `routingWallets` (Vault/Liquidity/Operations) are **`READ-ONLY PRODUCTION
  PROOF`** (`proof: true`, `mocked: false`) — real wallets from the porting map, shown static
  with read-only explorer links (nothing wired). The 70/20/10 *math* is canonical.
- **Flags asserting what is NOT live:** `sourceStatus: "paused"`, `referralActive: false`,
  `claimUiActive: false`, `sourceDashboardLive: false`, `seatRecordLive: false`.
- **`protocolStats`** (`mocked: true`): chapter `10/333`, `members: 10`, `usdcRouted: 8450`,
  `protocolControlled: 7605`, `burnedSyn: 10000` (the **simulated** Fire total).
- **`trustBoundaries`** (negative guarantees, shown publicly): "No yield", "No passive
  income", "No governance promise", "No treasury claim", "No public referral activation",
  "No claim UI", "No source dashboard live", "No public source-aware buy path live",
  "NFTs are memory, not financial rights".
- **`recognitionAxes`** — 11 axes (Capital, Connector, Builder, Operator, Verifier,
  Historian, Steward, Infrastructure, Security, Legal/Compliance, Time/Loyalty).
- **`liveBoard`** — module → status → surface (drives the public "what's live" board).
- **`contractLayers`** — 9 layers, each with a `proof` boolean. `proof: true` rows
  (MembershipSaleV3, MembershipSaleV1, SourceRegistryV1 [PAUSED], SYN, USDC, Archive1155) are
  **`READ-ONLY PRODUCTION PROOF`** — real addresses from the porting map with read-only explorer
  links. `proof: false` rows (SeatRecord721, ProductSaleRouter, SwapRail) stay `FUTURE`
  placeholders with inert `#` links — not in the porting map. See
  `STUDIO_LEDGER_REGISTER_ARCHITECTURE.md`.
- **Simulated records:** `activities`, `transactions` (hashes fake, `explorerUrl: "#"`,
  `mocked: true`), `approvals`, `archiveItems`, `receipts`, `notifications`, `economy`.

## Derived / graph data (`protocol-graph.ts`)

- `PIPELINE` — the 7-stage backbone (raw-event → activity → candidate → memory → share →
  founder-review → public-update).
- `CLASSIFICATIONS` — 6 branches (recognition, evolution, chronicle, archive, share, fire).
- `PROTOCOL_EVENTS` — 10 simulated events, each `source: "simulated" | "future"`, each with
  a `founderDecision` (`n/a | pending | approved | declined | never`) and `activityRef` back
  to `MOCK_DATA.activities`.
- `CHRONICLE` — curated canon vs eligible vs activity-only (selective history).
- `RECOGNITION_BOARD` — anonymized contributor standing (signals, not money); the public
  projection relabels seats to opaque letters.
- Public-safe projections: `PUBLIC_HEARTBEAT`, `getPublicRecognitionBoard()` — strip
  member-personal identifiers.

## Burn data (`fire-ledger.ts`)

- `FIRE_LEDGER` — 3 burn events (founder/community/protocol), statuses `candidate` /
  `simulated`. Amounts sum to the simulated `burnedSyn` total (5000 + 2500 + 2500 = 10000).
- **Prototype entries have no `hash` / `explorerUrl`.** `getBurnSummary()` always returns
  `simulated: true`, `statusLabel: "SIMULATED PROTOTYPE"`. The one real record is
  `getProofOfFire()` → `PROOF_OF_FIRE_001` (1,000 SYN, Founder Burn, real tx + block, burn
  address), shown as `READ-ONLY PRODUCTION PROOF` with read-only explorer links — separate from
  the simulated aggregate; a live burn-event scan is `ADAPTER REQUIRED`.

## Session / preferences (`store.tsx` → `localStorage`)

> **These flags are UI state, NOT security.** A user can flip them in their own browser.

| Key | Default | Meaning |
|-----|---------|---------|
| `syn-connected` | `false` | Simulated wallet connected. |
| `syn-seated` | `true` | Simulated seat held. |
| `syn-founder` | `false` | Simulated operator/founder mode. |
| `theme` | `dark` | Light/dark. |
| `syn-density` | `comfortable` | UI density. |
| `syn-reduced-motion` | `false` | Reduce animation. |
| `syn-high-security` | `false` | Prototype privacy preference. |
| `syn-hide-balance` | `false` | Hide balances. |
| `syn-mask-address` | `false` | Mask addresses. |
| `syn-notify-evolution` | `true` | Notification preference. |
| `syn-notify-receipts` | `true` | Notification preference. |
| `syn-show-canonical` | `true` | Show canonical-vs-simulated annotations. |

`resetDemo()` restores the demo defaults. A demo role switch lives in **Settings →
"Prototype / Demo State"** for demonstration only — it grants **no real permissions**.
