// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Custom client entry (src/client.tsx) so we can pass onRecoverableError to
    // hydrateRoot and silence the benign, auto-recovered hydration mismatch the
    // Replit canvas preview injects (dev only). Production behaviour unchanged.
    client: { entry: "client" },
  },
  // Force-enable nitro and pin a Node-server target for the Replit deployment
  // build (produces .output/server/index.mjs, run with `node`). Inside the
  // Lovable sandbox this override is ignored — that build is forced back to
  // cloudflare-module — so this is safe for both pipelines.
  nitro: { preset: "node-server" },
  vite: {
    server: {
      allowedHosts: true,
    },
  },
});
