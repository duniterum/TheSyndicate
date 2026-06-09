// Client-side stale-build detector.
//
// Why: HTML is served `cache-control: no-cache`, but service workers, CDN
// edge caches, and browser bfcache can still keep a visitor on an old JS
// bundle long after we publish. When that happens the page silently runs
// stale code (wrong copy, missing sections, broken hooks).
//
// What it does: at mount and every 5 minutes, refetch the homepage HTML
// with `cache: 'no-store'` and compare the `<script type="module" src=
// "/assets/index-XXXXXXXX.js">` hash against the bundle hash that is
// currently executing in this tab. On mismatch, show a small dismissible
// "New version available — refresh" banner. No banner on first match, no
// banner if detection fails, no banner in dev.

import { useEffect, useState } from "react";

const POLL_MS = 5 * 60 * 1000;
const DISMISS_KEY = "syndicate.staleBuild.dismissedHash";

function currentBundleHash(): string | null {
  if (typeof document === "undefined") return null;
  // Vite emits the entry as <script type="module" src="/assets/index-XXXX.js">
  const scripts = Array.from(document.querySelectorAll<HTMLScriptElement>('script[src*="/assets/"]'));
  for (const s of scripts) {
    const m = s.src.match(/\/assets\/(index|entry)-([A-Za-z0-9_-]+)\.js/);
    if (m) return m[2];
  }
  return null;
}

async function latestBundleHash(): Promise<string | null> {
  try {
    const res = await fetch("/", { cache: "no-store", credentials: "omit" });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/\/assets\/(?:index|entry)-([A-Za-z0-9_-]+)\.js/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function StaleBuildBanner() {
  const [latest, setLatest] = useState<string | null>(null);
  const [current, setCurrent] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skip in dev — Vite hot-reloads, hashes don't apply.
    if (import.meta.env.DEV) return;

    const cur = currentBundleHash();
    if (!cur) return; // detection unavailable → never show
    setCurrent(cur);

    let cancelled = false;
    const tick = async () => {
      const next = await latestBundleHash();
      if (!cancelled && next) setLatest(next);
    };
    tick();
    const id = window.setInterval(tick, POLL_MS);

    const onVis = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVis);

    try {
      const stored = localStorage.getItem(DISMISS_KEY);
      if (stored && stored === cur) {
        // user dismissed for THIS bundle previously — keep dismissed until
        // they're on a newer one.
      }
    } catch {
      /* localStorage may be unavailable */
    }

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!current || !latest || latest === current || dismissed) return null;

  // If user already dismissed for this latest hash, stay hidden.
  try {
    if (localStorage.getItem(DISMISS_KEY) === latest) return null;
  } catch {
    /* ignore */
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-1/2 z-[60] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-full border border-amber-500/40 bg-background/95 px-4 py-2 text-xs shadow-lg backdrop-blur md:bottom-6 md:text-sm"
    >
      <span className="size-2 rounded-full bg-amber-500" aria-hidden />
      <span className="text-foreground">New version available.</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-background transition hover:opacity-90"
      >
        Refresh
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          try {
            localStorage.setItem(DISMISS_KEY, latest);
          } catch {
            /* ignore */
          }
          setDismissed(true);
        }}
        className="text-muted-foreground transition hover:text-foreground"
      >
        ✕
      </button>
    </div>
  );
}
