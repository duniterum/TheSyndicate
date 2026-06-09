// ArchiveDiscrepancyReport — honest comparison between the aggregate
// (multicall) reads that drive the mint gate and the per-call safe reads.
// If both paths agree, we show "no discrepancies"; if they disagree on
// remainingSupply, isMintable, or wallet-limit math, we surface the exact
// mismatch with the values from each path.
//
// Also reports the freshness of the underlying RPC data (cache vs live)
// using TanStack Query's dataUpdatedAt. No fabrication: if a value is
// unknown, it renders "—".
import { useArchiveArtifactReads, formatRelativeTime } from "@/lib/archive-nft-hooks";
import { useArchiveSafeReads } from "@/lib/archive-safe-reads";

type CheckRow = {
  label: string;
  multicall: string;
  perCall: string;
  agree: boolean | "unknown";
};

function fmtMaybe<T>(v: T | undefined, fmt: (v: T) => string): string {
  return v === undefined ? "—" : fmt(v);
}

function rowFromMaybe<T>(
  label: string,
  a: T | undefined,
  b: T | undefined,
  fmt: (v: T) => string,
): CheckRow {
  if (a === undefined || b === undefined) {
    return { label, multicall: fmtMaybe(a, fmt), perCall: fmtMaybe(b, fmt), agree: "unknown" };
  }
  return { label, multicall: fmt(a), perCall: fmt(b), agree: a === b };
}

function agreePill(a: CheckRow["agree"]) {
  if (a === true)
    return (
      <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-300 bg-emerald-500/5">
        AGREE
      </span>
    );
  if (a === "unknown")
    return (
      <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/40">
        PARTIAL
      </span>
    );
  return (
    <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-destructive/40 text-destructive bg-destructive/5">
      MISMATCH
    </span>
  );
}

export function ArchiveDiscrepancyReport({ tokenId = 1 }: { tokenId?: number }) {
  const agg = useArchiveArtifactReads([tokenId]);
  const aggRead = agg.reads[tokenId];
  const safe = useArchiveSafeReads(tokenId);

  const safeCore = safe.artifactCore.value?.ok ? safe.artifactCore.value.value : undefined;

  const rows: CheckRow[] = [
    rowFromMaybe(
      "remainingSupply",
      aggRead?.remainingSupply,
      safe.remainingSupply.value,
      (v) => v.toString(),
    ),
    rowFromMaybe(
      "isMintable · reference wallet",
      aggRead?.isMintableReference,
      safe.isMintableReference.value,
      (v) => (v ? "true" : "false"),
    ),
    rowFromMaybe(
      "isMintable · connected wallet",
      aggRead?.isMintableConnected,
      safe.isMintableConnected.value,
      (v) => (v ? "true" : "false"),
    ),
    rowFromMaybe(
      "artifact.maxSupply",
      aggRead?.artifact?.maxSupply,
      safeCore?.maxSupply,
      (v) => v.toString(),
    ),
    rowFromMaybe(
      "artifact.totalMinted",
      aggRead?.artifact?.totalMinted,
      safeCore?.totalMinted,
      (v) => v.toString(),
    ),
    rowFromMaybe(
      "artifact.walletLimit",
      aggRead?.artifact?.walletLimit,
      safeCore?.walletLimit,
      (v) => v.toString(),
    ),
    rowFromMaybe(
      "artifact.active",
      aggRead?.artifact?.active,
      safeCore?.active,
      (v) => (v ? "true" : "false"),
    ),
  ];

  const mismatches = rows.filter((r) => r.agree === false).length;
  const ageMs = agg.dataUpdatedAt ? Date.now() - agg.dataUpdatedAt : null;
  const cacheLabel =
    ageMs === null ? "no data yet" : ageMs < 5_000 ? "live (just refreshed)" : `cache · ${formatRelativeTime(agg.dataUpdatedAt!)}`;

  return (
    <section
      aria-labelledby="discrepancy-report-title"
      className="rounded-xl border border-border/60 bg-muted/40 overflow-hidden"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
        <div>
          <h3
            id="discrepancy-report-title"
            className="text-sm font-semibold text-foreground tracking-tight"
          >
            Read discrepancy report
          </h3>
          <p className="mt-0.5 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Multicall (mint gate) vs per-call safe reads · {cacheLabel}
          </p>
        </div>
        <div className="mono text-[10px] uppercase tracking-[0.22em]">
          {mismatches === 0 ? (
            <span className="text-emerald-300">no mismatches</span>
          ) : (
            <span className="text-destructive">{mismatches} mismatch{mismatches === 1 ? "" : "es"}</span>
          )}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <caption className="sr-only">
            Field-by-field comparison between the multicall path used by the mint
            gate and the per-call safe reads.
          </caption>
          <thead>
            <tr className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border/40">
              <th scope="col" className="px-4 py-2 font-normal">Field</th>
              <th scope="col" className="px-4 py-2 font-normal">Multicall</th>
              <th scope="col" className="px-4 py-2 font-normal">Per-call</th>
              <th scope="col" className="px-4 py-2 font-normal">Parity</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border/40 last:border-b-0">
                <td className="px-4 py-2 font-mono text-[11px] text-foreground/80 whitespace-nowrap">
                  {row.label}
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-foreground">{row.multicall}</td>
                <td className="px-4 py-2 font-mono text-[11px] text-foreground">{row.perCall}</td>
                <td className="px-4 py-2">{agreePill(row.agree)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
