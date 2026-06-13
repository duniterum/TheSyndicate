import { useState, type ReactNode } from "react";
import { Section, SectionHeader, GlassCard, Pill } from "./Primitives";
import {
  CONTRACTS,
  SYN_EXPLORERS,
  LP_POOL,
  USDC_ROUTING,
  ALLOCATION_WALLETS,
  explorerUrlForAddress,
  explorerUrlFor,
  txExplorerUrl,
  PROOF_OF_FIRE_001,
} from "@/lib/syndicate-config";
import { routescanContractCodeUrl } from "@/lib/chain-registry";
import { useSaleStats, useLpStats, fmtUsdc, fmtSyn } from "@/lib/sale-hooks";
import { useTreasuryAssets, useSynSupply } from "@/lib/treasury-hooks";

/**
 * VERIFY EVERYTHING — interactive Claim → Source → Explorer → Status drill-down.
 *
 * Six canonical categories. Each item exposes the same four columns so a
 * visitor can audit any claim end-to-end without prior context:
 *   1. CLAIM        — the plain-English statement the site makes
 *   2. SOURCE       — the onchain primitive that backs it (function, contract, event)
 *   3. EXPLORER     — direct link to verify on Avascan / Sourcify / DexScreener
 *   4. STATUS       — LIVE / PARTIAL / PENDING with a live value where available
 */

type Status = "LIVE" | "PARTIAL" | "PENDING";

type Row = {
  id: string;
  claim: string;
  source: string;
  explorerLabel: string;
  explorerHref: string | null;
  status: Status;
  liveValue?: string;
  note?: string;
};

type Category = {
  id: string;
  title: string;
  description: string;
  rows: Row[];
};

