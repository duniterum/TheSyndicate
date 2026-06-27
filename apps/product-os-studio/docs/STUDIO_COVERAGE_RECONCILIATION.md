# STUDIO_COVERAGE_RECONCILIATION

> **Audit artifact — not a rebuild.** This document reconciles the current Product OS
> Studio against the **original design prototype paper** (the founder's full
> website + member-app brief) used as a *coverage checklist*, and against the
> **production porting map** (`STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md`).
>
> Conclusion up front: **coverage is complete.** Every requirement in the original
> paper is present in the Studio (or superseded by a newer, more coherent layer),
> and every real on-chain constant is carried as `READ-ONLY PRODUCTION PROOF` —
> static, inert, nothing wired. This pass added **no features, no redesign, and no
> wiring**; it documents proof of coverage and made only trivial comment-format
> consistency edits.

Read `STATUS.md` and `STUDIO_KNOWN_SIMULATIONS.md` first. Posture is unchanged:
`SIMULATED` · `PROTOTYPE ONLY` · `NOT PRODUCTION` · `NOT CHAIN TRUTH`.

---

## Sources audited

| Source | Role |
|--------|------|
| Original prototype paper (founder brief: public site + logged-in member app) | Coverage checklist |
| `docs/STUDIO_PRODUCTION_FUNCTIONALITY_PORTING_MAP.md` | Production truth (bridge inventory) |
| `src/lib/mock-data.ts` (`PRODUCTION_PROOF`, `MOCK_DATA`) | Canonical + simulated data |
| `src/lib/navigation.ts`, `src/lib/surfaces.ts`, `src/lib/actions.ts` | IA / nav / toolkit single sources of truth |
| `src/App.tsx`, `src/components/role-gate.tsx` | Routing + shells + role gating |

## How to read the **Status** column

- **COVERED** — present and adequate at the depth the paper asks for.
- **SUPERSEDED** — the paper's request is met, but through a newer, more coherent
  layer than the literal description (routes/elements still present).
- **FUTURE / NOT LIVE** — intentionally a labeled future/candidate surface, exactly
  as the paper requires.
- **CORRECTED** — reconciled to production truth in this or a prior reconciliation.

---

## A. Original-paper coverage matrix

### App structure & navigation

| Paper requirement | Status | Studio location |
|---|---|---|
| Two connected experiences: public website + logged-in member app | COVERED | `App.tsx` `AppShell` swaps `PublicHeader`/`PublicFooter` ↔ `MemberShell` by path + `isConnected` |
| Public header (Home, Join, Activity, Transparency, Registry, Evolution, Archive, Referral Status, Docs/FAQ, My Syndicate, Connect, theme) | SUPERSEDED | `components/public-header.tsx` consolidates the proof routes under a **Proof** dropdown + Journey + Docs (`/learn`) + Share + Press + a **More** menu (official channels, enter app) + Connect/Join + theme toggle. All routes exist; IA is cleaner than a flat bar. |
| Footer (description, proof links, X, Telegram, "Public referral is not active", "No yield, no governance promise, no treasury claim"); no GitHub as public social | COVERED | `components/public-footer.tsx` — official X + Telegram only, doctrine + status + legal notes, prototype disclaimer |
| Logged-in app shell: left sidebar, top wallet/status bar, member chip, theme toggle, mobile drawer, quick actions | COVERED | `App.tsx` `MemberShell`; nav from `lib/navigation.ts` |
| Sidebar items 1–13 (Home, Join, My Syndicate, Wallet, Activity, Transparency, Registry, Evolution, Referral/Verified Introduction, Archive/NFT Memory, SeatRecord/Identity, Founder/Operator Review, Settings) | COVERED | `lib/navigation.ts` → pages: `member-home`, `join`, `my-syndicate`, `wallet`, `activity`, `transparency`, `registry`, `evolution`, `referral`, `archive`, `seat-record`, `founder-review`, `settings` |
| Every screen shows a clear status label | COVERED | Shared `components/ui/status-badge.tsx` used across pages |

### Screens

