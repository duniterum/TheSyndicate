import {
  getActiveChapter,
  getChapterProgress,
  type Chapter,
} from "./chapters";
import {
  evaluateMilestones,
  splitReached,
  isBinaryMilestone,
  type MilestoneStatus,
} from "./activity-milestones";
import type { FutureEventNamespace } from "./protocol-event-registry";

export type HorizonStatus =
  | "WATCHING"
  | "FORMING"
  | "APPROACHING"
  | "SEALED"
  | "ARCHIVED"
  | "RESERVED_MEMORY"
  | "REQUIRES_CONTRACT"
  | "READ_GATED"
  | "NOT_YET_LIVE";

export type HorizonTrack =
  | "chapter"
  | "milestone"
  | "memory"
  | "archive"
  | "recognition"
  | "future-system";

export type HorizonItem = {
  id: string;
  track: HorizonTrack;
  status: HorizonStatus;
  title: string;
  body: string;
  routeHref: string;
  evidence: string;
  progressLabel?: string;
  progressPct?: number;
};

export type ProtocolHorizonInput = {
  memberCount: number | undefined;
  usdcRouted: number | undefined;
  firstSignalMinted: boolean;
  patronSealMinted: boolean;
  archiveEventCount: number;
  chronicleCandidateCount: number;
  recognitionCandidateCount: number;
  futureNamespaces: readonly Pick<FutureEventNamespace, "id" | "label" | "status">[];
};

function fmtInt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function chapterItem(chapter: Chapter, memberCount: number | undefined): HorizonItem {
  const progress = memberCount === undefined ? undefined : getChapterProgress(memberCount);
  const remaining =
    memberCount !== undefined && chapter.endN !== null
      ? Math.max(0, chapter.endN - memberCount)
      : undefined;
  const sealed = remaining === 0 && chapter.endN !== null;

  return {
    id: `chapter-${chapter.id}`,
    track: "chapter",
    status: sealed ? "SEALED" : "FORMING",
    title: sealed ? `${chapter.shortLabel} sealed` : `${chapter.shortLabel} forming`,
    body: sealed
      ? "This chapter has crossed its canonical member boundary. Its historical record can be preserved by Chronicle, Register, and Archive surfaces."
      : "The active chapter is a historical coordinate. Seats added now become part of this chapter's future memory.",
    routeHref: "/chapters",
    evidence: "Derived from Holder Index member count and canonical chapter ranges.",
    progressLabel:
      remaining === undefined
        ? chapter.range
        : sealed
          ? "chapter boundary crossed"
          : `${fmtInt(remaining)} seats until seal`,
    progressPct: progress?.pct,
  };
}

function nextMilestoneItem(upcoming: MilestoneStatus[]): HorizonItem {
  const measurable = upcoming.find(
    (status) => status.current !== undefined && !isBinaryMilestone(status.milestone),
  );
  if (measurable) {
    const pct = Math.round(measurable.progress * 100);
    return {
      id: `milestone-${measurable.milestone.id}`,
      track: "milestone",
      status: "APPROACHING",
      title: measurable.milestone.label,
      body: measurable.milestone.description,
      routeHref: "/activity",
      evidence: "Derived from live protocol pulse inputs and canonical milestone thresholds.",
      progressLabel:
        measurable.remaining !== undefined
          ? `${fmtInt(measurable.remaining)} remaining`
          : `${pct}% formed`,
      progressPct: pct,
    };
  }

  const binary = upcoming.find((status) => isBinaryMilestone(status.milestone));
  if (binary) {
    return {
      id: `milestone-${binary.milestone.id}`,
      track: "milestone",
      status: "WATCHING",
      title: binary.milestone.label,
      body: binary.milestone.description,
      routeHref: "/nft",
      evidence: "One-shot artifact milestone. It becomes sealed only when an indexed mint event exists.",
      progressLabel: "awaiting real event",
    };
  }

  return {
    id: "milestone-none",
    track: "milestone",
    status: "WATCHING",
    title: "Next canonical milestone",
    body: "Awaiting live pulse data before selecting the next milestone to watch.",
    routeHref: "/activity",
    evidence: "No threshold is displayed without member or routing inputs.",
    progressLabel: "data pending",
  };
}

