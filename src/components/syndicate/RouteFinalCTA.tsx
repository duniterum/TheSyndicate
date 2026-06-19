// RouteFinalCTA — the SAME closing "next step" block on every page.
//
// Phase 4 harmonization (site-wide layout pass):
//   Every public page closes with a route-appropriate <ActionPanel>. The
//   visitor never reaches the end of a page without an obvious next move,
//   and all of these closing blocks share one shape so the site reads as
//   one product instead of stitched pages.
//
//   Templates → preset:
//     "join"       — Landing / generic pages → Join + Verify
//     "mint"       — Product/Action pages (/nft, /nfts) → Mint + Verify
//     "verify"     — Proof/Data pages (/activity /vault /liquidity /token /transparency)
//                     → Verify on-chain + Open registry
//     "editorial"  — Editorial/Story pages (/docs /whitepaper /chapters /archive /founders /ranks)
//                     → Join The Syndicate + Browse the Archive
//
// Use it like:
//     <RouteFinalCTA preset="verify" />
// before </PageShell> on each route. No props needed for the default copy.
import { ActionPanel, Section } from "@/components/syndicate/Primitives";

type Preset = "join" | "mint" | "verify" | "editorial";

interface PresetConfig {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}

const PRESETS: Record<Preset, PresetConfig> = {
  join: {
    eyebrow: "Take your seat",
    title: (
      <>
        Receive SYN. <span className="text-gradient-gold">Enter the record.</span>
      </>
    ),
    description:
      "Buy SYN on the live Membership Sale. Same rate for everyone — every USDC routes 70% Vault, 20% Liquidity, 10% Operations, all on-chain.",
    primary: { label: "Join The Syndicate →", href: "/join" },
    secondary: { label: "Verify on Avascan", href: "/transparency" },
  },
  mint: {
    eyebrow: "Chapter I · Mint open",
    title: <>Carry the opening signal.</>,
    description:
      "Artifacts are memories, not seats. The First Signal is open only because the Archive1155 contract says it is open; other artifact states stay read-gated or sealed by event.",
    primary: { label: "Mint The First Signal", href: "/nft#first-signal-showcase" },
    secondary: { label: "Verify on-chain ↗", href: "/transparency" },
  },
  verify: {
    eyebrow: "Verify",
    title: (
      <>
        Every number here is <span className="text-gradient-gold">on-chain</span>.
      </>
    ),
    description:
      "Read the contracts, follow the addresses, check the transactions. The Protocol Registry lists every wallet, every status, and every explorer link before you act.",
    primary: { label: "Open Protocol Registry", href: "/registry" },
    secondary: { label: "Take your seat", href: "/join" },
  },
  editorial: {
    eyebrow: "From reading to protocol",
    title: (
      <>
        Understand the system. <span className="text-gradient-gold">Then take your seat.</span>
      </>
    ),
    description:
      "The public pages explain the institution. Membership records that your wallet was present as the protocol formed.",
    primary: { label: "Take your seat", href: "/join" },
    secondary: { label: "Open My Syndicate", href: "/my-syndicate" },
  },
};

type PresetOverride = Partial<Omit<PresetConfig, "primary" | "secondary">> & {
  primary?: Partial<PresetConfig["primary"]>;
  secondary?: Partial<PresetConfig["secondary"]>;
};

const DISPLAY_OVERRIDES: Partial<Record<Preset, PresetOverride>> = {
  join: {
    description:
      "Membership is the state change: SYN lands in the wallet, USDC routes 70 / 20 / 10, and the receipt becomes proof My Syndicate can remember.",
    primary: { label: "Take your seat" },
    secondary: { label: "Verify the routing" },
  },
  mint: {
    eyebrow: "Archive memory",
    description:
      "Artifacts are memories, not seats. The First Signal is open only because the Archive1155 contract says it is open; other artifact states stay read-gated or sealed by event.",
    primary: { label: "Open Archive mint" },
    secondary: { label: "Verify Archive truth" },
  },
  verify: {
    description:
      "Read the contracts, follow the addresses, check the transactions. The Protocol Registry lists every wallet, every status, and every explorer link before you act.",
    secondary: { label: "Take your seat" },
  },
  editorial: {
    description:
      "The public pages explain the institution. Membership records that your wallet was present as the protocol formed.",
    primary: { label: "Take your seat" },
  },
};

export function RouteFinalCTA({ preset }: { preset: Preset }) {
  const base = PRESETS[preset];
  const override = DISPLAY_OVERRIDES[preset] ?? {};
  const cfg = {
    ...base,
    ...override,
    primary: { ...base.primary, ...override.primary },
    secondary: { ...base.secondary, ...override.secondary },
  };
  return (
    <Section id="route-final-cta" width="editorial">
      <ActionPanel
        eyebrow={cfg.eyebrow}
        title={cfg.title}
        description={cfg.description}
        primary={cfg.primary}
        secondary={cfg.secondary}
      />
    </Section>
  );
}
