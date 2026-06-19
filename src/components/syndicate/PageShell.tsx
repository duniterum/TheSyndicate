import type { ReactNode } from "react";
import { Header } from "@/components/syndicate/Header";
import { DemoBanner } from "@/components/syndicate/DemoBanner";
import { Footer } from "@/components/syndicate/Sections";
import { IdentityRibbon } from "@/components/syndicate/IdentityRibbon";
import { ProtocolIntelligenceBar } from "@/components/syndicate/ProtocolIntelligenceBar";
import { BrandMark } from "@/components/syndicate/Logo";

export function PageShell({
  eyebrow,
  title,
  description,
  children,
  hideHeader = false,
  headerWide = false,
  hideIntelligenceBar = false,
  hideDemoBanner = false,
  hideIdentityRibbon = false,
  serif = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  /** When true, suppress the default editorial header (used by routes that
   *  own their own full-bleed hero, e.g. /nft Chapter I hero). */
  hideHeader?: boolean;
  /** When true, drop the global header's max-width so it spans full-bleed
   *  (edge-to-edge) and shares one continuous edge alignment with the homepage
   *  full-screen hero. Only the homepage sets this; every other page stays
   *  max-w-7xl. */
  headerWide?: boolean;
  /** When true, suppress the global Protocol Intelligence ticker. The homepage
   *  sets this because its hero already renders the full protocol overview —
   *  the ticker would duplicate those metrics directly above the hero. */
  hideIntelligenceBar?: boolean;
  /** When true, suppress the top "Membership Sale live" announcement strip. The
   *  homepage sets this so the header sits directly on the hero as one
   *  continuous scene (matching the intended hero composition). */
  hideDemoBanner?: boolean;
  /** When true, suppress the slim seat-context ribbon. The homepage sets this —
   *  the hero already carries seat / visitor context, so the ribbon would
   *  double it and break the header→hero blend. */
  hideIdentityRibbon?: boolean;
  /** When true, scope this page into editorial serif (Fraunces). Reserved for
   *  the Chronicle and whitepaper — serif is retired everywhere else. */
  serif?: boolean;
}) {
  return (
    <div
      className={`min-h-dvh text-foreground pb-20 md:pb-0 overflow-x-hidden${serif ? " editorial-serif" : ""}`}
      style={{ background: "var(--background)" }}
    >
      {!hideDemoBanner && <DemoBanner />}
      <Header wide={headerWide} />
      {!hideIntelligenceBar && <ProtocolIntelligenceBar />}
      {!hideIdentityRibbon && <IdentityRibbon />}
      <main>
        {!hideHeader && (
          <section
            aria-label={title}
            className="relative overflow-hidden border-b"
            style={{ borderColor: "var(--border)", background: "var(--background)" }}
          >
            <div aria-hidden className="absolute inset-0 grid-bg opacity-25" />
            <div className="relative mx-auto max-w-7xl px-5 md:px-8 pt-12 md:pt-20 pb-10 md:pb-14">
              <div className="border-l-2 pl-5 md:pl-7" style={{ borderColor: "var(--accent)" }}>
                <div className="flex items-center gap-3 mb-5">
                  <BrandMark size="md" />
                  <span className="mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
                    {eyebrow ?? "The Syndicate"}
                  </span>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.04] text-foreground max-w-3xl">
                  {title}
                </h1>
                {description && (
                  <p className="mt-5 max-w-2xl text-base md:text-lg text-foreground/75 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}
        {children}
      </main>
      <Footer />
    </div>
  );
}
