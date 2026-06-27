import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Shield, Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { PROOF_SURFACES } from "@/lib/surfaces";

// Public proof surfaces are open, read-only links — selecting one NEVER connects
// a wallet. Personal/member surfaces are reached via the connection-aware CTAs.
const PROOF_LINKS = PROOF_SURFACES;

export function PublicHeader() {
  const { connect, isConnected, theme, toggleTheme } = useApp();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleConnect = () => {
    connect();
    setLocation("/member");
    setMobileMenuOpen(false);
  };

  const goJoin = () => {
    connect();
    setLocation("/member/join");
    setMobileMenuOpen(false);
  };

  const goMember = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    if (location !== "/") {
      setLocation("/");
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    } else {
      const el = document.getElementById(targetId);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
    setMobileMenuOpen(false);
  };

  const linkClass = (path: string) =>
    `transition-colors ${location === path ? "text-foreground" : "hover:text-foreground"}`;

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <a href="/" onClick={(e) => handleNavClick(e, "home")} className="flex items-center gap-2 font-bold tracking-tight z-50" data-testid="link-logo">
          <Shield className="w-5 h-5 text-primary" />
          <span>THE SYNDICATE</span>
        </a>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-muted-foreground flex-wrap justify-center flex-1 px-8">
          {/* Public proof menu — open, read-only, never auto-connects. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors" data-testid="nav-proof">
                Proof <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72" data-testid="proof-menu">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Public proof · read-only · no wallet
              </DropdownMenuLabel>
              {PROOF_LINKS.map((s) => (
                <DropdownMenuItem key={s.id} asChild>
                  <Link href={s.publicPath} onClick={() => setMobileMenuOpen(false)} data-testid={`proof-${s.id}`}>
                    <s.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className="flex-1">{s.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <a href="/#journey" onClick={(e) => handleNavClick(e, "journey")} className="hover:text-foreground transition-colors" data-testid="nav-journey">Journey</a>
          <Link href="/learn" onClick={() => setMobileMenuOpen(false)} className={linkClass("/learn")} data-testid="nav-learn">Docs</Link>
          <Link href="/share" onClick={() => setMobileMenuOpen(false)} className={linkClass("/share")} data-testid="nav-share">Share</Link>
          <Link href="/press" onClick={() => setMobileMenuOpen(false)} className={linkClass("/press")} data-testid="nav-press">Press</Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 hover:text-foreground transition-colors" data-testid="nav-more">
                More <ChevronDown className="w-3 h-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64" data-testid="more-menu">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Official channels
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href="https://x.com/TheSyndicateOne" target="_blank" rel="noreferrer" data-testid="more-x">
                  X (Twitter) <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="https://t.me/TheSyndicateMoney" target="_blank" rel="noreferrer" data-testid="more-telegram">
                  Telegram <ExternalLink className="w-3.5 h-3.5 ml-auto" />
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Member app
              </DropdownMenuLabel>
              <DropdownMenuItem onClick={isConnected ? () => goMember("/member") : handleConnect} data-testid="more-enter-app">
                {isConnected ? "Enter the app" : "Connect wallet to enter"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center gap-3 z-50">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="btn-theme">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {isConnected ? (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => goMember("/member/my-syndicate")} data-testid="btn-my-syndicate">My Syndicate</Button>
              <Button onClick={() => goMember("/member")} data-testid="btn-enter-app">Enter app</Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={goJoin} data-testid="btn-join">Join</Button>
              <Button onClick={handleConnect} data-testid="btn-connect">Connect Wallet</Button>
            </div>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="btn-mobile-menu">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-background border-t border-white/5 lg:hidden overflow-y-auto z-40 p-4">
          <div className="flex flex-col gap-4 text-lg font-medium">
            {isConnected ? (
              <>
                <button onClick={() => goMember("/member/my-syndicate")} className="text-left py-3 border-b border-white/5" data-testid="mobile-nav-mysyndicate">My Syndicate</button>
                <button onClick={() => goMember("/member")} className="text-left py-3 border-b border-white/5" data-testid="mobile-nav-enter">Enter the app</button>
              </>
            ) : (
              <>
                <button onClick={goJoin} className="text-left py-3 border-b border-white/5" data-testid="mobile-nav-join">Join</button>
                <button onClick={handleConnect} className="text-left py-3 border-b border-white/5" data-testid="mobile-nav-connect">Connect Wallet</button>
              </>
            )}

            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Public proof · read-only</div>
              <div className="flex flex-col">
                {PROOF_LINKS.map((s) => (
                  <Link key={s.id} href={s.publicPath} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2.5 py-2.5 border-b border-white/5 text-base text-muted-foreground" data-testid={`mobile-proof-${s.id}`}>
                    <s.icon className="w-4 h-4" />
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>

            <a href="/#journey" onClick={(e) => handleNavClick(e, "journey")} className="py-3 border-b border-white/5" data-testid="mobile-nav-journey">Journey</a>
            <Link href="/learn" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-white/5" data-testid="mobile-nav-learn">Docs</Link>
            <Link href="/press" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-white/5" data-testid="mobile-nav-press">Press</Link>
            <Link href="/share" onClick={() => setMobileMenuOpen(false)} className="py-3 border-b border-white/5" data-testid="mobile-nav-share">Proof &amp; Share</Link>

            <div className="pt-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-2">Official channels</div>
              <a href="https://x.com/TheSyndicateOne" target="_blank" rel="noreferrer" className="flex items-center py-2.5 border-b border-white/5 text-base" data-testid="mobile-more-x">
                X (Twitter) <ExternalLink className="w-4 h-4 ml-2" />
              </a>
              <a href="https://t.me/TheSyndicateMoney" target="_blank" rel="noreferrer" className="flex items-center py-2.5 border-b border-white/5 text-base" data-testid="mobile-more-telegram">
                Telegram <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="pt-4 sm:hidden">
              {isConnected ? (
                <Button onClick={() => goMember("/member")} className="w-full" size="lg" data-testid="btn-mobile-enter">Enter the app</Button>
              ) : (
                <Button onClick={handleConnect} className="w-full" size="lg" data-testid="btn-mobile-connect">Connect Wallet</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
