import { useMemo, useState } from "react";
import { Section, SectionHeader } from "./Primitives";
import { LEGAL_DISCLAIMER } from "@/lib/syndicate-config";

type Category =
  | "Basics"
  | "SYN Token"
  | "Membership & Sale"
  | "Vault & Routing"
  | "Liquidity"
  | "Ranks & Identity"
  | "NFT Archive"
  | "Risk & Legal";

type Entry = { q: string; a: string; cat: Category };

const ENTRIES: Entry[] = [
  // Basics
  { cat: "Basics", q: "What is The Syndicate?", a: "A transparent on-chain protocol. Members join with USDC, receive SYN, build identity in a public archive, and follow a verifiable Vault and routing system." },
  { cat: "Basics", q: "What is verifiable today?", a: "SYN token contract, Membership Sale contract, the Vault / Liquidity / Operations wallets, every USDC purchase, every 70/20/10 routing transfer, every SYN allocation wallet, and the SYN/USDC LP on Trader Joe. All live on Avalanche C-Chain, verifiable on Avascan, Sourcify, and Routescan." },
  { cat: "Basics", q: "What is PENDING vs LIVE?", a: "LIVE means the contract is deployed and the data is read directly from chain. PENDING means the underlying primitive (programmatic Vault contract, Genesis NFT, on-chain governance, AI Layer) is not yet deployed and is clearly labeled — never mixed with live numbers." },
  { cat: "Basics", q: "Why early matters?", a: "The first members shape culture, get the lowest Founder Numbers, and are visible in the public archive forever. Recognition and archive placement compound for those present at the start — no bonus tokens, no yield." },

  // SYN
  { cat: "SYN Token", q: "What is SYN?", a: "A fixed-supply ERC20 utility token on Avalanche C-Chain. SYN powers membership rank, identity in the archive, future governance, and access to Syndicate participation. It is not equity, not a security, and not a claim on Vault assets." },
  { cat: "SYN Token", q: "Is SYN live?", a: "Yes. SYN is deployed at 0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170 on Avalanche C-Chain and verified on Avascan, Sourcify, and Routescan." },
  { cat: "SYN Token", q: "Is the token mintable?", a: "No. Fixed supply of 1,000,000,000 SYN. No mint function exists." },
  { cat: "SYN Token", q: "Can the owner change the token?", a: "No. The ERC20 has no owner, no admin, no upgrade path, no pause, no blacklist, no whitelist, no max wallet, no max tx, and 0% tax." },
  { cat: "SYN Token", q: "Where will buyer SYN come from?", a: "From the Membership Distribution wallet (0x975a…Cec8), which holds 350,000,000 SYN (35% of total supply). The Sale contract pulls from this allocation." },

  // Membership & Sale
  { cat: "Membership & Sale", q: "How do I become a member?", a: "Go to /join, connect a wallet on Avalanche C-Chain, approve USDC, and call buy() on the live Membership Sale contract. Minimum entry is 5 USDC. Rate is fixed: 1 SYN = $0.01 USDC." },
  { cat: "Membership & Sale", q: "Can larger members get cheaper tokens?", a: "No. Same fixed rate for every wallet. Larger purchases unlock higher ranks and archive recognition — never bonus tokens, never a better rate." },
  { cat: "Membership & Sale", q: "Can I buy a custom amount?", a: "Yes. Any USDC amount above the $5 minimum works." },
  { cat: "Membership & Sale", q: "What changes after I join?", a: "You receive a permanent Founder Number, an on-chain SYN balance, a rank, an entry in the public archive, and visibility in future identity and verification modules as they ship." },

  // Vault & Routing
  { cat: "Vault & Routing", q: "Where does my USDC go?", a: "Every USDC purchase is split inside the Membership Sale contract: 70% to the Vault Wallet, 20% to the Liquidity Wallet, 10% to the Operations Wallet. Every transfer is visible on Avascan." },
  { cat: "Vault & Routing", q: "Do members own the Vault?", a: "No. The Vault is a protocol-owned resource. SYN does not represent ownership of, or a claim on, Vault assets." },
  { cat: "Vault & Routing", q: "What is the Vault Wallet vs the Vault Contract?", a: "Today, the Vault is a public allocation wallet on Avalanche — every inflow is on-chain. The programmatic Vault contract (deposit accounting, policy enforcement, withdrawal logic) is PENDING and clearly labeled wherever it appears." },
  { cat: "Vault & Routing", q: "Are there dividends or yield?", a: "No. There is no dividend, no yield product, no passive income, and no guaranteed return of any kind." },

  // Liquidity
  { cat: "Liquidity", q: "Where can I trade SYN?", a: "On Trader Joe, in the live SYN/USDC pool (0xe124…9389) on Avalanche C-Chain. The pool is a classic AMM (JLP) — not Liquidity Book / DLMM." },
  { cat: "Liquidity", q: "Why is liquidity small right now?", a: "The initial pool is a verification seed (200 SYN + 2 USDC at $0.01). Depth grows as the Liquidity Wallet — which receives 20% of every USDC purchase — is deployed into the pool over time, and as LPs add liquidity." },
  { cat: "Liquidity", q: "How is SYN price calculated?", a: "Implied price = USDC reserve ÷ SYN reserve, read live from the pair contract via getReserves(). Initial price anchor was $0.01." },
  { cat: "Liquidity", q: "Are LP providers guaranteed rewards?", a: "No. Providing liquidity carries impermanent loss, price, and smart-contract risk. Any future LP recognition is not promised, not yield, and not guaranteed." },
  { cat: "Liquidity", q: "What risks do LP providers face?", a: "Impermanent loss, price movement, smart-contract risk, low-liquidity slippage, and total loss. Providing liquidity is risky." },

  // Ranks & Identity
  { cat: "Ranks & Identity", q: "What is a Founder Number?", a: "A permanent archive ID assigned in join order. The first members carry the lowest numbers forever." },
  { cat: "Ranks & Identity", q: "How do ranks work?", a: "Rank is derived directly from on-chain SYN balance — there are twelve tiers from Citizen to Genesis Circle. Ranks unlock archive recognition and visibility, never bonus tokens or a better rate." },
  { cat: "Ranks & Identity", q: "Do ranks give cheaper SYN?", a: "No. Rank reflects status, visibility, and future module access only. Token price is fixed for everyone." },

  // NFT Archive
  { cat: "NFT Archive", q: "What is the NFT Archive?", a: "The NFT Archive is the collectible memory layer of The Syndicate on Avalanche. The Archive1155 contract is deployed; The First Signal (ID 1) is an open public Artifact mint — OPEN at 0.50 USDC (wallet limit 5). Other Artifact IDs remain inactive. Artifacts do not grant equity, debt, Vault ownership, dividends, revenue share, governance rights, or promises of profit." },
  { cat: "NFT Archive", q: "Are Archive Artifacts NFTs?", a: "Yes — Archive Artifacts are ERC-1155 NFTs on Avalanche, served by the deployed SyndicateArchive1155 contract. Only ID 1 is mintable today; other IDs are configured-not-active or pending a separate future contract." },
  { cat: "NFT Archive", q: "Are any NFTs live today?", a: "Yes. The First Signal (ID 1) public mint is OPEN on Avalanche at 0.50 USDC, wallet limit 5. All other Artifacts are protocol-memory surfaces sealed by event — no other mint, waitlist, or allocation today." },
  { cat: "NFT Archive", q: "What is a Seat Record?", a: "A Seat Record is the planned optional Artifact that timestamps a Membership Sale purchase, encoding member number, chapter, and block height. It lives in a separate future ERC-721 contract (SyndicateSeatRecord721) — not yet deployed." },
  { cat: "NFT Archive", q: "Do NFT Archive Artifacts give financial rights?", a: "No. Artifacts are an optional memory layer. They are not equity, not debt, not Vault ownership, not dividend instruments, not revenue share, not governance rights, and not promises of profit. Participation may result in total loss." },
  { cat: "NFT Archive", q: "What does PENDING SEPARATE CONTRACT mean?", a: "It means the artifact depends on a future contract distinct from Archive1155 — for example SyndicateSeatRecord721. The Archive1155 contract itself is deployed and verified on Avalanche; The First Signal (ID 1) is mintable today." },

  // Risk & Legal
  { cat: "Risk & Legal", q: "Is this an investment?", a: "No. SYN is utility access for rank, identity, and participation — not equity, debt, dividend, or a Vault claim." },
  { cat: "Risk & Legal", q: "Can I lose money?", a: "Yes. Participation may result in total loss of contributed value. Only join if you fully understand the risks." },
  { cat: "Risk & Legal", q: "What is LIVE vs PENDING?", a: "LIVE modules (SYN, Sale, LP, routing wallets) display chain-verified data read directly from Avalanche RPC. PENDING modules (programmatic Vault contract, on-chain governance, identity NFT) are clearly labeled and never mixed with live numbers — the UI shows PENDING until the underlying contract is deployed." },
];

