// Coming Next — 4-layer narrative strip.
//   PAST    · last sealed member (on-chain proof)
//   PRESENT · current chapter forming
//   NEXT    · next member number + remaining-to-close
//   FAR     · Genesis Signal → First Thousand → Expansion → First Ten Thousand horizon (visible-as-sealed)
//
// Every line answers "why should I care?" — anchored to on-chain facts.
// Pure derivation from useProtocolPulse + useHolderIndex + canonical
// chapters lib. Never invented.

import { Link } from "@tanstack/react-router";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useHolderIndex } from "@/lib/holder-index";
import { CHAPTERS as CANONICAL_CHAPTERS } from "@/lib/chapters";

const HORIZON = CANONICAL_CHAPTERS.filter((c) => c.id !== "open-era").map((c) => ({
  name: c.shortLabel,
  target: c.endN ?? Number.POSITIVE_INFINITY,
})) as ReadonlyArray<{ name: string; target: number }>;

function activeChapter(next: number | undefined) {
  if (next === undefined) return HORIZON[0];
  for (const h of HORIZON) if (next <= h.target) return h;
  return null;
}

function fmtAgo(s: number | undefined): string {
  if (s === undefined) return "—";
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function shortAddr(a: string | undefined): string {
  if (!a) return "—";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function AnticipationLine() {
  const p = useProtocolPulse();
  const idx = useHolderIndex();
  const next = p.nextMemberNumber;
  const members = idx.totals.members;
  const chapter = activeChapter(next);
  const remaining = next !== undefined && chapter ? Math.max(0, chapter.target - (next - 1)) : undefined;
  const lastMember = members > 0 ? members : undefined;

  return (
    <section aria-label="Coming next" className="border-y border-border/40 bg-[var(--gold)]/[0.025]">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-3 md:py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-x-6 gap-y-2 mono text-[11px] uppercase tracking-[0.14em]">
          {/* PAST */}
          <Layer tone="past" label="Past — sealed">
            {lastMember !== undefined && p.lastBuyBuyer ? (
              <>
                Member #{lastMember} · <span className="text-muted-foreground normal-case tracking-normal">{shortAddr(p.lastBuyBuyer)} · {fmtAgo(p.lastBuyAgoSeconds)}</span>
              </>
            ) : lastMember !== undefined ? (
              <>Member #{lastMember} recorded</>
            ) : (
              <span className="text-muted-foreground">No members sealed yet — be the first.</span>
            )}
          </Layer>

          {/* PRESENT */}
          <Layer tone="present" label="Present — forming">
            {chapter ? (
              <Link to="/chapters" className="hover:text-[var(--gold)] transition-colors">
                Chapter {chapter.name}
              </Link>
            ) : (
              <span className="text-muted-foreground">Open Era — beyond First Ten Thousand</span>
            )}
          </Layer>

          {/* NEXT */}
          <Layer tone="next" label="Next — your turn">
            {next !== undefined ? (
              <>
                <Link to="/join" className="text-foreground hover:text-[var(--gold)] transition-colors">
                  Member #{next}
                </Link>
                {remaining !== undefined && remaining > 0 && Number.isFinite(remaining) && (
                  <span className="text-muted-foreground normal-case tracking-normal"> · {remaining.toLocaleString("en-US")} until chapter closes</span>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">Reading the chain…</span>
            )}
          </Layer>

          {/* FAR */}
          <Layer tone="far" label="Far — horizon">
            <span className="text-foreground/85">
              Genesis Signal · First Thousand · Expansion · First Ten Thousand — each closes once, never reopens.
            </span>
          </Layer>
        </div>
      </div>
    </section>
  );
}

function Layer({ tone, label, children }: { tone: "past" | "present" | "next" | "far"; label: string; children: React.ReactNode }) {
  const dot =
    tone === "past"    ? "bg-muted-foreground/60" :
    tone === "present" ? "bg-sky-500" :
    tone === "next"    ? "bg-[var(--gold)] animate-pulse" :
                          "bg-amber-500/60";
  const labelColor =
    tone === "next" ? "text-[var(--gold)]" :
    tone === "present" ? "text-sky-700 dark:text-sky-400" :
    "text-muted-foreground";
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`flex items-center gap-1.5 text-[10px] ${labelColor}`}>
        <span className={`size-1.5 rounded-full ${dot}`} aria-hidden />
        {label}
      </span>
      <span className="text-foreground/90 leading-snug">{children}</span>
    </div>
  );
}
