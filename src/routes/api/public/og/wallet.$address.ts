// GET /api/public/og/wallet/$address — SVG OG card for /wallet/$address.
import { createFileRoute } from "@tanstack/react-router";
import { getWalletOgData } from "@/lib/og-data.server";
import { walletOgSvg } from "@/lib/og-templates";

export const Route = createFileRoute("/api/public/og/wallet/$address")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const data = await getWalletOgData(params.address);
        const svg = walletOgSvg(data);
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
