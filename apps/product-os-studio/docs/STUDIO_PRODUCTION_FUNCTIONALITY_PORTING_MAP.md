Studio Production Functionality Porting Map
Status: BRIDGE INVENTORY ONLY
Audience: Replit 2 Studio build, Codex production bridge work
Boundary: This document does not implement UI, routes, auth, chain reads, writes, claims, source activation, burn actions, contract changes, or production deployment.
1. Purpose
Product OS Studio already owns its visual system inside apps/product-os-studio/. Codex should not redesign it. Codex's role is to identify the proven production machinery, define safe adapter seams, and later port approved slices into Studio without weakening production truth.
This map tells Replit 2 which production functions may be copied as visual/reference patterns, which systems must remain simulated or blocked in Studio until Codex ports real adapters, and which production boundaries are non-negotiable.
2. Production Truth Inventory
Wallet and connection
Production uses injected wallet connection on Avalanche C-Chain through:
src/lib/wagmi.tswagmiConfig
custom avalanche chain derived from wagmi/chains
injected({ shimDisconnect: true })
fallback([...AVALANCHE_RPC_ENDPOINTS.map(http)], { rank: false, retryCount: 1 })

src/components/syndicate/Web3Provider.tsxwraps the app in WagmiProvider.

src/routes/__root.tsxmounts Web3Provider, PurchaseEventsHydrator, WalletAccountSynchronizer, ReferralCapture, route outlet, mobile join bar, wallet debug panel, and stale-build banner.

src/components/syndicate/HeaderWalletChip.tsxconnection chip, network state, My Syndicate/wallet/join links, switch to Avalanche, disconnect.

src/lib/useWalletGate.tscanonical action gate.
statuses: unsupported, disconnected, wrongNetwork, ready.
actions: connectWallet, switchToAvalanche, reconnect, disconnect.

src/components/syndicate/WalletGate.tsxreusable UI gate around useWalletGate.

src/components/syndicate/WalletAccountSynchronizer.tsxdetects injected account drift with readInjectedAccounts, sameAddress, and subscribeInjectedAccountsChanged.

src/lib/wallet-freshness.tspre-write freshness checks used by sale and Archive mint flows.

Studio may copy the state vocabulary and interaction model. Studio must not wire real wallet connection, real chain reads, or write controls until a dedicated bridge task ports the providers and gates.
RPC and chain reads
Production RPC truth lives in:
src/lib/syndicate-config.tsAVALANCHE_CHAIN_ID = 43114
AVALANCHE_RPC_URL
AVALANCHE_RPC_URL_FALLBACK
AVALANCHE_RPC_ENDPOINTS
readEnvUrl() accepts only HTTPS URLs.
comments explicitly warn that VITE_ RPC URLs are browser-visible and must not contain unrestricted secrets.

src/lib/archive-rpc-health.tsdirect eth_chainId health probe for configured endpoints.

src/lib/chain-time.tsshared chain tip reads.

src/lib/freshness-signals.tscombines RPC head, event head, indexer status, and lag signals.

Production chain reads use Wagmi/Viem hooks such as usePublicClient, useReadContract, and useReadContracts. Common callers include src/lib/sale-hooks.ts, src/lib/activity-hooks.ts, src/lib/onchain-events.ts, src/lib/archive-nft-hooks.ts, src/lib/archive-mint-events.ts, and src/lib/syn-burn-events.ts.
Studio should model these as adapter-backed read states: notConnected, wrongNetwork, loading, live, partial, error, and stale. Studio should not call RPC directly from its prototype until Codex installs a bounded adapter.
Smart contracts and constants
Core production constants are in src/lib/syndicate-config.ts:
SYN: 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170
USDC: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E
V1 Membership sale: 0x0020Df30C127306f0F5B44E6a6E4368D2855842d
Membership SYN wallet: 0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8
Vault wallet: 0x205DdC8921A4C60106930eE35e1F395c8D13f464
Liquidity wallet: 0xa9b072db8DcDbb470235204B69D37275d74a2e25
Operations wallet: 0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80
Trader Joe SYN/USDC LP pair: 0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389
Archive1155: 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d
SourceRegistryV1: 0x780013bB358be6be95b401901264FC7c22a595a6
MembershipSaleV3: 0x2A6cFc76906e758B934209AFf5A163c9bC20132E
ABIs and contract-specific helpers:
src/lib/sale-abi.tsSALE_ABI, SALE_V2_ABI, SALE_V3_ABI, ERC20_ABI, PAIR_ABI.

