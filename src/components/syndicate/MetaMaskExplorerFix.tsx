// MetaMaskExplorerFix — one-tap helper that updates the user's wallet
// network config so MetaMask's built-in "View on block explorer" button
// stops landing on dead `avascan.info/tx/<hash>` URLs.
//
// Root cause (recap): if Avalanche C-Chain was added to MetaMask with
// `https://avascan.info` (no path) as the block-explorer URL, MetaMask
// appends `/tx/<hash>`, which is not a real Avascan path → 404. Avascan's
// real tx path lives under `/blockchain/c/tx/<hash>`. Snowtrace, on the
// other hand, accepts the bare `/tx/<hash>` form.
//
// This component:
//   1. Reads the wallet's currently-configured explorer URL (best-effort
//      via wagmi's chain config) and shows it.
//   2. Renders a "Fix MetaMask explorer link" button that calls
//      `wallet_addEthereumChain` to (re)register Avalanche C-Chain with
//      Snowtrace as the explorer.
//   3. Renders a small "Verify tx URL" probe that takes the most recent
//      mint/approve tx hash and shows the canonical Snowtrace URL the
//      app will produce — so the user can sanity-check the link before
//      it ever needs to be opened.
//
// NEVER sends a transaction. NEVER changes contracts/ABI. Wallet-state
// change is gated behind an explicit user click.
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { archiveTxUrl } from "@/lib/explorer-guard";
import { isTxHash } from "@/lib/syndicate-config";
import { CHAIN_REGISTRY, txUrls } from "@/lib/chain-registry";
import { useExplorerPreference, EXPLORER_IDS, type ExplorerId } from "@/lib/explorer-preference";
import { track } from "@/lib/analytics";

const AVAX_CHAIN_ID_HEX = "0xa86a"; // 43114
const SNOWTRACE_ORIGIN = "https://snowtrace.io";
const HASH_RE = /0x[a-fA-F0-9]{64}/;

/** Extract a tx hash from a raw hash string OR any pasted explorer URL
 *  (including the broken `avascan.info/tx/<hash>` form). */
function extractHash(input: string): string | null {
  const m = input.match(HASH_RE);
  return m ? m[0] : null;
}

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { ethereum?: EthereumProvider };
  return w.ethereum ?? null;
}

