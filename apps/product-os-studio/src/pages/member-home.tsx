import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MOCK_DATA } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { Shield, ArrowRight, Activity, Users, Search, GitCommit, Target, Zap, Clock, Coins, Network, CircleSlash, Workflow, Award, Flame, Wrench, Hammer } from "lucide-react";
import { MemberSigil } from "@/components/member-sigil";
import { ActionCard } from "@/components/action-card";
import { getActionsForRole } from "@/lib/actions";

export default function MemberHome() {
  const { isConnected, isSeated, isFounder } = useApp();
  const quickActions = getActionsForRole({ isConnected, isSeated, isFounder })
    .filter((a) => a.tier === "primary")
    .slice(0, 6);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Member Home</h1>
          <p className="text-muted-foreground text-lg">Your operating surface within The Syndicate.</p>
        </div>
        <div className="shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-mono whitespace-nowrap">
            Prototype surface · each module labeled below
          </span>
        </div>
      </motion.div>

      {/* Identity Strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-[auto_1fr_1fr_1fr_1fr] gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-background/80 backdrop-blur p-4 flex items-center justify-center col-span-2 md:col-span-1">
            <MemberSigil 
              seed={MOCK_DATA.walletFull} 
              memberNumber={MOCK_DATA.memberNumber} 
              chapter={MOCK_DATA.chapter} 
              size={56} 
            />
          </div>
          <div className="bg-background/80 backdrop-blur p-4 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Identity</div>
            <div className="font-mono text-sm sm:text-base font-bold text-primary">{MOCK_DATA.wallet}</div>
          </div>
          <div className="bg-background/80 backdrop-blur p-4 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Designation</div>
            <div className="font-mono text-sm sm:text-base font-bold">Member {MOCK_DATA.memberNumber}</div>
          </div>
          <div className="bg-background/80 backdrop-blur p-4 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Seat Status</div>
            {isSeated ? (
              <div className="flex items-center gap-2" data-testid="seat-status-held">
                <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
                <span className="font-bold text-sm sm:text-base">Seat Held</span>
              </div>
            ) : (
              <div className="flex items-center gap-2" data-testid="seat-status-none">
                <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                <span className="font-bold text-sm sm:text-base">No Seat Yet</span>
              </div>
            )}
          </div>
          <div className="bg-background/80 backdrop-blur p-4 flex flex-col justify-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Chapter</div>
            <div className="font-medium text-sm sm:text-base">{MOCK_DATA.chapter}</div>
          </div>
        </div>
      </motion.div>

      {/* Not-seated empty state */}
      {!isSeated && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <Card className="bg-amber-500/5 border-amber-500/20" data-testid="seat-empty-state">
            <CardContent className="p-6 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
                  <CircleSlash className="w-6 h-6" />
                </div>
                <div className="space-y-1.5 max-w-xl">
                  <h3 className="font-bold text-lg">No seat yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Your wallet is connected, but no seat is anchored to it. Take your seat to unlock your operating surface, capital footprint, and contribution depth within The Syndicate.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <Button asChild className="w-full md:w-auto" data-testid="btn-take-seat">
                  <Link href="/member/join">
                    Take your seat <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Key Metrics */}
        <motion.div 
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {quickActions.length > 0 && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-base flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-primary" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Actions available to you right now. Open the full Toolkit for every protocol action and proof surface.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action) => (
                    <ActionCard key={action.id} action={action} />
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" size="sm" data-testid="member-home-to-toolkit">
                    <Link href="/member/toolkit">
                      <Wrench className="w-4 h-4" /> Open the Toolkit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center">
                  <Target className="w-4 h-4 mr-2" /> Capital Footprint
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono text-foreground mb-1">{MOCK_DATA.usdcRouted.toLocaleString()} <span className="text-lg text-muted-foreground font-sans">USDC</span></div>
                <div className="text-xs text-muted-foreground">Cumulative volume routed through protocol</div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center">
                  <Coins className="w-4 h-4 mr-2" /> Contribution Depth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono text-primary mb-1">{MOCK_DATA.synAcquired.toLocaleString()} <span className="text-lg text-muted-foreground font-sans">SYN</span></div>
                <div className="text-xs text-muted-foreground">Accounting unit recognizing contribution depth</div>
              </CardContent>
            </Card>
          </div>

          {/* Doctrine / Status */}
          <Card className="bg-primary/5 border-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
              <Shield className="w-48 h-48 text-primary" />
            </div>
            <CardContent className="p-6 relative z-10">
              <div className="space-y-4 max-w-lg">
                <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Protocol Recognition
                </h3>
                <blockquote className="border-l-2 border-primary/50 pl-4 text-foreground/90 font-serif italic text-lg leading-relaxed">
                  "The Syndicate recognizes capital without reducing identity to capital."
                </blockquote>
                <p className="text-sm text-muted-foreground">
                  Your seat identity (binary) is secured. Your contribution depth (variable) dictates future access to candidate modules and structured products.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Loop */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
              <div>
                <CardTitle className="text-base flex items-center"><Clock className="w-4 h-4 mr-2" /> While You Were Away</CardTitle>
              </div>
              <Link href="/member/activity" className="text-xs text-primary hover:underline flex items-center">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              <div className="divide-y divide-white/5">
                {MOCK_DATA.activities.slice(0, 4).map(act => (
                  <div key={act.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${act.type === 'membership' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {act.type === 'membership' ? <Shield className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{act.title}</div>
                        <div className="text-xs text-muted-foreground">{act.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm">{act.value}</div>
                      <div className="text-[10px] text-green-500 uppercase tracking-wider">{act.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Navigation */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 px-1">Navigation Surfaces</div>
          
          <Link href="/member/join">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Expand Footprint</div>
                  <div className="text-xs text-muted-foreground">Acquire additional SYN</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/graph">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Workflow className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Protocol Graph</div>
                  <div className="text-xs text-muted-foreground">How every organ connects</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/recognition">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Award className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">Recognition</div>
                  <div className="text-xs text-muted-foreground">Multi-axis contribution</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/architecture">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Network className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">Architecture</div>
                  <div className="text-xs text-muted-foreground">Protocol smart contracts</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/evolution">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <GitCommit className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">Evolution</div>
                  <div className="text-xs text-muted-foreground">View protocol roadmap</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/my-syndicate">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Users className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">My Syndicate</div>
                  <div className="text-xs text-muted-foreground">Your network structure</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/transparency">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Search className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">Transparency</div>
                  <div className="text-xs text-muted-foreground">Verify global metrics</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/toolkit">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <Wrench className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-bold text-sm">Syndicate Toolkit</div>
                  <div className="text-xs text-muted-foreground">Every protocol action</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/fire">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                  <Flame className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <div className="font-bold text-sm">Fire Ledger</div>
                  <div className="text-xs text-muted-foreground">Proof of Fire — simulated</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-orange-400 transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

          <Link href="/member/workbench">
            <div className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                  <Hammer className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <div className="font-bold text-sm">Contributor Workbench</div>
                  <div className="text-xs text-muted-foreground">Propose contributions</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors group-hover:translate-x-1" />
            </div>
          </Link>

        </motion.div>
      </div>
    </div>
  );
}
