# Protocol Chronicle — Readiness & Implementation Plan (ID 9)

Status: **SPEC + READINESS only. No on-chain action. No ABI change.**
Scope: prepares Archive1155 slot **ID 9 — Protocol Chronicle** as the Season Finale Artifact / Far Horizon anchor, completing the 9-slot memory layer without inventing facts, countdowns, or financial claims.

Composing gates that this pass MUST pass before any execution:
Decision Lenses · Multi-Hat · Infinite Narrative · Core Asset · Mythology & Cohort Identity · Sale Flow Invariants.

---

## A. Role lock — what Protocol Chronicle IS and IS NOT

**Locked role:** Protocol Chronicle = **Season Finale Artifact + DAO Memory Capsule**.

- Public framing (one line, canonical): *"The Season Finale Artifact. Sealed when a chapter closes."*
- Internal function: a permanent, on-chain memory capsule of what happened during the chapter/season, sourced exclusively from verifiable protocol facts already indexed by `useHolderIndex`, `archive-mint-events`, the LP pool, and the routing wallets.
- Narrative role inside the Infinite Narrative gate: the **FAR horizon** layer made visible-as-sealed for the current chapter, so the protocol always has a real future event with a real cliffhanger ("the chronicle is unwritten until #333 is sealed").
- Mythology role: a **named sealed event** (layer 4) anchored to the Ordinal · Era · Witness identity axes of every seat present at sealing. The name is *earned by occurrence*, never authored in advance.

**It is NOT:** an annual report, a financial report, a dividend record, a governance receipt, a founder trophy, a reward NFT, a wealth/rank artifact, a promotional drop, a roadmap announcement, or a pre-claimable item.

Founder-test sentence (must hold in 5 years): *"Members didn't buy the Chronicle. The Chronicle was sealed when their chapter closed, and the wallets that were there are co-witnessed in it forever."*

---

## B. ID 9 mechanics — founder recommendation

| Question | Recommendation | Why |
|---|---|---|
| Mint model | **ownerOnly / protocol-sealed.** No public mint, ever. | Chronicle is a memory capsule, not a sale. A public mint reframes it as another drop and destroys the Season-Finale meaning. |
| Price | **Free (0 USDC).** | There is no public buyer. Owner-mints the capsule itself. |
| Supply | **`maxSupply = 1` per chapter (edition-of-1 capsule)** — or `maxSupply` equal to the **co-witness set size at seal** if we choose the witness-distribution variant. Default: **edition-of-1** held by the protocol Archive wallet. | A single capsule is the cleanest mythology (one chronicle per chapter, indivisible). Witness-distribution is a viable variant (§B.1) but adds operational risk. |
| walletLimit | **0** (irrelevant under ownerOnly) or **1** if we ever switch to witness-distribution. | Public mint is disabled. |
| `active` flag | **`false` at configuration time.** Never set `active = true` for ID 9. | Activation is meaningless without a public mint; leaving it false removes any chance of accidental public CTA. |
| `rendererMode` | **`ONCHAIN_SVG`.** | Matches the rest of the Archive1155 visual family, removes IPFS dependency, makes the capsule self-contained on-chain. |
| `definitionFrozen` | **Freeze ONLY after** (1) sealing rule has fired on-chain, (2) the final SVG + metadata snapshot has been generated from real indexer facts, (3) visual review is complete. **Do not freeze at configuration time.** | Freezing before the sealing event would lock placeholder facts. The Archive1155 invariant requires `definitionFrozen=true` before `setDropActive`, but we are explicitly never activating, so freeze timing is governed by metadata correctness, not the activation rule. |
| Configure now, or wait? | **Wait. Configure ID 9 only when the sealing rule has fired and the snapshot is computed.** | Configuring now means publishing a metadata URI with empty/placeholder numbers, which violates the Trust model (Verifiable > Impressive · Live > Estimated) and the Reality Reflection contract. Until then ID 9 stays exactly as it is today: not configured on-chain, surfaced truthfully as a sealed roadmap slot. |

**Founder recommendation, single line:** ownerOnly · free · supply 1 · walletLimit 0 · active false · ONCHAIN_SVG · configured **after** seal · frozen **after** visual review.

### B.1 Witness-distribution variant (do NOT adopt without explicit founder sign-off)

