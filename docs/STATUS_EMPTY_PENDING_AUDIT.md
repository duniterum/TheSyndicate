# THE SYNDICATE — STATUS / EMPTY / PENDING AUDIT

For every surface labeled LIVE / PARTIAL / PENDING / DERIVED / EXTERNAL /
INDEXER: is the label correct, and does the empty/zero state make sense?

Audit only.

---

## Zero-member / cold-start states

| Surface | Today | Zero state | Explained? | Verdict |
|---|---|---|---|---|
| Members wall | Members exist; non-zero. | If zero: shows "no members yet" via `EmptyState` | Y | OK |
| Founders | Non-zero. | If zero: empty state OK | Y | OK |
| Chapters | Chapter 1 forming. | Future chapters show "forming" label | Y | OK |
| Ranks distribution | Non-zero. | Empty ranks show 0 with explanation | partial | Flag: 0 in some ranks could look like a bug; copy could say "no members in this rank yet". |
| Activity feed | Non-zero. | Empty = "no events yet" | Y | OK |
| Since Your Last Visit | First visit shows nothing meaningful | Empty state present | Y | OK |
| Wallet page (no purchases) | Shows balances + "no purchases recorded" | Y | OK |

---

## Pending / partial surfaces

| Surface | Status | Why empty / partial | Source that would unlock | Copy explains? | Feels abandoned? | Recommendation |
|---|---|---|---|---|---|---|
| Programmatic Vault Contract | PENDING | Not deployed | Future contract deploy | Y (`VaultDisambiguation` + PENDING pill) | N | Keep as-is. |
| Vault Reserve releases | PENDING | Policy not finalized | Vault Contract | Partial | partial | Flag — explicit "no releases scheduled" line would help. |
| LP management policy (PCA-level) | PARTIAL | LP exists but governance pending | Future module | Partial | N | OK |
| Tokenomics donut "distributed" | PARTIAL | Donut static; raised shown elsewhere | Could derive from `useSaleStats` | N | partial | Flag — donut could show live distributed wedge. |
| `/nfts` (NFT recognition) | PENDING | Banned scope | — | route is hidden, no copy | N (because hidden) | **Recommend deleting the route or making it a single "Pending modules" page**. |
| `/ai` | PENDING | Banned scope | — | hidden | N | Same as above. |
| Referral | PENDING | Not built | — | not exposed | N | OK — invisibility is correct. |
| Governance | PENDING | Roadmap only | — | labeled PENDING | N | OK |
| Episodes | PARTIAL | Static content; not in nav | — | exists as a page | partial | Flag — either promote or hide. |

---

## Demo / preview leftovers

`check-live` enforces no "DEMO PREVIEW" string on `/ranks`. As of
wave-3A.qa-stamp, no demo banners remain on live routes (the `DemoBanner`
component exists but only renders when explicitly enabled). ✅

---

## Label correctness spot-checks

- "**LIVE**" on home pulse strip: backed by on-chain reads. ✅
- "**PARTIAL**" on `/vault`: correct (wallet live, contract pending).
- "**PENDING**" on Vault Contract: correct.
- "**DERIVED**" not currently used as a user-facing pill (it's an internal
  data-source label). OK.
- "**INDEXER**" not currently used as a user-facing pill. OK.

## Pages where pending labels could be added (flag)

- `/tokenomics` "distributed" portion (PARTIAL).
- `/roadmap` per-row pills are already there.
- `/whitepaper` could carry a "Status of each module" inline table —
  recommend later, do not implement now.

## Top status-debt items (ranked)

1. Orphan `/ai` and `/nfts` routes.
2. Empty rank slots could be friendlier ("Forming" instead of bare 0).
3. Tokenomics donut could show live distributed wedge.
4. Vault Reserve release schedule could explicitly say "none scheduled".
5. `/episodes` should be promoted or hidden — currently in limbo.
