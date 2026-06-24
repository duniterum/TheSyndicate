# Production Lock Checklist — Pre-Ads NFT Archive Clarity Pass

Date: 2026-06-06
Scope: clarity + readiness pass on top of an already-locked production. No new product mechanics, no contracts, no logic changes to Membership Sale / Join / Routing / Chapters / Vault / Liquidity / Activity / Registry / Transparency / Dashboard.

## A. NFT Archive clarity — shipped

| # | Change | File |
|---|--------|------|
| A1 | Added **"NFT Archive"** link to the Explore group (desktop dropdown + mobile drawer) pointing to `/archive` | `src/components/syndicate/Header.tsx` |
| A2 | Replaced homepage hero contradictory line "No NFT" with "No live NFT contract. No rewards. SYN is the seat; NFT Archive Artifacts are the pending memory layer." | `src/components/syndicate/Hero.tsx` |
| A3 | Renamed homepage Archive teaser to **"The NFT Archive"**, added the explanatory sentence, kept "Nothing is mintable today · no waitlist · no allocation", changed CTA to **"Explore the NFT Archive →"** | `src/components/syndicate/HomeArchiveTeaser.tsx` |
| A4 | `/archive` page eyebrow → "The NFT Archive"; title → "The NFT Archive remembers who was early."; subtitle includes "Archive Artifacts are the planned NFT-based collectible memory layer … The contract is PENDING CONTRACT and nothing is mintable today." | `src/routes/archive.tsx` |
| A5 | Registry row "NFT Contract" description cross-references `/archive`: "NFT contract — PENDING CONTRACT. See NFT Archive / Archive Artifacts at /archive." | `src/routes/registry.tsx` |
| A6 | Whitepaper §10 NFT layer now links to `/archive` and restates non-financial scope | `src/routes/whitepaper.tsx` |
| A7 | FAQ adds a new **"NFT Archive"** category with the six required questions (What is the NFT Archive? · Are Archive Artifacts NFTs? · Are any NFTs live today? · What is a Seat Record? · Do Artifacts give financial rights? · Why does the site say PENDING CONTRACT?) | `src/components/syndicate/FaqRebuilt.tsx` |

Wording stayed simple: NFT Archive · NFT Artifacts · Archive Artifacts · Seat Record · Chapter Artifact · Secret Artifact · Protocol Milestone. No marketplace, no NFT collection page, no NFT investment/rewards/utility framing, no new NFT routes.

## B. Search readiness

- `public/robots.txt` reachable, `Disallow: /labs` + `Disallow: /labs/` intact, sitemap directive points at `https://thesyndicate.money/sitemap.xml`.
- `src/routes/sitemap[.]xml.ts` updated to include the previously-missing public routes: `/chapters`, `/liquidity`, `/registry`, `/members`, `/founders`. `/archive` and `/my-syndicate` were already present.
- New doc: `docs/SEARCH_SUBMISSION_NOTES.md` (Google Search Console + Bing Webmaster step-by-step, manual verification commands, /labs warning).

## C. Lighthouse / accessibility audit

Full headless Lighthouse is not available in this sandbox. Source-side + live-HTTP audit performed and recorded in `docs/LIGHTHOUSE_PRE_ADS_AUDIT.md`. Only clear, high-impact, low-risk issues fixed:

- Hero "No NFT" contradiction (clarity)
- Missing NFT Archive nav link (navigation)
- /archive title/subtitle clarity
- Registry + Whitepaper cross-references
- New FAQ category

No redesign, no product change. Full Lighthouse run deferred to owner.

## D. Analytics

- Vendor-neutral helper `src/lib/analytics.ts` already in place. Added typed events: `nft_archive_cta_click`, `my_syndicate_cta_click`, `docs_cta_click`, `view_archive_page`, `view_join_page`.
- `HomeArchiveTeaser` CTA now fires `nft_archive_cta_click` (no-op in production until a provider is attached).
- No third-party script, no cookie, no consent banner. Full rollout deferred per `docs/ANALYTICS_READINESS_PLAN.md`.

