// THE SYNDICATE — PRODUCT OS STUDIO · DATA POSTURE TAXONOMY
//
// A single, typed vocabulary that answers, for every surface/value/tool:
//   "What is real right now? What is read-only proof? What is simulated?
//    What needs a Codex adapter? What is future? What is external?"
//
// This is a TAXONOMY + MAPPING layer ONLY. It renders THROUGH the existing
// StatusBadge (src/components/ui/status-badge.tsx) — it never introduces a parallel
// badge system — so posture labels can never drift across Actions, pages, and docs.
//
// Truth posture of the Studio itself: a SIMULATED, frontend-only prototype. The
// "LIVE READ" / "READ-ONLY PRODUCTION PROOF" postures describe the small, safe set
// of real values the Studio may read (through the user's own wallet/provider) or
// link to (canonical explorer / DEX). Everything else is honestly labeled.

import type { Status } from "@/components/ui/status-badge";

export type DataPosture =
  | "LIVE_READ" // real, read-only value read via the user's own EIP-1193 provider
  | "READ_ONLY_PROOF" // canonical production constant / tx — static, read-only reference
  | "ADAPTER_REQUIRED" // real behavior needs a future Codex production adapter
  | "NOT_WIRED" // no live interaction wired in the Studio
  | "PROTOTYPE" // demonstration value only — not a canonical production value
  | "NOT_LIVE" // deployed/known but not active today (e.g. paused policy)
  | "FUTURE" // planned module, not yet built
  | "EXTERNAL" // canonical third-party tool, opens in a new tab
  | "MEMBER_ONLY" // member surface (simulated role gating, not production auth)
  | "FOUNDER_ONLY"; // founder/operator surface (simulated gating, not production auth)

export type PostureGroup =
  | "live-proof"
  | "adapter"
  | "prototype"
  | "future"
  | "external"
  | "access";

export interface PostureMeta {
  posture: DataPosture;
  /** The StatusBadge label rendered for this posture — never a parallel enum. */
  status: Status;
  /** One-line plain-language meaning, used in legends and tooltips. */
  short: string;
  group: PostureGroup;
}

export const POSTURE_META: Record<DataPosture, PostureMeta> = {
  LIVE_READ: {
    posture: "LIVE_READ",
    status: "LIVE READ",
    short: "Read live (read-only) through your own connected wallet. No writes.",
    group: "live-proof",
  },
  READ_ONLY_PROOF: {
    posture: "READ_ONLY_PROOF",
    status: "READ-ONLY PRODUCTION PROOF",
    short: "A canonical production address or transaction, shown static with a read-only explorer link.",
    group: "live-proof",
  },
  ADAPTER_REQUIRED: {
    posture: "ADAPTER_REQUIRED",
    status: "ADAPTER REQUIRED",
    short: "Real behavior needs a future Codex production adapter before it can go live.",
    group: "adapter",
  },
  NOT_WIRED: {
    posture: "NOT_WIRED",
    status: "NOT WIRED",
    short: "No live interaction is wired here in the Studio.",
    group: "adapter",
  },
  PROTOTYPE: {
    posture: "PROTOTYPE",
    status: "PROTOTYPE PLACEHOLDER",
    short: "A demonstration value — not a canonical production figure.",
    group: "prototype",
  },
  NOT_LIVE: {
    posture: "NOT_LIVE",
    status: "NOT LIVE",
    short: "Deployed or known, but not active today.",
    group: "prototype",
  },
  FUTURE: {
    posture: "FUTURE",
    status: "FUTURE",
    short: "A planned module, not yet built.",
    group: "future",
  },
  EXTERNAL: {
    posture: "EXTERNAL",
    status: "EXTERNAL",
    short: "Opens a canonical third-party tool in a new tab. Not part of the Studio.",
    group: "external",
  },
  MEMBER_ONLY: {
    posture: "MEMBER_ONLY",
    status: "MEMBER-ONLY",
    short: "A member surface in the prototype role demo — simulated gating, not production auth.",
    group: "access",
  },
  FOUNDER_ONLY: {
    posture: "FOUNDER_ONLY",
    status: "FOUNDER-ONLY",
    short: "A founder / operator surface — simulated gating, never production authentication.",
    group: "access",
  },
};

export interface PostureGroupDef {
  id: PostureGroup;
  label: string;
  description: string;
}

export const POSTURE_GROUPS: PostureGroupDef[] = [
  { id: "live-proof", label: "Live & Proof", description: "Real, read-only data and canonical production references." },
  { id: "adapter", label: "Adapter Required", description: "Designed, but real behavior needs a Codex production adapter." },
  { id: "prototype", label: "Prototype Layer", description: "Demonstration values — clearly not canonical production data." },
  { id: "future", label: "Future Modules", description: "Planned concepts, intentionally kept visible." },
  { id: "external", label: "External Tools", description: "Canonical third-party venues, opened in a new tab." },
  { id: "access", label: "Access", description: "Role-gated surfaces — simulated, never production authentication." },
];

/** The StatusBadge label for a posture. Use this so labels never drift. */
export function postureStatus(posture: DataPosture): Status {
  return POSTURE_META[posture].status;
}

/** Postures belonging to a group, in declaration order. */
export function posturesInGroup(group: PostureGroup): PostureMeta[] {
  return (Object.values(POSTURE_META) as PostureMeta[]).filter((m) => m.group === group);
}
