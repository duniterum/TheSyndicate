import { createFileRoute, redirect } from "@tanstack/react-router";

// /episodes is retired per the Mythology Gate ("Episode" is a banned cultural label).
// Permanently redirect to /chapters where sealed protocol history lives.
export const Route = createFileRoute("/episodes")({
  beforeLoad: () => {
    throw redirect({ to: "/chapters" });
  },
});
