# THE SYNDICATE — DATA SOURCE MAP

Every data source the UI reads from. Audit only.

## Legend
- **LIVE**: direct on-chain read via wagmi/viem.
- **DERIVED**: built on top of LIVE reads (no new I/O).
- **INDEXER**: would require an off-chain index (not currently shipped — all
  reads happen client-side via RPC).
- **EXTERNAL**: third-party API or DEX widget.
- **CONFIG**: static TS config.
- **STORAGE**: browser localStorage (per-device).

---

## Hooks & sources

| Source | Kind | Reads | Fields exposed | Pages | Scaling risk | Cache/indexer need | Anti-rewrite notes |
|---|---|---|---|---|---|---|---|
| `useHolderIndex` | DERIVED on LIVE | scans `TokensPurchased` events, derives ordered holder list, chapters, ranks | members[], chapters, rank distribution, by-address lookup | `/members`, `/founders`, `/chapters`, `/ranks`, `/wallet/$address`, home, member card | **High** at ~10k+ holders — RPC log scan | Indexer eventually | **See `HOLDER_INDEX_ARCHITECTURE.md` — DO NOT rewrite**; Wave 3A addendum on windowed deltas. |
| `useSaleStats` | LIVE | `SyndicateMembershipSale` view functions | total raised USDC, SYN distributed, sale state | `/join`, `/transparency`, home strips | Low | None | Single source of truth for raised. |
| `useLivePurchaseEvents` | LIVE | event log scan for `TokensPurchased` | recent purchases | `/activity`, `/transparency`, home feed | Medium | Indexer later | Shares scan budget with `useHolderIndex`; do not duplicate calls. |
| `useProtocolPulse` (`protocol-pulse.ts`) | DERIVED | composes sale + events + LP | rolling counts, last buy, next member # | home pulse strip, recency | Low | None | Pure derivation. |
| LP hooks (`treasury-hooks.ts` + LP reads in `LpStatus`) | LIVE | Trader Joe pair contract reserves | reserves, price, TVL | `/liquidity`, home, transparency | Low | None | — |
| Wallet balance reads (`wagmi useBalance`, ERC20 balanceOf) | LIVE | RPC | SYN + USDC balance per address | `/wallet/$address`, `/join` | Low | None | — |
| `useLiveRecency` (in `LiveRecencyStrip` + `protocol-pulse`) | DERIVED | most recent purchase | last-event timestamp, member count, chapter forming | home recency strip | Low | None | — |
| Registry config | CONFIG | `syndicate-config.ts` | contract + wallet addresses, labels | `/registry`, footer, transparency | None | None | Must be updated when contracts change. |
| `MilestoneTracker` | CONFIG + DERIVED | thresholds in config vs live counts | milestone progress | home, `/milestone/$id` | Low | None | — |
| OG server data (`og-data.server.ts`) | LIVE (server) | reads on-chain for OG render | per-wallet + per-milestone snapshots | dynamic OG routes | Low | Edge cache | Server-only. |
| `visitor-memory.ts` | STORAGE | localStorage | last visit time, last seen counts | `SinceYourLastVisit`, home | None | None | Per-device only — by design. |
| `quest-hooks.ts` | DERIVED | wallet + sale | quest progress | `QuestProgress` (member card area) | Low | None | — |
| `leaderboard-hooks.ts` | DERIVED on holder index | aggregate distribution | rank distribution, member counts | `/ranks`, `/members` | Inherits holder-index risk | — | Name is legacy — see code health. |
| `activity-hooks.ts` | DERIVED | wraps event hooks | unified feed entries | activity feed, timeline | Low | — | — |
| `chain-time.ts` | LIVE | block timestamps | block→time helper | timeline | Low | — | — |
| DexScreener chart | EXTERNAL | DexScreener iframe/widget | SYN/USDC price chart | `/liquidity` | None | None | Third-party; degrade gracefully if blocked. |
| Snowtrace links | EXTERNAL | hyperlinks only | proof links | everywhere | None | None | — |
| Docs/FAQ/whitepaper content | CONFIG | TSX content | static copy | `/docs`, `/faq`, `/whitepaper`, `/tokenomics`, `/roadmap` | None | None | Must align with glossary. |

---

## Static-where-live-exists (flag)

Surfaces still using static / config when an on-chain read could replace them:

- **Tokenomics donut allocation** — currently static. Allocations are
  contractual + immutable so this is acceptable, but the **distributed**
  portion of the membership pool could be shown live via `useSaleStats`
  (currently shown in raised, not in donut).
- **Roadmap phase status** — purely static labels. Acceptable for now;
  consider deriving "LIVE" markers from contract deployment.
- **Use of Funds breakdown** — descriptive; the % split is live (it's
  the contract routing) but the *destination* labels are static.
- **Chapter windows** — static config; counts derived live. OK.

No card was found rendering invented data. PENDING modules correctly
show empty / labeled-only states.

---

## Scaling cliffs

1. **`useHolderIndex` log scan** — at ~10k holders RPC scans will get slow.
   Mitigation already documented in `HOLDER_INDEX_ARCHITECTURE.md` and
   `SCALABILITY_AND_ARCHITECTURE_AUDIT.md`. Action **deferred** until traffic
   warrants — do not pre-build an indexer.
2. **Activity feed** — same scan budget. Currently shares cache with holder
   index. OK for phase.
3. **OG dynamic routes** — server reads on-chain per request; should be
   edge-cached. Verify caching headers in Wave 3B.

---

## Anti-rewrite contracts (must not be touched without a vision-aligned reason)

- `useHolderIndex` shape (see architecture doc).
- 70 / 20 / 10 routing math — driven by contract, not config.
- Status pill semantics (LIVE / PARTIAL / PENDING) — vocabulary frozen.
- `syndicate-config.ts` contract + wallet addresses — change only on
  redeploy.
