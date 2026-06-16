---
name: RPC env-override (replace, not additive)
description: How the Avalanche RPC endpoints became env-overridable and the deliberate replace-not-additive decision behind it.
---

RPC endpoints in `syndicate-config.ts` are env-overridable via `VITE_AVALANCHE_RPC_PRIMARY` / `VITE_AVALANCHE_RPC_FALLBACK`, defaulting to the original public URLs (`api.avax.network` primary, `rpc.ankr.com` fallback) when unset. The exported names/shapes (`AVALANCHE_RPC_URL`, `AVALANCHE_RPC_URL_FALLBACK`, `AVALANCHE_RPC_ENDPOINTS`) are unchanged, so `wagmi.ts`, `chain-registry.ts`, `archive-rpc-health.ts`, and `og-data.server.ts` consume the derived constants with **no edits**.

**Rule:** the override is **REPLACE, not additive**. Setting `VITE_AVALANCHE_RPC_PRIMARY` (e.g. Chainstack) replaces `api.avax.network` as primary; the public Ankr fallback stays active. Setting `VITE_AVALANCHE_RPC_FALLBACK` replaces Ankr. With neither set, behaviour is byte-identical to the old hardcoded pair.

**Why:** deliberate minimal-scope choice. Keeping the public primary as a *third* tertiary endpoint would require expanding the transport list / export shape (`wagmi.ts` builds a 2-entry `fallback()` from the two constants). That was explicitly out of scope; architect concurred — do **not** make it additive (or add `api.avax.network` as tertiary) unless a future task permits a wagmi/config shape expansion.

**How to apply:** point at a new provider by setting the env var only — never hardcode a URL, never add a 3rd endpoint without scope approval. `VITE_` vars are PUBLIC (Vite inlines them into the client bundle); only use origin/domain-allowlisted endpoints, never a secret/keyed URL unless origin-restricted. The `/nft` health-panel labels switch to "Custom primary/fallback RPC (env)" when the matching env var is set (truthful, not copy drift).
