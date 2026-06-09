import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { SYNDICATE_CONFIG } from "@/lib/syndicate-config";
import { HeaderWalletChip } from "./HeaderWalletChip";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { track } from "@/lib/analytics";

type Item = { label: string; to: string; hint?: string };
type Group = { label: string; items: Item[] };

// Simplified nav (Wave 4): 5 primary destinations + a single "More" group.
// Primary: Join · Activity · Vault · NFT · Verify.
// "More" surfaces the remaining protocol/community/learn pages.
const PRIMARY: Item[] = [
  { label: "Activity", to: "/activity", hint: "Onchain events stream" },
  { label: "Vault", to: "/vault", hint: "70% routing destination" },
  { label: "NFT", to: "/nft", hint: "The First Signal · Chapter I mint open" },
  { label: "Verify", to: "/transparency", hint: "Verify every claim" },
];


const GROUPS: Group[] = [
  {
    label: "More",
    items: [
      { label: "Roadmap", to: "/roadmap", hint: "Live · Next · Pending · Future" },
      { label: "Referral · Preview", to: "/referral", hint: "Simulated future model" },
      { label: "Token", to: "/token", hint: "SYN contract & spec" },
      { label: "Tokenomics", to: "/tokenomics", hint: "Allocation & supply" },
      { label: "Liquidity", to: "/liquidity", hint: "SYN/USDC pool" },
      { label: "Registry", to: "/registry", hint: "Public addresses" },
      { label: "Members", to: "/members", hint: "Who is joining" },
      { label: "Founders", to: "/founders", hint: "Who was here first" },
      { label: "Chapters", to: "/chapters", hint: "How the protocol formed" },
      { label: "Ranks", to: "/ranks", hint: "Where you fit" },
      { label: "Docs", to: "/docs", hint: "Knowledge hub" },
      { label: "Whitepaper", to: "/whitepaper", hint: "Full protocol thesis" },
      { label: "FAQ", to: "/faq", hint: "Honest answers" },
    ],
  },
];

export function Header() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpenGroup(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-border">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 md:px-8 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <div
            className="size-7 rounded-md grid place-items-center"
            style={{ background: "var(--gradient-navy)", boxShadow: "var(--shadow-glow-navy)" }}
          >
            <span className="mono text-[10px] font-bold text-[var(--primary-foreground)]">S</span>
          </div>
          <span className="font-semibold tracking-tight">
            The <span className="text-gradient-gold">Syndicate</span>
          </span>
          <span className="mono ml-2 hidden md:inline rounded border border-border/70 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-muted-foreground">
            CH #{SYNDICATE_CONFIG.CURRENT_EPISODE}
          </span>
        </Link>

        {/* Desktop grouped nav */}
        <nav className="hidden lg:flex items-center gap-1 relative">
          {PRIMARY.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-foreground" }}
            >
              {it.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px bg-border" />
          {GROUPS.map((g) => (
            <div
              key={g.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(g.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                className="inline-flex items-center gap-1 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpenGroup(openGroup === g.label ? null : g.label)}
                aria-expanded={openGroup === g.label}
              >
                {g.label}
                <ChevronDown className="size-3 opacity-60" />
              </button>
              {openGroup === g.label && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50">
                  <div className="surface elevated p-2 rounded-lg shadow-xl border border-border bg-card">
                    {g.items.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="block rounded-md px-3 py-2 text-xs hover:bg-muted transition-colors"
                        onClick={() => setOpenGroup(null)}
                      >
                        <div className="font-medium text-foreground">{it.label}</div>
                        {it.hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{it.hint}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* CTA cluster — Wallet chip, Theme toggle, Verify secondary, Join primary */}
        <div className="flex items-center gap-2">
          <NotificationBell className="hidden sm:inline-flex" />
          <HeaderWalletChip />
          <ThemeToggle variant="icon" className="hidden sm:inline-flex" />
          <Link
            to="/transparency"
            onClick={() => track("verify_click", { surface: "header" })}
            className="mono hidden sm:inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-foreground hover:border-[color:var(--gold)]/60 hover:text-[color:var(--gold)] transition-colors"
          >
            Verify
          </Link>
          <Link
            to="/join"
            onClick={() => track("join_cta_click", { surface: "header" })}
            className="mono inline-flex items-center gap-2 rounded-md px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[color:var(--primary-foreground)]"
            style={{ background: "var(--gradient-gold)", boxShadow: "var(--shadow-glow-gold)", color: "oklch(0.20 0.005 60)" }}
          >
            Join
          </Link>
          <button
            className="lg:hidden inline-flex items-center justify-center size-9 rounded-md border border-border text-foreground"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden absolute left-0 right-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-card border-b border-border shadow-xl">
          <div className="mx-auto max-w-7xl px-5 py-6 space-y-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Wallet</div>
                <HeaderWalletChip variant="mobile" />
              </div>
              <ThemeToggle variant="pill" />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Primary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {PRIMARY.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
                  >
                    <div className="text-sm font-medium text-foreground">{it.label}</div>
                    {it.hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{it.hint}</div>}
                  </Link>
                ))}
              </div>
            </div>
            {GROUPS.map((g) => (
              <div key={g.label}>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">{g.label}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {g.items.map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-3 py-2.5 hover:bg-muted transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground">{it.label}</div>
                      {it.hint && <div className="mt-0.5 text-[11px] text-muted-foreground">{it.hint}</div>}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
