import {
  CONTRACTS,
  SYN_EXPLORERS,
  TOKEN_SPEC,
  LEGAL_DISCLAIMER,
  explorerUrlFor,
  extrasForAddress,
} from "@/lib/syndicate-config";
import { ContractLink } from "./Primitives";
import { importSynToWallet, MetaMaskIcon } from "@/lib/wallet-import";

const SYN_ADDRESS = CONTRACTS.SYN_CONTRACT_ADDRESS;

const SPEC_ROWS: Array<[string, string]> = [
  ["Status", "LIVE"],
  ["Chain", "Avalanche C-Chain"],
  ["Supply", `${TOKEN_SPEC.totalSupply.toLocaleString("en-US")} SYN`],
  ["Decimals", String(TOKEN_SPEC.decimals)],
  ["Type", "ERC20 · Burnable · Permit"],
  ["Mint", "Disabled"],
  ["Tax", "0%"],
  ["Owner / Admin", "None"],
  ["Pause", "None"],
  ["Blacklist / Whitelist", "None"],
  ["Max wallet / Max tx", "None"],
  ["Transfer restrictions", "None"],
];


export function SynLiveStatus() {
  return (
    <section
      id="syn-live"
      aria-labelledby="syn-live-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
        <header className="mb-8 md:mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-[11px] mono uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400 mb-3">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              SYN is Live on Avalanche
            </div>
            <h2
              id="syn-live-heading"
              className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
            >
              The SYN token is deployed and verifiable
            </h2>
            <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
              Fixed supply ERC20. No owner, no admin, no mint, no pause, no
              blacklist, no tax, no transfer restrictions. The Membership Sale
              is live — routing, wallets, LP, and core contracts are verifiable today.
            </p>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Spec card */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Token Status
            </h3>
            <div className="mb-4">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Contract</div>
              <ContractLink
                address={SYN_ADDRESS}
                explorerHref={explorerUrlFor("SYN_CONTRACT_ADDRESS")}
                extras={extrasForAddress(SYN_ADDRESS)}
              />
            </div>
            <dl className="divide-y divide-border/40">
              {SPEC_ROWS.map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className={`font-mono text-foreground text-right ${k === "Status" ? "text-emerald-600 dark:text-emerald-400 font-semibold" : ""}`}>
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </article>

          {/* Verification + actions */}
          <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6 flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Verify on-chain
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <ExplorerLink href={SYN_EXPLORERS.avascan} label="View on Avascan" />
                <ExplorerLink href={SYN_EXPLORERS.sourcify} label="View Source on Sourcify" />
                <ExplorerLink href={SYN_EXPLORERS.routescan} label="View on Routescan" />
                <ExplorerLink href={SYN_EXPLORERS.snowtrace} label="View on Snowtrace" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Add to Wallet
              </h3>
              <button
                onClick={importSynToWallet}
                className="w-full inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium border border-[var(--gold)]/60 hover:bg-[var(--gold)]/10 transition-colors"
              >
                <MetaMaskIcon className="size-5" />
                Import SYN to Wallet
              </button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Uses EIP-747 (MetaMask, Core Wallet, Rabby). Make sure your
                wallet is on Avalanche C-Chain.
              </p>
            </div>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-400 mb-1.5">
                Sale Status
              </div>
              <p className="text-sm text-foreground font-medium">
                Membership Sale is LIVE
              </p>
              <ul className="mt-2 text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>SYN token live on Avalanche.</li>
                <li>USDC → SYN at 1 SYN = $0.01.</li>
                <li>70 / 20 / 10 routing enforced onchain.</li>
              </ul>
            </div>
          </article>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/80 leading-relaxed max-w-3xl">
          {LEGAL_DISCLAIMER}
        </p>
      </div>
    </section>
  );
}

function ExplorerLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-between gap-2 rounded-md border border-border/60 hover:border-[var(--gold)]/60 px-3 py-2.5 text-sm transition-colors"
    >
      <span className="text-foreground">{label}</span>
      <span aria-hidden className="text-muted-foreground text-xs">↗</span>
    </a>
  );
}

export default SynLiveStatus;
