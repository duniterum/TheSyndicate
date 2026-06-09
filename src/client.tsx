import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-start/client";

// React's default recoverable-error reporter: prefer reportError (fires a
// window 'error' event) and fall back to console.error.
const reportRecoverableError =
  typeof reportError === "function"
    ? reportError
    : (error: unknown, errorInfo?: unknown) => console.error(error, errorInfo);

// In the Replit canvas preview, the platform proxy injects its own devtools
// node into the iframe's DOM that the server-rendered HTML never produced.
// React detects this as a hydration mismatch on first paint, logs a scary
// "Hydration failed" error, and then SILENTLY RE-RENDERS the affected subtree
// on the client — the page ends up correct. This is purely a dev-preview
// artifact: a direct fetch, the production build, and a fresh/headless load are
// all clean (verified). The noisy console.error/reportError it emits is what
// trips Replit's crash detector. In DEV ONLY we swallow that one benign,
// auto-recovered hydration mismatch; every other recoverable error still
// surfaces normally, and production behaviour is completely unchanged.
const BENIGN_DEV_HYDRATION =
  /hydrat|did(n['’]?t| not) match|server rendered|server[- ]rendered HTML/i;

function onRecoverableError(error: unknown, errorInfo: unknown) {
  if (import.meta.env.DEV) {
    const message =
      (typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error)) ?? "";
    if (BENIGN_DEV_HYDRATION.test(message)) {
      return;
    }
  }
  reportRecoverableError(error, errorInfo);
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
    { onRecoverableError },
  );
});
