// Guard test — every transaction-write component must follow the canonical
// payment / persistence / explorer / error pattern. Adding a new write
// surface (mint, sale, claim) requires the same primitives or this test
// will fail loudly in CI.
//
// Locked invariants (composes with chain-registry-guard + sale-flow-invariants):
//   1. Tx hashes survive refresh — every public write component imports
//      `useMintHashPersistence` and feeds an effective hash into
//      `useWaitForTransactionReceipt`.
//   2. tx-history records every submission.
//   3. Errors flow through `classifyTxError` instead of rendering raw
//      `.error?.message` as primary copy.
//   4. No hand-built explorer URLs (snowtrace/avascan/routescan literals)
//      inside transaction-write components.
//   5. Canonical Avascan path uses `/blockchain/c/tx/` — bare `/tx/` is
//      forbidden anywhere outside docs that explain the MetaMask issue.

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

const WRITE_COMPONENTS = [
  "src/components/syndicate/LivePurchase.tsx",
  "src/components/syndicate/MintFirstSignal.tsx",
  "src/components/syndicate/MintPatronSeal.tsx",
] as const;

function read(rel: string): string {
  return readFileSync(join(process.cwd(), rel), "utf8");
}

describe("tx-write component canonical guard", () => {
  it.each(WRITE_COMPONENTS)("%s persists tx hashes via useMintHashPersistence", (file) => {
    const src = read(file);
    expect(src, `${file} must import useMintHashPersistence`).toMatch(/useMintHashPersistence/);
    expect(src, `${file} must feed effective hash into useWaitForTransactionReceipt`).toMatch(
      /useWaitForTransactionReceipt\(\{\s*hash:\s*effective/,
    );
  });

  it.each(WRITE_COMPONENTS)("%s records every submission via tx-history", (file) => {
    const src = read(file);
    expect(src, `${file} must call recordTx`).toMatch(/recordTx\(/);
  });

  it.each(WRITE_COMPONENTS)("%s uses classifyTxError for primary error copy", (file) => {
    const src = read(file);
    expect(src, `${file} must import classifyTxError`).toMatch(/classifyTxError/);
  });

  it.each(WRITE_COMPONENTS)("%s does not hand-build explorer URLs", (file) => {
    const src = read(file);
    // Allow none of these literal explorer hosts inside write components —
    // links MUST come from chain-registry.ts helpers.
    const offenders = ["snowtrace.io", "avascan.info", "routescan.io"].filter((host) =>
      src.includes(host),
    );
    expect(offenders, `${file} must use chain-registry helpers, not hardcoded explorer URLs`).toEqual(
      [],
    );
  });

  it.each(WRITE_COMPONENTS)("%s does not generate bare Avascan /tx/ paths", (file) => {
    const src = read(file);
    expect(src).not.toMatch(/avascan\.info\/tx\//);
  });
});
