// ─── Join Steps Plaque (Wave 4/5) ─────────────────────────────────────────
// Museum-plaque rendering of the 3-step USDC → SYN flow.
// Pure presentation — anchors the LivePurchase widget with clear
// expectations before the user connects a wallet.

import { Section } from "./Primitives";

const STEPS = [
  {
    n: "01",
    label: "Connect",
    title: "Connect your wallet",
    body: "Avalanche C-Chain. No signup, no email. Your wallet is your identity.",
  },
  {
    n: "02",
    label: "Approve",
    title: "Approve USDC spend",
    body: "One on-chain allowance lets the Membership Sale contract use the exact USDC you choose. Approval alone does not create a seat.",
  },
  {
    n: "03",
    label: "Seat",
    title: "Receive your seat",
    body: "The buy transaction delivers SYN, routes USDC 70 / 20 / 10, and gives the receipt My Syndicate can read.",
  },
];

export function JoinStepsPlaque() {
  return (
    <Section id="how-to-join">
      <div className="mb-8">
        <div className="mono text-[10px] uppercase tracking-[0.28em] mb-3" style={{ color: "var(--gold)" }}>
          Membership ceremony / 3 steps
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-tight text-foreground max-w-2xl">
          Connect. Approve. Then the wallet becomes seated.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STEPS.map((s, i) => (
          <div
            key={s.n}
            className="relative rounded-lg border p-6 transition-colors"
            style={{
              borderColor: "var(--border)",
              background: "var(--card)",
            }}
          >
            <div className="flex items-baseline gap-3 mb-4">
              <span
                className="mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "var(--gold)" }}
              >
                Step {s.n}
              </span>
              <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                · {s.label}
              </span>
            </div>
            <div className="font-serif text-xl md:text-2xl text-foreground leading-tight mb-2">
              {s.title}
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{s.body}</p>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 text-base text-muted-foreground/50"
              >
                →
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Non-custodial / Avalanche C-Chain / deterministic era pricing / no fake success state
      </p>
    </Section>
  );
}
