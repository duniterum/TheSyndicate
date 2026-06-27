import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { BRAND } from "@/lib/brand";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Megaphone,
  Palette,
  Type,
  Image as ImageIcon,
  Radio,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Shield,
  ScrollText,
  Share2,
  AlertTriangle,
  Mail,
} from "lucide-react";

const NAV = [
  { id: "about", label: "About" },
  { id: "brand", label: "Brand" },
  { id: "previews", label: "Previews" },
  { id: "og", label: "Social" },
  { id: "channels", label: "Channels" },
  { id: "facts", label: "Facts" },
  { id: "language", label: "Language" },
  { id: "usage", label: "Usage" },
];

function CopyLine({ label, text, testid }: { label: string; text: string; testid: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied", { description: `${label} copied to clipboard.` });
      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy");
    }
  };
  return (
    <div className="rounded-lg border border-white/10 bg-background/40 p-4 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/70">{label}</span>
        <Button variant="ghost" size="sm" className="h-7" onClick={copy} data-testid={testid}>
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}

function Heading({
  id,
  icon: Icon,
  title,
  badge,
}: {
  id: string;
  icon: typeof Megaphone;
  title: string;
  badge?: React.ComponentProps<typeof StatusBadge>["status"];
}) {
  return (
    <div id={id} className="flex items-center justify-between scroll-mt-24">
      <h2 className="text-xl font-bold flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-primary" />
        {title}
      </h2>
      {badge && <StatusBadge status={badge} />}
    </div>
  );
}

