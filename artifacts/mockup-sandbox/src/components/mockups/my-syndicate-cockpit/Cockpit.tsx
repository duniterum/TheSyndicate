import React, { useState } from 'react';
import './_group.css';

/**
 * Dedicated /my-syndicate "Grade AAA" cockpit LAYOUT mockup.
 * Obsidian aesthetic (cyan-on-obsidian) — the chosen direction.
 * Rails + grid, instrument-grade density. Doctrine-correct copy:
 *  - rank = structural recognition, confers nothing (no leaderboard / next-rank / reward)
 *  - Member is the identity; SYN is the seat token; Seat Record is an artifact
 *  - chapter SEALS at endN, next chapter OPENS at startN (= endN + 1)
 *  - "just purchased" only used for an event < 1h old
 *  - capped supply (Seats) gets a bar; uncapped (SYN) never does
 */
export function Cockpit() {
  const [tab, setTab] = useState<TabKey>('growth');

  return (
    <div className="cockpit-os min-h-screen w-full">
      {/* ===== IDENTITY BAND (sticky) ===== */}
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border-dim))] bg-[hsl(var(--bg-obsidian)/0.82)] backdrop-blur-md">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          <div className="flex items-center gap-3 min-w-0">
            <Identicon seed="0x7A2e9B4F" />
            <div className="leading-tight min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight">Seat #0042</span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--accent-cyan))] border border-[hsl(var(--accent-cyan)/0.4)] px-1.5 py-px rounded-sm">Member</span>
              </div>
              <div className="font-mono text-[11px] text-[hsl(var(--text-muted))] truncate">0x7A2e…9B4F · Cornerstone Cohort</div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Pill tone="green" dot>SEAT ACTIVE</Pill>
            <Pill tone="cyan" dot live>PROTOCOL · LIVE</Pill>
            <Pill tone="muted">AVALANCHE C-CHAIN</Pill>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button className="hidden sm:inline-flex font-mono text-xs uppercase tracking-wide border border-[hsl(var(--border-bright))] px-3.5 py-2 rounded-sm text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))] hover:border-[hsl(var(--accent-cyan)/0.5)] transition-colors">
              View Contract
            </button>
            <button className="font-mono text-xs font-bold uppercase tracking-wide bg-[hsl(var(--accent-cyan))] text-black px-4 py-2 rounded-sm hover:opacity-90 glow-cyan transition-opacity">
              Buy More SYN
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN GRID ===== */}
      <main className="mx-auto max-w-[1400px] px-4 lg:px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-28 lg:pb-8">

        {/* ---------- LEFT: IDENTITY RAIL ---------- */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <Panel accent>
            <SectionLabel>Identity</SectionLabel>
            <div className="mt-3 flex items-start gap-3">
              <Identicon seed="0x7A2e9B4F" big />
              <div className="leading-tight">
                <div className="text-2xl font-bold tracking-tight">Seat #0042</div>
                <div className="font-mono text-xs text-[hsl(var(--text-muted))] mt-0.5">Member · holds SYN</div>
              </div>
            </div>
            <dl className="mt-4 grid grid-cols-1 gap-2 font-mono text-xs">
              <Row k="Rank" v="Vanguard" hint="structural recognition" />
              <Row k="Cohort" v="Cornerstone" />
              <Row k="Joined" v="Chapter I · Blk 149,012" />
              <Row k="Wallet" v="0x7A2e…9B4F" />
            </dl>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <Chip>Cornerstone</Chip>
              <Chip>Early Seat</Chip>
              <Chip cyan>On-Chain Verified</Chip>
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-[hsl(var(--text-dark))]">
              Rank is structural recognition only. It confers no rewards, yield, or standing — it can change as the protocol grows.
            </p>
          </Panel>

          <Panel>
            <SectionLabel>Wake Behind You</SectionLabel>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-[hsl(var(--accent-cyan))]">172</span>
              <span className="text-xs text-[hsl(var(--text-muted))]">seats claimed after yours</span>
            </div>
            <p className="mt-1 text-[11px] text-[hsl(var(--text-dark))]">Members who arrived in your wake — presence, not a ranking.</p>
          </Panel>

          <Panel>
            <SectionLabel>Seats Around You</SectionLabel>
            <p className="mt-1 text-[11px] text-[hsl(var(--text-dark))]">Your immediate neighbours in the registry.</p>
            <ul className="mt-3 font-mono text-xs divide-y divide-[hsl(var(--border-dim))]">
              <NeighbourRow seat="#0041" wallet="0x3c1B…77aE" />
              <NeighbourRow seat="#0042" wallet="0x7A2e…9B4F" you />
              <NeighbourRow seat="#0043" wallet="0x9f04…D210" />
            </ul>
          </Panel>
        </aside>

        {/* ---------- CENTER: PRIMARY SURFACES ---------- */}
        <section className="lg:col-span-6 flex flex-col gap-4">
          {/* Holdings instruments */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Tile label="SYN Held" value="12,500" unit="SYN" tone="cyan" />
            <Tile label="USDC Routed" value="$1,250" unit="contribution" />
            <Tile label="Artifacts Held" value="2" unit="of 4 known" />
          </div>

          {/* Progression */}
          <Panel>
            <div className="flex items-center justify-between">
              <SectionLabel>Progression</SectionLabel>
              <Pill tone="cyan">CHAPTER I</Pill>
            </div>
            <div className="mt-3 flex items-end justify-between font-mono">
              <div>
                <div className="text-[11px] text-[hsl(var(--text-muted))]">ACTIVE SEATS</div>
                <div className="text-2xl font-bold">214<span className="text-sm text-[hsl(var(--text-dark))]"> / 250</span></div>
              </div>
              <div className="text-right text-[11px] text-[hsl(var(--text-muted))] leading-relaxed">
                Chapter I seals at Seat <span className="text-[hsl(var(--text-primary))]">#0250</span><br />
                Chapter II opens at Seat <span className="text-[hsl(var(--accent-cyan))]">#0251</span>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-[hsl(var(--bg-surface))] overflow-hidden">
              <div className="h-full rounded-full bg-[hsl(var(--accent-cyan))] glow-cyan" style={{ width: '85.6%' }} />
            </div>
            <div className="mt-1.5 font-mono text-[10px] text-[hsl(var(--text-dark))]">36 seats remain before this chapter seals.</div>
          </Panel>

          {/* Collector / Archive */}
          <Panel>
            <div className="flex items-center justify-between">
              <SectionLabel>Your Collection</SectionLabel>
              <span className="font-mono text-[10px] text-[hsl(var(--text-dark))]">2 / 4 KNOWN ARTIFACTS</span>
            </div>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Artifact name="Seat Record" status="MINTED" id="#0042" />
              <Artifact name="Patron Seal" status="ELIGIBLE" />
              <Artifact name="First Signal" status="MINTED" id="#0042" />
              <Artifact name="Heart Signal" status="LOCKED" />
            </div>
          </Panel>

          {/* Memory — the single history spine */}
          <Panel>
            <div className="flex items-center justify-between">
              <SectionLabel>Memory</SectionLabel>
              <span className="font-mono text-[10px] text-[hsl(var(--text-dark))]">YOUR HISTORY</span>
            </div>
            <ol className="mt-3 relative border-l border-[hsl(var(--border-bright))] ml-1.5 space-y-4">
              <Memory title="Minted The First Signal" meta="Chapter I · Blk 149,540 · 12h ago" />
              <Memory title="Minted Seat Record #0042" meta="Chapter I · Blk 149,205 · 4d ago" />
              <Memory title="Routed 1,250 USDC" meta="Chapter I · Blk 149,090 · 5d ago" />
              <Memory title="Claimed Seat #0042" meta="Chapter I · Blk 149,012 · 6d ago" first />
            </ol>
          </Panel>

          {/* Activity — demoted compact pointer (NOT a second history report) */}
          <button className="panel rounded-sm px-4 py-3 flex items-center justify-between text-left hover:border-[hsl(var(--accent-cyan)/0.4)] transition-colors">
            <span className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))]">Activity</span>
              <span className="text-xs text-[hsl(var(--text-dark))]">6 recent protocol events involving your seat</span>
            </span>
            <span className="font-mono text-xs text-[hsl(var(--accent-cyan))]">VIEW →</span>
          </button>
        </section>

        {/* ---------- RIGHT: PROTOCOL PULSE RAIL ---------- */}
        <aside className="lg:col-span-3 flex flex-col gap-4">
          <Panel accent>
            <div className="flex items-center justify-between">
              <SectionLabel>Protocol Heartbeat</SectionLabel>
              <Pill tone="cyan" dot live>LIVE</Pill>
            </div>
            <div className="mt-3">
              <div className="text-sm">
                <span className="font-mono text-[hsl(var(--accent-cyan))]">Seat #0214</span> just claimed
              </div>
              <div className="font-mono text-[10px] text-[hsl(var(--text-dark))] mt-1">8m ago · Blk 149,602</div>
            </div>
          </Panel>

          <Panel>
            <SectionLabel>Live Pulse</SectionLabel>
            <ul className="mt-2 font-mono text-[11px] divide-y divide-[hsl(var(--border-dim))]">
              <PulseRow seat="#0214" what="seat claimed" t="8m" />
              <PulseRow seat="#0213" what="minted Patron Seal" t="22m" />
              <PulseRow seat="#0212" what="seat claimed" t="41m" />
              <PulseRow seat="#0211" what="routed 500 USDC" t="1h" />
            </ul>
          </Panel>

          <Panel>
            <SectionLabel>What's Sealing Next</SectionLabel>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold">36</span>
              <span className="text-xs text-[hsl(var(--text-muted))]">seats until Chapter I seals</span>
            </div>
            <div className="mt-2 font-mono text-[11px] text-[hsl(var(--text-muted))]">
              Chapter II opens at Seat <span className="text-[hsl(var(--accent-cyan))]">#0251</span>
            </div>
          </Panel>

          {/* Sticky action dock (desktop) */}
          <div className="hidden lg:block sticky top-24">
            <Panel accent>
              <SectionLabel>Eligible Now</SectionLabel>
              <p className="mt-2 text-sm">Your seat can mint the <span className="text-[hsl(var(--text-primary))] font-medium">Patron Seal</span>.</p>
              <p className="font-mono text-[10px] text-[hsl(var(--text-dark))] mt-1">Mint is open · contract active · not paused</p>
              <button className="mt-3 w-full font-mono text-xs font-bold uppercase tracking-wide bg-[hsl(var(--accent-cyan))] text-black py-2.5 rounded-sm hover:opacity-90 glow-cyan transition-opacity">
                Mint Patron Seal
              </button>
              <button className="mt-2 w-full font-mono text-xs uppercase tracking-wide border border-[hsl(var(--border-bright))] text-[hsl(var(--text-muted))] py-2.5 rounded-sm hover:text-[hsl(var(--text-primary))] transition-colors">
                Buy More SYN
              </button>
            </Panel>
          </div>
        </aside>

        {/* ---------- SECONDARY: TABS (full width) ---------- */}
        <div className="lg:col-span-12 mt-2">
          <div className="flex items-center gap-1 border-b border-[hsl(var(--border-dim))] overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`font-mono text-[11px] uppercase tracking-widest px-4 py-2.5 whitespace-nowrap border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? 'border-[hsl(var(--accent-cyan))] text-[hsl(var(--accent-cyan))]'
                    : 'border-transparent text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-primary))]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="py-4">
            {tab === 'growth' && <GrowthPane />}
            {tab === 'horizon' && <HorizonPane />}
            {tab === 'context' && <ContextPane />}
            {tab === 'chronicle' && <ChroniclePane />}
          </div>
        </div>
      </main>

      {/* ===== MOBILE ACTION DOCK ===== */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[hsl(var(--border-dim))] bg-[hsl(var(--bg-obsidian)/0.92)] backdrop-blur-md px-4 py-3 flex gap-2">
        <button className="flex-1 font-mono text-xs font-bold uppercase tracking-wide bg-[hsl(var(--accent-cyan))] text-black py-3 rounded-sm">
          Mint Patron Seal
        </button>
        <button className="font-mono text-xs uppercase tracking-wide border border-[hsl(var(--border-bright))] text-[hsl(var(--text-muted))] px-4 py-3 rounded-sm">
          Buy SYN
        </button>
      </div>
    </div>
  );
}

