import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Logo } from "./Logo";
import { HeaderWalletChip, AvalancheNetworkPill } from "./HeaderWalletChip";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";
import { track } from "@/lib/analytics";
import { useGlobalIdentity } from "@/lib/use-global-identity";

type Item = { label: string; to: string; hint?: string };
type Group = { label: string; items: Item[] };

// Cockpit nav: 6 primary destinations + a single "More" instrument group
// (mirrors the reference header lockup).
const PRIMARY: Item[] = [
  { label: "My Syndicate", to: "/my-syndicate", hint: "Your seat, proof, and memory" },
  { label: "Activity", to: "/activity", hint: "Protocol heartbeat" },
  { label: "Archive", to: "/archive", hint: "Artifacts as protocol memory" },
  { label: "Registry", to: "/registry", hint: "Contracts and wallets" },
  { label: "SYN", to: "/token", hint: "The V1 membership seat" },
  { label: "Liquidity", to: "/liquidity", hint: "Trade and LP proof" },
];

const GROUPS: Group[] = [
  {
    label: "More",
    items: [
      { label: "Vault", to: "/vault", hint: "70% routing destination" },
      { label: "First Signal Mint", to: "/nft", hint: "Archive1155 artifact mint" },
      { label: "Archive", to: "/archive", hint: "Museum · every Artifact & seal" },
      { label: "Transparency", to: "/transparency", hint: "70 / 20 / 10 routing proof" },
      { label: "Members", to: "/members", hint: "Who is seated" },
      { label: "Roadmap", to: "/roadmap", hint: "Live · Next · Pending · Future" },
      { label: "Referral Reserved", to: "/referral", hint: "Requires contract before live" },
      { label: "Tokenomics", to: "/tokenomics", hint: "Allocation & supply" },
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

function visibleGroupItems(items: Item[]) {
  return items.filter((it) => it.to !== "/archive");
}

function navLabel(it: Item) {
  if (it.to === "/referral") return "Referral Reserved";
  return it.label;
}

function navHint(it: Item) {
  if (it.to === "/referral") return "Requires contract before live";
  if (it.to === "/roadmap") return "Live / Next / Pending / Future";
  return it.hint;
}

export function Header({ wide = false }: { wide?: boolean } = {}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const id = useGlobalIdentity();

  useEffect(() => {
    const close = () => setOpenGroup(null);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const openWalletSurface = () => {
      if (window.matchMedia("(max-width: 1279px)").matches) {
        setMobileOpen(true);
      }
    };
    document.addEventListener("syndicate:open-wallet", openWalletSurface);
    return () => document.removeEventListener("syndicate:open-wallet", openWalletSurface);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/85 border-b border-border">
      <div className={`mx-auto flex items-center justify-between gap-3 h-16 ${wide ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl px-5 md:px-8"}`}>
        {/* Logo — gold Interlock lockup. Mark is enlarged for presence (48px →
            52px at lg) with the wordmark scaled to match; Logo is header-only so
            this does not affect the hero / footer / mobile marks. */}
        <Logo
          size="xl"
          markClassName="lg:size-13"
          wordmarkClassName="text-base lg:text-lg"
          tone="gold"
          withProtocolLabel
          withChapter
          onClick={() => setMobileOpen(false)}
        />

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
                it.to === "/registry"
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
                    {visibleGroupItems(g.items).map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        className="block rounded-[3px] px-3 py-2 text-xs hover:bg-muted border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors"
                        onClick={() => setOpenGroup(null)}
                      >
                        <div className="font-medium text-foreground">{navLabel(it)}</div>
                        {navHint(it) && <div className="mono mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">{navHint(it)}</div>}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action cluster — Bell · Avalanche pill · theme · reserved wallet+action
            zone · hamburger. The wallet+action zone is a FIXED-WIDTH reservation
            (per breakpoint) so the header occupies identical space whether
            disconnected, loading, or connected — no horizontal reflow, and it
            never overruns the overflow-x-hidden shell (which previously clipped
            "Buy More"). My Syndicate stays reachable from the wallet menu + drawer. */}
        <div className="flex items-center gap-1.5">
          <NotificationBell className="hidden sm:inline-flex" />
          <AvalancheNetworkPill />
          <ThemeToggle variant="icon" className="hidden md:inline-flex" />
          <div className="flex items-center justify-end gap-1.5 md:w-[244px] 2xl:w-[300px]">
            {/* Wallet slot — fixed width; Connect / Connect Wallet and the
                connected address chip fill it identically (no width swap). */}
            <div className="hidden md:flex items-center w-[96px] 2xl:w-[150px]">
              <HeaderWalletChip />
            </div>
            <Link
              to="/join"
              onClick={() =>
                track("join_cta_click", {
                  surface: "header",
                  cta: id.isMember ? "buy_more" : id.shouldShowBecomeMember ? "become_member" : "join",
                })
              }
              className="mono hidden sm:inline-flex items-center justify-center rounded-[3px] px-3.5 md:px-0 md:w-[140px] py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-[filter] hover:brightness-110 whitespace-nowrap"
              style={{
                background: "linear-gradient(135deg, #F5C94A 0%, #E3A92B 44%, #9E6412 100%)",
                color: "#15110A",
                boxShadow: "0 10px 30px -12px color-mix(in oklab, #E3A92B 60%, transparent)",
              }}
            >
              {/* Compact, fixed-width labels keep the gold button identical across
                  states (Join / Become Member / Buy More SYN). Full canon labels
                  stay on /join, the mobile drawer, and the MobileJoinBar. */}
              {id.primaryMembershipLabelShort}
            </Link>
          </div>
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
              onClick={() => { setMobileOpen(false); track("join_cta_click", { surface: "header_mobile", cta: id.isMember ? "buy_more" : id.shouldShowBecomeMember ? "become_member" : "join" }); }}
              className="mono flex w-full items-center justify-center gap-2 rounded-[3px] px-4 py-3 text-[12px] font-bold uppercase tracking-[0.18em]"
              style={{ background: "linear-gradient(135deg, #F5C94A 0%, #E3A92B 44%, #9E6412 100%)", color: "#15110A", boxShadow: "0 10px 30px -12px color-mix(in oklab, #E3A92B 60%, transparent)" }}
            >
              {id.isMember ? "Buy More SYN →" : id.shouldShowBecomeMember ? "Become a Syndicate Member →" : "Join The Syndicate →"}
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
                  {visibleGroupItems(g.items).map((it) => (
                    <Link
                      key={it.to}
                      to={it.to}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-[3px] px-3 py-2.5 hover:bg-muted border-l-2 border-transparent hover:border-[color:var(--accent)] transition-colors"
                    >
                      <div className="text-sm font-medium text-foreground">{navLabel(it)}</div>
                      {navHint(it) && <div className="mono mt-0.5 text-[11px] text-muted-foreground">{navHint(it)}</div>}
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
