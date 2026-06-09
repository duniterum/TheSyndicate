import type { ReactNode } from "react";
import { Header } from "@/components/syndicate/Header";
import { DemoBanner } from "@/components/syndicate/DemoBanner";
import { Footer } from "@/components/syndicate/Sections";
import { IdentityRibbon } from "@/components/syndicate/IdentityRibbon";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  hideHeader = false,
  serif = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  /** When true, suppress the default editorial header (used by routes that
   *  own their own full-bleed hero, e.g. /nft Chapter I hero). */
  hideHeader?: boolean;
  /** When true, scope this page into editorial serif (Fraunces). Reserved for
   *  the Chronicle and whitepaper — serif is retired everywhere else. */
  serif?: boolean;
}) {
  return (
    <div
      className={`min-h-dvh text-foreground pb-20 md:pb-0 overflow-x-hidden${serif ? " editorial-serif" : ""}`}
      style={{ background: "var(--background)" }}
    >
      <DemoBanner />
      <Header />
      <IdentityRibbon />
      <main>
        {!hideHeader && (
          <section
            aria-label={title}
            className="relative overflow-hidden border-b"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <div aria-hidden className="absolute inset-0 grid-bg opacity-20" />
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 -right-24 size-[420px] rounded-full opacity-15 blur-3xl"
              style={{ background: "var(--gradient-gold)" }}
            />
            <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-10 md:pb-14">
              <div className="flex items-center gap-3 mb-5">
                <span
                  aria-hidden
                  className="inline-flex items-center justify-center size-9 rounded-full"
                  style={{
                    background: "var(--gradient-gold)",
                    boxShadow: "var(--shadow-glow-gold)",
                  }}
                >
                  <span className="font-serif text-base font-semibold text-[#1a1a1a]">S</span>
                </span>
                <span className="mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                  {eyebrow ?? "The Syndicate"}
                </span>
              </div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.04] text-foreground max-w-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/75 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </section>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
