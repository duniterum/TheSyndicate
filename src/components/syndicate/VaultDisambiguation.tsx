// VaultDisambiguation — clears the three commonly-confused meanings of "Vault".
// 1) Vault Wallet (LIVE) · 2) Vault Contract (PENDING) · 3) Protocol Assets (concept)

import { Section, SectionHeader, ContractLink } from "./Primitives";
import {
  CONTRACTS,
  explorerUrlForAddress,
  extrasForAddress,
} from "@/lib/syndicate-config";

type Row = {
  name: string;
  status: "LIVE" | "PENDING" | "CONCEPT";
  oneLiner: string;
  details: string;
  wallet?: string;
};

const ROWS: Row[] = [
  {
    name: "Vault Wallet",
    status: "LIVE",
    oneLiner: "Where 70% of every USDC purchase lands today.",
    details:
      "A public allocation wallet on Avalanche C-Chain. The Membership Sale contract transfers 70% of every USDC purchase here on-chain, every time. Balances and inflows are verifiable on Avascan right now.",
    wallet: CONTRACTS.VAULT_WALLET,
  },
  {
    name: "Vault Contract",
    status: "PENDING",
    oneLiner: "The programmatic Vault — not deployed yet.",
    details:
      "A future smart contract responsible for deposit accounting, policy enforcement, and withdrawal logic. Until deployed, every module that depends on it (programmatic policy, on-chain attestations, automated rebalancing) is clearly labeled PENDING — never mixed with live numbers.",
  },
  {
    name: "Protocol Assets",
    status: "CONCEPT",
    oneLiner: "Everything the protocol holds, across all wallets.",
    details:
      "The conceptual sum of USDC, SYN, LP, and any future treasury asset held by Syndicate-controlled wallets. It is reported transparently across the Transparency Center and never blended with personal balances. Protocol Assets are owned by the protocol — not by SYN holders.",
  },
];

const statusStyle = {
  LIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  CONCEPT: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-400",
} as const;

export function VaultDisambiguation() {
  return (
    <Section id="vault-disambiguation">
      <SectionHeader
        eyebrow="The Vault — clarified"
        title={<>Three things, <span className="text-gradient-gold">one clear story</span></>}
        description='"Vault" is used in three different ways across DeFi. Here is exactly what each means inside The Syndicate, and what is live vs. pending today.'
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {ROWS.map((r) => (
          <article key={r.name} className="surface elevated p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-foreground">{r.name}</h3>
              <span className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${statusStyle[r.status]}`}>
                <span className={`size-1 rounded-full ${r.status === "LIVE" ? "bg-emerald-500 animate-pulse" : r.status === "PENDING" ? "bg-amber-500" : "bg-sky-500"}`} />
                {r.status}
              </span>
            </div>
            <p className="text-sm text-foreground font-medium">{r.oneLiner}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{r.details}</p>
            {r.wallet && (
              <div className="mt-1 surface px-3 py-2">
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Verify wallet</div>
                <ContractLink
                  address={r.wallet}
                  explorerHref={explorerUrlForAddress(r.wallet)}
                  extras={extrasForAddress(r.wallet)}
                />
              </div>
            )}
          </article>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground border-l-2 border-border/60 pl-3 max-w-3xl leading-relaxed">
        Plain version: today the Vault is a <span className="font-semibold text-foreground">wallet</span>, fully on-chain and verifiable. The Vault <span className="font-semibold text-foreground">contract</span> will replace it later. Either way, SYN holders never have a direct claim on Vault assets — the Vault belongs to the protocol.
      </p>
    </Section>
  );
}

export default VaultDisambiguation;
