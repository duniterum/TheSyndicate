// Compact glossary for status terms used around the Archive contract status.
// Plain-language, no write paths, no banned copy.
import { Pill } from "@/components/syndicate/Primitives";

const TERMS: Array<{ term: string; def: string }> = [
  { term: "DEPLOYED", def: "Archive1155 contract exists on Avalanche." },
  { term: "ACTIVE · MINT OPEN", def: "Public mint is open for this Artifact (ID 1 today)." },
  { term: "CONFIGURED · NOT ACTIVE", def: "Defined on the contract but mint is not enabled yet (e.g. ID 3 Patron Seal)." },
  { term: "RESERVED · DISABLED", def: "Slot reserved · not mintable in Archive1155 V1 (e.g. ID 2 Seat Record)." },
  { term: "PENDING SEPARATE CONTRACT", def: "Depends on a separate future contract (e.g. SyndicateSeatRecord721)." },
  { term: "READ-ONLY", def: "This surface only displays data for inactive IDs; it cannot change the contract." },
];

// Compact per-ID chip legend.
const ID_CHIPS: Array<{ term: string; def: string }> = [
  { term: "ACTIVE · MINT OPEN", def: "Public mint open (ID 1 only)." },
  { term: "CONFIGURED", def: "Artifact exists in the contract config." },
  { term: "RESERVED", def: "Slot reserved · not mintable." },
  { term: "NOT ACTIVE", def: "Public mint is not enabled yet." },
  { term: "READ PENDING", def: "On-chain data is still loading." },
  { term: "READ ERROR", def: "Read failed · no fake value is shown." },
];

export function ArchiveGlossary() {
  return (
    <div className="surface elevated p-4 mt-3">
      <div className="flex items-center gap-2 mb-2">
        <Pill tone="muted">GLOSSARY</Pill>
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          What these labels mean
        </span>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {TERMS.map((t) => (
          <div key={t.term} className="flex flex-col">
            <dt className="mono text-[10px] uppercase tracking-[0.18em] text-foreground">
              {t.term}
            </dt>
            <dd className="text-[11px] text-muted-foreground leading-snug">
              {t.def}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-3 border-t border-border/40 pt-3">
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
          ID status chips · read states
        </div>
        <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
          {ID_CHIPS.map((c) => (
            <li key={c.term} className="flex items-baseline gap-1.5">
              <span className="mono text-[10px] uppercase tracking-[0.18em] text-foreground">
                {c.term}
              </span>
              <span className="text-[11px] text-muted-foreground">{c.def}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
