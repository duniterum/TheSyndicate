// Canonical protocol milestones.
//
// Single source of truth for "what has the protocol achieved so far" and
// "what is the protocol about to reach". Used by /activity Milestones
// section, NotificationBell category labeling, and any future Member
// Memory surfaces.
//
// Rules:
//   • Thresholds must be canonical (member ordinals, USDC totals,
//     first-of-kind events) — never invented.
//   • Every milestone resolves from already-LIVE protocol pulse inputs.
//   • Status is derived; never persisted.

import type { ProtocolPulse } from "./protocol-pulse";

export type MilestoneKind = "members" | "usdc" | "first-mint";

export type Milestone = {
  id: string;
  label: string;
  kind: MilestoneKind;
  target: number; // for first-mint: 1
  description: string;
};

export const PROTOCOL_MILESTONES: Milestone[] = [
  { id: "first-buyer",       kind: "members",    target: 1,      label: "First member joined",                 description: "The protocol's first seat was sealed on Avalanche." },
  { id: "first-signal-mint", kind: "first-mint", target: 1,      label: "First Signal minted",                 description: "Archive1155 ID 1 — public mint open at 0.50 USDC." },
  { id: "patron-seal-mint",  kind: "first-mint", target: 1,      label: "First Patron Seal minted",            description: "Archive1155 ID 3 — patron mint open at 5.00 USDC." },
  { id: "raise-100",         kind: "usdc",       target: 100,    label: "$100 raised",                         description: "First $100 of USDC routed through the Membership Sale." },
  { id: "raise-1k",          kind: "usdc",       target: 1_000,  label: "$1,000 raised",                       description: "First $1K through the sale." },
  { id: "raise-10k",         kind: "usdc",       target: 10_000, label: "$10,000 raised",                      description: "Crossing $10K of cumulative USDC." },
  { id: "members-100",       kind: "members",    target: 100,    label: "100 seats sealed",                    description: "100 unique buyers in the public registry." },
  { id: "members-333",       kind: "members",    target: 333,    label: "Genesis Signal sealed (#1 – #333)",   description: "Closes the Genesis Signal cohort." },
  { id: "members-1000",      kind: "members",    target: 1_000,  label: "First Thousand sealed (#334 – #1,000)", description: "Closes the First Thousand cohort." },
  { id: "members-3333",      kind: "members",    target: 3_333,  label: "The Expansion sealed (#1,001 – #3,333)", description: "Closes The Expansion cohort." },
  { id: "members-10000",     kind: "members",    target: 10_000, label: "First Ten Thousand sealed",           description: "Closes the First Ten Thousand era." },
];

export type MilestoneStatus = {
  milestone: Milestone;
  reached: boolean;
  progress: number; // 0..1
  current: number | undefined;
  remaining: number | undefined;
};

export type MilestoneInputs = {
  buyers: number | undefined;
  usdcRaised: number | undefined;
  firstSignalMinted: boolean;
  patronSealMinted: boolean;
};

export function evaluateMilestones(inputs: MilestoneInputs): MilestoneStatus[] {
  return PROTOCOL_MILESTONES.map((m) => {
    let current: number | undefined;
    let reached = false;
    if (m.kind === "members") {
      current = inputs.buyers;
      reached = current !== undefined && current >= m.target;
    } else if (m.kind === "usdc") {
      current = inputs.usdcRaised;
      reached = current !== undefined && current >= m.target;
    } else if (m.kind === "first-mint") {
      const ok = m.id === "first-signal-mint" ? inputs.firstSignalMinted
        : m.id === "patron-seal-mint" ? inputs.patronSealMinted
        : false;
      current = ok ? 1 : 0;
      reached = ok;
    }
    const progress = m.target > 0 && current !== undefined
      ? Math.max(0, Math.min(1, current / m.target))
      : 0;
    const remaining = current !== undefined && !reached ? Math.max(0, m.target - current) : undefined;
    return { milestone: m, reached, progress, current, remaining };
  });
}

export function inputsFromPulse(
  pulse: Pick<ProtocolPulse, "buyers" | "usdcRaised">,
  mintFlags: { firstSignal: boolean; patronSeal: boolean },
): MilestoneInputs {
  return {
    buyers: pulse.buyers,
    usdcRaised: pulse.usdcRaised,
    firstSignalMinted: mintFlags.firstSignal,
    patronSealMinted: mintFlags.patronSeal,
  };
}

export function splitReached(statuses: MilestoneStatus[]): {
  completed: MilestoneStatus[];
  upcoming: MilestoneStatus[];
} {
  const completed = statuses.filter((s) => s.reached);
  const upcoming = statuses
    .filter((s) => !s.reached)
    .sort((a, b) => (b.progress - a.progress));
  return { completed, upcoming };
}
