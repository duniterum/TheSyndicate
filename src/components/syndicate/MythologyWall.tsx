// MythologyWall — 9-slot premium mythology wall for /nft and /archive.
//
// Public surface: mythology only. Five visitor states (OPEN · IDENTITY ·
// HIDDEN · ARMED · FAR HORIZON). Operator vocabulary lives ONE LAYER
// DEEPER, inside the proof drawer.
//
// Card content (primary):
//   - Roman numeral · Artifact name
//   - State badge (visitor vocabulary only)
//   - One-line mythology copy
//   - One cliffhanger / sealing line for sealed slots
//   - CTA only when state === "OPEN"
//   - Member overlay (YOU HOLD) only when balanceOf > 0
//
// Authority: docs/NFT_DESIRE_ARCHITECTURE_PASS.md
//            docs/NFT_ARCHIVE_PRODUCT_RECALIBRATION.md
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Section, SectionHeader, Pill } from "@/components/syndicate/Primitives";
import { ArchiveOnchainImage } from "@/components/syndicate/ArchiveOnchainImage";
import {
  ACTS,
  MYTHOLOGY_SLOTS,
  STATE_LABEL,
  type MythologySlot,
  type PublicSlotState,
} from "@/lib/mythology-wall-catalog";
import {
  PREVIEW_ARTIFACTS,
  type PreviewArtifact,
} from "@/lib/archive-preview-catalog";
import { useArchiveArtifactReads } from "@/lib/archive-nft-hooks";
import { useArchiveBalances } from "@/lib/archive-balances-hook";
import {
  ARCHIVE_NFT_CONTRACT_ADDRESS,
  ARCHIVE_NFT_EXPLORERS,
} from "@/lib/syndicate-config";

const ALL_IDS = MYTHOLOGY_SLOTS.map((s) => s.id);

// State → pill tone mapping. Strictly visitor vocabulary.
function stateTone(state: PublicSlotState): React.ComponentProps<typeof Pill>["tone"] {
  switch (state) {
    case "OPEN":        return "success";
    case "IDENTITY":    return "navy";
    case "HIDDEN":      return "muted";
    case "ARMED":       return "gold";
    case "FAR_HORIZON": return "warning";
  }
}

