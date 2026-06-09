import { createFileRoute } from "@tanstack/react-router";
import { buildHealthCsv } from "@/lib/health-csv";

/**
 * GET /api/public/protocol-health.csv
 *
 * CSV export of the protocol health registry, findings, staleness, and
 * milestone tickets. Same data as /api/public/protocol-health but in a
 * spreadsheet-friendly shape for audits and offline review.
 */
export const Route = createFileRoute("/api/public/protocol-health/csv")({
  server: {
    handlers: {
      GET: async () => {
        const csv = buildHealthCsv();
        const filename = `protocol-health-${new Date().toISOString().slice(0, 10)}.csv`;
        return new Response(csv, {
          status: 200,
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "content-disposition": `attachment; filename="${filename}"`,
            "cache-control": "no-store",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
