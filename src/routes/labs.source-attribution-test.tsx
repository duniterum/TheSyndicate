import { createFileRoute } from "@tanstack/react-router";
import { SourceAwareLocalTestHarness } from "@/components/syndicate/SourceAwareLocalTestHarness";

export const Route = createFileRoute("/labs/source-attribution-test")({
  validateSearch: (search): { sourceTest?: string } => {
    const sourceTest = (search as Record<string, unknown>).sourceTest;
    return typeof sourceTest === "string" ? { sourceTest } : {};
  },
  head: () => ({
    meta: [
      { title: "Source Attribution Operator Console - The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal source-aware operator console. Not public referral, not activation, not a source link.",
      },
    ],
  }),
  component: SourceAttributionTestRoute,
});

function SourceAttributionTestRoute() {
  const { sourceTest } = Route.useSearch();
  return <SourceAwareLocalTestHarness requestedSourceTest={sourceTest} />;
}
