import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { RouteFinalCTA } from "@/components/syndicate/RouteFinalCTA";
import { SynLiveStatus } from "@/components/syndicate/SynLiveStatus";
import { CanonicalSpec } from "@/components/syndicate/CanonicalSpec";
import { TokenIntro } from "@/components/syndicate/TokenIntro";

export const Route = createFileRoute("/token")({
  head: () => ({
    meta: [
      { title: "SYN Token — Live on Avalanche C-Chain | The Syndicate" },
      { name: "description", content: "SYN ERC20 contract details, source verification, and public allocation wallets on Avalanche C-Chain." },
      { property: "og:title", content: "SYN Token — Live on Avalanche" },
      { property: "og:description", content: "Contract 0xC1Cf…0170 · 1,000,000,000 fixed supply · no admin · no mint." },
      { property: "og:url", content: "https://thesyndicate.money/token" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/token" }],
  }),
  component: () => (
    <PageShell eyebrow="Token" title="SYN — Live on Avalanche C-Chain" description="What SYN is, what it enables, what it is not — followed by the contract, the spec, and the public allocation wallets.">
      <TokenIntro />
      <SynLiveStatus />
      <CanonicalSpec />
    <RouteFinalCTA preset="verify" />
    </PageShell>
  ),
});
