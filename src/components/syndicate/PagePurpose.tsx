// PagePurpose — a crisp, one-line "what this page is" band with optional
// disambiguation cross-links to the systems it is most often confused with.
//
// Presentational only: it reuses the existing design tokens (gold rule, mono
// eyebrow) and adds no protocol data, metrics, or new concepts. Its job is to
// keep the colliding vocabulary (Activity vs Chronicle, Contract Registry vs
// Institutional Register, Archive vs both) legible at the top of each page.

import { Link } from "@tanstack/react-router";

export type PageDistinction = { label: string; to: string };

export function PagePurpose({
  statement,
  distinctions,
  eyebrow = "On this page",
}: {
  statement: string;
  distinctions?: PageDistinction[];
  eyebrow?: string;
}) {
  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 pt-8 md:pt-10">
      <div className="border-l-2 pl-4 md:pl-5" style={{ borderColor: "var(--gold)" }}>
        <div className="mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground mb-2">
          {eyebrow}
        </div>
        <p className="max-w-3xl text-sm md:text-[15px] leading-relaxed text-foreground/85">
          {statement}
        </p>
        {distinctions && distinctions.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Not to be confused with
            </span>
            {distinctions.map((d) => (
              <Link
                key={d.to}
                to={d.to as any}
                className="mono inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground hover:border-[var(--gold)]/60 hover:text-foreground transition-colors"
              >
                {d.label} →
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PagePurpose;
