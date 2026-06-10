// src/routes/labs.tsx — INTERNAL /labs layout route.
//
// This is the parent layout for every /labs/* surface. It renders an <Outlet/>
// so child routes (index, design-museum, component-index, design-archive,
// invariants) actually display. The /labs index content lives in
// labs.index.tsx. noindex applies to the whole subtree.
//
// Purpose (per docs/P6_IMPLEMENTATION_AND_ARCHIVE_REPORT.md):
//   Preserve institutional memory for components that were demoted from the
//   homepage so we never re-spend on ideas we already built. The Archive
//   Safety Net rule states: demote first, archive second, delete last.

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Labs · Internal — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Internal labs / quarantine area. Not for public use." },
    ],
  }),
  component: LabsLayout,
});

function LabsLayout() {
  return <Outlet />;
}
