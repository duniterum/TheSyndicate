// Plain-language FAQ for the public /nft (Archive) page.
// READ-ONLY. No write paths, no marketing claims, no banned copy.
// Client-side search filters the existing FAQ list — no server calls, no AI.
import { useState, useId, useMemo } from "react";
import { GlassCard, Section, SectionHeader } from "@/components/syndicate/Primitives";

type Item = { q: string; a: string };

const FAQ: Item[] = [
  {
    q: "Are NFTs live today?",
    a: "Yes — the Archive1155 contract is deployed on Avalanche and The First Signal (ID 1) public mint is OPEN at 0.50 USDC (wallet limit 5). Patron Seal (ID 3) is CONTRACT_GATED / PUBLIC_MINT_READ_GATED and only appears mintable from live Archive1155 reads. Other Artifacts are protocol-memory surfaces sealed by event.",
  },
  {
    q: "Can I mint now?",
    a: "The First Signal (ID 1) is the open public mint. Patron Seal (ID 3) is shown as mintable only when live contract reads say the connected wallet can mint it. No static public-open claim is made for ID 3.",
  },
  {
    q: "Are all Artifacts live?",
    a: "No. ID 1 (The First Signal) is open. ID 3 (Patron Seal) is contract/read gated. ID 2 is reserved for future SeatRecord721 identity, not a public Archive1155 mint. IDs 4–8 are roadmap previews and not active.",
  },
  {
    q: "Is there a marketplace?",
    a: "No. The Future Collector View is a preview only. No trading, listings, floor price, or volume is live here.",
  },
  {
    q: "What do Artifacts represent?",
    a: "They are collectible memories of The Syndicate story: chapters, milestones, support, hidden discoveries, and protocol moments.",
  },
  {
    q: "Do Artifacts give financial rights?",
    a: "No. They do not grant equity, debt, Vault ownership, LP ownership, revenue share, dividends, governance rights, rewards, or profit rights. The First Signal is a collectible record only.",
  },
  {
    q: "What is ID 2 / Seat Record?",
    a: "ID 2 is reserved and disabled in Archive1155 V1. SeatRecord721 is planned as a separate future ERC-721 identity layer.",
  },
];

export function ArchiveFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const baseId = useId();
  const searchId = `${baseId}-search`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQ.map((it, i) => ({ it, i }));
    return FAQ.map((it, i) => ({ it, i })).filter(
      ({ it }) =>
        it.q.toLowerCase().includes(q) || it.a.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <Section id="faq">
      <SectionHeader
        eyebrow="FAQ · plain language"
        title={<>Quick <span className="text-gradient-gold">answers</span></>}
        description="The honest state of the Archive today — in six short questions."
      />
      <GlassCard className="p-4 md:p-5">
        <div className="mb-3">
          <label htmlFor={searchId} className="sr-only">
            Search FAQ
          </label>
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search FAQ…"
            className="w-full rounded-md border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        {filtered.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3">No matching FAQ found.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map(({ it, i }) => {
              const isOpen = openIndex === i;
              const questionId = `${baseId}-q-${i}`;
              const answerId = `${baseId}-a-${i}`;

              return (
                <div key={it.q} className="py-3">
                  <button
                    type="button"
                    id={questionId}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-start justify-between gap-3 text-left rounded-sm px-1 -mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
                  >
                    <span className="text-sm font-semibold text-foreground">{it.q}</span>
                    <span className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground shrink-0 mt-0.5">
                      {isOpen ? "Close" : "Open"}
                    </span>
                  </button>
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    hidden={!isOpen}
                    className="mt-2"
                  >
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {it.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </Section>
  );
}
