// ─── Archive Museum Hero (Wave 3) ─────────────────────────────────────────
// Editorial museum-style hero for /nft + /archive surfaces.
// Inspired by Museum Plus (Sick Agency) + Kuldmuna Arhiiv (NOPE Creative).
// Light-mode-first, dark-aware. Instrument Serif headline, gold seal,
// curator plaque, two CTAs.

import { Link } from "@tanstack/react-router";
import { track } from "@/lib/analytics";

export function ArchiveMuseumHero() {
  return (
    <section
      aria-label="The Syndicate Archive"
      className="relative overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      <div aria-hidden className="absolute inset-0 grid-bg opacity-25" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-16 items-center">
          {/* LEFT — editorial title block */}
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <span
                aria-hidden
                className="relative inline-flex items-center justify-center size-12 rounded-full"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                <span className="font-serif text-xl font-semibold text-[#1a1a1a]">A</span>
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                The Syndicate · Archive · Chapter I
              </span>
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-normal tracking-tight leading-[1.02] text-foreground">
              The Archive.
            </h1>

            <p
              className="mt-5 font-serif text-2xl md:text-3xl leading-snug"
              style={{ color: "var(--gold)" }}
            >
              SYN is the seat.{" "}
              <em className="italic font-normal text-foreground/85">
                Artifacts are the memory.
              </em>
            </p>

            <p className="mt-6 max-w-xl text-base md:text-lg text-foreground/80 leading-relaxed">
              A curated collection of on-chain artifacts that record what The
              Syndicate witnessed. The First Signal — Chapter I —
              <span className="font-medium text-foreground"> is open on Avalanche</span> at
              0.50 USDC, wallet limit 5. Other artifacts remain sealed until
              the protocol writes their chapter.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/join"
                onClick={() => track("claim_seat_click", { surface: "archive_museum_hero" })}
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-medium tracking-wide transition-all duration-200 text-[#1a1a1a] hover:-translate-y-[1px]"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "var(--shadow-glow-gold)",
                }}
              >
                Join The Syndicate →
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3.5 text-sm font-medium tracking-wide transition-colors border"
                style={{
                  borderColor: "var(--verify)",
                  color: "var(--verify)",
                  background: "transparent",
                }}
              >
                Explore the Archive
              </a>
            </div>

            <div className="mt-5 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Curated · Secured on-chain · Preserved for generations · Governed by members
            </div>
          </div>

          {/* RIGHT — museum plaque (artifact spec card) */}
          <aside
            className="relative rounded-lg border p-6 md:p-8"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
            }}
            aria-label="Featured artifact"
          >
            {/* Inner gold-framed artifact display */}
            <div
              className="relative aspect-square rounded-md overflow-hidden border-2 flex items-center justify-center"
              style={{
                borderColor: "var(--gold)",
                background: "var(--background)",
              }}
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-10"
                style={{ background: "var(--gradient-gold)" }}
              />
              <div className="relative text-center">
                <div
                  className="mx-auto inline-flex items-center justify-center size-24 rounded-full mb-4"
                  style={{
                    background: "var(--gradient-gold)",
                    boxShadow: "var(--shadow-glow-gold)",
                  }}
                >
                  <span className="font-serif text-4xl font-semibold text-[#1a1a1a]">S</span>
                </div>
                <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  ID 001
                </div>
                <div className="font-serif text-xl mt-1 text-foreground">
                  The First Signal
                </div>
              </div>
            </div>

            {/* Plaque caption */}
            <div className="mt-5 space-y-2 mono text-[11px] text-muted-foreground">
              <div className="flex justify-between gap-3">
                <span>Chapter</span>
                <span className="text-foreground">I — Genesis</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Status</span>
                <span style={{ color: "var(--success)" }}>● Mint open</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Price</span>
                <span className="text-foreground">0.50 USDC</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Wallet limit</span>
                <span className="text-foreground">5</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Network</span>
                <span className="text-foreground">Avalanche C-Chain</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 size-[520px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-gold)" }}
      />
    </section>
  );
}
