# V3 Next Boundary: Funding and Activation Are Separate

Status: POST-DEPLOYMENT CONSOLIDATION / NON-LIVE / ZERO-FUNDED / NOT ACTIVATED

This document records the next boundary after the non-live V3 deployment/readback ceremony. It does not authorize funding, source records, registry switch, public V3 UI, pause/unpause, activation, or any private-key/broadcast action.

## Current Non-Live V3 State

| Contract | Address | Status |
| --- | --- | --- |
| SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / NO SOURCE RECORDS |
| MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | DEPLOYED / NON-LIVE / OWNER ACCEPTED / ZERO-FUNDED / NOT REGISTRY-WIRED / NOT ACTIVATED |

Owner wallet: `0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`.

Deployment wallet: `0xa2E538025B7E100c928c73d4a977Ab9CEaA26e2F`.

V2b remains the current live buy target. The frontend registry remains pointed at V2b. `/v3-preview` remains read-only and not live.

## Source Verification Status

| Surface | SourceRegistryV1 | MembershipSaleV3 | Compiler Settings |
| --- | --- | --- | --- |
| Snowtrace API | VERIFIED | VERIFIED | `v0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, EVM `paris`, non-proxy |
| Routescan API | VERIFIED | VERIFIED | `v0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, EVM `paris`, non-proxy |
| Sourcify | PERFECT MATCH | PERFECT MATCH | Solidity `0.8.24+commit.e11b9ed9`, optimizer enabled, 200 runs, `viaIR: true`, EVM `paris` |

Explorer links:

- SourceRegistryV1 Snowtrace: `https://snowtrace.io/address/0x780013bB358be6be95b401901264FC7c22a595a6#code`
- MembershipSaleV3 Snowtrace: `https://snowtrace.io/address/0x2A6cFc76906e758B934209AFf5A163c9bC20132E#code`
- SourceRegistryV1 Routescan: `https://avalanche.routescan.io/address/0x780013bB358be6be95b401901264FC7c22a595a6/contract/43114/code`
- MembershipSaleV3 Routescan: `https://avalanche.routescan.io/address/0x2A6cFc76906e758B934209AFf5A163c9bC20132E/contract/43114/code`
- SourceRegistryV1 Sourcify metadata: `https://repo.sourcify.dev/contracts/full_match/43114/0x780013bB358be6be95b401901264FC7c22a595a6/metadata.json`
- MembershipSaleV3 Sourcify metadata: `https://repo.sourcify.dev/contracts/full_match/43114/0x2A6cFc76906e758B934209AFf5A163c9bC20132E/metadata.json`

The Sourcify perfect-match metadata confirms bytecode/source settings match the intended Remix Standard JSON settings: Solidity `0.8.24`, optimizer enabled, optimizer runs `200`, `viaIR: true`, EVM `paris`.

## Already Done

- SourceRegistryV1 deployed.
- SourceRegistryV1 read back.
- SourceRegistryV1 ownership transferred and accepted by owner hardware wallet.
- MembershipSaleV3 deployed.
- MembershipSaleV3 read back.
- MembershipSaleV3 ownership transferred and accepted by owner hardware wallet.
- MembershipSaleV3 zero-funded state recorded.
- SourceRegistryV1 source-record count recorded as zero.
- Frontend remains pointed at V2b.
- V3 non-live deployment/readback log committed.

## Still Not Allowed

- No SYN funding to MembershipSaleV3.
- No USDC funding.
- No source records.
- No registry switch.
- No public V3 buy UI.
- No V3 activation.
- No public claim/referral UI.
- No pause/unpause transaction unless separately approved in a transaction ceremony.

## Next Approval Ceremonies

These must remain separate. Completion of one does not authorize the next.

1. Source verification / final external record.
2. Optional pause decision.
3. Funding amount decision.
4. Source records policy decision.
5. Registry switch plan.
6. Public UI activation.
7. Post-activation monitoring.

## Next Risk Boundary: Funding

Because `MembershipSaleV3.paused()` is `false` by deployment default, zero SYN funding is the current safety boundary. V3 cannot sell SYN while `availableSyn()` and the contract SYN balance remain zero.

No SYN may be transferred to MembershipSaleV3 until a separate funding/activation ceremony is explicitly approved.

## Future Funding Decision Packet

This packet prepares questions for a future decision. It does not approve funding.

| Question | Current answer |
| --- | --- |
| How much SYN inventory would be transferred to MembershipSaleV3 if approved? | Founder decision required. Do not invent amount. |
| From which wallet? | Founder decision required. Candidate should be a protocol-controlled SYN inventory wallet, likely the Membership Distribution / sale inventory source, but must be explicitly confirmed before any transaction. |
| Does owner need to pause/unpause first? | Founder decision required. Since `paused()` is currently false, the conservative path is to decide whether to pause before funding or fund only inside a fully approved activation ceremony. |
| Should MembershipSaleV3 be paused before funding? | Founder decision required. Pausing before funding improves operational signaling; leaving unpaused requires keeping funding at zero until activation is ready. |
| Should source records be created before or after funding? | Founder decision required. Default safest order is source policy decision first, then source records only after verification/legal/product approval; source records do not by themselves activate V3 while there is no funding and no registry switch. |
| What readbacks are required before funding? | Owner, pendingOwner, paused, SourceRegistry address, source-record count, availableSyn, SYN balance, frontend registry still V2b, V3 not live in `contract-registry.ts` or `syndicate-config.ts`. |
| What readbacks are required after funding? | Funding tx hash, SYN balance, availableSyn, sellableSynForNextSeat, currentEra, memberCount, source-record count, frontend registry still V2b unless activation is separately approved. |
| What must remain true before registry switch? | External review signoff, legal/product signoff, source verification record, funding/readbacks green, activation plan approved, public UI copy reviewed, rollback/monitoring plan ready. |
| What blocks public activation? | No registry switch approval, no public UI approval, no source-record policy approval, no funding amount approval, no legal/product signoff, no final monitoring plan. |

## Guardrail

V3 deployed addresses may appear in docs as deployed non-live addresses. They must not appear in the live frontend registry/config until a separate activation ceremony approves funding, registry switch, and public UI.