function archivedItem(count: number): HorizonItem {
  return {
    id: "archive-movement",
    track: "archive",
    status: count > 0 ? "ARCHIVED" : "READ_GATED",
    title: count > 0 ? `${fmtInt(count)} archive event${count === 1 ? "" : "s"}` : "Archive movement watch",
    body: count > 0
      ? "Archive activity exists in the event stream. It can be interpreted as protocol memory when the evidence and disposition support it."
      : "Archive events appear only after real Archive1155 movement is indexed. The surface stays observational until then.",
    routeHref: "/nft",
    evidence: "Derived from Archive1155 event categories in the protocol event stream.",
    progressLabel: count > 0 ? "memory active" : "read-gated",
  };
}

function memoryItem(candidateCount: number): HorizonItem {
  return {
    id: "memory-candidates",
    track: "memory",
    status: candidateCount > 0 ? "WATCHING" : "RESERVED_MEMORY",
    title:
      candidateCount > 0
        ? `${fmtInt(candidateCount)} Chronicle candidate${candidateCount === 1 ? "" : "s"}`
        : "Chronicle/Register watch",
    body:
      candidateCount > 0
        ? "Some protocol events are eligible for story review. Eligibility is not publication; it is a watch state before curation."
        : "Activity can become memory, but only after the signal earns review and institutional disposition.",
    routeHref: "/chronicle",
    evidence: "Derived from event intelligence and Chronicle eligibility flags.",
    progressLabel: candidateCount > 0 ? "review watch" : "reserved memory",
  };
}

function recognitionItem(count: number): HorizonItem {
  return {
    id: "recognition-candidates",
    track: "recognition",
    status: count > 0 ? "WATCHING" : "NOT_YET_LIVE",
    title:
      count > 0
        ? `${fmtInt(count)} recognition candidate${count === 1 ? "" : "s"}`
        : "Recognition path",
    body:
      count > 0
        ? "Recognition candidates acknowledge verifiable actions. They are not rights, payouts, status upgrades, or governance."
        : "Recognition remains quiet until wallet facts create a candidate worth reviewing.",
    routeHref: "/my-syndicate",
    evidence: "Derived from recognition-candidates using wallet facts and Archive reads.",
    progressLabel: count > 0 ? "candidate only" : "no candidate yet",
  };
}

function futureSystemItem(namespaces: ProtocolHorizonInput["futureNamespaces"]): HorizonItem {
  const referral = namespaces.find((namespace) => namespace.id === "referral-attribution");
  const seatRecord = namespaces.find((namespace) => namespace.id === "seat-record-721");
  const label = referral?.label ?? seatRecord?.label ?? "Future protocol system";
  return {
    id: "future-systems",
    track: "future-system",
    status: "REQUIRES_CONTRACT",
    title: `${label} reserved`,
    body: "Future systems can become meaningful later, but they are not live until a contract, registry entry, or explicit activation makes them verifiable.",
    routeHref: "/knowledge-map",
    evidence: "Derived from reserved future event namespaces. All remain PENDING.",
    progressLabel: "requires contract",
  };
}

export function deriveProtocolHorizon(input: ProtocolHorizonInput): HorizonItem[] {
  const memberCount = input.memberCount;
  const chapter = getActiveChapter(memberCount ?? 0);
  const statuses = evaluateMilestones({
    buyers: memberCount,
    usdcRaised: input.usdcRouted,
    firstSignalMinted: input.firstSignalMinted,
    patronSealMinted: input.patronSealMinted,
  });
  const { upcoming } = splitReached(statuses);

  return [
    chapterItem(chapter, memberCount),
    nextMilestoneItem(upcoming),
    memoryItem(input.chronicleCandidateCount),
    archivedItem(input.archiveEventCount),
    recognitionItem(input.recognitionCandidateCount),
    futureSystemItem(input.futureNamespaces),
  ];
}