src/lib/archive-nft-abi.tsARCHIVE_NFT_ABI, Archive tuple normalization.

src/lib/source-registry-abi.tsSourceRegistry read/event ABI.

contracts/src/MembershipSaleV3.sollive V3 sale engine.

contracts/src/SourceRegistryV1.soldeployed source policy registry.

contracts/src/SyndicateArchive1155.sollive Archive protocol-memory ERC-1155.

Studio may copy addresses for static proof panels only if they remain clearly read-only. Studio must not import ABIs or call contracts until Codex creates the bridge adapter.
Join and buy membership
Production join/buy flow:
src/routes/join.tsxrenders the membership purchase page and production explanation surfaces.

src/components/syndicate/LivePurchase.tsxcanonical self-service purchase UI.
uses useWalletGate, useSaleStats, useUserBalances, useWalletEraCap, useQuoteSyn, useV1Proof, useHolderIndex, getV3HistoricalMember, assertFreshWallet, recordTx, useMintHashPersistence, classifyTxError, and buildMembershipCommerceReceipt.
approval write: ERC20.approve(SALE, usdcRaw).
buy write for active V3: MembershipSaleV3.buy(usdcRaw, address, ZERO_SOURCE_ID, minSynOut, []).
buy write for V2 history path uses buildV2BuyArgs.
success invalidates purchase/activity/chain-tip queries immediately and again after 4s, 12s, and 30s.
two signatures are explicit: approve USDC first, then buy membership.

src/lib/sale-hooks.tsuseSaleStats()
useUserBalances()
useWalletEraCap()
useBuyerPurchaseTotals()
useQuoteSyn()
useLpStats()
useAllocationBalances()
exports ZERO_SOURCE_ID.

Current public/default V3 buys use ZERO_SOURCE_ID. Studio must not show a real buy button, approval button, source-aware buy path, non-zero source selector, or claim path until Codex ports and tests the production adapter.
Activity, receipts, and member read model
Production has a real read model:
src/lib/activity-hooks.tsuseLivePurchaseEvents()
scans V1, sealed V2a, historical V2b, and active V3 purchase events.
parses V3 MembershipPurchasedV3, including source receipt fields.
mergePurchaseEvents(), computeIncrementalScanStart(), joinV2PurchaseEvents(), purchaseLabel().
chunked 2,000-block scans with reorg overlap and local cache.

src/lib/onchain-events.tsuseUsdcFlows()
useLpSwaps()
useLpLiquidityEvents()
firstSeenBuyers()

src/lib/protocol-events.tsuseProtocolEvents()
unifies purchases, LP swaps, LP liquidity, vault flows, Archive mints, and SYN burns.
enrichEvent() adds category, labels, verification link, status, metric effects, chronicle eligibility, and recommended surfaces.

src/lib/holder-index.tsbuildHolderIndex()
useHolderIndex()
member identity comes only from sale purchase events.
capital footprint fields include cumulative USDC, cumulative SYN, routed Vault/Liquidity/Operations, largest ticket, last purchase, current rank, next rank, chapter, and eligibility.

src/components/syndicate/PurchaseEventsHydrator.tsxrestores cached purchase events into TanStack Query after hydration.

Studio may adapt visual receipt/activity shells. It must not fabricate live member identity, rank, source receipts, Archive mints, burn counts, or money movement. Until adapters exist, sample data must remain labeled as prototype/static.
Registry, transparency, and economy
Production transparency surfaces are backed by constants, contract reads, and event scans:
src/routes/registry.tsx
src/routes/transparency.tsx
src/components/syndicate/VerifyEverything.tsx
src/components/syndicate/TransparencyCenter.tsx
src/components/syndicate/ContractDossiers.tsx
src/components/syndicate/RoutingFlow.tsx
src/components/syndicate/ProtocolEconomyBand.tsx
src/components/syndicate/TreasuryComposition.tsx
src/components/syndicate/UseOfFunds.tsx
src/lib/contract-registry.ts
src/lib/protocol-truth.ts
src/lib/data-verification-registry.ts
Canonical routing:
USDC_ROUTING70 percent Vault wallet.
20 percent Liquidity wallet.
10 percent Operations wallet.