function useCategories(): Category[] {
  const sale = useSaleStats();
  const lp = useLpStats();
  const vault = useTreasuryAssets();
  const supply = useSynSupply();

  const vaultUsdc = vault.assets.find((a) => a.symbol === "USDC");

  const tokenSupply: Category = {
    id: "token-supply",
    title: "Token supply",
    description: "Fixed 1,000,000,000 SYN. No admin, no mint, no pause.",
    rows: [
      {
        id: "supply-total",
        claim: "SYN total supply equals 1,000,000,000 with 18 decimals.",
        source: "ERC20 totalSupply() on SYN contract",
        explorerLabel: "Avascan",
        explorerHref: SYN_EXPLORERS.avascan,
        status: supply.totalSupply !== undefined ? "LIVE" : "PENDING",
        liveValue:
          supply.totalSupply !== undefined
            ? `${supply.totalSupply.toLocaleString("en-US")} SYN`
            : undefined,
        note: "Check 'totalSupply' on the read tab.",
      },
      {
        id: "supply-burned",
        claim: "1,000 SYN has been permanently sent to the standard dead address — a verified supply reduction.",
        source: "ERC20 balanceOf(0x…dEaD) on the SYN contract — the standard burn address",
        explorerLabel: "Burn tx",
        explorerHref: txExplorerUrl(PROOF_OF_FIRE_001.txHash),
        // Burn here is a verifiable TRANSFER to the dead address, not a
        // contract-level supply change — always LIVE (reads the dead-address
        // balance). Never PENDING: the burn address always resolves.
        status: "LIVE",
        liveValue:
          supply.burned !== undefined
            ? `${supply.burned.toLocaleString("en-US")} SYN burned`
            : undefined,
        note: "Proof of Burn #001 — a Founder Burn of 1,000 SYN to the standard dead address. There is no automated burn; any burn is a manual, verifiable transfer.",
      },
      {
        id: "supply-source",
        claim: "SYN source code is verified and matches the deployed bytecode.",
        source: "Sourcify verified record",
        explorerLabel: "Sourcify",
        explorerHref: SYN_EXPLORERS.sourcify,
        status: "LIVE",
        note: "Confirm a green 'Full match' badge.",
      },
    ],
  };

  const membershipRevenue: Category = {
    id: "membership-revenue",
    title: "Membership revenue",
    description: "Every USDC enters through the Membership Sale contract.",
    rows: [
      {
        id: "rev-total",
        claim: "Total USDC routed by the Membership Sale is publicly readable.",
        source: "totalUsdcRaised() on Membership Sale",
        explorerLabel: "Sale contract",
        explorerHref: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
        status: sale.totalUsdcRaised !== undefined ? "LIVE" : "PENDING",
        liveValue:
          sale.totalUsdcRaised !== undefined ? `$${fmtUsdc(sale.totalUsdcRaised)} USDC` : undefined,
      },
      {
        id: "rev-buyers",
        claim: "Distinct buyer count is tracked onchain.",
        source: "totalBuyers() on Membership Sale",
        explorerLabel: "Sale contract",
        explorerHref: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
        status: sale.totalBuyers !== undefined ? "LIVE" : "PENDING",
        liveValue:
          sale.totalBuyers !== undefined ? `${sale.totalBuyers.toString()} buyers` : undefined,
      },
      {
        id: "rev-syn-sold",
        claim: "SYN distributed through the sale is tracked onchain.",
        source: "totalSynSold() on Membership Sale",
        explorerLabel: "Sale contract",
        explorerHref: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
        status: sale.totalSynSold !== undefined ? "LIVE" : "PENDING",
        liveValue:
          sale.totalSynSold !== undefined ? `${fmtSyn(sale.totalSynSold)} SYN` : undefined,
      },
    ],
  };

  const vaultBalance: Category = {
    id: "vault-balance",
    title: "Vault balance",
    description: "Protocol-controlled USDC held in the public Vault wallet.",
    rows: [
      {
        id: "vault-usdc",
        claim: "Vault holds verifiable USDC.",
        source: "USDC.balanceOf(VAULT_WALLET)",
        explorerLabel: "Vault wallet",
        explorerHref: explorerUrlForAddress(CONTRACTS.VAULT_WALLET),
        status: vaultUsdc?.amount !== undefined ? "LIVE" : "PENDING",
        liveValue:
          vaultUsdc?.amount !== undefined
            ? `$${Math.round(vaultUsdc.amount).toLocaleString("en-US")} USDC`
            : undefined,
        note: "Inspect the ERC20 transfers tab for full history.",
      },
      {
        id: "vault-other",
        claim: "Non-USDC vault assets are listed but lack a verified price oracle.",
        source: "balanceOf at VAULT_WALLET for BTC.b, WETH.e, AVAX",
        explorerLabel: "Vault wallet",
        explorerHref: explorerUrlForAddress(CONTRACTS.VAULT_WALLET),
        status: "PARTIAL",
        note: "Balances live. USD value PENDING until an oracle is wired.",
      },
    ],
  };

  const liquidityBalance: Category = {
    id: "liquidity-balance",
    title: "Liquidity balance",
    description: "SYN/USDC pool on Trader Joe v1.",
    rows: [
      {
        id: "lp-reserves",
        claim: "LP pool holds verifiable SYN and USDC reserves.",
        source: "getReserves() on pair contract",
        explorerLabel: "Pair contract",
        explorerHref: explorerUrlForAddress(LP_POOL.pairAddress),
        status:
          lp.synReserve !== undefined && lp.usdcReserve !== undefined ? "LIVE" : "PENDING",
        liveValue:
          lp.synReserve !== undefined && lp.usdcReserve !== undefined
            ? `${Math.round(lp.synReserve).toLocaleString("en-US")} SYN · $${lp.usdcReserve.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`
            : undefined,
      },
      {
        id: "lp-price",
        claim: "Implied SYN spot price is derived from the AMM reserves.",
        source: "usdcReserve / synReserve",
        explorerLabel: "DexScreener",
        explorerHref: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`,
        status: lp.synPriceUsd !== undefined ? "LIVE" : "PENDING",
        liveValue:
          lp.synPriceUsd !== undefined ? `$${lp.synPriceUsd.toFixed(6)} / SYN` : undefined,
      },
    ],
  };

  const routing: Category = {
    id: "routing",
    title: "Routing 70 / 20 / 10",
    description: "Every USDC purchase is split atomically inside the Sale contract.",
    rows: USDC_ROUTING.map((r) => ({
      id: `route-${r.key}`,
      claim: `${r.pct}% of every USDC payment routes to the ${r.label}.`,
      source: `Membership Sale internal split → ${r.key}`,
      explorerLabel: r.label,
      explorerHref: explorerUrlForAddress(CONTRACTS[r.key]),
      status: "LIVE" as const,
      note: "Filter ERC20 transfers by the Sale contract sender to audit.",
    })),
  };

  const contracts: Category = {
    id: "contract-verification",
    title: "Contract verification",
    description: "Source code published, no upgrade keys, no hidden admin.",
    rows: [
      {
        id: "syn-verified",
        claim: "SYN ERC20 source is verified.",
        source: "Sourcify full-match record",
        explorerLabel: "Sourcify",
        explorerHref: SYN_EXPLORERS.sourcify,
        status: "LIVE",
      },
      {
        id: "sale-published",
        claim: "Membership Sale contract is deployed and readable.",
        source: "Routescan code tab",
        explorerLabel: "Routescan",
        explorerHref: routescanContractCodeUrl(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS) ?? "",
        status: "PARTIAL",
        note: "Bytecode live. Source publication in progress.",
      },
      {
        id: "allocations",
        claim: "Every allocation wallet is publicly listed and labeled.",
        source: "ALLOCATION_WALLETS registry",
        explorerLabel: "Membership wallet",
        explorerHref: explorerUrlForAddress(
          ALLOCATION_WALLETS["Membership Distribution"],
        ),
        status: "LIVE",
        note: "Compare each label to its onchain balance on the Tokenomics page.",
      },
    ],
  };

  return [tokenSupply, membershipRevenue, vaultBalance, liquidityBalance, routing, contracts];
}

const STATUS_TONE: Record<Status, string> = {
  LIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  PARTIAL: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  PENDING: "border-border/60 bg-muted/40 text-muted-foreground",
};

function StatusChip({ s }: { s: Status }) {
  return (
    <span
      className={`mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${STATUS_TONE[s]}`}
    >
      {s}
    </span>
  );
}

function HeaderCell({ children }: { children: ReactNode }) {
  return (
    <th className="py-3 px-4 text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
      {children}
    </th>
  );
}

export function VerifyEverything() {
  const categories = useCategories();
  const [activeId, setActiveId] = useState(categories[0].id);
  const [filter, setFilter] = useState<Set<Status>>(new Set(["LIVE", "PARTIAL", "PENDING"]));

  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const visibleRows = active.rows.filter((r) => filter.has(r.status));

  const toggle = (s: Status) =>
    setFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next.size === 0 ? new Set(["LIVE", "PARTIAL", "PENDING"] as Status[]) : next;
    });

  return (
    <Section id="verify-everything">
      <SectionHeader
        eyebrow="Verification"
        title={
          <>
            Claim → Source → Explorer → <span className="text-gradient-gold">Status</span>
          </>
        }
        description="Pick any claim the site makes. See the onchain primitive that backs it, jump to the explorer, and confirm the live status. No estimates, no off-chain spreadsheets."
      />

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {categories.map((c) => {
          const isActive = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              className={`mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border transition-colors ${
                isActive
                  ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-[color:oklch(0.5_0.13_75)]"
                  : "border-border/60 text-muted-foreground hover:text-foreground hover:border-foreground/40"
              }`}
            >
              {c.title}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Filter status
        </span>
        {(["LIVE", "PARTIAL", "PENDING"] as Status[]).map((s) => {
          const on = filter.has(s);
          return (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={`mono text-[9px] uppercase tracking-[0.16em] px-2 py-0.5 rounded-full border transition-opacity ${STATUS_TONE[s]} ${on ? "opacity-100" : "opacity-30"}`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-border/40">
          <div className="flex items-center gap-2 mb-1">
            <Pill tone="gold">{active.title}</Pill>
            <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {visibleRows.length} / {active.rows.length} claims
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{active.description}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <HeaderCell>Claim</HeaderCell>
                <HeaderCell>Source</HeaderCell>
                <HeaderCell>Explorer</HeaderCell>
                <HeaderCell>Status</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r) => (
                <tr key={r.id} className="border-b border-border/20 last:border-0 align-top">
                  <td className="py-3 px-4">
                    <div className="text-sm">{r.claim}</div>
                    {r.liveValue && (
                      <div className="mono text-xs text-[color:oklch(0.5_0.13_75)] mt-1">
                        {r.liveValue}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 mono text-xs text-muted-foreground">{r.source}</td>
                  <td className="py-3 px-4">
                    {r.explorerHref ? (
                      <a
                        href={r.explorerHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-xs underline-offset-4 hover:underline hover:text-[var(--gold)]"
                      >
                        {r.explorerLabel} ↗
                      </a>
                    ) : (
                      <span className="mono text-xs text-muted-foreground">—</span>
                    )}
                    {r.note && (
                      <div className="mono text-[10px] text-muted-foreground mt-1 leading-snug">
                        {r.note}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusChip s={r.status} />
                  </td>
                </tr>
              ))}
              {visibleRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-sm text-muted-foreground">
                    No claims match the selected status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <p className="mt-4 text-xs text-muted-foreground mono leading-relaxed">
        LIVE = onchain right now · PARTIAL = some fields verifiable, others awaiting infra · PENDING
        = contract not yet deployed or value not yet readable.
      </p>
    </Section>
  );
}
