// Protocol Engines panel — an honest status board for what the protocol runs.
//
// Static projection of engine state. Each engine is labeled by its real maturity:
//   LIVE    — on-chain and verifiable today (links to its proof surface)
//   PREVIEW — staged, not yet live (no link, amber)
//   FUTURE  — direction, not deployed (no link, muted)
//
// Tone is deliberate: status is encoded ONLY in emerald / amber / muted — never
// gold (gold is identity, not a status) and never red (red is risk). Gold appears
// only as the generic interactive hover accent, matching the rest of the site.
// This panel does NOT wire the protocol-actions shell; it makes no new claim.

import { Section, SectionHeader } from "./Primitives";
import { PROTOCOL_STATUS } from "@/lib/syndicate-config";

type EngineStatus = "LIVE" | "PREVIEW" | "FUTURE";

type Engine = {
  key: string;
  label: string;
  status: EngineStatus;
  blurb: string;
  href?: string;
  // Canonical backing: the `key` of a PROTOCOL_STATUS item whose on-chain
  // status this engine's LIVE claim depends on. A LIVE engine MUST be backed
  // by a live registry item (enforced by validateEngineStatuses + its guard
  // test) so a contract flipping to pending can never silently contradict the
  // panel. PREVIEW / FUTURE concepts (Burn, Referral, Marketplace) have no
  // contract-status entry in the registries today, so they carry no backing.
  backing?: string;
};

const ENGINES: Engine[] = [
  {
    key: "sale",
    label: "Membership Sale",
    status: "LIVE",
    blurb: "USDC → SYN, routed 70 / 20 / 10 on-chain.",
    href: "/transparency",
    backing: "sale",
  },
  {
    // Deliberately backed by the live Membership Sale (the 70% routing happens
    // inside the sale contract), NOT the pending "vault" programmatic contract.
    // This is why the engine is "Vault Wallet" (live wallet) and not the Vault
    // Contract (pending). Re-pointing this to "vault" would correctly trip the
    // guard, since that contract is not deployed.
    key: "vault",
    label: "Vault Wallet",
    status: "LIVE",
    blurb: "70% of every purchase routes to a public on-chain wallet.",
    href: "/vault",
    backing: "sale",
  },
  {
    key: "liquidity",
    label: "Liquidity",
    status: "LIVE",
    blurb: "20% deepens the SYN / USDC pool on Trader Joe.",
    href: "/liquidity",
    backing: "lp",
  },
  {
    // On-chain transfer-burn (Proof of Burn #001) — a real fact, but it has no
    // contract-status entry in the registries, so it carries no backing.
    key: "burn",
    label: "Burn",
    status: "LIVE",
    blurb: "Supply sent to the dead address — Proof of Burn.",
    href: "/activity",
  },
  {
    key: "nft",
    label: "NFT / Artifacts",
    status: "LIVE",
    blurb: "Archive artifacts minted on-chain.",
    href: "/nft",
    backing: "archive",
  },
  {
    key: "referral",
    label: "Referral",
    status: "PREVIEW",
    blurb: "Commission routing — staged, not yet live.",
  },
  {
    key: "marketplace",
    label: "Marketplace",
    status: "FUTURE",
    blurb: "Secondary identity surfaces — direction, not deployed.",
  },
];

// ─── Sync guard: engine LIVE claims must agree with the canonical registry ───
// PROTOCOL_STATUS (src/lib/syndicate-config.ts) is the single source of truth
// for contract status. An engine that asserts LIVE while its backing registry
// item is pending (or names a non-existent key) is a drift bug. Pure + exported
// so the guard test can assert it stays empty.
export type EngineStatusViolation = {
  engine: string;
  backing?: string;
  reason: "unknown-backing" | "live-but-backing-pending";
};

export function validateEngineStatuses(
  engines: Engine[] = ENGINES,
): EngineStatusViolation[] {
  const violations: EngineStatusViolation[] = [];
  for (const e of engines) {
    if (!e.backing) continue;
    const item = PROTOCOL_STATUS.find((p) => p.key === e.backing);
    if (!item) {
      violations.push({ engine: e.key, backing: e.backing, reason: "unknown-backing" });
      continue;
    }
    if (e.status === "LIVE" && item.status !== "live") {
      violations.push({ engine: e.key, backing: e.backing, reason: "live-but-backing-pending" });
    }
  }
  return violations;
}

export { ENGINES };

const STATUS_STYLE: Record<EngineStatus, { dot: string; chip: string }> = {
  LIVE: {
    dot: "bg-emerald-500",
    chip: "border-emerald-500/40 text-emerald-400 bg-emerald-500/[0.06]",
  },
  PREVIEW: {
    dot: "bg-amber-400",
    chip: "border-amber-500/40 text-amber-300 bg-amber-500/[0.06]",
  },
  FUTURE: {
    dot: "bg-muted-foreground/50",
    chip: "border-border/60 text-muted-foreground bg-foreground/[0.02]",
  },
};

export function ProtocolEnginesPanel() {
  return (
    <Section id="protocol-engines">
      <SectionHeader
        eyebrow="Protocol engines"
        title={<>What is <span className="text-gradient-gold">running</span></>}
        description="Each engine is labeled by its real state: LIVE engines are on-chain and verifiable today; PREVIEW is staged; FUTURE is direction, not deployed."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {ENGINES.map((e) => (
          <EngineCard key={e.key} engine={e} />
        ))}
      </div>
    </Section>
  );
}

function EngineCard({ engine }: { engine: Engine }) {
  const s = STATUS_STYLE[engine.status];
  const inner = (
    <div
      className={`surface p-4 h-full flex flex-col gap-2 transition-colors ${
        engine.href ? "hover:border-[var(--gold)]/40" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold tracking-tight text-foreground">
          {engine.label}
        </span>
        <span
          className={`mono inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 text-[8px] uppercase tracking-[0.16em] ${s.chip}`}
        >
          <span className={`size-1.5 rounded-full ${s.dot}`} />
          {engine.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{engine.blurb}</p>
      {engine.href && (
        <span className="mono mt-auto text-[9px] uppercase tracking-[0.18em] text-[var(--navy-soft)] group-hover:text-[var(--gold)] transition-colors">
          Open →
        </span>
      )}
    </div>
  );

  return engine.href ? (
    <a href={engine.href} aria-label={`Open ${engine.label}`} className="block group">
      {inner}
    </a>
  ) : (
    inner
  );
}
