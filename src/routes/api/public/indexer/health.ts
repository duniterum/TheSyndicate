import { createFileRoute } from "@tanstack/react-router";
import { getArchiveIndexer } from "@/lib/archive-indexer";
import {
  runIndexerHealthCheck,
  withIndexerInstrumentation,
} from "@/lib/archive-indexer-health";

/**
 * GET /api/public/indexer/health
 *
 * No-PII health probe for the Archive Indexer. Today the underlying
 * indexer is the mock (always PENDING_SEAT_RECORD_CONTRACT), so the report
 * confirms interface integrity and surfaces any programming or latency
 * regressions. Once the live indexer ships, the same endpoint will
 * surface contract-read and RPC failures.
 *
 * Returns 200 when all probes pass, 503 otherwise. The body is JSON;
 * no wallet addresses, tx hashes, or request data are included.
 */
export const Route = createFileRoute("/api/public/indexer/health")({
  server: {
    handlers: {
      GET: async () => {
        // Wrap with instrumentation so the probe itself populates the
        // recent-events ring buffer.
        const indexer = withIndexerInstrumentation(getArchiveIndexer());
        const report = await runIndexerHealthCheck(indexer);

        return new Response(JSON.stringify(report, null, 2), {
          status: report.ok ? 200 : 503,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
