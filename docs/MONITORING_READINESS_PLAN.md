# Monitoring Readiness Plan — Pre Ads

Date: 2026-06-06
Status: no external monitoring service attached. Manual smoke script available.

## Routes to monitor (expected status)

| Route | Expected | Notes |
|-------|----------|-------|
| `/` | 200 | Homepage |
| `/join` | 200 | Conversion path |
| `/archive` | 200 | NFT Archive — pending contract |
| `/my-syndicate` | 200 | Wallet-aware dashboard |
| `/activity` | 200 | Live event stream |
| `/chapters` | 200 | |
| `/liquidity` | 200 | |
| `/registry` | 200 | |
| `/transparency` | 200 | |
| `/docs` | 200 | |
| `/faq` | 200 | |
| `/whitepaper` | 200 | |
| `/sitemap.xml` | 200 | Content-Type: application/xml |
| `/robots.txt` | 200 | Disallows `/labs` |
| `/episodes` | 307 | Permanent redirect to `/chapters` |
| `/labs` | 200 but `Disallow: /labs` in robots.txt — expected non-indexable, not a failure |

## Alert thresholds (when a service is attached)

- Critical: any route in the table above returns 5xx for >2 consecutive checks (>= 5 min).
- Warning: response time > 3s p95 for >5 min on `/`, `/join`, or `/archive`.
- Info: `/sitemap.xml` content length drops by >25% week-over-week (route accidentally removed).

## Suggested free / simple tools (deferred — owner picks)

- **UptimeRobot** (free tier): HTTPS keyword monitoring every 5 min, email/SMS alerts. No code changes required.
- **BetterStack / Better Uptime** (free tier): status page + alerts, supports multi-region checks.
- **Cron-job.org** (free): run the smoke script via a hosted cron hitting `/api/public/health` if added later.
- **Cloudflare Health Checks**: if the domain is fronted by Cloudflare, configure native uptime checks with zero code.

None of these require a code change in the repo — they hit existing public URLs.

## Manual fallback (always available, no service needed)

```bash
node scripts/check-route-status.mjs https://thesyndicate.money
```

This script is already in the repo and checks all 21 public routes plus the `/episodes → /chapters` redirect plus the `/labs` robots rule. Suitable for daily manual runs during the first-ads window.

## Error monitoring

- Client-side runtime errors are captured by the app-owned client error boundary/reporting path in `src/lib/client-error-reporting.ts`.
- No additional third-party error tracker (Sentry, Bugsnag, etc.) was attached in this pass — would require account setup and a new script tag.
- If owner wants Sentry, the cleanest hook point is `src/start.ts` (server) and `src/router.tsx` (client) — defer until chosen.

## Verdict

Pre-ads safe. Manual smoke check + app-owned client error reporting cover the first-ads window. External monitoring is documented as deferred.
