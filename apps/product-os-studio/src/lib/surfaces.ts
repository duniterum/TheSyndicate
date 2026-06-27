import {
  Activity,
  Search,
  Database,
  GitCommit,
  BookMarked,
  History,
  Award,
  Layers,
  Share2,
  Megaphone,
  GraduationCap,
  Flame,
  Wrench,
} from "lucide-react";

// Information-architecture source of truth for the PUBLIC PROOF LAYER.
//
// The Syndicate has three visibility layers:
//   1. Public proof   — read-only, no wallet. Defined here.
//   2. Member personal — requires a (simulated) connected wallet. See navigation.ts (MEMBER_NAV).
//   3. Founder/operator — founder mode only. See navigation.ts.
//
// Public proof surfaces map 1:1 (where applicable) to a member-personal surface
// via `memberPath`. The public header "Proof" menu, the footer, homepage CTAs,
// and the public route table all derive from this list so they can never drift.
//
// IMPORTANT: public surfaces show protocol-level / aggregate / anonymized data
// only. They MUST NOT render wallet-personal data and MUST label simulated
// values as not-live.

export type SurfaceGroup = "Proof" | "Memory" | "Resources";

export type SurfaceIcon = typeof Activity;

export interface PublicSurface {
  id: string;
  label: string;
  shortLabel?: string;
  publicPath: string;
  /** The member-personal equivalent, if one exists (drives the "connect for your view" CTA). */
  memberPath?: string;
  icon: SurfaceIcon;
  group: SurfaceGroup;
  /** One-line description of what a public visitor sees here. */
  publicSummary: string;
  /** Label for the CTA that sends a visitor to their personal view. */
  connectCtaLabel?: string;
}

// Public proof surfaces that have a richer member-personal counterpart.
export const PROOF_SURFACES: PublicSurface[] = [
  {
    id: "activity",
    label: "Activity",
    publicPath: "/activity",
    memberPath: "/member/activity",
    icon: Activity,
    group: "Proof",
    publicSummary: "The protocol heartbeat — a public, read-only feed of protocol events.",
    connectCtaLabel: "Connect to view your personal activity",
  },
  {
    id: "economy",
    label: "Economy / Transparency",
    shortLabel: "Economy",
    publicPath: "/economy",
    memberPath: "/member/transparency",
    icon: Search,
    group: "Proof",
    publicSummary: "The 70% / 20% / 10% routing model and protocol economy summary.",
    connectCtaLabel: "Connect to view your personal economy",
  },
  {
    id: "registry",
    label: "Registry",
    publicPath: "/registry",
    memberPath: "/member/registry",
    icon: Database,
    group: "Proof",
    publicSummary: "Contract and protocol proof summary.",
    connectCtaLabel: "Connect to open your personal registry",
  },
  {
    id: "recognition",
    label: "Recognition",
    publicPath: "/recognition",
    memberPath: "/member/recognition",
    icon: Award,
    group: "Proof",
    publicSummary: "The public contribution board — anonymized signals, not a wealth leaderboard.",
    connectCtaLabel: "Connect to view your recognition profile",
  },
  {
    id: "referral-status",
    label: "Verified Introduction",
    shortLabel: "Referral status",
    publicPath: "/referral-status",
    memberPath: "/member/referral",
    icon: Layers,
    group: "Proof",
    publicSummary: "Verified Introduction status — a V1 candidate, not live today.",
    connectCtaLabel: "Connect to view your introduction status",
  },
  {
    id: "evolution",
    label: "Evolution",
    publicPath: "/evolution",
    memberPath: "/member/evolution",
    icon: GitCommit,
    group: "Memory",
    publicSummary: "The protocol series — public episodes of how it has moved.",
    connectCtaLabel: "Connect to follow your evolution",
  },
  {
    id: "chronicle",
    label: "Chronicle",
    publicPath: "/chronicle",
    memberPath: "/member/chronicle",
    icon: BookMarked,
    group: "Memory",
    publicSummary: "Curated institutional canon — public history.",
    connectCtaLabel: "Connect to view the full chronicle",
  },
  {
    id: "archive",
    label: "Archive / Memory",
    shortLabel: "Archive",
    publicPath: "/archive",
    memberPath: "/member/archive",
    icon: History,
    group: "Memory",
    publicSummary: "Memory and milestone artifacts — a public preview, not ownership.",
    connectCtaLabel: "Connect to view your archive",
  },
  {
    id: "fire",
    label: "Fire Ledger",
    shortLabel: "Fire",
    publicPath: "/fire",
    memberPath: "/member/fire",
    icon: Flame,
    group: "Proof",
    publicSummary: "Proof of Fire — burns as costly signals. Supply retired, never minted; simulated totals only.",
    connectCtaLabel: "Connect to propose and review burns",
  },
];

// Existing public resource pages (no gated counterpart).
export const RESOURCE_SURFACES: PublicSurface[] = [
  {
    id: "toolkit",
    label: "Syndicate Toolkit",
    shortLabel: "Toolkit",
    publicPath: "/toolkit",
    memberPath: "/member/toolkit",
    icon: Wrench,
    group: "Resources",
    publicSummary: "Every protocol action in one place — tools, proof surfaces, and roadmap concepts, role-aware and labeled.",
    connectCtaLabel: "Connect to unlock your toolkit",
  },
  {
    id: "share",
    label: "Proof & Share",
    publicPath: "/share",
    icon: Share2,
    group: "Resources",
    publicSummary: "Make a seat, receipt, chapter, or milestone shareable.",
  },
  {
    id: "press",
    label: "Press & Brand",
    publicPath: "/press",
    icon: Megaphone,
    group: "Resources",
    publicSummary: "Logos, language, palette, and official channels.",
  },
  {
    id: "learn",
    label: "Docs / Learn",
    publicPath: "/learn",
    icon: GraduationCap,
    group: "Resources",
    publicSummary: "FAQ, protocol paper, and risk disclaimers.",
  },
];

export const ALL_PUBLIC_SURFACES: PublicSurface[] = [...PROOF_SURFACES, ...RESOURCE_SURFACES];

export function getSurface(id: string): PublicSurface | undefined {
  return ALL_PUBLIC_SURFACES.find((s) => s.id === id);
}

export function getSurfaceByMemberPath(memberPath: string): PublicSurface | undefined {
  return PROOF_SURFACES.find((s) => s.memberPath === memberPath);
}

// Grouped view for menus (Proof / Memory / Resources).
export const SURFACE_GROUPS: { group: SurfaceGroup; items: PublicSurface[] }[] = (
  ["Proof", "Memory", "Resources"] as SurfaceGroup[]
).map((group) => ({
  group,
  items: ALL_PUBLIC_SURFACES.filter((s) => s.group === group),
}));
