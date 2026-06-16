---
name: Wallet-gate primitive + MetaMask wording gotcha
description: Canonical useWalletGate hook for wallet-gated action components, and the wording-guard blind spot for MetaMask-specific copy.
---

# Canonical wallet-gate primitive

`src/lib/useWalletGate.ts` is THE shared wallet-gate hook. It centralizes the six wagmi
hooks (useAccount / useChainId / useConnect / useReconnect / useDisconnect / useSwitchChain),
the `wrongChain = isConnected && chainId !== 43114` derivation, and the
connect/switch/reconnect/disconnect actions. It returns
`{address,isConnected,chainId,wrongChain,status,canConnect,connectPending,switchPending,connectWallet,switchToAvalanche,reconnect,disconnect}`.

**Convention:** wallet-gated action components (LivePurchase, MintFirstSignal, MintPatronSeal,
and any future ProtocolAction surface) should consume `useWalletGate()` rather than re-importing
the raw wagmi hooks. Behavior is preserved 1:1: connect picks `connectors[0]`,
`canConnect === connectors.length > 0`, switch swallows user rejection.

**Why:** the same ~6-hook wallet-gate block was copy-pasted across mint/buy components; one
canonical hook removes drift and is the foundation for the (still-inert) `protocol-actions.ts`
registry, `WalletGate.tsx`, and `SuccessReceipt.tsx` shells.

**How to apply:** call `useWalletGate()` unconditionally at the top of the component (hook
ordering). LivePurchase still keeps a local `useAccount` ONLY inside its `WalletBadge`
sub-component — that's intentional, not a leftover.

# MetaMask wording gotcha — the wording guard does NOT catch it

`scripts/check-ownership-wording.mjs` and the protocol-language FORBIDDEN_LANGUAGE list do
**not** ban "MetaMask". Wallet must be presented generically (injected/any wallet), so
MetaMask-specific *user-facing* copy ("Waiting for MetaMask signature…", "Open MetaMask…")
is a wording violation that passes every automated guard.

**How to apply:** after touching any wallet UI, run `rg -ni "metamask" src/` manually. Fix
user-facing label/help strings to "wallet" wording; truly MetaMask-specific technical code
comments may stay. Known clean as of this sweep: the 3 action components + wallet-freshness.ts.

# Multi-edit migration HMR noise

During a multi-edit hook migration, Vite/Babel can momentarily report
`checkRedeclarationInScope` (e.g. two `wrongChain` declarations) when the new destructure is
added before the old `const wrongChain` line is removed. This is transient mid-edit state, not
a real error — confirm by grepping for a single declaration and restarting the workflow for a
clean cold compile.