/* ============================ panes ============================ */

type TabKey = 'growth' | 'horizon' | 'context' | 'chronicle';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'growth', label: 'My Growth' },
  { key: 'horizon', label: 'My Horizon' },
  { key: 'context', label: 'Protocol Context' },
  { key: 'chronicle', label: 'My Chronicle' },
];

function GrowthPane() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel>
        <SectionLabel>Referral</SectionLabel>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--text-muted))]">Referral surface is not live yet.</p>
          <Pill tone="amber">PENDING</Pill>
        </div>
        <details className="mt-3 group">
          <summary className="font-mono text-[11px] uppercase tracking-wide text-[hsl(var(--text-muted))] cursor-pointer hover:text-[hsl(var(--text-primary))]">What this will show</summary>
          <p className="mt-2 text-xs text-[hsl(var(--text-dark))] leading-relaxed">When live, your verifiable referral lineage and the seats that trace back to your invitation — recorded on-chain, never a points balance.</p>
        </details>
      </Panel>
      <Panel>
        <SectionLabel>Reputation</SectionLabel>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm text-[hsl(var(--text-muted))]">Reputation surface is not live yet.</p>
          <Pill tone="amber">PENDING</Pill>
        </div>
        <details className="mt-3 group">
          <summary className="font-mono text-[11px] uppercase tracking-wide text-[hsl(var(--text-muted))] cursor-pointer hover:text-[hsl(var(--text-primary))]">What this will show</summary>
          <p className="mt-2 text-xs text-[hsl(var(--text-dark))] leading-relaxed">Structural standing derived from on-chain participation — presence and contribution, never a score or leaderboard position.</p>
        </details>
      </Panel>
    </div>
  );
}

