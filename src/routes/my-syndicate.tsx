// ─────────────────────────────────────────────────────────────────────────
// /my-syndicate — Member Operating System (v2 blueprint)
//
// Doctrine: docs/MY_SYNDICATE_IMPLEMENTATION_BLUEPRINT.md (v2).
// Order is locked. New modules dock into existing slots; no new sections.
//
//   § 1 My Seat            — Identity (hero, dominant)
//   § 2 My Assets          — SYN · Archive1155 · SeatRecord721 PENDING
//   § 3 Activity           — Recent wallet/protocol movement
//   § 4 What's Sealing Next — Real chapter + artifact thresholds
//   § 5 My Chronicle       — Full block-anchored timeline + routing receipt
//   § 6 My Growth          — Referral · Reputation · Builder (collapsed)
//   § 7 My Horizon         — Governance · Marketplace · AI · B2B (PENDING)
//   § 8 Protocol Context   — Links out (never duplicated)
//
// Language rules: no "raised", no "contribution", no "investor", no
// "investment", no "share", no "dividend", no "yield", no "passive income",
// no "ROI", no "pooled", no "stake", no "earn a commission".
// Use: USDC routed · sale volume · purchase routing · protocol movement ·
// on-chain receipt · eligibility · recognition · where you fit.
// ─────────────────────────────────────────────────────────────────────────

import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { PageShell } from "@/components/syndicate/PageShell";
import { MemberCockpit } from "@/components/syndicate/cockpit/MemberCockpit";
import { CockpitProof } from "@/components/syndicate/cockpit/CockpitProof";
import { MyPurchaseRouting } from "@/components/syndicate/MyPurchaseRouting";
import {
  MyReferralCard,
  MyReputationConceptCard,
} from "@/components/syndicate/MyReferralCard";
import {
  GlassCard,
  Pill,
  Section,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { ConnectCTA } from "@/components/syndicate/ConnectCTA";
import { useHolderIndex } from "@/lib/holder-index";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useProtocolEvents } from "@/lib/protocol-events";
import { isValidTxHash } from "@/components/syndicate/TxProofDrawer";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { ARCHIVE_DISCLAIMER } from "@/lib/archive-config";

