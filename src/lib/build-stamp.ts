// Build / version stamp.
//
// Regenerated on every AI build pass. Surfaced in the footer (and exposed
// for the content-check script) so the user can confirm at a glance which
// build is currently deployed on a given surface.
//
// Format: "YYYY-MM-DD HH:MM UTC · <short-tag>"
// Short tag captures the active wave / pass so QA can correlate releases
// with chat history.

export const BUILD_STAMP = {
  /** ISO timestamp of the last meaningful build pass. */
  iso: "2026-06-09T12:00:00Z",
  /** Human-friendly UTC stamp shown in the footer. */
  human: "2026-06-09 · UTC",
  /** Short release tag — bump on each significant wave. */
  tag: "my-syndicate-v2-command-strip",
  /** Environment hint: 'preview' on lovable preview/sandbox, 'production' on custom domain. */
  envLabel(): "preview" | "production" | "local" {
    if (typeof window === "undefined") return "local";
    const h = window.location.hostname;
    if (h.includes("id-preview--") || h.includes("preview--") || h.endsWith("lovable.app")) {
      // Custom apex / www domains are production; *.lovable.app is preview unless it is the
      // canonical published archive subdomain (still treated as preview for QA clarity).
      if (h === "thesyndicate.money" || h === "www.thesyndicate.money") return "production";
      return "preview";
    }
    if (h === "thesyndicate.money" || h === "www.thesyndicate.money") return "production";
    return "local";
  },
} as const;

export function formatBuildStamp(): string {
  return `Build ${BUILD_STAMP.human} · ${BUILD_STAMP.tag} · ${BUILD_STAMP.envLabel()}`;
}
