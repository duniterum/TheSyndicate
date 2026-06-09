// DEPRECATED. Do not use on public routes.
// Replaced by <MythologyWall /> per docs/NFT_DESIRE_ARCHITECTURE_PASS.md.
// Preserved here for institutional memory; classified ARCHIVE in src/labs/registry.ts.
//
// Future Collector View — legacy preview-only filter chrome for browsing the Archive.
// No marketplace, no trading, no listings. Filters scope a static preview catalog.
import { useMemo, useState } from "react";
import { GlassCard, Pill, Section, SectionHeader } from "@/components/syndicate/Primitives";
import { ArtifactPreviewArtwork } from "@/components/syndicate/ArtifactPreviewArtwork";
import {
  PREVIEW_ARTIFACTS,
  VISUAL_FAMILY_LABEL,
  type PreviewArtifact,
  type PreviewVisualFamily,
} from "@/lib/archive-preview-catalog";

type CategoryFilter = "ALL" | "Chapter" | "Seal" | "Secret" | "Milestone" | "Liquidity" | "Legacy" | "Reserved";
type StatusFilter = "ALL" | "ACTIVE" | "CONFIGURED" | "RESERVED" | "ROADMAP";
type TypeFilter = "ALL" | PreviewVisualFamily;
type ChapterFilter = "ALL" | string;
type OwnedFilter = "ALL" | "NOT_OWNED";

function categoryOf(a: PreviewArtifact): CategoryFilter {
  if (a.status === "RESERVED_DISABLED") return "Reserved";
  if (a.visualFamily === "SEAL") return "Seal";
  if (a.visualFamily === "PIXEL_SECRET") return "Secret";
  if (a.visualFamily === "LEGACY") return "Legacy";
  if (a.category.toLowerCase().includes("liquidity")) return "Liquidity";
  if (a.category.toLowerCase().includes("milestone")) return "Milestone";
  return "Chapter";
}

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "ALL", "Chapter", "Seal", "Secret", "Milestone", "Liquidity", "Legacy", "Reserved",
];
const STATUS_OPTIONS: StatusFilter[] = ["ALL", "ACTIVE", "CONFIGURED", "RESERVED", "ROADMAP"];
const TYPE_OPTIONS: TypeFilter[] = ["ALL", "ARTIFACT_CARD", "SEAL", "PIXEL_SECRET", "CERTIFICATE", "LEGACY"];
const OWNED_OPTIONS: OwnedFilter[] = ["ALL", "NOT_OWNED"];

export function FutureCollectorView() {
  const [cat, setCat] = useState<CategoryFilter>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [type, setType] = useState<TypeFilter>("ALL");
  const [chap, setChap] = useState<ChapterFilter>("ALL");
  const [owned, setOwned] = useState<OwnedFilter>("ALL");

  const chapterOptions = useMemo<ChapterFilter[]>(() => {
    const set = new Set<string>();
    PREVIEW_ARTIFACTS.forEach((a) => {
      if (a.chapterLabel && a.chapterLabel !== "—") set.add(a.chapterLabel);
    });
    return ["ALL", ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return PREVIEW_ARTIFACTS.filter((a) => {
      if (cat !== "ALL" && categoryOf(a) !== cat) return false;
      if (status !== "ALL") {
        const map: Record<Exclude<StatusFilter, "ALL">, PreviewArtifact["status"]> = {
          ACTIVE: "ACTIVE_MINT_OPEN",
          CONFIGURED: "DEPLOYED_CONFIGURED",
          RESERVED: "RESERVED_DISABLED",
          ROADMAP: "ROADMAP",
        };
        if (a.status !== map[status]) return false;
      }
      if (type !== "ALL" && a.visualFamily !== type) return false;
      if (chap !== "ALL" && a.chapterLabel !== chap) return false;
      // Ownership is not wired in this preview — NOT_OWNED returns all,
      // owned-only intentionally omitted to avoid implying ownership.
      if (owned === "NOT_OWNED") return true;
      return true;
    });
  }, [cat, status, type, chap, owned]);

  return (
    <Section id="future-collector">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Pill tone="gold">PREVIEW</Pill>
        <Pill tone="muted">NO MARKETPLACE LIVE</Pill>
      </div>
      <SectionHeader
        eyebrow="Future Collector View"
        title={<>How collectors may <span className="text-gradient-gold">browse</span> later</>}
        description="Future collector view preview. No marketplace is live. No buying or selling is available here. Filters scope the visual preview only."
      />

      <GlassCard className="p-4 md:p-5">
        <div className="flex flex-wrap gap-3 text-[11px]">
          <FilterGroup label="Category" value={cat} options={CATEGORY_OPTIONS} onChange={setCat} />
          <FilterGroup label="Status"   value={status} options={STATUS_OPTIONS} onChange={setStatus} />
          <FilterGroup label="Type"     value={type} options={TYPE_OPTIONS} onChange={setType} render={(v) => v === "ALL" ? "ALL" : VISUAL_FAMILY_LABEL[v]} />
          <FilterGroup label="Chapter"  value={chap} options={chapterOptions} onChange={setChap} />
          <FilterGroup label="Ownership" value={owned} options={OWNED_OPTIONS} onChange={setOwned} render={(v) => v === "ALL" ? "ALL" : "NOT OWNED"} />
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((a) => (
            <div key={a.id} className="surface elevated overflow-hidden">
              <div className="image-frame aspect-[16/10]">
                <ArtifactPreviewArtwork artifact={a} />
              </div>
              <div className="p-3">
                <div className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                  ID {a.id} · {categoryOf(a)}
                </div>
                <div className="text-sm font-semibold text-foreground">{a.name}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-xs text-muted-foreground">
              No artifacts match these filters.
            </div>
          )}
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
          No floor price. No volume. No trading. No listings. This view exists
          only to show how categories, chapters, types and ownership filters
          may later be presented when the Archive is active and a collector
          surface exists.
        </p>
      </GlassCard>
    </Section>
  );
}

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  render = (v) => String(v),
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render?: (v: T) => string;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {options.map((o) => {
        const active = o === value;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`mono text-[9px] uppercase tracking-[0.18em] rounded-full border px-2 py-0.5 transition-colors ${
              active
                ? "border-[var(--gold)]/60 text-foreground bg-[var(--gold)]/10"
                : "border-border/60 text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground"
            }`}
          >
            {render(o)}
          </button>
        );
      })}
    </div>
  );
}
