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
// Language rules: no "raised", no "investor", no
// "investment", no "share", no "dividend", no "yield", no "passive income",
// no "ROI", no "pooled", no "stake", no "earn a commission".
// Use: USDC routed · sale volume · purchase routing · protocol movement ·
// contribution depth · on-chain receipt · eligibility · recognition · where you fit.
// ─────────────────────────────────────────────────────────────────────────

import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAccount } from "wagmi";
import { PageShell } from "@/components/syndicate/PageShell";
import { MemberCockpit } from "@/components/syndicate/cockpit/MemberCockpit";
import { CockpitMemory } from "@/components/syndicate/cockpit/CockpitMemory";
import { CockpitProof } from "@/components/syndicate/cockpit/CockpitProof";
import { CockpitEmbedProvider } from "@/components/syndicate/cockpit/cockpit-shell";
import { MyPurchaseRouting } from "@/components/syndicate/MyPurchaseRouting";
import { MyEconomy } from "@/components/syndicate/MyEconomy";
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
import { useProtocolEvents } from "@/lib/protocol-events";
import { interpretProtocolEvent } from "@/lib/protocol-event-intelligence";
import { useProtocolPulse, formatAgo } from "@/lib/protocol-pulse";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import { deriveRecognitionCandidates } from "@/lib/recognition-candidates";
import { useChainTime } from "@/lib/chain-time";
import { getActiveChapter, getChapterByMemberNumber } from "@/lib/chapters";
import { isValidTxHash } from "@/components/syndicate/TxProofDrawer";
import { txExplorerUrl } from "@/lib/syndicate-config";
import { ARCHIVE_ARTIFACTS, ARCHIVE_DISCLAIMER } from "@/lib/archive-config";
import { CHRONICLE_ENTRIES } from "@/lib/chronicle-entries";
import { INSTITUTIONAL_EVENT_CLASSES } from "@/lib/institutional-register-registry";
import { getTransparencyTimeline } from "@/lib/protocol-transparency-timeline";
import { ProtocolJourneySpine } from "@/components/syndicate/ProtocolJourneySpine";
import { ShareActions } from "@/components/syndicate/ShareActions";
import { CANONICAL_ORIGIN } from "@/lib/canonical-origin";
import { buildReferralShareUrl } from "@/lib/referral-attribution";
import { FUTURE_EVENT_NAMESPACES } from "@/lib/protocol-event-registry";
import {
  deriveProtocolHorizon,
  type HorizonItem,
  type HorizonStatus,
} from "@/lib/protocol-horizon";

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
      title="Your seat. Your proof. Your memory."
      description=""
      hideHeader
    >
      <MemberCockpit />
      <MemberOSMap />
      <ProtocolJourneySpine
        current="home"
        compact
        id="member-home-journey"
        title="This is the member home because the seat changed state."
        description="A purchase gives the wallet SYN. The receipt proves the routing. My Syndicate turns that state change into identity, memory, chapter context, proof, and truthful anticipation."
      />
      <ReturnBriefing />
      <SeatPassport />
      <MyEconomy />
      <MemoryPath />
      <ChapterMemory />
      <ProtocolCarryObject />
      <ProtocolHorizonWatch />
      <MemoryZone />
      <ProofZone />
      <BuildingZone />
    </PageShell>
  );
}

const MEMBER_OS_MAP = [
  { group: "Home", label: "Overview", href: "#my-seat", status: "LIVE", body: "Seat, wallet, SYN, and one action dock." },
  { group: "Identity", label: "Passport", href: "#seat-passport", status: "DERIVED", body: "Member number, chapter, proof, and legacy context." },
  { group: "Wallet", label: "Position", href: "#my-assets", status: "LIVE", body: "SYN received, purchases, routing, and artifact reads." },
  { group: "History", label: "Activity", href: "#memory", status: "LIVE", body: "What changed and what entered memory." },
  { group: "Memory", label: "Archive", href: "#memory-path", status: "READ-GATED", body: "Protocol memories connected to the seat." },
  { group: "Growth", label: "Referral", href: "#parked", status: "RESERVED", body: "Attribution only until contracts ship." },
  { group: "Future", label: "Horizon", href: "#horizon-watch", status: "WATCHING", body: "Truthful anticipation, no fake rewards." },
  { group: "Proof", label: "Verify", href: "#proof", status: "LIVE", body: "Registry, contracts, receipts, and explorers." },
] as const;

function MemberOSMap() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const record = address ? idx.getByWallet(address) : undefined;
  const chapter = record
    ? getChapterByMemberNumber(record.memberNumber)
    : getChapterByMemberNumber(idx.totals.nextMemberNumber);

  const homeStatus = !isConnected
    ? "Disconnected"
    : idx.isLoading
      ? "Reading wallet"
      : record
        ? `Member #${record.memberNumber.toLocaleString("en-US")}`
        : "Observer wallet";
  const homeBody = !isConnected
    ? "Connect to open wallet-specific seat, receipt, memory, and proof surfaces."
    : idx.isLoading
      ? "The Member OS is resolving this wallet against the Holder Index."
      : record
        ? `Your home begins in ${chapter.shortLabel}; the sections below organize proof, memory, and what to watch.`
        : `This wallet can inspect the protocol. Taking a seat would enter ${chapter.shortLabel}.`;
  const primaryHref = !isConnected ? "#my-seat" : record ? "#seat-passport" : "/join";
  const primaryLabel = !isConnected ? "Connect wallet" : record ? "Open passport" : "Take a seat";
  const proofLabel = record ? "Seat proof anchored" : "No seat proof asserted";
  const proofBody = record
    ? "Receipts, routing, and contract links are grouped below before pending systems."
    : "The page stays useful as an observer shell, but no identity, artifact, or future eligibility is inferred.";

  return (
    <Section id="member-os-map" width="data" className="py-3 md:py-4">
      <GlassCard className="overflow-hidden">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Member OS command layer
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Home is where the seat, proof, memory, and next safe action meet.
            </p>
          </div>
          <Link
            to="/registry"
            className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Verify contracts →
          </Link>
        </div>
        <div className="mb-4 grid grid-cols-1 lg:grid-cols-3 gap-px overflow-hidden rounded-md border border-border/50 bg-border/50">
          <OSCommandCard
            label="Home state"
            status={idx.isLoading ? "PARTIAL" : record ? "LIVE" : "PENDING"}
            title={homeStatus}
            body={homeBody}
            href="#my-seat"
          />
          <OSCommandCard
            label="Next safe action"
            status={record ? "DERIVED" : "PENDING"}
            title={primaryLabel}
            body={
              record
                ? "Start with the passport, then follow memory, proof, and horizon in order."
                : "Join remains the only write path here; pending systems stay read-only."
            }
            href={primaryHref}
          />
          <OSCommandCard
            label="Proof posture"
            status={record ? "LIVE" : "PENDING"}
            title={proofLabel}
            body={proofBody}
            href="#proof"
          />
        </div>
        <div className="mb-3">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Operating sections
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Reserved slots are visible for Privy, referral, SeatRecord721, settings,
            notifications, and account management later.
          </p>
        </div>
        <nav aria-label="Member operating system sections" className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {MEMBER_OS_MAP.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="group rounded-md border border-border/50 bg-background/40 p-3 hover:border-[var(--gold)]/60"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <span className="mono text-[8px] uppercase tracking-[0.16em] text-muted-foreground group-hover:text-[var(--gold)]">
                  {item.status}
                </span>
              </div>
              <div className="mt-1 mono text-[8px] uppercase tracking-[0.16em] text-[var(--gold)]/80">
                {item.group}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </a>
          ))}
        </nav>
      </GlassCard>
    </Section>
  );
}

