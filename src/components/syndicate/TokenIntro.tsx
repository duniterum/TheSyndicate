// TokenIntro — answers "What is SYN?" in one screen, before the spec table.
// Three columns: What SYN IS · What SYN ENABLES · What SYN IS NOT.

import { Section, SectionHeader, Pill, StatusPill } from "./Primitives";

const IS = [
  { title: "A utility token", body: "Fixed-supply ERC20 on Avalanche. No admin, no mint, no tax, no pause, no transfer restrictions." },
  { title: "Your membership key", body: "Holding SYN is what places you on the rank ladder and into the public archive." },
  { title: "Verifiable on-chain", body: "Contract, supply, holders, transfers — all readable today on Avascan, Sourcify, and Routescan." },
];

const ENABLES = [
  { title: "Rank & identity", body: "Your SYN balance maps to one of twelve public ranks, from Citizen to Genesis Circle." },
  { title: "Archive identity", body: "Your membership is recorded as verifiable on-chain participation, not as a payout claim." },
  { title: "Future modules", body: "Pending modules only count once they are deployed, public, and verifiable." },
  { title: "Archive presence", body: "A permanent Founder Number and a row in the public member registry." },
];

const ISNOT = [
  "Equity, debt, or a security",
  "A claim on Vault assets",
  "A dividend or yield product",
  "A promise of price appreciation",
  "A guarantee of any future module",
];

export function TokenIntro() {
  return (
    <Section id="syn-intro">
      <SectionHeader
        eyebrow="What is SYN?"
        title={<>One token, <span className="text-gradient-gold">three honest answers</span></>}
        description="SYN is the center of The Syndicate. Before reading the contract spec, here is exactly what it is, what it enables, and what it is not."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* IS */}
        <article className="surface elevated p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Pill tone="gold">SYN IS</Pill>
            <StatusPill status="LIVE" />
          </div>
          <ul className="flex flex-col gap-3 mt-1">
            {IS.map((x) => (
              <li key={x.title}>
                <div className="text-sm font-semibold text-foreground">{x.title}</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{x.body}</p>
              </li>
            ))}
          </ul>
        </article>

        {/* ENABLES */}
        <article className="surface elevated p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Pill tone="navy">SYN ENABLES</Pill>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">LIVE · PENDING</span>
          </div>
          <ul className="flex flex-col gap-3 mt-1">
            {ENABLES.map((x) => (
              <li key={x.title}>
                <div className="text-sm font-semibold text-foreground">{x.title}</div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{x.body}</p>
              </li>
            ))}
          </ul>
        </article>

        {/* IS NOT */}
        <article className="surface elevated p-5 flex flex-col gap-3 border-amber-500/30">
          <div className="flex items-center gap-2">
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-amber-700 dark:text-amber-400">
              SYN IS NOT
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plain language</span>
          </div>
          <ul className="flex flex-col gap-2 mt-1">
            {ISNOT.map((x) => (
              <li key={x} className="flex items-start gap-2 text-sm text-foreground">
                <span aria-hidden className="mt-1 size-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            If a feature ever sounds like one of these, it is a mistake in the copy — not in the protocol.
          </p>
        </article>
      </div>
    </Section>
  );
}

export default TokenIntro;
