import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  PRODUCT_OS_V1_BOUNDARY_LABELS,
  PRODUCT_OS_V1_REVIEW_TOKEN,
  PRODUCT_OS_V1_REVIEW_URL,
} from "../product-os-v1-preview";

const repoRoot = process.cwd();

function read(path: string) {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("Product OS V1 hidden preview", () => {
  it("keeps the hidden preview token-gated, noindex, and direct-url only", () => {
    const route = read("src/routes/labs.product-os-v1.tsx");
    const labsIndex = read("src/routes/labs.index.tsx");
    const sitemap = read("src/routes/sitemap[.]xml.ts");
    const header = read("src/components/syndicate/Header.tsx");
    const footer = read("src/components/syndicate/Sections.tsx");
    const mobileJoinBar = read("src/components/syndicate/MobileJoinBar.tsx");
    const robots = read("public/robots.txt");

    expect(PRODUCT_OS_V1_REVIEW_TOKEN).toBe("SYNDICATE_PRODUCT_OS_V1");
    expect(PRODUCT_OS_V1_REVIEW_URL).toBe("/labs/product-os-v1?review=SYNDICATE_PRODUCT_OS_V1");
    expect(route).toContain('createFileRoute("/labs/product-os-v1")');
    expect(route).toContain('content: "noindex, nofollow"');
    expect(route).toContain("LockedProductOsPreview");
    expect(route).toContain("review === PRODUCT_OS_V1_REVIEW_TOKEN");
    expect(labsIndex).not.toContain("/labs/product-os-v1");
    expect(sitemap).not.toContain("/labs/product-os-v1");
    expect(header).not.toContain("/labs/product-os-v1");
    expect(footer).not.toContain("/labs/product-os-v1");
    expect(mobileJoinBar).toContain('path === "/labs" || path.startsWith("/labs/")');
    expect(robots).toMatch(/Disallow:\s*\/labs/);
  });

  it("does not import the Studio package or expose activating actions", () => {
    const route = read("src/routes/labs.product-os-v1.tsx");
    const data = read("src/lib/product-os-v1-preview.ts");

    expect(route).not.toMatch(/from\s+["'][^"']*apps\/product-os-studio/);
    expect(route).not.toMatch(/useWriteContract|writeContract|sendTransaction|wallet_watchAsset|burnNow|claimReward|claimSourceEscrow|buyWithSource/);
    expect(route).not.toContain("href=");
    expect(route).not.toContain("<button");
    expect(data).not.toMatch(/from\s+["'][^"']*apps\/product-os-studio/);
    expect(data).not.toMatch(/https:\/\/dex|https:\/\/snowtrace|https:\/\/avascan|0x[a-fA-F0-9]{40}/);
  });

  it("labels preview data and keeps source, claim, wallet, and founder execution inactive", () => {
    const route = read("src/routes/labs.product-os-v1.tsx");
    const data = read("src/lib/product-os-v1-preview.ts");
    const doc = read("docs/PRODUCT_OS_V1_HIDDEN_PREVIEW.md");

    expect(PRODUCT_OS_V1_BOUNDARY_LABELS).toContain("READ-ONLY PREVIEW");
    expect(PRODUCT_OS_V1_BOUNDARY_LABELS).toContain("NO WALLET WRITES");
    expect(route).toContain("data-wallet-writes=\"none\"");
    expect(route).toContain("data-source-activation=\"none\"");
    expect(route).toContain("data-claim-ui=\"none\"");
    expect(route).toContain("data-founder-execution=\"none\"");
    expect(route).toContain("PREVIEW DATA");
    expect(route).toContain("NOT LIVE METRIC");
    expect(route).toContain("NO LIVE BURN EXECUTION");
    expect(route).toContain("NO PRICE PROMISE");
    expect(data).toContain("No referral/source activation.");
    expect(data).toContain("No claim UI activation.");
    expect(data).toContain("No live wallet writes.");
    expect(doc).toContain("No production routes beyond the hidden lab route are activated.");
  });

  it("uses the required doctrine and routing copy without compressing the split", () => {
    const route = read("src/routes/labs.product-os-v1.tsx");
    const data = read("src/lib/product-os-v1-preview.ts");

    expect(route).toContain("The Syndicate recognizes capital without reducing identity to capital.");
    expect(route).toContain("70% / 20% / 10%");
    expect(data).not.toContain("70/20/10");
    expect(route).not.toContain("70/20/10");
    expect(route).not.toMatch(/Product OS.*return loop|proof propagation|graph output|prompt language|honest state|so you return/i);
  });
});