MembershipSaleV3 source-aware math, when approved later, is acquisition-first: gross USDC minus acquisition commission equals Net USDC Routed, then Net USDC Routed splits 70/20/10.
CommissionRouterV1 is not the active V3 source engine.
Studio should reuse the distinction between gross USDC, acquisition cost, Net USDC Routed, and the 70/20/10 split. It must not imply treasury rights, yield, governance rights, ownership, employment, or guaranteed returns.
Referral and source attribution
Production truth:
src/lib/source-policy-observability.tsZERO_SOURCE_ID
INTERNAL_PROTOCOL_TEST_SOURCE_001
CURRENT_SOURCE_POLICY_SNAPSHOT
buildSourcePolicySnapshot()
product capability map showing MembershipSaleV3 source-aware technical capability, Archive1155 not source-aware, and future modules needing separate design.

src/lib/source-registry-lifecycle.tsSourceRegistry lifecycle event vocabulary and public boundary summaries.

src/routes/referral.tsxroute is noindex,nofollow.
public copy says source attribution is pending, one internal source record is PAUSED, no commission, no claim.

src/components/syndicate/MyReferralCard.tsxmember cockpit shell says no live link, no balance, no claim UI, no commission accruing.

src/components/syndicate/ReferralCapture.tsxcaptures first-touch ?ref= into localStorage only; no reward, contract, or on-chain write.

Current source truth:
One internal protocol-test source exists and was used for one controlled V3 buy.
The source was returned to PAUSED.
referralActive: false.
claimingActive: false.
publicSourceAwareBuyPathActive: false.
Public/default buys remain ZERO_SOURCE_ID.
Studio may copy the source status vocabulary and proof fields. Studio must not create public source links, source dashboards, claim UI, non-zero source buy paths, activation switches, or source earnings displays.
Archive and NFT memory
Production Archive truth:
src/lib/archive-nft-hooks.tsread-only aggregate contract reads for remaining supply, mintability, artifact core, pause state, owner, and treasury.
unknown reads stay unknown; unreadable pause state must not become "mint open."

src/lib/archive-id-registry.tscanonical Archive ID metadata.

src/lib/archive-mint-events.tsArchive mint event scanner.

src/lib/archive-safe-reads.tssafer granular Archive reads.

src/components/syndicate/MintFirstSignal.tsxwrite path for Archive1155 ID 1.

src/components/syndicate/MintPatronSeal.tsxwrite path for Archive1155 ID 3.
hardcoded ID 3, quantity 1, parent-gated, rechecks active/mintable/paused state.
approve exact USDC, then Archive1155.mint(3, 1).

Archive contract state from src/lib/syndicate-config.ts:
Archive1155 is deployed on Avalanche C-Chain.
ID 1 is public-open First Signal.
ID 2 is a reserved/disabled pointer to future SeatRecord721.
ID 3 is Patron Seal and read-gated/mint-gated by live contract state.
Critical boundary:
Archive1155 does not accept sourceId.
Archive mints are protocol memory, not seats.
Future ERC-721 or SeatRecord work is not deployed and must not be represented as active identity, rights, governance, yield, or treasury ownership.
Studio may adapt Archive memory visuals and read states. Studio must not wire mint writes, imply Archive source commissions, or present future NFT identity as live.
Fire and burn
Production has real burn proof, not a simulated fire ledger:
src/lib/syndicate-config.tsSYN_BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD
SYN_BURN_ADDRESS_LABEL
PROOF_OF_FIRE_001amount: 1,000 SYN
category: Founder Burn
tx: 0x2db110b1406bdee0bb98a0ad9a8c941052fbe02049d99b30a3b09934d6a12d47
block: 87_703_847


src/lib/syn-burn-events.tsuseSynBurnEvents()
scans SYN Transfer events to the burn address.
assignProofOfFireNumbers()
numbers burns only when the scan is complete and gapless.
distinguishes Founder Burn vs community burn from known-address registry.

src/lib/__tests__/syn-burn-events.test.tsverifies numbering behavior.

src/components/syndicate/VerifyEverything.tsxverifies Proof of Burn as a manual transfer to the dead address.

