import { Link } from "@tanstack/react-router";
import { Section, SectionHeader, CTAButton } from "./Primitives";
import { SALE_MIN_USDC } from "@/lib/syndicate-config";

/**
 * HOW TO JOIN — Conversion Wave (Wave 2, Priority 2).
 *
 * A visitor should never wonder "what do I do now?". Six visual steps,
 * plain language, no jargon. Each step is a single action with a one-line
 * explanation a non-crypto reader can follow.
 */
const steps = [
  {
    n: 1,
    title: "Connect your wallet",
    body: "Use any Avalanche-compatible wallet (MetaMask, Rabby, Core). One click, no account, no email.",
  },
  {
    n: 2,
    title: "Choose your amount",
    body: `Pick how much USDC you want to commit. The minimum is $${SALE_MIN_USDC}. The rate is the same for everyone.`,
  },
  {
    n: 3,
    title: "Receive your SYN",
    body: "The Membership Sale contract sends SYN directly to your wallet in the same transaction. No waiting, no claim step.",
  },
  {
    n: 4,
    title: "Become a Member",
    body: "Your wallet is now part of the protocol. You get a member number and a permanent chapter — Genesis Signal, First Thousand, The Expansion, First Ten Thousand, or Open Era.",
  },
  {
    n: 5,
    title: "Appear in the Archive",
    body: "Your member page goes live: member number, chapter, join date, history. Public, on-chain, and yours.",
  },
  {
    n: 6,
    title: "Verify on-chain",
    body: "Open any transaction on Avascan. Check the routing wallets. Confirm what we say, with your own eyes.",
  },
];

export function HowToJoinSteps() {
  return (
    <Section id="how-to-join">
      <SectionHeader
        eyebrow="How to join"
        title={
          <>
            Six steps. <span className="text-gradient-gold">No jargon.</span>
          </>
        }
        description="Joining The Syndicate takes about a minute. Here is exactly what happens, in order."
      />

      <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className="relative surface elevated p-5 flex flex-col gap-3 h-full"
          >
            <div className="flex items-center gap-3">
              <div
                className="size-9 rounded-full grid place-items-center mono text-sm font-semibold text-[oklch(0.22_0.025_260)]"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
                aria-hidden
              >
                {s.n}
              </div>
              <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Step {s.n} of {steps.length}
              </div>
            </div>
            <h3 className="text-base md:text-lg font-semibold text-foreground tracking-tight">
              {s.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className="hidden lg:block absolute top-1/2 -right-2 size-3 rotate-45 border-t border-r border-border/60 bg-background"
              />
            )}
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <CTAButton variant="gold" href="/join">
          Start now — become a member for ${SALE_MIN_USDC}
        </CTAButton>
        <CTAButton variant="ghost" href="/transparency">
          Verify before you join
        </CTAButton>
        <Link
          to="/faq"
          className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          Questions? Read the FAQ →
        </Link>
      </div>
    </Section>
  );
}
