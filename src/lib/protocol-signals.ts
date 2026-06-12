// ─── Protocol Signals (the MINIMAL Signals Engine) ─────────────────────────
// The deterministic Event → Signal derivation layer. ONE pure function projects
// the canonical event stream into Signals (Type × Tier × Subject) using the
// vocabulary + rule table in signal-registry.ts. It is OUTPUT-ONLY and additive:
// it reads CanonicalProtocolEvent[] and the pre-declared PROTOCOL_MILESTONES
// thresholds, and writes nothing back into the pipeline.
//
// ADJACENCY LAW (canon 05 §2.1): this module reads EVENTS only. It imports the
// event layer (type-only), the signal registry, the pre-declared milestone
// thresholds, and the language guard — NEVER Memory (Chronicle entries /
// candidates, Recognition candidates, protocol-memory, leaderboard / referral).
//
// MONEY GUARDRAIL (canon 05 §4.5): person-subject signals (member / wallet) are
// capped at S2 by the rule table; protocol significance is emitted as SEPARATE
// milestone / protocol-subject signals. Per Rule A the deriver MAY read a raw
// USDC amount to detect when a PRE-DECLARED protocol threshold is crossed, but
// the magnitude never enters tier logic and never touches a person subject —
// the amount-invariance test proves person-subject tiers don't move with amount.

import type { CanonicalProtocolEvent } from "./protocol-events";
import type { ProtocolEventKind } from "./protocol-event-registry";
import {
  SIGNAL_RULE_FOR_KIND,
  tierForMilestone,
  PROOF_OF_FIRE_FIRST_TIER,
  type Signal,
  type SignalType,
  type SignalTier,
  type SignalSubject,
  type StructuralFacts,
} from "./signal-registry";
import { PROTOCOL_MILESTONES } from "./activity-milestones";

/** Pre-declared threshold lookups (structural — labels carry no live amount). */
const USDC_MILESTONES = PROTOCOL_MILESTONES.filter((m) => m.kind === "usdc").sort(
  (a, b) => a.target - b.target,
);
const MEMBER_MILESTONE_BY_TARGET = new Map(
  PROTOCOL_MILESTONES.filter((m) => m.kind === "members").map((m) => [m.target, m]),
);

