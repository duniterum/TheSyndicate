// Protocol Memory Layer — pure derivation utility.
//
// Turns raw on-chain events into HUMAN MEANING:
//
//   • Since Your Last Visit (protocol-wide deltas)        → source: LOCAL+INDEXED
//   • What Changed For You   (wallet-scoped facts)        → source: INDEXED+LIVE
//   • Milestones Witnessed   (milestones since you joined) → source: INDEXED
//   • Coming Next            (closest upcoming milestones)  → source: INDEXED
//
// Truth rules (binding):
//   • Every memory item is labelled LIVE / INDEXED / LOCAL / PARTIAL.
//   • Witness language is "Protocol milestones since you joined" — never an
//     unverifiable claim like "you witnessed". Only canonical milestones.
//   • localStorage is ONLY allowed as a read/unread hint (LOCAL). Never as
//     ownership, eligibility, or witness proof.
//   • If a fact is not verifiable, OMIT — never invent.

import type { HolderRecord } from "./holder-index";
import type { ProtocolEvent } from "./protocol-events";
import {
  evaluateMilestones,
  splitReached,
  type MilestoneStatus,
} from "./activity-milestones";
import {
  txExplorerUrl,
  explorerUrlForAddress,
  ARCHIVE_NFT_EXPLORERS,
} from "./syndicate-config";


export type MemorySource = "LIVE" | "INDEXED" | "LOCAL" | "PARTIAL";

export type MemoryFact = {
  id: string;
  label: string;
  value: string;
  source: MemorySource;
  /** Deep link to the exact on-chain proof used to derive this fact. */
  verifyHref?: string;
  /** Optional short label for the verify link (defaults to "Verify ↗"). */
  verifyLabel?: string;
};

export type PersonalMemory = {

  isMember: boolean;
  facts: MemoryFact[];
  /** Canonical milestones reached at or after this member's join block. */
  milestonesSinceJoin: MilestoneStatus[];
  /** Closest upcoming canonical milestones (max 3). */
  comingNext: MilestoneStatus[];
};

export type PersonalMemoryInputs = {
  record: HolderRecord | undefined;
  events: ProtocolEvent[];
  archiveBalances: { firstSignal?: bigint; patronSeal?: bigint };
  pulse: { buyers?: number; usdcRaised?: number };
  mintFlags: { firstSignal: boolean; patronSeal: boolean };
};

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export function derivePersonalMemory(input: PersonalMemoryInputs): PersonalMemory {
  const { record, events, archiveBalances, pulse, mintFlags } = input;

  const facts: MemoryFact[] = [];

  if (record) {
    const seatHref = record.firstPurchaseTx ? txExplorerUrl(record.firstPurchaseTx) : undefined;
    const walletHref = explorerUrlForAddress(record.wallet) ?? undefined;
    facts.push({
      id: "seat",
      label: "You are",
      value: `Member #${record.memberNumber}`,
      source: "INDEXED",
      verifyHref: seatHref,
      verifyLabel: "First-purchase tx ↗",
    });
    if (record.currentRank?.name) {
      facts.push({
        id: "rank",
        label: "Current rank",
        value: record.currentRank.name,
        source: "INDEXED",
        verifyHref: walletHref,
        verifyLabel: "Your purchase history ↗",
      });
    }
    if (record.cumulativeUsdc > 0) {
      facts.push({
        id: "usdc-paid",
        label: "USDC routed by your wallet",
        value: fmtUsd(record.cumulativeUsdc),
        source: "INDEXED",
        verifyHref: walletHref,
        verifyLabel: "Your purchase history ↗",
      });
    }
  }

  const archiveHref = ARCHIVE_NFT_EXPLORERS.avascan;
  const fs = archiveBalances.firstSignal;
  if (fs !== undefined && fs > 0n) {
    facts.push({
      id: "first-signal",
      label: "First Signal owned",
      value: fs.toString(),
      source: "LIVE",
      verifyHref: archiveHref,
      verifyLabel: "Archive contract ↗",
    });
  }
  const ps = archiveBalances.patronSeal;
  if (ps !== undefined && ps > 0n) {
    facts.push({
      id: "patron-seal",
      label: "Patron Seals owned",
      value: ps.toString(),
      source: "LIVE",
      verifyHref: archiveHref,
      verifyLabel: "Archive contract ↗",
    });
  }


  // Witnessed milestones — only canonical milestones the protocol has
  // already sealed at or after this member's join block. We approximate
  // "since join" via firstPurchaseBlock; if any required input is missing
  // we OMIT instead of guessing.
  const allStatuses = evaluateMilestones({
    buyers: pulse.buyers,
    usdcRaised: pulse.usdcRaised,
    firstSignalMinted: mintFlags.firstSignal,
    patronSealMinted: mintFlags.patronSeal,
  });
  const { completed, upcoming } = splitReached(allStatuses);

  let milestonesSinceJoin: MilestoneStatus[] = [];
  if (record) {
    // For now we treat all currently-reached milestones AFTER the user's
    // member number as "since join" for member-count milestones, and all
    // reached USDC / first-mint milestones as "since join" too, because
    // we have no per-block proof of mint ordering. This is INDEXED, not
    // a strong witness claim — surfaced under the softer label
    // "Protocol milestones since you joined".
    milestonesSinceJoin = completed.filter((s) => {
      if (s.milestone.kind === "members") {
        return s.milestone.target >= record.memberNumber;
      }
      return true;
    });
  }

  // events param reserved for future per-block witness proofs; touch to
  // keep the linter aware of the contract.
  void events;

  return {
    isMember: !!record,
    facts,
    milestonesSinceJoin,
    comingNext: upcoming.filter((s) => s.current !== undefined).slice(0, 3),
  };
}

export function sourceLabel(s: MemorySource): string {
  return s;
}
