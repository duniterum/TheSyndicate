// HowArchiveWorksFlow — single infographic explaining the artifact pipeline.
//
// Visual flow (vertical on mobile, horizontal on desktop):
//   Contract → Template → Mint → Unique serial → Generated SVG → Permanent artifact
//
// Plain English, no FAQ, no technical jargon. Token-driven styling only.
const STEPS = [
  {
    n: "01",
    label: "Contract",
    body: "The Archive1155 contract defines the artifact.",
  },
  {
    n: "02",
    label: "Template",
    body: "The visual system generates the collectible format.",
  },
  {
    n: "03",
    label: "Mint",
    body: "The collector mints the artifact.",
  },
  {
    n: "04",
    label: "Unique serial",
    body: "Each mint receives its own edition number.",
  },
  {
    n: "05",
    label: "Generated SVG",
    body: "The artifact is rendered fully on-chain.",
  },
  {
    n: "06",
    label: "Permanent artifact",
    body: "The record becomes part of the protocol archive.",
  },
];

export function HowArchiveWorksFlow() {
  return (
    <section
      id="how-archive-works"
      aria-labelledby="how-archive-works-title"
      className="relative bg-background text-foreground"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto">
          <span className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
            How the archive works
          </span>
          <h2
            id="how-archive-works-title"
            className="mt-3 font-serif text-4xl md:text-5xl tracking-tight leading-[1.05]"
          >
            From contract to permanent artifact.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            A single pipeline. Six steps. Every step is verifiable on Avalanche.
          </p>
        </div>

        <ol className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-3">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="h-full rounded-xl border border-border bg-muted/30 p-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="mono text-[11px] uppercase tracking-[0.22em] text-[var(--gold)]">
                    Step {s.n}
                  </span>
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/70"
                    aria-hidden="true"
                  />
                </div>
                <div className="text-base font-semibold text-foreground leading-snug">
                  {s.label}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.body}
                </p>
              </div>

              {/* Connector arrow (between cards) */}
              {i < STEPS.length - 1 && (
                <span
                  className="hidden lg:flex absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 items-center justify-center text-[var(--gold)]/60 mono text-[10px]"
                  aria-hidden="true"
                >
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