- `maxSupply = N` where N = number of seats present in chapter (e.g. 333 for Chapter I).
- Owner-mints one capsule per witness wallet at seal block.
- Pros: every Chapter-I wallet gets a co-witnessed capsule, strongest Mythology layer.
- Cons: 333 owner transactions, gas cost, indexer churn, possible airdrop framing, requires a wallet allow-list snapshot at the exact seal block.
- Verdict: **defer.** Edition-of-1 is the safer Season Finale shape. Witness distribution can be added later as a separate artifact (e.g. "Chapter I Witness Token") without changing the Chronicle.

---

## C. Sealing rule

The sealing rule must be a single on-chain observable fact, not a date, not a countdown, not a vote.

### Canonical doctrine available today (`src/lib/chapters.ts`)
- Chapter I — Genesis Signal — Members **#1 – #333** (capacity 333).
- Chapter II – V are also defined by member-number ranges only.

### Recommended sealing rule for Chronicle of Chapter I

**"Chapter I closes when member #333 is sealed on-chain via SyndicateMembershipSale, i.e. when `useHolderIndex().totals.totalMembers >= 333` confirmed at a finalized block."**

- Single observable: the 333rd successful membership purchase event.
- Verifiable: derivable from existing sale-event indexer; no off-chain claim needed.
- Irreversible: a member count cannot decrease.
- No manufactured scarcity: this threshold already exists in canon as Chapter I capacity. We are not inventing a new number.

### If founder rejects "#333 close = Chapter I close"

There is currently **no other canonical Chapter I closing rule**. The minimum safe alternatives, in order of strictness:

1. **Capacity rule (recommended):** `totalMembers >= 333`.
2. **Capacity + finality rule:** `totalMembers >= 333` AND block depth >= 64 confirmations on the sealing tx.
3. **Founder-declared rule:** an explicit "Chapter I closed" owner transaction on a future ChapterRegistry contract. Requires new contract — out of scope for this pass, and re-introduces "authored, not earned" risk.

**Default to (1) or (2).** Do not silently invent any other threshold (time-based, USDC-raised, LP-TVL, NFT-mint count, vault balance). None of those are canon Chapter I closing rules.

### Cliffhanger phrasing (Infinite Narrative gate)
*"Chapter I closes when seat #333 is sealed. The Chronicle is unwritten until then."*

---

## D. Metadata schema

Three layers, kept strictly separate. **Every field is either a real on-chain read or marked as `derived` with the indexer source.** No estimated, no projected, no "approximate" numbers.

### D.1 On-chain fields (Archive1155 `configureArtifact` payload)

| Field | Value |
|---|---|
| `id` | 9 |
| `name` | "Protocol Chronicle" |
| `priceUsdc` | 0 |
| `maxSupply` | 1 |
| `walletLimit` | 0 |
| `rendererMode` | `ONCHAIN_SVG` |
| `active` | `false` (never activated) |
| `definitionFrozen` | set to `true` only after visual review post-seal |

### D.2 `tokenURI` metadata (JSON returned by `uri(9)`)

Required keys (all values frozen at seal block):

```
{
  "name": "Protocol Chronicle — Chapter I",
  "description": "Season Finale Artifact for Chapter I — Genesis Signal. Sealed on-chain when seat #333 was sealed. Memory capsule of what happened during the chapter, sourced from verifiable protocol facts. Collectible record only. Not equity, dividend, governance, or revenue share.",
  "image": "data:image/svg+xml;base64,<ONCHAIN_SVG>",
  "external_url": "https://thesyndicate.money/archive/9",
  "attributes": [
    { "trait_type": "Token ID",          "value": 9 },
    { "trait_type": "Category",          "value": "Legacy / Chronicle / Season Finale" },
    { "trait_type": "Chapter",           "value": "Chapter I — Genesis Signal" },
    { "trait_type": "Season",            "value": 1 },
    { "trait_type": "Sealing rule",      "value": "totalMembers >= 333 on SyndicateMembershipSale" },
    { "trait_type": "Sealed at block",   "value": "<uint>" },
    { "trait_type": "Sealed at",         "display_type": "date", "value": <unix> },
    { "trait_type": "Members at seal",   "value": 333 },
    { "trait_type": "SYN sold at seal",  "value": "<exact uint, no rounding>" },
    { "trait_type": "USDC routed at seal","value": "<exact uint>" },
    { "trait_type": "Vault balance",     "value": "<exact uint or PENDING>" },
    { "trait_type": "LP TVL at seal",    "value": "<exact uint or PENDING>" },
    { "trait_type": "NFT mints at seal", "value": "<sum of TransferSingle for IDs 1 and 3>" },
    { "trait_type": "Archive IDs referenced", "value": "1,3" },
    { "trait_type": "Rights",            "value": "Collectible record only. No financial rights." }
  ]
}
```

