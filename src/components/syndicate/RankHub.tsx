// RankHub — the "Where do I fit?" surface.
//
// Composition (one focused page, no leaderboard, no wealth ranking):
//   1. What are Ranks (intro)
//   2. Where do I fit (wallet-aware: current rank + next rank)
//   3. Rank definitions (canonical ladder from RANKS_V2)
//   4. Aggregate distribution (totals.rankDistribution)
//   5. Members per rank (collapsible, paginated to first 24)
//   6. Latest rank changes — rendered ONLY when real promotions exist
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
  "Active Members": "Members shaping protocol formation week over week.",
  "Deep Supporters": "Higher-conviction members. Rare by design.",
  "High-Conviction": "Manually onboarded. Smallest tier of the protocol.",
};

/* ─────────── 1. Intro ─────────── */
function WhatAreRanks() {
  return (
    <Section id="what-are-ranks">
      <SectionHeader
        eyebrow="01 — What are ranks?"
        title={<>Ranks describe <span className="text-gradient-gold">where you fit</span>, not what you've won.</>}
        description="A rank is a recognition label derived from how much SYN a wallet holds. It is not a reward, not a payout, not an entitlement. Ranks exist so members can locate themselves inside a structured community — nothing more."
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Recognition</div>
          <p className="text-sm">Each rank carries a badge and a short label. Visible on wallet pages and member tiles.</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Participation</div>
          <p className="text-sm">Higher ranks signal deeper participation in protocol formation. They do not unlock revenue or entitlement.</p>
        </GlassCard>
        <GlassCard className="p-5">
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">Identity</div>
          <p className="text-sm">Ranks let a visitor say "I'm Builder" and link to a page that explains what that means.</p>
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
          Connect a wallet to see the rank your contribution reflects. Rank is recognition only — no payout, no entitlement. The ranks below are public — nothing requires connection to read.
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
            <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">First rank you'd unlock</div>
            <div className="text-xl font-semibold text-gradient-gold">{next?.name ?? "—"}</div>
            <div className="text-xs text-muted-foreground mt-1">
              At {next ? fmtUsd(next.usdc) : "—"} USDC. Rank is recognition only — no payouts, no entitlements.
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
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Current rank</div>
          <div className="text-2xl font-semibold text-gradient-gold">{current?.name ?? "Citizen"}</div>
          <div className="text-xs text-muted-foreground mt-1">{current?.group ?? "Open Entry"}</div>
        </div>
        <div>
          <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">Next rank</div>
          <div className="text-xl font-semibold">{next?.name ?? "Top tier reached"}</div>
          {next && (
            <div className="text-xs text-muted-foreground mt-1">
              Recognition only — no payout, no entitlement.
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
        Ranks reflect SYN held. They do not promise dividends, airdrops, revenue share, treasury claims, or guaranteed NFTs.
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

/* ─────────── 5. Rank ladder (definitions) ─────────── */
function RankLadder() {
  return (
    <div className="surface overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-3 border-b border-border/60 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        <div className="col-span-1">#</div>
        <div className="col-span-3">Rank</div>
        <div className="col-span-2">Group</div>
        <div className="col-span-2 text-right">USDC</div>
        <div className="col-span-2 text-right">SYN</div>
        <div className="col-span-2">Recognition</div>
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

/* ─────────── 5b. Members per rank (collapsible) ─────────── */
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

/* ─────────── 6. Latest rank changes (only when real) ─────────── */
function LatestRankChanges({ ordered }: { ordered: HolderRecord[] }) {
  const promotions = useMemo(() => {
    // A meaningful promotion needs at least one rank above Citizen.
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
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">No promotions indexed yet</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Once a member crosses a rank threshold, the promotion appears here — derived live from purchase events.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <StatusPill status="LIVE" />
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Latest rank states</span>
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
        <li>Rank assignment is derived from <span className="mono">TokensPurchased</span> events emitted by the Membership Sale contract.</li>
        <li>Distribution counts above are a pure aggregation — no editorial weighting, no off-chain inputs.</li>
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
          eyebrow="02 — Where do I fit?"
          title={<>Your current rank, and the <span className="text-gradient-gold">next one</span>.</>}
          description="Derived live from your connected wallet. Recognition only — never an entitlement."
        />
        <YourRank record={record} nextMemberNumber={idx.totals.nextMemberNumber} hasData={idx.hasData} />
      </Section>

      <Section id="rank-ladder">
        <SectionHeader
          eyebrow="03 — The ladder"
          title={<>Twelve ranks, in four <span className="text-gradient-gold">groups</span>.</>}
          description="The canonical definition. Same source the wallet pages and member tiles read from."
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
          description="Aggregate counts across every rank. No member names, no spend amounts — just the shape of the community."
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Distribution dist={dist} total={idx.totals.members} />
          <LatestRankChanges ordered={idx.ordered} />
        </div>
      </Section>

      <Section id="members-per-rank">
        <SectionHeader
          eyebrow="05 — Members at each rank"
          title={<>Expand a rank to see <span className="text-gradient-gold">who is there</span>.</>}
          description="Wallet-level visibility, sorted by founder number — never by spend. Full archive lives on Members."
        />
        <MembersByRank ordered={idx.ordered} />
      </Section>

      <Section id="verify">
        <SectionHeader
          eyebrow="06 — Verify"
          title={<>Every count <span className="text-gradient-gold">on-chain</span>.</>}
          description="Ranks are not curated. They are a deterministic function of public purchase events."
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