export default function Press() {
  return (
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-5xl space-y-14">
      {/* Intro */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <Megaphone className="w-3.5 h-3.5 text-primary" /> Press · Media · Brand Kit
          </span>
          <StatusBadge status="PROTOTYPE ONLY" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Press &amp; brand kit</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
            Everything media, partners, and members need to represent The Syndicate consistently —
            descriptions, brand system, official channels, what is live versus not, and the language
            that keeps the institution honest.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {NAV.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:border-white/20 transition-colors"
              data-testid={`press-nav-${s.id}`}
            >
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* About / descriptions */}
      <section className="space-y-5">
        <Heading id="about" icon={ScrollText} title="Descriptions" />
        <div className="space-y-3">
          <CopyLine label="One-line" text={BRAND.descriptions.oneLine} testid="copy-oneline" />
          <CopyLine label="Short" text={BRAND.descriptions.short} testid="copy-short" />
          <CopyLine label="Long" text={BRAND.descriptions.long} testid="copy-long" />
        </div>
        <p className="font-serif text-lg text-muted-foreground border-l-2 border-primary/40 pl-4">
          "{BRAND.doctrine}"
        </p>
      </section>

      {/* Brand system */}
      <section className="space-y-5">
        <Heading id="brand" icon={Palette} title="Brand system" />

        {/* Logo / mark */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mark &amp; wordmark</div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "#FF3C00" }}>
                  <Shield className="h-5 w-5 text-white" />
                </span>
                <span className="font-bold tracking-tight text-lg">THE SYNDICATE</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold tracking-tight">In-app lockup</span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">
              Brand note: the icon / social mark uses Signal Orange (#FF3C00) while the product
              interface accent is Protocol Blue. Both are shown honestly — the prototype does not
              recolor the in-app accent to match the mark.
            </p>
          </CardContent>
        </Card>

        {/* Palette */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Palette</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BRAND.palette.map((c) => (
                <div key={`${c.name}-${c.role}`} className="rounded-lg border border-white/10 overflow-hidden bg-background/40">
                  <div className="h-12 w-full" style={{ backgroundColor: c.css }} />
                  <div className="p-2.5 space-y-0.5">
                    <div className="text-xs font-medium">{c.name}</div>
                    <div className="text-[10px] text-muted-foreground/70">{c.role}</div>
                    <div className="text-[10px] font-mono text-muted-foreground">{c.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Type className="w-4 h-4" /> Typography
            </div>
            {BRAND.typography.map((t) => (
              <div key={t.role} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                <div>
                  <span className="text-sm font-medium">{t.family}</span>
                  <span className="text-xs text-muted-foreground ml-2">{t.role}</span>
                </div>
                <span className="text-xs text-muted-foreground/70">{t.note}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Status labels */}
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status &amp; proof labels</div>
            <div className="flex flex-wrap gap-2">
              {BRAND.statusColors.map((s) => (
                <StatusBadge key={s.label} status={s.label as React.ComponentProps<typeof StatusBadge>["status"]} />
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/70">
              Every claim about a module must carry its status. Live, read-only, in review, candidate,
              future, and simulated are color-coded consistently across the OS.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Product previews */}
      <section className="space-y-5">
        <Heading id="previews" icon={ImageIcon} title="Product previews" badge="STATIC PREVIEW" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BRAND.assets.map((a) => (
            <div key={a.file} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden" data-testid={`asset-${a.file}`}>
              <div className="aspect-video bg-background/50 flex items-center justify-center overflow-hidden">
                <img src={a.file} alt={a.label} className="w-full h-full object-contain" loading="lazy" />
              </div>
              <div className="p-3 space-y-0.5">
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-[11px] text-muted-foreground/70">{a.note}</div>
                <div className="text-[10px] font-mono text-muted-foreground/50">{a.file}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          These are the brand image assets currently shipped in the prototype. Full product
          screenshots and hi-res logo variants are not yet packaged — see "what would require
          production" in the docs.
        </p>
      </section>

      {/* OG / social previews */}
      <section className="space-y-5">
        <Heading id="og" icon={Share2} title="Social / OG previews" badge="CONCEPT ONLY" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BRAND.ogPreviews.map((o) => (
            <div key={o.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-start justify-between gap-3" data-testid={`og-${o.id}`}>
              <div>
                <div className="text-sm font-medium">{o.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.desc}</div>
              </div>
              <StatusBadge status={o.status} showTooltip={false} />
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          Dynamic OG / social card generation is a concept — it would require a backend image
          service. The prototype ships a single static homepage OG image only.
        </p>
      </section>

      {/* Official channels */}
      <section className="space-y-5">
        <Heading id="channels" icon={Radio} title="Official channels" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[BRAND.channels.site, BRAND.channels.x, BRAND.channels.telegram].map((ch) => (
            <a
              key={ch.url}
              href={ch.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition-colors"
              data-testid={`channel-${ch.label}`}
            >
              <div className="text-sm font-medium">{ch.label}</div>
              <div className="text-[11px] text-muted-foreground/70 mt-0.5 font-mono truncate">{ch.url}</div>
            </a>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground/70">
          These are the only official channels. Treat any other account or group as unofficial.
        </p>
      </section>

      {/* Protocol facts */}
      <section className="space-y-5">
        <Heading id="facts" icon={Shield} title="Protocol facts" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-emerald-500/[0.04] border-emerald-500/20">
            <CardContent className="p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Live now</div>
              <ul className="space-y-2">
                {BRAND.liveNow.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-neutral-500/[0.04] border-white/10">
            <CardContent className="p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Not live</div>
              <ul className="space-y-2">
                {BRAND.notLive.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <XCircle className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { k: "Routing", v: BRAND.facts.routing },
              { k: "Chapter", v: BRAND.facts.chapter },
              { k: "Default source", v: BRAND.facts.defaultSource },
              { k: "Accounting unit", v: BRAND.facts.accountingUnit },
              { k: "Seat", v: BRAND.facts.seat },
            ].map((f) => (
              <div key={f.k} className="space-y-0.5">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{f.k}</div>
                <div className="text-sm">{f.v}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Language */}
      <section className="space-y-5">
        <Heading id="language" icon={CheckCircle2} title="Approved &amp; banned language" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-emerald-500/[0.04] border-emerald-500/20">
            <CardContent className="p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Approved</div>
              <div className="flex flex-wrap gap-2">
                {BRAND.approvedLanguage.map((w) => (
                  <span key={w} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">{w}</span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-red-500/[0.04] border-red-500/20">
            <CardContent className="p-5 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wider text-red-400">Never use</div>
              <div className="flex flex-wrap gap-2">
                {BRAND.bannedLanguage.map((w) => (
                  <span key={w} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-300 line-through decoration-red-500/40">{w}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Usage + disclaimers + contact */}
      <section className="space-y-5">
        <Heading id="usage" icon={AlertTriangle} title="Media usage &amp; disclaimers" />
        <Card className="bg-amber-500/[0.04] border-amber-500/20">
          <CardContent className="p-6 space-y-3">
            <ul className="space-y-2">
              {BRAND.mediaUsage.map((u) => (
                <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-amber-400/70 shrink-0 mt-2" /> {u}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground/80 pt-2 border-t border-white/5">
              Nothing here is financial advice. This is a prototype interface; figures, addresses and
              hashes are simulated and labeled throughout. No live transactions occur.
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-medium">Press &amp; partnerships</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Reach the team through the official channels above. A dedicated press contact is a
                  future addition.
                </div>
              </div>
            </div>
            <Button variant="outline" asChild className="shrink-0">
              <Link href="/share" data-testid="press-to-share">
                <Share2 className="w-4 h-4" /> Proof &amp; Share Center
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
