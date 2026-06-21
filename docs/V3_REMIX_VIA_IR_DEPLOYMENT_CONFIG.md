# V3 Remix Via-IR Deployment Compiler Config

Status: deployment-safety helper / no broadcast authorization.

This document explains how to compile the V3 candidate contracts in Remix with the same compiler posture used by the repository. It does not authorize deployment, funding, source-record creation, registry switching, public V3 UI, unpause, or activation.

## Required Compiler Settings

Repository truth from `contracts/foundry.toml` and the V3 contract pragmas:

| Setting | Required value |
| --- | --- |
| Solidity compiler | `0.8.24` |
| Optimizer | enabled |
| Optimizer runs | `200` |
| Via IR | `true` |
| EVM version | `paris` |

Stop before deployment if Remix compiles with any different value.

## Files To Use

Use these Solidity Standard JSON input files:

| Contract | Standard JSON input |
| --- | --- |
| `SourceRegistryV1` | `contracts/remix/SourceRegistryV1.remix-standard-json.json` |
| `MembershipSaleV3` | `contracts/remix/MembershipSaleV3.remix-standard-json.json` |

Each JSON file embeds the required source files and OpenZeppelin imports, and sets:

```json
{
  "optimizer": { "enabled": true, "runs": 200 },
  "viaIR": true,
  "evmVersion": "paris"
}
```

## Remix Usage

1. Open Remix.
2. Open or upload the repository files, including the relevant file in `contracts/remix/`.
3. In the Solidity compiler area, use the Solidity Standard JSON input workflow for the selected `.remix-standard-json.json` file.
4. Confirm the JSON settings show:
   - compiler `0.8.24`
   - optimizer enabled
   - runs `200`
   - `viaIR: true`
   - `evmVersion: paris`
5. Compile `contracts/remix/SourceRegistryV1.remix-standard-json.json` first.
6. Deploy `SourceRegistryV1` only if founder has explicitly approved the manual non-live deployment/readback ceremony.
7. Read back the deployed `SourceRegistryV1` address.
8. Compile `contracts/remix/MembershipSaleV3.remix-standard-json.json` second.
9. Deploy `MembershipSaleV3` only after pasting the deployed SourceRegistryV1 address into the constructor field in Remix.

If Remix only shows the normal per-file compiler controls and does not expose Standard JSON input / configuration-file compilation, do not proceed until the compiler settings can be manually confirmed to match the table above. The critical setting is `viaIR: true`; deploying bytecode built without Via IR is not approved.

## Deployment Boundaries

Even if compilation succeeds:

- No funding.
- No source records.
- No frontend registry switch.
- No public V3 UI.
- No activation.
- No unpause unless separately approved.
- V2b remains the live buy target.

## Bytecode / Metadata Warning

If bytecode, metadata, compiler settings, or Remix output do not match the expected compiler posture, stop before deployment. Do not continue with a best-effort compile.

## Related Approval Packet

Use this document together with:

- `docs/V3_NON_LIVE_DEPLOYMENT_BROADCAST_APPROVAL_PACKET.md`
- `docs/V3_FINAL_PRE_BROADCAST_PACKAGE.md`
- `docs/V3_DEPLOYMENT_PARAMETER_SHEET.md`
