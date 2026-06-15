import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { HeaderWalletChip, AvalancheNetworkPill } from "./HeaderWalletChip";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { track } from "@/lib/analytics";

type Item = { label: string; to: string; hint?: string };
type Group = { label: string; items: Item[] };

// Cockpit nav: 6 primary destinations + a single "More" instrument group
// (mirrors the reference header lockup).
const PRIMARY: Item[] = [
  { label: "Activity", to: "/activity", hint: "Onchain events stream" },
  { label: "Vault", to: "/vault", hint: "70% routing destination" },
  { label: "NFT / Archive", to: "/nft", hint: "The First Signal · Chapter I mint open" },
  { label: "Verify", to: "/transparency", hint: "Verify every claim" },
  { label: "Members", to: "/members", hint: "Who is joining" },
  { label: "Token (SYN)", to: "/token", hint: "SYN contract & spec" },
];

const GROUPS: Group[] = [
  {
    label: "More",
    items: [
      { label: "Archive", to: "/archive", hint: "Collector artifacts & seals" },
      { label: "Roadmap", to: "/roadmap", hint: "Live · Next · Pending · Future" },
      { label: "Referral · Preview", to: "/referral", hint: "Simulated future model" },
      { label: "Tokenomics", to: "/tokenomics", hint: "Allocation & supply" },
      { label: "Liquidity", to: "/liquidity", hint: "SYN/USDC pool" },
      { label: "Contract Registry", to: "/registry", hint: "Every contract & wallet address" },
      { label: "Founders", to: "/founders", hint: "Who was here first" },
      { label: "Chapters", to: "/chapters", hint: "How the protocol formed" },
      { label: "Ranks", to: "/ranks", hint: "Where you fit" },
      { label: "Docs", to: "/docs", hint: "Knowledge hub" },
      { label: "Whitepaper", to: "/whitepaper", hint: "Full protocol thesis" },
      { label: "FAQ", to: "/faq", hint: "Honest answers" },
    ],
  },
];

// Shared nav-link chrome: mono, uppercase, muted → cyan active.
const NAV_BASE =
  "mono whitespace-nowrap px-2 py-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors";
const NAV_ACTIVE = "text-[color:var(--accent)]";

export function Header({ wide = false }: { wide?: boolean } = {}) {
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
      <div className={`mx-auto flex items-center justify-between gap-3 h-16 ${wide ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl px-5 md:px-8"}`}>
        {/* Logo — gold brand lockup (reference header) */}
        <Logo size="sm" tone="gold" withProtocolLabel withChapter onClick={() => setMobileOpen(false)} />

        {/* Desktop grouped nav — full inline nav only at xl+, where it fits beside
            the action cluster; below xl it collapses into the drawer (hamburger). */}
        <nav className="hidden xl:flex items-center gap-0.5 relative">
          {PRIMARY.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className={NAV_BASE}
              activeProps={{ className: `${NAV_BASE} ${NAV_ACTIVE}` }}
              onClick={
                it.to === "/transparency"
                  ? () => track("verify_click", { surface: "header" })
                  : undefined
              }
            >
              {it.label}
            </Link>
          ))}
          <span aria-hidden className="mx-1.5 h-4 w-px bg-border" />
          {GROUPS.map((g) => (
            <div
              key={g.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(g.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                className="mono inline-flex items-center gap-1 px-2 py-2 text-[11px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setOpenGroup(openGroup === g.label ? null : g.label)}
                aria-expanded={openGroup === g.label}
              >
                {g.label}
                <ChevronDown className="size-3 opacity-60" />
              </button>
              {openGroup === g.label && (
                <div className="absolute left-0 top-full pt-2 w-64 z-50">
                  <div className="surface elevated p-1.5 border border-border bg-card">
                    {g.items.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="block rounded-[3px] px-3 py-2 text-xs hover:bg-muted border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors"
                        onClick={() => setOpenGroup(null)}
                      >
                        <div className="font-medium text-foreground">{it.label}</div>
                        {it.hint && <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{it.hint}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action cluster — Bell · Avalanche C-Chain pill · theme toggle · Connect Wallet · Join (gold). */}
        <div className="flex items-center gap-1.5">
          <NotificationBell className="hidden sm:inline-flex" />
          <AvalancheNetworkPill />
          <ThemeToggle variant="icon" className="hidden md:inline-flex" />
          <HeaderWalletChip />
          <Link
            to="/join"
            onClick={() => track("join_cta_click", { surface: "header" })}
            className="mono inline-flex items-center gap-2 rounded-[3px] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-[filter] hover:brightness-110"
            style={{
              background: "linear-gradient(135deg, #F5C94A 0%, #E3A92B 44%, #9E6412 100%)",
              color: "#15110A",
              boxShadow: "0 10px 30px -12px color-mix(in oklab, #E3A92B 60%, transparent)",
            }}
          >
            Join
          </Link>
          <button
            className="xl:hidden inline-flex items-center justify-center size-9 rounded-[3px] border border-border text-foreground hover:border-[color:var(--accent)] transition-colors"
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
        <div className="xl:hidden absolute left-0 right-0 top-16 max-h-[calc(100dvh-4rem)] overflow-y-auto bg-card border-b border-border shadow-xl">
          <div className="mx-auto max-w-7xl px-5 py-6 space-y-6">
            <Link
              to="/join"
              onClick={() => { setMobileOpen(false); track("join_cta_click", { surface: "header_mobile" }); }}
              className="mono flex w-full items-center justify-center gap-2 rounded-[3px] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ background: "linear-gradient(135deg, #F5C94A 0%, #E3A92B 44%, #9E6412 100%)", color: "#15110A", boxShadow: "0 10px 30px -12px color-mix(in oklab, #E3A92B 60%, transparent)" }}
            >
              Join The Syndicate →
            </Link>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2">Wallet</div>
                <HeaderWalletChip variant="mobile" />
              </div>
              <ThemeToggle variant="pill" />
            </div>
            <div>
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)] mb-2 border-l-2 border-[color:var(--accent)] pl-2">Primary</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {PRIMARY.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-[3px] px-3 py-2.5 hover:bg-muted border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors"
                  >
                    <div className="text-sm font-medium text-foreground">{it.label}</div>
                    {it.hint && <div className="mono mt-0.5 text-[11px] text-muted-foreground">{it.hint}</div>}
                  </Link>
                ))}
              </div>
            </div>
            {GROUPS.map((g) => (
              <div key={g.label}>
                <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground mb-2 border-l-2 border-border pl-2">{g.label}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {g.items.map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-[3px] px-3 py-2.5 hover:bg-muted border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground">{it.label}</div>
                      {it.hint && <div className="mono mt-0.5 text-[11px] text-muted-foreground">{it.hint}</div>}
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
