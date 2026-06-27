import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { AppProvider, useApp } from "./lib/store";
import { PublicHeader } from "./components/public-header";
import { PublicFooter } from "./components/public-footer";
import { NotificationCenter } from "./components/notification-center";
import PublicHome from "./pages/public-home";

import { Moon, Sun, Menu, X, Shield, ShieldCheck, Lock, Copy, LogOut, ChevronDown, Users, Wallet, Settings as SettingsIcon, Share2, ArrowRight, Eye } from "lucide-react";
import { useState, createElement } from "react";
import { Button } from "./components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./components/ui/dropdown-menu";

import MemberHome from "./pages/member-home";
import Join from "./pages/join";
import MySyndicate from "./pages/my-syndicate";
import WalletPage from "./pages/wallet";
import ActivityPage from "./pages/activity";
import Transparency from "./pages/transparency";
import Registry from "./pages/registry";
import Evolution from "./pages/evolution";
import Referral from "./pages/referral";
import Archive from "./pages/archive";
import SeatRecord from "./pages/seat-record";
import FounderReview from "./pages/founder-review";
import SettingsPage from "./pages/settings";
import Architecture from "./pages/architecture";
import Chronicle from "./pages/chronicle";
import Recognition from "./pages/recognition";
import ProtocolGraph from "./pages/protocol-graph";
import Learn from "./pages/learn";
import Press from "./pages/press";
import Share from "./pages/share";
import Toolkit from "./pages/toolkit";
import Fire from "./pages/fire";
import Workbench from "./pages/workbench";

// Public proof layer (read-only, no wallet).
import PublicActivity from "./pages/public-activity";
import PublicEconomy from "./pages/public-economy";
import PublicRegistry from "./pages/public-registry";
import PublicEvolution from "./pages/public-evolution";
import PublicChronicle from "./pages/public-chronicle";
import PublicArchive from "./pages/public-archive";
import PublicRecognition from "./pages/public-recognition";
import PublicReferralStatus from "./pages/public-referral-status";
import PublicToolkit from "./pages/public-toolkit";
import PublicFire from "./pages/public-fire";

import { MOCK_DATA } from "./lib/mock-data";
import { MemberSigil } from "./components/member-sigil";
import { MEMBER_NAV } from "./lib/navigation";
import { PROOF_SURFACES, getSurfaceByMemberPath } from "./lib/surfaces";
import { Protected } from "./components/role-gate";
import { useToast } from "@/hooks/use-toast";

// Path -> page component. Member routes are generated from MEMBER_NAV so a
// surface's access requirement (sidebar) and its route guard can never drift.
const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  "/member": MemberHome,
  "/member/join": Join,
  "/member/my-syndicate": MySyndicate,
  "/member/toolkit": Toolkit,
  "/member/wallet": WalletPage,
  "/member/activity": ActivityPage,
  "/member/transparency": Transparency,
  "/member/registry": Registry,
  "/member/evolution": Evolution,
  "/member/chronicle": Chronicle,
  "/member/archive": Archive,
  "/member/recognition": Recognition,
  "/member/fire": Fire,
  "/member/workbench": Workbench,
  "/member/referral": Referral,
  "/member/seat-record": SeatRecord,
  "/member/graph": ProtocolGraph,
  "/member/architecture": Architecture,
  "/member/settings": SettingsPage,
  "/member/founder-review": FounderReview,
};

// publicPath -> public page component. Generated routes pair with PROOF_SURFACES.
const PUBLIC_PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  "/activity": PublicActivity,
  "/economy": PublicEconomy,
  "/registry": PublicRegistry,
  "/recognition": PublicRecognition,
  "/referral-status": PublicReferralStatus,
  "/evolution": PublicEvolution,
  "/chronicle": PublicChronicle,
  "/archive": PublicArchive,
  "/fire": PublicFire,
};

const MEMBER_ROUTES = MEMBER_NAV.flatMap((g) => g.items);

// Dev guard: keep the single sources of truth honest. Every navigation/surface
// entry must have a page component, or route generation calls createElement(undefined).
if (import.meta.env.DEV) {
  for (const item of MEMBER_ROUTES) {
    if (!PAGE_COMPONENTS[item.path]) {
      // eslint-disable-next-line no-console
      console.error(`[navigation] Missing PAGE_COMPONENTS entry for "${item.path}"`);
    }
  }
  for (const surface of PROOF_SURFACES) {
    if (!PUBLIC_PAGE_COMPONENTS[surface.publicPath]) {
      // eslint-disable-next-line no-console
      console.error(`[surfaces] Missing PUBLIC_PAGE_COMPONENTS entry for "${surface.publicPath}"`);
    }
  }
}

