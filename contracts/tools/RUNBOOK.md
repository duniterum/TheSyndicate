# Sale V2 — Snapshot & Deploy Tooling Runbook

Read-only/offline helpers that turn a **live V1 snapshot** into the two values
the Sale V2 deploy needs (`genesisOffset` + `V1_MEMBER_ROOT`) and verify the
result end-to-end. None of these scripts hold keys or write on-chain.

> This runbook covers the *tooling*. The full deploy gate (review → audit →
> forked rehearsal → `Ownable2Step` acceptance → timelock sign-off) lives in
> `docs/proposals/SALE_V2_MAINNET_DIRECT_DEPLOYMENT_RUNBOOK.md` and the reviewer
> packet §7. **Do not deploy** from this file alone.

## 0. Install (once)

```bash
cd contracts/tools
npm install        # viem + @openzeppelin/merkle-tree (isolated from the main app)
```

## 1. Snapshot — export the V1 member set

Pause V1 first (at or below seat #333), then snapshot so the set is final.

```bash
# defaults target the live mainnet V1; override via env if needed
node export-members.mjs
#   -> members.json           ["0x…", …] in FIRST-SEEN order (Holder-Index order)
#   -> members.snapshot.json  provenance (sale address, block range, per-member firstSeen)
```

`genesisOffset` = the member count this prints (the real V1 unique-member count
at handoff). Under Model 2 it may be **below 333**; V2 then continues Genesis
from `genesisOffset + 1`.

## 2. Root — generate `V1_MEMBER_ROOT` + proofs

```bash
node gen-v1-root.mjs members.json
#   -> prints V1_MEMBER_ROOT
#   -> v1-merkle.json { root, count, proofs, tree }
```

## 3. Validate — independently re-derive & replay (don't trust, verify)

```bash
node validate-snapshot.mjs members.json v1-merkle.json
#   rebuilds the root from members.json, reconciles counts, and replays EVERY
#   per-member proof against the root. Exits non-zero on any mismatch.
```

The per-member `proofs[address]` array is what each member passes to
`claimV1Membership(proof)` / `buy(…, v1Proof)`. The same tree (root + proofs) is
published to the frontend as `public/v1-member-proofs.json` so any member can
reconstruct the root themselves.

## 4. Fill deploy params

Edit `../script/deploy-params.json`:
- `genesisOffset` ← the count from step 1
- `v1MemberRoot` ← the root from step 2 (validated in step 3)
- `vault` / `liquidity` / `operations` ← the live treasury wallets
- `addrCaps` / `eraCaps` / `maxUsdcPerTx` / `reserveThroughSeat` ← transcribe from
  `docs/proposals/SALE_V2_FINAL_DEPLOY_PARAMETER_SHEET.md` (Model B; J3/J13/J14)
- `initialRouter` stays `0x0` — **not** read by the script (forced `address(0)`)

## 5. Deploy (gated — see the mainnet runbook)

```bash
# dry-run / simulate (no broadcast)
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC
# broadcast (only after all deploy blockers clear)
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC --broadcast --verify
```

SYN funding is a **separate** post-deploy transaction (fund ≥ the initial reserve
floor before opening). The constructor pulls no SYN.

## 6. Verify — post-deploy read-back

```bash
SALE_V2=0xDEPLOYED node verify-deploy.mjs
#   asserts on-chain V1_MEMBER_ROOT, GENESIS_OFFSET == memberCount, token/wallet
#   wiring, caps, and that commissionRouter is DISARMED (0x0). Exits non-zero on
#   any mismatch. Pair with validate-snapshot's expectedRoot check:
#   node validate-snapshot.mjs members.json v1-merkle.json $(on-chain V1_MEMBER_ROOT)
```

## 7. Publish the proof artifact (frontend)

Copy the validated `{ root, count, proofs }` into `public/v1-member-proofs.json`
(replacing the `pending` placeholder). While that file is `pending`, the frontend
V1-proof flow (`src/lib/v1-proof.ts`) **fails closed** and refuses to build buy
args, so no V1 member is ever mis-handled as a new seat.
