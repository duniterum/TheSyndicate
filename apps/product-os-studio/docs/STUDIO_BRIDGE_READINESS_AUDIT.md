# STUDIO_BRIDGE_READINESS_AUDIT

## 1. Isolation verdict

- Studio is isolated under `apps/product-os-studio/`.
- Production does not import Studio code.
- Studio does not affect live production routes.
- Studio does not affect the production homepage.
- Studio does not affect contracts.
- Studio does not affect production auth.
- Studio does not affect deployment configuration.
- Studio remains prototype-only.

Caveats:

- The Studio is a standalone Vite app with its own `package.json`, `package-lock.json`, `vite.config.ts`, and `tsconfig.json`.
- The Studio contains mock data, simulated role flags, simulated wallet surfaces, and future-module UI that must not be treated as production truth.
- The Studio lockfile was normalized away from Replit-private package tarball URLs so it can install from the public npm registry in this repository.

## 2. What the Studio contains

The imported Product OS Studio contains a full visual/product prototype for the future Product OS:

- Public proof layer with public home, proof surfaces, learn, press, share, and toolkit routes.
- Member app shell with simulated connected, seated, and founder states.
- Simulated role model using `localStorage` flags for connected, seated, and founder mode.
- Account dropdown and member sigil components for member identity presentation.
- Wallet page with simulated balances, copy/status affordances, and import previews.
- Activity surfaces for public and member protocol heartbeat views.
- Economy / Transparency views showing the 70% / 20% / 10% routing doctrine.
- Registry views for protocol proof summaries and simulated registry records.
- Evolution surfaces for protocol episodes and future module status.
- Chronicle views for curated canon and historical protocol memory.
- Archive views for memory/milestone previews.
- Recognition views for contribution signals and public/member recognition previews.
- Fire / Proof of Burn views for simulated Proof of Fire records.
- Toolkit / Action Center surfaces driven from the action registry.
- Referral / Verified Introduction candidate surfaces, explicitly not live.
- Share / Proof Center for prototype sharing, proof cards, and public proof links.
- Press / Brand Kit surfaces with brand language and press materials.
- Learn / FAQ / Protocol Paper surfaces for explanatory doctrine.
- Founder Console for simulated founder review, truth-drift, and candidate decisions.
- Ledgers/registers including protocol graph, Fire Ledger, Registry, Chronicle, and proof matrices.
- Protocol graph surfaces that visualize module relationships and status.

## 3. What is visual/design reference only

These surfaces are not production truth and must stay labeled until replaced by real systems:

- `localStorage` role simulation.
- Mock wallet connection.
- Mock member seat.
- Mock addresses and inert explorer links.
- Mock balances.
- Mock transactions, hashes, receipts, approvals, and activity.
- Mock burn/fire values.
- Mock recognition signals and standings.
- Simulated referral/source/claim UI.
- Simulated DEX/LP/toolkit actions.
- Simulated founder/operator controls.
- Simulated share/proof cards where not chain-backed.
- Simulated Archive, Chronicle, Registry, and protocol graph records.
- Simulated notifications and private member settings.

## 4. What could be ported first as read-only UI

Recommended safe read-only sequence:

1. Hidden Product OS preview route.
2. Public proof preview components.
3. Public Activity preview.
4. Public Economy / Transparency preview.
5. Registry proof summary.
6. Recognition preview.
7. Fire / Proof of Burn preview.
8. Toolkit preview.
9. Share / Press / Learn assets.

These are the safest first candidates because they can be rendered as read-only, labeled preview surfaces without wallet writes, session authority, chain mutation, source activation, claim activation, or production homepage replacement. They can use static or mocked review data only when clearly labeled, while the production app keeps its current routing, auth, contracts, and deployment behavior untouched.

## 5. What requires real chain reads

These surfaces cannot become production truth without chain/indexer data:

- Member count.
- Purchase receipts.
- USDC routed.
- SYN acquired.
- Contract balances.
- Burn totals.
- Archive/NFT facts.
- Contract status.
- SourceRegistry records.
- LP/pair data if applicable.
- Token/address verification.
- Real explorer links.
- Seat ownership and historical membership facts.
- Any public proof card that claims an on-chain transaction, balance, burn, or receipt.

## 6. What requires backend/session/auth

These surfaces require backend or security work before production use:

- Real founder/operator gating.
- Signed wallet login.
- Server-side session.
- Founder/operator wallet allowlist.
- Protected admin APIs.
- Audit logging.
- Private member settings.
- Notification persistence.
- Handoff/release generator if it writes data.
- Any dashboard or review surface that changes production state.

`localStorage` founder mode is not production security.

## 7. What requires smart-contract work or deployment

These future modules cannot be real unless supported by deployed contracts, verified addresses, or explicit contract changes:

- Referral/source activation.
- Claim UI if any claim action is offered.
- SeatRecord721.
- ProductSaleRouter.
- SwapRail integration if contract-backed.
- Burn execution if not already supported.
- Archive/memory minting if not already supported.
- Any contract-backed import-token, LP, market, escrow, or payout flow.

## 8. What must remain inactive

Until a separate approved production integration sprint exists:

- No referral/source activation.
- No claim UI activation.
- No real founder controls.
- No real burn action.
- No fake DEX/LP links.
- No mock address as live.
- No localStorage auth as security.
- No homepage replacement without founder approval.
- No production import from Studio without approved integration sprint.
- No live wallet writes.
- No public source-aware buy path.
- No contract or registry switch.
- No production deployment from the Studio folder.

## 9. Tests and release guards required before production slices

Required checks before any Studio-inspired production slice:

- Typecheck.
- Route guard tests.
- Public/member/founder visibility tests.
- Noindex/labs guard.
- Fake-live label scan.
- Forbidden financial language scan.
- Chain-read fallback tests.
- Wallet-action disabled-state tests.
- Mobile smoke tests.
- Visual screenshots.
- Release checklist.
- No production imports from Studio unless explicitly approved.
- Sitemap/nav exclusion checks for hidden review routes.
- Source/referral/claim inactive checks.
- ZERO_SOURCE_ID default-source guard.
- No wallet-write and no activation-control guard for preview routes.

## 10. Recommended first hidden preview route

Recommended first bridge slice as a future task, not implemented now:

```txt
/labs/product-os-v1?review=SYNDICATE_PRODUCT_OS_V1
```

It should be:

- Hidden.
- Noindex/nofollow.
- Not in public nav.
- Read-only.
- No wallet writes.
- No real referral.
- No source links.
- No claim UI.
- No real founder controls.
- No fake live data.

It should show:

- Product OS visual shell preview.
- Public proof preview.
- Activity preview.
- Economy preview.
- Registry proof preview.
- Recognition preview.
- Fire / Proof of Burn preview.
- Toolkit preview.
- Share / Press / Learn links.
- Clear simulated/read-only labels.

## 11. Exact next Codex implementation task

Create hidden `/labs/product-os-v1` read-only preview route using selected Product OS Studio visual references. Do not replace homepage. Do not import the whole Studio. Do not activate anything. Use production-safe components and labels.

## 12. Founder decisions required

Founder decisions required before production implementation:

- Whether Product OS Studio visual direction is design-locked.
- Which public proof surfaces go live first.
- Which values must come from chain reads vs static docs.
- Whether Fire/Burn is public proof only or future action.
- Whether Recognition is public full board or preview.
- Whether Toolkit includes DEX/LP links at launch.
- When referral/source candidate graduates.
- Whether SeatRecord stays future.
- Founder/operator auth model.
- Whether Studio continues as design source after first production preview.
