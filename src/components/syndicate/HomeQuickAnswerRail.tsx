import {
  ARCHIVE_NFT_EXPLORERS,
  CONTRACTS,
  LP_POOL,
  SYN_EXPLORERS,
  explorerUrlFor,
  explorerUrlForAddress,
} from "@/lib/syndicate-config";
import { GlassCard, Pill, Section, ShortAddress } from "@/components/syndicate/Primitives";

const ANSWERS = [
  {
    q: "What is this?",
    a: "A transparent on-chain membership protocol on Avalanche, not a treasury product.",
  },
  {
    q: "What do I receive?",
    a: "Buying membership delivers SYN. SYN is the V1 seat.",
  },
  {
    q: "Where does USDC go?",
    a: "Every purchase routes 70% Vault, 20% Liquidity, 10% Operations.",
  },
  {
    q: "How do I verify it?",
    a: "Use the Registry, Transparency Center, receipt, and explorer links.",
  },
  {
    q: "Where does SYN trade?",
    a: "SYN/USDC trades through the Trader Joe liquidity pool.",
  },
  {
    q: "What is future?",
    a: "Referral Router and SeatRecord721 stay reserved until contracts ship.",
  },
] as const;

const CONTRACT_SHORTCUTS = [
  {
    label: "SYN token",
    address: CONTRACTS.SYN_CONTRACT_ADDRESS,
    href: SYN_EXPLORERS.avascan,
  },
  {
    label: "Sale contract",
    address: CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS,
    href: explorerUrlFor("MEMBERSHIP_SALE_CONTRACT_ADDRESS"),
  },
  {
    label: "Archive1155",
    address: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS,
    href: ARCHIVE_NFT_EXPLORERS.avascan,
  },
  {
    label: "SYN/USDC LP",
    address: LP_POOL.pairAddress,
    href: explorerUrlForAddress(LP_POOL.pairAddress),
  },
] as const;

type QuickAction = {
  label: string;
  href: string;
  tone: "primary" | "secondary";
  external?: boolean;
};

const ACTIONS: QuickAction[] = [
  { label: "Join", href: "/join", tone: "primary" },
  { label: "Token", href: "/token", tone: "secondary" },
  { label: "Liquidity", href: "/liquidity", tone: "secondary" },
  { label: "Registry", href: "/registry", tone: "secondary" },
  { label: "Trade SYN", href: LP_POOL.traderJoeUrl, tone: "secondary", external: true },
] as const;

export function HomeQuickAnswerRail() {
  return (
    <Section id="quick-answer" className="py-10 md:py-12">
      <GlassCard className="p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Pill tone="success">LIVE ON AVALANCHE</Pill>
              <Pill tone="gold">SYN = SEAT</Pill>
              <Pill tone="navy">VERIFY FIRST</Pill>
            </div>
            <h2 className="font-serif text-2xl md:text-3xl leading-tight text-foreground">
              The whole product in one scan.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Take a seat, receive SYN, verify the routing, then use My Syndicate as your member home. Deep protocol detail stays available below; the first decision does not require reading the whole site.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {ANSWERS.map((item) => (
                <article key={item.q} className="rounded-md border border-border/50 bg-background/45 p-3">
                  <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.q}
                  </div>
                  <p className="mt-1 text-sm leading-snug text-foreground">{item.a}</p>
                </article>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {ACTIONS.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  target={action.external ? "_blank" : undefined}
                  rel={action.external ? "noopener noreferrer" : undefined}
                  className={
                    action.tone === "primary"
                      ? "mono inline-flex min-h-10 items-center justify-center rounded-[3px] px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent-foreground)]"
                      : "mono inline-flex min-h-10 items-center justify-center rounded-[3px] border border-border/70 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground hover:border-[var(--gold)]/60"
                  }
                  style={action.tone === "primary" ? { background: "var(--accent)" } : undefined}
                >
                  {action.label}
                  {action.external ? " ↗" : ""}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border/60 bg-background/55 p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Quick proof
              </div>
              <a
                href="/registry"
                className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Full registry →
              </a>
            </div>
            <div className="grid gap-2">
              {CONTRACT_SHORTCUTS.map((item) => (
                <a
                  key={item.label}
                  href={item.href ?? "/registry"}
                  target={item.href?.startsWith("http") ? "_blank" : undefined}
                  rel={item.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center justify-between gap-3 rounded-md border border-border/45 bg-card/50 px-3 py-2 hover:border-[var(--gold)]/60"
                >
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-foreground">{item.label}</span>
                    <span className="mono block truncate text-[10px] text-muted-foreground">
                      <ShortAddress addr={item.address} />
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[9px] uppercase tracking-[0.18em] text-[var(--verify)]">
                    Verify ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}