function HorizonPane() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <HorizonCard chapter="Chapter II" when="Opens at Seat #0251" body="A new cohort begins. Seat numbering continues from #0251." />
      <HorizonCard chapter="Patron Seal" when="Eligible now" body="Mint while your seat qualifies in the current chapter." active />
      <HorizonCard chapter="Heart Signal" when="Locked" body="Reserved for a future chapter. Conditions not yet met." />
    </div>
  );
}

function ContextPane() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel>
        <div className="flex items-center justify-between">
          <SectionLabel>On-Chain Proof</SectionLabel>
          <Pill tone="green" dot>SYNCHRONIZED</Pill>
        </div>
        <dl className="mt-3 font-mono text-xs divide-y divide-[hsl(var(--border-dim))]">
          <ProofRow k="Network" v="Avalanche C-Chain" />
          <ProofRow k="Contract" v="0x8F9a…2b1C" cyan />
          <ProofRow k="Latest block" v="149,602" />
          <ProofRow k="Last sync" v="8s ago" />
        </dl>
      </Panel>
      <Panel>
        <SectionLabel>Supply</SectionLabel>
        <div className="mt-3 space-y-4">
          <div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-[hsl(var(--text-muted))]">Seats (capped)</span>
              <span>214 / 500</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-[hsl(var(--bg-surface))] overflow-hidden">
              <div className="h-full rounded-full bg-[hsl(var(--accent-cyan))]" style={{ width: '42.8%' }} />
            </div>
          </div>
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-[hsl(var(--text-muted))]">SYN (uncapped)</span>
            <span className="text-[hsl(var(--text-primary))]">no fixed supply</span>
          </div>
        </div>
        <p className="mt-3 text-[10px] text-[hsl(var(--text-dark))] leading-relaxed">Only capped supplies show a fill bar. SYN is uncapped, so no progress bar is implied.</p>
      </Panel>
    </div>
  );
}

