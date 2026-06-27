// THE SYNDICATE — brand + press single source of truth.
// Descriptions, palette, typography, channels, facts and language rules used by
// the Press Kit, Share Center, and share dialog. Canonical truths (routing,
// ZERO_SOURCE_ID, doctrine) match mock-data; everything else is prototype copy.

import { MOCK_DATA, ROUTING_SPLIT } from "./mock-data";

export const BRAND = {
  name: "The Syndicate",
  wordmark: "THE SYNDICATE",
  doctrine: MOCK_DATA.doctrine,
  loop: MOCK_DATA.loop, // Join, Prove, Remember, Return, Evolve
  shareLoop: ["Share", "Witness", "Invite", "Return"] as const,

  descriptions: {
    oneLine: "A transparent on-chain membership institution, forming in public.",
    short:
      "The Syndicate is the member app for a living, transparent protocol. Every membership routes USDC by a fixed, public split, every seat is proven on-chain, and the institution keeps evolving in public.",
    long:
      "The Syndicate is a premium, transparent membership institution built around proof rather than promises. Members take a binary on-chain seat; the capital they route is recorded as a verifiable receipt and split by one canonical rule — 70% Vault, 20% Liquidity, 10% Operations. Identity is multi-axis: capital is one recognition axis, not the whole person. There is no yield, no governance promise, and no treasury claim. The protocol publishes what is live and what is still a future module, archives its milestones as memory, and evolves in public as a series people can follow.",
  },

  // Honest brand-color note: the icon/mark is Signal Orange while the product
  // interface accent is Protocol Blue. Documented, not reconciled — changing the
  // app accent is out of scope for this pass.
  palette: [
    { name: "Signal Orange", role: "Icon / mark accent", hex: "#FF3C00", css: "#FF3C00", note: "Favicon + social mark color." },
    { name: "Protocol Blue", role: "Interface accent (dark)", hex: "#3B82F6", css: "hsl(217 91% 60%)", note: "Primary action color in dark mode." },
    { name: "Protocol Blue", role: "Interface accent (light)", hex: "#2563EB", css: "hsl(221 83% 53%)", note: "Primary action color in light mode." },
    { name: "Deep Navy", role: "Background (dark)", hex: "#060A14", css: "hsl(224 71% 4%)", note: "Dark-first canvas." },
    { name: "Slate Card", role: "Surface (dark)", hex: "#111A2E", css: "hsl(222 47% 11%)", note: "Card / panel surface." },
    { name: "Mist", role: "Foreground (dark)", hex: "#DEE5ED", css: "hsl(213 31% 91%)", note: "Primary text on dark." },
  ],

  statusColors: [
    { label: "LIVE NOW", tone: "Green", meaning: "Live module, verifiable." },
    { label: "READ-ONLY", tone: "Blue", meaning: "Visible, no writes." },
    { label: "IN REVIEW", tone: "Yellow", meaning: "Founder/operator review." },
    { label: "V1 CANDIDATE", tone: "Purple", meaning: "Scoped, not live." },
    { label: "FUTURE", tone: "Neutral", meaning: "Planned, not built." },
    { label: "SIMULATED PROTOTYPE", tone: "Orange", meaning: "UI demo, no contract logic." },
  ],

  typography: [
    { role: "Display / UI", family: "Inter", note: "Sans-serif, tight tracking for headings and UI." },
    { role: "Doctrine / quotes", family: "Georgia", note: "Serif, used for doctrine and editorial lines." },
    { role: "Proof / data", family: "Menlo", note: "Monospace for hashes, amounts and labels." },
  ],

  channels: {
    site: { label: "thesyndicate.money", url: "https://thesyndicate.money" },
    x: { label: "@TheSyndicateOne", url: "https://x.com/TheSyndicateOne" },
    telegram: { label: "t.me/TheSyndicateMoney", url: "https://t.me/TheSyndicateMoney" },
  },

  // Protocol facts for press — split by what is live vs not live in the prototype.
  facts: {
    routing: `${ROUTING_SPLIT.vault}% Vault / ${ROUTING_SPLIT.liquidity}% Liquidity / ${ROUTING_SPLIT.operations}% Operations`,
    chapter: `${MOCK_DATA.protocolStats.chapter} (${MOCK_DATA.protocolStats.chapterIndex}/${MOCK_DATA.protocolStats.chapterTotal})`,
    defaultSource: MOCK_DATA.defaultSourceId,
    accountingUnit: "SYN — accounting unit, not a financial right",
    seat: "Binary on-chain seat — held or not held, no tiers",
  },
  liveNow: [
    "Membership / Join engine",
    "My Syndicate proof dashboard",
    "Activity & Transparency (read-only)",
    "Archive / NFT memory",
    "Canonical 70% / 20% / 10% routing",
  ],
  notLive: [
    "Public referral / Verified Introduction (V1 candidate)",
    "Source dashboard and claim UI",
    "SeatRecord721 identity NFT",
    "ProductSaleRouter and SwapRail",
    "Dynamic OG / social card generation (backend required)",
  ],

  approvedLanguage: [
    "membership", "seat", "receipt", "proof", "routing", "contribution depth",
    "capital footprint", "protocol memory", "public verification",
    "living institution", "chapter", "evolution", "archive memory",
  ],
  bannedLanguage: [
    "yield", "ROI", "passive income", "governance promise", "treasury claim",
    "profit share", "financial rights", "MLM", "downline / upline",
    "guaranteed return", "investment",
  ],

  // OG / social preview concepts. Static previews only — no backend generation.
  ogPreviews: [
    { id: "home", label: "Homepage OG", desc: "Institution overview with chapter + routing.", status: "STATIC PREVIEW" as const },
    { id: "member", label: "Member Seat OG", desc: "Seat held, member number, chapter.", status: "CONCEPT ONLY" as const },
    { id: "receipt", label: "Receipt OG", desc: "USDC routed with 70% / 20% / 10% split.", status: "CONCEPT ONLY" as const },
    { id: "chapter", label: "Chapter Progress OG", desc: "Members toward chapter seal.", status: "CONCEPT ONLY" as const },
    { id: "episode", label: "Evolution Episode OG", desc: "Module moved / lifecycle event.", status: "CONCEPT ONLY" as const },
    { id: "archive", label: "Archive Memory OG", desc: "Artifact image + what it commemorates.", status: "CONCEPT ONLY" as const },
  ],

  // Existing brand image assets shipped in /public.
  assets: [
    { file: "/opengraph.jpg", label: "Default social preview", note: "Homepage OG image." },
    { file: "/artifact-1.png", label: "Archive artifact 1", note: "Genesis-era memory artifact." },
    { file: "/artifact-2.png", label: "Archive artifact 2", note: "V3 participant memory artifact." },
    { file: "/favicon.svg", label: "App icon / mark", note: "Signal Orange rounded mark." },
  ],

  mediaUsage: [
    "Use the wordmark and mark as provided; do not recolor or distort.",
    "Always pair claims with the live / not-live status as labeled here.",
    "Never present prototype figures or addresses as live on-chain data.",
    "Do not imply yield, returns, or investment in any caption.",
  ],
} as const;
