// DEPRECATED. Do not use on public routes.
// Replaced by <MythologyWall /> (src/components/syndicate/MythologyWall.tsx)
// per docs/NFT_DESIRE_ARCHITECTURE_PASS.md. Preserved here for institutional
// memory only; classified ARCHIVE in src/labs/registry.ts.
//
// Artifact Universe Board — one visual map of the NFT layer (legacy six-family model).

import { Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";

type Family = {
  key: string;
  family: string;
  title: string;
  state: "LIVE" | "SEALED";
  sealingRule?: string;     // only for SEALED
  ctaHref?: string;         // only for LIVE
  ctaLabel?: string;
  blurb: string;
};

const FAMILIES: Family[] = [
  {
    key: "first-signal",
    family: "Chapter Artifact · ID 1",
    title: "The First Signal",
    state: "LIVE",
    ctaHref: "#first-signal-showcase",
    ctaLabel: "Mint The First Signal →",
    blurb: "The opening artifact of Chapter I. Public mint open on Avalanche — 0.50 USDC, wallet limit 5.",
  },
  {
    key: "patron-seal",
    family: "Patron · ID 3",
    title: "Patron Seal",
    state: "LIVE",
    ctaHref: "#patron-seal-readiness",
    ctaLabel: "Mint Patron Seal →",
    blurb: "A flat support artifact for early patrons. Public mint open on Avalanche — 5.00 USDC, wallet limit 5.",
  },
  {
    key: "seat-record",
    family: "Identity · future contract",
    title: "Seat Record",
    state: "SEALED",
    sealingRule: "Identity layer — sealed until its own contract opens.",
    blurb: "Your numbered seat will live in a separate ERC-721 contract, not in this collection. Joining now permanently records your member number and chapter on-chain.",
  },
  {
    key: "protocol-memory",
    family: "Protocol Memory · IDs 4–8",
    title: "Protocol Memory",
    state: "SEALED",
    sealingRule: "Sealed by the protocol — released only by named on-chain events.",
    blurb: "Memory artifacts the protocol writes for itself when a milestone seals. Not a public mint. Not for sale.",
  },
  {
    key: "secret-artifact",
    family: "Hidden archive",
    title: "Secret Artifact",
    state: "SEALED",
    sealingRule: "Sealed until discovered.",
    blurb: "A future archive entry whose conditions are not yet public. Witnessed by members who are present when it opens.",
  },
  {
    key: "protocol-chronicle",
    family: "Season Finale · ID 9",
    title: "Protocol Chronicle",
    state: "SEALED",
    sealingRule: "Sealed until the season closes.",
    blurb: "The closing record of Chapter I. Written only when the chapter ends, witnessed only by those who were already in the archive.",
  },
];

export function ArtifactUniverseBoard() {
  return (
    <Section id="artifact-universe-board">
      <SectionHeader
        eyebrow="The Archive Universe"
        title={<>One archive, <span className="text-gradient-gold">six families</span></>}
        description="The Syndicate Archive is one on-chain memory engine. Two artifacts are live and mintable today. The others are sealed by the protocol and open only when their on-chain event arrives — by event, by chapter, by discovery."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FAMILIES.map((f) => <FamilyCard key={f.key} f={f} />)}
      </div>

      <p className="mt-6 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">
        Live = public mint open today · Sealed = on-chain event has not occurred yet
      </p>
    </Section>
  );
}

function FamilyCard({ f }: { f: Family }) {
  const live = f.state === "LIVE";
  return (
    <div
      className="relative surface elevated p-5 flex flex-col gap-3 h-full"
      style={{
        borderColor: live ? "color-mix(in oklab, var(--gold) 35%, transparent)" : "var(--border)",
        background: live
          ? "color-mix(in oklab, var(--gold) 4%, var(--background))"
          : "color-mix(in oklab, var(--foreground) 2%, var(--background))",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {f.family}
        </span>
        {live
          ? <Pill tone="success">LIVE</Pill>
          : <Pill tone="muted">SEALED</Pill>}
      </div>

      <h3 className="font-serif text-2xl text-foreground leading-tight">{f.title}</h3>

      {/* Sealed visual mark — intentional, not missing */}
      {!live && (
        <div
          aria-hidden
          className="my-1 flex items-center justify-center h-20 rounded-md border border-dashed"
          style={{ borderColor: "color-mix(in oklab, var(--foreground) 22%, transparent)" }}
        >
          <span className="font-serif text-3xl text-muted-foreground/80 select-none" title="Sealed">⚜</span>
        </div>
      )}

      <p className="text-sm text-foreground/80 leading-relaxed">{f.blurb}</p>

      {!live && f.sealingRule && (
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
          {f.sealingRule}
        </p>
      )}

      {live && f.ctaHref && f.ctaLabel && (
        <a
          href={f.ctaHref}
          className="mt-auto inline-flex items-center justify-center rounded-md px-3 py-2 mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.22_0.025_260)]"
          style={{ background: "var(--gradient-gold)" }}
        >
          {f.ctaLabel}
        </a>
      )}

      <p className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
        {live ? "On-chain SVG · site presentation framed" : "Sealed visual · site presentation only"}
      </p>
    </div>
  );
}
