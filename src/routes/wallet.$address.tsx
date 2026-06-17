// /wallet/$address — per-wallet identity surface.
//
// Three states (Member ≠ Holder must remain strict):
//   1. Member  — has at least one TokensPurchased event (HolderRecord)
//   2. Holder  — has SYN balance > 0 but no purchase record (market participant)
//   3. Unknown — nothing on-chain related to SYN we can index
//
// All identity numbers (founder #, rank, chapter, cumulative USDC/SYN, routed
// splits, eligibility) flow from useHolderIndex. Live SYN balance for the
// holder fallback is a single multicall. No invented data.

import { createFileRoute, Link } from "@tanstack/react-router";
import { isAddress, formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { useMemo } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import { GlassCard, Section, SectionHeader, StatusPill, ProofButton } from "@/components/syndicate/Primitives";
import { EmptyState } from "@/components/syndicate/EmptyState";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { MemberShareBlock } from "@/components/syndicate/MemberShareCard";
import { WalletContextNotice } from "@/components/syndicate/WalletContextNotice";
import { useHolderIndex, type HolderRecord, type HolderChapter } from "@/lib/holder-index";
import { useLivePurchaseEvents } from "@/lib/activity-hooks";
import { ERC20_ABI } from "@/lib/sale-abi";
import {
  CONTRACTS,
  SYN_DECIMALS,
  explorerUrlForAddress,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { getChapterByMemberNumber } from "@/lib/chapters";
import { buildReferralShareUrl } from "@/lib/referral-attribution";

const CANONICAL_ORIGIN = "https://thesyndicate.money";

export const Route = createFileRoute("/wallet/$address")({
  head: ({ params }) => {
    const addr = params.address;
    const short = `${addr.slice(0, 8)}…${addr.slice(-6)}`;
    const title = `Wallet ${short} — The Syndicate`;
    const desc =
      "Per-wallet member profile: founder number, rank, chapter, purchase routing total, and verifiable on-chain history.";
    const url = `${CANONICAL_ORIGIN}/wallet/${addr}`;
    const img = `${CANONICAL_ORIGIN}/api/public/og/wallet/${addr}`;
    // X / Twitter strips SVG og:image. twitter:image points to a static
    // branded PNG fallback (see docs/OG_RENDERING_STRATEGY.md). Telegram /
    // Discord / iMessage / Slack / Bluesky read og:image and get the
    // dynamic SVG card with founder #, rank, chapter, cumulative USDC.
    const twImg = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const imgAlt = `Member identity card for ${short} on The Syndicate — founder number, rank, chapter, and purchase routing total.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: imgAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: twImg },
        { name: "twitter:image:alt", content: imgAlt },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: WalletPage,
});

const fmtUsd = (n: number, d = 2) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;
const fmtN = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });

const CHAPTER_LABEL: Record<HolderChapter, string> = {
  "genesis-signal":     "Genesis Signal (#1 – #333)",
  "first-thousand":     "First Thousand (#334 – #1,000)",
  "the-expansion":      "The Expansion (#1,001 – #3,333)",
  "first-ten-thousand": "First Ten Thousand (#3,334 – #10,000)",
  "open-era":           "Open Era",
};

function WalletPage() {
  const { address } = Route.useParams();
  const valid = isAddress(address);

  return (
    <PageShell
      eyebrow="Wallet"
      title={valid ? `Wallet ${address.slice(0, 8)}…${address.slice(-6)}` : "Wallet"}
      description="Per-wallet identity surface — derived from on-chain Membership Sale activity."
    >
      <Breadcrumbs />
      {valid ? (
        <Section id="wallet-context">
          <WalletContextNotice urlAddress={address} />
        </Section>
      ) : null}
      {!valid ? (
        <Section id="wallet-invalid">
          <EmptyState
            status="PENDING"
            title="Invalid address"
            description="Use a 0x-prefixed 20-byte hex address. You can find member addresses on the Activity feed or the Ranks leaderboard."
            action={<Link to="/activity" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">View activity →</Link>}
          />
        </Section>
      ) : (
        <WalletBody address={address as `0x${string}`} />
      )}
    </PageShell>
  );
}

function WalletBody({ address }: { address: `0x${string}` }) {
  const idx = useHolderIndex();
  const record = idx.getByWallet(address);
  const explorer = explorerUrlForAddress(address);

  // Live SYN balance — useful for member and holder views alike.
  const synBal = useReadContract({
    address: CONTRACTS.SYN_CONTRACT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
    query: { refetchInterval: 60_000, staleTime: 30_000 },
  });
  const synBalance =
    synBal.data !== undefined ? Number(formatUnits(synBal.data as bigint, SYN_DECIMALS)) : undefined;

  if (record) return <MemberView record={record} synBalance={synBalance} explorer={explorer} />;

  // Loading: hold judgement until the index resolves.
  if (idx.isLoading || synBal.isLoading) {
    return (
      <Section id="wallet-loading">
        <SectionHeader
          eyebrow="Wallet"
          title={<><span className="mono">{fmtAddress(address)}</span></>}
          description="Resolving on-chain identity…"
        />
        <EmptyState
          variant="compact"
          status="PARTIAL"
          title="Scanning Avalanche RPC"
          description="Reading TokensPurchased history and current SYN balance."
        />
      </Section>
    );
  }

  // Holder vs Unknown — non-zero SYN balance means market participant.
  if (synBalance !== undefined && synBalance > 0) {
    return <HolderView address={address} synBalance={synBalance} explorer={explorer} />;
  }
  return <UnknownView address={address} explorer={explorer} />;
}

// ─── MEMBER ──────────────────────────────────────────────────────────────

function MemberView({
  record,
  synBalance,
  explorer,
}: {
  record: HolderRecord;
  synBalance: number | undefined;
  explorer: string | null;
}) {
  const idx = useHolderIndex();

  // Pull this wallet's purchase rows for the tx history.
  const purchases = useLivePurchaseEvents({ limit: 5_000 });
  const rows = useMemo(() => {
    const lower = record.wallet.toLowerCase();
    return (purchases.data ?? [])
      .filter((p) => p.buyer.toLowerCase() === lower)
      .sort((a, b) =>
        a.blockNumber === b.blockNumber
          ? b.logIndex - a.logIndex
          : a.blockNumber > b.blockNumber ? -1 : 1,
      );
  }, [purchases.data, record.wallet]);

  // Neighbours by founder number (#N-1, #N+1) — for context, not ranking.
  const neighbours = useMemo(() => {
    const i = idx.ordered.findIndex((r) => r.wallet.toLowerCase() === record.wallet.toLowerCase());
    return {
      prev: i > 0 ? idx.ordered[i - 1] : undefined,
      next: i >= 0 && i + 1 < idx.ordered.length ? idx.ordered[i + 1] : undefined,
    };
  }, [idx.ordered, record.wallet]);

  const identitySentence = `Member #${record.founderNumber} of The Syndicate · ${CHAPTER_LABEL[record.chapter]} · Rank ${record.currentRank?.name ?? "—"} · ${fmtUsd(record.cumulativeUsdc)} routed on-chain.`;
  const chapterLabel = getChapterByMemberNumber(record.memberNumber).shortLabel;
  // Public sharing prefers the human /member/N URL when a member number exists;
  // the wallet page itself stays the verification surface.
  const memberUrl = `${CANONICAL_ORIGIN}/member/${record.founderNumber}`;
  const shareUrl = buildReferralShareUrl(memberUrl, record.founderNumber);

  return (
    <>
      <Section id="wallet-header">
        <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <StatusPill status="LIVE" />
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Member · indexed from TokensPurchased
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
              Member <span className="text-gradient-gold">#{record.founderNumber}</span>
            </h1>
            <p className="mt-3 text-sm md:text-base text-foreground/85 leading-relaxed">
              {identitySentence}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {CHAPTER_LABEL[record.chapter]} ·{" "}
              {explorer ? (
                <a href={explorer} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">
                  {fmtAddress(record.wallet)} ↗
                </a>
              ) : (
                <span className="mono">{fmtAddress(record.wallet)}</span>
              )}
            </p>
        </GlassCard>
        <div className="mt-4">
          <MemberShareBlock
            variant="visible"
            filename={`syndicate-member-${record.founderNumber}.png`}
            memberNumber={record.founderNumber}
            chapterLabel={chapterLabel}
            rankName={record.currentRank?.name ?? "Member"}
            wallet={record.wallet}
            synReceived={record.cumulativeSyn}
            cardUrl={memberUrl}
            shareUrl={shareUrl}
            shareText={identitySentence}
            hint="Share this member card"
          />
        </div>
      </Section>

      <NeighboursStrip prev={neighbours.prev} current={record} next={neighbours.next} />


      <Section id="wallet-stats">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Founder #" value={`#${record.founderNumber}`} />
          <Stat label="Rank" value={record.currentRank?.name ?? "—"} />
          <Stat label="Purchases" value={fmtN(record.purchaseCount)} />
          <Stat label="Largest ticket" value={fmtUsd(record.largestSinglePurchaseUsdc)} />
          <Stat label="Cumulative USDC" value={fmtUsd(record.cumulativeUsdc)} />
          <Stat label="SYN received" value={fmtN(Math.round(record.cumulativeSyn))} />
          <Stat
            label="Next rank"
            value={record.nextRank ? record.nextRank.name : "Top tier"}
          />
          <Stat
            label="Live SYN balance"
            value={synBalance !== undefined ? fmtN(Math.round(synBalance)) : "—"}
            hint="Current balance (transfers + LP buys included)"
          />
        </div>
      </Section>

      <Section id="wallet-routing">
        <SectionHeader
          eyebrow="Routed on-chain"
          title={<>Where this wallet's <span className="text-gradient-gold">USDC went</span></>}
          description="Per-purchase 70/20/10 split is enforced by the Membership Sale contract. These totals are the sum across all of this wallet's purchases."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Stat label="→ Vault (70%)" value={fmtUsd(record.cumulativeRoutedToVault)} />
          <Stat label="→ Liquidity (20%)" value={fmtUsd(record.cumulativeRoutedToLiquidity)} />
          <Stat label="→ Operations (10%)" value={fmtUsd(record.cumulativeRoutedToOperations)} />
        </div>
      </Section>

      <Section id="wallet-eligibility">
        <SectionHeader
          eyebrow="Eligibility (derived)"
          title={<>What this wallet <span className="text-gradient-gold">unlocks</span></>}
          description="Eligibility flags are pure functions of founder number and cumulative state. They are not stored on-chain yet — the relevant modules ship later."
        />
        <div className="flex flex-wrap gap-2">
          <Flag on={record.eligibility.foundersBadge} label="Founders badge (top 100)" />
          <Flag on={record.eligibility.chapterBadge} label="Chapter badge" />
          <Flag on={record.eligibility.governance} label="Future member vote status" />
        </div>
      </Section>

      <Section id="wallet-history">
        <SectionHeader
          eyebrow="On-chain history"
          title={<>Verifiable <span className="text-gradient-gold">purchase trail</span></>}
          description="Every row is a TokensPurchased event on the Membership Sale contract. Click any tx to verify on Avascan."
        />
        <GlassCard className="p-0 overflow-hidden">
          {purchases.isLoading && rows.length === 0 ? (
            <EmptyState variant="compact" status="PARTIAL" title="Scanning Avalanche RPC" />
          ) : rows.length === 0 ? (
            <EmptyState variant="compact" status="PENDING" title="No indexed purchases yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] mono uppercase tracking-[0.18em] text-muted-foreground border-b border-border/40">
                    <th className="py-3 px-4">Block</th>
                    <th className="py-3 px-4 text-right">USDC</th>
                    <th className="py-3 px-4 text-right">SYN</th>
                    <th className="py-3 px-4">Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={`${r.txHash}-${r.logIndex}`} className="border-b border-border/20 last:border-0">
                      <td className="py-3 px-4 mono text-xs text-muted-foreground">{r.blockNumber.toString()}</td>
                      <td className="py-3 px-4 mono text-xs text-right">{fmtUsd(r.usdcAmount)}</td>
                      <td className="py-3 px-4 mono text-xs text-right">{fmtN(Math.round(r.synAmount))}</td>
                      <td className="py-3 px-4">
                        <a
                          href={txExplorerUrl(r.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mono text-[10px] uppercase tracking-[0.18em] hover:text-[var(--gold)]"
                        >
                          {r.txHash.slice(0, 8)}…{r.txHash.slice(-6)} ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>
      </Section>
    </>
  );
}

// ─── HOLDER (market participant) ─────────────────────────────────────────

function HolderView({
  address,
  synBalance,
  explorer,
}: {
  address: `0x${string}`;
  synBalance: number;
  explorer: string | null;
}) {
  return (
    <>
      <Section id="wallet-holder-header">
        <div className="flex items-center gap-2 mb-3">
          <StatusPill status="PARTIAL" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Holder · market participant
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
          <span className="mono text-gradient-gold">{fmtAddress(address)}</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This wallet holds or has interacted with SYN, but no Membership Sale
          purchase is indexed for it. It is a holder / market participant — not
          a member of The Syndicate.
        </p>
      </Section>

      <Section id="wallet-holder-stats">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Live SYN balance" value={fmtN(Math.round(synBalance))} />
          <Stat label="Member status" value="Not a member" hint="No TokensPurchased event indexed" />
        </div>
      </Section>

      <Section id="wallet-holder-explain">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-2">Member vs Holder</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">member</strong> is a wallet that
            has bought SYN through the Membership Sale contract — that purchase
            mints a founder number and an immutable archive entry, and it routes
            USDC 70/20/10 to Vault, Liquidity, and Operations.
          </p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            A <strong className="text-foreground">holder</strong> can acquire SYN
            via transfer or a swap on the public LP. That is fine, but it does
            not produce a founder number, a rank, or a chapter — and it does not
            route USDC to the Vault.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-[var(--gold)]/60 text-[var(--gold)] hover:bg-[var(--gold)]/10"
            >
              Join The Syndicate →
            </Link>
            {explorer ? (
              <ProofButton href={explorer}>Avascan ↗</ProofButton>
            ) : null}
          </div>
        </GlassCard>
      </Section>
    </>
  );
}

// ─── UNKNOWN ─────────────────────────────────────────────────────────────

function UnknownView({ address, explorer }: { address: `0x${string}`; explorer: string | null }) {
  return (
    <Section id="wallet-unknown">
      <SectionHeader
        eyebrow="Wallet"
        title={<><span className="mono text-gradient-gold">{fmtAddress(address)}</span></>}
        description="No SYN balance and no Membership Sale activity is indexed for this wallet."
      />
      <EmptyState
        status="PENDING"
        title="No membership record indexed"
        description="If this wallet has just bought through the Membership Sale, the record will appear here within seconds of the next RPC scan."
        action={
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/join" className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--gold)]">Join →</Link>
            <Link to="/registry" className="mono text-[11px] uppercase tracking-[0.18em]">Verify contract →</Link>
            <Link to="/activity" className="mono text-[11px] uppercase tracking-[0.18em]">View activity →</Link>
            {explorer ? (
              <ProofButton href={explorer}>Avascan ↗</ProofButton>
            ) : null}
          </div>
        }
      />
    </Section>
  );
}

// ─── Bits ────────────────────────────────────────────────────────────────

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <GlassCard className="p-4">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div> : null}
    </GlassCard>
  );
}

function Flag({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 mono text-[10px] uppercase tracking-[0.16em] ${
        on
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          : "border-border/60 bg-background/40 text-muted-foreground"
      }`}
    >
      <span>{on ? "●" : "○"}</span> {label}
    </span>
  );
}

function NeighboursStrip({
  prev,
  current,
  next,
}: {
  prev?: HolderRecord;
  current: HolderRecord;
  next?: HolderRecord;
}) {
  if (!prev && !next) return null;
  return (
    <Section id="wallet-neighbours">
      <SectionHeader
        eyebrow="Chapter context"
        title={<>Adjacent <span className="text-gradient-gold">founder numbers</span></>}
        description="Where this member sits in the archive — for context, not competition. Founder numbers are assigned by first-purchase order and never change."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <NeighbourCell label="← Previous" record={prev} />
        <CurrentCell record={current} />
        <NeighbourCell label="Next →" record={next} align="right" />
      </div>
    </Section>
  );
}

function NeighbourCell({
  label,
  record,
  align = "left",
}: {
  label: string;
  record?: HolderRecord;
  align?: "left" | "right";
}) {
  if (!record) {
    return (
      <GlassCard className={`p-4 ${align === "right" ? "text-right" : ""}`}>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-2 text-xs text-muted-foreground">No adjacent member yet</div>
      </GlassCard>
    );
  }
  return (
    <Link
      to="/wallet/$address"
      params={{ address: record.wallet }}
      className="block"
    >
      <GlassCard className={`p-4 hover:border-[var(--gold)]/40 transition-colors ${align === "right" ? "text-right" : ""}`}>
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
        <div className="mt-1 text-lg font-semibold">Member #{record.founderNumber}</div>
        <div className="mono text-[11px] text-muted-foreground mt-1">{fmtAddress(record.wallet)}</div>
      </GlassCard>
    </Link>
  );
}

function CurrentCell({ record }: { record: HolderRecord }) {
  return (
    <GlassCard className="p-4 border-[var(--gold)]/40 text-center">
      <div className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">You are here</div>
      <div className="mt-1 text-lg font-semibold">Member #{record.founderNumber}</div>
      <div className="mono text-[11px] text-muted-foreground mt-1">{fmtAddress(record.wallet)}</div>
    </GlassCard>
  );
}