function ChroniclePane() {
  return (
    <div className="panel rounded-sm bg-[#faf8f3] text-[#1a1a1a] p-8 md:p-12 max-w-3xl">
      <div className="font-mono text-[10px] uppercase tracking-widest text-[#9a8f7a] border-b border-[#e6e0d4] pb-3 mb-6">Volume I — The Doctrine of State</div>
      <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-5">A protocol is only as strong as its memory.</h2>
      <div className="font-serif text-[15px] leading-relaxed space-y-4 text-[#3a3a3a]">
        <p>Holding SYN is not a passive act. It is a declaration of presence within the registry. The artifacts you mint are the indelible records of your trajectory through the chapters.</p>
        <p className="italic text-center text-[#6a6a6a] pt-2">Truth before marketing. Verifiability before trust.</p>
      </div>
    </div>
  );
}

/* ============================ primitives ============================ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--text-muted))] flex items-center gap-2">
      <span className="inline-block w-3 h-px bg-[hsl(var(--accent-cyan))]" />
      {children}
    </span>
  );
}

function Panel({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div className={`panel rounded-sm p-4 relative overflow-hidden ${accent ? 'border-[hsl(var(--border-bright))]' : ''}`}>
      {accent && <span className="absolute inset-x-0 top-0 h-px scanline opacity-70" />}
      {children}
    </div>
  );
}

function Tile({ label, value, unit, tone }: { label: string; value: string; unit?: string; tone?: 'cyan' }) {
  return (
    <div className="panel rounded-sm p-3.5 flex flex-col gap-2 relative group hover:border-[hsl(var(--accent-cyan)/0.4)] transition-colors">
      <span className="font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--text-muted))]">{label}</span>
      <span className={`font-mono text-2xl font-bold leading-none ${tone === 'cyan' ? 'text-[hsl(var(--accent-cyan))]' : 'text-[hsl(var(--text-primary))]'}`}>{value}</span>
      {unit && <span className="font-mono text-[10px] text-[hsl(var(--text-dark))]">{unit}</span>}
    </div>
  );
}

function Pill({ children, tone = 'muted', dot = false, live = false }: { children: React.ReactNode; tone?: 'cyan' | 'green' | 'amber' | 'muted'; dot?: boolean; live?: boolean }) {
  const map: Record<string, string> = {
    cyan: 'text-[hsl(var(--accent-cyan))] border-[hsl(var(--accent-cyan)/0.4)] bg-[hsl(var(--accent-cyan)/0.07)]',
    green: 'text-[hsl(var(--accent-green))] border-[hsl(var(--accent-green)/0.4)] bg-[hsl(var(--accent-green)/0.07)]',
    amber: 'text-[hsl(var(--accent-amber))] border-[hsl(var(--accent-amber)/0.4)] bg-[hsl(var(--accent-amber)/0.07)]',
    muted: 'text-[hsl(var(--text-muted))] border-[hsl(var(--border-bright))] bg-transparent',
  };
  const dotColor: Record<string, string> = {
    cyan: 'bg-[hsl(var(--accent-cyan))]',
    green: 'bg-[hsl(var(--accent-green))]',
    amber: 'bg-[hsl(var(--accent-amber))]',
    muted: 'bg-[hsl(var(--text-muted))]',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm border ${map[tone]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor[tone]} ${live ? 'animate-pulse' : ''}`} />}
      {children}
    </span>
  );
}

function Chip({ children, cyan = false }: { children: React.ReactNode; cyan?: boolean }) {
  return (
    <span className={`font-mono text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-sm border ${cyan ? 'text-[hsl(var(--accent-cyan))] border-[hsl(var(--accent-cyan)/0.35)]' : 'text-[hsl(var(--text-muted))] border-[hsl(var(--border-bright))]'}`}>
      {children}
    </span>
  );
}

function Row({ k, v, hint }: { k: string; v: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[hsl(var(--text-dark))] uppercase tracking-wide text-[10px]">{k}</dt>
      <dd className="text-right">
        <span className="text-[hsl(var(--text-primary))]">{v}</span>
        {hint && <span className="block text-[9px] text-[hsl(var(--text-dark))] normal-case tracking-normal">{hint}</span>}
      </dd>
    </div>
  );
}

function NeighbourRow({ seat, wallet, you = false }: { seat: string; wallet: string; you?: boolean }) {
  return (
    <li className={`flex items-center justify-between py-2 ${you ? 'text-[hsl(var(--accent-cyan))]' : 'text-[hsl(var(--text-muted))]'}`}>
      <span className="flex items-center gap-2">
        {seat}
        {you && <span className="text-[9px] uppercase tracking-widest border border-[hsl(var(--accent-cyan)/0.4)] px-1 rounded-sm">you</span>}
      </span>
      <span className="text-[hsl(var(--text-dark))]">{wallet}</span>
    </li>
  );
}

function Artifact({ name, status, id }: { name: string; status: 'MINTED' | 'ELIGIBLE' | 'LOCKED'; id?: string }) {
  const minted = status === 'MINTED';
  const eligible = status === 'ELIGIBLE';
  return (
    <div className={`rounded-sm border flex flex-col overflow-hidden ${eligible ? 'border-[hsl(var(--accent-cyan)/0.5)]' : 'border-[hsl(var(--border-dim))]'}`}>
      <div className="aspect-square bg-[hsl(var(--bg-surface))] relative flex items-center justify-center">
        {status === 'LOCKED' ? (
          <span className="font-mono text-[9px] text-[hsl(var(--text-dark))] uppercase tracking-widest">locked</span>
        ) : (
          <div
            className="w-2/3 h-2/3 rounded-sm opacity-80"
            style={{ background: `conic-gradient(from 140deg, hsl(${name.length * 23} 70% 22%), hsl(180 80% 24%), hsl(${name.length * 11} 60% 18%))` }}
          />
        )}
        {eligible && <span className="absolute inset-0 ring-1 ring-inset ring-[hsl(var(--accent-cyan)/0.4)]" />}
      </div>
      <div className="p-2 flex flex-col gap-1 bg-[hsl(var(--bg-panel))]">
        <span className="text-[11px] font-medium leading-tight truncate">{name}</span>
        <span className={`font-mono text-[9px] uppercase tracking-wider ${minted ? 'text-[hsl(var(--accent-green))]' : eligible ? 'text-[hsl(var(--accent-cyan))]' : 'text-[hsl(var(--text-dark))]'}`}>
          {minted && id ? `${status} ${id}` : status}
        </span>
      </div>
    </div>
  );
}

function Memory({ title, meta, first = false }: { title: string; meta: string; first?: boolean }) {
  return (
    <li className="ml-4 relative">
      <span className={`absolute -left-[1.42rem] top-1 w-2.5 h-2.5 rounded-full border-2 ${first ? 'bg-[hsl(var(--accent-cyan))] border-[hsl(var(--accent-cyan))] glow-cyan' : 'bg-[hsl(var(--bg-obsidian))] border-[hsl(var(--border-bright))]'}`} />
      <div className="text-sm leading-tight">{title}</div>
      <div className="font-mono text-[10px] text-[hsl(var(--text-dark))] mt-0.5">{meta}</div>
    </li>
  );
}

function PulseRow({ seat, what, t }: { seat: string; what: string; t: string }) {
  return (
    <li className="flex items-center justify-between py-1.5">
      <span className="text-[hsl(var(--text-muted))]"><span className="text-[hsl(var(--accent-cyan))]">{seat}</span> {what}</span>
      <span className="text-[hsl(var(--text-dark))]">{t}</span>
    </li>
  );
}

function ProofRow({ k, v, cyan = false }: { k: string; v: string; cyan?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-[hsl(var(--text-muted))]">{k}</span>
      <span className={cyan ? 'text-[hsl(var(--accent-cyan))]' : 'text-[hsl(var(--text-primary))]'}>{v}</span>
    </div>
  );
}

function HorizonCard({ chapter, when, body, active = false }: { chapter: string; when: string; body: string; active?: boolean }) {
  return (
    <div className={`panel rounded-sm p-4 ${active ? 'border-[hsl(var(--accent-cyan)/0.5)]' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{chapter}</span>
        <span className={`font-mono text-[10px] uppercase tracking-wide ${active ? 'text-[hsl(var(--accent-cyan))]' : 'text-[hsl(var(--text-dark))]'}`}>{when}</span>
      </div>
      <p className="mt-2 text-xs text-[hsl(var(--text-muted))] leading-relaxed">{body}</p>
    </div>
  );
}

function Identicon({ seed, big = false, size }: { seed: string; big?: boolean; size?: number }) {
  const px = size ?? (big ? 44 : 36);
  const cells = 5;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const squares: React.ReactNode[] = [];
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < 3; x++) {
      const bit = (h >> ((y * 3 + x) % 31)) & 1;
      const on = bit === 1;
      const cellPx = px / cells;
      const place = (cx: number) => (
        <span
          key={`${y}-${cx}`}
          style={{
            position: 'absolute',
            left: cx * cellPx,
            top: y * cellPx,
            width: cellPx,
            height: cellPx,
            background: on ? `hsl(${(hue + 180) % 360} 90% 55%)` : 'transparent',
          }}
        />
      );
      squares.push(place(x));
      if (x < 2) squares.push(place(cells - 1 - x));
    }
  }
  return (
    <span
      className="relative inline-block rounded-sm border border-[hsl(var(--border-bright))] shrink-0 overflow-hidden"
      style={{ width: px, height: px, background: `hsl(${hue} 30% 10%)` }}
    >
      {squares}
    </span>
  );
}
