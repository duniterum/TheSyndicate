import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareDialog, type SharePayload } from "@/components/share-dialog";
import { MOCK_DATA, routeUsdc } from "@/lib/mock-data";
import { RETURN_SURFACE } from "@/lib/protocol-graph";
import { useApp } from "@/lib/store";
import { WalletStatePanel } from "@/components/wallet/wallet-state-panel";
import { Link } from "wouter";
import {
  ArrowRight,
  Activity,
  FileText,
  Box,
  ShieldCheck,
  Layers,
  Fingerprint,
  Wallet,
  Hash,
  Clock,
  Eye,
  EyeOff,
  Share2,
} from "lucide-react";

function maskWallet(full: string) {
  return `0x${"\u2022".repeat(4)}\u2026${"\u2022".repeat(4)}`;
}

export default function MySyndicate() {
  const { maskAddress, hideBalance } = useApp();
  const routing = routeUsdc(MOCK_DATA.usdcRouted);

  const fmtNum = (n: number, suffix: string) =>
    hideBalance ? `\u2022\u2022\u2022\u2022\u2022 ${suffix}` : `${n.toLocaleString()} ${suffix}`;

  const walletDisplay = maskAddress ? maskWallet(MOCK_DATA.walletFull) : MOCK_DATA.wallet;

  const routedDisplay = hideBalance ? "Private" : `${MOCK_DATA.usdcRouted} USDC`;

  const memberProof: SharePayload = {
    title: `Member ${MOCK_DATA.memberNumber} · The Syndicate`,
    summary: `Seat held in ${MOCK_DATA.chapter}`,
    lines: [
      { label: "Seat", value: "Held" },
      { label: "Member", value: MOCK_DATA.memberNumber },
      { label: "Chapter", value: MOCK_DATA.chapter },
      { label: "USDC Routed", value: hideBalance ? "Private" : `${MOCK_DATA.usdcRouted} (70% / 20% / 10%)` },
    ],
    shareText: `I hold a seat in The Syndicate — Member ${MOCK_DATA.memberNumber}, ${MOCK_DATA.chapter}. ${routedDisplay} routed transparently (70% Vault / 20% Liquidity / 10% Operations). A living on-chain institution.`,
  };

  const { sinceYouJoined, sinceYouWereAway } = RETURN_SURFACE;

  const journeyProof: SharePayload = {
    eyebrow: "The Syndicate · Since you joined",
    title: `Member ${MOCK_DATA.memberNumber} — the journey`,
    summary: `What has become true since taking a seat in ${MOCK_DATA.chapter}.`,
    accent: "emerald",
    lines: sinceYouJoined.map((i) => ({ label: i.label, value: i.value })),
    shareText: `Since I joined The Syndicate (Member ${MOCK_DATA.memberNumber}, ${MOCK_DATA.chapter}), the institution kept moving — recorded and verifiable. A living on-chain institution.`,
  };

  const routingLegend = [
    { name: "Vault", value: routing.vault, pct: 70, tint: "text-blue-400", bar: "bg-blue-500/70" },
    { name: "Liquidity", value: routing.liquidity, pct: 20, tint: "text-emerald-400", bar: "bg-emerald-500/70" },
    { name: "Operations", value: routing.operations, pct: 10, tint: "text-purple-400", bar: "bg-purple-500/70" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Syndicate</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Your return surface. Proof of seat, capital footprint, and recognition since you joined.
            Read your standing, then take the next useful action.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <ShareDialog
            payload={memberProof}
            trigger={
              <Button variant="outline" size="sm" data-testid="btn-share-proof">
                <Share2 className="w-4 h-4" /> Share Proof
              </Button>
            }
          />
          <StatusBadge status="LIVE NOW" />
        </div>
      </div>

      {/* Doctrine */}
      <div className="p-5 border border-white/10 bg-white/5 rounded-xl text-center">
        <p className="font-serif text-lg tracking-wide text-muted-foreground">
          "The Syndicate recognizes capital without reducing identity to capital."
        </p>
      </div>

      {/* Seat + capital summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat / identity */}
        <Card className="bg-white/5 border-white/10 lg:col-span-2">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Seat & Identity
              </CardTitle>
              {(maskAddress || hideBalance) && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-muted-foreground border-white/10 bg-white/5 gap-1">
                  <EyeOff className="w-3 h-3" /> Privacy on
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Seat Status
                </span>
                <span className="font-medium text-green-500 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Seat Held
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Member Number
                </span>
                <span className="font-bold text-lg" data-testid="profile-member-num">{MOCK_DATA.memberNumber}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Chapter
                </span>
                <span className="font-medium">{MOCK_DATA.chapter}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/5">
                <span className="text-muted-foreground text-sm flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Wallet
                </span>
                <span className="font-mono text-primary" data-testid="profile-wallet">{walletDisplay}</span>
              </div>
              <div className="flex items-center justify-between py-3 sm:border-b border-white/5">
                <span className="text-muted-foreground text-sm">Contribution Depth</span>
                <span className="font-medium">{MOCK_DATA.contributionDepth}</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b sm:border-b border-white/5">
                <span className="text-muted-foreground text-sm">Capital Footprint</span>
                <span className="font-mono">{fmtNum(MOCK_DATA.usdcRouted, "USDC")}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Seat identity is binary — held or not held. Contribution depth is variable. Capital footprint is verified USDC routed through receipts.
            </p>
          </CardContent>
        </Card>

        {/* Balances */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">SYN Acquired</div>
              <div className="text-3xl font-bold font-mono tracking-tight mt-1">{fmtNum(MOCK_DATA.synAcquired, "SYN")}</div>
              <p className="text-xs text-muted-foreground mt-2">Accounting unit. Not a yield instrument, not a financial right.</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">USDC Routed</div>
              <div className="text-3xl font-bold font-mono tracking-tight mt-1 text-primary">{fmtNum(MOCK_DATA.usdcRouted, "USDC")}</div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                {hideBalance ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                Routed through receipts, 70% / 20% / 10%.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Real wallet reality layer — SEPARATE from the simulated seat & balances above */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Real wallet (read-only)
        </h2>
        <p className="text-xs text-muted-foreground max-w-2xl">
          Your real wallet, read-only and clearly separate from the simulated seat, balances, and receipts
          above. Connect to read your live SYN balance through your own provider — nothing here is wired to
          write or move funds.
        </p>
        <WalletStatePanel />
      </div>

      {/* Routing proof + Recognition axes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Routing proof */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Routing Proof
              </CardTitle>
              <StatusBadge status="READ-ONLY" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs text-muted-foreground">
              Your {MOCK_DATA.usdcRouted} USDC, split by the canonical 70% / 20% / 10% routing.
            </p>
            <div className="space-y-3">
              {routingLegend.map((seg) => (
                <div key={seg.name} className="space-y-1" data-testid={`routing-${seg.name}`}>
                  <div className="flex justify-between text-sm">
                    <span className={`font-medium ${seg.tint}`}>{seg.name} ({seg.pct}%)</span>
                    <span className="font-mono">{hideBalance ? "\u2022\u2022\u2022\u2022" : `${seg.value} USDC`}</span>
                  </div>
                  <div className="h-1.5 bg-background/50 rounded-full overflow-hidden border border-white/5">
                    <div className={`h-full ${seg.bar} transition-all duration-1000`} style={{ width: `${seg.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/member/transparency" className="inline-block w-full">
              <Button variant="outline" className="w-full justify-between group">
                View Full Economy Proof
                <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recognition axes */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" />
                Recognition Axes
              </CardTitle>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground">
              Eleven dimensions of standing. Multi-axis recognition, not a pay-to-win ladder. These reflect contribution, not financial rights.
            </p>
            <div className="space-y-2.5">
              {MOCK_DATA.recognitionAxes.map((axis) => (
                <div key={axis.name} className="space-y-1" data-testid={`axis-${axis.name}`} title={axis.note}>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">{axis.name}</span>
                    <span className="font-mono">{axis.level}</span>
                  </div>
                  <div className="h-1.5 bg-background/50 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-primary/80 transition-all duration-1000" style={{ width: `${axis.level}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Receipts */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Receipts
            </CardTitle>
            <StatusBadge status="READ-ONLY" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {MOCK_DATA.receipts.sampleReceipts.map((rcpt) => (
              <div key={rcpt.id} className="p-4 bg-background/40 rounded-lg border border-white/5 space-y-2" data-testid={`receipt-${rcpt.id}`}>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-primary">{rcpt.amount}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{rcpt.timestamp}</span>
                </div>
                <div className="text-xs text-muted-foreground">{rcpt.routing}</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="font-mono text-xs text-muted-foreground flex items-center gap-1 min-w-0">
                    <span className="truncate">{rcpt.hash}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 shrink-0">· simulated</span>
                  </div>
                  <ShareDialog
                    payload={{
                      title: "Membership Receipt",
                      summary: `${rcpt.amount} routed through The Syndicate`,
                      lines: [
                        { label: "Amount", value: rcpt.amount },
                        { label: "Routing", value: "70% / 20% / 10%" },
                        { label: "Proof", value: rcpt.hash },
                        { label: "When", value: rcpt.timestamp },
                      ],
                      shareText: `Verified membership in The Syndicate — ${rcpt.amount} routed transparently (70% Vault / 20% Liquidity / 10% Operations). A living on-chain institution.`,
                    }}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Share receipt proof" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground" data-testid={`share-receipt-${rcpt.id}`}>
                        <Share2 className="w-3.5 h-3.5" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">
            Simulated prototype. Explorer links are illustrative — no live transactions.
          </p>
        </CardContent>
      </Card>

      {/* Return loop: since you were away / since you joined */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-primary" /> Since You Were Away
              </CardTitle>
              <StatusBadge status="SIMULATED PROTOTYPE" />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {sinceYouWereAway.map((item) => (
              <Link
                key={item.label}
                href={item.surface}
                className="flex justify-between items-center gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0 group"
                data-testid={`away-${item.label}`}
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <span className="font-mono text-xs flex items-center gap-1 shrink-0">
                  {item.value}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-primary" /> Since You Joined
              </CardTitle>
              <ShareDialog
                payload={journeyProof}
                trigger={
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground" data-testid="btn-share-journey">
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </Button>
                }
              />
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {sinceYouJoined.map((item) => (
              <Link
                key={item.label}
                href={item.surface}
                className="flex justify-between items-center gap-3 text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0 group"
                data-testid={`joined-${item.label}`}
              >
                <span className="text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                <span className="font-mono text-xs flex items-center gap-1 shrink-0">
                  {item.value}
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Archive / memory */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Box className="w-5 h-5 text-primary" /> Archive & Memory Holdings
            </CardTitle>
            <Link href="/member/archive" className="text-xs text-primary hover:underline">View Archive</Link>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_DATA.archiveItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm bg-background/40 p-4 rounded-lg border border-white/5">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1">{item.date}</div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider border-white/10 bg-white/5 shrink-0">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4">
            Archive artifacts are memory, not financial rights.
          </p>
        </CardContent>
      </Card>

      {/* Future SeatRecord */}
      <Card className="bg-transparent border border-white/10 border-dashed">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-3">
              SeatRecord721 Identity <StatusBadge status="FUTURE" />
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xl">
              Future identity layer. A planned record of seat, multi-axis contribution, tenure, and verified introduction history. Not built yet — preview the spec only.
            </p>
          </div>
          <Link href="/member/seat-record">
            <Button variant="secondary">Preview Identity Spec</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Next actions */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg">Next Useful Actions</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/member/join">
            <Button variant="outline" className="w-full justify-between group h-auto py-3 flex-col items-start">
              <span className="font-medium">Deepen Contribution</span>
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                Route more capital <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Link href="/member/transparency">
            <Button variant="outline" className="w-full justify-between group h-auto py-3 flex-col items-start">
              <span className="font-medium">Verify Economy</span>
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                See full routing proof <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
          <Link href="/member/archive">
            <Button variant="outline" className="w-full justify-between group h-auto py-3 flex-col items-start">
              <span className="font-medium">Visit Archive</span>
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                Review memory holdings <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
