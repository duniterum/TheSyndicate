import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function walkPublicSource(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "__tests__") continue;
      walkPublicSource(full, acc);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      acc.push(full);
    }
  }
  return acc;
}

describe("production coherence guards", () => {
  it("does not describe live membership infrastructure as still upcoming", () => {
    const root = read("src/routes/__root.tsx");

    expect(root).toContain("Membership Sale and 70/20/10 routing live on Avalanche C-Chain");
    expect(root).not.toMatch(/Membership Sale contract is next/i);
  });

  it("keeps simulated treasury ledger previews off the public Transparency route", () => {
    const transparency = read("src/routes/transparency.tsx");

    expect(transparency).toContain("TransparencyTimeline");
    expect(transparency).toContain("UseOfFunds");
    expect(transparency).toContain("TransparencyReport");

    expect(transparency).not.toMatch(/treasury-ledger-preview/i);
    expect(transparency).not.toMatch(/TreasuryLedgerPreview/);
    expect(transparency).not.toMatch(/TreasuryCategoryChart/);
    expect(transparency).not.toMatch(/simulated rows/i);
    expect(transparency).not.toMatch(/CommissionRouter ships/i);
    expect(transparency).not.toMatch(/Founder-managed until DAO activation/i);
  });

  it("keeps future referral simulations away from live purchase and pending referral routes", () => {
    const join = read("src/routes/join.tsx");
    const referral = read("src/routes/referral.tsx");

    expect(join).toContain("RoutingFlow");
    expect(join).not.toMatch(/components\/preview/);
    expect(join).not.toMatch(/SplitVisualizer/);
    expect(join).not.toMatch(/Referral commission \(preview\)/i);
    expect(join).not.toMatch(/SIMULATED/i);

    expect(referral).toContain("SOURCE RECORD PAUSED");
    expect(referral).toContain("One PAUSED source record. No commission.");
    expect(referral).toContain("CURRENT_SOURCE_POLICY_SNAPSHOT");
    expect(referral).toContain("sourcePolicy.currentSummary");
    expect(referral).toContain("Source policy observability");
    expect(referral).toContain("V3 public buys currently use ZERO_SOURCE_ID");
    expect(referral).toContain("SOURCE_ATTRIBUTION_READINESS_GATES");
    expect(referral).toContain("SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS");
    expect(referral).toContain("SOURCE_ATTRIBUTION_TOUCHPOINTS");
    expect(referral).toContain("A source record by itself is not referral activation");
    expect(referral).toContain("Where source truth must appear before it can be trusted");
    expect(referral).toContain("Source attribution is not a standalone referral page");
    expect(referral).toContain("must not show a source balance, claim button, public");
    expect(referral).toContain("A source record must move through visible states");
    expect(referral).not.toMatch(/components\/preview/);
    expect(referral).not.toMatch(/simulated/i);
    expect(referral).not.toMatch(/CommissionByTierChart|SimReferralActivity|ReputationLeaderboard/);
  });

  it("keeps source policy observable without activating source/referral/claim behavior", () => {
    const sourcePolicy = read("src/lib/source-policy-observability.ts");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const saleAbi = read("src/lib/sale-abi.ts");
    const referral = read("src/routes/referral.tsx");
    const economyBand = read("src/components/syndicate/ProtocolEconomyBand.tsx");
    const mySyndicate = read("src/routes/my-syndicate.tsx");
    const activityFeed = read("src/components/syndicate/LiveActivityFeed.tsx");
    const purchaseRouting = read("src/components/syndicate/MyPurchaseRouting.tsx");
    const sourceProofCard = read("src/components/syndicate/SourceAttributionProofCard.tsx");
    const sourceReceipts = read("src/lib/source-attributed-receipts.ts");
    const sourceLifecycle = read("src/lib/source-registry-lifecycle.ts");
    const activity = read("src/routes/activity.tsx");
    const transparency = read("src/routes/transparency.tsx");
    const registry = read("src/routes/registry.tsx");

    expect(sourcePolicy).toContain("INTERNAL_PROTOCOL_TEST_SOURCE_001");
    expect(sourcePolicy).toContain("sourceCreatedBlock: 88705814");
    expect(sourcePolicy).toContain("CURRENT_SOURCE_POLICY_RECORDS: readonly SourcePolicyRecord[] = [");
    expect(sourcePolicy).toContain("referralActive: false");
    expect(sourcePolicy).toContain("claimingActive: false");
    expect(sourcePolicy).toContain("publicSourceAwareBuyPathActive: false");
    expect(sourcePolicy).toContain("Public/default MembershipSaleV3 buys use ZERO_SOURCE_ID");
    expect(sourcePolicy).toContain("SOURCE_ATTRIBUTION_READINESS_GATES");
    expect(sourcePolicy).toContain("SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS");
    expect(sourcePolicy).toContain("SOURCE_ATTRIBUTION_TOUCHPOINTS");
    expect(sourcePolicy).toContain("Created, not usable");
    expect(sourcePolicy).toContain("No claim UI appears unless escrow state");
    expect(sourcePolicy).toContain("Gross USDC minus acquisition commission");
    expect(sourcePolicy).toContain("Register / Chronicle");
    expect(sourcePolicy).toContain("Archive / future products");
    expect(sourcePolicy).toContain("never as proof that referral is broadly live");
    expect(sourcePolicy).toContain("SOURCE_TERMS_UPDATED");
    expect(sourcePolicy).toContain("One internal source record exists and is currently PAUSED after a completed controlled source-attributed test");
    expect(sourcePolicy).toContain("One historical $5 source-attributed V3 receipt exists");
    expect(sourcePolicy).toContain("MembershipSaleV3");
    expect(sourcePolicy).toContain("Archive1155");
    expect(sourcePolicy).toContain("SeatRecord721");
    expect(sourcePolicy).toContain("SwapRail");
    expect(sourcePolicy).toContain("ProductSaleRouter / premium products");
    expect(sourcePolicy).toContain("SOURCE_REGISTRY_V1_READBACK_BLOCK");
    expect(sourceReceipts).toContain("projectSourceAttributedReceipt");
    expect(sourceReceipts).toContain("summarizeSourceAttributedReceipts");
    expect(sourceReceipts).toContain("REQUIRES_SOURCE_REGISTRY_READBACK");
    expect(sourceReceipts).toContain("READBACK_CONFIRMED_SOURCE_REPAUSED");
    expect(sourceReceipts).toContain("getCompletedInternalSourceAttributionProof");
    expect(sourceReceipts).toContain("ZERO_SOURCE_ID");
    expect(sourceLifecycle).toContain("SOURCE_REGISTRY_LIFECYCLE_VISIBILITY");
    expect(sourceLifecycle).toContain("SourceCreated");
    expect(sourceLifecycle).toContain("SourceTermsUpdated");
    expect(sourceLifecycle).toContain("SourceStatusChanged");
    expect(sourceLifecycle).toContain("SourceWalletUpdated");
    expect(sourceLifecycle).toContain("SourcePayoutWalletUpdated");
    expect(sourceLifecycle).toContain("source record exists");
    expect(sourceLifecycle).toContain("not referral activation");
    expect(sourceLifecycle).toContain("publicSourceAwareBuyPathActive: false");
    expect(sourceLifecycle).toContain("Public/default buys remain");
    expect(sourceLifecycle).toContain("ZERO_SOURCE_ID");

    expect(saleHooks).toContain('import { ZERO_SOURCE_ID } from "./source-policy-observability"');
    expect(saleHooks).toContain("export { ZERO_SOURCE_ID }");
    expect(saleAbi).toContain("SOURCE_REGISTRY_V1_ABI");
    expect(saleAbi).toContain("SourceCreated");
    expect(saleAbi).toContain("SourceStatusChanged");
    expect(saleAbi).toContain("SourceTermsUpdated");
    expect(saleAbi).toContain("SourceWalletUpdated");
    expect(saleAbi).toContain("SourcePayoutWalletUpdated");

    expect(referral).toContain("SOURCE_POLICY_LIFECYCLE_MODEL");
    expect(referral).toContain("SOURCE_REGISTRY_LIFECYCLE_VISIBILITY");
    expect(referral).toContain("Source records must be observable before they are usable");
    expect(referral).toContain("The contract event vocabulary is ready for read-only proof");
    expect(registry).toContain("SOURCE_REGISTRY_LIFECYCLE_VISIBILITY");
    expect(registry).toContain("Source records become proof before they become rails");
    expect(registry).toContain("not as proof that referral, claim UI, or public source links are available");
    expect(economyBand).toContain("CURRENT_SOURCE_POLICY_SNAPSHOT");
    expect(economyBand).toContain("sourcePolicy.productCapabilities");
    expect(activity).toContain("SourceAttributionProofCard");
    expect(activity).toContain("source-attribution-proof");
    expect(transparency).toContain("SourceAttributionProofCard");
    expect(transparency).toContain("source-attribution-proof");
    expect(sourceProofCard).toContain("Completed internal source-attribution proof");
    expect(sourceProofCard).toContain("SOURCE PAUSED");
    expect(sourceProofCard).toContain("PUBLIC ZERO_SOURCE_ID");
    expect(sourceProofCard).toContain("public referral activation");
    expect(sourceProofCard).toContain("No claim UI");
    expect(sourceProofCard).toContain("public source-aware buy path");
    expect(sourceProofCard).toContain("Capability validated; product activation still deferred");
    expect(activityFeed).toContain("projectSourceAttributedReceipt");
    expect(activityFeed).toContain("Source-attributed receipt");
    expect(activityFeed).toContain("SOURCE RE-PAUSED");
    expect(activityFeed).toContain("Current-authority readback confirms the source returned to PAUSED");
    expect(activityFeed).toContain("current source status still requires");
    expect(purchaseRouting).toContain("summarizeSourceAttributedReceipts");
    expect(purchaseRouting).toContain("Source-attributed receipt proof");
    expect(purchaseRouting).toContain("SOURCE RE-PAUSED");
    expect(purchaseRouting).toContain("Current-authority readback confirms the source returned to PAUSED");
    expect(purchaseRouting).toContain("Current source status still requires SourceRegistry readback");
    expect(mySyndicate).toContain("REQUIRES SOURCE RECORD");
    expect(mySyndicate).toContain("until a source record exists, is read back, activated, and wired");
    expect(mySyndicate).not.toMatch(/Referral routing[\s\S]{0,160}until a contract exists/i);

    const publicSource = [
      sourcePolicy,
      sourceLifecycle,
      referral,
      registry,
      economyBand,
      mySyndicate,
      activityFeed,
      purchaseRouting,
      sourceProofCard,
      activity,
      transparency,
    ].join("\n");
    const publicCopySource = publicSource
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/.*$/gm, "");
    expect(publicSource).not.toMatch(/claimSourceEscrow\(/);
    expect(publicSource).not.toMatch(/source balance(?:s)? (?:available|claimable|owed|earned|is live)/i);
    expect(publicCopySource).not.toMatch(/earn now|passive income|\bROI\b|guaranteed reward|downline/i);
  });

  it("keeps Protocol Evolution read-only and evidence-backed without activation authority", () => {
    const registry = read("src/lib/protocol-evolution.ts");
    const lifecycle = read("src/lib/protocol-lifecycle.ts");
    const lifecyclePanel = read("src/components/syndicate/ProtocolLifecycleProofPanel.tsx");
    const route = read("src/routes/evolution.tsx");
    const header = read("src/components/syndicate/Header.tsx");
    const docs = read("src/routes/docs.tsx");
    const roadmap = read("src/routes/roadmap.tsx");
    const sitemap = read("src/routes/sitemap[.]xml.ts");

    expect(registry).toContain("PROTOCOL_EVOLUTION_MODULES");
    expect(registry).toContain("No source record is created by Protocol Evolution.");
    expect(registry).toContain("No source, referral, or claim UI is activated by Protocol Evolution.");
    expect(registry).toContain("Public/default MembershipSaleV3 buys remain");
    expect(registry).toContain("ZERO_SOURCE_ID");
    expect(registry).toContain('id: "source-attribution"');
    expect(registry).toContain('status: sourceAttributionStatus');
    expect(registry).toContain('"INACTIVE"');
    expect(registry).toContain('"FUTURE"');
    expect(registry).toContain('"DEFERRED"');

    expect(lifecycle).toContain("FIRST_SOURCE_ATTRIBUTION_LIFECYCLE");
    expect(lifecycle).toContain("source-attribution-real-condition-001");
    expect(lifecycle).toContain("PROVEN_INTERNAL");
    expect(lifecycle).toContain("Source re-paused and closed");
    expect(lifecycle).toContain("Public referral product");
    expect(lifecycle).toContain("No claim UI, source dashboard, public source link, or public source-aware buy path exists.");
    expect(lifecycle).toContain("Future modules do not inherit MembershipSaleV3 source terms automatically.");
    expect(lifecyclePanel).toContain("Institutional lifecycle proof");
    expect(lifecyclePanel).toContain("Current safe state");
    expect(lifecyclePanel).toContain("Boundaries still active");
    expect(lifecyclePanel).toContain("Questions unlocked");

    expect(route).toContain('createFileRoute("/evolution")');
    expect(route).toContain("ProtocolLifecycleProofPanel");
    expect(route).toContain("evolution-lifecycle-proof");
    expect(route).toContain("Proven lifecycles");
    expect(route).toContain("This surface explains state. It does not change state.");
    expect(route).toContain("No fake-live systems");
    expect(route).toContain("no public");
    expect(route).toContain("no claim UI");
    expect(route).toContain("PROTOCOL_EVOLUTION_BOUNDARIES");
    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|claimSourceEscrow|createSource\(/);
    expect(route).not.toMatch(/public referral is live|source links are live|claim UI is live/i);
    expect(route).not.toMatch(/passive income|yield-bearing|\bROI\b|guaranteed return|downline/i);
    expect(route).not.toMatch(/members voted|community vote|governance rights/i);

    expect(header).toContain('{ label: "Evolution", to: "/evolution"');
    expect(docs).toContain('title: "Protocol Evolution"');
    expect(roadmap).toContain("Protocol Evolution");
    expect(sitemap).toContain('{ path: "/evolution"');

    const evolutionCopy = [registry, lifecycle, lifecyclePanel, route].join("\n");
    expect(evolutionCopy).not.toMatch(/claimSourceEscrow\(/);
    expect(evolutionCopy).not.toMatch(/public source link is live|source dashboard is live|public referral is live/i);
    expect(evolutionCopy).not.toMatch(/passive income|yield-bearing|\bROI\b|guaranteed return|downline/i);
  });

  it("keeps sitemap and production route smoke checks aligned with current route truth", () => {
    const sitemap = read("src/routes/sitemap[.]xml.ts");
    const smoke = read("scripts/check-route-status.mjs");
    const ai = read("src/routes/ai.tsx");

    expect(sitemap).toContain('{ path: "/evolution"');
    expect(sitemap).toContain('{ path: "/nft"');
    expect(sitemap).toContain('{ path: "/archive"');
    expect(sitemap).not.toContain('{ path: "/nfts"');
    expect(sitemap).not.toContain('{ path: "/ai"');
    expect(sitemap).toContain("/referral is the pending source-attribution truth surface");
    expect(sitemap).not.toMatch(/SIMULATED preview surface/i);

    expect(ai).toContain('{ name: "robots", content: "noindex,nofollow" }');
    expect(ai).toContain("Not built, not live");
    expect(ai).toContain("No contract, no claim, no waitlist");

    for (const route of [
      '"/evolution"',
      '"/referral"',
      '"/chronicle"',
      '"/institutional-register"',
      '"/knowledge-map"',
      '"/nft"',
      '"/nfts"',
      '"/ai"',
      '"/risk"',
      '"/protocol-health"',
    ]) {
      expect(smoke).toContain(route);
    }
  });

  it("keeps the homepage visibility layer five-pillar, truthful, and non-activating", () => {
    const home = read("src/routes/index.tsx");
    const model = read("src/lib/protocol-visibility.ts");
    const surface = read("src/components/syndicate/ProtocolVisibilitySurface.tsx");

    expect(home).toContain("<ProtocolVisibilitySurface />");
    expect(model).toContain("PROTOCOL_VISIBILITY_PILLARS");
    expect(model).toContain("Institutional Spine");
    expect(model).toContain("Institution Map");
    expect(model).toContain("Institutional Pulse");
    expect(model).toContain("Proof Backbone");
    expect(model).toContain("Place / Belonging");
    expect(model).toContain("Join");
    expect(model).toContain("Prove");
    expect(model).toContain("Remember");
    expect(model).toContain("Return");
    expect(model).toContain("Evolve");
    expect(model).toContain("Future recognition should answer what a person or source helped the institution become");
    expect(model).toContain("Default V3 buys use");
    expect(model).toContain("ZERO_SOURCE_ID");
    expect(model).toContain("No public source link");
    expect(model).toContain("No source-aware public buy path");
    expect(model).toContain("No claim UI");

    expect(surface).toContain("One institution.");
    expect(surface).toContain("Five views.");
    expect(surface).toContain("Pulse shows why");
    expect(surface).toContain("Future recognition reserve");
    expect(surface).toContain("Reserved does not mean live");

    expect(surface).not.toMatch(/useWriteContract|writeContract|sendTransaction|claimSourceEscrow|createSource\(/);
    expect(surface).not.toMatch(/source links are live|claim UI is live|public referral is live/i);
    expect(surface).not.toMatch(/passive income|\bROI\b|top earners?|downline|MLM/i);
    expect(surface).not.toMatch(/members voted|community vote|governance rights/i);
  });

  it("keeps public V3 sale surfaces on deterministic era-pricing truth", () => {
    const files = {
      join: read("src/routes/join.tsx"),
      tokenomics: read("src/routes/tokenomics.tsx"),
      whitepaper: read("src/routes/whitepaper.tsx"),
      roadmap: read("src/routes/roadmap.tsx"),
      faq: read("src/components/syndicate/FaqRebuilt.tsx"),
      packages: read("src/components/syndicate/JoinPackages.tsx"),
      mobileJoinBar: read("src/components/syndicate/MobileJoinBar.tsx"),
      routeFinalCta: read("src/components/syndicate/RouteFinalCTA.tsx"),
      sections: read("src/components/syndicate/Sections.tsx"),
      canonicalSpec: read("src/components/syndicate/CanonicalSpec.tsx"),
      editorialHero: read("src/components/syndicate/EditorialHero.tsx"),
      joinStepsPlaque: read("src/components/syndicate/JoinStepsPlaque.tsx"),
      protocolIntelligenceBar: read("src/components/syndicate/ProtocolIntelligenceBar.tsx"),
      eras: read("src/lib/eras.ts"),
      packagesData: read("src/lib/package-catalog.ts"),
      metrics: read("src/lib/protocol-metrics-registry.ts"),
    };

    const banned = [
      /fixed access rate/i,
      /fixed rate/i,
      /same rate for everyone/i,
      /same fixed rate/i,
      /fixed for everyone/i,
      /same price for everyone/i,
      /future sale contract/i,
      /proposed future distribution model/i,
      /proposed schedule/i,
      /token price is fixed for everyone/i,
      /1 SYN = \$0\.01 USDC/i,
    ];

    const offenders: Array<{ file: string; pattern: string }> = [];
    for (const [file, src] of Object.entries(files)) {
      for (const pattern of banned) {
        if (pattern.test(src)) offenders.push({ file, pattern: pattern.source });
      }
    }

    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);

    expect(files.join).toContain("V3 uses deterministic era pricing");
    expect(files.faq).toContain("Era I currently returns 100 SYN per 1 USDC");
    expect(files.faq).toContain("Chapter is history and belonging; era is pricing");
    expect(files.packages).toContain("Chapter is history");
    expect(files.packages).toContain("Era is pricing");
    expect(files.metrics).toContain("Current Era I Quote");
  });

  it("keeps member referral cockpit aligned with V3 source-attribution inactive truth", () => {
    const card = read("src/components/syndicate/MyReferralCard.tsx");

    expect(card).toContain("SourceRegistryV1 has one validated internal source test now PAUSED");
    expect(card).toContain("public V3 buys use ZERO_SOURCE_ID");
    expect(card).toContain("Validated internal test");
    expect(card).toContain("no claim UI");
    expect(card).toContain("CommissionRouterV1 is not the active V3 source engine");
    expect(card).toContain("CURRENT_SOURCE_POLICY_SNAPSHOT");
    expect(card).toContain("SOURCE_ATTRIBUTION_READINESS_GATES");
    expect(card).toContain("SOURCE_ATTRIBUTED_RECEIPT_PROOF_FIELDS");
    expect(card).toContain("Future receipt must prove");
    expect(card).toContain("Current readback:");

    expect(card).not.toMatch(/When the CommissionRouter contract ships/i);
    expect(card).not.toMatch(/router is deployed/i);
    expect(card).not.toMatch(/No contract deployed/i);
    expect(card).not.toMatch(/10% Operations slice/i);
    expect(card).not.toMatch(/Referral commission is routed from Operations only/i);
  });

  it("keeps the live purchase ceremony clear before wallet signatures", () => {
    const purchase = read("src/components/syndicate/LivePurchase.tsx");

    expect(purchase).toContain("What your wallet will ask");
    expect(purchase).toContain("Approve the exact USDC amount for this purchase");
    expect(purchase).toContain("Approval alone does not create a seat");
    expect(purchase).toContain("The Buy signature delivers SYN, routes USDC, and creates the receipt");
    expect(purchase).toContain("the site still cannot move funds without your signature");
  });

  it("keeps the Docs hub aligned with live cockpit and read-gated archive truth", () => {
    const docs = read("src/routes/docs.tsx");

    expect(docs).toContain("Patron Seal (ID 3) CONTRACT_GATED / PUBLIC_MINT_READ_GATED");
    expect(docs).toContain("other Artifacts sealed or reserved");
    expect(docs).not.toMatch(/other Artifacts inactive/);

    expect(docs).toContain("Live member cockpit");
    expect(docs).toContain('title: "My Syndicate"');
    expect(docs).toContain('status: "LIVE"');
    expect(docs).not.toMatch(/My Syndicate", purpose: "Your seat[\s\S]{0,180}status: "PENDING"/);
  });

  it("keeps first-impression copy out of the old asset-accumulation framing", () => {
    const home = read("src/routes/index.tsx");
    const hero = read("src/components/syndicate/ProtocolHero.tsx");
    const vault = read("src/routes/vault.tsx");

    for (const [name, src] of Object.entries({ home, hero, vault })) {
      expect(src, name).not.toMatch(/asset accumulation/i);
      expect(src, name).not.toMatch(/own the economy/i);
    }

    expect(home).toContain("Take your seat");
    expect(home).toContain("transparent on-chain membership protocol");
    expect(hero).toContain("Your seat is on-chain");
  });

  it("keeps homepage first-scroll optimized for quick answers before deep protocol systems", () => {
    const home = read("src/routes/index.tsx");
    const quick = read("src/components/syndicate/HomeQuickAnswerRail.tsx");
    const archiveTeaser = read("src/components/syndicate/HomeArchiveTeaser.tsx");
    const header = read("src/components/syndicate/Header.tsx");

    expect(home).toContain("<HomeQuickAnswerRail />");
    expect(home).toContain("<TrustBar />");
    expect(home).toContain("<HomeArchiveTeaser />");
    expect(home.indexOf("<ProtocolHero />")).toBeLessThan(home.indexOf("<HomeQuickAnswerRail />"));
    expect(home.indexOf("<HomeQuickAnswerRail />")).toBeLessThan(home.indexOf("<TrustBar />"));
    expect(home.indexOf("<TrustBar />")).toBeLessThan(home.indexOf("<HeroEntryStrip />"));
    expect(home.indexOf("<HeroEntryStrip />")).toBeLessThan(home.indexOf("<HomeArchiveTeaser />"));
    expect(home.indexOf("<HomeArchiveTeaser />")).toBeLessThan(home.indexOf("<ProtocolEnginesPanel />"));

    expect(quick).toContain("What is this?");
    expect(quick).toContain("What do I receive?");
    expect(quick).toContain("Where does USDC go?");
    expect(quick).toContain("How do I verify it?");
    expect(quick).toContain("Where does SYN trade?");
    expect(quick).toContain("What is future?");
    expect(quick).toContain("SYN token");
    expect(quick).toContain("Sale contract");
    expect(quick).toContain("Archive1155");
    expect(quick).toContain("SYN/USDC LP");
    expect(quick).toContain("Trade SYN");
    expect(quick).toContain("The whole product in one scan.");

    expect(archiveTeaser).toContain("Archive1155 is deployed and live");
    expect(archiveTeaser).toContain("READ GATED");
    expect(archiveTeaser).toContain("RESERVED MEMORY");
    expect(archiveTeaser).toContain("Artifacts are the memory");

    expect(header).toContain('{ label: "Registry", to: "/registry"');
    expect(header).toContain('{ label: "Liquidity", to: "/liquidity"');
    expect(header).toContain('{ label: "Transparency", to: "/transparency"');
    expect(header).toContain('{ label: "Members", to: "/members"');
  });

  it("keeps public Archive1155 / SeatRecord721 truth from regressing to pre-deployment copy", () => {
    const files = [
      ...walkPublicSource(join(ROOT, "src/routes")),
      ...walkPublicSource(join(ROOT, "src/components/syndicate")),
      ...walkPublicSource(join(ROOT, "src/components/preview")),
      ...walkPublicSource(join(ROOT, "src/lib")),
      ...walkPublicSource(join(ROOT, "src/labs")),
    ];

    const banned = [
      /Archive contract is not live/i,
      /Archive contract (?:is )?not deployed/i,
      /no artifact can be minted today/i,
      /no artifact can be minted/i,
      /Seat Record artifact/i,
      /NFTs? (?:are|is) seats?/i,
      /NFTs? (?:are|is) the seat/i,
      /Genesis Syndicate NFT/i,
      /Genesis NFTs?/i,
      /Mint Genesis NFT/i,
      /Only 1,000/i,
      /Scarcity drops/i,
      /NFT Contract \(Seat Record/i,
      /Seat Record NFT/i,
      /Seat Record Contract \(ERC-721\)/i,
      /Seat Record contract/i,
      /identity NFT/i,
      /future ERC-721 Seat Record/i,
      /seat\s+itself\s+.+the identity NFT/i,
      /planned optional Artifact/i,
      /configured-not-active/i,
      /Other Artifacts\s+remain inactive/i,
      /NFTs live in the Archive/i,
      /no artifact drop activated yet/i,
      /non-ID-1 artifacts inactive/i,
      /Milestone reward pool/i,
      /Referral rewards are commissions/i,
      /flat\s+5%\s+(?:referral|commission)/i,
      /default\s+5%\s+(?:referral|commission)/i,
      /5%\s+referral\s+commission/i,
      /Proposals open, members vote/i,
      /supply unlocks/i,
    ];

    const offenders: Array<{ file: string; pattern: string }> = [];
    for (const file of files) {
      const src = readFileSync(file, "utf8");
      for (const pattern of banned) {
        if (pattern.test(src)) offenders.push({ file, pattern: pattern.source });
      }
    }

    expect(offenders, JSON.stringify(offenders, null, 2)).toEqual([]);
  });

  it("frames public Archive surfaces as protocol memory instead of an NFT shop", () => {
    const nft = read("src/routes/nft.tsx");
    const nfts = read("src/routes/nfts.tsx");
    const archive = read("src/routes/archive.tsx");
    const page = read("src/components/syndicate/NftPage.tsx");
    const firstSignal = read("src/components/syndicate/FirstSignalShowcase.tsx");
    const homeTeaser = read("src/components/syndicate/HomeArchiveTeaser.tsx");
    const metrics = read("src/lib/protocol-metrics-registry.ts");

    expect(nft).toContain("Archive Memory — The First Signal open");
    expect(nfts).toContain("The Syndicate Archive — First Signal open");
    expect(archive).toContain("Archive Memory - The First Signal open");
    expect(page).toContain("The First Signal — the opening memory of The Syndicate");
    expect(firstSignal).toContain("future chapter memories should follow contract and");
    expect(homeTeaser).toContain("Explore the Archive");
    expect(metrics).toContain("ID 1 is public-open and ID 3 is read-gated by live contract state");

    for (const [name, src] of Object.entries({ nft, nfts, archive, page, firstSignal, homeTeaser, metrics })) {
      expect(src, name).not.toMatch(/NFT mint open/i);
      expect(src, name).not.toMatch(/Collectible NFT Artifacts/i);
      expect(src, name).not.toMatch(/Mint yours before Chapter I closes/i);
      expect(src, name).not.toMatch(/artifact drop is activated/i);
      expect(src, name).not.toMatch(/drop not yet activated/i);
    }
  });

  it("keeps education surfaces in Archive-memory and Member-OS language", () => {
    const whitepaper = read("src/routes/whitepaper.tsx");
    const gallery = read("src/components/syndicate/ArchiveGalleryPreview.tsx");
    const transparency = read("src/components/syndicate/TransparencyCenter.tsx");
    const health = read("src/lib/protocol-health-registry.ts");
    const walletChip = read("src/components/syndicate/HeaderWalletChip.tsx");
    const faq = read("src/components/syndicate/FaqRebuilt.tsx");

    expect(whitepaper).toContain("10 — Archive Memory");
    expect(whitepaper).toContain("Archive memory — open plus read-gated artifacts");
    expect(whitepaper).toContain("not the seat, not a shop, and not a financial right");
    expect(gallery).toContain("Archive memory shelf");
    expect(transparency).toContain("One honest verification center");
    expect(health).toContain("Archive memory / Archive1155");
    expect(health).toContain("My Syndicate / Member OS");
    expect(walletChip).toContain("Your Member OS");
    expect(faq).toContain("SYN is the V1 membership seat");
    expect(faq).toContain("Any future governance or identity contract remains reserved until deployed");

    for (const [name, src] of Object.entries({ whitepaper, gallery, transparency, health, walletChip })) {
      expect(src, name).not.toMatch(/NFT Collection/i);
      expect(src, name).not.toMatch(/NFT layer/i);
      expect(src, name).not.toMatch(/member dashboard/i);
      expect(src, name).not.toMatch(/One honest dashboard/i);
    }
  });

  it("keeps the canonical seat/contribution doctrine visible without financial entitlement drift", () => {
    const model = read("docs/SYNDICATE_PROTOCOL_MODEL.md");
    const faq = read("src/components/syndicate/FaqRebuilt.tsx");
    const join = read("src/routes/join.tsx");
    const my = read("src/routes/my-syndicate.tsx");
    const docs = read("src/routes/docs.tsx");
    const ral = read("docs/REVENUE_ATTRIBUTION_LAYER.md");
    const seatRecord = read("docs/SEAT_RECORD_ARCHITECTURE_DECISION.md");

    expect(model).toContain("The membership seat is binary. Contribution is variable.");
    expect(model).toContain("One seated wallet has one seat identity.");
    expect(model).toContain("Do not collapse member count into economic scale.");
    expect(model).toContain("Ranks must never become a wealth leaderboard.");
    expect(model).toContain("institutional trust capital");
    expect(model).toContain("Referral remains one acquisition layer.");
    expect(model).toContain("The protocol and company are distinct, but narratively connected.");

    expect(faq).toContain("Can I buy multiple seats?");
    expect(faq).toContain("The seat is binary.");
    expect(faq).toContain("Is member count the same as economic scale?");
    expect(faq).toContain("What is institutional trust capital?");
    expect(join).toContain("The seat is binary; contribution depth is variable.");
    expect(join).toContain("A 5 USDC entrant and a 10,000 USDC entrant both have one seat.");
    expect(my).toContain("one seat identity");
    expect(my).toContain("SYN acquired; seat stays singular");
    expect(docs).toContain("Seat vs contribution");
    expect(docs).toContain("not a wealth leaderboard");
    expect(ral).toContain("Referral is one acquisition layer, not the business model");
    expect(seatRecord).toContain("institutional trust capital");

    for (const [name, src] of Object.entries({ faq, join, my, docs })) {
      expect(src, name).not.toMatch(/buy more seats/i);
      expect(src, name).not.toMatch(/extra seats/i);
      expect(src, name).not.toMatch(/member count\s*=\s*(?:revenue|economic scale)/i);
      expect(src, name).not.toMatch(/referral is the business model/i);
      expect(src, name).not.toMatch(/rank(?:s)? (?:are|is) (?:a )?wealth leaderboard/i);
      expect(src, name).not.toMatch(/SYN (?:is|means) equity/i);
      expect(src, name).not.toMatch(/SYN (?:is|means) yield/i);
      expect(src, name).not.toMatch(/SeatRecord721 replaces SYN/i);
    }
  });

  it("keeps protocol economy design and active module docs in neutral public-trust language", () => {
    const moduleStandard = read("docs/MODULE_INTEGRATION_STANDARD.md");
    const strategy = read("docs/STRATEGIC_NARRATIVE_AND_EXECUTION_ORDER.md");
    const treasury = read("docs/TREASURY_LEDGER_DOCTRINE.md");
    const unified = read("docs/UNIFIED_PROTOCOL_DOCTRINE_MAP.md");
    const referralPreview = read("src/lib/preview/referral.ts");
    const observatory = read("docs/PROTOCOL_ECONOMY_OBSERVATORY_DESIGN.md");

    const activeFiles = {
      moduleStandard,
      strategy,
      treasury,
      unified,
      referralPreview,
      observatory,
    };

    for (const [name, src] of Object.entries(activeFiles)) {
      expect(src, name).not.toMatch(/\bsharia\b/i);
      expect(src, name).not.toMatch(/\briba\b/i);
      expect(src, name).not.toMatch(/\bhalal\b/i);
      expect(src, name).not.toMatch(/\bharam\b/i);
      expect(src, name).not.toMatch(/\bislamic\b/i);
      expect(src, name).not.toMatch(/shariaRiskStatus/);
      expect(src, name).not.toMatch(/VAULT_TO_INVESTMENT|VAULT_FROM_INVESTMENT/);
      expect(src, name).not.toMatch(/yield-bearing position/i);
      expect(src, name).not.toMatch(/passive treasury return/i);
    }

    expect(moduleStandard).toContain("riskPolicyStatus");
    expect(moduleStandard).toContain("legal/disclosure/risk-policy guardrails");
    expect(treasury).toContain("VAULT_TO_APPROVED_ALLOCATION");
    expect(treasury).toContain("approved reserve allocation");
    expect(unified).toContain("VAULT_TO_APPROVED_ALLOCATION");
    expect(referralPreview).toContain("Approved reserve allocation");
    expect(referralPreview).toContain("VAULT_TO_APPROVED_ALLOCATION");

    expect(observatory).toContain("Protocol Economy Observatory");
    expect(observatory).toContain("My Economy");
    expect(observatory).toContain("Volume is not revenue");
    expect(observatory).toContain("Wallet balances are not member entitlements");
    expect(observatory).toContain("Evidence Classes");
    expect(observatory).toContain("SourceRegistryV1 is deployed with one internal PAUSED source record");
    expect(observatory).toContain("Public/default V3 buys use `ZERO_SOURCE_ID`");
    expect(observatory).toContain("Do not build a new public `/economy` route first");
  });

  it("freezes the V3 acquisition engine without making it live", () => {
    const v3 = read("docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md");
    const testPlan = read("docs/V3_ACQUISITION_ENGINE_TEST_PLAN.md");
    const qa = read("docs/V3_SMART_CONTRACT_QA_READINESS.md");
    const deployment = read("docs/V3_DEPLOYMENT_READINESS_PACKAGE.md");
    const contractRegistry = read("src/lib/contract-registry.ts");
    const referral = read("src/routes/referral.tsx");

    expect(v3).toContain("Status: CANONICAL V3 SPECIFICATION / DEPLOYED DIRECT-BUY INFRA / VALIDATED INTERNAL SOURCE TEST");
    expect(v3).toContain("Chapter is historical identity and belonging.");
    expect(v3).toContain("Era is pricing.");
    expect(v3).toContain("grossUsdc - acquisitionCost = protocolContribution");
    expect(v3).toContain("MEMBER_INTRODUCTION");
    expect(v3).toContain("BUILDER_SOURCE");
    expect(v3).toContain("AFFILIATE");
    expect(v3).toContain("BD_NETWORK");
    expect(v3).toContain("WHITELABEL");
    expect(v3).toContain("SPONSORSHIP");
    expect(v3).toContain("TREASURY_DEAL");
    expect(v3).toContain("Initiator");
    expect(v3).toContain("Advocate");
    expect(v3).toContain("Connector");
    expect(v3).toContain("Catalyst");
    expect(v3).toContain("Steward");
    expect(v3).toContain("Reviewed Source Terms");
    expect(v3).toContain("as retired for acquisition progression");
    expect(v3).toContain("approved source terms may go up to 30%");
    expect(v3).toContain("public maximum automatic rate: 12%");
    expect(v3).toContain("Every action must emit an event and be visible");
    expect(v3).toContain("Recommended technical event");
    expect(v3).toContain("V1/V2/V2b migration posture through numbered historical-member proofs");
    expect(v3).toContain("V3 must never emit `memberNumber = 0`");
    expect(v3).toContain("existing SYN holders with a valid historical-member-number proof");
    expect(v3).toContain("raw SYN balance alone is current holder/seat status, not sufficient");
    expect(v3).toContain("unknown wallets may buy and receive a new V3 member number even if they");
    expect(v3).toContain("Public buys target MembershipSaleV3 with `ZERO_SOURCE_ID`");
    expect(v3).toContain("SourceRegistryV1 has one internal PAUSED source record");
    expect(v3).toContain("preserved as a reviewed candidate");
    expect(v3).toContain("strategically superseded");

    expect(testPlan).toContain("exact V3 era price schedule");
    expect(testPlan).toContain("repeat purchase inside attribution window pays commission");
    expect(testPlan).toContain("30%");
    expect(testPlan).toContain("no member-ownership or network-inventory language");
    expect(testPlan).toContain("Payout Escrow And Smart-Wallet Tests");

    expect(qa).toContain("Status: QA PASS / DEPLOYED / OWNER ACCEPTED / FUNDED / DIRECT-BUY TARGET / VALIDATED INTERNAL SOURCE TEST");
    expect(qa).toContain("blocked payout wallet cannot grief normal purchases");
    expect(qa).toContain("address-only V1 proofs are disabled");
    expect(qa).toContain("numbered historical-member proofs set both `knownMember` and `memberNumberOf`");
    expect(qa).toContain("raw SYN balance alone is not used as historical-member identity");
    expect(qa).toContain("dusted balance must not block an otherwise valid buyer");
    expect(qa).toContain("historical-member migration");
    expect(qa).toContain("Slither was installed and run");
    expect(qa).toContain("Real QuickNode fork rehearsal was rerun after the historical-member migration");
    expect(qa).toContain("RehearsalForkV3: 4 passed, 0 failed, 0 skipped");
    expect(qa).toContain("MembershipSaleV3 is the direct-buy target");
    expect(qa).toContain("hardware-wallet-first owner");
    expect(qa).toContain("Non-Live Deployment Readback Update");

    expect(deployment).toContain("Status: OPERATIONAL READINESS PACKAGE / HARDWARE-WALLET FIRST / NO DEPLOYMENT AUTHORIZED");
    expect(deployment).toContain("No step in this package authorizes deployment, activation, registry switch, or");
    expect(deployment).toContain("dedicated owner hardware wallet");
    expect(deployment).toContain("Ownable2Step transfer + owner acceptance readback");
    expect(deployment).toContain("`SourceRegistryV1` Constructor");
    expect(deployment).toContain("`MembershipSaleV3` Constructor Parameters");
    expect(deployment).toContain("The frontend direct-buy target is");
    expect(deployment).toContain("MembershipSaleV3 for zero-source public purchases");
    expect(deployment).toContain("V2b is now paused on-chain");
    expect(deployment).toContain("slither . --exclude-dependencies");
    expect(deployment).toContain("aderyn .");
    expect(deployment).toContain("AVAX_RPC=<QuickNode Avalanche C-Chain HTTPS endpoint>");
    expect(deployment).toContain("No private keys. No broadcast. No real deployment.");
    expect(deployment).toContain("2-of-3 Safe");
    expect(deployment).toContain("Safe + timelock");

    expect(contractRegistry).toContain('"COMMISSION_ROUTER_V1"');
    expect(contractRegistry).toContain('"PENDING"');
    expect(referral).toContain("One PAUSED source record. No commission.");
  });

  it("keeps referral/source attribution readiness non-live and source-record gated", () => {
    const readiness = read("docs/REFERRAL_SOURCE_ATTRIBUTION_V1_READINESS.md");
    const ral = read("docs/REVENUE_ATTRIBUTION_LAYER.md");
    const legal = read("docs/LEGAL_DISCLOSURE_REFERRAL.md");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const referralRoute = read("src/routes/referral.tsx");
    const futureReferral = read("src/lib/future-referral.ts");
    const sourcePacket = read("docs/SOURCE_RECORD_PACKET_TEMPLATE.md");
    const sourceRunbook = read("docs/SOURCE_CREATION_CEREMONY_RUNBOOK.md");
    const sourceForkReadback = read("docs/SOURCE_ATTRIBUTION_FORK_REHEARSAL_READBACK.md");
    const internalSourceDraft = read("docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_DRAFT.md");
    const internalSourceFounderInputs = read("docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FOUNDER_INPUTS.md");
    const internalSourceMetadata = read("docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_FROZEN_METADATA.json");
    const deferredLedger = read("docs/DEFERRED_WORK_LEDGER.md");
    const archiveCanon = read("docs/ARCHIVE1155_CANONICAL_ARCHITECTURE.md");

    expect(readiness).toContain("Status: NON-LIVE READINESS SPEC / ONE VALIDATED INTERNAL SOURCE TEST / NO CLAIM UI");
    expect(readiness).toContain("SourceRegistryV1 | Deployed at `0x780013bB358be6be95b401901264FC7c22a595a6`; owner accepted; one internal source record, final status PAUSED");
    expect(readiness).toContain("Public V3 buy path | Uses `ZERO_SOURCE_ID`; no source-linked public buy path is active");
    expect(readiness).toContain("No new smart contract is required");
    expect(readiness).toContain("Claim UI requires escrow/readback truth");
    expect(readiness).toContain("This document does not authorize:");

    expect(ral).toContain("internal source record completed one controlled source-attributed buy");
    expect(ral).toContain("Public V3 buys use `ZERO_SOURCE_ID`");
    expect(ral).toContain("CommissionRouterV1 remains a reviewed candidate/test reference, not the V3");
    expect(ral).toContain("If a valid source exists: `grossUsdc - acquisitionCost == protocolContribution`");
    expect(legal).toContain("No source-aware public link is active");
    expect(legal).toContain("No referral/source commission is accruing");

    expect(saleHooks).toContain("ZERO_SOURCE_ID");
    expect(livePurchase).toContain("args: [usdcRaw, address!, ZERO_SOURCE_ID, minSynOut, []]");
    expect(referralRoute).toContain("no commission is accruing");
    expect(referralRoute).toContain("no claim button");
    expect(referralRoute).toContain("Public/default buys still use ZERO_SOURCE_ID");
    expect(referralRoute).toContain("gross USDC minus acquisition commission");
    expect(referralRoute).toContain("CommissionRouterV1 is not the active V3 source engine");
    expect(referralRoute).toContain("Archive1155 is not source-aware");
    expect(referralRoute).toContain("Module Integration Standard");
    expect(referralRoute).not.toMatch(/may only come from the Operations slice/i);
    expect(referralRoute).not.toMatch(/Archive1155 already supports source attribution/i);
    expect(referralRoute).not.toMatch(/NFT source commission is live/i);
    expect(referralRoute).not.toMatch(/SwapRail.*commission.*live/i);
    expect(futureReferral).toContain("verified source records are active, read back, legally approved, and wired live");
    expect(sourcePacket).toContain("Status: TEMPLATE ONLY / NON-TRANSACTIONAL / NO SOURCE CREATION AUTHORIZED");
    expect(sourcePacket).toContain("Source ID");
    expect(sourcePacket).toContain("Payout wallet");
    expect(sourcePacket).toContain("Required SourceRegistry Readback");
    expect(sourcePacket).toContain("Expected MembershipSaleV3 Behavior");
    expect(sourcePacket).toContain("Founder Approval Checklist");
    expect(sourcePacket).toContain("No source record is created without explicit founder approval.");
    expect(sourceRunbook).toContain("Status: RUNBOOK ONLY / NO TRANSACTION AUTHORIZED / VALIDATED INTERNAL SOURCE TEST EXISTS");
    expect(sourceRunbook).toContain("Current Authority Check");
    expect(sourceRunbook).toContain("readbacks, and chat memory are lineage only");
    expect(sourceRunbook).toContain("Read `owner()`");
    expect(sourceRunbook).toContain("Read `pendingOwner()`");
    expect(sourceRunbook).toContain("Confirm `sourceExists(sourceId) = false`");
    expect(sourceRunbook).toContain("Confirm `sourceConfig(sourceId)` is empty/default before creation");
    expect(sourceRunbook).toContain("Confirm MembershipSaleV3 still points to this SourceRegistryV1");
    expect(sourceRunbook).toContain("createSource(bytes32 sourceId, SourceTerms terms)");
    expect(sourceRunbook).toContain("The initial status must be `PAUSED`.");
    expect(sourceRunbook).toContain("No source creation happens without founder approval.");
    expect(sourceForkReadback).toContain("Status: PASSED / DEPLOYED-ADDRESS FORK ONLY / NO MAINNET SOURCE RECORD");
    expect(sourceForkReadback).toContain("2 passed / 0 failed / 0 skipped");
    expect(sourceForkReadback).toContain("It does not create a real mainnet source record.");
    expect(sourceForkReadback).toContain("A separate activation ceremony is required before any source can be used live.");
    expect(internalSourceDraft).toContain("Status: PAUSED SOURCE CREATED / READBACK GREEN / NO ACTIVATION AUTHORIZED");
    expect(internalSourceDraft).toContain("Internal Protocol Test Source vs Future Public Referrer");
    expect(internalSourceDraft).toContain("It is not a public");
    expect(internalSourceDraft).toContain("not a user referral link");
    expect(internalSourceDraft).toContain("not the future member referral UX");
    expect(internalSourceDraft).toContain("Anti-drift rule: do not use the first internal test source as a template for");
    expect(internalSourceDraft).toContain("public referrer UX without a separate member-referral design sprint");
    expect(internalSourceDraft).toContain("Source class | `BUILDER_SOURCE`");
    expect(internalSourceDraft).toContain("Source wallet | `0x244531C571966f90f4849e03a507543d90f9C721`");
    expect(internalSourceDraft).toContain("Payout wallet | `0x244531C571966f90f4849e03a507543d90f9C721`");
    expect(internalSourceDraft).toContain("Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001`");
    expect(internalSourceDraft).toContain("Dedicated source-test wallet; not a public referrer wallet");
    expect(internalSourceDraft).toContain("`keccak256(utf8(\"INTERNAL_PROTOCOL_TEST_SOURCE_001:0x244531C571966f90f4849e03a507543d90f9C721:2026-07-01T12:00:00Z\"))`");
    expect(internalSourceDraft).toContain("0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620");
    expect(internalSourceDraft).toContain("0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d");
    expect(internalSourceDraft).toContain("This internal protocol test source must not be treated as the future public");
    expect(internalSourceDraft).toContain("No public source link.");
    expect(internalSourceDraft).toContain("This packet applies only to MembershipSaleV3 source attribution.");
    expect(internalSourceDraft).toContain("It does not apply to Archive1155 NFT mints");
    expect(internalSourceDraft).toContain("Future NFT, ERC-721, SwapRail, or product-commerce attribution must pass");
    expect(internalSourceDraft).toContain("Founder Input Readiness Matrix");
    expect(internalSourceDraft).toContain("Final source wallet");
    expect(internalSourceDraft).toContain("Final payout wallet");
    expect(internalSourceDraft).toContain("Final sourceId derivation method");
    expect(internalSourceDraft).toContain("Final commission bps");
    expect(internalSourceDraft).toContain("PAUSED-first ceremony approval");
    expect(internalSourceDraft).toContain("Frozen Internal Test Values For Founder Review");
    expect(internalSourceDraft).toContain("25 USDC (`25_000_000`)");
    expect(internalSourceDraft).toContain("5 USDC (`5_000_000`)");
    expect(internalSourceDraft).toContain("Executed createSource Argument Table");
    expect(internalSourceDraft).toContain("Historical Pre-Ceremony Readback Checklist");
    expect(internalSourceDraft).toContain("Current authority beats remembered authority");
    expect(internalSourceDraft).toContain("Frozen packet values and older readbacks");
    expect(internalSourceDraft).toContain("Future Internal Source-Attributed Buy Boundary");
    expect(internalSourceDraft).toContain("production-internal mode only");
    expect(internalSourceDraft).toContain("The first PAUSED source record does not create a referral system");
    expect(internalSourceDraft).toContain("INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL");
    expect(internalSourceDraft).toContain("Historical Readback Command Plan");
    expect(internalSourceDraft).toContain("SourceRegistryV1 = 0x780013bB358be6be95b401901264FC7c22a595a6");
    expect(internalSourceDraft).toContain("isActive(sourceId) = false");
    expect(internalSourceDraft).toContain("Future PAUSED Source Wording");
    expect(internalSourceDraft).toContain("No source commission accrues while status is `PAUSED`");
    expect(internalSourceDraft).toContain("SourceRegistry Readback");
    expect(internalSourceDraft).toContain("Initial status is `PAUSED`.");
    expect(archiveCanon).toContain("Current Archive1155 mints are not source-aware.");
    expect(archiveCanon).toContain("source-attribution work must pass `docs/MODULE_INTEGRATION_STANDARD.md` first");
    expect(archiveCanon).toContain("Possible future paths include:");

    expect(sourcePacket).toContain("Direct on-chain acquisition commission during eligible ACTIVE purchase");
    expect(sourcePacket).toContain("escrow fallback only if transfer fails");
    expect(sourcePacket).toContain("no-agency");
    expect(sourcePacket).toContain("no-MLM/downline");
    expect(sourcePacket).toContain("not tax or accounting advice");

    expect(sourceRunbook).toContain("direct on-chain acquisition commission payout during that purchase transaction");
    expect(sourceRunbook).toContain("Escrow is fallback only if the payout transfer fails");

    expect(internalSourceDraft).toContain("Direct On-Chain Acquisition Commission Reality");
    expect(internalSourceDraft).toContain("escrow exists only as a failed-payout fallback");
    expect(internalSourceDraft).toContain("Source attribution is acquisition attribution, not reward accounting");
    expect(internalSourceDraft).toContain("Source Commission Statement / Reporting Export");
    expect(internalSourceDraft).toContain("Founder Decision Readiness");
    expect(internalSourceDraft).toContain("no-agency");
    expect(internalSourceDraft).toContain("no-MLM/downline");

    expect(internalSourceFounderInputs).toContain("Status: SOURCE CREATED / CONTROLLED TEST VALIDATED / SOURCE PAUSED / NO PUBLIC ACTIVATION AUTHORIZED");
    expect(internalSourceFounderInputs).toContain("SourceRegistryV1 is deployed and currently has one validated internal source test now PAUSED");
    expect(internalSourceFounderInputs).toContain("MembershipSaleV3 is the only current source-aware payment path");
    expect(internalSourceFounderInputs).toContain("Public/default V3 buys continue to use `ZERO_SOURCE_ID`");
    expect(internalSourceFounderInputs).toContain("Move fast by removing ambiguity, not by skipping proof");
    expect(internalSourceFounderInputs).toContain("Internal Test Source vs Future Public Referrer");
    expect(internalSourceFounderInputs).toContain("not a public referrer");
    expect(internalSourceFounderInputs).toContain("not a user referral link");
    expect(internalSourceFounderInputs).toContain("not the future member referral UX");
    expect(internalSourceFounderInputs).toContain("Future public referrer/member source");
    expect(internalSourceFounderInputs).toContain("requires a separate member-referral design sprint");
    expect(internalSourceFounderInputs).toContain("Anti-drift rule: do not use the first internal test source as a template for");
    expect(internalSourceFounderInputs).toContain("public referrer UX without a separate member-referral design sprint");
    expect(internalSourceFounderInputs).toContain("Protocol routing wallets");
    expect(internalSourceFounderInputs).toContain("Source attribution wallets");
    expect(internalSourceFounderInputs).toContain("Vault wallet: receives the Vault share of Net USDC Routed");
    expect(internalSourceFounderInputs).toContain("Payout wallet: the wallet that receives acquisition commission");
    expect(internalSourceFounderInputs).toContain("The source wallet and payout wallet may be the same controlled wallet");
    expect(internalSourceFounderInputs).toContain("Do not use Vault, Liquidity, or Operations as the source wallet or payout wallet");
    expect(internalSourceFounderInputs).toContain("A source wallet does not own a member, seat, receipt, chapter, Archive item, or");
    expect(internalSourceFounderInputs).toContain("Future public referrers will need their own onboarding flow, source links");
    expect(internalSourceFounderInputs).toContain("The suggested 25 USDC gross cap (`25_000_000`) is only a first internal test");
    expect(internalSourceFounderInputs).toContain("The suggested 5 USDC per-buyer cap (`5_000_000`) is only a first internal test");
    expect(internalSourceFounderInputs).toContain("These values are not final public referral limits");
    expect(internalSourceFounderInputs).toContain("These values are not the final public acquisition economy");
    expect(internalSourceFounderInputs).toContain("`WINDOWED` source terms require both `startTime` and `endTime`");
    expect(internalSourceFounderInputs).toContain("A `PAUSED` source can expire if its window is too short");
    expect(internalSourceFounderInputs).toContain("future activation-testing window");
    expect(internalSourceFounderInputs).toContain("create PAUSED now and update terms before activation");
    expect(internalSourceFounderInputs).toContain("Historical Current Authority Check Before Ceremony");
    expect(internalSourceFounderInputs).toContain("Frozen packet values do not authorize a transaction by themselves");
    expect(internalSourceFounderInputs).toContain("Future Internal Source-Attributed Buy Boundary");
    expect(internalSourceFounderInputs).toContain("production-internal mode only");
    expect(internalSourceFounderInputs).toContain("No referral/source link exists today");
    expect(internalSourceFounderInputs).toContain("Source class | `BUILDER_SOURCE`");
    expect(internalSourceFounderInputs).toContain("Source label | `INTERNAL_PROTOCOL_TEST_SOURCE_001`");
    expect(internalSourceFounderInputs).toContain("controlled protocol-test public wallet address");
    expect(internalSourceFounderInputs).toContain("Commission bps | `500` bps");
    expect(internalSourceFounderInputs).toContain("Attribution scope | `WINDOWED`");
    expect(internalSourceFounderInputs).toContain("Gross cap | `25_000_000` USDC units");
    expect(internalSourceFounderInputs).toContain("Per-buyer cap | `5_000_000` USDC units");
    expect(internalSourceFounderInputs).toContain("Repeat purchases | `false`");
    expect(internalSourceFounderInputs).toContain("Privacy/tracking: no public link, no cookies, no session tracking");
    expect(internalSourceFounderInputs).toContain("Source wallet: founder-provided controlled protocol-test wallet");
    expect(internalSourceFounderInputs).toContain("Payout wallet: same founder-provided controlled protocol-test wallet unless");
    expect(internalSourceFounderInputs).toContain("Exact Founder Questions");
    expect(internalSourceFounderInputs).toContain("Which controlled protocol-test public wallet should be the internal source wallet?");
    expect(internalSourceFounderInputs).toContain("Should the payout wallet be the same wallet as the source wallet?");
    expect(internalSourceFounderInputs).toContain("Confirm source class: `BUILDER_SOURCE`?");
    expect(internalSourceFounderInputs).toContain("Confirm commission: `500` bps?");
    expect(internalSourceFounderInputs).toContain("Confirm gross cap: 25 USDC (`25_000_000`)?");
    expect(internalSourceFounderInputs).toContain("Confirm per-buyer cap: 5 USDC (`5_000_000`)?");
    expect(internalSourceFounderInputs).toContain("Confirm repeat purchases: `false`?");
    expect(internalSourceFounderInputs).toContain("Confirm readiness to generate sourceId and metadata hash after all final");
    expect(internalSourceFounderInputs).toContain("0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620");
    expect(internalSourceFounderInputs).toContain("0x1f78bfa95d7aed0ff2a189a48b34bca937d4a3fe7c2defef758611f0bca1b75d");
    expect(internalSourceFounderInputs).toContain("No public referral activation is authorized");
    expect(internalSourceFounderInputs).toContain("No source-aware public buy path is authorized");
    expect(internalSourceFounderInputs).toContain("No public source link is authorized");
    expect(internalSourceFounderInputs).toContain("No claim UI is authorized");
    expect(internalSourceFounderInputs).toContain("No source dashboard is authorized");
    expect(internalSourceFounderInputs).toContain("No Archive/NFT attribution is authorized");
    expect(internalSourceFounderInputs).toContain("No SwapRail attribution is authorized");
    expect(internalSourceFounderInputs).toContain("No product-wide attribution is authorized");
    expect(internalSourceFounderInputs).toContain("This internal protocol test source is not a public referrer");
    expect(internalSourceFounderInputs).toContain("This internal protocol test source is not a user referral link");
    expect(internalSourceFounderInputs).toContain("This internal protocol test source is not the future member referral UX");
    expect(internalSourceFounderInputs).toContain("Direct on-chain acquisition commission can happen only after a future ACTIVE source-attributed purchase");
    expect(internalSourceFounderInputs).toContain("Escrow fallback exists only if direct payout fails");
    expect(internalSourceFounderInputs).toContain("Source starts `PAUSED`");
    expect(internalSourceFounderInputs).toContain("No activation occurs in the same ceremony");
    expect(internalSourceFounderInputs).toContain("Vault, Liquidity, and Operations wallets are protocol routing wallets");
    expect(internalSourceFounderInputs).toContain("25 USDC gross cap and 5 USDC per-buyer cap are first-internal-test values only");
    expect(internalSourceFounderInputs).toContain("Do not use the first internal test source as a template for public referrer UX");
    expect(internalSourceFounderInputs).toContain("PAUSED source created and read back green");
    expect(internalSourceFounderInputs).toContain("Deterministic generation instructions for audit only");
    expect(internalSourceFounderInputs).toContain("source label `INTERNAL_PROTOCOL_TEST_SOURCE_001`");
    expect(internalSourceFounderInputs).toContain("Source observability snapshot / docs");
    expect(internalSourceFounderInputs).toContain("CURRENT_SOURCE_POLICY_RECORDS");
    expect(internalSourceFounderInputs).toContain("Register wording");
    expect(internalSourceFounderInputs).toContain("Activity wording");
    expect(internalSourceFounderInputs).toContain("This source applies only to MembershipSaleV3 unless a future module passes a separate review");
    expect(internalSourceMetadata).toContain("\"sourceLabel\": \"INTERNAL_PROTOCOL_TEST_SOURCE_001\"");
    expect(internalSourceMetadata).toContain("\"sourceWallet\": \"0x244531C571966f90f4849e03a507543d90f9C721\"");
    expect(internalSourceMetadata).toContain("\"sourceId\": \"0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620\"");
    expect(internalSourceMetadata).not.toContain("metadataHash");

    expect(deferredLedger).toContain("Source Commission Statement / Reporting Export");
    expect(deferredLedger).toContain("no tax/accounting advice");
    expect(deferredLedger).toContain("Active source record, V3 source receipts");

    for (const [name, src] of Object.entries({ referralRoute, futureReferral, sourceRunbook, sourceForkReadback })) {
      expect(src, name).not.toMatch(/passive income|yield|downline|MLM/i);
      expect(src, name).not.toMatch(/claimable commission|earned commission now/i);
      expect(src, name).not.toMatch(/source owns (?:a )?member/i);
      expect(src, name).not.toMatch(/referral is the business model/i);
    }

    for (const [name, src] of Object.entries({ sourcePacket, internalSourceDraft })) {
      expect(src, name).not.toMatch(/earn passively|guaranteed earnings|reward entitlement|platform owes/i);
      expect(src, name).not.toMatch(/claimable commission|earned commission now/i);
      expect(src, name).not.toMatch(/source owns (?:a )?member/i);
      expect(src, name).not.toMatch(/referral is the business model/i);
    }
  });

  it("keeps the source-attribution capability map scoped to membership before product-wide expansion", () => {
    const capability = read("docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md");

    expect(capability).toContain("Status: DECISION MAP / ONE VALIDATED INTERNAL SOURCE TEST / SOURCE PAUSED / NO PUBLIC ACTIVATION AUTHORIZED");
    expect(capability).toContain("SourceRegistryV1 is reusable policy infrastructure, not a universal payment");
    expect(capability).toContain("MembershipSaleV3 is source-aware. Archive1155 and future products are not");
    expect(capability).toContain("V3 SYN membership sale");
    expect(capability).toContain("Archive1155 does not accept a `sourceId`");
    expect(capability).toContain("No new contract is needed for the first controlled MembershipSaleV3 source");
    expect(capability).toContain("Future NFT or product commission requires a source-aware sale wrapper/router or new product contract");
    expect(capability).toContain("Public/default buy path | Uses `ZERO_SOURCE_ID`; no source-linked public buy path is active.");
    expect(capability).toContain("Guard with production coherence tests; public copy must use acquisition-first");
    expect(capability).toContain("Result: the first internal BUILDER_SOURCE source record was created PAUSED");
    expect(capability).toContain("the source was activated for one controlled $5");
    expect(capability).toContain("Before creating another source record or activating the existing PAUSED source again");
    expect(capability).toContain("Do not build public source links, claim UI, Archive source attribution, or");

    expect(capability).not.toMatch(/passive income|yield|downline|MLM/i);
    expect(capability).not.toMatch(/claimable commission|earned commission now/i);
    expect(capability).not.toMatch(/source owns (?:a )?member/i);
    expect(capability).not.toMatch(/referral is the business model/i);
  });

  it("requires future modules to pass the modular product integration standard", () => {
    const standard = read("docs/MODULE_INTEGRATION_STANDARD.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");

    expect(standard).toContain("Status: CANONICAL ARCHITECTURE STANDARD / NO TRANSACTION AUTHORIZED");
    expect(standard).toContain("No future module may be implemented as an isolated page patch.");
    expect(standard).toContain("SourceRegistryV1 is reusable policy infrastructure, not a universal payment");
    expect(standard).toContain("MembershipSaleV3 is source-aware");
    expect(standard).toContain("Archive1155 is not source-aware");
    expect(standard).toContain("sourceAttributionSupport:");
    expect(standard).toContain("publicStatus:");
    expect(standard).toContain("receiptSchema:");
    expect(standard).toContain("public-actionable");
    expect(standard).toContain("paymentRequired: true");
    expect(standard).toContain("SwapRail / Bridge / Trade Future Module");
    expect(standard).toContain("Archive / NFT Source Attribution Options");
    expect(standard).toContain("Decision: defer TypeScript registry for now.");
    expect(standard).toContain("Do not implement SwapRail, Archive sale wrapper, ProductSaleRouter, SeatRecord721");
    expect(authority).toContain("docs/MODULE_INTEGRATION_STANDARD.md");
    expect(authority).toContain("canonical anti-fragmentation standard for future modules");
  });

  it("keeps the protocol organism graph canonical and non-live for future modules", () => {
    const graph = read("docs/PROTOCOL_ORGANISM_GRAPH.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");

    expect(graph).toContain("Status: CANONICAL MODULE RELATIONSHIP MAP / NO TRANSACTION AUTHORIZED");
    expect(graph).toContain("docs/MODULE_INTEGRATION_STANDARD.md");
    expect(graph).toContain("Current V3 Direct-Buy Graph");
    expect(graph).toContain("Source Attribution Lifecycle Graph");
    expect(graph).toContain("Archive / NFT Current vs Future Graph");
    expect(graph).toContain("Future Module Relationship Table");
    expect(graph).toContain("public/default V3 buy uses `ZERO_SOURCE_ID`");
    expect(graph).toContain("Archive1155 does not accept `sourceId`");
    expect(graph).toContain("SwapRail is not implemented and not source-aware");
    expect(graph).toContain("ProductSaleRouter does not exist");
    expect(graph).toContain("Claim UI | future/planned module | INACTIVE");
    expect(graph).toContain("SeatRecord721 / identity | Future");
    expect(graph).toContain("No edge. Archive1155 does not accept `sourceId`.");
    expect(graph).toContain("Claim UI remains hidden until escrow/status/legal gates pass.");
    expect(graph).toContain("Source records live, public source links live, claim UI live, product-wide attribution live.");
    expect(graph).not.toMatch(/\| SeatRecord721(?: \/ identity)? \|[^\n]*\|\s*LIVE\s*\|/i);
    expect(graph).not.toMatch(/\| ProductSaleRouter \|[^\n]*\|\s*LIVE\s*\|/i);
    expect(graph).not.toMatch(/\| Claim UI \|[^\n]*\|\s*LIVE\s*\|/i);
    expect(graph).not.toMatch(/\| Source records \|[^\n]*\|\s*ACTIVE\s*\|/i);
    expect(authority).toContain("docs/PROTOCOL_ORGANISM_GRAPH.md");
    expect(authority).toContain("canonical module relationship map");
  });

  it("freezes identity and attribution before referral, Privy, or SeatRecord721 activation", () => {
    const identity = read("docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");
    const sourceTruth = read("docs/canon/02_SOURCE_OF_TRUTH_TABLE.md");
    const protocolModel = read("docs/SYNDICATE_PROTOCOL_MODEL.md");
    const v3 = read("docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md");
    const seatRecord = read("docs/SEAT_RECORD_ARCHITECTURE_DECISION.md");

    expect(identity).toContain("Status: CANONICAL CONSTITUTION / NO DEPLOYMENT AUTHORIZED");
    expect(identity).toContain("A seat owner is the wallet that currently holds SYN.");
    expect(identity).toContain("A source never owns a member.");
    expect(identity).toContain("Existing members must not be captured by a new source retroactively.");
    expect(identity).toContain("Privy is an onboarding and account-management layer.");
    expect(identity).toContain("SeatRecord721 must not:");
    expect(identity).toContain("No-go until explicit future approval:");

    expect(authority).toContain("docs/IDENTITY_ATTRIBUTION_CONSTITUTION.md");
    expect(sourceTruth).toContain("Current seat status");
    expect(sourceTruth).toContain("Historical identity");
    expect(sourceTruth).toContain("Referral / Source attribution");
    expect(protocolModel).toContain("Current seat status, historical identity, and acquisition attribution are");
    expect(v3).toContain("Source attribution is not ownership of a member");
    expect(seatRecord).toContain("Wallet migration, recovery, and historical identity continuity must follow");

    expect(identity).toContain("Forbidden framing:");
    expect(identity).toContain("source owns member");
    expect(identity).not.toMatch(/Privy (?:is|becomes) membership truth/i);
    expect(identity).not.toMatch(/SeatRecord721 replaces SYN/i);
  });

  it("keeps the V3 preview route read-only, candidate, pending, and not live", () => {
    const route = read("src/routes/v3-preview.tsx");
    const model = read("src/lib/v3-preview.ts");
    const docs = read("src/routes/docs.tsx");

    expect(route).toContain('createFileRoute("/v3-preview")');
    expect(route).toContain("CANDIDATE");
    expect(route).toContain("PENDING");
    expect(route).toContain("NOT LIVE");
    expect(route).toContain("No writes. No source activation. No referral activation.");
    expect(route).toContain("The live buy path now");
    expect(route).toContain("MembershipSaleV3 with a zero source ID");
    expect(route).toContain("Read-only quote");
    expect(route).toContain("Acquisition-first routing");
    expect(route).toContain("Receipt example");
    expect(route).toContain("Source attribution");
    expect(route).toContain("Chapter pricing visualization");
    expect(route).toContain("Introduction progression visualization");
    expect(route).toContain("source owns a member");
    expect(route).toContain("Net USDC Routed");
    expect(route).toContain("Acquisition Commission");
    expect(route).toContain("Introduction Progression");
    expect(route).toContain("Source Terms");
    expect(route).toContain("Acquisition Attribution");

    expect(model).toContain("V3_ERA_PREVIEW");
    expect(model).toContain("previewV3Quote");
    expect(model).toContain("MEMBER_INTRODUCTION");
    expect(model).toContain("Initiator");
    expect(model).toContain("Steward");
    expect(model).toContain("Reviewed Source Terms");
    expect(docs).toContain("V3 Preview");
    expect(docs).toContain("Read-only candidate model");

    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|useSendTransaction|claimSourceEscrow|buy\(/);
    expect(route).not.toMatch(/router address|claimSourceEscrow/i);
    expect(route).not.toMatch(/earned commission|claimable|claim button/i);
    expect(route).not.toMatch(/Protocol contribution|Source rate|source progression/i);
    expect(route).not.toMatch(/passive income|downline|MLM/i);
    expect(model).not.toMatch(/label:\s*"Signal"|label:\s*"Ambassador"|label:\s*"Chapter Source"/);
  });

  it("keeps Registry distinctions explicit: Archive1155 live, SeatRecord721 future", () => {
    const registry = read("src/routes/registry.tsx");
    const dossiers = read("src/components/syndicate/ContractDossiers.tsx");
    const config = read("src/lib/syndicate-config.ts");

    expect(registry).toContain("Archive Contract (SyndicateArchive1155)");
    expect(registry).toContain("Patron Seal (ID 3) is CONTRACT_GATED / PUBLIC_MINT_READ_GATED");
    expect(registry).toContain("SeatRecord721 (future ERC-721)");
    expect(registry).not.toMatch(/NFT Contract \(Seat Record/i);

    expect(dossiers).toContain("SyndicateArchive1155");
    expect(dossiers).toContain("The First Signal (ID 1) is public-open");
    expect(dossiers).toContain("Patron Seal (ID 3) is active but wallet/read-gated");
    expect(dossiers).toContain("SeatRecord721 is a separate future ERC-721");

    expect(config).toContain("Archive1155 ID 1 is public-open and ID 3 is wallet/read-gated");
    expect(config).not.toMatch(/NFT Contract \(Seat Record/i);
  });

  it("keeps educational routes aligned on Archive1155 memory vs SeatRecord721 identity", () => {
    const faq = read("src/components/syndicate/FaqRebuilt.tsx");
    const whitepaper = read("src/routes/whitepaper.tsx");
    const transparency = read("src/routes/transparency.tsx");
    const knowledge = read("src/routes/knowledge-map.tsx");

    expect(faq).toContain("not in Archive1155, and not yet deployed");
    expect(faq).toContain("other IDs are owner-only, sealed, reserved, or pending a separate future contract");
    expect(faq).not.toMatch(/planned optional Artifact/i);

    expect(whitepaper).toContain("SeatRecord721 is separate future identity infrastructure");
    expect(whitepaper).toContain("Other Archive1155 artifacts are owner-only, sealed, reserved, or future-contract surfaces");
    expect(whitepaper).not.toMatch(/Other Artifacts\s+remain inactive/i);

    expect(transparency).toMatch(/SeatRecord721 is a\s+separate future identity contract, not a live Archive1155 mint/);
    expect(transparency).not.toMatch(/Seat Records,\s*Genesis Founder Marks/);

    expect(knowledge).toContain("Archive1155 artifacts live in the Archive");
    expect(knowledge).toContain("SeatRecord721 is reserved for future identity records");
    expect(knowledge).not.toMatch(/NFTs live in the Archive/i);
  });

  it("keeps legacy/labs surfaces from reintroducing fake-live rewards or artifact status drift", () => {
    const sections = read("src/components/syndicate/Sections.tsx");
    const referralPreview = read("src/components/preview/ReferralPreview.tsx");
    const questHooks = read("src/lib/quest-hooks.ts");
    const questProgress = read("src/labs/components/QuestProgress.tsx");
    const artifactBoard = read("src/labs/components/ArtifactUniverseBoard.tsx");

    expect(sections).toContain("First Signal");
    expect(sections).toContain("Open Archive1155 mint");
    expect(sections).not.toMatch(/Genesis NFT|Mint Genesis NFT|Scarcity drops|Milestone reward pool/i);

    expect(referralPreview).toContain("No CommissionRouter is deployed");
    expect(referralPreview).toContain("illustrative planning data, not live state");
    expect(referralPreview).not.toMatch(/Referral rewards are commissions/i);

    expect(questHooks).toContain("recognitionStatus");
    expect(questHooks).toContain("No reward, claim, or payout is live");
    expect(questHooks).not.toMatch(/\breward:\s*"/);

    expect(questProgress).toContain("Recognition");
    expect(questProgress).not.toMatch(/>\s*Reward\s*</);

    expect(artifactBoard).toContain("READ_GATED");
    expect(artifactBoard).toContain("wallet mintability is shown only from live Archive1155 reads");
    expect(artifactBoard).not.toMatch(/Public mint open on Avalanche[\s\S]{0,80}Patron Seal/i);
  });

  it("keeps SeatRecord721 framed as future identity, not the V1 seat", () => {
    const gallery = read("src/components/syndicate/ArchiveGalleryPreview.tsx");
    const onboarding = read("src/components/syndicate/ArchiveOnboardingPanel.tsx");
    const cockpitProof = read("src/components/syndicate/cockpit/CockpitProof.tsx");
    const archiveFaq = read("src/components/syndicate/ArchiveFaq.tsx");
    const seatRecordDecision = read("docs/SEAT_RECORD_ARCHITECTURE_DECISION.md");
    const contractRegistry = read("src/lib/contract-registry.ts");

    expect(gallery).toContain("SYN is");
    expect(gallery).toContain("the seat today");
    expect(gallery).toContain("future identity record will live in a separate");
    expect(gallery).not.toMatch(/seat\s+itself\s+.+the identity NFT/i);

    expect(onboarding).toContain("SeatRecord721 future identity record");
    expect(cockpitProof).toContain("SeatRecord721 (future ERC-721)");
    expect(archiveFaq).toContain("SeatRecord721 is planned as a separate future ERC-721 identity layer");

    expect(seatRecordDecision).toContain("Status: SPECIFICATION FROZEN / NOT IMPLEMENTED / NOT DEPLOYED / NOT LIVE");
    expect(seatRecordDecision).toContain("SYN is the V1 membership seat");
    expect(seatRecordDecision).toContain("Holding SYN means the wallet is seated");
    expect(seatRecordDecision).toContain("Archive1155 artifacts are protocol memory, not seats");
    expect(seatRecordDecision).toContain("No SeatRecord721 balance, claim, mint, eligibility, or address exists today");
    expect(seatRecordDecision).toContain("Recommended V1 policy: non-transferable identity record");
    expect(seatRecordDecision).toContain("Secondary-market SYN holders are seated by SYN balance");
    expect(seatRecordDecision).toContain("Token ID 2 in SyndicateArchive1155 remains reserved and disabled in V1");
    expect(seatRecordDecision).toContain("## 13. Forbidden Wording");

    expect(contractRegistry).toContain('"SEAT_RECORD_721"');
    expect(contractRegistry).toContain('"seat-record-721"');
    expect(contractRegistry).toContain('"PENDING"');
  });

  it("keeps the contract-system map aligned with active V3 direct buys and pending source systems", () => {
    const map = read("docs/SMART_CONTRACT_SYSTEM_MAP.md");
    const contractsReadme = read("contracts/README.md");
    const registry = read("src/components/syndicate/ContractDossiers.tsx");
    const contractRegistry = read("src/lib/contract-registry.ts");
    const eventRegistry = read("src/lib/protocol-event-registry.ts");
    const sourceTable = read("docs/canon/02_SOURCE_OF_TRUTH_TABLE.md");
    const syndicateConfig = read("src/lib/syndicate-config.ts");
    const v3ParameterSheet = read("docs/V3_DEPLOYMENT_PARAMETER_SHEET.md");
    const v3ReadbackLog = read("docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md");
    const v3NextBoundary = read("docs/V3_NEXT_BOUNDARY_FUNDING_AND_ACTIVATION_PLAN.md");

    expect(map).toContain("MembershipSaleV3 | LIVE DIRECT-BUY TARGET / SOURCE UI INACTIVE");
    expect(map).toContain("Membership Sale V2b | LIVE / PAUSED HISTORICAL");
    expect(map).toContain("Membership Sale V1 | LIVE / SEALED HISTORICAL");
    expect(map).toContain("Membership Sale V2a | LIVE / SEALED HISTORICAL");
    expect(map).toContain("SourceRegistryV1 | DEPLOYED / VALIDATED INTERNAL SOURCE TEST / PAUSED");
    expect(map).toContain("CommissionRouterV1 | CANDIDATE / PENDING");
    expect(map).toContain("SeatRecord721 | FUTURE / RESERVED");
    expect(map).toContain("CommissionRouterV1 must not receive or affect Vault or Liquidity funds");
    expect(map).toContain("No deployment is authorized by this document");

    expect(contractsReadme).toContain("Membership Sale V2b | LIVE / PAUSED HISTORICAL");
    expect(contractsReadme).toContain("`MembershipSaleV3` | LIVE DIRECT-BUY TARGET / SOURCE UI INACTIVE");
    expect(contractsReadme).toContain("`SourceRegistryV1` | DEPLOYED / VALIDATED INTERNAL SOURCE TEST / PAUSED / REFERRAL UI INACTIVE");
    expect(contractsReadme).toContain("`CommissionRouterV1` | CANDIDATE / NOT DEPLOYED / NOT LIVE");
    expect(contractsReadme).not.toMatch(/Sale V2 \+ CommissionRouter V1 \(Production Solidity\)[\s\S]{0,300}NOT DEPLOYED/);

    expect(registry).toContain("MembershipSaleV3 (active buy target)");
    expect(registry).toContain("SourceRegistryV1 (validated internal source, now PAUSED)");
    expect(registry).toContain("SyndicateMembershipSale V2b (paused historical)");
    expect(registry).toContain("SyndicateMembershipSale V2a (sealed historical)");
    expect(registry).toContain("SyndicateMembershipSale V1 (sealed historical)");
    expect(registry).toContain("frontend does not route new buys to it");
    expect(registry).not.toMatch(/Accepts USDC and dispatches SYN from the Membership Distribution wallet/);

    expect(contractRegistry).toContain("Future ERC-721 identity record derived from SYN seat truth");
    expect(eventRegistry).toContain("future non-transferable identity record derived from SYN seat truth");
    expect(eventRegistry).not.toMatch(/future non-transferable seat-record token/i);

    expect(sourceTable).toContain("Membership Sale V1 (historical proof source only)");
    expect(sourceTable).toContain("0x0020Df30C127306f0F5B44E6a6E4368D2855842d");
    expect(sourceTable).toContain("Membership Sale V2a (historical proof source only)");
    expect(sourceTable).toContain("0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48");
    expect(sourceTable).toContain("Membership Sale V2b (paused historical source)");
    expect(sourceTable).toContain("0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b");
    expect(sourceTable).toContain("V3 SourceRegistry | `0x780013bB358be6be95b401901264FC7c22a595a6` (deployed; owner accepted; one internal source record; one validated internal source-attributed buy; final status PAUSED; referral/source UI inactive)");
    expect(sourceTable).toContain("VALIDATED INTERNAL SOURCE TEST / PUBLIC REFERRAL UI PENDING");
    expect(sourceTable).toContain("V3 MembershipSale | `MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS`");
    expect(sourceTable).toContain("current frontend buy target");
    expect(sourceTable).toContain("funded with 7,000,000 SYN");
    expect(sourceTable).not.toMatch(/\| Membership Sale \| `0x0020Df30C127306f0F5B44E6a6E4368D2855842d`/);
    expect(syndicateConfig).toContain('label: "Membership Sale V3"');
    expect(syndicateConfig).toContain("Current live buy target");
    expect(syndicateConfig).toContain("explorerUrlForAddress(MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS");
    expect(syndicateConfig).not.toMatch(/label: "Membership Sale",\s+status: "live",\s+detail: "SyndicateMembershipSale deployed/);
    expect(syndicateConfig).not.toMatch(/explorerUrlFor\("MEMBERSHIP_SALE_CONTRACT_ADDRESS"\) \?\? undefined/);
    expect(v3ParameterSheet).toContain("Status: DEPLOYED / OWNER ACCEPTED / V2B PAUSED / V3 FUNDED / FRONTEND BUY TARGET / VALIDATED INTERNAL SOURCE TEST");
    expect(v3ParameterSheet).toContain("MembershipSaleV3 is funded with 7,000,000 SYN, unpaused, and selected as the frontend approval/quote/buy target.");
    expect(v3ParameterSheet).toContain("Public V3 buys use zero sourceId. One internal source record completed one controlled source-attributed buy and is now PAUSED.");
    expect(v3ParameterSheet).toContain("SourceRegistryV1 | `0x780013bB358be6be95b401901264FC7c22a595a6` - deployed / owner accepted / validated internal source test / final status PAUSED / referral UI inactive");
    expect(v3ParameterSheet).toContain("V3 MembershipSaleV3 | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` - deployed / owner accepted / funded with 7,000,000 SYN / current frontend buy target / public buys use zero sourceId");
    expect(v3ParameterSheet).toContain("No public source/referral UI or claim UI");
    expect(v3ParameterSheet).toContain("pause is deferred intentionally");
    expect(v3ReadbackLog).toContain("MembershipSaleV3 is deployed, owner-accepted, funded with 7,000,000 SYN, and selected by the frontend buy flow as the active approval/quote/purchase target.");
    expect(v3ReadbackLog).toContain("MembershipSaleV3 `paused()` | `false`");
    expect(v3ReadbackLog).toContain("SourceRegistryV1 PERFECT MATCH; MembershipSaleV3 PERFECT MATCH");
    expect(v3NextBoundary).toContain("V3 Next Boundary: Direct Buy and Source Activation Are Separate");
    expect(v3NextBoundary).toContain("Snowtrace API | VERIFIED | VERIFIED");
    expect(v3NextBoundary).toContain("Sourcify | PERFECT MATCH | PERFECT MATCH");
    expect(v3NextBoundary).toContain("V3 funding | `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2`");
    expect(v3ReadbackLog).toContain("MembershipSaleV3 `availableSyn()` | `6,999,000 SYN`");
    expect(v3ReadbackLog).toContain("First SourceCreated block | `88705814`");
    expect(v3ParameterSheet).not.toContain("- V3 is live.");
    expect(v3ParameterSheet).not.toContain("- Frontend registry switch is authorized.");
    expect(v3ParameterSheet).not.toContain("- Public source/referral UI is authorized.");
  });


  it("keeps V3 direct buys live while source/referral activation stays blocked", () => {
    const contractRegistry = read("src/lib/contract-registry.ts");
    const syndicateConfig = read("src/lib/syndicate-config.ts");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const v3HistoricalMembers = read("src/lib/v3-historical-members.ts");
    const membershipSaleV3 = read("contracts/src/MembershipSaleV3.sol");
    const v3Preview = read("src/routes/v3-preview.tsx");
    const readback = read("docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md");
    const nextBoundary = read("docs/V3_NEXT_BOUNDARY_FUNDING_AND_ACTIVATION_PLAN.md");

    expect(readback).toContain("DEPLOYED / OWNER ACCEPTED / V2B PAUSED / V3 FUNDED / FRONTEND BUY TARGET / VALIDATED INTERNAL SOURCE TEST");
    expect(readback).toContain("V3 funding tx | `0x04b3baf507d2908bff3b561207407cd12d8469a5785bcf90cd4dccaaea5cb7e2`");
    expect(readback).toContain("First SourceCreated status | `PAUSED`");
    expect(readback).toContain("MembershipSaleV3 `paused()` | `false`");
    expect(readback).toContain("V2b: paused, recovery timelock started, retained as historical proof and recovery boundary.");
    expect(nextBoundary).toContain("No source activation.");
    expect(nextBoundary).toContain("No referral/source UI.");
    expect(nextBoundary).toContain("No claim UI.");

    expect(syndicateConfig).toContain('"0x2A6cFc76906e758B934209AFf5A163c9bC20132E"');
    expect(syndicateConfig).toContain('"0x780013bB358be6be95b401901264FC7c22a595a6"');
    expect(syndicateConfig).toContain("SALE_V3_DEPLOYMENT_BLOCK: bigint | null = 88505301n");
    expect(syndicateConfig).not.toContain("SALE_V3_DEPLOYMENT_BLOCK: bigint | null = 88791883n");
    expect(syndicateConfig).toContain('ACTIVE_MEMBERSHIP_SALE_VERSION = SALE_V3_FRONTEND_BUY_TARGET');
    expect(syndicateConfig).toContain("Membership Sale V3");
    expect(syndicateConfig).toContain("Current live buy target");
    expect(contractRegistry).toContain("MEMBERSHIP_SALE_V3");
    expect(contractRegistry).toContain("SOURCE_REGISTRY_V1");
    expect(contractRegistry).toContain("one validated internal source test now PAUSED");
    expect(saleHooks).toContain("ACTIVE_SALE = (SALE_V3 ?? SALE_V2 ?? SALE_V1)");
    expect(saleHooks).toContain("ZERO_SOURCE_ID");
    expect(livePurchase).toContain('functionName: "approve"');
    expect(livePurchase).toContain("args: [SALE, usdcRaw]");
    expect(livePurchase).toContain('functionName: "buy"');
    expect(livePurchase).toContain("abi: SALE_V3_ABI");
    expect(livePurchase).toContain("args: [usdcRaw, address!, ZERO_SOURCE_ID, minSynOut, []]");
    expect(livePurchase).toContain("getV3HistoricalMember");
    expect(livePurchase).toContain("Historical member recognition required");
    expect(livePurchase).toContain("Historical member wallet detected");
    expect(livePurchase).toContain("V3 direct buy requires historical-member recognition");
    expect(livePurchase).toContain("Preserves Member #");
    expect(livePurchase).toContain("approveReceipt.isSuccess");
    expect(livePurchase).toContain("buyReceipt.isSuccess");
    expect(livePurchase).toContain("refetchAllowance()");
    expect(v3HistoricalMembers).toContain(
      "0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329",
    );
    expect(v3HistoricalMembers).toContain("V3_HISTORICAL_MEMBERS");
    expect(v3HistoricalMembers).toContain("memberNumber: 8");
    expect(v3HistoricalMembers).toContain("0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081");
    expect(membershipSaleV3).toContain("claimHistoricalMembership");
    expect(membershipSaleV3).toContain("if (v1Proof.length > 0) revert InvalidProof();");
    expect(v3Preview).toContain("The live buy path now");
    expect(v3Preview).toContain("MembershipSaleV3 with a zero source ID");
    expect(v3Preview).toContain("NOT LIVE");
    expect(v3Preview).not.toMatch(/claimSourceEscrow|source balance|earned commission/i);
  });

  it("keeps the read-only Protocol Economy and My Economy surfaces evidence-labeled", () => {
    const transparency = read("src/routes/transparency.tsx");
    const mySyndicate = read("src/routes/my-syndicate.tsx");
    const economyBand = read("src/components/syndicate/ProtocolEconomyBand.tsx");
    const myEconomy = read("src/components/syndicate/MyEconomy.tsx");
    const purchaseRouting = read("src/components/syndicate/MyPurchaseRouting.tsx");
    const economyDesign = read("docs/PROTOCOL_ECONOMY_OBSERVATORY_DESIGN.md");

    expect(transparency).toContain("ProtocolEconomyBand");
    expect(mySyndicate).toContain("MyEconomy");
    expect(economyBand).toContain("Protocol Economy Observatory");
    expect(economyBand).toContain("Net USDC routed");
    expect(economyBand).toContain("Volume is not revenue");
    expect(economyBand).toContain("sourcePolicy.currentSummary");
    expect(economyBand).toContain("ZERO_SOURCE_ID");
    expect(economyBand).toContain("Referral inactive");
    expect(economyBand).toContain("Claims inactive");
    expect(economyBand).toContain("DESIGN REQUIRED");
    expect(economyBand).toContain("NOT SOURCE-AWARE");
    expect(economyBand).toContain("No writes here");

    expect(myEconomy).toContain("Your wallet's receipt-backed footprint inside The Syndicate");
    expect(myEconomy).toContain("USDC placed");
    expect(myEconomy).toContain("Net USDC routed");
    expect(myEconomy).toContain("SYN is the V1 seat");
    expect(myEconomy).toContain("Source attribution");
    expect(myEconomy).toContain("Claim interface");
    expect(myEconomy).toContain("Not implemented");
    expect(myEconomy).toContain("No claim UI");
    expect(myEconomy).toContain("No source activation");

    expect(purchaseRouting).toContain("cumulativeRoutedToVault");
    expect(purchaseRouting).toContain("cumulativeRoutedToLiquidity");
    expect(purchaseRouting).toContain("cumulativeRoutedToOperations");
    expect(purchaseRouting).toContain("read from indexed purchase receipts");
    expect(purchaseRouting).not.toContain("const vault = (total *");

    expect(economyDesign).toContain("First Read-Only Implementation");
    expect(economyDesign).toContain("do not activate claim UI");

    const newReadOnlySurfaces = [economyBand, myEconomy].join("\n");
    expect(newReadOnlySurfaces).not.toMatch(/useWriteContract|writeContract|sendTransaction|claimSourceEscrow/i);
    expect(newReadOnlySurfaces).not.toMatch(/passive income|yield-bearing|ROI|guaranteed return|earnings dashboard/i);
  });

  it("keeps operational memory durable for GitHub, Replit, sandbox, and handoff work", () => {
    const ledger = read("docs/OPERATIONAL_MEMORY_LEDGER.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");
    const release = read("docs/RELEASE_HANDOFF.md");
    const syncDoctrine = read("docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md");
    const canonAuthority = read("docs/canon/00_AUTHORITY_MAP.md");
    const smartContractLedger = read("docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md");
    const activationRunbook = read("docs/ACTIVATION_RUNBOOK.md");

    expect(authority).toContain("docs/OPERATIONAL_MEMORY_LEDGER.md");
    expect(authority).toContain("docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md");
    expect(authority).toContain("operational first-read for synchronization");
    expect(authority).toContain("GitHub/Replit/production state separation");
    expect(authority).toContain("Execution authority rule: current readback beats remembered authority");
    expect(authority).toContain("require a fresh current-authority check");
    expect(canonAuthority).toContain("docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md");
    expect(canonAuthority).toContain("GitHub/Replit/production sync decision system");
    expect(release).toContain("Before synchronization, Replit publish, patch handoff, or production release");
    expect(release).toContain("docs/OPERATIONAL_MEMORY_LEDGER.md");
    expect(release).toContain("docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md");
    expect(release).toContain("requires Replit pull, publish, route QA, wallet/write-path QA");
    expect(release).toContain("Local validation is not delivery");
    expect(release).toContain("pushed to GitHub main");
    expect(release).toContain("GitHub Desktop clone, GitHub connector/API");
    expect(release).toContain("Current authority beats remembered authority");
    expect(release).toContain("Do not collapse states");

    expect(ledger).toContain("Status: operational first-read");
    expect(ledger).toContain("Primary synchronization doctrine: `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`");
    expect(ledger).toContain("This file has no deployment authority");
    expect(ledger).toContain("GitHub main is the canonical implementation truth");
    expect(ledger).toContain("Replit is the production deployment surface");
    expect(ledger).toContain("Desktop export folders are not authoritative");
    expect(ledger).toContain("Sandbox access differs from founder machine access");
    expect(ledger).toContain("GitHub Desktop clones may be readable but not writable");
    expect(ledger).toContain("Patch-file handoffs are a last resort");
    expect(ledger).toContain("Production velocity is a protocol resource");
    expect(ledger).toContain("Run `npm run check-release`");
    expect(ledger).toContain("Never commit `.output`, `node_modules`, `contracts/out`,");
    expect(ledger).toContain("If push or write access is blocked, report the exact blocker");
    expect(ledger).toContain("Local validation, GitHub sync, Replit publish, and production verification");
    expect(ledger).toContain("OML-011 - Local validated commits are not delivery");
    expect(ledger).toContain("26038b0");
    expect(ledger).toContain("bd7b5bc");
    expect(ledger).toContain("SEC_E_NO_CREDENTIALS");
    expect(ledger).toContain("Patch handoff is not a valid completion path");
    expect(ledger).toContain("local success: files changed, tests passed, local commit exists");
    expect(ledger).toContain("GitHub success: GitHub main contains the commit");
    expect(ledger).toContain("Replit success: Replit has pulled and validated the commit");
    expect(ledger).toContain("production success: the live site is published and route-checked");
    expect(ledger).toContain("OML-012 - Current authority beats remembered authority");
    expect(ledger).toContain("Lineage explains how we arrived here");
    expect(ledger).toContain("Execution must use current truth");
    expect(ledger).toContain("never remembered truth, never historical truth alone, never stale documentation alone");
    expect(ledger).toContain("OML-013 - Production synchronization requires change classification");
    expect(ledger).toContain("Never ask Replit to pull, publish, push back, or skip publish without first naming the change class");
    expect(ledger).toContain("OML-014 - Replit dev workflow watcher limits are not production failures");
    expect(ledger).toContain("ENOSPC: System limit for number of file watchers reached");
    expect(ledger).toContain("Do not collapse dev-server watcher exhaustion into production failure");
    expect(ledger).toContain("local-only Replit config edits");
    expect(ledger).toContain("OML-015 - Live QA text matches are not live controls");
    expect(ledger).toContain("Loose live-site grep checks flagged text such as \"no claim UI\"");
    expect(ledger).toContain("buttons, links, inputs, forms, selectors, wallet actions, or source-aware buy paths");
    expect(ledger).toContain("local `vite.config.ts` watch-ignore fix as an intentional local divergence");
    expect(ledger).toContain("`check-commission-router-freeze` `BLOCKED` output as expected pre-activation posture");
    expect(ledger).toContain("OML-016 - Use the environment with current authority, but sync first");
    expect(ledger).toContain("Replit may have the correct read environment and production context");
    expect(ledger).toContain("file-content parity matters more than literal HEAD equality");
    expect(ledger).toContain("Never run current-authority readbacks from a stale workspace");
    expect(ledger).toContain("Never expose RPC URLs or secrets");
    expect(ledger).toContain("OML-017 - Operator consoles must make ceremony state explicit");
    expect(ledger).toContain("Approval must be labeled as a checkpoint, not as the buy");
    expect(ledger).toContain("A correct gate is not enough");
    expect(ledger).toContain("OML-018 - A blockchain transaction is not automatically the protocol event");
    expect(ledger).toContain("Approval gives permission");
    expect(ledger).toContain("Approval receipts are checkpoint evidence only");

    expect(syncDoctrine).toContain("Status: OPERATIONAL DOCTRINE / NO DEPLOYMENT AUTHORITY / NO PUBLISH AUTHORITY");
    expect(syncDoctrine).toContain("Source-Of-Truth Model");
    expect(syncDoctrine).toContain("Change Classification Matrix");
    expect(syncDoctrine).toContain("Replit Pre-Pull Protocol");
    expect(syncDoctrine).toContain("Publish Decision Protocol");
    expect(syncDoctrine).toContain("Live QA Protocol");
    expect(syncDoctrine).toContain("Replit Push-Back Protocol");
    expect(syncDoctrine).toContain("Codex After-Replit Protocol");
    expect(syncDoctrine).toContain("Final Reporting Standard");
    expect(syncDoctrine).toContain("Never treat GitHub as production");
    expect(syncDoctrine).toContain("Never treat Replit workspace as published site");
    expect(syncDoctrine).toContain("Never treat contract deployment as product activation");
    expect(syncDoctrine).toContain("Never treat local preview as production QA");
    expect(syncDoctrine).toContain("Never call source policy existence \"referral live.\"");
    expect(syncDoctrine).toContain("docs-only or guard-only");
    expect(syncDoctrine).toContain("Payment / write-path frontend");
    expect(syncDoctrine).toContain("Activation / public availability boundary");
    expect(smartContractLedger).toContain("SCRL-015 - Current readback is execution authority");
    expect(smartContractLedger).toContain("No transaction packet may rely on remembered values alone");
    expect(activationRunbook).toContain("Current Authority Check");
    expect(activationRunbook).toContain("Previous reports");
    expect(activationRunbook).toContain("chat memory are lineage only");
    expect(ledger).toContain("Product UX regression ledger");
    expect(ledger).toContain("Live production incident ledger");
  });

  it("keeps referral and source-attribution strategic research non-activating", () => {
    const research = read("docs/REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");

    expect(authority).toContain("docs/REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md");
    expect(authority).toContain("no activation, deployment, source-record, claim-UI, or transaction authority");

    expect(research).toContain("Status: STRATEGIC RESEARCH / ARCHITECTURE REFERENCE / NO ACTIVATION AUTHORITY");
    expect(research).toContain("SourceRegistryV1 is policy infrastructure, not a universal commerce router");
    expect(research).toContain("MembershipSaleV3 is the only current source-aware payment path");
    expect(research).toContain("Public/default V3 buys must continue to use `ZERO_SOURCE_ID`");
    expect(research).toContain("One internal source record exists, completed one controlled source-attributed");
    expect(research).toContain("Referral/source UI and claim UI remain inactive");
    expect(research).toContain("Archive1155, SwapRail, future product sales, and SeatRecord721 are not source-aware today");
    expect(research).toContain("CommissionRouterV1 as the active V3 source engine");
    expect(research).toContain("Do not create or activate a source in the same ceremony");
    expect(research).toContain("existing internal PAUSED MembershipSaleV3 source record");
    expect(research).toContain("Never frame source attribution as:");
    expect(research).toContain("passive income");
    expect(research).toContain("MLM");
    expect(research).not.toMatch(/public referral is live|claim UI is live|source records are active/i);
  });

  it("keeps referral infrastructure platform audit non-activating and source-record gated", () => {
    const audit = read("docs/REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");

    expect(authority).toContain("docs/REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md");
    expect(authority).toContain("no activation, deployment, source-record, claim-UI, public-source-link, or transaction authority");

    expect(audit).toContain("Status: OPERATIONAL RESEARCH / INFRASTRUCTURE BLUEPRINT / NO ACTIVATION AUTHORITY");
    expect(audit).toContain("Mature referral platforms are workflow systems, not only links");
    expect(audit).toContain("One internal source record exists, completed one controlled source-attributed");
    expect(audit).toContain("Public/default buys use ZERO_SOURCE_ID");
    expect(audit).toContain("SourceRegistryV1 is not a universal commerce router");
    expect(audit).toContain("MembershipSaleV3 is the only current source-aware payment path");
    expect(audit).toContain("Archive1155 is not source-aware");
    expect(audit).toContain("Product-wide attribution remains future-only");
    expect(audit).toContain("one internal, PAUSED, readback-first MembershipSaleV3 source record");
    expect(audit).toContain("Do not create public source links before an active source record");
    expect(audit).toContain("No MLM/downline/passive-income framing");
    expect(audit).not.toMatch(/public referral is live|claim UI is live|source records are active|source links are live/i);
  });

  it("keeps the whole-protocol checkpoint aligned with current source and production truth", () => {
    const checkpoint = read("docs/PROTOCOL_CHECKPOINT_2026_06_25.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");
    const strategicOrder = read("docs/STRATEGIC_NARRATIVE_AND_EXECUTION_ORDER.md");

    expect(authority).toContain("docs/PROTOCOL_CHECKPOINT_2026_06_25.md");
    expect(authority).toContain("Current source/referral state in this older synthesis is superseded by `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`");
    expect(strategicOrder).toContain("source/referral state in this 2026-06-22");
    expect(strategicOrder).toContain("superseded by `docs/PROTOCOL_CHECKPOINT_2026_06_25.md`");
    expect(checkpoint).toContain("Status: OPERATIONAL CHECKPOINT / CURRENT AUTHORITY SNAPSHOT / INTERNAL SOURCE TEST VALIDATED / NO PUBLIC ACTIVATION AUTHORITY");
    expect(checkpoint).toContain("Published and QA green from `e19927b`");
    expect(checkpoint).toContain("`46e10a2b4d601f886d1409ff29b9d7ab999cfe38`");
    expect(checkpoint).toContain("completed a controlled source-attributed buy and was returned to PAUSED");
    expect(checkpoint).toContain("`0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`");
    expect(checkpoint).toContain("`0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280`");
    expect(checkpoint).toContain("public/default sourceId = ZERO_SOURCE_ID");
    expect(checkpoint).toContain("OML-015");
    expect(checkpoint).toContain("Source activation readiness packet");
    expect(checkpoint).toContain("Internal Source-Aware Test Path");
    expect(checkpoint).toContain("Do not activate referral yet.");
    expect(checkpoint).toContain("\"A source record means referral is live.\"");
    expect(checkpoint).not.toMatch(/\| Referral\/source UI \| Live|\| Claim UI \| Live|source links are live now/i);
  });

  it("keeps the whole-protocol knowledge index discoverable and non-activating", () => {
    const index = read("docs/PROTOCOL_KNOWLEDGE_INDEX.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");

    expect(authority).toContain("docs/PROTOCOL_KNOWLEDGE_INDEX.md");
    expect(index).toContain("Status: OPERATIONAL FRONT DOOR / WHOLE-PROTOCOL NAVIGATION / NO ACTIVATION AUTHORITY");
    expect(index).toContain("Current Whole-Protocol Authority");
    expect(index).toContain("Protocol Domain Map");
    expect(index).toContain("Reading Paths By Task");
    expect(index).toContain("File Authority Rationalization");
    expect(index).toContain("Superseded / Dangerous Old Truths");
    expect(index).toContain("Current Execution Roadmap");
    expect(index).toContain("Guard / Test Hooks");
    expect(index).toContain("MembershipSaleV3");
    expect(index).toContain("SourceRegistryV1");
    expect(index).toContain("one internal source record now PAUSED after a completed controlled source-attributed buy");
    expect(index).toContain("ZERO_SOURCE_ID");
    expect(index).toContain("Archive1155");
    expect(index).toContain("SeatRecord721");
    expect(index).toContain("SwapRail");
    expect(index).toContain("Production Synchronization Doctrine");
    expect(index).toContain("GitHub green means production green");
    expect(index).toContain("source-attributed receipt projection");
    expect(index).not.toMatch(/\| Referral\/source UI \| Live|\| Claim UI \| Live|source links are live now/i);
  });

  it("keeps source activation readiness non-transactional and aligned with the PAUSED source truth", () => {
    const packet = read("docs/SOURCE_ACTIVATION_READINESS_PACKET.md");
    const preflight = read("docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md");
    const localPathDoc = read("docs/SOURCE_AWARE_LOCAL_TEST_PATH.md");
    const realConditionPlan = read("docs/SOURCE_REAL_CONDITION_TEST_PLAN.md");
    const founderGuide = read("docs/SOURCE_REAL_CONDITION_FOUNDER_CEREMONY_GUIDE.md");
    const realConditionReadback = read("docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md");
    const realConditionMetadata = read(
      "docs/SOURCE_PACKETS/SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25_METADATA.json",
    );
    const model = read("src/lib/source-activation-readiness.ts");
    const modelTest = read("src/lib/__tests__/source-activation-readiness.test.ts");
    const localGate = read("src/lib/source-aware-test-mode.ts");
    const localGateTest = read("src/lib/__tests__/source-aware-test-mode.test.ts");
    const realConditionModel = read("src/lib/source-real-condition-test.ts");
    const operatorModel = read("src/lib/source-test-operator-ceremony.ts");
    const operatorModelTest = read("src/lib/__tests__/source-test-operator-ceremony.test.ts");
    const localRoute = read("src/routes/labs.source-attribution-test.tsx");
    const localHarness = read("src/components/syndicate/SourceAwareLocalTestHarness.tsx");
    const saleHooks = read("src/lib/sale-hooks.ts");
    const livePurchase = read("src/components/syndicate/LivePurchase.tsx");
    const walletArchitecture = read("docs/WALLET_TRANSACTION_ARCHITECTURE.md");
    const smartContractLedger = read("docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md");
    const authority = read("docs/DOCUMENTATION_AUTHORITY_MAP.md");
    const index = read("docs/PROTOCOL_KNOWLEDGE_INDEX.md");
    const checkpoint = read("docs/PROTOCOL_CHECKPOINT_2026_06_25.md");
    const capability = read("docs/SOURCE_ATTRIBUTION_CAPABILITY_MAP.md");
    const graph = read("docs/PROTOCOL_ORGANISM_GRAPH.md");

    expect(authority).toContain("docs/SOURCE_ACTIVATION_READINESS_PACKET.md");
    expect(authority).toContain("docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md");
    expect(authority).toContain("docs/SOURCE_AWARE_LOCAL_TEST_PATH.md");
    expect(authority).toContain("docs/SOURCE_REAL_CONDITION_TEST_PLAN.md");
    expect(authority).toContain("docs/SOURCE_REAL_CONDITION_FOUNDER_CEREMONY_GUIDE.md");
    expect(index).toContain("docs/SOURCE_ACTIVATION_READINESS_PACKET.md");
    expect(index).toContain("docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md");
    expect(index).toContain("docs/SOURCE_REAL_CONDITION_FOUNDER_CEREMONY_GUIDE.md");
    expect(index).toContain("src/lib/source-activation-readiness.ts");
    expect(index).toContain("src/lib/source-aware-test-mode.ts");
    expect(packet).toContain("Status: FUTURE READINESS REFERENCE / SOURCE RE-PAUSED / NO TRANSACTION AUTHORIZED");
    expect(packet).toContain("The first controlled ACTIVE ceremony and $5 source-attributed buy have already");
    expect(packet).toContain("No active source exists today | SATISFIED");
    expect(packet).toContain("Internal source-aware test path | SATISFIED AS BOUNDARY");
    expect(packet).toContain("VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true");
    expect(packet).toContain("Buyer disclosure / clear-source UX | SATISFIED AS INTERNAL BOUNDARY");
    expect(packet).toContain("/labs/source-attribution-test?sourceTest=INTERNAL_PROTOCOL_TEST_SOURCE_001");
    expect(packet).toContain("This table is for future review only. It is not an instruction to sign.");
    expect(packet).toContain("docs/SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md");
    expect(preflight).toContain("Status: EXECUTED PREFLIGHT REFERENCE / SOURCE RE-PAUSED / NO TRANSACTION AUTHORIZED");
    expect(preflight).toContain("NO-GO FOR ANY NEW SIGNING OR BROADCAST");
    expect(preflight).toContain("AVAX_RPC");
    expect(preflight).toContain("setSourceStatus(bytes32,uint8)");
    expect(preflight).toContain("Founder Approval Sentence Required");
    expect(preflight).toContain("Rollback / Re-Pause Plan");
    expect(preflight).toContain("2026-07-01T12:00:00Z");
    expect(preflight).toContain("2026-07-15T12:00:00Z");
    expect(preflight).toContain("public/default buy path");
    expect(model).toContain("readyForActiveCeremony");
    expect(model).toContain("readyForPublicReferral: false");
    expect(model).toContain("readyForClaimUi: false");
    expect(model).toContain("readyForPublicSourceAwareBuyPath: false");
    expect(modelTest).toContain("readyForActiveCeremony).toBe(false)");
    expect(localPathDoc).toContain("INTERNAL TEST BOUNDARY / NO ACTIVATION AUTHORIZED");
    expect(localPathDoc).toContain("VITE_ENABLE_SOURCE_TEST_MODE=true");
    expect(localPathDoc).toContain("VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE=true");
    expect(localPathDoc).toContain("VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet>");
    expect(localPathDoc).toContain("Current truth: the source is `PAUSED`, so the harness renders blockers and no");
    expect(localGate).toContain("LOCKED_PRODUCTION");
    expect(localGate).toContain("LOCKED_BUYER_NOT_ALLOWLISTED");
    expect(localGate).toContain("SOURCE_AWARE_PRODUCTION_TEST_MODE_FLAG");
    expect(localGate).toContain("LOCKED_NON_LOCALHOST");
    expect(localGate).toContain("LOCKED_SOURCE_NOT_ACTIVE");
    expect(localGate).toContain("canPrepareSourceAwareBuy");
    expect(localGateTest).toContain("allows production-internal test mode only for an allowlisted buyer");
    expect(localRoute).toContain('createFileRoute("/labs/source-attribution-test")');
    expect(localRoute).toContain('{ name: "robots", content: "noindex, nofollow" }');
    expect(localHarness).toContain("INTERNAL SOURCE TEST MODE / NOT PUBLIC REFERRAL");
    expect(localHarness).toContain("Source Attribution Operator Console");
    expect(localHarness).toContain("Stay on this page");
    expect(localHarness).toContain("Approval complete: buy still pending");
    expect(localHarness).toContain("Approval complete - now start controlled $5 buy");
    expect(localHarness).toContain("did not emit MembershipPurchasedV3");
    expect(localHarness).toContain("Start controlled $5 test buy");
    expect(localHarness).toContain("Buy submitted - STOP and wait for readback");
    expect(localHarness).toContain("Re-pause only after readback");
    expect(localHarness).toContain("Approval tx - permission only");
    expect(localHarness).toContain("Buy tx - protocol event");
    expect(localHarness).toContain("sourceRecordMatchesRealConditionTestTerms");
    expect(localHarness).toContain("VITE_ENABLE_PRODUCTION_SOURCE_TEST_MODE");
    expect(localHarness).toContain("!gate.canPrepareSourceAwareBuy");
    expect(localHarness).toContain("args: [TEST_USDC_RAW, wallet.address!, TEST_SOURCE_ID, minSynOut, []]");
    expect(operatorModel).toContain("APPROVAL_ONLY_BUY_PENDING");
    expect(operatorModel).toContain("Approval complete - buy still pending");
    expect(operatorModel).toContain("MembershipPurchasedV3");
    expect(operatorModelTest).toContain("treats approval as permission only");
    expect(operatorModelTest).toContain("requires buy transaction evidence");
    expect(realConditionPlan).toContain("Status: EXECUTED / SOURCE RE-PAUSED / PUBLIC REFERRAL INACTIVE");
    expect(realConditionPlan).toContain("updateSourceTerms(bytes32,(address,uint8,uint16,uint8,uint64,uint64,uint256,uint256,bool,address,bytes32))");
    expect(realConditionPlan).toContain("1782388800");
    expect(realConditionPlan).toContain("1783598400");
    expect(realConditionPlan).toContain("0x797dedbf845edc5954012c46a6c42e121f19f142d76fe34c8f59bf8e8c7bd681");
    expect(realConditionPlan).toContain("VITE_SOURCE_TEST_ALLOWED_BUYERS=<fresh buyer wallet address>");
    expect(realConditionPlan).toContain("APPROVAL ONLY / BUY");
    expect(realConditionPlan).toContain("This is permission only");
    expect(realConditionPlan).toContain("This is the protocol event");
    expect(realConditionPlan).toContain("reject `USDC.approve` receipts as approval-only");
    expect(founderGuide).toContain("We did not launch referral. We tested the engine with one controlled internal");
    expect(founderGuide).toContain("Approval is not the buy");
    expect(founderGuide).toContain("APPROVAL COMPLETE / BUY STILL PENDING");
    expect(founderGuide).toContain("Step 1 - updateSourceTerms");
    expect(founderGuide).toContain("It does not activate the source.");
    expect(founderGuide).toContain("Source status remains `PAUSED`");
    expect(founderGuide).toContain("Step 3 - set ACTIVE");
    expect(founderGuide).toContain("Step 5 - one $5 source-attributed buy");
    expect(founderGuide).toContain("Step 7 - re-pause");
    expect(founderGuide).toContain("I approve only the SourceRegistryV1 updateSourceTerms transaction");
    expect(founderGuide).toContain("I approve only setSourceStatus ACTIVE");
    expect(founderGuide).toContain("I approve one controlled $5 source-attributed MembershipSaleV3 buy");
    expect(founderGuide).toContain("I approve only setSourceStatus PAUSED");
    expect(founderGuide).toContain("0x620febd921E7B8d123c7DFB6731ed58fCfbcC75F");
    expect(founderGuide).toContain("No AI agent signs. No AI agent broadcasts.");
    expect(realConditionReadback).toContain("Status: COMPLETED / SOURCE RE-PAUSED / PUBLIC REFERRAL INACTIVE");
    expect(realConditionReadback).toContain("0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46");
    expect(realConditionReadback).toContain("0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f");
    expect(realConditionReadback).toContain("`sourceEscrowOwed(sourceId)` | `0`");
    expect(realConditionReadback).toContain("final source status: `PAUSED`");
    expect(walletArchitecture).toContain("Approval is permission only");
    expect(walletArchitecture).toContain("reject an approval-only hash as incomplete");
    expect(smartContractLedger).toContain("source-operator approval-only incident");
    expect(smartContractLedger).toContain("source-test-operator-ceremony.test.ts");
    expect(founderGuide).not.toMatch(/referral is live|claim UI is live|public source link exists/i);
    expect(realConditionModel).toContain("REAL_CONDITION_SOURCE_TEST_TERMS");
    expect(realConditionModel).toContain("REAL_CONDITION_SOURCE_TEST_COMPLETION");
    expect(realConditionModel).toContain("sourceRecordMatchesRealConditionTestTerms");
    expect(realConditionMetadata).toContain("SOURCE_PACKET_INTERNAL_TEST_001_TERMS_UPDATE_2026_06_25");
    expect(realConditionMetadata).not.toContain("metadataHash");
    expect(saleHooks).toContain("const quoteSourceId = options.sourceId ?? ZERO_SOURCE_ID");
    expect(livePurchase).toContain("args: [usdcRaw, address!, ZERO_SOURCE_ID, minSynOut, []]");
    expect(checkpoint).toContain("docs/SOURCE_ACTIVATION_READINESS_PACKET.md");
    expect(checkpoint).toContain("docs/SOURCE_AWARE_LOCAL_TEST_PATH.md");
    expect(capability).toContain("src/lib/source-activation-readiness.ts");
    expect(capability).toContain("src/lib/source-aware-test-mode.ts");
    expect(graph).toContain("ONE INTERNAL PAUSED RECORD");
    expect(graph).toContain("one internal PAUSED source record");
    expect(graph).not.toMatch(/Source records \| source\/attribution policy \| ZERO records|Deployed; zero records|first internal packet remains draft/i);
    expect(packet).toContain("no yield/passive-income/ROI framing");
    expect(packet).toContain("no MLM/downline framing");
    expect(packet).toContain("financial leaderboard framing");
    const fakeLiveSurface = [packet, preflight, localPathDoc, localGate, localRoute, localHarness].join("\n");
    expect(fakeLiveSurface).not.toMatch(/public referral is live|claim UI is live|source links are live|top earner|leaderboard is live|guaranteed return|yield opportunity/i);
  });

  it("keeps the current runtime free of legacy platform dependencies", () => {
    const currentRuntime = [
      "package.json",
      "bun.lock",
      "bunfig.toml",
      "vite.config.ts",
      "scripts/check-homepage-content.mjs",
      "src/routes/__root.tsx",
      "src/routes/api.chat.ts",
      "src/lib/ai.functions.ts",
      "src/lib/ai-gateway.server.ts",
      "src/lib/build-stamp.ts",
      "src/lib/client-error-reporting.ts",
    ]
      .map((file) => read(file))
      .join("\n");

    const legacyPlatformName = ["lov", "able"].join("");
    const legacyPlatformPattern = new RegExp(`${legacyPlatformName}|@${legacyPlatformName}`, "i");

    expect(currentRuntime).not.toMatch(legacyPlatformPattern);
    expect(read("package.json")).not.toContain(`@${legacyPlatformName}.dev/vite-tanstack-config`);
    expect(read("vite.config.ts")).toContain("tanstackStart");
    expect(read("vite.config.ts")).toContain('nitro({ preset: "node-server" })');
  });

  it("keeps Patron Seal read-gated outside deep mint surfaces", () => {
    const activity = read("src/routes/activity.tsx");
    const glossary = read("src/components/syndicate/ArchiveGlossary.tsx");
    const readiness = read("src/components/syndicate/PatronSealReadiness.tsx");

    expect(activity).toContain('{ label: "Patron Seal mint (ID 3)", state: "ACTIVE · READ GATED" }');
    expect(activity).not.toContain('{ label: "Patron Seal mint (ID 3)", state: "LIVE" }');

    expect(glossary).toContain("ACTIVE · READ GATED");
    expect(glossary).toContain("ID 3 Patron Seal today");
    expect(glossary).not.toMatch(/CONFIGURED Â· NOT ACTIVE[\s\S]{0,120}Patron Seal/i);

    expect(readiness).toContain("ACTIVE · READ GATED");
    expect(readiness).not.toMatch(/Patron Seal[\s\S]{0,220}public mint is open/i);
  });
});





