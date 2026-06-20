// ArchiveReadHealthPanel — transparent per-call health grid for the
// SyndicateArchive1155 reads that drive /nft. Shows each function call
// (remainingSupply, isMintable, walletRemaining, getArtifactCore,
// rendererMode, maxSupply, walletLimit, totalMinted, uri) with PASS /
// PENDING / FAIL plus the exact error or revert reason when it fails.
//
// Also surfaces configured RPC health (primary + fallback) by label only. The
// endpoint URLs are not rendered in the UI.
//
// READ-ONLY. No write paths. Refetches under the hood every 60s; users can
// also press "Recheck" to force a fresh probe.
import { useArchiveSafeReads, type SafeReadResult } from "@/lib/archive-safe-reads";
import { useArchiveRpcHealth, type RpcEndpointStatus } from "@/lib/archive-rpc-health";
import { RENDERER_MODE_LABEL } from "@/lib/archive-nft-abi";
import { formatRelativeTime } from "@/lib/archive-nft-hooks";

type Row = {
  call: string;
  result: string;
  status: "ok" | "pending" | "error";
  error?: string | null;
  updatedAt?: number | undefined;
  note?: string;
};

function statusPill(status: Row["status"]) {
  if (status === "ok")
    return (
      <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-emerald-500/40 text-emerald-300 bg-emerald-500/5">
        PASS
      </span>
    );
  if (status === "pending")
    return (
      <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-border text-muted-foreground bg-muted/40">
        PENDING
      </span>
    );
  return (
    <span className="mono text-[9px] uppercase tracking-[0.22em] px-1.5 py-0.5 rounded border border-destructive/40 text-destructive bg-destructive/5">
      FAIL
    </span>
  );
}

function valOrDash<T>(r: SafeReadResult<T>, fmt: (v: T) => string): string {
  if (r.status === "pending") return "—";
  if (r.status === "error" || r.value === undefined) return "—";
  return fmt(r.value);
}

function rpcRow(e: RpcEndpointStatus) {
  const status: Row["status"] = e.ok ? "ok" : e.checkedAt === 0 ? "pending" : "error";
  const result = e.ok
    ? `chainId ${e.chainId} · ${e.latencyMs ?? "—"}ms`
    : e.error ?? "Not reachable";
  return { call: `RPC · ${e.label}`, result, status, error: e.ok ? null : e.error };
}

