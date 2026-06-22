// Mobile sticky action bar — global. The only sticky element on mobile.
// Renders only ≤ md. Desktop unaffected.
//
// Phase 5 harmonization: the bar adapts its primary CTA to the current
// route so it always matches the page intent:
//   /nft, /nfts          → Mint  + Verify
//   /token, /liquidity   → Join + Verify
//   /join                → hidden (the page IS the CTA)
//   everything else      → Join + Verify
//
// Behavior, label vocabulary and verify destination stay identical site-wide
// so the bar always reads as one component, not 25 variants.

import { Link, useRouterState } from "@tanstack/react-router";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { SALE_MIN_USDC } from "@/lib/syndicate-config";
import { track } from "@/lib/analytics";
import { useGlobalIdentity } from "@/lib/use-global-identity";
import { ThemeToggle } from "./ThemeToggle";

type BarConfig = {
  primaryLabel: string;
  primaryHref: string;
  primarySurface: string;
  verifyHref: string;
};

function configForRoute(path: string): BarConfig | null {
  if (path === "/join") return null;
  if (path === "/nft" || path === "/nfts") {
    return {
      primaryLabel: "Mint",
      primaryHref: "/nft#first-signal-showcase",
      primarySurface: "mobile_mint_bar",
      verifyHref: "/transparency",
    };
  }
  if (path === "/token" || path === "/liquidity") {
    return {
      primaryLabel: "Join",
      primaryHref: "/join",
      primarySurface: "mobile_buy_bar",
      verifyHref: "/transparency",
    };
  }
  return {
    primaryLabel: "Join",
    primaryHref: "/join",
    primarySurface: "mobile_join_bar",
    verifyHref: "/transparency",
  };
}

export function MobileJoinBar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const cfg = configForRoute(path);
  const p = useProtocolPulse();
  const id = useGlobalIdentity();
  if (!cfg) return null;
  const next = p.nextMemberNumber;

  // Membership-aware override — ONLY for routes whose primary IS the Join CTA.
  // The /nft Mint action stays open to everyone (member or not). Members are
  // sent to their dashboard; connected non-members are nudged to become a
  // member; disconnected / still-loading keep the neutral "Join" → /join.
  let primaryLabel = cfg.primaryLabel;
  let primaryHref = cfg.primaryHref;
  if (cfg.primaryHref === "/join") {
    if (id.isMember) {
      primaryLabel = id.dashboardLabel;
      primaryHref = "/my-syndicate";
    } else if (id.shouldShowBecomeMember) {
      primaryLabel = id.primaryMembershipLabelShort;
    }
  }

  return (
    <div
      aria-label="Syndicate quick actions"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto max-w-7xl px-3 py-2 flex items-center gap-2">
        <ThemeToggle variant="mini" />
        <div className="min-w-0 flex-1 mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground leading-tight">
          <div className="text-foreground/85 truncate">
            {next !== undefined ? <>Next: Member #{next}</> : "Live on Avalanche"}
          </div>
          <div className="text-muted-foreground/80 truncate">
            From ${SALE_MIN_USDC} · era-priced V3
          </div>
        </div>
        <Link
          to={cfg.verifyHref}
          onClick={() => track("verify_click", { surface: cfg.primarySurface })}
          className="rounded-[3px] border border-border px-2.5 py-2 mono text-[10px] uppercase tracking-[0.18em] text-foreground/85 hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition-colors"
        >
          Verify
        </Link>
        <Link
          to={primaryHref}
          onClick={() => track("join_cta_click", { surface: cfg.primarySurface, cta: primaryLabel })}
          className="mono rounded-[3px] px-3.5 py-2 text-[12px] font-bold uppercase tracking-[0.14em]"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)", boxShadow: "var(--shadow-glow-gold)" }}
        >
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
