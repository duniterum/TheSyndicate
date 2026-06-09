// Top-of-page action rail for /liquidity.
//
// Crypto-native expectation: a visitor lands on /liquidity and immediately
// sees the actions that matter — Trade · Add Liquidity · Become an LP ·
// View Pool · Verify Pair. No promises, no rewards language. These are
// links to the live Trader Joe pool and the on-chain pair explorer.
//
// Membership / "Join" is intentionally NOT on this rail. Joining the
// protocol (USDC → SYN via the Membership Sale) is a separate action
// surfaced everywhere else on the site; the liquidity rail is for the
// LP-side actions only so the two flows never get confused.

import { LP_POOL, explorerUrlFor } from "@/lib/syndicate-config";
import { Section } from "./Primitives";

type Action = {
  label: string;
  href: string;
  variant: "primary" | "secondary" | "ghost";
  hint: string;
};

const PAIR_EXPLORER = explorerUrlFor("LP_PAIR_ADDRESS") ?? "#";

const ACTIONS: Action[] = [
  {
    label: "Trade SYN",
    href: LP_POOL.traderJoeUrl,
    variant: "primary",
    hint: "Swap on Trader Joe",
  },
  {
    label: "Add Liquidity",
    href: LP_POOL.addLiquidityUrl,
    variant: "secondary",
    hint: "Deposit SYN + USDC",
  },
  {
    label: "Become an LP",
    href: "#provide-liquidity",
    variant: "secondary",
    hint: "How it works · risks",
  },
  {
    label: "View Pool",
    href: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}`,
    variant: "ghost",
    hint: "DexScreener chart",
  },
  {
    label: "Verify Pair",
    href: PAIR_EXPLORER,
    variant: "ghost",
    hint: "Pair contract on Avascan",
  },
];

export function LiquidityActionRail() {
  return (
    <Section id="liquidity-actions">
      <div className="surface elevated p-4 md:p-5">
        <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
          <div>
            <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)]">
              Liquidity actions
            </div>
            <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
              Trade, deposit, or look up the live SYN/USDC pair on Avalanche. These are
              LP-side actions only — Membership (USDC → SYN) is a separate flow.
            </p>
          </div>
          <span className="mono inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <span className="size-1 rounded-full bg-emerald-500 animate-pulse" /> Pool live
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {ACTIONS.map((a) => (
            <a
              key={a.label}
              href={a.href}
              target={a.href.startsWith("#") ? undefined : "_blank"}
              rel={a.href.startsWith("#") ? undefined : "noopener noreferrer"}
              className={
                "group rounded-md border px-3 py-3 text-left transition-colors " +
                (a.variant === "primary"
                  ? "border-[var(--gold)]/70 bg-[var(--gold)]/10 hover:bg-[var(--gold)]/20"
                  : a.variant === "secondary"
                  ? "border-border/70 hover:border-[var(--gold)]/60"
                  : "border-dashed border-border/60 hover:border-[var(--gold)]/50")
              }
            >
              <div className="mono text-[11px] uppercase tracking-[0.18em] font-semibold text-foreground">
                {a.label}
                <span className="ml-1 text-muted-foreground group-hover:text-[var(--gold)]">
                  {a.href.startsWith("#") ? "↓" : "↗"}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground leading-snug">
                {a.hint}
              </div>
            </a>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
          No rewards, yield, NFT eligibility, governance rights, or entitlement are live or
          promised to liquidity providers. See the LP Risk Notice below before depositing.
        </p>
      </div>
    </Section>
  );
}
