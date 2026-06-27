// THE SYNDICATE — PRODUCT OS STUDIO · FIRST-SCREEN IDENTITY BANNER
//
// The one element that makes /studio/ unmistakably the Studio (and not the production
// Syndicate site at /). It states, above the fold:
//   1. WHAT this is        — Product OS Studio · Founder Review Preview
//   2. The route map       — / = current site · /studio/ = this preview
//   3. The reality layer   — Demo Persona / Live Wallet Read / Adapter Required (never mixed)
//   4. Where live read is   — links to the surfaces that carry the real read-only snapshot
//
// Purely explanatory — no data, no wiring, no writes. Labels reuse the canonical StatusBadge
// taxonomy so they stay in lockstep with every other surface.

import { Link } from "wouter";
import { Boxes, Users, Wallet, Cable, Radio, ArrowRight, Info } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Status } from "@/components/ui/status-badge";

interface Mode {
  icon: typeof Users;
  title: string;
  status: Status;
  accent: string;
  ring: string;
}

const MODES: Mode[] = [
  { icon: Users, title: "Demo Persona", status: "SIMULATED PROTOTYPE", accent: "text-orange-400", ring: "border-orange-500/25" },
  { icon: Wallet, title: "Live Wallet Read", status: "LIVE READ", accent: "text-emerald-400", ring: "border-emerald-500/25" },
  { icon: Cable, title: "Adapter Required", status: "ADAPTER REQUIRED", accent: "text-cyan-400", ring: "border-cyan-500/25" },
];

const LIVE_READ_SURFACES = [
  { label: "Registry", href: "/registry" },
  { label: "Economy", href: "/economy" },
  { label: "Fire", href: "/fire" },
  { label: "Wallet", href: "/member/wallet" },
];

export function StudioPreviewBanner() {
  return (
    <div
      className="rounded-3xl border border-primary/20 bg-primary/[0.04] ring-1 ring-primary/10 backdrop-blur-md overflow-hidden"
      data-testid="studio-preview-banner"
    >
      {/* Identity + route map */}
      <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-foreground">Product OS Studio</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-primary">
                Founder Review Preview
              </span>
            </div>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-muted-foreground">
              A prototype layer over The Syndicate — what is demonstrated, what is read live, and what
              still needs an adapter, each labeled plainly and never mixed.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-background/40 px-3.5 py-2.5 text-[11px] text-muted-foreground md:max-w-[15rem]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/70" />
          <span className="font-mono leading-relaxed">
            <span className="text-foreground/80">/</span> current Syndicate site ·{" "}
            <span className="text-foreground/80">/studio/</span> this Product OS Studio preview
          </span>
        </div>
      </div>

      {/* Reality-layer modes — the three states, summarized above the fold */}
      <div className="grid grid-cols-1 gap-px border-t border-primary/10 bg-white/5 sm:grid-cols-3">
        {MODES.map((m) => (
          <div
            key={m.title}
            className="flex items-center gap-2.5 bg-background/60 px-4 py-3"
            data-testid={`studio-mode-${m.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${m.ring} ${m.accent}`}>
              <m.icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold text-foreground">{m.title}</div>
              <StatusBadge status={m.status} showTooltip={false} className="mt-0.5 scale-90 origin-left" />
            </div>
          </div>
        ))}
      </div>

      {/* Live-read teaser — where the real read-only snapshot appears */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-primary/10 px-5 py-3">
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
          <Radio className="h-3.5 w-3.5" /> Live read available on
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {LIVE_READ_SURFACES.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-lg border border-white/10 bg-background/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-emerald-500/30 hover:text-foreground"
              data-testid={`studio-liveread-${s.label.toLowerCase()}`}
            >
              {s.label}
            </Link>
          ))}
        </div>
        <Link
          href="#reality-layer"
          className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          data-testid="studio-reality-detail"
        >
          How the layers work <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