Boundary:
The protocol has no automated burn.
A burn is a manual, verifiable SYN transfer to the burn address.
Burns are recognition/memory records, not price impact, ROI, yield, or scarcity promises.
Studio must not simulate real burns as live, expose burn write controls, or imply burns create financial returns.
Share, press, and learn surfaces
Relevant production files:
src/components/syndicate/ShareActions.tsx
src/lib/protocol-commerce-receipt.ts
src/components/syndicate/RouteFinalCTA.tsx
src/routes/knowledge-map.tsx
src/routes/evolution.tsx
Studio may reuse share/receipt language only after the source data comes from approved adapters. Do not generate share cards that claim a live source, claimable balance, governance right, yield, or launched module unless the production adapter proves it.
3. Studio Adaptation Guidance
Replit 2 may adapt the production machinery into Studio design in this order:
Read-only status language.LIVE, PARTIAL, PENDING, PAUSED, RESERVED, NOT_SOURCE_AWARE, FUTURE_DESIGN_REQUIRED.

Wallet and network state shells.Keep connect/switch/disconnect as visual or mock states until Codex ports Web3Provider, wagmiConfig, and useWalletGate.

Membership receipt and activity shapes.Model purchase, member, rank, routing, Archive, and burn events from the production schemas, but keep them static unless adapter-fed.

Source/referral boundaries.Show source policy as paused/read-only. No live referral, source link, claim, non-zero public source path, or earnings dashboard.

Archive memory.Treat Archive as protocol memory. Do not merge it with member seat identity or source payouts.

Burn proof.Represent verified burn transfers and their proof links. Do not show burn execution controls.

Preferred Studio labels:
"Connected to adapter" only after Codex ports an adapter.
"Prototype data" for local Studio placeholders.
"Read-only production proof" for static links or constants copied from production.
"Requires Codex bridge" for any live read/write feature not yet wired.
4. Adapter Seams to Create Later
Codex should create adapters before Studio receives real data. Suggested seams:
WalletAdapterstatus, address, chainId, wrongNetwork, connect, switchToAvalanche, disconnect, reconnect.
production source: src/lib/useWalletGate.ts, src/lib/wagmi.ts.

MembershipSaleAdaptersale stats, quote, balances, allowance, era cap, approve, buy, receipt status.
production source: src/lib/sale-hooks.ts, src/components/syndicate/LivePurchase.tsx.

MemberIndexAdaptermember record, capital footprint, rank, chapter, member number, eligibility, totals.
production source: src/lib/holder-index.ts, src/lib/activity-hooks.ts.

ActivityAdapterunified protocol events, source health, freshness, verification links.
production source: src/lib/protocol-events.ts, src/lib/freshness-signals.ts.

SourcePolicyAdaptersource records, lifecycle facts, active/paused/revoked counts, public boundary flags.
production source: src/lib/source-policy-observability.ts, src/lib/source-registry-lifecycle.ts.

ArchiveAdapterartifact reads, ownership/treasury reads, mint event history, pause state.
production source: src/lib/archive-nft-hooks.ts, src/lib/archive-safe-reads.ts, src/lib/archive-mint-events.ts.

BurnProofAdapterburn transfer events, proof numbers, complete/partial scan status.
production source: src/lib/syn-burn-events.ts.

TransparencyAdaptercontracts, allocation wallets, routing, LP stats, explorer links.
production source: src/lib/syndicate-config.ts, src/lib/contract-registry.ts, src/lib/protocol-truth.ts.

