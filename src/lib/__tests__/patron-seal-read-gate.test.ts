import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

const PUBLIC_SURFACES = [
  "src/routes/transparency.tsx",
  "src/routes/nfts.tsx",
  "src/routes/archive.tsx",
  "src/routes/registry.tsx",
  "src/routes/whitepaper.tsx",
  "src/components/syndicate/NftPage.tsx",
  "src/components/syndicate/HomeArchiveTeaser.tsx",
  "src/components/syndicate/ArchiveFaq.tsx",
  "src/components/syndicate/ArchiveGalleryPreview.tsx",
  "src/components/syndicate/ArchiveContractStatus.tsx",
  "src/components/syndicate/ArchiveOnboardingPanel.tsx",
  "src/components/syndicate/FaqRebuilt.tsx",
  "src/components/syndicate/PatronSealReadiness.tsx",
  "src/components/syndicate/RegistryTrustOpener.tsx",
  "src/components/syndicate/Sections.tsx",
] as const;

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

describe("Patron Seal public mint copy", () => {
  it("uses contract/read-gated language on high-visibility public surfaces", () => {
    for (const rel of PUBLIC_SURFACES) {
      const src = read(rel);
      expect(
        /Patron Seal/.test(src),
        `${rel} should still name Patron Seal when it discusses archive mints`,
      ).toBe(true);
      expect(
        /contract\/read gated|CONTRACT_GATED|PUBLIC_MINT_READ_GATED|live Archive1155 reads|READ GATED/i.test(src),
        `${rel} must explain Patron Seal through live read gating`,
      ).toBe(true);
    }
  });

  it("does not statically present Patron Seal as an open public mint on those surfaces", () => {
    const forbidden = [
      /two public mints (?:are )?open/i,
      /Patron Seal[^\n"]{0,140}public mint[^\n"]{0,40}open/i,
      /Patron Seal[^\n"]{0,80}mints open/i,
      /Patron Seal[^\n"]{0,80}is open too/i,
      /Patron Seal[^\n"]{0,80}OPEN at/i,
      /Patron Seal[^\n"]{0,80}both (?:live|LIVE)/i,
      /ID 3[^\n"]{0,40}MINT OPEN/i,
      /ID 3[^\n"]{0,120}OPEN for public mint/i,
    ];

    for (const rel of PUBLIC_SURFACES) {
      const src = read(rel);
      for (const pattern of forbidden) {
        expect(pattern.test(src), `${rel} matched ${pattern}`).toBe(false);
      }
    }
  });

  it("keeps the actual write path behind on-chain active and wallet mintability checks", () => {
    const src = read("src/components/syndicate/MintPatronSeal.tsx");
    expect(src).toContain("isActive");
    expect(src).toContain("isMintableConnected");
    expect(src).toContain("eligibilityOk");
    expect(src).toContain("writeContractAsync");
  });
});