Rules:
- Any field whose source is not LIVE at seal time **must be omitted**, not filled with a placeholder.
- `image` MUST be the ONCHAIN_SVG payload, not an IPFS URL.
- The metadata JSON itself can be served by the on-chain renderer (preferred) or via a content-addressed gateway pinned by the protocol wallet — **never** a mutable HTTPS endpoint.

### D.3 UI-only presentation fields (NOT in tokenURI)

- "Why it matters" sentence.
- Cliffhanger phrasing.
- Cross-links to /archive, /transparency, /activity, /registry.
- Visitor-language sealed copy.
These live in `src/lib/archive-preview-catalog.ts` and are clearly marked UI-only.

### D.4 Indexer-derived fields (NOT in tokenURI, used only to generate D.2)

- `members at seal` ← `useHolderIndex().totals.totalMembers` at seal block.
- `SYN sold`, `USDC routed` ← `MembershipSale` event totals indexed up to seal block.
- `Vault / LP / NFT mints` ← existing live readers; if any is `PARTIAL` at seal time, that field is **omitted from the tokenURI** and only the available facts are sealed in.

---

## E. Visual direction

Locked family: **Sealed Card / Season Finale.** ONCHAIN_SVG, edition-of-1 feel.

Required visual signals (must all be present, none optional):
- Centered seal mark — gold (`var(--gold)` / `--seal`) on deep neutral background (`#0B1220` family).
- Chapter ordinal in roman numeral, large, Instrument Serif.
- "PROTOCOL CHRONICLE" wordmark in JetBrains Mono small caps.
- Sealed-at block number rendered as mono text (proves origin).
- A six-line "facts grid" listing the six verifiable numbers from D.2.
- A hairline border in `--verify` cyan only on the "sealed" status pill — nothing else cyan.
- No animation. No gradients beyond a single subtle vignette. No emoji. No portrait imagery.

