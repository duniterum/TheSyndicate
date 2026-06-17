// BrandBoard — internal brand-foundation preview (Sprint 0B).
//
// A single rendered surface that shows the canonical Syndicate mark, the icon /
// favicon / social / token assets, light + dark variants, the color-role rule,
// and the exchange-listing asset preview. Read-only showcase — no protocol data,
// no wallet, no market metrics. Mounted as a section on /labs/component-index.
//
// Asset sources live in public/brand, public/og, and public/ (see
// docs/brand/BRAND_GUIDELINES.md for the full file index + usage rules).

import { SyndicateEmblem } from "@/components/syndicate/SyndicateEmblem";

const GOLD = "#E3A92B";
const CYAN = "#2BE8E8";
const GREEN = "#25B07A";
const RED = "#E5484D";
const OBSIDIAN = "#0A0B0D";
const IVORY = "#F5F1E8";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">{children}</div>
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
        <Eyebrow>Brand Foundation · Sprint 0B</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">The Syndicate — brand assets</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The canonical mark is a <b className="text-foreground">rounded interconnected emblem</b>: six member
          nodes on a hexagonal ring, each linked by a spoke to the central seat node — members around the seat.
          Identity is always rendered in gold. Preview surface only; nothing here is wired into production
          navigation. Full rules: <code className="text-foreground/80">docs/brand/BRAND_GUIDELINES.md</code>.
        </p>

        {/* Color role rule */}
        <div className="mt-6">
          <Eyebrow>Color roles (founder rule)</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <ColorRole swatch={GOLD} name="Gold" role="Identity · brand · seat · token" token="var(--identity) · #E3A92B" />
            <ColorRole swatch={CYAN} name="Cyan" role="Live data · verification · activity" token="var(--live) · #2BE8E8" />
            <ColorRole swatch={GREEN} name="Green" role="Success states only" token="success" />
            <ColorRole swatch={RED} name="Red" role="Risk · error only" token="var(--destructive)" />
          </div>
        </div>

        {/* Primary mark, light + dark */}
        <div className="mt-8">
          <Eyebrow>Primary emblem — canonical direction</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <SyndicateEmblem size={132} tone="brand" title="The Syndicate emblem" />
              </Tile>
              <div className="mt-3 text-sm font-medium">On obsidian (default)</div>
              <div className="mono mt-0.5 text-[11px] text-muted-foreground">gold #E3A92B · live component</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={IVORY}>
                <SyndicateEmblem size={132} tone="brand" title="The Syndicate emblem on light" />
              </Tile>
              <div className="mt-3 text-sm font-medium">On ivory</div>
              <div className="mono mt-0.5 text-[11px] text-muted-foreground">gold holds on light · live component</div>
            </div>
          </div>
        </div>

        {/* Logo lockups */}
        <div className="mt-8">
          <Eyebrow>Logo lockups — light / dark variants</Eyebrow>
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={OBSIDIAN}>
                <img src="/brand/logo-dark.svg" alt="The Syndicate logo, dark variant" className="h-14 w-auto" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">/brand/logo-dark.svg</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <Tile bg={IVORY}>
                <img src="/brand/logo-light.svg" alt="The Syndicate logo, light variant" className="h-14 w-auto" />
              </Tile>
              <div className="mono mt-3 text-[11px] text-muted-foreground">/brand/logo-light.svg</div>
            </div>
          </div>
        </div>

        {/* Icon system */}
        <div className="mt-8">
          <Eyebrow>Icon system — favicon · app · social</Eyebrow>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <Card label="Favicon" sub="favicon.svg · .ico">
              <img src="/favicon.svg" alt="favicon" className="size-16 rounded-[14px]" />
            </Card>
            <Card label="App icon" sub="app-icon.svg · 512">
              <img src="/brand/app-icon.svg" alt="app icon" className="size-20 rounded-[18px]" />
            </Card>
            <Card label="Apple touch" sub="apple-touch-icon.png · 180">
              <img src="/apple-touch-icon.png" alt="apple touch icon" className="size-20 rounded-[18px]" />
            </Card>
            <Card label="Maskable" sub="icon-512-maskable.png">
              <img src="/icon-512-maskable.png" alt="maskable icon" className="size-20 rounded-full" />
            </Card>
            <Card label="Social avatar" sub="social-avatar-512.png">
              <img src="/brand/social-avatar-512.png" alt="social avatar" className="size-20 rounded-full" />
            </Card>
          </div>
        </div>

        {/* Token + exchange listing */}
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <Eyebrow>SYN token coin mark</Eyebrow>
            <Tile bg={OBSIDIAN} className="mt-3">
              <img src="/brand/syn-coin.svg" alt="SYN coin mark" className="size-36" />
            </Tile>
            <div className="mono mt-3 text-[11px] text-muted-foreground">/brand/syn-coin.svg · png 256 / 200</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <Eyebrow>Exchange listing — asset preview</Eyebrow>
            <div className="mt-3 rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <img src="/brand/syn-coin.svg" alt="SYN" className="size-12" />
                <div className="min-w-0">
                  <div className="text-base font-semibold text-foreground">
                    The Syndicate <span className="mono text-sm text-muted-foreground">SYN</span>
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                      className="inline-block size-2 rounded-full bg-muted-foreground/50"
                      aria-hidden
                    />
                    Avalanche C-Chain (43114)
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {["Price", "Market cap", "Volume"].map((k) => (
                  <div key={k} className="rounded border border-border/60 p-2">
                    <div className="mono text-[10px] uppercase tracking-wide text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm text-foreground/60">—</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Shows how the SYN mark, name, ticker, and network appear in a listing. Asset layout preview only —
              not market data.
            </p>
          </div>
        </div>

        {/* Clearspace + min size */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <Eyebrow>Clearspace</Eyebrow>
            <Tile bg={OBSIDIAN} className="mt-3">
              <span className="grid place-items-center rounded-md p-7 ring-1 ring-dashed ring-[color-mix(in_oklab,#E3A92B_45%,transparent)]">
                <SyndicateEmblem size={72} tone="brand" />
              </span>
            </Tile>
            <p className="mt-3 text-xs text-muted-foreground">
              Keep clearspace of at least one node-radius around the emblem on every side.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <Eyebrow>Minimum size</Eyebrow>
            <Tile bg={OBSIDIAN} className="mt-3">
              <div className="flex items-end gap-6">
                <div className="grid place-items-center gap-1">
                  <SyndicateEmblem size={16} tone="brand" />
                  <span className="mono text-[9px] text-muted-foreground">16</span>
                </div>
                <div className="grid place-items-center gap-1">
                  <SyndicateEmblem size={24} tone="brand" />
                  <span className="mono text-[9px] text-muted-foreground">24</span>
                </div>
                <div className="grid place-items-center gap-1">
                  <SyndicateEmblem size={40} tone="brand" />
                  <span className="mono text-[9px] text-muted-foreground">40</span>
                </div>
              </div>
            </Tile>
            <p className="mt-3 text-xs text-muted-foreground">
              Do not render the emblem below 16px. Use the favicon tile build for 16–32px contexts.
            </p>
          </div>
        </div>

        {/* Do / Don't */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium" style={{ color: GREEN }}>Do</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Render identity (mark, seat, token) in gold.</li>
              <li>Reserve cyan for live data, verification, and protocol activity.</li>
              <li>Keep the emblem on obsidian or ivory with full clearspace.</li>
              <li>Use the one-color ivory or ink emblem when gold lacks contrast.</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-medium" style={{ color: RED }}>Don't</div>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              <li>Recolor identity cyan, or use gold for live/activity accents.</li>
              <li>Stretch, rotate, restyle, or re-space the nodes.</li>
              <li>Pair the mark with market metrics or financial-return claims.</li>
              <li>Place the emblem on low-contrast or busy backgrounds.</li>
            </ul>
          </div>
        </div>

        {/* File index */}
        <div className="mt-8">
          <Eyebrow>Asset paths</Eyebrow>
          <div className="mt-3 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <tbody className="mono text-[12px]">
                {[
                  ["Master emblem (gold / ivory / ink)", "/brand/emblem-gold.svg · emblem-ivory.svg · emblem-ink.svg"],
                  ["Logo lockups", "/brand/logo-dark.svg · /brand/logo-light.svg"],
                  ["Favicon", "/favicon.svg · /favicon.ico"],
                  ["App / PWA icons", "/brand/app-icon.svg · /apple-touch-icon.png · /icon-192.png · /icon-512.png · /icon-512-maskable.png"],
                  ["Social avatar", "/brand/social-avatar.svg · /brand/social-avatar-512.png"],
                  ["SYN coin mark", "/brand/syn-coin.svg · /brand/syn-coin-256.png · /brand/syn-coin-200.png"],
                  ["Social / OG card", "/og/og-brand.svg · /og/og-brand.png"],
                  ["Manifest", "/site.webmanifest"],
                  ["Usage rules", "docs/brand/BRAND_GUIDELINES.md"],
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
