import { useAccount } from "wagmi";
import { formatUnits } from "viem";
import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";
import { useBuyerPurchaseTotals } from "@/lib/sale-hooks";
import { rankForSyn } from "@/lib/syndicate-config";

/**
 * MEMBER JOURNEY — identity progression with LIVE per-step verification.
 *
 * Per Phase 3 of the AAA Phased Roadmap (and docs/VISION.md MEMBER-FIRST
 * PRINCIPLE): the Syndicate should feel like a transparent on-chain protocol
 * for ambitious long-term builders. This component shows the identity arc
 * a member follows — Discover → Join → Verify → Participate → Build
 * Reputation → Build Recognition → Archive — and now lights up each step using the
 * connected wallet's onchain state.
 *
 * State derivation (all from chain, no fake claims):
 *   01 Discover           → always DONE (you're reading this)
 *   02 Join               → buyerSynTotal > 0
 *   03 Verify             → same as Join (purchase is publicly verifiable)
 *   04 Participate        → buyerUsdcTotal >= rank.next.usdc step (kept lightweight)
 *   05 Build reputation   → buyerUsdcTotal >= 50 USDC (Builder gate)
 *   06 Build recognition  → rank.current !== Citizen (>= Scout)
 *   07 Archive            → buyerUsdcTotal >= 100 USDC (Founder gate)
 */

type State = "DONE" | "ACTIVE" | "PENDING";

const STEPS: Array<{
  num: string;
  label: string;
  body: string;
  outcome: string;
}> = [
  {
    num: "01",
    label: "Discover",
    body:
      "Land on a protocol that explains its purpose before its mechanics. Read the mission. Read the vision.",
    outcome: "I understand what this is.",
  },
  {
    num: "02",
    label: "Join",
    body:
      "Buy SYN with USDC at the same fixed rate as every other member. No private terms. No insider lanes.",
    outcome: "I have a seat at the formation.",
  },
  {
    num: "03",
    label: "Verify",
    body:
      "Open Avascan. Check the wallets, the routing transaction, the LP reserves. Match every number to a block.",
    outcome: "I can prove the story is real.",
  },
  {
    num: "04",
    label: "Participate",
    body:
      "Watch the protocol form publicly — treasury, liquidity, contracts, modules. Show up early and consistently.",
    outcome: "I am part of building this.",
  },
  {
    num: "05",
    label: "Build reputation",
    body:
      "Reputation is earned through verification, participation, contribution, and longevity. Not wealth. Not speculation.",
    outcome: "My presence is recorded, not my P&L.",
  },
  {
    num: "06",
    label: "Build recognition",
    body:
      "Public, transparent capital footprint reflects verified routed USDC on-chain — never a payout, never a yield claim.",
    outcome: "Progress is visible and verifiable.",
  },
  {
    num: "07",
    label: "Archive",
    body:
      "The protocol remembers who showed up early. The archive is permanent, public, and on-chain.",
    outcome: "I was there at the beginning.",
  },
];

const STATE_STYLE: Record<State, { dot: string; pill: string; label: string }> = {
  DONE: {
    dot: "bg-emerald-500",
    pill:
      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    label: "VERIFIED",
  },
  ACTIVE: {
    dot: "bg-[var(--gold)]",
    pill: "border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[color:oklch(0.5_0.13_75)]",
    label: "ACTIVE",
  },
  PENDING: {
    dot: "bg-muted-foreground/40",
    pill: "border-border/60 bg-muted/40 text-muted-foreground",
    label: "PENDING",
  },
};

function useJourneyStates(): State[] {
  const { isConnected } = useAccount();
  const buyer = useBuyerPurchaseTotals();

  const usdc =
    buyer.buyerUsdcTotal !== undefined ? Number(formatUnits(buyer.buyerUsdcTotal, 6)) : 0;
  const syn =
    buyer.buyerSynTotal !== undefined ? Number(formatUnits(buyer.buyerSynTotal, 18)) : 0;
  const { current } = rankForSyn(syn);

  const states: State[] = [
    "DONE", // 01 Discover — visiting counts
    syn > 0 ? "DONE" : isConnected ? "ACTIVE" : "PENDING", // 02 Join
    syn > 0 ? "DONE" : "PENDING", // 03 Verify
    usdc >= 25 ? "DONE" : syn > 0 ? "ACTIVE" : "PENDING", // 04 Participate
    usdc >= 50 ? "DONE" : usdc > 0 ? "ACTIVE" : "PENDING", // 05 Build reputation
    current && current.name !== "Citizen" ? "DONE" : syn > 0 ? "ACTIVE" : "PENDING", // 06 Build recognition
    usdc >= 100 ? "DONE" : usdc > 0 ? "ACTIVE" : "PENDING", // 07 Archive
  ];

  return states;
}

export function MemberJourney() {
  const { isConnected } = useAccount();
  const states = useJourneyStates();
  const completed = states.filter((s) => s === "DONE").length;

  return (
    <Section id="member-journey">
      <SectionHeader
        eyebrow="Member journey"
        title={
          <>
            From visitor to part of the <span className="text-gradient-gold">archive</span>
          </>
        }
        description="Seven steps of identity, not seven tiers of reward. Each one is something you become inside a transparent on-chain protocol — not something the protocol pays you to do. Connect a wallet to light up your live progress."
      />

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <span
          className={`mono inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] ${
            isConnected
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : "border-border/60 bg-muted/40 text-muted-foreground"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
          />
          {isConnected ? "Wallet connected" : "Wallet not connected"}
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {completed} / {STEPS.length} steps verified onchain
        </span>
      </div>

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        {STEPS.map((s, i) => {
          const state = states[i];
          const style = STATE_STYLE[state];
          return (
            <li key={s.num} className="h-full">
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Step {s.num}
                  </span>
                  <span className={`size-1.5 rounded-full ${style.dot}`} />
                </div>
                <div className="text-base font-semibold text-foreground mb-2">{s.label}</div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3 flex-1">
                  {s.body}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`mono inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] ${style.pill}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="mt-2 mono text-[10px] uppercase tracking-[0.18em] text-[color:oklch(0.5_0.13_75)] leading-relaxed">
                  {s.outcome}
                </p>
              </GlassCard>
            </li>
          );
        })}
      </ol>

      <p className="mt-6 text-xs text-muted-foreground mono leading-relaxed">
        VERIFIED steps reflect onchain reads of your connected wallet (SYN balance, USDC purchased
        through the Membership Sale). ACTIVE means a partial threshold met. PENDING means the step
        is reachable but not yet completed. None of this entitles a member to any payout, share of
        revenue, or financial claim.
      </p>
    </Section>
  );
}
