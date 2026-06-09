import { Link } from "@tanstack/react-router";
import { Section, SectionHeader } from "@/components/syndicate/Primitives";

type Module = {
  label: string;
  value: string;
  status: "live" | "pending" | "info";
  href?: string;
  detail: string;
};

const MODULES: Module[] = [
  { label: "Chain",      value: "Avalanche", status: "info",    detail: "C-Chain · 43114",                href: "https://www.avax.network/" },
  { label: "Token",      value: "LIVE",      status: "live",    detail: "SYN ERC20 · fixed 1B supply",     href: "/token" },
  { label: "Sale",       value: "LIVE",      status: "live",    detail: "USDC → SYN @ $0.01",              href: "/join" },
  { label: "LP",         value: "LIVE",      status: "live",    detail: "Trader Joe SYN/USDC AMM",         href: "/liquidity" },
  { label: "Archive",    value: "LIVE",      status: "live",    detail: "Archive1155 · ID 1 mint open",     href: "/nfts" },
  { label: "Governance", value: "PENDING",   status: "pending", detail: "Snapshot / onchain voting",       href: "/registry" },
  { label: "Vault",      value: "PENDING",   status: "pending", detail: "Programmatic Vault contract",     href: "/vault" },
  { label: "AI",         value: "PENDING",   status: "pending", detail: "No AI module is live",            href: "/ai" },
];

export function ProtocolStatusGrid() {
  return (
    <Section id="protocol-status" className="py-12 md:py-16">
      <SectionHeader
        eyebrow="Protocol Status"
        title={<>What is <span className="text-gradient-gold">live</span> · what is pending</>}
        description="Same source of truth that powers the registry, transparency center, and roadmap."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {MODULES.map((m) => (
          <ModuleCell key={m.label} m={m} />
        ))}
      </div>
    </Section>
  );
}

function ModuleCell({ m }: { m: Module }) {
  const tone =
    m.status === "live"
      ? { ring: "border-emerald-500/50 hover:border-emerald-500", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" }
      : m.status === "pending"
        ? { ring: "border-amber-500/40 hover:border-amber-500", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" }
        : { ring: "border-border/60 hover:border-foreground/40", dot: "bg-foreground/60", text: "text-foreground" };

  const inner = (
    <article className={`surface elevated p-3 h-full flex flex-col gap-1.5 transition-colors ${tone.ring}`}>
      <div className="flex items-center gap-1.5">
        <span className={`size-1.5 rounded-full ${tone.dot} ${m.status === "live" ? "animate-pulse" : ""}`} />
        <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{m.label}</span>
      </div>
      <div className={`mono text-base font-semibold leading-none ${tone.text}`}>{m.value}</div>
      <div className="text-[10px] text-muted-foreground leading-snug">{m.detail}</div>
    </article>
  );

  if (!m.href) return inner;
  if (m.href.startsWith("http")) {
    return (
      <a href={m.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }
  return <Link to={m.href as any}>{inner}</Link>;
}