export function MythologyWall() {
  const reads = useArchiveArtifactReads(ALL_IDS);
  const balances = useArchiveBalances([1, 3]); // only OPEN slots have public mints
  const [openId, setOpenId] = useState<number | null>(null);
  const openSlot = useMemo(
    () => MYTHOLOGY_SLOTS.find((s) => s.id === openId) ?? null,
    [openId],
  );

  return (
    <Section id="mythology-wall">
      <SectionHeader
        eyebrow="The Archive · Chapter I"
        title={<>Nine artifacts. <span className="text-gradient-gold">One protocol mythology.</span></>}
        description="The Archive is the protocol writing its public history through artifacts. Two slots are open today. The others are sealed by on-chain events — each one an event waiting to happen."
      />

      <div className="space-y-10">
        {ACTS.map((act) => {
          const slots = MYTHOLOGY_SLOTS.filter((s) => s.act === act.key);
          return (
            <div key={act.key}>
              <div className="flex items-baseline gap-3 mb-4 border-b border-border/60 pb-2">
                <span className="font-serif text-3xl text-[var(--gold)]/80">{act.numeral}</span>
                <h3 className="font-serif text-xl text-foreground">Act {act.numeral} · {act.title}</h3>
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground hidden sm:inline">
                  {act.subtitle}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {slots.map((s) => (
                  <SlotCard
                    key={s.id}
                    slot={s}
                    held={(balances.balances[s.id]?.balance ?? 0n) > 0n}
                    onOpen={() => setOpenId(s.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-8 mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground text-center">
        Public surface = mythology · Proof drawer = mechanics · Tap any artifact for proof
      </p>

      <SlotProofDrawer
        slot={openSlot}
        onClose={() => setOpenId(null)}
        reads={reads}
      />
    </Section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Slot card                                                                  */
/* -------------------------------------------------------------------------- */

function SlotCard({
  slot,
  held,
  onOpen,
}: {
  slot: MythologySlot;
  held: boolean;
  onOpen: () => void;
}) {
  const isOpen = slot.state === "OPEN";
  const isHidden = slot.state === "HIDDEN";
  const isFar = slot.state === "FAR_HORIZON";

  const frameStyle: React.CSSProperties = isOpen
    ? {
        borderColor: "color-mix(in oklab, var(--gold) 45%, transparent)",
        background:
          "linear-gradient(180deg, color-mix(in oklab, var(--gold) 6%, var(--background)) 0%, var(--background) 80%)",
      }
    : isHidden
    ? {
        borderColor: "color-mix(in oklab, var(--foreground) 12%, transparent)",
        background: "color-mix(in oklab, var(--foreground) 3%, var(--background))",
      }
    : {
        borderColor: "color-mix(in oklab, var(--foreground) 18%, transparent)",
        background: "color-mix(in oklab, var(--foreground) 2%, var(--background))",
      };

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Open proof drawer for ${slot.roman} · ${slot.name}`}
      className="group surface elevated text-left p-5 flex flex-col gap-3 h-full transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/60 relative"
      style={frameStyle}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Chapter I · Slot {slot.roman}
          </span>
          <span className="font-serif text-4xl text-foreground/90 leading-none mt-1">{slot.roman}</span>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Pill tone={stateTone(slot.state)}>{STATE_LABEL[slot.state]}</Pill>
          {held && <Pill tone="gold">YOU HOLD</Pill>}
        </div>
      </div>

      {/* Visual frame */}
      <div
        aria-hidden
        className="relative my-1 aspect-[4/3] rounded-md overflow-hidden border"
        style={{
          borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)",
          background: isOpen
            ? "var(--background)"
            : "color-mix(in oklab, var(--foreground) 4%, var(--background))",
        }}
      >
        {isOpen ? (
          <ArchiveOnchainImage id={slot.id} alt={slot.name} className="h-full w-full" />
        ) : isHidden ? (
          <HiddenVisual />
        ) : isFar ? (
          <SealedVisual roman={slot.roman} accent={slot.accent} dashed />
        ) : (
          <SealedVisual roman={slot.roman} accent={slot.accent} />
        )}
      </div>

      <h3 className="font-serif text-2xl text-foreground leading-tight">{slot.name}</h3>
      <p className="text-sm text-foreground/80 leading-relaxed">
        {isHidden ? "A hidden discovery artifact." : slot.mythology}
      </p>

      {slot.sealingLine && !isOpen && (
        <p className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]/80">
          {slot.sealingLine}
        </p>
      )}

      {isOpen ? (
        <div className="mt-auto pt-2 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center justify-center rounded-md px-3 py-2 mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.22_0.025_260)]"
            style={{ background: "var(--gradient-gold)" }}
          >
            Mint now →
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Tap for proof
          </span>
        </div>
      ) : (
        <div className="mt-auto pt-2">
          <span className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Tap for proof →
          </span>
        </div>
      )}
    </button>
  );
}

function SealedVisual({ roman, accent, dashed = false }: { roman: string; accent: string; dashed?: boolean }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${dashed ? "border-dashed" : ""}`}
      style={{
        background: `radial-gradient(circle at 50% 40%, color-mix(in oklab, ${accent} 14%, transparent) 0%, transparent 65%)`,
      }}
    >
      <span
        className="font-serif text-[80px] leading-none select-none"
        style={{ color: `color-mix(in oklab, ${accent} 60%, var(--foreground) 30%)`, opacity: 0.55 }}
      >
        {roman}
      </span>
      <span
        aria-hidden
        className="absolute bottom-2 right-3 font-serif text-3xl text-muted-foreground/70"
        title="Sealed"
      >
        ⚜
      </span>
    </div>
  );
}

function HiddenVisual() {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        background:
          "repeating-linear-gradient(45deg, color-mix(in oklab, var(--foreground) 6%, transparent) 0 6px, transparent 6px 12px), var(--background)",
      }}
    >
      <span className="font-serif text-5xl text-muted-foreground/40 select-none">?</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Proof drawer (mechanics one layer deeper)                                  */
/* -------------------------------------------------------------------------- */

function SlotProofDrawer({
  slot,
  onClose,
  reads,
}: {
  slot: MythologySlot | null;
  onClose: () => void;
  reads: ReturnType<typeof useArchiveArtifactReads>;
}) {
  const ref: PreviewArtifact | undefined = useMemo(
    () => (slot ? PREVIEW_ARTIFACTS.find((a) => a.id === slot.id) : undefined),
    [slot],
  );
  const read = slot ? reads.reads[slot.id] : undefined;

  return (
    <Dialog open={slot !== null} onOpenChange={(v) => (!v ? onClose() : null)}>
      <DialogContent className="max-w-2xl">
        {slot && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-serif text-3xl text-[var(--gold)]/80">{slot.roman}</span>
                <Pill tone={stateTone(slot.state)}>{STATE_LABEL[slot.state]}</Pill>
              </div>
              <DialogTitle className="font-serif text-2xl">{slot.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Proof drawer for slot {slot.roman} · {slot.name}
              </DialogDescription>
            </DialogHeader>

            {/* Layer 1: Mythology */}
            <section className="space-y-1">
              <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Mythology
              </p>
              <p className="text-sm text-foreground/85">{slot.mythology}</p>
            </section>

            {/* Layer 2: Sealing condition */}
            <section className="space-y-1">
              <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Sealing condition
              </p>
              <p className="text-sm text-foreground/85">
                {slot.state === "OPEN"
                  ? "Public mint open on Avalanche."
                  : slot.sealingLine ?? "Sealed by a future on-chain event."}
              </p>
            </section>

            {/* Layer 3: Proof / mechanics */}
            <section className="space-y-2 border-t border-border/60 pt-4">
              <p className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Proof · mechanics
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <dt className="text-muted-foreground">Token ID</dt>
                <dd className="mono text-foreground">{slot.id}</dd>

                <dt className="text-muted-foreground">Contract</dt>
                <dd className="mono text-foreground break-all">
                  {ARCHIVE_NFT_CONTRACT_ADDRESS.slice(0, 10)}…
                  {ARCHIVE_NFT_CONTRACT_ADDRESS.slice(-6)}
                </dd>

                {ref?.targetPriceUsdc !== null && ref?.targetPriceUsdc !== undefined && (
                  <>
                    <dt className="text-muted-foreground">Reference price</dt>
                    <dd className="mono text-foreground">{ref.targetPriceUsdc.toFixed(2)} USDC</dd>
                  </>
                )}

                {read?.remainingSupply !== undefined && (
                  <>
                    <dt className="text-muted-foreground">Remaining supply</dt>
                    <dd className="mono text-foreground">{read.remainingSupply.toString()}</dd>
                  </>
                )}

                {read?.isMintableReference !== undefined && (
                  <>
                    <dt className="text-muted-foreground">Mintable (on-chain)</dt>
                    <dd className="mono text-foreground">
                      {read.isMintableReference ? "true" : "false"}
                    </dd>
                  </>
                )}

                {ref && (
                  <>
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="mono text-foreground">
                      {read?.artifact ? "Live on-chain read" : "Reference / catalog"}
                    </dd>
                  </>
                )}
              </dl>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={ARCHIVE_NFT_EXPLORERS.avascan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[10px] uppercase tracking-[0.22em] underline underline-offset-2 hover:text-[var(--gold)]"
                >
                  Verify on Avascan ↗
                </a>
                <a
                  href={ARCHIVE_NFT_EXPLORERS.snowtrace}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mono text-[10px] uppercase tracking-[0.22em] underline underline-offset-2 hover:text-[var(--gold)]"
                >
                  Snowtrace ↗
                </a>
              </div>
            </section>

            {/* Layer 4: Action — only for OPEN slots */}
            {slot.state === "OPEN" && (
              <section className="border-t border-border/60 pt-4">
                <a
                  href={slot.id === 1 ? "#first-signal-showcase" : "#patron-seal-readiness"}
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 mono text-[10px] uppercase tracking-[0.22em] text-[oklch(0.22_0.025_260)]"
                  style={{ background: "var(--gradient-gold)" }}
                >
                  Open mint flow →
                </a>
              </section>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