const CATEGORIES: Category[] = [
  "Basics",
  "SYN Token",
  "Membership & Sale",
  "Vault & Routing",
  "Liquidity",
  "Ranks & Identity",
  "NFT Archive",
  "Risk & Legal",
];

export function FaqRebuilt() {
  const [active, setActive] = useState<Category | "All">("All");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ENTRIES.filter((e) => {
      const inCat = active === "All" ? true : e.cat === active;
      if (!inCat) return false;
      if (!q) return true;
      return (
        e.q.toLowerCase().includes(q) ||
        e.a.toLowerCase().includes(q) ||
        e.cat.toLowerCase().includes(q)
      );
    });
  }, [active, query]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: ENTRIES.length };
    for (const cat of CATEGORIES) c[cat] = ENTRIES.filter((e) => e.cat === cat).length;
    return c;
  }, []);

  const tabs: Array<Category | "All"> = ["All", ...CATEGORIES];

  return (
    <Section id="faq">
      <SectionHeader
        eyebrow="FAQ"
        title={<>Honest <span className="text-gradient-gold">answers</span>, structured by topic</>}
        description="Search, filter by category, and expand any question. Every answer is consistent with what is live, pending, and planned on-chain."
      />

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <label className="surface elevated flex items-center gap-2 px-3 py-2.5">
          <span aria-hidden className="mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Search</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Token, vault, routing, liquidity, ranks…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground/60"
            aria-label="Search FAQ"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </label>

        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const selected = active === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                aria-pressed={selected}
                className={`mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded border transition-colors ${
                  selected
                    ? "border-[var(--gold)]/60 bg-[var(--gold)]/10 text-foreground"
                    : "border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/40"
                }`}
              >
                {t} <span className="opacity-60">· {counts[t]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      <div className="mt-5 flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="surface p-6 text-sm text-muted-foreground">
            No questions match “{query}”. Try a shorter term, or clear the filter.
          </div>
        ) : (
          filtered.map((e, i) => {
            const key = `${e.cat}-${i}-${e.q}`;
            const isOpen = !!open[key];
            return (
              <article key={key} className="surface elevated">
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [key]: !s[key] }))}
                  aria-expanded={isOpen}
                  className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{e.cat}</span>
                    <span className="text-sm font-medium text-foreground">{e.q}</span>
                  </div>
                  <span
                    aria-hidden
                    className={`mono text-xs text-muted-foreground transition-transform ${isOpen ? "rotate-45" : ""}`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 -mt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {e.a}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border/60 p-5 bg-muted/20">
        <p className="text-xs text-muted-foreground leading-relaxed">{LEGAL_DISCLAIMER}</p>
      </div>
    </Section>
  );
}

export default FaqRebuilt;