export const Route = createFileRoute("/my-syndicate")({
  head: () => ({
    meta: [
      { title: "My Syndicate — Member Operating System | The Syndicate" },
      {
        name: "description",
        content:
          "Your seat, your assets, your activity, what's sealing next, and your chronicle — every value is an on-chain read or labeled PENDING.",
      },
      { property: "og:title", content: "My Syndicate — Member Operating System" },
      {
        property: "og:description",
        content:
          "Your seat is the truth. Your assets, activity, and chronicle live here — derived from on-chain reads.",
      },
      { property: "og:url", content: "https://thesyndicate.money/my-syndicate" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "My Syndicate — Member Operating System" },
      {
        name: "twitter:description",
        content: "Seat. Assets. Activity. Sealing next. Chronicle.",
      },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/my-syndicate" }],
  }),
  component: MySyndicatePage,
});

// ─── small local helpers ───────────────────────────────────────────────
function SectionEyebrow({
  label,
  status,
  hint,
}: {
  label: string;
  status: "LIVE" | "PARTIAL" | "PENDING" | "DEMO";
  hint?: string;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <StatusPill status={status} />
      <h2
        className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)] m-0 font-normal"
        data-eyebrow={label}
      >
        {label}
      </h2>
      {hint && (
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          · {hint}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────
function MySyndicatePage() {
  return (
    <PageShell
      eyebrow="My Syndicate"
      title="Your seat. Your assets. Your chronicle."
      description=""
      hideHeader
    >
      <MemberCockpit />
      <ActivitySection />
      <SealingNextSection />
      <ChronicleSection />
      <GrowthSection />
      <HorizonSection />
      <ProtocolContextSection />
    </PageShell>
  );
}

// ─── § 3 Activity ──────────────────────────────────────────────────────
function ActivitySection() {
  const { address, isConnected } = useAccount();
  const { events, isLoading, isError } = useProtocolEvents({ limit: 200 });
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;

  const lower = address?.toLowerCase();
  const mine = lower
    ? events
        .filter(
          (e) =>
            (e.actor && e.actor.toLowerCase() === lower) ||
            (e.detail && e.detail.toLowerCase().includes(lower)),
        )
        .slice(0, 8)
    : [];

  const status: "LIVE" | "PARTIAL" | "PENDING" =
    !isConnected
      ? "PENDING"
      : isLoading
        ? "PARTIAL"
        : isError
          ? "PARTIAL"
          : mine.length > 0
            ? "LIVE"
            : "PENDING";

  const KIND_LABEL: Record<string, string> = {
    purchase: "Purchase",
    "swap-buy": "LP Buy",
    "swap-sell": "LP Sell",
    "lp-add": "LP Add",
    "lp-remove": "LP Remove",
    "vault-in": "Vault In",
    "vault-out": "Vault Out",
    "new-member": "New Member",
    "rank-reached": "Recognition",
    "nft-mint-first-signal": "Mint",
    "nft-mint-patron-seal": "Mint",
    "nft-mint-other": "Mint",
  };

  return (
    <Section id="activity" className="py-4">
      <SectionEyebrow
        label="Activity"
        status={status}
        hint="recent on-chain movement for this wallet"
      />
      <GlassCard className="p-3 md:p-4">
        {!isConnected ? (
          <ConnectCTA message="Connect wallet to see recent on-chain movement." hint="indexed events · last 200 blocks" />
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Scanning recent blocks…</p>
        ) : mine.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No recent movement found for this wallet.{" "}
            {record ? (
              <Link
                to="/activity"
                className="text-foreground underline-offset-4 hover:underline"
              >
                Open the full ledger →
              </Link>
            ) : (
              <Link to="/join" className="text-foreground underline-offset-4 hover:underline">
                See the Membership Sale →
              </Link>
            )}
          </p>
        ) : (
          <ol className="divide-y divide-border/40">
            {mine.map((e) => {
              const valid = isValidTxHash(e.txHash);
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-2 py-2 px-1 min-w-0"
                >
                  <span className="mono text-[10px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground shrink-0">
                    {KIND_LABEL[e.kind] ?? "Event"}
                  </span>
                  <span className="text-xs text-foreground truncate flex-1 min-w-0">
                    {e.title}
                  </span>
                  <span className="mono text-[10px] text-muted-foreground/80 shrink-0 tabular-nums">
                    blk {e.blockNumber.toString()}
                  </span>
                  {valid ? (
                    <a
                      href={txExplorerUrl(e.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[10px] text-muted-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
                    >
                      verify ↗
                    </a>
                  ) : (
                    <span className="mono text-[10px] text-muted-foreground/60 shrink-0">
                      pending
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Source · indexed on-chain events
          </span>
          <Link
            to="/activity"
            className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Full ledger →
          </Link>
        </div>
      </GlassCard>
    </Section>
  );
}

// ─── § 4 What's Sealing Next ───────────────────────────────────────────
type SealingRow = {
  scope: "SOON" | "NEXT" | "FAR";
  label: string;
  remaining: string;
  source: string;
};

function SealingNextSection() {
  const pulse = useProtocolPulse();
  const buyers = pulse.buyers;

  // Real chapter thresholds — canonical (333 / 1,000 / 3,333 / 10,000 / Open Era).
  const CHAPTER_TARGETS: Array<{ id: string; label: string; target: number }> = [
    { id: "ch-333", label: "Chapter I — Genesis Signal sealed (#333)", target: 333 },
    { id: "ch-1000", label: "Chapter II — First Thousand sealed (#1,000)", target: 1_000 },
    { id: "ch-3333", label: "Chapter III — The Expansion sealed (#3,333)", target: 3_333 },
    { id: "ch-10000", label: "Chapter IV — First Ten Thousand sealed (#10,000)", target: 10_000 },
  ];

  const reachedAll = buyers === undefined ? false : false;
  void reachedAll;

  const rows: SealingRow[] = [];
  if (buyers !== undefined) {
    // SOON · NEXT · FAR — nearest unreached chapter is NEXT; the one after is FAR.
    const upcoming = CHAPTER_TARGETS.filter((c) => buyers < c.target);
    // SOON — the artifact tied to the next chapter seal that is closest.
    if (upcoming[0]) {
      rows.push({
        scope: "SOON",
        label: `Genesis Sealed Artifact unlocks at #${upcoming[0].target.toLocaleString("en-US")}`,
        remaining: `${(upcoming[0].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
    }
    if (upcoming[0]) {
      rows.push({
        scope: "NEXT",
        label: upcoming[0].label,
        remaining: `${(upcoming[0].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
    }
    if (upcoming[1]) {
      rows.push({
        scope: "FAR",
        label: upcoming[1].label,
        remaining: `${(upcoming[1].target - buyers).toLocaleString("en-US")} members to go`,
        source: "Membership Sale · indexed",
      });
    }
  }

  const status: "LIVE" | "PARTIAL" | "PENDING" =
    pulse.isLoading ? "PARTIAL" : rows.length ? "LIVE" : "PENDING";

  return (
    <Section id="sealing-next" className="py-4">
      <SectionEyebrow
        label="What's Sealing Next"
        status={status}
        hint="real on-chain thresholds · no countdowns"
      />
      <GlassCard className="p-4">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Awaiting the next on-chain threshold to come into range.
          </p>
        ) : (
          <ul className="divide-y divide-border/40">
            {rows.map((r) => (
              <li
                key={`${r.scope}-${r.label}`}
                className="flex flex-wrap items-center gap-2 py-2.5"
              >
                <Pill tone={r.scope === "SOON" ? "gold" : r.scope === "NEXT" ? "navy" : "muted"}>
                  {r.scope}
                </Pill>
                <span className="text-sm text-foreground flex-1 min-w-0">{r.label}</span>
                <span className="mono text-[11px] text-foreground tabular-nums">
                  {r.remaining}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {r.source}
                </span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 pt-3 border-t border-border/40">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Thresholds are real cohort seals — they fire when the on-chain
            member count crosses the boundary. No timers. No urgency.
          </span>
        </div>
      </GlassCard>
    </Section>
  );
}

// ─── § 5 My Chronicle ──────────────────────────────────────────────────
function ChronicleSection() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const status: "LIVE" | "PARTIAL" | "PENDING" =
    !isConnected ? "PENDING" : idx.isLoading ? "PARTIAL" : record ? "LIVE" : "PENDING";

  return (
    <Section id="my-chronicle" className="py-4">
      <SectionEyebrow
        label="My Chronicle"
        status={status}
        hint="full block-anchored timeline"
      />

      <GlassCard className="p-4 mb-3">
        {!isConnected ? (
          <ConnectCTA message="Connect wallet to load your chronicle." hint="block-anchored timeline" />
        ) : !record ? (
          <p className="text-sm text-muted-foreground">
            No Membership Sale purchases recorded for this wallet yet.{" "}
            <Link to="/join" className="text-foreground underline-offset-4 hover:underline">
              See the Membership Sale →
            </Link>
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-muted-foreground">
                First purchase · block {record.firstPurchaseBlock.toString()}
              </span>
              {isValidTxHash(record.firstPurchaseTx) ? (
                <a
                  href={txExplorerUrl(record.firstPurchaseTx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                >
                  {record.firstPurchaseTx.slice(0, 10)}…
                  {record.firstPurchaseTx.slice(-6)} ↗
                </a>
              ) : (
                <span className="mono text-xs text-muted-foreground">pending</span>
              )}
            </li>
            <li className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-muted-foreground">
                Latest purchase · block {record.lastPurchaseBlock.toString()}
              </span>
              {isValidTxHash(record.lastPurchaseTx) ? (
                <a
                  href={txExplorerUrl(record.lastPurchaseTx)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-xs text-foreground hover:text-[var(--gold)] underline-offset-4 hover:underline"
                >
                  {record.lastPurchaseTx.slice(0, 10)}…
                  {record.lastPurchaseTx.slice(-6)} ↗
                </a>
              ) : (
                <span className="mono text-xs text-muted-foreground">pending</span>
              )}
            </li>
            <li className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-muted-foreground">Purchases recorded</span>
              <span className="mono text-sm font-semibold">{record.purchaseCount}</span>
            </li>
          </ul>
        )}
        <div className="mt-3 pt-3 border-t border-border/40">
          <Link
            to="/chronicle"
            className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Open full chronicle →
          </Link>
        </div>
      </GlassCard>

      {/* Routing receipt — derived from indexed purchases, contract-enforced split. */}
      <MyPurchaseRouting />
    </Section>
  );
}

// ─── § 6 My Growth (collapsed) ─────────────────────────────────────────
function GrowthSection() {
  return (
    <Section id="my-growth" className="py-4">
      <SectionEyebrow
        label="My Growth"
        status="PENDING"
        hint="referral · recognition · builder record · PENDING contracts"
      />
      <details className="group surface elevated">
        <summary className="cursor-pointer list-none p-3 flex items-center justify-between gap-3">
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-foreground">
            Growth surfaces · PENDING until contracts ship
          </span>
          <span className="mono text-[10px] text-muted-foreground group-open:hidden">
            expand ↓
          </span>
          <span className="mono text-[10px] text-muted-foreground hidden group-open:inline">
            collapse ↑
          </span>
        </summary>
        <div className="px-3 pb-3 pt-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
          <MyReferralCard />
          <MyReputationConceptCard />
        </div>
      </details>
    </Section>
  );
}

// ─── § 7 My Horizon ────────────────────────────────────────────────────
function HorizonSection() {
  const modules = [
    { name: "Governance", note: "Member decisions" },
    { name: "Marketplace", note: "Artifact secondary" },
    { name: "AI Tools", note: "Member surfaces" },
    { name: "B2B Routing", note: "Routed integrations" },
    { name: "Builder Record", note: "Recognition layer" },
  ];
  return (
    <Section id="my-horizon" className="py-4">
      <SectionEyebrow
        label="My Horizon"
        status="PENDING"
        hint="sealed-envelope rows · not active today"
      />
      <GlassCard className="p-3">
        <ul className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {modules.map((m) => (
            <li
              key={m.name}
              className="surface elevated p-2.5 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {m.name}
                </span>
                <StatusPill status="PENDING" withDot={false} />
              </div>
              <span className="text-xs text-foreground/80">{m.note}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </Section>
  );
}

// ─── § 8 Protocol Context — proof panel + claim sources + links out ────
function ProtocolContextSection() {
  return (
    <Section id="protocol-context" className="py-4">
      <SectionEyebrow
        label="Protocol Context"
        status="LIVE"
        hint="contracts · claim sources · links out"
      />
      <CockpitProof />
      <GlassCard className="p-3">
        <ul className="flex flex-wrap gap-4 text-sm">
          <li>
            <Link
              to="/chronicle"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Protocol Chronicle →
            </Link>
          </li>
          <li>
            <Link
              to="/activity"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Live Activity →
            </Link>
          </li>
          <li>
            <Link
              to="/transparency"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Transparency →
            </Link>
          </li>
          <li>
            <Link
              to="/protocol-health"
              className="mono text-[11px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
            >
              Protocol Health →
            </Link>
          </li>
        </ul>
      </GlassCard>
      <p className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-4">
        {ARCHIVE_DISCLAIMER}
      </p>
    </Section>
  );
}
