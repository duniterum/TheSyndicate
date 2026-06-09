import { createFileRoute } from "@tanstack/react-router";
import {
  PROTOCOL_HEALTH_REGISTRY,
  aggregateHealth,
} from "@/lib/protocol-health-registry";
import { buildMilestoneReadiness } from "@/lib/milestone-readiness";

/**
 * GET /api/public/protocol-health
 *
 * Lightweight, no-PII snapshot of the Protocol Health Registry plus the
 * derived milestone readiness summary. Intended for monitoring agents and
 * audit exports. Mirrors what `scripts/check-protocol-health.mjs --json`
 * reports, with the addition of `tickets` for downstream issue trackers.
 *
 * Returns 200 always (this is a status surface, not a gate). When the
 * aggregate worstLevel is BLOCKER, callers should treat the response as a
 * deploy-blocking signal — CI uses the script's non-zero exit for that.
 */
export const Route = createFileRoute("/api/public/protocol-health")({
  server: {
    handlers: {
      GET: async () => {
        const aggregate = aggregateHealth();
        const milestone = buildMilestoneReadiness();
        const body = {
          generatedAt: new Date().toISOString(),
          schemaVersion: 1,
          authority: "docs/REALITY_REFLECTION_AUDIT.md",
          aggregate,
          modules: PROTOCOL_HEALTH_REGISTRY,
          milestone,
        };
        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
