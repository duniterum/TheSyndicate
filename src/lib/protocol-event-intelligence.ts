import {
  ACTIVE_INSTITUTIONAL_TX_INDEX,
  INSTITUTIONAL_REGISTER_ROUTE,
  institutionalLinkForTx,
  type ActivityInstitutionalLink,
} from "./activity-institutional-link";
import { FOUNDER_ACTION_LABEL, FOUNDER_ACTION_NOTE } from "./founder-actions";
import type { CanonicalProtocolEvent } from "./protocol-events";

export type ChronicleCandidateDisposition =
  | {
      status: "CANDIDATE";
      label: "Chronicle candidate";
      reason: string;
    }
  | {
      status: "NOT_ELIGIBLE";
      label: "Activity only";
      reason: string;
    };

export type RegisterDisposition =
  | {
      status: "ACTIVE_RECORD";
      label: "Active Institutional Register record";
      route: typeof INSTITUTIONAL_REGISTER_ROUTE;
      entryId: string;
      title: string;
    }
  | {
      status: "CHRONICLE_CANDIDATE_ONLY";
      label: "Chronicle candidate only";
      route: null;
      entryId: null;
      title: null;
    }
  | {
      status: "NO_REGISTER_DISPOSITION";
      label: "No register disposition";
      route: null;
      entryId: null;
      title: null;
    };

export type ProtocolEventIntelligence = {
  eventId: string;
  kind: CanonicalProtocolEvent["kind"];
  status: CanonicalProtocolEvent["status"];
  whatHappened: string;
  meaning: string;
  consequence: string;
  attribution: string;
  metricEffects: readonly string[];
  chronicleCandidate: ChronicleCandidateDisposition;
  registerDisposition: RegisterDisposition;
};

export type ProtocolEventIntelligenceOptions = {
  institutionalIndex?: ReadonlyMap<string, ActivityInstitutionalLink>;
};

function eventMeaning(event: CanonicalProtocolEvent): string {
  switch (event.kind) {
    case "purchase":
      return "A wallet entered through the Membership Sale. SYN is the seat; the purchase is the entry event.";
    case "new-member":
      return "A seated wallet became visible in the membership index. The seat comes from SYN, not from an NFT.";
    case "rank-reached":
      return "A seated wallet crossed a capital-footprint band derived from verified membership purchases.";
    case "swap-buy":
    case "swap-sell":
      return "The secondary market access layer moved. This is DEX activity, not membership entry.";
    case "lp-add":
      return "Liquidity was added to the market access layer. This supports access, not yield framing.";
    case "lp-remove":
      return "Liquidity was removed from the market access layer. This changes market access conditions.";
    case "vault-in":
      return "USDC moved into a protocol wallet. The movement is part of transparent protocol accounting.";
    case "vault-out":
      return "USDC moved out of a protocol wallet. The movement needs factual routing and spend context.";
    case "nft-mint-first-signal":
    case "nft-mint-patron-seal":
    case "nft-mint-other":
      return "An Archive1155 artifact was minted as protocol memory. The artifact is a memory, not the seat.";
    case "burn-founder":
      return "The founder wallet sent SYN to the burn address. This is a permanent supply event, not a buyback claim.";
    case "burn-community":
      return "SYN was sent to the burn address. This is a permanent supply event.";
  }
}

function eventConsequence(event: CanonicalProtocolEvent): string {
  switch (event.category) {
    case "membership-sale":
      return "Updates membership, SYN distribution, chapter progress, and the 70 / 20 / 10 routing record.";
    case "lp":
      return "Updates liquidity and spot-price context for the market access layer.";
    case "protocol-wallet":
      return "Updates protocol-wallet accounting and transparency surfaces.";
    case "archive":
      return "Updates archive memory and artifact-count surfaces without changing seat status.";
    case "burn":
      return "Updates burned supply, circulating supply context, and Proof of Burn history.";
    case "syn-transfer":
      return "Updates SYN movement context.";
  }
}

function eventAttribution(event: CanonicalProtocolEvent): string {
  if (event.founderAction) {
    return `${FOUNDER_ACTION_LABEL[event.founderAction]}: ${FOUNDER_ACTION_NOTE[event.founderAction]}`;
  }
  if (event.fromLabel && event.toLabel) return `${event.fromLabel} -> ${event.toLabel}`;
  if (event.fromLabel) return event.fromLabel;
  if (event.toLabel) return event.toLabel;
  return "Protocol event";
}

function chronicleDisposition(event: CanonicalProtocolEvent): ChronicleCandidateDisposition {
  if (event.chronicleEligible) {
    return {
      status: "CANDIDATE",
      label: "Chronicle candidate",
      reason: "This event kind is protocol-level and may enter the Chronicle after the existing curation gates.",
    };
  }
  return {
    status: "NOT_ELIGIBLE",
    label: "Activity only",
    reason: "This event kind remains activity/proof and is not a Chronicle candidate by registry policy.",
  };
}

function registerDispositionFor(
  event: CanonicalProtocolEvent,
  index: ReadonlyMap<string, ActivityInstitutionalLink>,
): RegisterDisposition {
  const active = institutionalLinkForTx(index, event.txHash);
  if (active) {
    return {
      status: "ACTIVE_RECORD",
      label: "Active Institutional Register record",
      route: INSTITUTIONAL_REGISTER_ROUTE,
      entryId: active.entryId,
      title: active.title,
    };
  }
  if (event.chronicleEligible) {
    return {
      status: "CHRONICLE_CANDIDATE_ONLY",
      label: "Chronicle candidate only",
      route: null,
      entryId: null,
      title: null,
    };
  }
  return {
    status: "NO_REGISTER_DISPOSITION",
    label: "No register disposition",
    route: null,
    entryId: null,
    title: null,
  };
}

export function interpretProtocolEvent(
  event: CanonicalProtocolEvent,
  options: ProtocolEventIntelligenceOptions = {},
): ProtocolEventIntelligence {
  const index = options.institutionalIndex ?? ACTIVE_INSTITUTIONAL_TX_INDEX;
  return {
    eventId: event.id,
    kind: event.kind,
    status: event.status,
    whatHappened: event.title,
    meaning: eventMeaning(event),
    consequence: eventConsequence(event),
    attribution: eventAttribution(event),
    metricEffects: event.metricEffects,
    chronicleCandidate: chronicleDisposition(event),
    registerDisposition: registerDispositionFor(event, index),
  };
}
