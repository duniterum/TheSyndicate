// BrandBoard — internal brand-identity REVIEW surface.
//
// Founder paused publish for a brand-identity review. This board shows the
// decision side-by-side — CURRENT (live, frozen) vs REJECTED (node/hex
// direction) vs APPROVED (the "Interlock" double-S monogram) — and previews
// the full approved Interlock asset set staged in
// public/brand-v2-syndicate-interlock/.
//
// Read-only showcase: no protocol data, no wallet, no market metrics. Nothing
// here is wired into production navigation. The live brand mark (BrandMark) is
// imported read-only from the frozen Logo system. Mounted as a section on
// /labs/component-index.

import { BrandMark } from "@/components/syndicate/Logo";

const GOLD = "#E3A92B";
const CYAN = "#2BE8E8";
const GREEN = "#25B07A";
const RED = "#E5484D";
const OBSIDIAN = "#0A0B0D";
const IVORY = "#F5F1E8";

const V2 = "/brand-v2-syndicate-interlock";
const V1 = "/brand-v1-node";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{children}</div>
  );
}

function StatusPill({ tone, children }: { tone: "current" | "rejected" | "approved"; children: React.ReactNode }) {
  const map = {
    current: { fg: "#C9CDD4", bg: "color-mix(in oklab, #C9CDD4 16%, transparent)", bd: "color-mix(in oklab, #C9CDD4 38%, transparent)" },
    rejected: { fg: RED, bg: "color-mix(in oklab, #E5484D 16%, transparent)", bd: "color-mix(in oklab, #E5484D 45%, transparent)" },
    approved: { fg: GREEN, bg: "color-mix(in oklab, #25B07A 16%, transparent)", bd: "color-mix(in oklab, #25B07A 45%, transparent)" },
  }[tone];
  return (
    <span
      className="mono inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
      style={{ color: map.fg, background: map.bg, border: `1px solid ${map.bd}` }}
    >
      {children}
    </span>
  );
}

