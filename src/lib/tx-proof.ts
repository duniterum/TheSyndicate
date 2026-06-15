// Pure tx-hash proof guard — no UI, no RPC. Lives in lib so any surface
// (homepage rails, data layer, drawers) can validate a transaction hash
// without importing the TxProofDrawer UI module. TxProofDrawer re-exports
// this for backward compatibility with existing call sites.
import { type Hex } from "viem";

const TX_HASH_RE = /^0x[a-fA-F0-9]{64}$/;

export function isValidTxHash(hash: string | undefined | null): hash is Hex {
  if (!hash || typeof hash !== "string") return false;
  return TX_HASH_RE.test(hash);
}