function OSCommandCard({
  label,
  status,
  title,
  body,
  href,
}: {
  label: string;
  status: "LIVE" | "DERIVED" | "PARTIAL" | "PENDING";
  title: string;
  body: string;
  href: string;
}) {
  const tone =
    status === "LIVE"
      ? "success"
      : status === "DERIVED"
        ? "navy"
        : status === "PARTIAL"
          ? "warning"
          : "muted";
  return (
    <a
      href={href}
      className="group bg-card/45 p-4 hover:bg-[var(--gold)]/5 transition-colors"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <p className="mt-2 text-base font-semibold text-foreground leading-snug">
        {title}
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
        {body}
      </p>
      <span className="mt-3 inline-flex mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] group-hover:text-[var(--gold)]">
        Open section →
      </span>
    </a>
  );
}

function SeatPassport() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const chainTime = useChainTime();
  const archive = useArchiveBalances([1, 3]);
  const { events, isLoading: eventsLoading, isError: eventsError } =
    useProtocolEvents({ limit: 200 });

  const record = address ? idx.getByWallet(address) : undefined;
  const chapter = record
    ? getChapterByMemberNumber(record.memberNumber)
    : getChapterByMemberNumber(idx.totals.nextMemberNumber);
  const joinedUnix = record
    ? chainTime.blockToUnix(record.firstPurchaseBlock)
    : undefined;
  const lower = address?.toLowerCase();
  const walletEvents = lower
    ? events.filter(
        (e) =>
          (e.actor && e.actor.toLowerCase() === lower) ||
          (e.detail && e.detail.toLowerCase().includes(lower)),
      )
    : [];
  const eventsSinceSeat = record
    ? events.filter((e) => e.blockNumber > record.firstPurchaseBlock)
    : [];
  const latestConnectedEvent = walletEvents[0] ?? events[0];
  const connectedIntel = latestConnectedEvent
    ? interpretProtocolEvent(latestConnectedEvent)
    : null;
  const firstTx =
    record && isValidTxHash(record.firstPurchaseTx)
      ? txExplorerUrl(record.firstPurchaseTx)
      : undefined;
  const lastTx =
    record && isValidTxHash(record.lastPurchaseTx)
      ? txExplorerUrl(record.lastPurchaseTx)
      : undefined;
  const firstSignals = Number(archive.balances[1]?.balance ?? 0n);
  const patronSeals = Number(archive.balances[3]?.balance ?? 0n);
  const connectedMemories = firstSignals + patronSeals;
  const candidates = record
    ? deriveRecognitionCandidates({
        memberNumber: record.memberNumber,
        isEarlyChapterMember: record.memberNumber <= 333,
        isMajorRank: false,
        patronSeals,
        firstSignals,
        proofOfFireParticipant: false,
        verifyHref: firstTx,
      })
    : [];
  const membersAfter =
    record && idx.totals.members >= record.memberNumber
      ? idx.totals.members - record.memberNumber
      : 0;
  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : idx.isLoading || eventsLoading || archive.isLoading
      ? "PARTIAL"
      : idx.isError || eventsError || archive.isError
        ? "PARTIAL"
        : record
          ? "LIVE"
          : "PENDING";

  return (
    <Section id="seat-passport" className="py-4">
      <SectionEyebrow
        label="Seat Passport"
        status={status}
        hint="identity · history · memory · recognition · legacy"
      />
      <GlassCard className="overflow-hidden border-[color:var(--gold)]/25">
        <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="relative p-5 md:p-6 border-b xl:border-b-0 xl:border-r border-border/50 bg-card/45">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid-bg opacity-35"
            />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                    Protocol identity
                  </p>
                  <h2 className="font-serif text-4xl md:text-5xl leading-none m-0 text-gradient-gold">
                    {!isConnected
                      ? "Unresolved"
                      : record
                        ? `Member #${record.memberNumber.toLocaleString("en-US")}`
                        : "Observer wallet"}
                  </h2>
                </div>
                <StatusPill status={record ? "LIVE" : status} />
              </div>

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {!isConnected
                  ? "Connect a wallet to resolve whether a seat exists. Until then, no identity, memory, or eligibility is assumed."
                  : record
                    ? `This seat entered during ${chapter.label}. SYN remains the V1 seat; Archive artifacts are memories connected to protocol history.`
                    : `This wallet can read the protocol, but it has not taken a seat. The next indexed seat would enter ${chapter.shortLabel}.`}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <PassportFact
                  label="Seat taken"
                  value={
                    record
                      ? formatPassportDate(joinedUnix) ?? `Block ${record.firstPurchaseBlock.toString()}`
                      : "not seated"
                  }
                  note={record ? `block ${record.firstPurchaseBlock.toString()}` : "no purchase event"}
                />
                <PassportFact
                  label="Chapter entered"
                  value={record ? chapter.shortLabel : chapter.shortLabel}
                  note={chapter.range}
                />
                <PassportFact
                  label="Seat proof"
                  value={firstTx ? "anchored" : record ? "pending" : "none"}
                  note={firstTx ? "first tx available" : "valid tx required"}
                />
                <PassportFact
                  label="Contribution depth"
                  value={record ? fmtInt(record.cumulativeSyn) : "none"}
                  note="SYN acquired, one seat"
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {firstTx && <ProofChip href={firstTx} label="Seat proof" />}
                {lastTx && lastTx !== firstTx && (
                  <ProofChip href={lastTx} label="Latest action proof" />
                )}
                <ProofChip to="/members" label="Members index" />
              </div>
            </div>
          </div>

          <div className="p-5 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <PassportContinuityCard
                axis="History"
                status={record ? "LIVE" : "PENDING"}
                title={
                  record
                    ? `${membersAfter.toLocaleString("en-US")} member${membersAfter === 1 ? "" : "s"} arrived after this seat.`
                    : "History begins when SYN is delivered."
                }
                body={
                  record
                    ? `${eventsSinceSeat.length.toLocaleString("en-US")} indexed protocol event${eventsSinceSeat.length === 1 ? "" : "s"} appear after your first purchase in the current activity window.`
                    : "No historical coordinate is assigned to an observer wallet."
                }
                to="/activity"
              />
              <PassportContinuityCard
                axis="Memory"
                status={connectedMemories > 0 ? "LIVE" : record ? "WATCHING" : "PENDING"}
                title={
                  connectedMemories > 0
                    ? `${connectedMemories.toLocaleString("en-US")} Archive memory read from this wallet.`
                    : "No Archive memory is asserted yet."
                }
                body={
                  connectedMemories > 0
                    ? "Archive1155 balances are read directly. They are memories, not seats."
                    : "Artifact links remain read-gated; no ownership or eligibility is inferred."
                }
                to="/archive"
              />
              <PassportContinuityCard
                axis="Recognition"
                status={record ? "DERIVED" : "PENDING"}
                title={
                  record
                    ? `${record.currentRank?.name ?? "Member"} · ${candidates.length} candidate${candidates.length === 1 ? "" : "s"}`
                    : "Recognition waits for a seat."
                }
                body={
                  record
                    ? "Recognition is structural acknowledgement only. Candidates may later reflect contribution depth or institutional trust capital, but they are not official records until reviewed by their own gates."
                    : "No recognition is attached to an unseated wallet."
                }
                to="/ranks"
              />
              <PassportContinuityCard
                axis="Legacy"
                status="PENDING"
                title="SeatRecord721 is reserved, not live."
                body="Future identity records may extend the passport later. Today, SYN is the seat and the holder index is the live identity source."
                to="/roadmap"
              />
            </div>

            <div className="mt-4 rounded-md border border-border/50 bg-background/35 p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Pill tone={connectedIntel ? "navy" : "muted"}>
                  {connectedIntel ? "forming around seat" : "awaiting movement"}
                </Pill>
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  What to pay attention to
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {connectedIntel
                  ? connectedIntel.meaning
                  : "When Activity indexes the next relevant event, this passport will point toward the memory path it can enter."}
              </p>
              {connectedIntel && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {connectedIntel.consequence} Disposition:{" "}
                  {connectedIntel.chronicleCandidate.label};{" "}
                  {connectedIntel.registerDisposition.label}.
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function PassportFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3 min-w-0">
      <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="mono text-sm font-semibold text-foreground tabular-nums truncate">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1 truncate">
        {note}
      </p>
    </div>
  );
}

