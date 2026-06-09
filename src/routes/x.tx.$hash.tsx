// /x/tx/$hash — app-owned redirect to the user's preferred Avalanche
// explorer. This means every link the app produces (or anyone pastes)
// resolves to a working URL even when individual explorers change paths
// or block traffic. If the saved preference is missing/unknown, we fall
// back to the canonical Snowtrace URL.
//
// The redirect is client-side: TanStack route renders, reads
// localStorage, then issues a `window.location.replace()` so the
// browser history is clean and the bookmarkable URL is the explorer's
// real URL — not our wrapper.
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { txUrls } from "@/lib/chain-registry";
import { isTxHash } from "@/lib/syndicate-config";
import { readExplorerPreference } from "@/lib/explorer-preference";

function TxRedirect() {
  const { hash } = useParams({ from: "/x/tx/$hash" });
  const valid = isTxHash(hash);
  const target = valid
    ? txUrls(hash, readExplorerPreference())[0]?.href ?? null
    : null;

  useEffect(() => {
    if (target) window.location.replace(target);
  }, [target]);

  return (
    <main className="min-h-[40vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center flex flex-col gap-3">
        {valid ? (
          <>
            <h1 className="font-serif text-xl">Opening your preferred explorer…</h1>
            <p className="text-[12px] text-muted-foreground">
              If nothing happens,{" "}
              <a className="text-[var(--gold)] underline" href={target ?? "#"}>
                click here
              </a>
              .
            </p>
            <code className="mono text-[10px] break-all text-foreground/70">{hash}</code>
          </>
        ) : (
          <>
            <h1 className="font-serif text-xl">Invalid transaction hash</h1>
            <p className="text-[12px] text-muted-foreground">
              Expected a 0x-prefixed 32-byte hash.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export const Route = createFileRoute("/x/tx/$hash")({
  head: () => ({
    meta: [
      { title: "Opening explorer · The Syndicate" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TxRedirect,
});
