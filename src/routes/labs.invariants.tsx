// In-app invariant panel — internal verification page for the 5 sale-flow
// invariants (see docs/SALE_FLOW_INVARIANTS.md) plus the persisted local
// transaction log. Noindex / not linked from production navigation.
//
// Purpose:
//   • Surface every write surface's freshness + account-pinning state at a
//     glance so we can verify the guard is live.
//   • Show the user's persisted tx history with explorer fan-out links so a
//     stale wallet event never loses a transaction trail.

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { listTxsForAccount, listAllTxs, subscribeTxHistory, clearTxHistory, type TxRecord } from "@/lib/tx-history";
import { txUrls, addressUrl } from "@/lib/chain-registry";
import { readInjectedAccounts, assessWalletFreshness } from "@/lib/wallet-freshness";

export const Route = createFileRoute("/labs/invariants")({
  head: () => ({
    meta: [
      { title: "Invariants · Internal — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InvariantPanel,
});

interface Invariant {
  id: string;
  label: string;
  status: "ok" | "warn" | "info";
  detail: string;
}

function useInvariants() {
  const { address } = useAccount();
  const [injected, setInjected] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    readInjectedAccounts()
      .then((accs) => { if (!cancelled) setInjected(accs); })
      .catch(() => { if (!cancelled) setInjected([]); });
    return () => { cancelled = true; };
  }, [address]);

  const fresh = assessWalletFreshness(address ?? null, injected);

  const items: Invariant[] = [
    {
      id: "registry",
      label: "1. Canonical registry only (no inline addresses/ABIs)",
      status: "ok",
      detail: "Enforced by src/lib/__tests__/chain-registry-guard.test.ts (duplicate-address scan).",
    },
    {
      id: "freshness",
      label: "2. Freshness guard before every writeContractAsync",
      status: fresh.ok || !address ? "ok" : "warn",
      detail: !address
        ? "No wallet connected — nothing to check."
        : fresh.ok
          ? `Injected account matches app address (${address.slice(0,6)}…${address.slice(-4)}).`
          : `MISMATCH — app shows ${(fresh as any).expected?.slice(0,6)}…, MetaMask reports ${(fresh as any).actual?.slice?.(0,6) ?? "—"}. WalletAccountSynchronizer should resync momentarily.`,
    },
    {
      id: "account-pin",
      label: "3. account: <address> pinned on every write",
      status: "ok",
      detail: "Enforced by chain-registry-guard.test.ts on MintFirstSignal, MintPatronSeal, LivePurchase.",
    },
    {
      id: "sync",
      label: "4. WalletAccountSynchronizer mounted at root",
      status: "ok",
      detail: "Listens to window.ethereum.accountsChanged → wagmi reconnect + query cache invalidation.",
    },
    {
      id: "explorer",
      label: "5. Explorer links via registry helpers only",
      status: "ok",
      detail: "txUrl / txUrls / addressUrl from chain-registry.ts. User preference honored via /x/tx/$hash.",
    },
  ];

  return { items, address, injected, fresh };
}

const STATUS_TONE: Record<Invariant["status"], string> = {
  ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  info: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

function TxRow({ tx }: { tx: TxRecord }) {
  const links = txUrls(tx.hash);
  return (
    <li className="border border-border rounded-md p-3 space-y-1 bg-card">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{tx.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${STATUS_TONE[tx.status === "confirmed" ? "ok" : tx.status === "failed" ? "warn" : "info"]}`}>
          {tx.status}
        </span>
      </div>
      <div className="font-mono text-xs text-muted-foreground break-all">{tx.hash}</div>
      <div className="text-xs text-muted-foreground">
        from <span className="font-mono">{tx.account.slice(0,6)}…{tx.account.slice(-4)}</span>
        {" · "}
        {new Date(tx.submittedAt).toLocaleString()}
      </div>
      <div className="flex gap-2 flex-wrap pt-1">
        {links.map((l) => (
          <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="text-xs underline hover:no-underline">
            {l.label}
          </a>
        ))}
      </div>
    </li>
  );
}

function InvariantPanel() {
  const { items, address, injected, fresh } = useInvariants();
  const [txs, setTxs] = useState<TxRecord[]>([]);
  const [scope, setScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    const refresh = () => setTxs(scope === "mine" ? listTxsForAccount(address ?? "") : listAllTxs());
    refresh();
    return subscribeTxHistory(refresh);
  }, [address, scope]);

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif">Sale-flow invariants</h1>
        <p className="text-sm text-muted-foreground">
          Internal verification of the 5 invariants in <code>docs/SALE_FLOW_INVARIANTS.md</code>. Not linked from production navigation. Noindex.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Invariants</h2>
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className={`border rounded-md p-3 ${STATUS_TONE[it.status]}`}>
              <div className="font-medium text-sm">{it.label}</div>
              <div className="text-xs mt-1 opacity-90">{it.detail}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Wallet state</h2>
        <div className="text-xs space-y-1 font-mono">
          <div>App address: {address ?? "—"}</div>
          <div>Injected accounts: {injected.length ? injected.join(", ") : "—"}</div>
          <div>Freshness: {fresh.ok ? "ok" : (fresh as any).code}</div>
        </div>
        {address && (
          <a href={addressUrl(address) ?? "#"} target="_blank" rel="noopener noreferrer" className="text-xs underline">
            View address on explorer →
          </a>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Persisted transactions ({txs.length})</h2>
          <div className="flex gap-2">
            <button onClick={() => setScope("mine")} className={`text-xs px-2 py-1 rounded border ${scope === "mine" ? "bg-foreground text-background" : ""}`}>Mine</button>
            <button onClick={() => setScope("all")} className={`text-xs px-2 py-1 rounded border ${scope === "all" ? "bg-foreground text-background" : ""}`}>All wallets</button>
            <button
              onClick={() => { if (confirm("Clear local tx history for the current scope?")) { clearTxHistory(scope === "mine" ? address ?? undefined : undefined); } }}
              className="text-xs px-2 py-1 rounded border border-destructive/40 text-destructive"
            >
              Clear
            </button>
          </div>
        </div>
        {txs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions recorded yet. Mints and SYN buys are persisted automatically.</p>
        ) : (
          <ul className="space-y-2">
            {txs.map((tx) => <TxRow key={tx.hash} tx={tx} />)}
          </ul>
        )}
      </section>
    </main>
  );
}
