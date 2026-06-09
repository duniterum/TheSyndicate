import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { formatUnits } from "viem";
import { Section, SectionHeader, GlassCard, StatusPill, type CanonicalStatus } from "@/components/syndicate/Primitives";
import { useSaleStats, useLpStats, fmtUsdc } from "@/lib/sale-hooks";
import { useHolderIndex } from "@/lib/holder-index";
import { useLivePurchaseEvents } from "@/lib/activity-hooks";
import { useChainTime, formatRelative } from "@/lib/chain-time";
import { CONTRACTS, EXPLORER_BASE_URL } from "@/lib/syndicate-config";

/**
 * MilestoneTracker — investor-grade public milestones.
 *
 * Each milestone discloses:
 *   - Definition           (what reaching it means)
 *   - Trigger              (the onchain event that flips status)
 *   - Verification source  (link or contract used to verify)
 *   - Status               (LIVE / PARTIAL / PENDING)
 *   - Why it matters       (one-sentence significance)
 *
 * Status is derived live from on-chain reads — never invented. No copy
 * talks about price, ROI, or appreciation. Every milestone is about
 * formation, participation, and the public archive.
 *
 * Wave 3A: reached milestones now display the block + relative time of
 * the on-chain event that crossed the threshold.
 */
type Milestone = {
  id: string;
  label: string;
  definition: string;
  trigger: string;
  verification: { label: string; href: string };
  why: string;
  status: CanonicalStatus;
  meta?: string;
  reachedAt?: { block: bigint; txHash: string; secondsAgo: number | undefined };
};

const SALE_TX_HREF = `${EXPLORER_BASE_URL}/address/${CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS}#transactions`;
const VAULT_HREF = `${EXPLORER_BASE_URL}/address/${CONTRACTS.VAULT_WALLET}`;
const SYN_HREF = `${EXPLORER_BASE_URL}/token/${CONTRACTS.SYN_CONTRACT_ADDRESS}`;
const LP_HREF = `${EXPLORER_BASE_URL}/address/${CONTRACTS.LP_PAIR_ADDRESS}`;


