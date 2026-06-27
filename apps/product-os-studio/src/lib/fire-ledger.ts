// THE SYNDICATE — FIRE LEDGER ("Proof of Fire").
//
// A typed, DERIVED adapter over the protocol graph + mock data. It does NOT invent
// a parallel truth: burn flows through the organism as `fire`-classified
// PROTOCOL_EVENTS (see protocol-graph.ts), and this module projects them into a
// burn-specific shape pages can render.
//
// TRUTH POSTURE (hard rules — do not soften in copy):
// - A burn RETIRES SYN supply. It is NOT minting, NOT yield, NOT a price pump,
//   NOT a promised return.
// - Nothing here executes a burn. There are NO real transaction hashes, NO
//   explorer links, NO invented on-chain proofs. `hash`/`explorerUrl` are
//   deliberately absent.
// - The aggregate burned figure (MOCK_DATA.protocolStats.burnedSyn) is SIMULATED
//   and must always be labeled as such.

import { MOCK_DATA } from "./mock-data";
import { getEventsForClassification, type ProtocolEvent, type DataSource } from "./protocol-graph";

// Who proposed the burn. Burns are protocol-level — never tied to a member persona.
export type BurnSource = "founder" | "community" | "protocol";

// candidate = awaiting founder review; simulated = recorded concept; future = roadmap.
export type BurnStatus = "candidate" | "simulated" | "future";

export interface BurnEvent {
  id: string;
  title: string;
  source: BurnSource;
  status: BurnStatus;
  /** SIMULATED amount of SYN retired. Never a live figure. */
  amountSyn: number;
  date: string;
  chapter: string;
  note: string;
  /** Where this burn surfaces as proof across the organism. */
  proofOutputs: string[];
  chronicleCandidate: boolean;
  archiveCandidate: boolean;
  /** Links back to the PROTOCOL_EVENTS id this projects (organism single-source). */
  eventRef?: string;
}

const SOURCE_LABELS: Record<BurnSource, string> = {
  founder: "Founder burn",
  community: "Community burn",
  protocol: "Protocol burn",
};

export function burnSourceLabel(source: BurnSource): string {
  return SOURCE_LABELS[source];
}

// Burn-specific detail keyed to the graph events. The graph owns the flow/truth;
// this owns the burn projection (amount, source, chapter). Amounts sum to the
// SIMULATED protocol total (5,000 + 2,500 + 2,500 = 10,000) for coherence.
export const FIRE_LEDGER: BurnEvent[] = [
  {
    id: "fire-founder-genesis",
    title: "Founder burn — Genesis chapter",
    source: "founder",
    status: "candidate",
    amountSyn: 5000,
    date: "Pending review",
    chapter: "Genesis Signal",
    note: "A proposed costly signal: retire SYN supply to mark the chapter. Supply is reduced; nothing is minted; price is not a promise. Awaiting founder review.",
    proofOutputs: ["Founder review", "Chronicle candidate", "Archive memory"],
    chronicleCandidate: true,
    archiveCandidate: true,
    eventRef: "evt-fire-founder",
  },
  {
    id: "fire-community-milestone",
    title: "Community burn — milestone signal",
    source: "community",
    status: "candidate",
    amountSyn: 2500,
    date: "Pending review",
    chapter: "Genesis Signal",
    note: "Members propose retiring SYN together to mark a milestone. Proof of conviction, not a reward or a return. Founder review is required before any burn could be real.",
    proofOutputs: ["Recognition signal", "Founder review"],
    chronicleCandidate: false,
    archiveCandidate: false,
    eventRef: "evt-fire-community",
  },
  {
    id: "fire-protocol-recorded",
    title: "Proof of Fire — recorded concept",
    source: "protocol",
    status: "simulated",
    amountSyn: 2500,
    date: "Genesis Signal",
    chapter: "Genesis Signal",
    note: "How a confirmed burn would be remembered: a memory artifact and a shareable proof. Witness, never hype. Values are simulated for the prototype.",
    proofOutputs: ["Archive memory", "Share card"],
    chronicleCandidate: false,
    archiveCandidate: true,
    eventRef: "evt-fire-recorded",
  },
];

// ---- Selectors -------------------------------------------------------------

export function getFireLedger(): BurnEvent[] {
  return FIRE_LEDGER;
}

export function getBurnsBySource(source: BurnSource): BurnEvent[] {
  return FIRE_LEDGER.filter((b) => b.source === source);
}

export interface BurnSummary {
  /** SIMULATED total of SYN considered retired across the prototype. */
  totalSyn: number;
  /** Always true in the prototype — there is no live burn figure. */
  simulated: true;
  statusLabel: "SIMULATED PROTOTYPE";
  pendingCandidates: number;
  bySource: { source: BurnSource; label: string; amountSyn: number; count: number }[];
}

export function getBurnSummary(): BurnSummary {
  const sources: BurnSource[] = ["founder", "community", "protocol"];
  return {
    totalSyn: MOCK_DATA.protocolStats.burnedSyn, // SIMULATED — labeled everywhere it renders
    simulated: true,
    statusLabel: "SIMULATED PROTOTYPE",
    pendingCandidates: FIRE_LEDGER.filter((b) => b.status === "candidate").length,
    bySource: sources.map((source) => {
      const items = getBurnsBySource(source);
      return {
        source,
        label: SOURCE_LABELS[source],
        amountSyn: items.reduce((sum, b) => sum + b.amountSyn, 0),
        count: items.length,
      };
    }),
  };
}

// Public projection. Burns are already protocol-level (no member persona is ever
// attached), so the public ledger mirrors the member view. Kept as a separate
// selector so the public/member boundary stays explicit and future-proof.
export function getPublicFireLedger(): BurnEvent[] {
  return FIRE_LEDGER;
}

// The underlying organism events (for "how a burn flows" views). Reads straight
// from the graph so the Activity -> Candidate -> Chronicle/Archive/Share path
// stays single-source.
export function getFireFlow(): ProtocolEvent[] {
  return getEventsForClassification("fire");
}

export const FIRE_SOURCE: DataSource = "future";
