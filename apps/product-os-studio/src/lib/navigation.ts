import {
  Shield,
  User,
  Users,
  Wallet,
  Activity,
  Search,
  Award,
  Database,
  GitCommit,
  Network,
  BookMarked,
  History,
  Layers,
  FileText,
  Workflow,
  Settings,
  Wrench,
  Flame,
  Hammer,
} from "lucide-react";

// Role requirement for a member surface.
// - "connected": any connected wallet may view (prototype: simulated session)
// - "seated":    requires a seat to be anchored to the wallet
// - "founder":   founder / operator mode only
//
// IMPORTANT (prototype reality): these requirements drive UI gating only.
// They are NOT security. Real access control must be enforced server-side —
// see components/production-auth-note.tsx.
export type RouteRequirement = "connected" | "seated" | "founder";

export type NavIcon = typeof Shield;

export interface MemberNavItem {
  name: string;
  path: string;
  icon: NavIcon;
  requirement: RouteRequirement;
}

export interface MemberNavGroup {
  label: string;
  items: MemberNavItem[];
}

// Single source of truth for member navigation. Sidebar, account dropdown,
// and route protection all derive from this so a surface can never be exposed
// in one place while being gated in another.
export const MEMBER_NAV: MemberNavGroup[] = [
  {
    label: "Member",
    items: [
      { name: "Home", path: "/member", icon: Shield, requirement: "connected" },
      { name: "Join / Take Seat", path: "/member/join", icon: User, requirement: "connected" },
      { name: "My Syndicate", path: "/member/my-syndicate", icon: Users, requirement: "seated" },
      { name: "Toolkit", path: "/member/toolkit", icon: Wrench, requirement: "connected" },
      { name: "Wallet", path: "/member/wallet", icon: Wallet, requirement: "connected" },
      { name: "Activity", path: "/member/activity", icon: Activity, requirement: "seated" },
      { name: "Economy / Transparency", path: "/member/transparency", icon: Search, requirement: "seated" },
      { name: "Registry", path: "/member/registry", icon: Database, requirement: "seated" },
    ],
  },
  {
    label: "Memory & Story",
    items: [
      { name: "Evolution", path: "/member/evolution", icon: GitCommit, requirement: "seated" },
      { name: "Chronicle", path: "/member/chronicle", icon: BookMarked, requirement: "seated" },
      { name: "Archive / NFT Memory", path: "/member/archive", icon: History, requirement: "seated" },
      { name: "Recognition", path: "/member/recognition", icon: Award, requirement: "seated" },
      { name: "Fire Ledger", path: "/member/fire", icon: Flame, requirement: "seated" },
    ],
  },
  {
    label: "Growth & Future",
    items: [
      { name: "Contributor Workbench", path: "/member/workbench", icon: Hammer, requirement: "seated" },
      { name: "Verified Introduction", path: "/member/referral", icon: Layers, requirement: "seated" },
      { name: "SeatRecord / Identity", path: "/member/seat-record", icon: FileText, requirement: "seated" },
      { name: "Protocol Graph", path: "/member/graph", icon: Workflow, requirement: "seated" },
      { name: "Architecture", path: "/member/architecture", icon: Network, requirement: "seated" },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", path: "/member/settings", icon: Settings, requirement: "connected" },
    ],
  },
  {
    label: "Operator",
    items: [
      { name: "Founder Console", path: "/member/founder-review", icon: Shield, requirement: "founder" },
    ],
  },
];

// Flat path -> requirement map used by route protection in App.tsx.
export const ROUTE_REQUIREMENTS: Record<string, RouteRequirement> = MEMBER_NAV
  .flatMap((g) => g.items)
  .reduce((acc, item) => {
    acc[item.path] = item.requirement;
    return acc;
  }, {} as Record<string, RouteRequirement>);
