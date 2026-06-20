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

    expect(referral).toContain("REQUIRES CONTRACT");
    expect(referral).toContain("No router. No commission.");
    expect(referral).not.toMatch(/components\/preview/);
    expect(referral).not.toMatch(/simulated/i);
    expect(referral).not.toMatch(/CommissionByTierChart|SimReferralActivity|ReputationLeaderboard/);
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

  it("freezes the V3 acquisition engine without making it live", () => {
    const v3 = read("docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md");
    const testPlan = read("docs/V3_ACQUISITION_ENGINE_TEST_PLAN.md");
    const contractRegistry = read("src/lib/contract-registry.ts");
    const referral = read("src/routes/referral.tsx");

    expect(v3).toContain("Status: CANONICAL V3 SPECIFICATION / NO DEPLOYMENT AUTHORIZED");
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
    expect(v3).toContain("Signal");
    expect(v3).toContain("Advocate");
    expect(v3).toContain("Connector");
    expect(v3).toContain("Catalyst");
    expect(v3).toContain("Ambassador");
    expect(v3).toContain("Chapter Source");
    expect(v3).toContain("approved source terms may go up to 30%");
    expect(v3).toContain("public maximum automatic rate: 12%");
    expect(v3).toContain("Every action must emit an event and be visible");
    expect(v3).toContain("Recommended technical event");
    expect(v3).toContain("preserved as a reviewed candidate");
    expect(v3).toContain("strategically superseded");

    expect(testPlan).toContain("exact V3 era price schedule");
    expect(testPlan).toContain("repeat purchase inside attribution window pays commission");
    expect(testPlan).toContain("30%");
    expect(testPlan).toContain("no MLM/downline language");

    expect(contractRegistry).toContain('"COMMISSION_ROUTER_V1"');
    expect(contractRegistry).toContain('"PENDING"');
    expect(referral).toContain("No router. No commission.");
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

  it("keeps the contract-system map aligned with active V2b and pending future systems", () => {
    const map = read("docs/SMART_CONTRACT_SYSTEM_MAP.md");
    const contractsReadme = read("contracts/README.md");
    const registry = read("src/components/syndicate/ContractDossiers.tsx");
    const contractRegistry = read("src/lib/contract-registry.ts");
    const eventRegistry = read("src/lib/protocol-event-registry.ts");

    expect(map).toContain("Membership Sale V2b | LIVE / ACTIVE / UNAUDITED EARLY");
    expect(map).toContain("Membership Sale V1 | LIVE / SEALED HISTORICAL");
    expect(map).toContain("Membership Sale V2a | LIVE / SEALED HISTORICAL");
    expect(map).toContain("CommissionRouterV1 | CANDIDATE / PENDING");
    expect(map).toContain("SeatRecord721 | FUTURE / RESERVED");
    expect(map).toContain("CommissionRouterV1 must not receive or affect Vault or Liquidity funds");
    expect(map).toContain("No deployment is authorized by this document");

    expect(contractsReadme).toContain("Membership Sale V2b | LIVE / ACTIVE / UNAUDITED EARLY");
    expect(contractsReadme).toContain("`CommissionRouterV1` | CANDIDATE / NOT DEPLOYED / NOT LIVE");
    expect(contractsReadme).not.toMatch(/Sale V2 \+ CommissionRouter V1 \(Production Solidity\)[\s\S]{0,300}NOT DEPLOYED/);

    expect(registry).toContain("SyndicateMembershipSale V2b (active)");
    expect(registry).toContain("SyndicateMembershipSale V2a (sealed historical)");
    expect(registry).toContain("SyndicateMembershipSale V1 (sealed historical)");
    expect(registry).toContain("frontend does not route new buys to it");
    expect(registry).not.toMatch(/Accepts USDC and dispatches SYN from the Membership Distribution wallet/);

    expect(contractRegistry).toContain("Future ERC-721 identity record derived from SYN seat truth");
    expect(eventRegistry).toContain("future non-transferable identity record derived from SYN seat truth");
    expect(eventRegistry).not.toMatch(/future non-transferable seat-record token/i);
  });

  it("keeps Patron Seal read-gated outside deep mint surfaces", () => {
    const activity = read("src/routes/activity.tsx");
    const glossary = read("src/components/syndicate/ArchiveGlossary.tsx");
    const readiness = read("src/components/syndicate/PatronSealReadiness.tsx");

    expect(activity).toContain('{ label: "Patron Seal mint (ID 3)", state: "ACTIVE · READ GATED" }');
    expect(activity).not.toContain('{ label: "Patron Seal mint (ID 3)", state: "LIVE" }');

    expect(glossary).toContain("ACTIVE · READ GATED");
    expect(glossary).toContain("ID 3 Patron Seal today");
    expect(glossary).not.toMatch(/CONFIGURED · NOT ACTIVE[\s\S]{0,120}Patron Seal/i);

    expect(readiness).toContain("ACTIVE · READ GATED");
    expect(readiness).not.toMatch(/Patron Seal[\s\S]{0,220}public mint is open/i);
  });
});