export function MilestoneTracker() {
  const sale = useSaleStats();
  const lp = useLpStats();
  const idx = useHolderIndex();
  const purchases = useLivePurchaseEvents({ limit: 5_000 });
  const chainTime = useChainTime();

  const usdcRaised =
    sale.totalUsdcRaised !== undefined
      ? Number(formatUnits(sale.totalUsdcRaised, 6))
      : undefined;
  // Prefer holder index for member count (canonical member intelligence).
  // Fall back to sale contract totalBuyers if the index hasn't resolved yet.
  const buyers = idx.hasData
    ? idx.totals.members
    : sale.totalBuyers !== undefined ? Number(sale.totalBuyers) : undefined;
  const lpTvl = lp.tvlUsd;

  // Walk purchase events oldest→newest, capture the block where each
  // (cumulativeUsdc ≥ target) and (uniqueMembers ≥ target) was first true.
  const reachedAt = useMemo(() => {
    const out: Record<string, { block: bigint; txHash: string }> = {};
    const events = [...(purchases.data ?? [])].sort((a, b) =>
      a.blockNumber === b.blockNumber
        ? a.logIndex - b.logIndex
        : a.blockNumber > b.blockNumber ? 1 : -1,
    );
    let cumulativeUsdc = 0;
    const seen = new Set<string>();
    const usdcMarks: Array<[number, string]> = [[100, "raise-100"], [1_000, "raise-1k"], [10_000, "raise-10k"]];
    const memberMarks: Array<[number, string]> = [[1, "first-buyer"], [100, "members-100"], [1_000, "members-1000"]];
    for (const e of events) {
      cumulativeUsdc += e.usdcAmount;
      seen.add(e.buyer.toLowerCase());
      for (const [t, id] of usdcMarks) {
        if (!out[id] && cumulativeUsdc >= t) out[id] = { block: e.blockNumber, txHash: e.txHash };
      }
      for (const [t, id] of memberMarks) {
        if (!out[id] && seen.size >= t) out[id] = { block: e.blockNumber, txHash: e.txHash };
      }
    }
    return out;
  }, [purchases.data]);

  function makeReached(id: string): Milestone["reachedAt"] {
    const r = reachedAt[id];
    if (!r) return undefined;
    return { block: r.block, txHash: r.txHash, secondsAgo: chainTime.secondsSince(r.block) };
  }

  const usdcStatus = (target: number): CanonicalStatus => {
    if (usdcRaised === undefined) return "PENDING";
    return usdcRaised >= target ? "LIVE" : "PARTIAL";
  };
  const buyerStatus = (target: number): CanonicalStatus => {
    if (buyers === undefined) return "PENDING";
    return buyers >= target ? "LIVE" : "PARTIAL";
  };
  const usdcMeta = usdcRaised !== undefined
    ? `Now: $${fmtUsdc(sale.totalUsdcRaised)}`
    : undefined;
  const buyerMeta = buyers !== undefined ? `Now: ${buyers} member${buyers === 1 ? "" : "s"}` : undefined;

  const milestones: Milestone[] = [
    {
      id: "syn-live",
      label: "SYN deployed",
      definition: "Fixed-supply ERC20 live on Avalanche C-Chain. No admin, no mint.",
      trigger: "SYN token contract deployed and verified.",
      verification: { label: "SYN contract", href: SYN_HREF },
      why: "Establishes the immutable supply that membership routes around.",
      status: "LIVE",
      meta: "Contract 0xC1Cf…0170",
    },
    {
      id: "sale-live",
      label: "Membership Sale live",
      definition: "Sale contract accepts USDC and atomically splits 70/20/10 in the same transaction.",
      trigger: "Sale contract deployed, funded, and unpaused.",
      verification: { label: "Sale contract", href: SALE_TX_HREF },
      why: "The routing every member relies on is now public and unstoppable.",
      status: "LIVE",
      meta: "Contract 0x0020…842d",
    },
    {
      id: "lp-live",
      label: "SYN/USDC pool seeded",
      definition: "Public SYN/USDC pair with readable reserves and implied price.",
      trigger: "Trader Joe v1 pair created and seeded with initial liquidity.",
      verification: { label: "LP pair", href: LP_HREF },
      why: "Members and observers can exit, enter, and price-discover transparently.",
      status: lpTvl !== undefined ? "LIVE" : "PENDING",
      meta:
        lpTvl !== undefined
          ? `TVL $${lpTvl.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
          : undefined,
    },
    {
      id: "first-buyer",
      label: "First buyer",
      definition: "First external wallet to purchase SYN through the Sale contract.",
      trigger: "totalBuyers on the Sale contract becomes ≥ 1.",
      verification: { label: "Sale transactions", href: SALE_TX_HREF },
      why: "Confirms the routing works end-to-end with real external capital.",
      status: buyerStatus(1),
      meta: buyerMeta,
      reachedAt: makeReached("first-buyer"),
    },
    {
      id: "raise-100",
      label: "First $100 raised",
      definition: "First $100 of membership USDC routed: $70 → Vault, $20 → Liquidity, $10 → Operations.",
      trigger: "totalUsdcRaised on the Sale contract crosses $100.",
      verification: { label: "Sale contract", href: SALE_TX_HREF },
      why: "First proof that the split executes atomically at non-trivial size.",
      status: usdcStatus(100),
      meta: usdcMeta,
      reachedAt: makeReached("raise-100"),
    },
    {
      id: "raise-1k",
      label: "First $1,000 raised",
      definition: "Cumulative routing crosses $1,000 — Vault now holds $700+ from membership alone.",
      trigger: "totalUsdcRaised crosses $1,000.",
      verification: { label: "Vault wallet", href: VAULT_HREF },
      why: "Vault balance becomes visibly funded by routing, not seed deposits.",
      status: usdcStatus(1_000),
      meta: usdcMeta,
      reachedAt: makeReached("raise-1k"),
    },
    {
      id: "raise-10k",
      label: "First $10,000 raised",
      definition: "Vault holds $7,000+ in public stablecoin reserves from membership routing.",
      trigger: "totalUsdcRaised crosses $10,000.",
      verification: { label: "Vault wallet", href: VAULT_HREF },
      why: "Protocol crosses from formation into a measurable public balance sheet.",
      status: usdcStatus(10_000),
      meta: usdcMeta,
      reachedAt: makeReached("raise-10k"),
    },
    {
      id: "members-333",
      label: "Genesis Signal sealed (#1 – #333)",
      definition: "333 distinct wallets registered onchain through the Sale contract.",
      trigger: "totalBuyers crosses 333.",
      verification: { label: "Sale transactions", href: SALE_TX_HREF },
      why: "Seals Chapter I (Genesis Signal) of the public archive — the founding cohort is complete.",
      status: buyerStatus(333),
      meta: buyerMeta,
      reachedAt: makeReached("members-333"),
    },
    {
      id: "members-1000",
      label: "First Thousand sealed (#334 – #1,000)",
      definition: "Chapter II complete — early archive reaches 1,000 wallets.",
      trigger: "totalBuyers crosses 1,000.",
      verification: { label: "Sale transactions", href: SALE_TX_HREF },
      why: "Seals Chapter II (First Thousand) — the first public formation milestone.",
      status: buyerStatus(1_000),
      meta: buyerMeta,
      reachedAt: makeReached("members-1000"),
    },
  ];

  return (
    <Section id="milestones">
      <SectionHeader
        eyebrow="Public milestones"
        title={
          <>
            The formation, <span className="text-gradient-gold">in public</span>
          </>
        }
        description="Every milestone discloses its definition, trigger, and verification source. Status flips automatically from on-chain reads — no marketing claims, no projections."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {milestones.map((m, i) => (
          <GlassCard key={m.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")} · Milestone
              </div>
              <StatusPill status={m.status} />
            </div>
            <h3 className="mt-3 text-base font-semibold text-foreground tracking-tight">
              {m.label}
            </h3>

            <dl className="mt-3 space-y-2">
              <div className="grid grid-cols-[72px,1fr] gap-2">
                <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Definition
                </dt>
                <dd className="text-xs text-foreground/85 leading-relaxed">
                  {m.definition}
                </dd>
              </div>
              <div className="grid grid-cols-[72px,1fr] gap-2">
                <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Trigger
                </dt>
                <dd className="text-xs text-foreground/85 leading-relaxed">
                  {m.trigger}
                </dd>
              </div>
              <div className="grid grid-cols-[72px,1fr] gap-2">
                <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Verify
                </dt>
                <dd className="text-xs leading-relaxed">
                  <a
                    href={m.verification.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[11px] underline-offset-4 hover:underline text-[var(--navy-soft)] hover:text-[var(--gold)]"
                  >
                    {m.verification.label} ↗
                  </a>
                </dd>
              </div>
              <div className="grid grid-cols-[72px,1fr] gap-2">
                <dt className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground pt-0.5">
                  Why
                </dt>
                <dd className="text-xs text-muted-foreground leading-relaxed">
                  {m.why}
                </dd>
              </div>
            </dl>

            {m.reachedAt && (
              <div className="mt-3 pt-3 border-t border-border/40">
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Reached
                </div>
                <div className="mt-1 text-xs text-foreground/85">
                  {formatRelative(m.reachedAt.secondsAgo)} ·{" "}
                  <a
                    href={`${EXPLORER_BASE_URL}/tx/${m.reachedAt.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[11px] underline-offset-4 hover:underline text-[var(--navy-soft)] hover:text-[var(--gold)]"
                  >
                    block {m.reachedAt.block.toString()} ↗
                  </a>
                </div>
              </div>
            )}

            {m.meta && (
              <div className="mt-3 pt-3 border-t border-border/40 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {m.meta}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-border/40">
              <Link
                to="/milestone/$id"
                params={{ id: m.id }}
                className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)] hover:underline"
              >
                Share milestone →
              </Link>
            </div>
          </GlassCard>
        ))}
      </div>
    </Section>
  );
}