function Card({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid min-h-[140px] place-items-center rounded-md">{children}</div>
      <div className="mt-3">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {sub ? <div className="mono mt-0.5 text-[11px] text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  );
}

function ColorRole({
  swatch,
  name,
  role,
  token,
}: {
  swatch: string;
  name: string;
  role: string;
  token: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3">
      <span
        className="size-10 shrink-0 rounded-md ring-1 ring-inset ring-white/10"
        style={{ background: swatch }}
        aria-hidden
      />
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">{role}</div>
        <div className="mono mt-0.5 text-[10px] text-muted-foreground">{token}</div>
      </div>
    </div>
  );
}

function Tile({
  bg,
  children,
  className = "",
}: {
  bg: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`grid place-items-center rounded-md p-6 ${className}`}
      style={{ background: bg }}
    >
      {children}
    </div>
  );
}

export function BrandBoard() {
  return (
    <section id="brand-foundation" className="mt-12 scroll-mt-20">
      <div className="rounded-xl border border-[color-mix(in_oklab,#E3A92B_30%,transparent)] bg-card/60 p-5 md:p-7">
        <Eyebrow>Brand Identity Review · staged — not published</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">The Syndicate — Interlock direction</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Publish is paused for a brand-identity review. The approved direction is the{" "}
          <b className="text-foreground">Interlock</b> — a rounded, interlocking double-S monogram reading both as{" "}
          <span className="text-foreground/80">two linked members</span> and the <span className="text-foreground/80">SYN seat</span>.
          Identity is always rendered in gold. Everything below is a preview only — read-only, nothing wired into
          production navigation, and the next publish changes nothing about the live brand.
        </p>

        {/* Decision row: CURRENT / REJECTED / APPROVED */}
        <div className="mt-6">
          <Eyebrow>The decision — side by side</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* CURRENT */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Current</span>
                <StatusPill tone="current">Live · frozen</StatusPill>
              </div>
              <Tile bg={OBSIDIAN} className="mt-3 min-h-[150px]">
                <BrandMark size="xl" tone="gold" className="scale-[2.4]" />
              </Tile>
              <p className="mono mt-3 text-[11px] text-muted-foreground">
                Live Header/nav mark — Logo.tsx (frozen)
              </p>
            </div>
            {/* REJECTED */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Node / hex</span>
                <StatusPill tone="rejected">Rejected</StatusPill>
              </div>
              <Tile bg={OBSIDIAN} className="mt-3 min-h-[150px]">
                <img src={`${V1}/emblem-gold.svg`} alt="Rejected node/hex emblem" className="size-28" />
              </Tile>
              <p className="mono mt-3 text-[11px] text-muted-foreground">
                {V1}/emblem-gold.svg — do not use
              </p>
            </div>
            {/* APPROVED */}
            <div className="rounded-lg border p-4" style={{ borderColor: "color-mix(in oklab, #25B07A 40%, transparent)" }}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Interlock</span>
                <StatusPill tone="approved">Approved</StatusPill>
              </div>
              <Tile bg={OBSIDIAN} className="mt-3 min-h-[150px]">
                <img src={`${V2}/syn-mark-gold.svg`} alt="Approved Interlock monogram" className="size-28" />
              </Tile>
              <p className="mono mt-3 text-[11px] text-muted-foreground">
                {V2}/syn-mark-gold.svg
              </p>
            </div>
          </div>
        </div>

        {/* Approved primary marks */}
        <div className="mt-8">
          <Eyebrow>Interlock — primary marks</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src={`${V2}/syn-mark-gold.svg`} alt="Interlock gold on obsidian" className="size-28" />
              </Tile>
              <div className="mt-3 text-sm font-medium">Gold on obsidian</div>
              <div className="mono mt-0.5 text-[11px] text-muted-foreground">syn-mark-gold.svg</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={IVORY}>
                <img src={`${V2}/syn-mark-ink.svg`} alt="Interlock ink on ivory" className="size-28" />
              </Tile>
              <div className="mt-3 text-sm font-medium">Ink on ivory</div>
              <div className="mono mt-0.5 text-[11px] text-muted-foreground">syn-mark-ink.svg</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src={`${V2}/syn-mark-ivory.svg`} alt="Interlock ivory on obsidian" className="size-28" />
              </Tile>
              <div className="mt-3 text-sm font-medium">Ivory (one-color)</div>
              <div className="mono mt-0.5 text-[11px] text-muted-foreground">syn-mark-ivory.svg</div>
            </div>
          </div>
        </div>

        {/* Icon system */}
        <div className="mt-8">
          <Eyebrow>Icon system — favicon · app · social</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card label="Favicon" sub="syn-favicon · .ico">
              <img src={`${V2}/syn-favicon.svg`} alt="favicon" className="size-16 rounded-[12px]" />
            </Card>
            <Card label="Icon (gold)" sub="syn-icon-gold">
              <img src={`${V2}/syn-icon-gold.svg`} alt="gold icon tile" className="size-20 rounded-[18px]" />
            </Card>
            <Card label="Icon (obsidian)" sub="syn-icon-obsidian">
              <img src={`${V2}/syn-icon-obsidian.svg`} alt="obsidian icon tile" className="size-20 rounded-[18px]" />
            </Card>
            <Card label="App icon" sub="syn-app-icon · 512">
              <img src={`${V2}/syn-app-icon.svg`} alt="app icon" className="size-20 rounded-[18px]" />
            </Card>
            <Card label="Maskable" sub="syn-icon-maskable">
              <img src={`${V2}/syn-icon-maskable.svg`} alt="maskable icon" className="size-20 rounded-full" />
            </Card>
            <Card label="Avatar" sub="syn-avatar">
              <img src={`${V2}/syn-avatar.svg`} alt="social avatar" className="size-20 rounded-full" />
            </Card>
          </div>
        </div>

        {/* Coins */}
        <div className="mt-8">
          <Eyebrow>SYN coin mark</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src={`${V2}/syn-coin-gold.svg`} alt="SYN gold coin" className="size-36" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">syn-coin-gold.svg</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src={`${V2}/syn-coin-silver.svg`} alt="SYN silver coin" className="size-36" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">syn-coin-silver.svg</div>
            </div>
          </div>
        </div>

        {/* Lockups */}
        <div className="mt-8">
          <Eyebrow>Logo lockups — real vector text</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={IVORY}>
                <img src={`${V2}/syn-lockup-light.svg`} alt="lockup, light" className="h-16 w-auto max-w-full" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">syn-lockup-light.svg</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src={`${V2}/syn-lockup-dark.svg`} alt="lockup, dark" className="h-16 w-auto max-w-full" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">syn-lockup-dark.svg</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <Tile bg={OBSIDIAN}>
                  <img src={`${V2}/syn-lockup-obsidian.svg`} alt="lockup, obsidian framed" className="h-16 w-auto max-w-full" />
                </Tile>
                <div className="mono mt-3 text-[11px] text-muted-foreground">syn-lockup-obsidian.svg</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <Tile bg={OBSIDIAN}>
                  <img src={`${V2}/syn-lockup-stacked.svg`} alt="lockup, stacked" className="h-28 w-auto max-w-full" />
                </Tile>
                <div className="mono mt-3 text-[11px] text-muted-foreground">syn-lockup-stacked.svg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Social + listing */}
        <div className="mt-8">
          <Eyebrow>Social card · listing badge · exchange preview</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <img src={`${V2}/syn-og.svg`} alt="OG social card" className="w-full rounded-md" />
              <div className="mono mt-3 text-[11px] text-muted-foreground">syn-og.svg · 1200×630</div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <Tile bg={OBSIDIAN}>
                  <img src={`${V2}/syn-listing.svg`} alt="listing badge" className="w-full max-w-full" />
                </Tile>
                <div className="mono mt-3 text-[11px] text-muted-foreground">syn-listing.svg</div>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <Tile bg={OBSIDIAN}>
                  <img src={`${V2}/exchange-preview.svg`} alt="exchange preview" className="size-44 max-w-full" />
                </Tile>
                <div className="mono mt-3 text-[11px] text-muted-foreground">exchange-preview.svg</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Layout previews of how the mark, name, ticker, and network appear — asset composition only, not market data.
            </p>
          </div>
        </div>

        {/* Color role rule */}
        <div className="mt-8">
          <Eyebrow>Color roles (founder rule)</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ColorRole swatch={GOLD} name="Gold" role="Identity · brand · seat · token" token="var(--identity) · #E3A92B" />
            <ColorRole swatch={CYAN} name="Cyan" role="Live data · verification · activity" token="var(--live) · #2BE8E8" />
            <ColorRole swatch={GREEN} name="Green" role="Success states only" token="success" />
            <ColorRole swatch={RED} name="Red" role="Risk · error only" token="var(--destructive)" />
          </div>
        </div>

        {/* Do / Don't */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium" style={{ color: GREEN }}>Do</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Render identity (mark, seat, token) in gold.</li>
              <li>Reserve cyan for live data, verification, and protocol activity.</li>
              <li>Keep the monogram on obsidian or ivory with full clearspace.</li>
              <li>Use the one-color ivory or ink mark when gold lacks contrast.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium" style={{ color: RED }}>Don't</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Recolor identity cyan, or use gold for live/activity accents.</li>
              <li>Stretch, rotate, restyle, or re-space the monogram.</li>
              <li>Pair the mark with market metrics or financial-gain claims.</li>
              <li>Place the mark on low-contrast or busy backgrounds.</li>
            </ul>
          </div>
        </div>

        {/* Inventory / status */}
        <div className="mt-8">
          <Eyebrow>Inventory &amp; production impact</Eyebrow>
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <tbody className="text-[12px]">
                {[
                  ["Current (live)", "Logo.tsx BrandMark + /favicon.svg", "Frozen — unchanged, still served"],
                  ["Node / hex (rejected)", `${V1}/`, "Preserved, namespaced — not wired or referenced by production surfaces"],
                  ["Interlock (approved)", `${V2}/`, "Staged — not wired, not published"],
                  ["Earlier mark draft", "public/brand-v2-syndicate-mark/", "Superseded — kept for history"],
                ].map(([k, path, status]) => (
                  <tr key={k} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap p-2 align-top font-medium text-foreground/80">{k}</td>
                    <td className="mono whitespace-nowrap p-2 align-top text-muted-foreground">{path}</td>
                    <td className="p-2 align-top text-muted-foreground">{status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Production impact: <b className="text-foreground/80">none</b>. The next publish changes nothing about the
            live favicon, icons, social card, or manifest.
          </p>
        </div>

        {/* Approved asset paths */}
        <div className="mt-8">
          <Eyebrow>Approved asset paths — {V2}/</Eyebrow>
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <tbody className="mono text-[12px]">
                {[
                  ["Primary marks", "syn-mark-gold · syn-mark-ink · syn-mark-ivory (.svg + .png)"],
                  ["Icon tiles", "syn-icon-gold · syn-icon-obsidian · syn-icon-maskable (.svg + .png)"],
                  ["App / favicon", "syn-app-icon(-512) · syn-favicon · favicon.ico"],
                  ["Avatar", "syn-avatar (.svg + .png)"],
                  ["Coins", "syn-coin-gold · syn-coin-silver (.svg + .png)"],
                  ["Lockups", "syn-lockup-light · -dark · -obsidian · -stacked (.svg + .png)"],
                  ["Social / listing", "syn-og · syn-listing · exchange-preview (.svg + .png)"],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap p-2 align-top text-foreground/80">{k}</td>
                    <td className="p-2 align-top text-muted-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
