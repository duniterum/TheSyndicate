// GET /api/public/og/milestone/$id — SVG OG card for /milestone/$id.
import { createFileRoute } from "@tanstack/react-router";
import { getMilestoneOgData, isMilestoneId } from "@/lib/og-data.server";
import { milestoneOgSvg } from "@/lib/og-templates";

export const Route = createFileRoute("/api/public/og/milestone/$id")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (!isMilestoneId(params.id)) {
          return new Response("Unknown milestone", { status: 404 });
        }
        const data = await getMilestoneOgData(params.id);
        const svg = milestoneOgSvg(data);
        return new Response(svg, {
          status: 200,
          headers: {
            "content-type": "image/svg+xml; charset=utf-8",
            "cache-control": "public, max-age=60, s-maxage=60, stale-while-revalidate=600",
          },
        });
      },
    },
  },
});
