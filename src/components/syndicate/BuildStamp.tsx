// Hidden build/version stamp. Carries data attributes + an HTML comment
// sibling so QA scripts and curl can identify the deployed build, but the
// public site does NOT show a visible "build / asset hash / wave-Pn" tag —
// it makes the site look like a dev preview.
//
// To read the build tag from a published page:
//   document.querySelector('[data-build-stamp]').dataset.buildTag
// Or grep the HTML for the `<!-- syndicate-build: ... -->` comment.

import { useEffect, useState } from "react";
import { BUILD_STAMP } from "@/lib/build-stamp";

export function BuildStamp() {
  const [env, setEnv] = useState<"preview" | "production" | "local" | "…">("…");
  useEffect(() => {
    setEnv(BUILD_STAMP.envLabel());
  }, []);

  return (
    <>
      <div
        data-build-stamp
        data-build-iso={BUILD_STAMP.iso}
        data-build-tag={BUILD_STAMP.tag}
        data-build-env={env}
        aria-hidden="true"
        className="sr-only"
      >
        {`syndicate-build ${BUILD_STAMP.iso} ${BUILD_STAMP.tag} ${env}`}
      </div>
      {/* HTML comment fallback for curl/grep-based parity checks */}
      <div
        aria-hidden="true"
        className="hidden"
        dangerouslySetInnerHTML={{
          __html: `<!-- syndicate-build: ${BUILD_STAMP.iso} | ${BUILD_STAMP.tag} | ${env} -->`,
        }}
      />
    </>
  );
}