| Paper screen | Status | Studio location |
|---|---|---|
| Public Home (hero, the Loop, what's live grid, proof strip, member-journey preview, living-institution timeline, hard boundaries) | COVERED | `pages/public-home.tsx`; Loop = `MOCK_DATA.loop`, live grid = `MOCK_DATA.liveBoard`, boundaries section present |
| Join (connect/network/wrong-chain, USDC input, SYN preview, routing breakdown Vault/Liquidity/Operations, receipt, member card, contribution depth, capital footprint, ZERO_SOURCE_ID + "no public referral source", approve/buy, success, failed tx) | COVERED | `pages/join.tsx` (all states present); doctrine: identity binary, depth variable, footprint = verified USDC routed |
| My Syndicate (wallet, seat, member #, chapter, SYN acquired, USDC routed, contribution depth, capital footprint, receipts, routing proof, activity, archive, future SeatRecord, recognition axes) | COVERED | `pages/my-syndicate.tsx`; all 11 recognition axes in `MOCK_DATA.recognitionAxes` (Capital, Connector, Builder, Operator, Verifier, Historian, Steward, Infrastructure, Security, Legal/Compliance, Time/Loyalty) |
| Wallet (connected wallet, chain, AVAX/USDC/SYN balances, approvals, recent txns, status, explorer links, security reminders, wrong-chain/failed/pending) | COVERED | `pages/wallet.tsx`; gate vocab `unsupported · disconnected · wrongNetwork · ready` (+ `reconnect`/`stale`) mirrors production via `lib/adapters.ts`; no real writes |
| Activity (purchases, routing, archive, source-attribution lifecycle, milestones, proof badges, detail drawer, module filters) | COVERED | `pages/activity.tsx` + `pages/public-activity.tsx` |
| Transparency / Economy (total USDC routed, Vault/Liquidity/Operations, contract addresses, proof links, receipts, treasury explanation, no-entitlement/no-yield warnings) | COVERED | `pages/transparency.tsx` + `pages/public-economy.tsx`; acquisition-first framing → Net Routed → `70% / 20% / 10%` |
| Registry (MembershipSaleV3, SourceRegistryV1, SYN, USDC, Archive1155, future SeatRecord721, current source state, ZERO_SOURCE_ID, explorer links, live/paused/future cards) | COVERED | `pages/registry.tsx` + `pages/public-registry.tsx`; real addresses via `ContractCopyRow` from `PRODUCTION_PROOF`, badged `READ-ONLY PRODUCTION PROOF` with Snowtrace links |
| Evolution (module timeline, episodes, what became true, live/in-review/future/blocked, proof cards, next candidates) | COVERED | `pages/evolution.tsx` + `pages/public-evolution.tsx` |
| Referral / Verified Introduction (V1 CANDIDATE / SIMULATED / NOT LIVE; approved-introducer view + buyer view; V1/V2 candidate lists; no MLM/downline) | COVERED | `pages/referral.tsx` (introducer + buyer tabs, simulated copy-link) + `pages/public-referral-status.tsx`; source `paused`, `referralActive=false` |
| Archive / NFT Memory (Archive1155 objects, NFT cards, proof links, mint/read state, collection, memory timeline, current + future; NFTs are memory not seats/financial rights) | COVERED | `pages/archive.tsx` + `pages/public-archive.tsx` |
| SeatRecord / Identity (FUTURE / NOT LIVE; unresolved decisions: auto-mint vs claim, soulbound vs transferable, member #, chapter, depth, axes, recovery, privacy) | FUTURE / NOT LIVE | `pages/seat-record.tsx` (labeled FUTURE; `seatRecordLive=false`) |
| Founder / Operator Review (module status, live vs hidden vs future, production readiness, open decisions, release gates, GitHub/Replit/Production state, no-leakage checklist, approve/revise/defer/reject — prototype only) | COVERED | `pages/founder-review.tsx`, gated `Protected requirement="founder"`; hidden from member nav |
| Settings (profile, theme, wallet prefs, notifications, security, official channels, prototype disclaimers) | COVERED | `pages/settings.tsx` |
| Smart-contract architecture panel (layers with live/future, purpose, user action, event/receipt, read model, UI surface, risk, activation gate) | COVERED | `pages/architecture.tsx`; 9 layers in `MOCK_DATA.contractLayers` (the paper's 8 + `MembershipSaleV1` sealed read-only history), each with all 7 dimensions |

### Cross-cutting

| Paper requirement | Status | Studio location |
|---|---|---|
| Status vocabulary (LIVE NOW, READ-ONLY, IN REVIEW, V1 CANDIDATE, V2 CANDIDATE, FUTURE, BLOCKED NOW, SIMULATED PROTOTYPE) used consistently | COVERED | `components/ui/status-badge.tsx` |
| Contribution doctrine ("recognizes capital without reducing identity to capital"; identity binary, depth variable, footprint visible, recognition multi-axis); avoid yield/ROI/governance/treasury/MLM | COVERED | `MOCK_DATA.doctrine`; banned terms guarded by `lib/brand.ts` (allowed only inside negation disclaimers) |
| Mock data (wallet `0xDDF3…02BD0`, #9, Genesis Signal, 150 USDC, 15,000 SYN, source paused, ZERO_SOURCE_ID, referral/claim/source-dashboard/SeatRecord = false) | COVERED | `MOCK_DATA` in `lib/mock-data.ts` — matches the paper exactly |
| Interactions (sidebar nav, public header nav, app switch, theme toggle, expandable cards, tabs, mock wallet/txn states, disabled future buttons, tooltips, detail drawers, module filters, simulated copy-link animation, mobile menu) | COVERED | Across pages/components; theme via `lib/store.tsx` |
| Responsive (desktop/tablet/mobile; mobile drawer not just shrink) | COVERED | `public-header.tsx` mobile menu; responsive grids throughout |

---

## B. Newer layers (beyond the original paper) — confirmed coherent

These did not exist in the paper but extend it without contradicting it:

- **Public proof layer** (read-only, no-wallet mirrors): `public-activity`, `public-economy`,
  `public-registry`, `public-recognition`, `public-referral-status`, `public-evolution`,
  `public-chronicle`, `public-archive`, `public-fire`, `public-toolkit` — IA in `lib/surfaces.ts`.
- **Action toolkit**: `pages/toolkit.tsx` / `public-toolkit.tsx` from `lib/actions.ts`
  (visibility × tier × actionType classification, honest status labels, `EXTERNAL_RISK`).
- **Fire / Burn**: `pages/fire.tsx` / `public-fire.tsx` from `lib/fire-ledger.ts` —
  `PROOF_OF_FIRE_001` is `READ-ONLY PRODUCTION PROOF`; live scan is `ADAPTER REQUIRED`;
  aggregate burn is `SIMULATED`.
- **Chronicle**, **Share / Proof Center** (`pages/share.tsx`), **Learn/FAQ** (`pages/learn.tsx`),
  **Press / Brand Kit** (`pages/press.tsx` + `lib/brand.ts`).
- **Type-only adapter seams**: `lib/adapters.ts` (Wallet / MembershipSale / MemberIndex /
  Activity / SourcePolicy / Archive / BurnProof / Transparency / ContractRegistry) — types only,
  nothing wired. See `STUDIO_ADAPTER_SEAMS.md`.

---

## C. Truth & consistency scan results

| Scan | Result |
|---|---|
| Stale "porting map absent" / "no real address" / "no real burn" language | **None** (removed in prior reconciliation; porting map is PRESENT) |
| Visible routing-split format | Canonical **`70% / 20% / 10%`** everywhere in UI copy |
| Routing format in non-visible **dev comments** | Normalized to `70% / 20% / 10%` in this pass (`proof-card.tsx`, `protocol-graph.ts`) |
| Prompt-like / internal language in **visible copy** ("graph output", "return loop", "source truth") | **None** — occurrences are code comments or the `sourceTruth` property name, not UI text |
| "Product OS" in visible copy | Only inside the **Founder Console** (`founder-review.tsx`, "PROTOTYPE ONLY") — the allowed internal/studio context |
| Public social links | **X + Telegram only**; no GitHub as a public social link |
| `PRODUCTION_PROOF` constants vs porting map | **All 13 match verbatim** + `PROOF_OF_FIRE_001` (1,000 SYN, block 87,703,847) |
| Wallet gate vocabulary vs production | Matches: `unsupported / disconnected / wrongNetwork / ready` (+ `reconnect` / `stale`) |
| ProductSaleRouter / SwapRail (not in porting map) | Carried as **FUTURE / not-in-map concept**, not production truth |

---

## D. Boundaries — what remains simulated / future (unchanged)

Nothing was wired in this pass. The hard boundaries in `STATUS.md` and
`STUDIO_CODEX_HANDOFF.md` remain authoritative:

- No real auth (roles are `localStorage` flags, not security).
- No real wallet writes, chain reads, or contract calls — real constants are static
  `READ-ONLY PRODUCTION PROOF`; a live read is `ADAPTER REQUIRED`.
- Referral / source / claim / SeatRecord stay `V1 CANDIDATE` / `FUTURE`; source stays `ZERO_SOURCE_ID`.
- DEX / LP / import tools stay `BACKEND REQUIRED` and unverified.
- Burn is `CONCEPT ONLY` beyond `PROOF_OF_FIRE_001`; supply is retired (never minted),
  never yield, never a price promise.
- No truth label was removed or softened.

---

## E. No-drift / no-production-touch confirmation

- Only files under `apps/product-os-studio/` were touched.
- No production code was read from, written to, or imported.
- No redesign, no new features, no real wiring — this pass is documentation + trivial
  comment-format consistency only.

## F. Validation

Run from `apps/product-os-studio/`:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # vite build → dist/ (benign Radix "use client" sourcemap warnings only)
```

Both pass. See `STATUS.md` for the verification table.