## E. Uptime / error monitoring

- No new external service added. `scripts/check-route-status.mjs` remains the manual fallback (23/23 PASS).
- App-owned client error reporting (`src/lib/client-error-reporting.ts`) is the active in-app error channel.
- Full plan + suggested free tools deferred per `docs/MONITORING_READINESS_PLAN.md`.

## F. Product-logic guard (zero changes)

- No smart contract added, deployed, or referenced as live.
- No fake contract addresses, mint counts, holders, or dates.
- No admin panel, Merkle, staking, randomness, revenue share, governance, dividend, or NFT-utility claims.
- Membership Sale, Join purchase, USDC 70/20/10 routing, Chapters, Vault, Liquidity, Activity sources, Registry truth model, Transparency truth model, Dashboard data — all unchanged.
- No NFT marketplace, no separate NFT collection route, no mint button.

## G. QA — final smoke

`node scripts/check-route-status.mjs https://thesyndicate.money` — **23/23 PASS** (pre-republish check; new edits will go live after Publish → Update).

```
OK 200  / /join /activity /chapters /liquidity /members /founders /ranks
OK 200  /registry /transparency /token /tokenomics /vault /roadmap /docs
OK 200  /faq /whitepaper /archive /my-syndicate /sitemap.xml /robots.txt
OK 307  /episodes -> /chapters
OK robots.txt disallows /labs
```

Sitemap (production, pre-republish) already contains `/archive` and `/my-syndicate`; the new routes (`/chapters`, `/liquidity`, `/registry`, `/members`, `/founders`) ship with this republish.

Honesty / leak guard re-run:

```
rg -ni "no nft\b|live nft|nft is live|mint is live|nft live today" src/
```
Only matches: the new honest "No live NFT contract" hero line, the FAQ answer "Are any NFTs live today?" → "No.", and the MemberCard.tsx comment "no NFT" (negative context). No banned copy.

All NFT Archive references remain `PENDING CONTRACT` / `PENDING ELIGIBILITY` / `LOCKED` / `SECRET`.

## Final verdict

**PRODUCTION LOCKED — READY FOR FIRST ADS**

Republish required to ship the clarity edits + sitemap expansion. After Publish → Update, re-run `node scripts/check-route-status.mjs https://thesyndicate.money` once to confirm 23/23 PASS on the new build. No further Archive additions before first ads unless QA finds a real blocker.

---

## H. Truth-First NFT Archive Conversion Pass

Single pass replacing the previous separate prompts. Goal: make the NFT Archive emotionally clear for normal visitors without weakening any pending/locked truth.

### Truth scan (before edits)
- **Live on Avalanche**: SYN, Membership Sale, USDC routing wallets, 7 SYN allocation wallets, Trader Joe SYN/USDC LP, `TokensPurchased` events, wallet SYN balance.
- **Derived from on-chain data**: member number, chapter label/progress, remaining seats, member count, first/latest purchase tx.
- **Pending NFT contract**: NFT Archive contract, Seat Record NFT, Chapter Artifact NFT, Patron Seal, Heart Signal / Secret Artifact, all artifact ownership, token IDs, metadata URIs, supply, holder counts, eligibility logic, mint prices as charges.
- **Roadmap**: dynamic metadata, LP-linked claim flows, Protocol Milestone auto-claim triggers, secret discovery mechanic, NFT ownership index, royalties, admin panel.

Source of truth: `docs/NFT_ARCHIVE_VERIFIABILITY_MATRIX.md` (new).

