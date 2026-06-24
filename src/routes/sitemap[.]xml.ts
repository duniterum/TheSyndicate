import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://thesyndicate.money";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const ENTRIES: SitemapEntry[] = [
  { path: "/",             changefreq: "weekly",  priority: "1.0" },
  { path: "/token",        changefreq: "weekly",  priority: "0.9" },
  { path: "/tokenomics",   changefreq: "weekly",  priority: "0.9" },
  { path: "/join",         changefreq: "weekly",  priority: "0.9" },
  { path: "/transparency", changefreq: "weekly",  priority: "0.9" },
  { path: "/vault",        changefreq: "weekly",  priority: "0.8" },
  { path: "/ranks",        changefreq: "weekly",  priority: "0.8" },
  { path: "/roadmap",      changefreq: "weekly",  priority: "0.8" },
  { path: "/evolution",    changefreq: "weekly",  priority: "0.7" },
  { path: "/whitepaper",   changefreq: "monthly", priority: "0.8" },
  { path: "/docs",         changefreq: "weekly",  priority: "0.7" },
  { path: "/faq",          changefreq: "monthly", priority: "0.7" },
  { path: "/activity",     changefreq: "daily",   priority: "0.6" },
  { path: "/chronicle",    changefreq: "weekly",  priority: "0.8" },
  { path: "/chapters",     changefreq: "weekly",  priority: "0.7" },
  { path: "/liquidity",    changefreq: "weekly",  priority: "0.7" },
  { path: "/registry",     changefreq: "weekly",  priority: "0.7" },
  { path: "/institutional-register", changefreq: "weekly", priority: "0.5" },
  { path: "/knowledge-map", changefreq: "monthly", priority: "0.5" },
  { path: "/members",      changefreq: "weekly",  priority: "0.6" },
  { path: "/founders",     changefreq: "weekly",  priority: "0.6" },
  // /episodes retired — now 302s to /chapters; excluded from sitemap.
  // /nft is the public-facing mint/ownership route for The First Signal (canonical SEO route).
  // /nfts is an ALIAS of /nft (renders the same NftPage); canonicalizes to /nft.
  // /archive is a DISTINCT museum / protocol-memory route (renders ArchivePage), but
  // canonicalizes to /nft for SEO consolidation.
  { path: "/nft",          changefreq: "weekly",  priority: "0.8" },
  { path: "/archive",      changefreq: "weekly",  priority: "0.6" },
  { path: "/my-syndicate", changefreq: "weekly",  priority: "0.6" },
  { path: "/nfts",         changefreq: "monthly", priority: "0.4" },
  { path: "/ai",           changefreq: "monthly", priority: "0.4" },
  // /referral is a SIMULATED preview surface; noindex on the route — excluded from sitemap.
  // /member/$number and /wallet/$address are DYNAMIC per-entity routes (unbounded,
  // one URL per member/wallet) — intentionally NOT enumerated here. Crawlers reach
  // member profiles via the indexed /members wall, which links to each /member/N.
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = ENTRIES.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
          },
        });
      },
    },
  },
});
