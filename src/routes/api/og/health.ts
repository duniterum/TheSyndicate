import { createFileRoute } from "@tanstack/react-router";

/**
 * GET /api/og/health
 *
 * Lightweight, no-PII health probe for the OG / share infrastructure.
 *
 * Checks (per shareable surface):
 *   - HTML page returns 200
 *   - <title>, <meta name="description">, og:title, og:description, og:image,
 *     twitter:card, twitter:image, twitter:image:alt, <link rel=canonical>
 *     all present
 *   - Dynamic OG endpoints return 200 with expected content type
 *   - Static PNG fallbacks exist
 *
 * Returns a JSON report. Never exposes private data.
 */

type CheckStatus = "ok" | "fail" | "warn";

type Check = {
  name: string;
  status: CheckStatus;
  detail?: string;
};

type SurfaceReport = {
  url: string;
  checks: Check[];
  status: CheckStatus;
};

const SAMPLE_WALLET = "0x0000000000000000000000000000000000000000";
const SAMPLE_MILESTONE = "syn-live";

const REQUIRED_META = [
  { key: "title", pattern: /<title[^>]*>([^<]+)<\/title>/i },
  { key: "description", pattern: /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i },
  { key: "og:title", pattern: /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i },
  { key: "og:description", pattern: /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i },
  { key: "og:image", pattern: /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:card", pattern: /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:image", pattern: /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i },
  { key: "twitter:image:alt", pattern: /<meta[^>]+name=["']twitter:image:alt["'][^>]+content=["']([^"']+)["']/i },
  { key: "canonical", pattern: /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i },
] as const;

async function checkHtmlSurface(origin: string, path: string): Promise<SurfaceReport> {
  const url = origin + path;
  const checks: Check[] = [];
  let html = "";
  try {
    const r = await fetch(url, { headers: { "user-agent": "syndicate-og-health/1.0" } });
    checks.push({
      name: "http",
      status: r.ok ? "ok" : "fail",
      detail: `HTTP ${r.status}`,
    });
    if (r.ok) html = await r.text();
  } catch (e) {
    checks.push({ name: "http", status: "fail", detail: String((e as Error).message ?? e) });
  }

  for (const m of REQUIRED_META) {
    const match = html.match(m.pattern);
    checks.push({
      name: m.key,
      status: match ? "ok" : "fail",
      detail: match ? undefined : "missing",
    });
  }

  const status: CheckStatus = checks.some((c) => c.status === "fail")
    ? "fail"
    : checks.some((c) => c.status === "warn")
      ? "warn"
      : "ok";
  return { url, checks, status };
}

async function checkAsset(
  origin: string,
  path: string,
  expectedContentTypePrefix: string,
): Promise<SurfaceReport> {
  const url = origin + path;
  const checks: Check[] = [];
  try {
    const r = await fetch(url, { headers: { "user-agent": "syndicate-og-health/1.0" } });
    checks.push({
      name: "http",
      status: r.ok ? "ok" : "fail",
      detail: `HTTP ${r.status}`,
    });
    const ct = r.headers.get("content-type") ?? "";
    checks.push({
      name: "content-type",
      status: ct.startsWith(expectedContentTypePrefix) ? "ok" : "fail",
      detail: ct || "missing",
    });
  } catch (e) {
    checks.push({ name: "http", status: "fail", detail: String((e as Error).message ?? e) });
  }
  const status: CheckStatus = checks.some((c) => c.status === "fail") ? "fail" : "ok";
  return { url, checks, status };
}

export const Route = createFileRoute("/api/og/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;

        const [root, transparency, wallet, milestone, ogWallet, ogMilestone, pngRoot, pngTransparency] =
          await Promise.all([
            checkHtmlSurface(origin, "/"),
            checkHtmlSurface(origin, "/transparency"),
            checkHtmlSurface(origin, `/wallet/${SAMPLE_WALLET}`),
            checkHtmlSurface(origin, `/milestone/${SAMPLE_MILESTONE}`),
            checkAsset(origin, `/api/public/og/wallet/${SAMPLE_WALLET}`, "image/svg"),
            checkAsset(origin, `/api/public/og/milestone/${SAMPLE_MILESTONE}`, "image/svg"),
            checkAsset(origin, "/og/og-protocol-default.png", "image/png"),
            checkAsset(origin, "/og/og-transparency.png", "image/png"),
          ]);

        const report = {
          generatedAt: new Date().toISOString(),
          origin,
          surfaces: {
            "/": root,
            "/transparency": transparency,
            "/wallet/:address": wallet,
            "/milestone/:id": milestone,
            "/api/public/og/wallet/:address": ogWallet,
            "/api/public/og/milestone/:id": ogMilestone,
            "/og/og-protocol-default.png": pngRoot,
            "/og/og-transparency.png": pngTransparency,
          },
        };

        const allOk = Object.values(report.surfaces).every((s) => s.status === "ok");
        return new Response(
          JSON.stringify({ ok: allOk, ...report }, null, 2),
          {
            status: allOk ? 200 : 503,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store",
            },
          },
        );
      },
    },
  },
});
