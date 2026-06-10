// ─────────────────────────────────────────────────────────────────────────
// /my-syndicate — Member Operating System (narrative arc)
//
// The page is read as ONE story, not a stack of report sections:
//
//   Identity → Place → Ownership → Momentum → Action   (the cockpit)
//   Memory → Proof                                      (the route tail)
//   What's Building                                     (parked, PENDING)
//
// <MemberCockpit/> owns the live control surface (Identity → Action). The
// route continues the arc below it: the Memory chapter (the one history zone),
// the Proof chapter (contracts + claim sources, promoted ABOVE pending), and a
// single collapsed "What's Building" tail for not-yet-shipped surfaces.
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
import { CockpitMemory } from "@/components/syndicate/cockpit/CockpitMemory";
import { CockpitProof } from "@/components/syndicate/cockpit/CockpitProof";
import { CockpitEmbedProvider } from "@/components/syndicate/cockpit/cockpit-shell";
import { MyPurchaseRouting } from "@/components/syndicate/MyPurchaseRouting";
import {
  MyReferralCard,
  MyReputationConceptCard,
} from "@/components/syndicate/MyReferralCard";
import {
  GlassCard,
  Section,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { ConnectCTA } from "@/components/syndicate/ConnectCTA";
import { useHolderIndex } from "@/lib/holder-index";
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
        className="mono text-[11px] uppercase tracking-[0.24em] text-[var(--gold)] m-0 font-normal"
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

function SubEyebrow({
  label,
  status,
  hint,
}: {
  label: string;
  status: "LIVE" | "PARTIAL" | "PENDING";
  hint?: string;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <StatusPill status={status} />
      <h3 className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground m-0 font-normal">
        {label}
      </h3>
      {hint && (
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground/80">
          · {hint}
        </span>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Page — the cockpit, then the Memory and Proof chapters, then the parked tail.
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
      <MemoryZone />
      <ProofZone />
      <BuildingZone />
    </PageShell>
  );
}

// ─── 6 · MEMORY — your on-chain history, in one place ──────────────────
// The arc's memory chapter. ONE history zone with an internal hierarchy:
//   • the spine        — CockpitMemory (Since You Were Away → your history)
//   • a recent pointer — the few latest live events, then hand off
//   • the canon        — block-anchored chronicle + routing receipt
// Never four parallel wallet-history reports — one zone, one read.
function MemoryZone() {
  return (
    <Section id="memory" className="py-4">
      <SectionEyebrow
        label="Memory"
        status="LIVE"
        hint="your on-chain history, in one place"
      />
      <div className="space-y-4">
        {/* The spine renders bare so it reads as part of this one zone. */}
        <CockpitEmbedProvider>
          <CockpitMemory />
        </CockpitEmbedProvider>
        <ActivityStrip />
        <ChronicleBlock />
      </div>
    </Section>
  );
}

// Recent live movement — deliberately compact and subordinate to the spine
// above. Surfaces only the few most recent on-chain events, then hands off to
// the full ledger; it is NOT a second wallet-history report.
function ActivityStrip() {
  const { address, isConnected } = useAccount();
  const { events, isLoading, isError } = useProtocolEvents({ limit: 200 });

  const lower = address?.toLowerCase();
  const mine = lower
    ? events.filter(
        (e) =>
          (e.actor && e.actor.toLowerCase() === lower) ||
          (e.detail && e.detail.toLowerCase().includes(lower)),
      )
    : [];
  const recent = mine.slice(0, 3);

  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : isLoading || isError
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

  const fullLedger = (
    <Link
      to="/activity"
      className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
    >
      Full ledger →
    </Link>
  );

  return (
    <div>
      <SubEyebrow
        label="Recent movement"
        status={status}
        hint="latest live on-chain events · full history above"
      />
      <div className="surface elevated p-3">
        {!isConnected ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              Connect your wallet to see recent on-chain movement.
            </span>
            {fullLedger}
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Scanning recent blocks…</p>
        ) : recent.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-muted-foreground">
              No recent movement for this wallet — your block-anchored history is
              in Since You Were Away above.
            </span>
            {fullLedger}
          </div>
        ) : (
          <>
            <ol className="divide-y divide-border/40">
              {recent.map((e) => {
                const valid = isValidTxHash(e.txHash);
                return (
                  <li
                    key={e.id}
                    className="flex items-center gap-2 py-1.5 px-0.5 min-w-0"
                  >
                    <span className="mono text-[9px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground shrink-0">
                      {KIND_LABEL[e.kind] ?? "Event"}
                    </span>
                    <span className="text-xs text-foreground truncate flex-1 min-w-0">
                      {e.title}
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
            <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between gap-2">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Recent movement · full history in Since You Were Away above
              </span>
              {fullLedger}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Block-anchored chronicle + the contract-enforced routing receipt — the
// immutable canon under the same Memory zone.
function ChronicleBlock() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : idx.isLoading
      ? "PARTIAL"
      : record
        ? "LIVE"
        : "PENDING";

  return (
    <div>
      <SubEyebrow
        label="Chronicle"
        status={status}
        hint="full block-anchored timeline + routing receipt"
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
    </div>
  );
}

// ─── 7 · PROOF — contracts · claim sources · links out ─────────────────
// Promoted above the parked tail: the proof a member needs is never buried
// below not-yet-shipped surfaces.
function ProofZone() {
  return (
    <Section id="proof" className="py-4">
      <SectionEyebrow
        label="Proof & Context"
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

// ─── 8 · WHAT'S BUILDING — parked, PENDING ─────────────────────────────
// Growth (referral · reputation · builder) and Horizon (governance ·
// marketplace · AI · B2B) collapsed into ONE muted, PENDING tail. Nothing
// here is active today; it never competes with the live cockpit above.
const HORIZON_MODULES = [
  { name: "Governance", note: "Member decisions" },
  { name: "Marketplace", note: "Artifact secondary" },
  { name: "AI Tools", note: "Member surfaces" },
  { name: "B2B Routing", note: "Routed integrations" },
  { name: "Builder Record", note: "Recognition layer" },
];

function BuildingZone() {
  return (
    <Section id="parked" className="py-4">
      <SectionEyebrow
        label="What's Building"
        status="PENDING"
        hint="not active today · sealed-envelope surfaces until contracts ship"
      />
      <details className="group surface elevated">
        <summary className="cursor-pointer list-none p-3 flex items-center justify-between gap-3">
          <span className="mono text-[11px] uppercase tracking-[0.2em] text-foreground">
            Growth &amp; horizon surfaces · PENDING until contracts ship
          </span>
          <span className="mono text-[10px] text-muted-foreground group-open:hidden">
            expand ↓
          </span>
          <span className="mono text-[10px] text-muted-foreground hidden group-open:inline">
            collapse ↑
          </span>
        </summary>
        <div className="px-3 pb-3 pt-2 space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <MyReferralCard />
            <MyReputationConceptCard />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {HORIZON_MODULES.map((m) => (
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
        </div>
      </details>
    </Section>
  );
}
