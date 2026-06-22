// My Purchase Routing — receipt-grade summary derived from the
// wallet's indexed TokensPurchased history.
//
// Doctrine: docs/PROTOCOL_IN_PUBLIC_DOCTRINE.md
//   • This is a RECEIPT. Not ownership.
//   • "Where your payment went" — never ownership-root language.
//   • 70/20/10 is the canonical protocol routing; we derive the per-wallet
//     totals from cumulativeUsdc using that fixed split.

import { useAccount } from "wagmi";
import { useHolderIndex } from "@/lib/holder-index";
import { GlassCard, Pill, Section, SectionHeader, StatusPill } from "./Primitives";
import { Link as RouterLink } from "@tanstack/react-router";

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function MyPurchaseRouting() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  const total = record?.cumulativeUsdc ?? 0;
  const vault = record?.cumulativeRoutedToVault ?? 0;
  const liquidity = record?.cumulativeRoutedToLiquidity ?? 0;
  const operations = record?.cumulativeRoutedToOperations ?? 0;
  const netRouted = vault + liquidity + operations;
  const acquisitionCommission = Math.max(0, total - netRouted);

  return (
    <Section id="purchase-routing">
      <SectionHeader
        eyebrow="Purchase Routing"
        title={<>Where your <span className="text-gradient-gold">payment went</span></>}
        description="An on-chain receipt. USDC paid, any acquisition commission, and the net amount routed to Vault, Liquidity, and Operations are read from indexed purchase receipts."
      />
      <GlassCard className="p-5">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <StatusPill status={isConnected && record ? "LIVE" : "PENDING"} />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Source · indexed TokensPurchased · split is contract-enforced
          </span>
        </div>

        {!isConnected ? (
          <p className="text-sm text-muted-foreground">
            Connect a wallet to see where your payments were routed on-chain.
          </p>
        ) : !record ? (
          <p className="text-sm text-muted-foreground">
            No purchases recorded for this wallet yet.{" "}
            <RouterLink to="/join" className="text-foreground underline-offset-4 hover:underline">
              Join the Membership Sale →
            </RouterLink>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <Tile label="Total Paid" value={fmtUsd(total)} hint={`${record.purchaseCount} purchase${record.purchaseCount === 1 ? "" : "s"}`} emphasize />
              <Tile label="Net Routed" value={fmtUsd(netRouted)} hint="gross minus source commission" />
              <Tile label="Acquisition" value={fmtUsd(acquisitionCommission)} hint="inactive today unless receipt says otherwise" />
              <Tile label="Routed to Vault" value={fmtUsd(vault)} hint="70% · reserve" />
              <Tile label="Routed to Liquidity" value={fmtUsd(liquidity)} hint="20% · LP" />
              <Tile label="Routed to Operations" value={fmtUsd(operations)} hint="10% · ops" />
            </div>

            {/* Visual proportion bar */}
            <div className="mt-4 h-2 w-full rounded-md overflow-hidden flex border border-border/40" aria-hidden>
              <div style={{ width: "70%" }} className="bg-[var(--gold)]/70" />
              <div style={{ width: "20%" }} className="bg-[color:oklch(0.55_0.13_220)]/70" />
              <div style={{ width: "10%" }} className="bg-foreground/30" />
            </div>
            <div className="mt-1 flex justify-between text-[10px] mono uppercase tracking-[0.16em] text-muted-foreground">
              <span>Vault 70%</span>
              <span>Liquidity 20%</span>
              <span>Operations 10%</span>
            </div>
          </>
        )}

        <div className="mt-4 border-t border-border/40 pt-3 flex flex-wrap items-center gap-3 justify-between">
          <Pill tone="muted">Receipt — not ownership</Pill>
          <RouterLink
            to="/transparency"
            className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Verify the protocol-wide ledger →
          </RouterLink>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          Routing proof shows where your payment went. It does not create ownership,
          repayment rights, control rights, or rights against Vault, Liquidity, or
          Operations wallets.
        </p>
      </GlassCard>
    </Section>
  );
}

function Tile({
  label,
  value,
  hint,
  emphasize = false,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`surface elevated p-3 flex flex-col gap-1 ${
        emphasize ? "border-[var(--gold)]/30 bg-[var(--gold)]/[0.03]" : ""
      }`}
    >
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </div>
      <div className="mono text-base font-semibold leading-none mt-1 truncate">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground mt-0.5">{hint}</div>}
    </div>
  );
}