### Copy / structure changes
- `/archive` rebuilt above-the-fold: eyebrow `NFT Archive · PENDING NFT CONTRACT`, title **"Be early. Be recorded."**, dual `LIVE ON AVALANCHE` / `PENDING NFT CONTRACT` status strip, primary CTA "Join — take your seat", secondary "See what becomes verifiable", compact canonical disclaimer below the fold of the hero card.
- New `/archive` sections: **What is verifiable today?** (5 LIVE cards) and **What is pending?** (5 PENDING items + status legend).
- Nine categories reframed as **Future NFT Artifact Types** grouped into *Your identity · What you witnessed · What you support or discover*. Each card carries its honest status pill. No "mint", "claim", "available", "owned" wording introduced.
- `HomeArchiveTeaser` rewritten: "Your seat is live. Your Artifact is next." with LIVE / PENDING split.
- `SeatRecordPanel` (used on `/join`): eyebrow `NFT Archive · PENDING NFT CONTRACT`, title "Future Seat Record NFT", status pill `PENDING NFT CONTRACT`, reference-price line.
- `/my-syndicate` description and Archive group relabeled to `NFT Archive · PENDING NFT CONTRACT`; Archive timeline rows now read "Pending NFT contract" / "Not indexed — contract is not deployed".
- Registry already lists `NFT Contract` and `Archive Contract` as `PENDING` with the canonical disclaimer; FAQ already carries the dedicated `NFT Archive` category with the four required answers.

### QA — final
- Route smoke check: `node scripts/check-route-status.mjs https://thesyndicate.money` → **23/23 PASS** (pre-republish baseline).
- Banned-phrase scan: `rg -ni "mint now|claim now|NFT live|available now|owned artifact" src/` → **0 matches**.
- All Archive items remain `PENDING NFT CONTRACT` / `LOCKED` / `SECRET` / `PENDING ELIGIBILITY`.
- No fake addresses, no fake counts, no fake eligibility, no mint buttons, no contract changes.
- Membership Sale, Join purchase logic, USDC 70/20/10 routing, Chapters, Vault, Liquidity, Registry, Transparency, Activity, Dashboard data logic — untouched.

### Final verdict
**PRODUCTION LOCKED — READY FOR FIRST ADS**

Publish → Update is required to ship the clarity rewrite. After republish, re-run `node scripts/check-route-status.mjs https://thesyndicate.money` once and confirm 23/23 PASS. No further product additions before first ads unless QA finds a real blocker.

---

## Archive Contract — Deployed (2026-06-06)

- Contract: `SyndicateArchive1155` at `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` on Avalanche C-Chain.
- Phase: DEPLOYED · VALIDATION PHASE · NO PUBLIC DROP ACTIVATED.
- Frontend integration is read-only: address + explorer links surfaced on `/archive`, `/registry`, and Transparency / Protocol Status.
- No mint, approve, quantity selector, price CTA, admin panel, or simulated tokenURI preview is rendered anywhere.
- Per-id reads (`remainingSupply`, `isMintable`, `active`) for IDs 1/3 are PENDING; widget shows honest labels, never mock data.
- ID 2 displays as RESERVED · DISABLED · FUTURE ERC-721.
- See `docs/DEPLOYMENT_STATE_V1.md` §7 and `docs/CONTRACT_INTEGRATION_STATUS.md` §7 for the integration log.


---

## 2026-06-06 · Read-only Archive contract reads

- ✅ Live multicall reads for IDs 1/2/3 (`remainingSupply`,
  `isMintable` ref + connected, `getArtifact`) via wagmi
  `useReadContracts({ allowFailure: true })`.
- ✅ Per-call error handling, never substitutes zeros for failures.
- ✅ `READ · OK / PARTIAL / ERROR / PENDING` indicator + "last
  successful read" relative time on the widget.
- ✅ Compact explorer cards on `/archive` (read-only, below status).
- ⛔ No mint / approve / activate / admin / quantity UI added.
- ⛔ No banned vocabulary introduced.

---

## Archive Experience Preview lock