Adapters should return plain typed data and status flags. Studio components should consume adapters, not import production routes or write components directly.
5. What Replit 2 May Safely Copy Or Adapt
Replit 2 may copy or adapt:
Visual state vocabulary from production.
Static contract/address proof tables if labeled read-only.
Receipt field names from buildMembershipCommerceReceipt() and buildArtifactMintCommerceReceipt().
Member/rank/chapter labels from RANKS_V2, HOME_RANK_LADDER, and src/lib/chapters.ts.
Event category shapes from src/lib/protocol-events.ts.
Source/referral copy that says inactive, paused, no claim, no public source-aware buy path.
Archive memory labels for First Signal, reserved SeatRecord pointer, and Patron Seal, if status is clear.
Burn proof language that describes manual verified transfers to the burn address.
Guard copy that distinguishes approve from buy.
All copied examples must stay visually read-only unless Codex has installed a real adapter.
6. What Replit 2 Must Not Copy As Live
Replit 2 must not copy these as live behavior:
useWriteContract, writeContractAsync, useWaitForTransactionReceipt, or real approval/buy/mint controls.
LivePurchase as a working Studio widget.
MintFirstSignal or MintPatronSeal as working mint widgets.
Any non-zero sourceId public/default buy path.
Any public source-aware link.
Any claim UI, source balance, source dashboard, payout dashboard, source activation switch, or source earnings estimate.
Any Archive source-attribution claim.
Any future ERC-721/SeatRecord/NFT identity as live.
Any burn action or burn execution control.
Any copy implying founder identity, governance, yield, treasury rights, financial rights, employment, guaranteed return, or ownership can be bought.
Any "wealth leaderboard" framing.
Any use of RPC URLs as private secrets. VITE_ values are public.
7. What Codex Must Implement Later
Codex, not Replit 2, should later implement:
The hidden preview route bridge, if still approved.
Adapter boundary files between production data and Studio UI.
Production-safe provider mounting for Studio preview surfaces.
Wallet gate integration.
Read-only production data adapters.
Transaction adapters only after explicit founder approval.
Source-aware buy path only after separate legal/product/readback approval.
Claim UI only after separate escrow, legal, accounting, and UX approval.
Archive mint bridge only after separate approval.
Burn proof adapter only as read-only unless a separate burn ceremony is approved.
Guard tests ensuring Studio does not activate production behavior accidentally.
8. Recommended Workflow
Replit 2 keeps building Studio UI in apps/product-os-studio/ with prototype data.
Replit 2 replaces invented Studio semantics with the production truth vocabulary in this document.
Replit 2 marks every non-adapter-backed live value as prototype/static/read-only.
Codex creates one adapter seam at a time, starting with read-only status and member/activity data.
Codex adds tests for each bridge before exposing it to Studio.
Founder reviews hidden preview only.
Only after explicit approval should Codex wire wallet writes, source activation, claim UI, Archive minting, burn actions, or any public route.
The immediate first adapter candidate should be read-only MemberIndexAdapter plus ActivityAdapter, because they show proven production status without introducing signing, transactions, claims, source activation, or mint controls.
Inspection Notes
Inspected production areas:
Wallet/provider/root: src/lib/wagmi.ts, src/components/syndicate/Web3Provider.tsx, src/routes/__root.tsx, src/components/syndicate/HeaderWalletChip.tsx, src/lib/useWalletGate.ts, src/components/syndicate/WalletGate.tsx, src/components/syndicate/WalletAccountSynchronizer.tsx.
Sale/join: src/routes/join.tsx, src/components/syndicate/LivePurchase.tsx, src/lib/sale-hooks.ts, src/lib/v1-proof.ts, src/lib/v3-historical-members.ts.
Activity/read model: src/lib/activity-hooks.ts, src/lib/onchain-events.ts, src/lib/protocol-events.ts, src/lib/holder-index.ts, src/components/syndicate/PurchaseEventsHydrator.tsx.
Source/referral: src/lib/source-policy-observability.ts, src/lib/source-registry-lifecycle.ts, src/routes/referral.tsx, src/components/syndicate/MyReferralCard.tsx, src/components/syndicate/ReferralCapture.tsx.
Archive/NFT: src/lib/archive-nft-hooks.ts, src/lib/archive-id-registry.ts, src/lib/archive-mint-events.ts, src/lib/archive-safe-reads.ts, src/components/syndicate/MintFirstSignal.tsx, src/components/syndicate/MintPatronSeal.tsx.
Burn/fire: src/lib/syndicate-config.ts, src/lib/syn-burn-events.ts, src/lib/__tests__/syn-burn-events.test.ts, src/components/syndicate/VerifyEverything.tsx.
Transparency/economy: src/routes/registry.tsx, src/routes/transparency.tsx, src/components/syndicate/VerifyEverything.tsx, src/components/syndicate/TransparencyCenter.tsx, src/components/syndicate/ContractDossiers.tsx, src/components/syndicate/RoutingFlow.tsx, src/lib/contract-registry.ts, src/lib/protocol-truth.ts.
Studio boundary docs: apps/product-os-studio/docs/PRODUCTION_BOUNDARY.md, apps/product-os-studio/docs/STUDIO_BRIDGE_READINESS_AUDIT.md, apps/product-os-studio/docs/STUDIO_KNOWN_SIMULATIONS.md, apps/product-os-studio/STATUS.md.
No production behavior should change from this document. It is documentation only.