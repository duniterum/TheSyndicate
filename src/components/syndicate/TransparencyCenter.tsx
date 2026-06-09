import {
  TRANSPARENCY_ITEMS,
  WHATS_LIVE,
  SYN_EXPLORERS,
  type TransparencyStatus,
} from "@/lib/syndicate-config";
import { ProofButton } from "./Primitives";

const STATUS_STYLES: Record<TransparencyStatus, { label: string; cls: string }> = {
  live:    { label: "LIVE ONCHAIN",    cls: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  partial: { label: "PARTIAL",         cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  pending: { label: "PENDING CONTRACT", cls: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
};

const STATUS_ORDER: TransparencyStatus[] = ["live", "partial", "pending"];


function StatusPill({ status }: { status: TransparencyStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span
      className={`mono text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full border ${s.cls}`}
    >
      {s.label}
    </span>
  );
}


export function TransparencyCenter() {
  return (
    <section
      id="transparency"
      aria-labelledby="transparency-heading"
      className="border-t border-border/40 bg-background"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <header className="mb-10">
          <p className="mono text-[10px] uppercase tracking-[0.22em] text-[color:oklch(0.5_0.13_75)] mb-3">
            Transparency Center
          </p>
          <h2
            id="transparency-heading"
            className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground"
          >
            What is live, what is partial, what is pending
          </h2>
          <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
            One honest dashboard. SYN, the Membership Sale, routing, and LP are live
            onchain. Partial systems identify their source and limits. Pending modules
            are not counted until deployed.
          </p>

        </header>

        {/* Status cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {TRANSPARENCY_ITEMS.map((it) => (
            <article
              key={it.label}
              className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-4 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">{it.label}</h3>
                <StatusPill status={it.status} />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                {it.detail}
              </p>
              {it.href && (
                <a
                  href={it.href}
                  target={it.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="mono text-[10px] uppercase tracking-[0.18em] text-foreground hover:text-[var(--gold)]"
                >
                  Verify ↗
                </a>
              )}
            </article>
          ))}
        </div>

        {/* Verification links — full registry lives on /registry */}
        <article className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-6 mb-6">
          <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
            <h3 className="text-lg font-semibold text-foreground">Where to verify</h3>
            <p className="text-xs text-muted-foreground mono">
              Full contract + wallet registry on <a href="/registry" className="underline underline-offset-2 hover:text-foreground">/registry</a>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ProofButton href={SYN_EXPLORERS.avascan}>Avascan ↗</ProofButton>
            <ProofButton href={SYN_EXPLORERS.sourcify}>Sourcify ↗</ProofButton>
            <ProofButton href={SYN_EXPLORERS.routescan}>Routescan ↗</ProofButton>
            <ProofButton href={SYN_EXPLORERS.snowtrace}>SnowTrace ↗</ProofButton>
          </div>
        </article>


        {/* Live / Partial / Pending lists */}
        <div className="grid gap-3 md:grid-cols-3">
          {STATUS_ORDER.map((k) => {
            const s = STATUS_STYLES[k];
            return (
              <div key={k} className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur p-5">
                <div className="mb-3">
                  <StatusPill status={k} />
                </div>
                <ul className="space-y-1.5 text-sm text-foreground/90">
                  {WHATS_LIVE[k].map((row) => (
                    <li key={row} className="flex gap-2">
                      <span className={`mt-2 size-1.5 rounded-full ${
                        k === "live" ? "bg-emerald-500" : k === "partial" ? "bg-amber-500" : "bg-muted-foreground/50"
                      }`} />
                      <span className="flex-1">{row}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TransparencyCenter;
