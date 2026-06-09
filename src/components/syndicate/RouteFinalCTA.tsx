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
//                     → Take your seat + Read the protocol
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
    eyebrow: "Join",
    title: (
      <>
        Take your seat in <span className="text-gradient-gold">The Syndicate</span>.
      </>
    ),
    description:
      "Buy SYN on the live Membership Sale. Same rate for everyone — every USDC routes 70% Vault, 20% Liquidity, 10% Operations, all on-chain.",
    primary: { label: "Buy SYN with USDC →", href: "/join" },
    secondary: { label: "Verify on Avascan", href: "/transparency" },
  },
  mint: {
    eyebrow: "Chapter I · Mint open",
    title: <>Mint the opening signal.</>,
    description:
      "Preserve your place in Chapter I of The Syndicate Archive. Once Chapter I closes, the First Signal can never be issued again.",
    primary: { label: "Mint Now", href: "/nft#first-signal-showcase" },
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
      "Read the contracts, follow the addresses, check the transactions. The Protocol Registry lists every wallet, every status, every explorer link.",
    primary: { label: "Open Protocol Registry", href: "/registry" },
    secondary: { label: "Take your seat", href: "/join" },
  },
  editorial: {
    eyebrow: "Next step",
    title: (
      <>
        Read the protocol. <span className="text-gradient-gold">Then take your seat.</span>
      </>
    ),
    description:
      "Stories explain what The Syndicate is becoming. Membership records that you were there when it was written.",
    primary: { label: "Take your seat", href: "/join" },
    secondary: { label: "Browse the Archive", href: "/archive" },
  },
};

export function RouteFinalCTA({ preset }: { preset: Preset }) {
  const cfg = PRESETS[preset];
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
