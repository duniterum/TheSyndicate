import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Product OS Studio — standalone prototype build config.
// No Replit-specific plugins. No workspace dependencies. PROTOTYPE ONLY.

const rawPort = process.env.PORT;
const parsedPort = rawPort ? Number(rawPort) : NaN;
const port = !Number.isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 5173;

// Default base is "/" for standalone. Override with BASE_PATH if the Studio is
// served from a sub-path (e.g. "/product-os-studio/").
const basePath = process.env.BASE_PATH || "/";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: true,
  },
  preview: {
    port,
    host: true,
  },
});