Must be visually compatible with First Signal, Patron Seal, Heart Signal, future Seat Record — but distinct via:
- Larger title block (it's a capsule, not a card).
- Facts grid is the dominant body element.
- Edition mark "1 / 1 — Chapter I" bottom-right.

Banned: casino chrome, hype gradients, neon, illustrative "trophy" imagery, anything that reads as marketing or financial.

Mythology gate axis used: **Era + Witness** (this is THE chapter-closing artifact). Layer 4 (named sealed events). Prohibition restated on the card itself: *"Collectible record only. No financial rights."*

---

## F. UI integration plan — before configuration

Where ID 9 appears today and what it must say while still unconfigured. Two languages must coexist: **visitor language** ("sealed until the season closes") and **technical truth language** ("ID 9 not configured on-chain · `getArtifactCore(9)` reverts").

| Surface | Visitor copy | Technical / status pill | Action |
|---|---|---|---|
| `/nft` Archive Wall | "Protocol Chronicle — Sealed until Chapter I closes" | `PENDING` pill + "ID 9 not configured on-chain" tooltip | No CTA. Card opens detail panel only. |
| `/archive` Museum | Full card with Sealing Rule, Chapter, Cliffhanger | `PENDING` pill | Cross-links to `/transparency`, `/activity`. |
| Protocol Heartbeat / Far Horizon | One-line cliffhanger: *"Chapter I closes when seat #333 is sealed. The Chronicle is unwritten until then."* | Live counter `#X / #333` sealed (LIVE) | No CTA. |
| `/activity` (future sealed events) | Row appears only AFTER seal tx; until then absent. | n/a | No fake row. |
| `/my-syndicate` (future witness history) | Section "You will be co-witnessed if you join before #333." Reflects member's current chapter. | LIVE for member#, PENDING for chronicle status | No claim button. |
| `/registry` | Row with address (Archive1155), ID 9, status `NOT CONFIGURED`, on-chain reads attempted and link to `getArtifactCore(9)` revert. | `PENDING` | Transparency only. |
| `/transparency` Protocol Health | Health node "Chronicle (ID 9): NOT CONFIGURED — by design, configured at seal." | `PENDING` | Documented as expected state. |

Hard rule: **no surface may say "configured" / "live" / "ready" / "minted" for ID 9 until `getArtifactCore(9)` succeeds.** Reality Reflection invariant.

---

## G. Activation runbook for ID 9 (do not execute)

Numbered, gated. Each step has a stop condition.

1. **Pre-flight, T-anytime.** Verify ID 9 state on the deployed Archive1155: call `getArtifactCore(9)` — MUST revert. Call `remainingSupply(9)` — MUST revert. If either succeeds, halt and audit; configuration has happened out of process.
2. **Confirm owner.** Verify Archive1155 `owner()` matches the documented protocol owner wallet. Any mismatch halts the runbook.
3. **Wait for sealing event.** Subscribe to `MembershipSale` purchase events. Stop condition: a finalized block (depth ≥ 64) where cumulative `totalMembers >= 333`. Record `sealBlock`, `sealTx`, `sealTimestamp`.
4. **Snapshot facts.** Run the indexer at `sealBlock` to compute every value in §D.2. Any value that cannot be computed at LIVE quality is **omitted** from the tokenURI draft.
5. **Generate SVG + JSON.** Produce the ONCHAIN_SVG and tokenURI JSON deterministically from the snapshot. Store the raw inputs and the generator output side by side for audit.
6. **Visual + copy review.** Founder + design review of the rendered SVG and JSON. Confirms §A role, §E visual rules, §D.2 omissions, §F copy compatibility.
7. **Configure ID 9 (single tx).** `configureArtifact(9, …)` with §D.1 values and the §D.2 tokenURI. **`active = false`. `definitionFrozen = false`.**
8. **Verify configuration.** Call `getArtifactCore(9)` — MUST succeed and equal §D.1. Call `uri(9)` — MUST return the §D.2 JSON. Diff against the reviewed artifacts byte-for-byte.
9. **Public surface check.** Confirm no `/nft`, `/archive`, `/my-syndicate` surface renders a Mint CTA for ID 9. Sale Flow Invariants apply: any write path attached to ID 9 is a BLOCKER and aborts the runbook.
10. **Freeze (optional, recommended).** Call `freezeDefinition(9)`. Re-verify `getArtifactCore(9)` and `uri(9)` are unchanged. After this call, the capsule is immutable forever.
11. **Mint the capsule.** Owner calls `mint(9, owner, 1)` (or chosen recipient if a witness variant is approved — see §B.1). Verify `TransferSingle` event, `balanceOf(recipient, 9) == 1`, `remainingSupply(9) == 0`.
12. **Update registry / health / UI copy.** Flip status pills from `PENDING` → `SEALED`. Add the seal tx to `/activity` as a real row. Reality Reflection re-run: every surface that previously said "Sealed until Chapter I closes" must now say "Sealed at block X" with the verifiable link.
13. **Cross-decade test.** Read the rendered card aloud. Sentence must still hold in 5 years. If it reads as marketing, return to step 5.

Any failed step halts the runbook. No step is "best effort".

---

## H. Risk assessment

| Severity | Risk | Trigger | Mitigation |
|---|---|---|---|
| **BLOCKER** | Configuring ID 9 with placeholder facts before seal | Step 7 run before step 3 completes | Do not run step 7 until §C sealing rule is observed at finality. Step 1 + step 8 catch this. |
| **BLOCKER** | Public mint CTA accidentally rendered for ID 9 | UI list iterates all configured IDs and emits a default Mint button | Add the `active === false && id === 9 → no CTA` rule into the sale-flow guard tests; step 9 verifies. Sale Flow Invariants forbid any write path on ID 9. |
| **BLOCKER** | Freezing before metadata is correct | Step 10 run before step 8 verification matches reviewed artifacts | Step 10 is gated on byte-diff equality in step 8. |
| **HIGH** | Wrong supply model (public mint or witness-distribution chosen without sign-off) | §B.1 adopted by default | Default to edition-of-1. Witness variant requires explicit founder sign-off recorded in this doc. |
| **HIGH** | Fake chapter closure (declaring Chapter I closed without `totalMembers >= 333`) | Founder pressure to "ship the Chronicle" before #333 | Sealing rule is the ONLY trigger. No date, no marketing window. |
| **HIGH** | Fake DAO claim (Chronicle described as governance / revenue / dividend) | Copy drift in marketing surfaces | §A role lock + banned-copy core rule. Every surface card includes the rights line. |
| **HIGH** | UI claiming "configured" before chain truth | A preview catalog edit flips `status` to `LIVE` before step 8 | Reality Reflection invariant + `getArtifactCore(9)` read-only check in CI / preview catalog test. |
| **MEDIUM** | Metadata includes a value with PARTIAL provenance (e.g. LP TVL not LIVE at seal) | Indexer partial at seal block | Step 4 rule: PARTIAL fields are omitted, not filled. Capsule is still valid with fewer fields. |
| **MEDIUM** | Chronicle feels like an annual report (boring) | Visual leans into spreadsheet aesthetic | §E forbids tabular-only design. Facts grid sits inside a Sealed Card with title block + seal mark. |
| **MEDIUM** | Mythology authored, not earned (pre-naming Chapter I "Genesis Signal Chronicle" before seal) | Copy chosen before sealing event | Card title is "Protocol Chronicle — Chapter I" only. Any earned name (e.g. "The 333 Seal") is added post-seal. |
| **LOW** | Future chapters require their own Chronicle entries | More IDs needed | Out of scope. ID 9 is Chapter I. Chapter II Chronicle = future artifact slot, separate configureArtifact, separate spec pass. |
| **LOW** | Cross-decade test fails after years of drift | Future copy edits weaken Mythology | Freeze definition (step 10) makes the on-chain record immutable; copy drift on UI cannot rewrite the capsule. |

---

## I. Decision Lens Verdicts

| Lens | Verdict | Note |
|---|---|---|
| Founder | ✓ | Locks ID 9 as Season Finale, not another drop. |
| Investor | ✓ | No financial claim attached; trust model intact. |
| Growth | ⚠ | Chronicle is not a growth lever; intentional. Documented. |
| Behavioral | ✓ | Cliffhanger anchored to real on-chain event satisfies Infinite Narrative. |
| UX | ✓ | Visitor and technical languages cleanly separated in §F. |
| Product | ✓ | Completes 9-slot doctrine without inventing facts. |
| Staff Eng | ✓ | Runbook gated, irreversible steps placed last, freeze only after verification. |
| QA | ✓ | Step 8 byte-diff + step 9 sale-flow guard cover the worst paths. |
| A11y | ✓ | ONCHAIN_SVG card includes mono text labels; UI copy uses status pills with text, not color alone. |
| SEO | ✓ | `/archive/9` route surfaces sealing rule and cliffhanger as crawlable copy now, real facts after seal. |

Gate result: **0 ✗, 1 ⚠ (Growth, intentional) → PASS.**

---

## J. Deliverable summary

**Decisions still required from founder before any execution:**
1. Approve §B mechanics (ownerOnly · free · supply 1 · walletLimit 0 · active false · ONCHAIN_SVG · configure-after-seal · freeze-after-review).
2. Approve §C sealing rule (`totalMembers >= 333` at finalized block) or pick alternative (2) or (3) explicitly.
3. Reject or accept §B.1 witness-distribution variant. **Default is reject.**
4. Approve §D.2 metadata field list and the "omit-on-PARTIAL" rule.
5. Approve §E visual direction and the "no public CTA, ever" rule for ID 9.

**What can be implemented safely now, before any on-chain configuration:**
- Update `src/lib/archive-preview-catalog.ts` ID-9 entry to use the locked §A copy and the §F per-surface visitor + technical language. Status stays `ROADMAP` / `PENDING`; `mintModel` stays `ADMIN_POST_SEAL`.
- Add `/archive/9` route content rendering the Season-Finale framing, sealing rule, cliffhanger, and Reality-Reflection-correct status. No CTA.
- Add the Far Horizon cliffhanger line into Protocol Heartbeat (`#X / #333` sealed counter sourced from `useHolderIndex`).
- Add the Protocol Health node "Chronicle (ID 9): NOT CONFIGURED — by design".
- Add a preview-catalog test that asserts no UI surface emits a Mint CTA for ID 9 until `getArtifactCore(9)` succeeds (Sale Flow Invariant test extension).
- Wire `src/lib/protocol-health-registry.ts` to expose the Chronicle node and surface it in `/transparency`.

**What is explicitly out of scope for this pass:**
- Any `configureArtifact`, `freezeDefinition`, `setDropActive`, or `mint` transaction.
- Any ABI change, contract deployment, SeatRecord721 work, referral system, promotional surface, or modification to IDs 1–8 / sale flows.
- Any per-witness distribution mechanic.

Final preparation pass complete. Awaiting founder sign-off on §J.1–§J.5 before any on-chain step in §G runs.