function PassportContinuityCard({
  axis,
  status,
  title,
  body,
  to,
}: {
  axis: "History" | "Memory" | "Recognition" | "Legacy";
  status: "LIVE" | "DERIVED" | "PENDING" | "WATCHING";
  title: string;
  body: string;
  to: string;
}) {
  const tone =
    status === "LIVE"
      ? "success"
      : status === "DERIVED" || status === "WATCHING"
        ? "navy"
        : "muted";
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3 min-h-[178px] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {axis}
        </span>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
        {body}
      </p>
      <Link
        to={to}
        className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
      >
        inspect →
      </Link>
    </div>
  );
}

function formatPassportDate(unix: number | undefined): string | undefined {
  if (unix === undefined) return undefined;
  const d = new Date(unix * 1000);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function ChapterMemory() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const { events, isLoading: eventsLoading, isError: eventsError } =
    useProtocolEvents({ limit: 200 });
  const record = address ? idx.getByWallet(address) : undefined;
  const chapter = record
    ? getChapterByMemberNumber(record.memberNumber)
    : getActiveChapter(idx.totals.members);
  const active = getActiveChapter(idx.totals.members);
  const isActive = chapter.id === active.id;
  const sealed = chapter.endN !== null && idx.totals.members >= chapter.endN;
  const chapterMembers = idx.ordered.filter((r) => r.chapter === chapter.id);
  const chapterEventWindow = events.filter((event) => {
    if (event.memberOrdinal !== undefined) {
      return (
        event.memberOrdinal >= chapter.startN &&
        (chapter.endN === null || event.memberOrdinal <= chapter.endN)
      );
    }
    return chapter.id === "genesis-signal" && event.category === "archive";
  });
  const chapterChronicle = CHRONICLE_ENTRIES.filter((entry) =>
    chapter.id === "genesis-signal"
      ? entry.id === "chapter-i-opened" || entry.subject === "archive"
      : entry.category === "milestone",
  );
  const chapterArtifacts = ARCHIVE_ARTIFACTS.filter(
    (artifact) =>
      artifact.category === "chapter" ||
      artifact.category === "milestone" ||
      artifact.category === "protocol-milestone",
  ).slice(0, 4);
  const registerClasses = INSTITUTIONAL_EVENT_CLASSES.filter((entry) =>
    ["chapter", "milestone", "first artifact"].includes(entry.class),
  );
  const transparency = getTransparencyTimeline().filter((entry) =>
    ["Chronicle", "Member Growth", "Chapter Milestone"].includes(entry.stage),
  );
  const remaining =
    isActive && chapter.endN !== null
      ? Math.max(0, chapter.endN - idx.totals.members)
      : null;
  const position =
    record && record.memberNumber >= chapter.startN
      ? record.memberNumber - chapter.startN + 1
      : null;
  const status: "LIVE" | "PARTIAL" | "PENDING" = idx.isLoading || eventsLoading
    ? "PARTIAL"
    : idx.isError || eventsError
      ? "PARTIAL"
      : idx.hasData || chapterChronicle.length > 0
        ? "LIVE"
        : "PENDING";
  const chapterState = sealed ? "SEALED" : isActive ? "FORMING" : "RESERVED";

  return (
    <Section id="chapter-memory" className="py-4">
      <SectionEyebrow
        label="Chapter Memory"
        status={status}
        hint="my seat -> our chapter -> protocol memory"
      />
      <GlassCard className="p-4 md:p-5">
        <div className="grid grid-cols-1 xl:grid-cols-[0.85fr_1.15fr] gap-4">
          <div className="rounded-lg border border-[var(--gold)]/25 bg-card/45 p-4 md:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  Our chapter
                </p>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight m-0">
                  {chapter.label}
                </h2>
              </div>
              <Pill tone={sealed ? "navy" : isActive ? "gold" : "muted"}>
                {chapterState}
              </Pill>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {chapter.blurb} Because your seat sits inside this chapter, its
              proof belongs to a larger historical object.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <PassportFact
                label="Chapter range"
                value={chapter.range}
                note="canonical member numbers"
              />
              <PassportFact
                label="Seats indexed"
                value={chapterMembers.length.toLocaleString("en-US")}
                note={chapter.capacity ? `of ${chapter.capacity.toLocaleString("en-US")}` : "open era"}
              />
              <PassportFact
                label="Your place"
                value={position ? position.toLocaleString("en-US") : "not seated"}
                note={record ? "within this chapter" : "connect or join"}
              />
              <PassportFact
                label="Seal watch"
                value={
                  remaining === null
                    ? sealed
                      ? "sealed"
                      : "reserved"
                    : remaining.toLocaleString("en-US")
                }
                note={remaining === null ? "no live countdown" : "members until seal"}
              />
            </div>

            <div className="mt-4 rounded-md border border-border/50 bg-background/35 p-3">
              <p className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                What this chapter can be remembered for
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {chapter.id === "genesis-signal"
                  ? "The first chapter opened the Membership Sale, brought the first seats into the holder index, and began the Archive lineage."
                  : "This chapter's memory forms when real member thresholds, protocol events, and Archive/Register gates create durable records."}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <ChapterBelongingCard
                label="Already anchored"
                status={chapterChronicle.length > 0 ? "LIVE" : "PENDING"}
                title={`${chapterChronicle.length} Chronicle record${chapterChronicle.length === 1 ? "" : "s"}`}
                body={
                  chapterChronicle.length > 0
                    ? chapterChronicle.map((entry) => entry.title).join(" · ")
                    : "No Chronicle record is attached to this chapter yet."
                }
                to="/chronicle"
              />
              <ChapterBelongingCard
                label="Happening now"
                status={chapterEventWindow.length > 0 ? "LIVE" : status}
                title={`${chapterEventWindow.length.toLocaleString("en-US")} indexed event${chapterEventWindow.length === 1 ? "" : "s"}`}
                body="Activity is the heartbeat. It shows movement first; only some movement becomes permanent memory."
                to="/activity"
              />
              <ChapterBelongingCard
                label="Durable register"
                status="DERIVED"
                title={`${registerClasses.length} relevant class${registerClasses.length === 1 ? "" : "es"}`}
                body={registerClasses.map((entry) => `${entry.class}: ${entry.availability}`).join(" · ")}
                to="/institutional-register"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div className="rounded-md border border-border/50 bg-background/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                    Chapter artifacts
                  </span>
                  <Pill tone="navy">read-gated</Pill>
                </div>
                <ul className="space-y-2">
                  {chapterArtifacts.map((artifact) => (
                    <li
                      key={artifact.id}
                      className="rounded-md border border-border/40 bg-card/30 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill
                          tone={
                            artifact.status === "ACTIVE_MINT_OPEN"
                              ? "success"
                              : artifact.status === "LOCKED"
                                ? "muted"
                                : "navy"
                          }
                        >
                          {artifact.status}
                        </Pill>
                        <span className="text-sm font-medium text-foreground">
                          {artifact.name}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {artifact.unlock}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-border/50 bg-background/35 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                    Transparency path
                  </span>
                  <Pill tone="muted">no inferred milestone</Pill>
                </div>
                <ul className="space-y-2">
                  {transparency.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-md border border-border/40 bg-card/30 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill
                          tone={
                            entry.status === "LIVE"
                              ? "success"
                              : entry.status === "PARTIAL"
                                ? "warning"
                                : entry.status === "RESERVED" ||
                                    entry.status === "REQUIRES_CONTRACT"
                                  ? "muted"
                                  : "navy"
                          }
                        >
                          {entry.status}
                        </Pill>
                        <span className="text-sm font-medium text-foreground">
                          {entry.stage}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {entry.consequence}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-md border border-border/50 bg-card/35 p-3 flex flex-wrap items-center gap-2">
              <Pill tone="gold">historical belonging</Pill>
              <Pill tone="muted">no chat</Pill>
              <Pill tone="muted">no social mechanics</Pill>
              <Pill tone="muted">no automatic artifact claim</Pill>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Belonging here means chapter position, shared memory, and
                verifiable protocol history.
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function ChapterBelongingCard({
  label,
  status,
  title,
  body,
  to,
}: {
  label: string;
  status: "LIVE" | "DERIVED" | "PARTIAL" | "PENDING";
  title: string;
  body: string;
  to: string;
}) {
  const tone =
    status === "LIVE"
      ? "success"
      : status === "DERIVED"
        ? "navy"
        : status === "PARTIAL"
          ? "warning"
          : "muted";
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3 min-h-[184px] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
        {body}
      </p>
      <Link
        to={to}
        className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
      >
        inspect →
      </Link>
    </div>
  );
}

function shortWallet(value: string | undefined) {
  if (!value) return "wallet unresolved";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function ProtocolCarryObject() {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const { events, isLoading: eventsLoading, isError: eventsError } =
    useProtocolEvents({ limit: 200 });

  const record = address ? idx.getByWallet(address) : undefined;
  const chapter = record
    ? getChapterByMemberNumber(record.memberNumber)
    : getActiveChapter(idx.totals.members);
  const memberUrl = record
    ? `${CANONICAL_ORIGIN}/member/${record.memberNumber}`
    : `${CANONICAL_ORIGIN}/my-syndicate`;
  const carryUrl = record
    ? buildReferralShareUrl(memberUrl, record.memberNumber)
    : memberUrl;
  const chapterEvents = events.filter((event) => {
    if (event.memberOrdinal !== undefined) {
      return (
        event.memberOrdinal >= chapter.startN &&
        (chapter.endN === null || event.memberOrdinal <= chapter.endN)
      );
    }
    return chapter.id === "genesis-signal" && event.category === "archive";
  });
  const latestIntel = chapterEvents[0]
    ? interpretProtocolEvent(chapterEvents[0])
    : null;
  const firstTx =
    record && isValidTxHash(record.firstPurchaseTx)
      ? txExplorerUrl(record.firstPurchaseTx)
      : undefined;
  const status: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : idx.isLoading || eventsLoading
      ? "PARTIAL"
      : idx.isError || eventsError
        ? "PARTIAL"
        : record
          ? "LIVE"
          : "PENDING";
  const shareText = record
    ? `I hold Member #${record.memberNumber} of The Syndicate. My seat belongs to ${chapter.shortLabel}; its memory path runs Activity -> Chronicle/Register -> Archive. Verified on-chain.`
    : "";

  return (
    <Section id="carry-object" className="py-4">
      <SectionEyebrow
        label="Carry Object"
        status={status}
        hint="seat proof -> chapter memory -> public proof"
      />
      <GlassCard className="p-4 md:p-5" glow={record ? "gold" : undefined}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.72fr] gap-4 items-start">
          <div
            ref={cardRef}
            className="relative overflow-hidden rounded-xl border border-[var(--gold)]/30 bg-[var(--panel)] p-5 md:p-6 min-h-[360px]"
            style={{ boxShadow: record ? "var(--shadow-glow-gold)" : undefined }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 grid-bg opacity-35"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full opacity-20 blur-3xl"
              style={{ background: "var(--gradient-gold)" }}
            />
            <div className="relative flex h-full flex-col gap-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="mono text-[10px] uppercase tracking-[0.24em] text-[var(--gold)] mb-2">
                    The Syndicate
                  </p>
                  <h2 className="font-serif text-4xl md:text-5xl leading-none m-0 text-gradient-gold">
                    {record ? `Member #${record.memberNumber}` : "Seat pending"}
                  </h2>
                </div>
                <Pill tone={record ? "success" : "muted"}>
                  {record ? "verified seat" : "not portable yet"}
                </Pill>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <CarryFact
                  label="Chapter"
                  value={chapter.shortLabel}
                  note={chapter.range}
                />
                <CarryFact
                  label="SYN seat"
                  value={record ? fmtInt(record.cumulativeSyn) : "none"}
                  note="Membership Sale"
                />
                <CarryFact
                  label="Chapter motion"
                  value={chapterEvents.length.toLocaleString("en-US")}
                  note="indexed events"
                />
                <CarryFact
                  label="Proof anchor"
                  value={firstTx ? "tx linked" : record ? "indexed" : "pending"}
                  note="no placeholder"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                  <p className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Who carries it
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {record
                      ? `${shortWallet(record.wallet)} holds the seated SYN position.`
                      : "Connect a seated wallet before this becomes a member object."}
                  </p>
                </div>
                <div className="rounded-lg border border-border/50 bg-background/40 p-3">
                  <p className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Why it matters
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {latestIntel
                      ? latestIntel.meaning
                      : "The object ties a seat to chapter history, then routes outward to the public proof surface."}
                  </p>
                </div>
              </div>

              <div className="mt-auto rounded-lg border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-3">
                <div className="grid grid-cols-4 gap-1 text-center">
                  {["Seat", "Chapter", "Memory", "Proof"].map((label, index) => (
                    <div key={label} className="min-w-0">
                      <div className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="mono text-[10px] uppercase tracking-[0.16em] text-foreground truncate">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {record ? memberUrl.replace(/^https?:\/\//, "") : "connect to resolve"}
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  do not trust - verify
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border/50 bg-card/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                  Portable proof
                </span>
                <Pill tone={record ? "success" : "muted"}>
                  {record ? "ready" : "requires seat"}
                </Pill>
              </div>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The Carry Object packages the member's seat, chapter, memory
                path, and verification route into one outward-facing artifact.
                It spreads identity and proof, not hype.
              </p>
              {record ? (
                <ShareActions
                  filename={`syndicate-carry-member-${record.memberNumber}.png`}
                  shareText={shareText}
                  shareUrl={carryUrl}
                  nodeRef={cardRef}
                  hint="Carry seat and chapter proof"
                />
              ) : (
                <div className="mt-4 rounded-md border border-border/50 bg-background/35 p-3">
                  <ConnectCTA
                    message="Connect a seated wallet to create a Carry Object."
                    hint="no member object is fabricated"
                  />
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/50 bg-background/35 p-4">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Guardrails
              </p>
              <div className="flex flex-wrap gap-2">
                <Pill tone="gold">identity object</Pill>
                <Pill tone="navy">chapter context</Pill>
                <Pill tone="muted">attribution only</Pill>
                <Pill tone="muted">no payout</Pill>
                <Pill tone="muted">no automatic artifact</Pill>
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                The link may carry a member number for recognition-only
                attribution, but no referral contract, balance, or benefit is
                implied here.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <ChapterBelongingCard
                label="Public proof"
                status={record ? "LIVE" : "PENDING"}
                title={record ? `/member/${record.memberNumber}` : "No public member URL yet"}
                body="The outward link resolves to a verifiable member surface, not a generic landing page."
                to={record ? `/member/${record.memberNumber}` : "/join"}
              />
              <ChapterBelongingCard
                label="Memory route"
                status="DERIVED"
                title="Activity -> Chronicle/Register -> Archive"
                body="The object returns readers to the same memory path already visible inside the Member OS."
                to="/activity"
              />
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function CarryFact({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-card/35 p-3 min-w-0">
      <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="mono text-sm font-semibold text-foreground tabular-nums truncate">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1 truncate">
        {note}
      </p>
    </div>
  );
}

// The return loop: a seated member should know what changed, what proof backs
// it, what is sealing next, and what is safe to do without the page inventing
// balances, private rights, or future contracts.
function ReturnBriefing() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const pulse = useProtocolPulse();
  const archive = useArchiveBalances([1, 3]);
  const { events, isLoading: eventsLoading, isError: eventsError } =
    useProtocolEvents({ limit: 200 });

  const record = address ? idx.getByWallet(address) : undefined;
  const lower = address?.toLowerCase();
  const mine = lower
    ? events.filter(
        (e) =>
          (e.actor && e.actor.toLowerCase() === lower) ||
          (e.detail && e.detail.toLowerCase().includes(lower)),
      )
    : [];
  const latestMine = mine[0];
  const firstSignals = Number(archive.balances[1]?.balance ?? 0n);
  const patronSeals = Number(archive.balances[3]?.balance ?? 0n);
  const candidates = record
    ? deriveRecognitionCandidates({
        memberNumber: record.memberNumber,
        isEarlyChapterMember: record.memberNumber <= 333,
        isMajorRank: false,
        patronSeals,
        firstSignals,
        proofOfFireParticipant: false,
        verifyHref: isValidTxHash(record.firstPurchaseTx)
          ? txExplorerUrl(record.firstPurchaseTx)
          : undefined,
      })
    : [];
  const activeChapter = getActiveChapter(idx.totals.members);
  const nextNumber = idx.totals.nextMemberNumber || pulse.nextMemberNumber;
  const protocolStatus: "LIVE" | "PARTIAL" | "PENDING" = !isConnected
    ? "PENDING"
    : idx.isLoading || eventsLoading || archive.isLoading
      ? "PARTIAL"
      : idx.isError || eventsError || archive.isError
        ? "PARTIAL"
        : record
          ? "LIVE"
          : "PENDING";
  const lastTx =
    record && isValidTxHash(record.lastPurchaseTx)
      ? txExplorerUrl(record.lastPurchaseTx)
      : undefined;
  const firstTx =
    record && isValidTxHash(record.firstPurchaseTx)
      ? txExplorerUrl(record.firstPurchaseTx)
      : undefined;

  return (
    <Section id="return-briefing" className="py-4">
      <SectionEyebrow
        label="Return Briefing"
        status={protocolStatus}
        hint="what changed -> what matters next"
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-3">
        <GlassCard className="p-4 md:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Return state
              </p>
              <h2 className="font-serif text-2xl md:text-3xl leading-tight m-0">
                {!isConnected
                  ? "Connect to resolve your seat."
                  : record
                    ? `Member #${record.memberNumber.toLocaleString("en-US")}`
                    : "This wallet is not seated yet."}
              </h2>
            </div>
            <StatusPill status={record ? "LIVE" : protocolStatus} />
          </div>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
            {!isConnected
              ? "Until a wallet is connected, My Syndicate does not assume a seat, artifact, receipt, or eligibility."
              : record
                ? `SYN is the seat. This wallet holds one seat identity in ${activeChapter.label}; its contribution depth can become proof, context, memory, and future recognition material.`
                : "Connected wallets can observe the protocol, but seating begins only when a Membership Sale purchase delivers SYN."}
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
            <BriefingMetric
              label="Contribution depth"
              value={record ? fmtInt(record.cumulativeSyn) : "not seated"}
              note={record ? "SYN acquired; seat stays singular" : "no purchase indexed"}
            />
            <BriefingMetric
              label="USDC routing"
              value={record ? fmtUsd(record.cumulativeUsdc) : "pending"}
              note={record ? "70 / 20 / 10 receipt path" : "requires purchase proof"}
            />
            <BriefingMetric
              label="Archive reads"
              value={
                isConnected
                  ? archive.isLoading
                    ? "reading"
                    : `${archive.totalKnown.toString()} known`
                  : "connect"
              }
              note="Archive1155 balanceOf only"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            <ReturnSignal
              label="What changed"
              title={
                record
                  ? `Latest purchase routed ${fmtUsd(record.lastPurchaseUsdc)} and delivered ${fmtInt(record.lastPurchaseSyn)} SYN.`
                  : isConnected
                    ? "No member state changed for this wallet yet."
                    : "Wallet state is unresolved."
              }
              body={
                record
                  ? "The receipt effect is visible below in Memory and Proof: SYN received, USDC split, first and latest transaction proofs."
                  : "The page stays observational until a real purchase event exists."
              }
              href={lastTx}
              hrefLabel="verify latest tx"
            />
            <ReturnSignal
              label="Sealing next"
              title={
                nextNumber
                  ? `Member #${nextNumber.toLocaleString("en-US")} is the next seat.`
                  : "Next seat is waiting on the holder index."
              }
              body={`${activeChapter.label} remains the active chapter. Chapter movement is derived from member count, not dates or urgency.`}
              to="/chapters"
              hrefLabel="open chapters"
            />
            <ReturnSignal
              label="What to watch"
              title={
                latestMine
                  ? latestMine.title
                  : pulse.lastBuyTxHash
                    ? `Latest protocol movement: ${formatAgo(pulse.lastBuyAgoSeconds)}.`
                    : "Activity will become the heartbeat when new events appear."
              }
              body={
                latestMine
                  ? "Your wallet appears in the Activity ledger. Chronicle and Register can use this kind of event as future memory material."
                  : "Watch Activity for purchases, mints, liquidity events, Vault movement, burns, and Register candidates."
              }
              to="/activity"
              hrefLabel="open activity"
            />
            <ReturnSignal
              label="Next safe action"
              title={
                record
                  ? "Verify your proof, inspect Archive memory, or make another Membership Sale purchase."
                  : isConnected
                    ? "Join when ready; no member state is assumed before purchase."
                    : "Connect first; no action is personalized before wallet truth resolves."
              }
              body={
                record
                  ? "Every action here is either a route to verification, a read-only memory surface, or the live Membership Sale."
                  : "There are no hidden claims, private balances, or implied entitlements waiting behind this state."
              }
              to={record ? "/archive" : "/join"}
              hrefLabel={record ? "open archive" : "open join"}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {firstTx && <ProofChip href={firstTx} label="First purchase proof" />}
            {lastTx && lastTx !== firstTx && (
              <ProofChip href={lastTx} label="Latest purchase proof" />
            )}
            <ProofChip to="/transparency" label="Routing truth" />
            <ProofChip to="/institutional-register" label="Institutional memory" />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-3">
          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                Recognition watch
              </span>
              <StatusPill status={record ? "DERIVED" : "PENDING"} />
            </div>
            {!record ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Recognition remains quiet until a real seat exists. No badge,
                artifact, or identity record is asserted here.
              </p>
            ) : candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                No recognition candidates are currently derived for this wallet.
                That is a truthful absence, not a missing entitlement.
              </p>
            ) : (
              <ul className="space-y-2">
                {candidates.slice(0, 3).map((candidate) => (
                  <li
                    key={candidate.id}
                    className="rounded-md border border-border/50 bg-background/35 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Pill tone="navy">{candidate.status}</Pill>
                      <span className="text-sm font-medium text-foreground">
                        {candidate.memberRef}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {candidate.basis}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80 leading-relaxed">
                      {candidate.legalNote}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)]">
                Future systems radar
              </span>
              <StatusPill status="PENDING" withDot={false} />
            </div>
            <ul className="space-y-2">
              <RadarItem
                status="RESERVED"
                title="SeatRecord721"
                body="Future identity record. It does not replace SYN as the V1 seat and is not deployed."
              />
              <RadarItem
                status="REQUIRES CONTRACT"
                title="Referral routing"
                body="Growth infrastructure remains reserved until a contract exists. No balances, payout states, or claim buttons."
              />
              <RadarItem
                status="WATCHING"
                title="Archive milestones"
                body="Milestone artifacts remain locked until their on-chain trigger or read-gated state is true."
              />
            </ul>
          </GlassCard>
        </div>
      </div>
    </Section>
  );
}

function horizonTone(status: HorizonStatus): "muted" | "gold" | "navy" | "success" | "warning" {
  switch (status) {
    case "SEALED":
    case "ARCHIVED":
      return "success";
    case "FORMING":
    case "APPROACHING":
      return "gold";
    case "WATCHING":
      return "navy";
    case "READ_GATED":
      return "warning";
    case "RESERVED_MEMORY":
    case "REQUIRES_CONTRACT":
    case "NOT_YET_LIVE":
    default:
      return "muted";
  }
}

function ProtocolHorizonWatch() {
  const { address, isConnected } = useAccount();
  const idx = useHolderIndex();
  const pulse = useProtocolPulse();
  const archive = useArchiveBalances([1, 3]);
  const { events, isLoading: eventsLoading, isError: eventsError } =
    useProtocolEvents({ limit: 200 });

  const record = address ? idx.getByWallet(address) : undefined;
  const memberCount =
    idx.totals.members > 0 ? idx.totals.members : pulse.buyers;
  const firstSignals = Number(archive.balances[1]?.balance ?? 0n);
  const patronSeals = Number(archive.balances[3]?.balance ?? 0n);
  const firstTx =
    record && isValidTxHash(record.firstPurchaseTx)
      ? txExplorerUrl(record.firstPurchaseTx)
      : undefined;
  const candidates = record
    ? deriveRecognitionCandidates({
        memberNumber: record.memberNumber,
        isEarlyChapterMember: record.memberNumber <= 333,
        isMajorRank: false,
        patronSeals,
        firstSignals,
        proofOfFireParticipant: false,
        verifyHref: firstTx,
      })
    : [];
  const archiveEvents = events.filter((event) => event.category === "archive");
  const horizon = deriveProtocolHorizon({
    memberCount,
    usdcRouted: pulse.usdcRaised,
    firstSignalMinted: events.some((event) => event.kind === "nft-mint-first-signal"),
    patronSealMinted: events.some((event) => event.kind === "nft-mint-patron-seal"),
    archiveEventCount: archiveEvents.length,
    chronicleCandidateCount: events.filter((event) => event.chronicleEligible).length,
    recognitionCandidateCount: candidates.length,
    futureNamespaces: FUTURE_EVENT_NAMESPACES,
  });
  const primary = horizon.find((item) => item.status === "APPROACHING") ?? horizon[0];
  const status: "LIVE" | "PARTIAL" | "PENDING" =
    idx.isLoading || pulse.isLoading || eventsLoading || archive.isLoading
      ? "PARTIAL"
      : idx.isError || eventsError || archive.isError
        ? "PARTIAL"
        : horizon.length > 0
          ? "LIVE"
          : "PENDING";

  return (
    <Section id="horizon-watch" className="py-4">
      <SectionEyebrow
        label="Horizon Watch"
        status={status}
        hint="what this history is forming next"
      />
      <GlassCard className="p-4 md:p-5">
        <div className="grid grid-cols-1 xl:grid-cols-[0.78fr_1.22fr] gap-4">
          <div className="rounded-xl border border-[var(--gold)]/25 bg-card/45 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">
                  Watch now
                </p>
                <h2 className="font-serif text-3xl md:text-4xl leading-tight m-0">
                  {primary.title}
                </h2>
              </div>
              <Pill tone={horizonTone(primary.status)}>
                {primary.status.replaceAll("_", " ")}
              </Pill>
            </div>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {primary.body}
            </p>
            {primary.progressLabel && (
              <div className="mt-4 rounded-lg border border-border/50 bg-background/35 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Distance
                  </span>
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                    {primary.progressLabel}
                  </span>
                </div>
                {primary.progressPct !== undefined && (
                  <div className="mt-2 h-1.5 rounded-full bg-border/50 overflow-hidden">
                    <div
                      className="h-full"
                      style={{
                        width: `${Math.max(2, Math.min(100, primary.progressPct))}%`,
                        background: "var(--gradient-gold)",
                      }}
                    />
                  </div>
                )}
              </div>
            )}
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              {primary.evidence}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                to={primary.routeHref}
                className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:border-[var(--gold)]/60"
              >
                inspect signal
              </Link>
              {!isConnected && (
                <Link
                  to="/join"
                  className="inline-flex items-center justify-center rounded-md border border-border/60 px-4 py-2 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/60"
                >
                  take a seat
                </Link>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {horizon.map((item) => (
                <HorizonWatchCard key={item.id} item={item} />
              ))}
            </div>
            <div className="rounded-lg border border-border/50 bg-background/35 p-3 flex flex-wrap items-center gap-2">
              <Pill tone="gold">truthful anticipation</Pill>
              <Pill tone="muted">no fake urgency</Pill>
              <Pill tone="muted">no fake claimability</Pill>
              <Pill tone="muted">no payout promise</Pill>
              <span className="text-xs text-muted-foreground leading-relaxed">
                Return behavior is driven by chapter formation, candidate review,
                artifact memory, and reserved systems becoming verifiable.
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function HorizonWatchCard({ item }: { item: HorizonItem }) {
  return (
    <div className="rounded-lg border border-border/50 bg-background/35 p-3 min-h-[212px] flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {item.track.replace("-", " ")}
        </span>
        <Pill tone={horizonTone(item.status)}>{item.status.replaceAll("_", " ")}</Pill>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {item.title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
        {item.body}
      </p>
      {item.progressLabel && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2 mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>state</span>
            <span className="text-foreground">{item.progressLabel}</span>
          </div>
          {item.progressPct !== undefined && (
            <div className="mt-1.5 h-1 rounded-full bg-border/50 overflow-hidden">
              <div
                className="h-full"
                style={{
                  width: `${Math.max(2, Math.min(100, item.progressPct))}%`,
                  background: "var(--gold)",
                }}
              />
            </div>
          )}
        </div>
      )}
      <Link
        to={item.routeHref}
        className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
      >
        inspect -&gt;
      </Link>
    </div>
  );
}

function MemoryPath() {
  const { address, isConnected } = useAccount();
  const { events, isLoading, isError } = useProtocolEvents({ limit: 200 });
  const lower = address?.toLowerCase();
  const walletEvent = lower
    ? events.find(
        (e) =>
          (e.actor && e.actor.toLowerCase() === lower) ||
          (e.detail && e.detail.toLowerCase().includes(lower)),
      )
    : undefined;
  const selected = walletEvent ?? events[0];
  const intelligence = selected ? interpretProtocolEvent(selected) : null;
  const validTx = selected && isValidTxHash(selected.txHash);
  const proofHref = validTx ? txExplorerUrl(selected.txHash) : undefined;
  const status: "LIVE" | "PARTIAL" | "PENDING" = selected
    ? selected.status
    : isLoading || isError
      ? "PARTIAL"
      : "PENDING";
  const subject = walletEvent
    ? "Your latest wallet event"
    : selected
      ? "Latest protocol event"
      : "Awaiting indexed movement";
  const archiveBody =
    selected?.category === "archive"
      ? "This event is already part of the Archive memory layer. Ownership still comes only from Archive1155 reads."
      : selected?.category === "membership-sale"
        ? "Membership events can shape chapter and milestone memory. Artifact states still require their own read-gated trigger."
        : "Archive remains watchful. No artifact state is inferred from this event.";

  return (
    <Section id="memory-path" className="py-4">
      <SectionEyebrow
        label="Memory Path"
        status={status}
        hint="activity -> intelligence -> chronicle/register -> archive"
      />
      <GlassCard className="p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              My protocol wake
            </p>
            <h2 className="font-serif text-2xl md:text-3xl leading-tight m-0">
              {subject}
            </h2>
          </div>
          <StatusPill status={status} />
        </div>

        {!selected || !intelligence ? (
          <p className="text-sm text-muted-foreground leading-relaxed">
            No indexed protocol movement is available yet. When Activity records
            the next on-chain event, this path will explain where it can travel
            next.
          </p>
        ) : (
          <>
            <div className="rounded-md border border-border/50 bg-background/35 p-3 mb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
                    {selected.kind}
                  </p>
                  <p className="text-base font-medium text-foreground leading-snug m-0 truncate">
                    {intelligence.whatHappened}
                  </p>
                </div>
                {proofHref ? (
                  <a
                    href={proofHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline shrink-0"
                  >
                    verify tx →
                  </a>
                ) : (
                  <Pill tone="muted">proof pending</Pill>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {selected.detail}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
              <MemoryPathStep
                step="01"
                label="Activity"
                status={selected.status}
                title="The event becomes visible."
                body="Activity is the protocol heartbeat: it shows what happened and links to proof when a valid tx hash exists."
                to="/activity"
              />
              <MemoryPathStep
                step="02"
                label="Intelligence"
                status="DERIVED"
                title={intelligence.meaning}
                body={intelligence.consequence}
                to="/labs/protocol-intelligence"
              />
              <MemoryPathStep
                step="03"
                label="Chronicle / Register"
                status={
                  intelligence.registerDisposition.status === "ACTIVE_RECORD"
                    ? "LIVE"
                    : intelligence.chronicleCandidate.status === "CANDIDATE"
                      ? "WATCHING"
                      : "PENDING"
                }
                title={intelligence.chronicleCandidate.label}
                body={`${intelligence.chronicleCandidate.reason} Register status: ${intelligence.registerDisposition.label}.`}
                to={
                  intelligence.registerDisposition.status === "ACTIVE_RECORD"
                    ? "/institutional-register"
                    : "/chronicle"
                }
              />
              <MemoryPathStep
                step="04"
                label="Archive"
                status={selected.category === "archive" ? "LIVE" : "WATCHING"}
                title="Memory is preserved only when its trigger is real."
                body={archiveBody}
                to="/archive"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3">
              <Pill tone={walletEvent ? "gold" : "navy"}>
                {walletEvent ? "wallet-scoped" : "protocol-scoped"}
              </Pill>
              <Pill tone="muted">no inferred unlocks</Pill>
              <Pill tone="muted">no private identity</Pill>
              <span className="text-xs text-muted-foreground leading-relaxed">
                This path explains movement. It does not turn a candidate into
                an official record, artifact, or identity contract.
              </span>
            </div>
          </>
        )}
      </GlassCard>
    </Section>
  );
}

function MemoryPathStep({
  step,
  label,
  status,
  title,
  body,
  to,
}: {
  step: string;
  label: string;
  status: "LIVE" | "DERIVED" | "PARTIAL" | "PENDING" | "WATCHING";
  title: string;
  body: string;
  to: string;
}) {
  const tone =
    status === "LIVE"
      ? "success"
      : status === "DERIVED" || status === "WATCHING"
        ? "navy"
        : status === "PARTIAL"
          ? "warning"
          : "muted";
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3 flex flex-col min-h-[210px]">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
          {step} · {label}
        </span>
        <Pill tone={tone}>{status}</Pill>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
        {body}
      </p>
      <Link
        to={to}
        className="mt-3 mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
      >
        open →
      </Link>
    </div>
  );
}

function BriefingMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3">
      <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="font-serif text-xl leading-tight text-foreground m-0">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-snug mt-1">
        {note}
      </p>
    </div>
  );
}

function ReturnSignal({
  label,
  title,
  body,
  href,
  to,
  hrefLabel,
}: {
  label: string;
  title: string;
  body: string;
  href?: string;
  to?: string;
  hrefLabel: string;
}) {
  return (
    <div className="rounded-md border border-border/50 bg-background/35 p-3">
      <p className="mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground leading-snug m-0">
        {title}
      </p>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {body}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          {hrefLabel} →
        </a>
      ) : to ? (
        <Link
          to={to}
          className="mt-3 inline-flex mono text-[10px] uppercase tracking-[0.16em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
        >
          {hrefLabel} →
        </Link>
      ) : null}
    </div>
  );
}

function ProofChip({
  label,
  href,
  to,
}: {
  label: string;
  href?: string;
  to?: string;
}) {
  const cls =
    "inline-flex items-center rounded-[3px] border border-border/60 bg-muted/30 px-3 py-1 mono text-[10px] uppercase tracking-[0.16em] text-foreground/80 hover:text-[var(--gold)]";
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label} →
      </a>
    );
  }
  return to ? (
    <Link to={to} className={cls}>
      {label} →
    </Link>
  ) : null;
}

function RadarItem({
  status,
  title,
  body,
}: {
  status: "RESERVED" | "REQUIRES CONTRACT" | "WATCHING";
  title: string;
  body: string;
}) {
  const tone = status === "WATCHING" ? "navy" : "muted";
  return (
    <li className="rounded-md border border-border/50 bg-background/35 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Pill tone={tone}>{status}</Pill>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
        {body}
      </p>
    </li>
  );
}

const fmtInt = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 0 });

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

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