/** Plain-language, doctrine-clean base reason per kind (no money framing). */
const BASE_REASON: Record<ProtocolEventKind, string> = {
  purchase: "A membership purchase routed USDC through the sale.",
  "new-member": "A new seat entered the public registry.",
  "rank-reached": "Cumulative USDC moved this seat to a new recognition rank.",
  "swap-buy": "An LP buy moved the SYN/USDC pair.",
  "swap-sell": "An LP sell moved the SYN/USDC pair.",
  "lp-add": "Liquidity was added to the SYN/USDC pair.",
  "lp-remove": "Liquidity was removed from the SYN/USDC pair.",
  "vault-in": "The Vault wallet received USDC.",
  "vault-out": "The Vault wallet sent USDC.",
  "nft-mint-first-signal": "A First Signal artifact was issued from the Archive.",
  "nft-mint-patron-seal": "A Patron Seal artifact was issued from the Archive.",
  "nft-mint-other": "An artifact was issued from the Archive.",
  "burn-founder": "Founder support: SYN permanently sent to the burn address.",
  "burn-community": "A community burn permanently sent SYN to the burn address.",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`;
}

const byAscending = (a: CanonicalProtocolEvent, b: CanonicalProtocolEvent) =>
  a.blockNumber === b.blockNumber
    ? a.logIndex - b.logIndex
    : a.blockNumber > b.blockNumber
    ? 1
    : -1;

function makeSignal(args: {
  event: CanonicalProtocolEvent;
  tag: string;
  type: SignalType;
  tier: SignalTier;
  subject: SignalSubject;
  reason: string;
  facts: StructuralFacts;
}): Signal {
  const { event, tag, type, tier, subject, reason, facts } = args;
  return {
    id: `sig-${event.id}-${tag}`,
    type,
    tier,
    subject,
    sourceEventId: event.id,
    sourceTxHash: event.txHash,
    sourceBlock: event.blockNumber,
    reason,
    createdFrom: event.kind,
    verification: event.status,
    facts,
  };
}

export type DeriveSignalsOptions = {
  /**
   * Set true ONLY when `events` is a gapless scan back to deployment. Gates all
   * "first ever" / ordinal / cumulative-threshold milestone signals so a
   * window-relative sample never fabricates a protocol-wide first.
   */
  windowCoversDeployment?: boolean;
};

/**
 * Derive Signals from the canonical event stream. Pure & deterministic: same
 * events ⇒ same signals. Each source event yields one BASE signal (from the
 * rule table) plus zero or more derived signals (continuity, pre-declared
 * milestone crossings, historical Proof of Fire). Returned oldest → newest.
 */
export function deriveSignals(
  events: ReadonlyArray<CanonicalProtocolEvent>,
  opts: DeriveSignalsOptions = {},
): Signal[] {
  const windowCoversDeployment = opts.windowCoversDeployment ?? false;
  const ascending = [...events].sort(byAscending);

  const firstOfKind = new Map<ProtocolEventKind, string>();
  for (const e of ascending) {
    if (!firstOfKind.has(e.kind)) firstOfKind.set(e.kind, e.id);
  }

  const out: Signal[] = [];
  const purchaseCountByActor = new Map<string, number>();
  let cumulativeUsdc = 0;
  const crossedUsdc = new Set<string>();

  for (const e of ascending) {
    const rule = SIGNAL_RULE_FOR_KIND[e.kind];
    const isFirstOfKind = firstOfKind.get(e.kind) === e.id;

    const facts: StructuralFacts = {
      isFirstOfKind,
      windowCoversDeployment,
      ...(typeof e.memberOrdinal === "number" ? { memberOrdinal: e.memberOrdinal } : {}),
      ...(typeof e.proofOfFireIndex === "number"
        ? { proofOfFireIndex: e.proofOfFireIndex }
        : {}),
      ...(e.founderAction ? { founderAction: e.founderAction } : {}),
    };

    // BASE signal (rule table — person subjects capped at S2 here).
    out.push(
      makeSignal({
        event: e,
        tag: "base",
        type: rule.type,
        tier: rule.tier,
        subject: rule.subject,
        reason: BASE_REASON[e.kind],
        facts,
      }),
    );

    // CONTINUITY + cumulative USDC threshold crossings (purchases only).
    if (e.kind === "purchase" && e.from) {
      const actor = e.from.toLowerCase();
      const n = (purchaseCountByActor.get(actor) ?? 0) + 1;
      purchaseCountByActor.set(actor, n);
      if (n >= 2) {
        // The repeat itself (n≥2) is always true. The ABSOLUTE ordinal ("2nd
        // purchase") is only true protocol-wide when the window covers
        // deployment; otherwise the count is window-relative, so we phrase it
        // as such rather than inventing a protocol-wide ordinal.
        const reason = windowCoversDeployment
          ? `Repeat entry — this seat's ${ordinal(n)} purchase (recognition only).`
          : "Repeat entry — this seat purchased again within the loaded window (recognition only).";
        out.push(
          makeSignal({
            event: e,
            tag: `continuity-${n}`,
            type: "CONTINUITY",
            tier: "S1",
            subject: "member",
            reason,
            facts: { ...facts, repeatPurchaseIndex: n },
          }),
        );
      }

      // Cumulative routed-USDC milestones are PROTOCOL-subject; the amount is
      // read only to detect a PRE-DECLARED threshold crossing, never to set a
      // person tier. Gated on deployment coverage so the running total is real.
      if (windowCoversDeployment && typeof e.amountUsd === "number") {
        const prev = cumulativeUsdc;
        cumulativeUsdc += e.amountUsd;
        for (const m of USDC_MILESTONES) {
          if (!crossedUsdc.has(m.id) && prev < m.target && cumulativeUsdc >= m.target) {
            crossedUsdc.add(m.id);
            out.push(
              makeSignal({
                event: e,
                tag: `milestone-${m.id}`,
                type: "MILESTONE",
                tier: tierForMilestone(m.id),
                subject: "milestone",
                reason: `${m.label} — pre-declared protocol threshold crossed.`,
                facts: { ...facts, crossedMilestoneIds: [m.id] },
              }),
            );
          }
        }
      }
    }

    // MEMBERSHIP ordinal milestones (protocol-subject), gated on coverage so the
    // structured ordinal is a genuine protocol-wide seat number.
    if (
      e.kind === "new-member" &&
      windowCoversDeployment &&
      typeof e.memberOrdinal === "number"
    ) {
      const m = MEMBER_MILESTONE_BY_TARGET.get(e.memberOrdinal);
      if (m) {
        out.push(
          makeSignal({
            event: e,
            tag: `milestone-${m.id}`,
            type: "MILESTONE",
            tier: tierForMilestone(m.id),
            subject: "milestone",
            reason: `${m.label} — pre-declared protocol milestone reached.`,
            facts: { ...facts, crossedMilestoneIds: [m.id] },
          }),
        );
      }
    }

    // ARTIFACT first-issuance milestones — only a genuine first when the window
    // covers deployment (mirrors the chronicle-candidate deployment-coverage gate).
    if (isFirstOfKind && windowCoversDeployment) {
      if (e.kind === "nft-mint-first-signal") {
        out.push(
          makeSignal({
            event: e,
            tag: "milestone-first-signal-mint",
            type: "MILESTONE",
            tier: tierForMilestone("first-signal-mint"),
            subject: "milestone",
            reason: "First Signal first issuance — pre-declared protocol milestone.",
            facts: { ...facts, crossedMilestoneIds: ["first-signal-mint"] },
          }),
        );
      } else if (e.kind === "nft-mint-patron-seal") {
        out.push(
          makeSignal({
            event: e,
            tag: "milestone-patron-seal-mint",
            type: "MILESTONE",
            tier: tierForMilestone("patron-seal-mint"),
            subject: "milestone",
            reason: "First Patron Seal first issuance — pre-declared protocol milestone.",
            facts: { ...facts, crossedMilestoneIds: ["patron-seal-mint"] },
          }),
        );
      }
    }

    // BURN historical: Proof of Fire #001 is the protocol's first verified burn.
    // proofOfFireIndex is set upstream ONLY when the burn scan is gapless, so its
    // presence is its own reliability gate.
    if (e.proofOfFireIndex === 1) {
      out.push(
        makeSignal({
          event: e,
          tag: "pof-001",
          type: "MILESTONE",
          tier: PROOF_OF_FIRE_FIRST_TIER,
          subject: "protocol",
          reason: "Proof of Fire #001 — the protocol's first verified burn.",
          facts,
        }),
      );
    }
  }

  return out;
}