function isMemberLocation(location: string) {
  return location === "/member" || location.startsWith("/member/");
}

function AccountMenu({ onDisconnect }: { onDisconnect: () => void }) {
  const { isSeated, isFounder } = useApp();
  const { toast } = useToast();

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_DATA.walletFull);
      toast({ title: "Address copied", description: "Full wallet address copied to clipboard." });
    } catch {
      toast({
        title: "Copy unavailable",
        description: "Clipboard access was blocked by the browser.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono hover:bg-white/10 transition-colors"
          data-testid="account-menu-trigger"
        >
          <MemberSigil seed={MOCK_DATA.walletFull} memberNumber={MOCK_DATA.memberNumber} chapter={MOCK_DATA.chapter} size={24} />
          <span className="text-primary ml-1">{MOCK_DATA.memberNumber}</span>
          <span className="text-muted-foreground">|</span>
          <span className="pr-0.5">{MOCK_DATA.chapter}</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72" data-testid="account-menu">
        <div className="px-2 py-2.5">
          <div className="flex items-center gap-3">
            <MemberSigil seed={MOCK_DATA.walletFull} memberNumber={MOCK_DATA.memberNumber} chapter={MOCK_DATA.chapter} size={36} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">Member {MOCK_DATA.memberNumber}</div>
              <div className="text-xs font-mono text-muted-foreground truncate">{MOCK_DATA.wallet}</div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{MOCK_DATA.chapter}</span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono uppercase tracking-wider ${
                isSeated
                  ? "border-green-500/20 bg-green-500/10 text-green-500"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
              data-testid="account-seat-status"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isSeated ? "bg-green-500" : "bg-amber-400"}`} />
              {isSeated ? "Seat held" : "No seat"}
            </span>
          </div>
          {isFounder && (
            <div className="mt-2 rounded-md border border-primary/20 bg-primary/5 px-2 py-1 text-[10px] uppercase tracking-wider text-primary flex items-center gap-1.5" data-testid="account-operator-indicator">
              <ShieldCheck className="h-3 w-3" /> Operator mode (simulated)
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} data-testid="account-copy">
          <Copy className="h-4 w-4 mr-2" /> Copy address
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/member/my-syndicate" data-testid="account-my-syndicate">
            <Users className="h-4 w-4 mr-2" /> My Syndicate
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/member/wallet" data-testid="account-wallet">
            <Wallet className="h-4 w-4 mr-2" /> Wallet
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/member/my-syndicate" data-testid="account-share">
            <Share2 className="h-4 w-4 mr-2" /> Share my proof
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/member/settings" data-testid="account-settings">
            <SettingsIcon className="h-4 w-4 mr-2" /> Settings
          </Link>
        </DropdownMenuItem>

        {isFounder && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Operator
            </DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/member/founder-review" data-testid="account-founder-console">
                <Shield className="h-4 w-4 mr-2" /> Founder Console
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onDisconnect} data-testid="account-disconnect">
          <LogOut className="h-4 w-4 mr-2" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Connect gate shown when a disconnected visitor hits a /member route. It points
// them at the public proof equivalent (if any) instead of dead-ending.
function ConnectGate({ location, onConnect }: { location: string; onConnect: () => void }) {
  const surface = getSurfaceByMemberPath(location);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center pt-24" data-testid="connect-gate">
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold">Connect to view your personal view</h2>
        <p className="text-muted-foreground leading-relaxed">
          This is a member-personal surface — your own seat, receipts, and data. Connecting your
          wallet is simulated in this prototype. Public proof is open to everyone, no wallet required.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onConnect} data-testid="btn-connect-gate">Connect Wallet</Button>
        {surface && (
          <Link href={surface.publicPath}>
            <Button variant="outline" data-testid="link-public-equivalent">
              <Eye className="w-4 h-4" /> See public {surface.label} proof
            </Button>
          </Link>
        )}
        <Link href="/">
          <Button variant="ghost" data-testid="link-back-home">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

function PublicNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4 text-center pt-24">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Page not found</h2>
        <p className="text-muted-foreground max-w-md">
          This page doesn't exist. Explore the public proof layer or return home.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/activity">
          <Button variant="outline" data-testid="notfound-proof">
            View public proof <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Link href="/">
          <Button variant="ghost" data-testid="notfound-home">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

function MemberShell() {
  const { disconnect, theme, toggleTheme, isFounder, isSeated } = useApp();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleDisconnect = () => {
    disconnect();
    setMobileMenuOpen(false);
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/30">
      {/* Mobile Header */}
      <div className="md:hidden h-16 border-b flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur z-50">
        <div className="flex items-center gap-2 font-bold tracking-tight">
          <Shield className="w-5 h-5 text-primary" />
          <span>THE SYNDICATE</span>
        </div>
        <div className="flex items-center gap-1">
          <NotificationCenter />
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="btn-theme-mobile">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} data-testid="btn-menu-toggle">
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-[100dvh] w-64 border-r bg-card/50 backdrop-blur z-40 transform transition-transform duration-200 ease-in-out ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="h-16 hidden md:flex items-center gap-2 px-6 font-bold tracking-tight border-b">
          <Shield className="w-5 h-5 text-primary" />
          <span>THE SYNDICATE</span>
        </div>

        {/* Mobile identity / account strip */}
        <div className="md:hidden px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <MemberSigil seed={MOCK_DATA.walletFull} memberNumber={MOCK_DATA.memberNumber} chapter={MOCK_DATA.chapter} size={32} />
            <div className="min-w-0">
              <div className="text-sm font-semibold">Member {MOCK_DATA.memberNumber}</div>
              <div className="text-xs font-mono text-muted-foreground truncate">{MOCK_DATA.wallet}</div>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider">
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${isSeated ? "border-green-500/20 bg-green-500/10 text-green-500" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isSeated ? "bg-green-500" : "bg-amber-400"}`} />
              {isSeated ? "Seat held" : "No seat"}
            </span>
            {isFounder && (
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary">
                <ShieldCheck className="h-3 w-3" /> Operator
              </span>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-5 overflow-y-auto h-[calc(100dvh-4rem)]">
          {MEMBER_NAV.map((group) => {
            const visibleItems = group.items.filter((item) => item.requirement !== "founder" || isFounder);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.label} className="space-y-1">
                <div className="px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                  {group.label}
                </div>
                {visibleItems.map((item) => {
                  const isActive = location === item.path;
                  const locked = item.requirement === "seated" && !isSeated;
                  return (
                    <Link key={item.path} href={item.path} onClick={() => setMobileMenuOpen(false)}>
                      <div
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : locked
                            ? "text-muted-foreground/50 hover:bg-white/5 hover:text-muted-foreground"
                            : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                        }`}
                        title={locked ? "Requires a seat" : undefined}
                        data-testid={`nav-${item.path}`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span className="flex-1 truncate">{item.name}</span>
                        {locked && <Lock className="w-3 h-3 shrink-0 opacity-70" />}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
          <div className="md:hidden pt-4 mt-4 border-t border-white/10">
            <button
              onClick={handleDisconnect}
              data-testid="btn-disconnect-mobile"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 sticky top-0 bg-background/80 backdrop-blur z-30 hidden md:flex">
          <div className="flex items-center gap-4">
            <AccountMenu onDisconnect={handleDisconnect} />
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Switch>
            {MEMBER_ROUTES.map((item) => (
              <Route key={item.path} path={item.path}>
                <Protected requirement={item.requirement}>
                  {createElement(PAGE_COMPONENTS[item.path])}
                </Protected>
              </Route>
            ))}
            <Route>
              <div className="pt-32 text-center">
                <h2 className="text-2xl font-bold">Page Not Found</h2>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function PublicShell() {
  const { isConnected, connect } = useApp();
  const [location] = useLocation();
  const onMemberPath = isMemberLocation(location);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground selection:bg-primary/30">
      <PublicHeader />
      <main>
        {onMemberPath && !isConnected ? (
          <ConnectGate location={location} onConnect={connect} />
        ) : (
          <Switch>
            <Route path="/" component={PublicHome} />
            <Route path="/learn" component={Learn} />
            <Route path="/press" component={Press} />
            <Route path="/share" component={Share} />
            <Route path="/toolkit" component={PublicToolkit} />
            {PROOF_SURFACES.map((s) => (
              <Route key={s.publicPath} path={s.publicPath}>
                {createElement(PUBLIC_PAGE_COMPONENTS[s.publicPath])}
              </Route>
            ))}
            <Route>
              <PublicNotFound />
            </Route>
          </Switch>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}

// Path-first routing: /member* renders the member shell when connected, the
// connect gate when not. Everything else renders the public shell (which serves
// the public proof layer), so public proof is never swallowed by a login wall.
function AppShell() {
  const { isConnected } = useApp();
  const [location] = useLocation();

  if (isMemberLocation(location) && isConnected) {
    return <MemberShell />;
  }
  return <PublicShell />;
}

import { Toaster } from "@/components/ui/toaster";
import { MotionConfig } from "framer-motion";

function MotionGate({ children }: { children: React.ReactNode }) {
  const { reducedMotion } = useApp();
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      {children}
    </MotionConfig>
  );
}

function App() {
  return (
    <AppProvider>
      <MotionGate>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppShell />
        </WouterRouter>
        <Toaster />
      </MotionGate>
    </AppProvider>
  );
}

export default App;
