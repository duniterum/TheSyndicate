// RankHub — contribution-depth and capital-footprint reference surface.
//
// Composition (one focused page, no leaderboard, no wealth ranking):
//   1. What is contribution depth (intro)
//   2. Where do I fit (wallet-aware: current band + next band)
//   3. Band definitions (canonical thresholds from RANKS_V2)
//   4. Aggregate distribution (totals.rankDistribution)
//   5. Members per band (collapsible, paginated to first 24)
//   6. Latest depth changes — rendered ONLY when real movements exist
//   7. Verification block + cross-links (Members/Founders/Chapters)
//
// All data derives from useHolderIndex + RANKS_V2. No new sources.

import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { useHolderIndex, type HolderRecord } from "@/lib/holder-index";
import {
  RANKS_V2,
  rankForUsdc,
  explorerUrlForAddress,
  CONTRACTS,
  txExplorerUrl,
} from "@/lib/syndicate-config";
import { fmtAddress } from "@/lib/sale-hooks";
import { GlassCard, Section, SectionHeader, StatusPill, Pill } from "./Primitives";

const fmt = (n: number, d = 0) =>
  n.toLocaleString("en-US", { maximumFractionDigits: d });
const fmtUsd = (n: number, d = 0) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: d })}`;

const GROUPS = ["Open Entry", "Active Members", "Deep Supporters", "High-Conviction"] as const;
type Group = typeof GROUPS[number];

const GROUP_DESC: Record<Group, string> = {
  "Open Entry": "Where most members start. Any participation counts.",
  "Active Members": "Members with a deeper verified capital footprint.",
  "Deep Supporters": "Higher-conviction capital footprint bands. Rare by design.",
  "High-Conviction": "The smallest capital-footprint bands available online via wallet checkout.",
};

/* ─────────── 1. Intro ─────────── */
function WhatAreRanks() {
  return (
    <Section id="what-is-contribution-depth">
      <SectionHeader
        eyebrow="01 — Contribution depth"
        title={<>Capital is recognized <span className="text-gradient-gold">without becoming identity</span>.</>}
        description="Seat identity is binary. Contribution depth is variable. Capital footprint reflects verified USDC routed through receipts; it is one recognition axis, not a reward, payout, entitlement, or whole member identity."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Capital footprint</div>
          <p className="text-sm">Verified USDC routed is visible and respected as protocol proof.</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Multi-axis recognition</div>
          <p className="text-sm">Builder work, operations, proof, introductions, security, and time can matter too.</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Seat identity</div>
          <p className="text-sm">A 5 USDC member and a 10,000 USDC member both hold one seat. The footprint differs; the seat does not.</p>
        </GlassCard>
      </div>
    </Section>
  );
}

/* ─────────── 2. Where do I fit (wallet aware) ─────────── */
function YourRank({ record, nextMemberNumber, hasData }: {
  record: HolderRecord | undefined;
  nextMemberNumber: number;
  hasData: boolean;
}) {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No wallet connected</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Connect a wallet to see the capital-footprint band your cumulative verified USDC routed reflects. It is recognition only — no payout, no entitlement. The bands below are public — nothing requires connection to read.
        </p>
      </GlassCard>
    );
  }

  if (!record) {
    const { next } = rankForUsdc(0);
    return (
      <GlassCard className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <StatusPill status={hasData ? "LIVE" : "PENDING"} />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Not a member yet</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Your wallet</div>
            <div className="mono text-sm">{fmtAddress(address)}</div>
            <div className="mt-3 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Would join as</div>
            <div className="text-2xl font-semibold">Member #{nextMemberNumber}</div>
          </div>
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">First contribution band</div>
            <div className="text-xl font-semibold text-gradient-gold">{next?.name ?? "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              At {next ? fmtUsd(next.usdc) : "—"} verified USDC routed. Recognition only — no payouts, no entitlements.
            </div>
          </div>
        </div>
      </GlassCard>
    );
  }

  const current = record.currentRank;
  const next = record.nextRank;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Member #{record.founderNumber}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Current band</div>
          <div className="text-2xl font-semibold text-gradient-gold">{current?.name ?? "Citizen"}</div>
          <div className="text-xs text-muted-foreground mt-1">{current?.group ?? "Open Entry"}</div>
        </div>
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Next band</div>
          <div className="text-xl font-semibold">{next?.name ?? "Top band reached"}</div>
          {next && (
            <div className="text-xs text-muted-foreground mt-1">
              Capital footprint only — no payout, no entitlement.
            </div>
          )}
        </div>
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Your wallet</div>
          <Link to="/wallet/$address" params={{ address: record.wallet }} className="mono text-sm hover:text-[var(--gold)]">
            {fmtAddress(record.wallet)} ↗
          </Link>
          <div className="text-xs text-muted-foreground mt-1">{record.chapter} · joined block {record.firstPurchaseBlock.toString()}</div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 border-l-2 border-[var(--navy)]/30 pl-3">
        Capital-footprint bands reflect verified membership purchase receipts. They do not promise dividends, airdrops, revenue share, treasury claims, governance rights, or guaranteed NFTs.
      </p>
    </GlassCard>
  );
}

/* ─────────── 4. Distribution (aggregate only) ─────────── */
function Distribution({ dist, total }: { dist: { name: string; count: number; group: Group; usdc: number }[]; total: number }) {
  const max = Math.max(1, ...dist.map((d) => d.count));
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <StatusPill status={total > 0 ? "LIVE" : "PENDING"} />
        <h3 className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Distribution across {total} member{total === 1 ? "" : "s"}</h3>
      </div>
      <ul className="space-y-2">
        {dist.map((d) => {
          const pct = total > 0 ? (d.count / total) * 100 : 0;
          return (
            <li key={d.name} className="flex items-center gap-3 text-xs">
              <span className="w-36 truncate">{d.name}</span>
              <span className="mono text-[10px] text-muted-foreground w-16">{fmtUsd(d.usdc)}+</span>
              <div className="flex-1 h-2 rounded-full bg-border/50 overflow-hidden">
                <div className="h-full" style={{ width: `${(d.count / max) * 100}%`, background: "var(--gradient-gold)" }} />
              </div>
              <span className="mono text-xs font-semibold w-10 text-right">{d.count}</span>
              <span className="mono text-[10px] text-muted-foreground w-12 text-right">{pct.toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

/* ─────────── 5. Contribution-depth bands (definitions) ─────────── */
function RankLadder() {
  return (
    <div className="surface overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Band</div>
        <div className="col-span-2">Group</div>
        <div className="col-span-2 text-right">USDC</div>
        <div className="col-span-2 text-right">SYN</div>
        <div className="col-span-2">Meaning</div>
      </div>
      <ul>
        {RANKS_V2.map((r, i) => (
          <li
            id={`rank-${r.name.toLowerCase().replace(/\s+/g, "-")}`}
            key={r.name}
            className="grid grid-cols-2 md:grid-cols-12 gap-3 px-5 py-4 items-center text-sm border-b last:border-b-0 border-border/50"
          >
            <div className="md:col-span-1 mono text-[10px] text-muted-foreground">{String(i + 1).padStart(2, "0")}</div>
            <div className="md:col-span-3 flex items-center gap-2"><Pill tone={i >= 9 ? "gold" : "muted"}>{r.name}</Pill></div>
            <div className="md:col-span-2 text-[12px] text-muted-foreground">{r.group}</div>
            <div className="md:col-span-2 md:text-right mono">{fmtUsd(r.usdc)}</div>
            <div className="md:col-span-2 md:text-right mono">{fmt(r.syn)}</div>
            <div className="md:col-span-2 text-[12px]">{r.benefits[0]}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────── 5b. Members per band (collapsible) ─────────── */
const SHOW = 24;
function MembersByRank({ ordered }: { ordered: HolderRecord[] }) {
  const [openRank, setOpenRank] = useState<string | null>(null);

  const byRank = useMemo(() => {
    const m = new Map<string, HolderRecord[]>();
    for (const r of RANKS_V2) m.set(r.name, []);
    for (const rec of ordered) {
      const name = rec.currentRank?.name;
      if (!name) continue;
      m.get(name)?.push(rec);
    }
    return m;
  }, [ordered]);

  return (
    <div className="space-y-2">
      {RANKS_V2.map((r) => {
        const members = byRank.get(r.name) ?? [];
        const isOpen = openRank === r.name;
        return (
          <div key={r.name} className="surface">
            <button
              type="button"
              onClick={() => setOpenRank(isOpen ? null : r.name)}
              disabled={members.length === 0}
              className="w-full flex items-center justify-between px-5 py-3 text-left disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                <Pill tone="muted">{r.name}</Pill>
                <span className="text-xs text-muted-foreground">{r.group}</span>
              </span>
              <span className="mono text-xs">
                {members.length} member{members.length === 1 ? "" : "s"}
                {members.length > 0 && <span className="ml-2 text-muted-foreground">{isOpen ? "▴" : "▾"}</span>}
              </span>
            </button>
            {isOpen && members.length > 0 && (
              <ul className="border-t border-border/50 divide-y divide-border/30">
                {members.slice(0, SHOW).map((m) => (
                  <li key={m.wallet} className="flex items-center justify-between px-5 py-2 text-xs">
                    <span className="mono text-muted-foreground w-16">#{m.founderNumber}</span>
                    <Link to="/wallet/$address" params={{ address: m.wallet }} className="mono hover:text-[var(--gold)] flex-1 truncate">
                      {fmtAddress(m.wallet)}
                    </Link>
                    <span className="mono text-[10px] text-muted-foreground capitalize">{m.chapter.replace("-", " ")}</span>
                  </li>
                ))}
                {members.length > SHOW && (
                  <li className="px-5 py-2 text-[11px] text-muted-foreground">
                    Showing first {SHOW} of {members.length}. Visit <Link to="/members" className="hover:text-[var(--gold)] underline">Members</Link> for the full archive.
                  </li>
                )}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────── 6. Latest depth states (only when real) ─────────── */
function LatestRankChanges({ ordered }: { ordered: HolderRecord[] }) {
  const promotions = useMemo(() => {
    // A meaningful movement needs at least one band above Citizen.
    return ordered
      .filter((r) => r.currentRank && r.currentRank.name !== "Citizen")
      .sort((a, b) => (a.lastPurchaseBlock === b.lastPurchaseBlock ? 0 : a.lastPurchaseBlock > b.lastPurchaseBlock ? -1 : 1))
      .slice(0, 8);
  }, [ordered]);

  if (promotions.length === 0) {
    return (
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <StatusPill status="PENDING" />
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No band movements indexed yet</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Once a member crosses a contribution-depth threshold, the movement appears here — derived live from purchase events.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Latest depth states</span>
      </div>
      <ul className="space-y-2">
        {promotions.map((m) => (
          <li key={m.wallet} className="flex items-center gap-2 text-xs">
            <span className="mono text-[10px] text-muted-foreground w-12">#{m.founderNumber}</span>
            <Link to="/wallet/$address" params={{ address: m.wallet }} className="mono hover:text-[var(--gold)] flex-1 truncate">
              {fmtAddress(m.wallet)}
            </Link>
            <Pill tone="muted">{m.currentRank?.name}</Pill>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}

/* ─────────── 7. Verification ─────────── */
function Verification({ asOfBlock }: { asOfBlock: bigint | undefined }) {
  const saleAddr = CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;
  const saleUrl = explorerUrlForAddress(saleAddr);
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Verify on-chain</span>
      </div>
      <ul className="text-xs space-y-1.5 text-muted-foreground">
        <li>Capital-footprint bands are derived from <span className="mono">TokensPurchased</span> events emitted by the Membership Sale contract.</li>
        <li>Distribution counts above are a pure aggregation of verified routed USDC — no editorial weighting, no bought rights.</li>
        <li>
          {saleUrl ? (
            <>Sale contract: <a href={saleUrl} target="_blank" rel="noopener noreferrer" className="mono hover:text-[var(--gold)]">{fmtAddress(saleAddr)} ↗</a></>
          ) : (
            <span>Sale contract address available on Transparency page.</span>
          )}
        </li>
        {asOfBlock !== undefined && (
          <li>Snapshot as of block <span className="mono">{asOfBlock.toString()}</span>.</li>
        )}
      </ul>
    </GlassCard>
  );
}

/* ─────────── 8. Cross-links ─────────── */
function CrossLinks() {
  const links: { to: "/members" | "/founders" | "/chapters" | "/activity"; label: string; sub: string }[] = [
    { to: "/members", label: "Members", sub: "Who is joining" },
    { to: "/founders", label: "Founders", sub: "Who was here first" },
    { to: "/chapters", label: "Chapters", sub: "Which group am I part of" },
    { to: "/activity", label: "Activity", sub: "What happened recently" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {links.map((l) => (
        <Link key={l.to} to={l.to} className="surface p-4 hover:bg-panel/50 transition-colors block">
          <div className="text-sm font-semibold">{l.label}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{l.sub}</div>
        </Link>
      ))}
    </div>
  );
}

/* ─────────── Page composition ─────────── */
export function RankHub() {
  const idx = useHolderIndex();
  const { address } = useAccount();
  const record = idx.getByWallet(address);

  const dist = useMemo(() => {
    return RANKS_V2.map((r) => ({
      name: r.name,
      count: idx.totals.rankDistribution[r.name] ?? 0,
      group: r.group as Group,
      usdc: r.usdc,
    }));
  }, [idx.totals.rankDistribution]);

  return (
    <>
      <WhatAreRanks />

      <Section id="where-do-i-fit">
        <SectionHeader
          eyebrow="02 — Your footprint"
          title={<>Your current band, and the <span className="text-gradient-gold">next one</span>.</>}
          description="Derived live from your connected wallet. Capital is recognized as proof, never as entitlement."
        />
        <YourRank record={record} nextMemberNumber={idx.totals.nextMemberNumber} hasData={idx.hasData} />
      </Section>

      <Section id="contribution-depth-reference">
        <SectionHeader
          eyebrow="03 — Contribution depth"
          title={<>Twelve bands, in four <span className="text-gradient-gold">groups</span>.</>}
          description="The canonical capital-footprint reference. Same source the wallet pages and member tiles read from."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          {GROUPS.map((g) => (
            <GlassCard key={g} className="p-4">
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{g}</div>
              <p className="text-xs text-muted-foreground">{GROUP_DESC[g]}</p>
            </GlassCard>
          ))}
        </div>
        <RankLadder />
      </Section>

      <Section id="distribution">
        <SectionHeader
          eyebrow="04 — Distribution"
          title={<>How the protocol is <span className="text-gradient-gold">forming</span>.</>}
          description="Aggregate counts across every band. No wealth leaderboard — just the shape of verified contribution depth."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Distribution dist={dist} total={idx.totals.members} />
          <LatestRankChanges ordered={idx.ordered} />
        </div>
      </Section>

      <Section id="members-per-band">
        <SectionHeader
          eyebrow="05 — Members at each band"
          title={<>Expand a band to see <span className="text-gradient-gold">who is there</span>.</>}
          description="Wallet-level visibility, sorted by founder number — never by spend. Full archive lives on Members."
        />
        <MembersByRank ordered={idx.ordered} />
      </Section>

      <Section id="verify">
        <SectionHeader
          eyebrow="06 — Verify"
          title={<>Every count <span className="text-gradient-gold">on-chain</span>.</>}
          description="Capital-footprint bands are not curated. They are a deterministic function of public purchase events."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Verification asOfBlock={idx.asOfBlock} />
          <GlassCard className="p-5">
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Continue exploring</div>
            <CrossLinks />
          </GlassCard>
        </div>
      </Section>
    </>
  );
}