export function ArchiveReadHealthPanel({ tokenId = 1 }: { tokenId?: number }) {
  const r = useArchiveSafeReads(tokenId);
  const rpc = useArchiveRpcHealth();

  const core = r.artifactCore.value?.ok ? r.artifactCore.value.value : undefined;

  const rows: Row[] = [
    {
      call: `remainingSupply(${tokenId})`,
      result: valOrDash(r.remainingSupply, (v) => v.toString()),
      status: r.remainingSupply.status,
      error: r.remainingSupply.error,
      updatedAt: r.remainingSupply.updatedAt,
    },
    {
      call: `getArtifactCore(${tokenId})`,
      result: r.artifactCore.value?.ok ? "tuple decoded" : "—",
      status: r.artifactCore.status,
      error: r.artifactCore.error,
      updatedAt: r.artifactCore.updatedAt,
      note: "Strict tuple validator — 9 fields, exact types.",
    },
    {
      call: "  ↳ rendererMode",
      result: core ? `${core.rendererMode} (${RENDERER_MODE_LABEL[core.rendererMode] ?? "UNKNOWN"})` : "—",
      status: core ? "ok" : r.artifactCore.status,
      error: core ? null : r.artifactCore.error,
    },
    {
      call: "  ↳ maxSupply",
      result: core ? core.maxSupply.toString() : "—",
      status: core ? "ok" : r.artifactCore.status,
      error: core ? null : r.artifactCore.error,
    },
    {
      call: "  ↳ walletLimit",
      result: core ? core.walletLimit.toString() : "—",
      status: core ? "ok" : r.artifactCore.status,
      error: core ? null : r.artifactCore.error,
    },
    {
      call: "  ↳ totalMinted",
      result: core ? core.totalMinted.toString() : "—",
      status: core ? "ok" : r.artifactCore.status,
      error: core ? null : r.artifactCore.error,
    },
    {
      call: "  ↳ priceUsdc",
      result: core ? `${core.priceUsdc.toString()} (raw, 6dp)` : "—",
      status: core ? "ok" : r.artifactCore.status,
      error: core ? null : r.artifactCore.error,
    },
    {
      call: `isMintable(${tokenId}, REFERENCE, 1)`,
      result: valOrDash(r.isMintableReference, (v) => (v ? "true" : "false")),
      status: r.isMintableReference.status,
      error: r.isMintableReference.error,
      updatedAt: r.isMintableReference.updatedAt,
    },
    {
      call: `isMintable(${tokenId}, connected, 1)`,
      result: r.connectedWallet
        ? valOrDash(r.isMintableConnected, (v) => (v ? "true" : "false"))
        : "wallet not connected",
      status: r.connectedWallet ? r.isMintableConnected.status : "pending",
      error: r.connectedWallet ? r.isMintableConnected.error : null,
    },
    {
      call: `walletRemaining(${tokenId}, connected)`,
      result: r.connectedWallet
        ? valOrDash(r.walletRemaining, (v) => v.toString())
        : "wallet not connected",
      status: r.connectedWallet ? r.walletRemaining.status : "pending",
      error: r.connectedWallet ? r.walletRemaining.error : null,
    },
    {
      call: `uri(${tokenId})`,
      result: r.uri.value
        ? `${r.uri.value.slice(0, 38)}…`
        : "—",
      status: r.uri.status,
      error: r.uri.error,
      updatedAt: r.uri.updatedAt,
      note: "Returns base64 data-URI with on-chain SVG inline.",
    },
    rpcRow(rpc.endpoints[0]),
    rpcRow(rpc.endpoints[1]),
  ];

  const fails = rows.filter((r) => r.status === "error").length;
  const pendings = rows.filter((r) => r.status === "pending").length;
  const passes = rows.filter((r) => r.status === "ok").length;

  return (
    <section
      aria-labelledby="onchain-read-health-title"
      className="rounded-xl border border-border/60 bg-muted/40 overflow-hidden"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-border/60">
        <div>
          <h3
            id="onchain-read-health-title"
            className="text-sm font-semibold text-foreground tracking-tight"
          >
            On-chain read health
          </h3>
          <p className="mt-0.5 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Every Archive1155 call · live · honest failure reasons
          </p>
        </div>
        <div className="flex items-center gap-2 mono text-[10px] uppercase tracking-[0.22em]">
          <span className="text-emerald-300">{passes} pass</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{pendings} pending</span>
          <span className="text-muted-foreground">·</span>
          <span className={fails > 0 ? "text-destructive" : "text-muted-foreground"}>
            {fails} fail
          </span>
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <caption className="sr-only">
            Per-call health of every SyndicateArchive1155 read used on /nft.
          </caption>
          <thead>
            <tr className="mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground border-b border-border/40">
              <th scope="col" className="px-4 py-2 font-normal">Call</th>
              <th scope="col" className="px-4 py-2 font-normal">Result</th>
              <th scope="col" className="px-4 py-2 font-normal">Status</th>
              <th scope="col" className="px-4 py-2 font-normal hidden sm:table-cell">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.call} className="border-b border-border/40 last:border-b-0">
                <td className="px-4 py-2 font-mono text-[11px] text-foreground/80 whitespace-nowrap">
                  {row.call}
                </td>
                <td className="px-4 py-2 text-foreground">
                  <div className="font-mono text-[11px] break-all">{row.result}</div>
                  {row.error ? (
                    <div className="mt-0.5 text-[10px] text-destructive/90 break-words">
                      {row.error}
                    </div>
                  ) : null}
                  {row.note ? (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{row.note}</div>
                  ) : null}
                </td>
                <td className="px-4 py-2 align-top">{statusPill(row.status)}</td>
                <td className="px-4 py-2 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hidden sm:table-cell">
                  {row.updatedAt ? formatRelativeTime(row.updatedAt) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