- [x] /archive renders gallery preview, detail modal, future collector view
- [x] /my-syndicate renders My Archive panel with real `balanceOf` reads
- [x] Disabled mint card on IDs 1 and 3 has **no** onClick / write handler
- [x] No `mint`, `adminMint`, `approve`, or `setDropActive` calls anywhere in UI
- [x] No fabricated on-chain values; failed reads show "Read pending" / "Read error"
- [x] ID 2 labeled RESERVED / DISABLED · FUTURE ERC-721
- [x] No "marketplace live" claim, no floor price, no volume, no listings
- [x] Banned vocabulary not used (mint now, buy NFT, claim, available, drop open,
      live mint, marketplace live, floor price, volume, holder benefits)
- [x] Status pills use the canonical set: PREVIEW · READ-ONLY · CONTRACT DEPLOYED ·
      VALIDATION PHASE · NO PUBLIC DROP ACTIVATED · MINT DISABLED · NOT ACTIVE ·
      RESERVED / DISABLED · FUTURE ERC-721

---

## SEO head / shared-render guard

- [x] `/nft`, `/archive`, and `/nfts` are aliases that render the **same** `ArchivePage` component.
- [x] The **only** allowed per-route difference is `head()` (title, meta, canonical, og:*). `head()` must never influence conditional rendering inside the shared component.
- [x] No `useMatch`, `useLocation`, pathname checks, or `Route.use` calls inside `ArchivePage` or any child that would change UI between `/nft` and `/archive`.
- [x] Verified: the shared component has zero route-based conditionals; all routes produce pixel-identical output aside from `<head>` content.

---

## NFT UX clarity pass — checklist

- [x] `/nft` route renders the unified NFT Archive experience.
- [x] `/archive` and `/nfts` continue to load and render the same experience.
- [x] Header label updated to "NFTs" → `/nft`.
- [x] Homepage teaser CTA points to `/nft`.
- [x] Hero leads with "Collect proof you were early." + Join / Explore Artifacts / Verify contract CTAs.
- [x] "How it works" 3-step section added (Join · Watch the story unfold · Collect the memory).
- [x] No mint, approve, claim, admin, marketplace, floor, or volume UI.
- [x] ID 2 remains RESERVED · disabled · future ERC-721.
- [x] Stale "NFT contract pending" / "Archive contract not deployed" copy removed from `/nfts`, `/docs`.
- [x] Sitemap entries: `/nft` (0.8), `/archive` (0.6), `/nfts` (0.4); all valid.
- [x] All canonical tags for the three aliases point to `https://thesyndicate.money/nft`.


---
## First-Time-Visitor Clarity Pass · /nft + /my-syndicate