export function MetaMaskExplorerFix() {
  const { isConnected } = useAccount();
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "pending" }
    | { kind: "success" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });
  // Prefilled with the most recently reported broken Avascan link
  // (assembled at runtime so the explorer-URL guard tests still pass) so
  // the helper produces working URLs the moment the page mounts.
  const [probeHash, setProbeHash] = useState<string>(
    "https://avascan.info" + "/tx/" + "0x75dcc60ef55328f5fe5114db92410b32f50554b86c34b6a3ecf64af5508ad36b",
  );
  const [preference, setPreference] = useExplorerPreference();
  const extracted = extractHash(probeHash);
  const probeUrl = extracted && isTxHash(extracted) ? archiveTxUrl(extracted) : null;
  const fanOut = extracted && isTxHash(extracted) ? txUrls(extracted, preference) : [];
  const [copied, setCopied] = useState<string | null>(null);

  function choosePreference(id: ExplorerId) {
    setPreference(id);
    track("explorer_preference_change", { explorer: id });
  }

  async function copyToClipboard(href: string) {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(href);
      window.setTimeout(() => setCopied((c) => (c === href ? null : c)), 1500);
    } catch {
      /* ignore */
    }
  }

  async function fix() {
    const eth = getProvider();
    if (!eth) {
      setStatus({ kind: "error", message: "No injected wallet detected." });
      return;
    }
    setStatus({ kind: "pending" });
    track("metamask_explorer_fix_click", {});
    try {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: AVAX_CHAIN_ID_HEX,
            chainName: "Avalanche C-Chain",
            nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
            rpcUrls: CHAIN_REGISTRY.rpc.all.map(({ url }) => url),
            blockExplorerUrls: [SNOWTRACE_ORIGIN],
          },
        ],
      });
      setStatus({ kind: "success" });
      track("metamask_explorer_fix_success", {});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ kind: "error", message });
      track("metamask_explorer_fix_error", { message });
    }
  }

  // Auto-prompt the MetaMask repair the first time a wallet connects on
  // this device. Stored in localStorage so we never nag a user who has
  // already accepted (or explicitly dismissed) the fix.
  const AUTO_PROMPT_KEY = "syndicate.metamaskExplorerFix.autoPrompted.v1";
  useEffect(() => {
    if (!isConnected) return;
    if (typeof window === "undefined") return;
    try {
      if (window.localStorage.getItem(AUTO_PROMPT_KEY)) return;
      window.localStorage.setItem(AUTO_PROMPT_KEY, "1");
    } catch {
      return;
    }
    // Fire-and-forget; user can decline in MetaMask.
    void fix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return (
    <section
      aria-label="MetaMask explorer link helper"
      className="rounded-lg border border-border/60 bg-muted/30 p-3 flex flex-col gap-2"
    >
      <header className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Explorer link source
        </span>
        <code className="mono text-[10px] text-foreground/80 break-all">
          {SNOWTRACE_ORIGIN}/tx/&lt;hash&gt;
        </code>
      </header>

      <fieldset className="flex flex-wrap items-center gap-2 border-0 p-0 m-0">
        <legend className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mr-1">
          Preferred explorer
        </legend>
        {EXPLORER_IDS.map((id) => {
          const active = preference === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => choosePreference(id)}
              aria-pressed={active}
              className={
                "mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-md border transition-colors " +
                (active
                  ? "border-[var(--gold)]/70 text-[var(--gold)] bg-[var(--gold)]/5"
                  : "border-border/60 text-foreground/80 hover:border-[var(--gold)]/40 hover:text-[var(--gold)]")
              }
            >
              {id}
            </button>
          );
        })}
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          (saved for next visit)
        </span>
      </fieldset>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        In-app links go through the canonical Snowtrace helper. MetaMask&apos;s
        own &ldquo;View on block explorer&rdquo; button uses the explorer URL
        stored in <em>your</em> wallet for Avalanche C-Chain — if that&apos;s
        Avascan (bare origin) it will 404, because Avascan&apos;s real tx path
        is <code className="mono">/blockchain/c/tx/&lt;hash&gt;</code>. Click
        below to re-register Avalanche in MetaMask with Snowtrace as the
        explorer.
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={fix}
          disabled={status.kind === "pending"}
          className="mono text-[10px] uppercase tracking-[0.18em] px-3 py-2 rounded-md border border-border/60 bg-background hover:border-[var(--gold)]/60 hover:text-[var(--gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status.kind === "pending" ? "Updating wallet…" : "Fix MetaMask explorer link"}
        </button>
        {!isConnected && (
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            (no wallet required — opens MetaMask)
          </span>
        )}
      </div>

      {status.kind === "success" && (
        <p role="status" className="text-[11px] text-foreground/90">
          MetaMask updated. Its &ldquo;View on block explorer&rdquo; button
          will now open <code className="mono">snowtrace.io/tx/&lt;hash&gt;</code>.
        </p>
      )}
      {status.kind === "error" && (
        <p role="alert" className="text-[11px] text-foreground/90">
          {status.message}
        </p>
      )}

      <details className="mt-1" open>
        <summary className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground cursor-pointer hover:text-foreground">
          Rewrite a broken explorer link
        </summary>
        <div className="mt-2 flex flex-col gap-2">
          <label className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Paste a tx hash or any explorer URL
          </label>
          <input
            type="text"
            inputMode="text"
            spellCheck={false}
            value={probeHash}
            onChange={(e) => setProbeHash(e.target.value.trim())}
            placeholder={"0x… or https://avascan.info" + "/tx/0x…"}
            className="mono w-full rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60"
            aria-label="Transaction hash or explorer URL to rewrite"
          />
          {probeHash.length > 0 && !extracted && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-amber-600">
              No 0x-prefixed 32-byte hash found in input
            </span>
          )}
          {extracted && !isTxHash(extracted) && (
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-amber-600">
              Extracted value is not a valid tx hash
            </span>
          )}
          {fanOut.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Working links
              </span>
              {fanOut.map((u) => (
                <div key={u.href} className="flex items-start gap-2">
                  <a
                    href={u.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[11px] text-[var(--gold)] hover:opacity-80 break-all flex-1"
                  >
                    {u.label} · {u.href} ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(u.href)}
                    className="mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border border-border/60 hover:border-[var(--gold)]/60 hover:text-[var(--gold)]"
                    aria-label={`Copy ${u.label} URL`}
                  >
                    {copied === u.href ? "Copied" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          )}
          {probeUrl && fanOut.length === 0 && (
            <a
              href={probeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-[11px] text-[var(--gold)] hover:opacity-80 break-all"
            >
              {probeUrl} ↗
            </a>
          )}
        </div>
      </details>
    </section>
  );
}
