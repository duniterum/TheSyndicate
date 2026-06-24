# Search Submission Notes — The Syndicate

Updated: 2026-06-06 (pre-ads)

## Production endpoints

- **Production domain**: https://thesyndicate.money
- **Sitemap**: https://thesyndicate.money/sitemap.xml
- **Robots**: https://thesyndicate.money/robots.txt
- **Production**: https://thesyndicate.money
- **Preview**: use the current Replit deployment preview only when explicitly provided by the deployment surface.

The mirror and preview URLs are not the canonical search target. Submit only the production domain to search engines.

## Routes intended for indexing

`/`, `/join`, `/archive`, `/my-syndicate`, `/activity`, `/chapters`, `/liquidity`, `/members`, `/founders`, `/ranks`, `/registry`, `/transparency`, `/token`, `/tokenomics`, `/vault`, `/roadmap`, `/docs`, `/faq`, `/whitepaper`.

## Routes NOT to index

- `/labs` — quarantine for retired components. Blocked in `public/robots.txt` (`Disallow: /labs` and `Disallow: /labs/`) and excluded from `src/routes/sitemap[.]xml.ts`.

## Google Search Console — submission steps

1. Sign in at https://search.google.com/search-console with the Google account that owns the project.
2. Add property → **URL prefix** → `https://thesyndicate.money`.
3. Verify ownership. Preferred method: DNS TXT record at the domain registrar. Fallback: HTML meta tag (would require a code change on `__root.tsx` — defer until requested).
4. Sitemaps → Add a new sitemap → `sitemap.xml`.
5. URL Inspection: paste production URL of each important route and click **Request indexing** for: `/`, `/join`, `/archive`, `/my-syndicate`, `/transparency`, `/docs`, `/faq`, `/whitepaper`.
6. Coverage report: confirm `/labs` is reported as **Excluded by robots.txt** (expected, not an error).

## Bing Webmaster Tools — submission steps

1. Sign in at https://www.bing.com/webmasters.
2. Add a site → enter `https://thesyndicate.money`.
3. Verify ownership via DNS TXT, XML file, or meta tag. If Google Search Console is already configured, use **Import from GSC** to skip verification.
4. Sitemaps → Submit sitemap → `https://thesyndicate.money/sitemap.xml`.
5. URL Inspection: submit the same priority routes as GSC for indexing.

## Manual verification commands

```bash
curl -sI https://thesyndicate.money/robots.txt
curl -s  https://thesyndicate.money/robots.txt
curl -sI https://thesyndicate.money/sitemap.xml
curl -s  https://thesyndicate.money/sitemap.xml | grep -E "<loc>"
node scripts/check-route-status.mjs https://thesyndicate.money
```

## Notes

- No login or external setup performed in this pass — these are instructions only. Owner must complete GSC / Bing verification manually.
- Do not submit `/labs` URLs. They are intentionally blocked.
- Do not submit legacy deployment platform mirror or preview URLs — they would compete with the canonical domain.