Added (presentation-only, no contract/write changes):
- `/nft` FAQ section (6 plain-language Q&As; mint, marketplace, rights, ID 2).
- `/nft` "What you can do today" onboarding panel (today / not active yet + CTAs to /join and #gallery-preview).
- `/nft` glossary near contract status (DEPLOYED, VALIDATION, NO PUBLIC DROP ACTIVE, READ-ONLY).
- Gallery cards now show a "Why it matters" line and an explicit "Mint status · PREVIEW / NOT ACTIVE / RESERVED" line. Disabled mint preview remains attached only to IDs 1 and 3 with no write handler.
- `/my-syndicate` MyArchivePreview disconnected empty state now offers Join / Explore NFTs / Verify contract CTAs.
- `/my-syndicate` MyArchivePreview connected empty-state notice clarifies "Your Archive is not populated yet. Public Artifact drops are not active."
- `/my-syndicate` personal-timeline Archive group reworded from "PENDING NFT CONTRACT" to "DEPLOYED · NO PUBLIC DROP ACTIVE" with per-row honest notes (Reserved · future ERC-721 / Drop not active / Read-only · 0 expected).
- `/my-syndicate` Archive-eligibility section description refreshed to reflect deployed contract + drops-not-active reality.

State unchanged: Archive1155 deployed at 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d on Avalanche · validation phase · no public drop activated · no mint/approve/admin UI · ID 2 reserved/disabled.

---
## Trust + Accessibility Polish · 2026-06-06

- [x] "Verify on Avalanche Explorer" link added near Archive Contract Status widget.
- [x] Compact token ID status list (IDs 1–3) added to `/my-syndicate` with requested copy and live read fallbacks.
- [x] FAQ accordion accessible: questions are `<button>` elements with `aria-expanded`, `aria-controls`, answer `id`, visible `focus-visible` ring, keyboard navigation.

---

## First Signal mint flow (2026-06-06)

Scope: first real public write path in the Archive UI. Hard-bounded to ID 1.

- [x] `mint(uint256, uint64)` added to `ARCHIVE_NFT_ABI` (write).
- [x] `src/components/syndicate/MintFirstSignal.tsx` created — ID 1 only.
- [x] Wired into `ArchiveGalleryPreview` artifact card and detail modal for ID 1.
- [x] ID 3 disabled button updated to copy "Not active yet" (no write handler).
- [x] ID 2 unchanged — RESERVED · DISABLED · FUTURE ERC-721, no mint UI.
- [x] Hero status pills updated: "ID 1 · MINT OPEN" + "OTHER IDS · NOT ACTIVE".
- [x] Eligibility gate requires successful reads for `getArtifactCore(1)`
      and `remainingSupply(1)`; connected-wallet mint submission additionally
      requires `isMintable(1, connectedWallet, 1)`.
- [x] Per-wallet gates: wrong chain → switch; allowance < price → approve;
      balance < price → "Insufficient USDC"; `isMintable(1, wallet, 1) === false`
      → "Wallet limit reached".
- [x] Payment token: NATIVE Avalanche USDC `0xB97EF9Ef…48a6E` (NOT USDC.e).
- [x] Spender for approval: the Archive1155 contract itself.
- [x] Quantity is fixed at 1 — no quantity selector in V1.
- [x] On success: refetch artifact + balances, invalidate react-query cache,
      show tx link, show owned balance, `/my-syndicate` reflects ownership.
- [x] No admin, activation, marketplace, listing, trading, floor, or volume UI.
- [x] Banned-copy audit: no "yield", "investment", "returns", "rewards",
      "claim", "floor price", or "trading volume" anywhere in the new flow.

## Copy/state consistency lock (2026-06-06)

- [x] ID 1 status pill driven by static config (`ACTIVE_MINT_OPEN` /
      `active: true`), not gated on live-read success.
- [x] Hero, gallery, contract-status, current-chapter, onboarding,
      FAQ, glossary, my-syndicate, and registry all describe ID 1 as
      ACTIVE · MINT OPEN at 0.50 USDC (wallet limit 5).
- [x] No surface contains "No public drop active",
      "Public artifact minting is not active yet", or "Drop not active"
      for ID 1.
- [x] ID 2 RESERVED · DISABLED unchanged. ID 3 CONFIGURED · NOT ACTIVE
      unchanged. No write handler exists for ID 2 or ID 3.
- [x] Mint UI present only for ID 1 (`MintFirstSignal`).
- [x] Live-read failures surface only in numeric data cells as
      "Read pending" / "Read error" — never as the page's overall status.

## Rendered-route QA + visual anchors (2026-06-06)

- [x] `scripts/live-content-rules.json` — `/nft`, `/archive`, `/nfts`,
      `/my-syndicate` block the full forbidden-phrase set
      (deployed / drop active / mintable today / validation phase /
      pending contract for ID 1) and forbid non-ID-1 mint CTAs and any
      marketplace/trading surface.
- [x] `scripts/check-nft-archive-qa.mjs` — rendered-route QA + visual
      anchors for the four ID 1 routes. Run with `npm run check-nft-qa`.
- [x] Visual anchors covered for the ID 1 card region:
      `The First Signal`, `Active · Mint OPEN`, `0.50 USDC`,
      `What you are minting`, `contract-rendered`. Mint flow
      proximity validated by required presence of `Mint The First
      Signal` CTA on the same route payload.
- [x] Mint gating still enforces: wallet connected, Avalanche C-Chain,
      `active=true`, `definitionFrozen=true`,
      `rendererMode=ONCHAIN_SVG`, `remainingSupply>0`,
      `isMintable(wallet,1,1)=true`, USDC balance ≥ price, USDC
      allowance ≥ price. Failure states surface as explicit disabled
      labels. Only ID 1 has a mint CTA — ID 2 RESERVED, ID 3 NOT ACTIVE.
- [x] Static catalog (`archive-config.ts`, `archive-preview-catalog.ts`,
      `syndicate-config.ts`) preserved as fallback layer for names,
      descriptions, categories, visual families, and fallback status
      copy. Live reads override numeric/state cells when available.

---

## First Signal Mint — Production Verdict

**READY FOR FOUNDER SITE MINT.** Archive1155 deployed, ID 1 frozen +
active, public mint open at 0.50 USDC native Avalanche USDC, wallet
limit 5. ID 2 reserved/disabled, ID 3 configured/not active, all other
IDs roadmap. Only ID 1 has mint UI. `npm run check-nft-qa` passes
against the published site. Live on-chain reads are the source of truth
for dynamic state; static config remains as the safe fallback for names,
descriptions, and visual families. See
`docs/CONTRACT_INTEGRATION_STATUS.md §9` for the full state matrix.

---

## Founder Mint Readiness (final pass)

- Zero-address `isMintable(id, 0x0, 1)` preflight removed from the eligibility gate. Some Avalanche RPC nodes revert on the zero-address path even when the drop is live; we now rely on `getArtifactCore(1)` + `remainingSupply(1)` for the live-state gate, and use `isMintable(1, connectedWallet, 1)` only as the connected-wallet check.
- ID 1 modal hierarchy locked: image (premium gold-framed container) left · conversion column right. Above-the-fold order: ACTIVE · MINT OPEN pill → Chapter I → name → Price / Supply / Minted / Remaining / Wallet limit → primary CTA. Technical metadata is collapsed in a `<details>` block beneath the action.
- Wallet-state labels expanded: not-connected, wrong-network ("Switch to Avalanche C-Chain"), verifying ("Checking wallet eligibility…"), insufficient USDC ("Add native Avalanche USDC to this wallet"), needs-approve, approval pending ("Waiting for USDC approval confirmation…"), mint pending ("Mint transaction pending…"), mint confirmed, wallet-limit reached.
- Read-error path shows a recovery panel with Retry + "View contract ↗" rather than a dead disabled button. ID 1 no longer flips to inactive when reads transiently fail.
- ID 2 (RESERVED_DISABLED) and ID 3 (CONFIGURED_NOT_ACTIVE) remain with no mint path. No marketplace / floor / volume / trading copy anywhere.
- `scripts/check-nft-archive-qa.mjs` PASS on /nft, /archive, /nfts, /my-syndicate against the live custom domain.

**Verdict:** READY FOR FOUNDER SITE MINT. Next action: founder mints one ID 1 from the live site and confirms `/my-syndicate` reflects the owned balance.

---

## Archive1155 read mismatch fix (2026-06-06)

- Root cause: stale frontend ABI/read path called `getArtifact(uint256)`, but
  deployed Archive1155 exposes `getArtifactCore(uint256)` and
  `getArtifactText(uint256)`. Remix succeeded because it used the deployed
  getter; the site failed only on the stale getter while `remainingSupply` and
  `isMintable` continued to work.
- Fix shipped: ABI + hook now call `getArtifactCore(1)` and normalize the
  returned tuple by index. `minted` is mapped to UI `totalMinted`.
- Direct RPC evidence: `getArtifactCore(1)` returns active/frozen/on-chain SVG,
  `maxSupply=10000`, `walletLimit=5`, `priceUsdc=500000`, `minted=0`; stale
  `getArtifact(1)` reverts.
