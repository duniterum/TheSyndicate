/**
 * Performance Block P1 — app-wide QueryClient defaults.
 *
 * Asserts the shared factory sets the performance defaults (no focus-refetch
 * storms, bounded retries, long gcTime for navigation/reload efficiency, a
 * sensible default staleTime) AND that the router actually builds its client
 * through this factory so the defaults reach the running app.
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createAppQueryClient } from "../query-client";

const ROOT = join(__dirname, "..", "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

describe("P1 · QueryClient defaults", () => {
  it("sets the performance-oriented query defaults", () => {
    const qc = createAppQueryClient();
    const q = qc.getDefaultOptions().queries ?? {};

    expect(q.refetchOnWindowFocus).toBe(false);
    expect(q.refetchOnReconnect).toBe(true);
    expect(q.retry).toBe(2);
    expect(q.gcTime).toBe(24 * 60 * 60 * 1000);
    expect(q.staleTime).toBe(60_000);
  });

  it("the router builds its QueryClient via the shared factory", () => {
    const src = read("src/router.tsx");
    expect(src).toMatch(/createAppQueryClient/);
    // Anti-regression: no bare `new QueryClient()` bypassing the defaults.
    expect(src).not.toMatch(/new\s+QueryClient\s*\(/);
  });
});
