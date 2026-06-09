// ─── Archive Indexer — Health, Logging, Redaction ────────────────────────
//
// Lightweight, no-PII observability layer for the ArchiveIndexer. Today
// the underlying indexer is the mock (always PENDING_SEAT_RECORD_CONTRACT), so
// "failures" are limited to programming errors and latency anomalies.
// Once the live indexer ships, the same logger + health probe will
// surface contract-read failures, indexer-RPC errors, and rate-limit
// events — without ever logging raw wallet addresses, tx hashes, or
// other potentially sensitive identifiers.
//
// REDACTION CONTRACT (do not weaken):
//   • Wallet addresses → "0xab…cd" (first 4 + last 2 hex chars).
//   • Tx hashes        → "0xabcd…wxyz" (first 6 + last 4 hex chars).
//   • Artifact IDs     → kept (already non-sensitive category/slug strings).
//   • Errors           → message + name only; never full stacks in prod.
//   • No request bodies, no headers, no IPs, no user-agents.
//
// See:
//   src/lib/archive-indexer.ts
//   src/routes/api/public/indexer/health.ts

import type {
  Address,
  ArchiveIndexer,
  ArtifactQueryResult,
  ArtifactToken,
  CategoryQueryResult,
  EligibilityResult,
  MilestoneResult,
} from "./archive-indexer";
import type { ArtifactCategoryId } from "./archive-config";

// ─── Redaction helpers ───────────────────────────────────────────────────

export function redactAddress(addr?: string): string {
  if (!addr) return "—";
  if (addr.length < 10) return "0x…";
  return `${addr.slice(0, 6)}…${addr.slice(-2)}`;
}

export function redactTxHash(h?: string): string {
  if (!h) return "—";
  if (h.length < 14) return "0x…";
  return `${h.slice(0, 6)}…${h.slice(-4)}`;
}

function redactError(err: unknown): { name: string; message: string } {
  if (err instanceof Error) {
    return { name: err.name || "Error", message: err.message || "unknown" };
  }
  return { name: "NonError", message: String(err).slice(0, 200) };
}

// ─── Logger ──────────────────────────────────────────────────────────────

export type LogLevel = "debug" | "info" | "warn" | "error";

export type IndexerLogEvent = {
  ts: string;
  level: LogLevel;
  op: string;
  ms: number;
  ok: boolean;
  /** Redacted scope (e.g. wallet=0x12…ab, category=chapter). */
  scope?: Record<string, string>;
  err?: { name: string; message: string };
};

export interface IndexerLogger {
  log(event: IndexerLogEvent): void;
  /** Read-only ring of recent events for the health endpoint. */
  recent(limit?: number): IndexerLogEvent[];
}

class RingLogger implements IndexerLogger {
  private buf: IndexerLogEvent[] = [];
  private cap = 50;
  log(event: IndexerLogEvent): void {
    this.buf.push(event);
    if (this.buf.length > this.cap) this.buf.shift();
    // Mirror to console at appropriate level — safe (already redacted).
    const line = `[archive-indexer] ${event.op} ${event.ok ? "ok" : "FAIL"} ${event.ms}ms${
      event.scope ? " " + JSON.stringify(event.scope) : ""
    }${event.err ? " err=" + event.err.name + ":" + event.err.message : ""}`;
    if (event.level === "error") console.error(line);
    else if (event.level === "warn") console.warn(line);
    else if (event.level === "debug") {
      // suppress in prod
      if (typeof process !== "undefined" && process.env?.NODE_ENV !== "production")
        console.debug(line);
    } else console.log(line);
  }
  recent(limit = 25): IndexerLogEvent[] {
    return this.buf.slice(-limit).reverse();
  }
}

let _logger: IndexerLogger | null = null;
export function getIndexerLogger(): IndexerLogger {
  if (!_logger) _logger = new RingLogger();
  return _logger;
}

// ─── Instrumented wrapper ────────────────────────────────────────────────
//
// Wraps any ArchiveIndexer with timing, redacted scope, and error capture.
// Use `withIndexerInstrumentation(getArchiveIndexer())` at call sites that
// want logs — or wrap once and re-inject via __setArchiveIndexerForTesting.

export function withIndexerInstrumentation(
  inner: ArchiveIndexer,
  logger: IndexerLogger = getIndexerLogger(),
): ArchiveIndexer {
  async function run<T>(
    op: string,
    scope: Record<string, string | undefined>,
    fn: () => Promise<T>,
  ): Promise<T> {
    const t0 = Date.now();
    const cleanScope: Record<string, string> = {};
    for (const [k, v] of Object.entries(scope)) {
      if (v !== undefined) cleanScope[k] = v;
    }
    try {
      const result = await fn();
      logger.log({
        ts: new Date().toISOString(),
        level: "info",
        op,
        ms: Date.now() - t0,
        ok: true,
        scope: cleanScope,
      });
      return result;
    } catch (e) {
      logger.log({
        ts: new Date().toISOString(),
        level: "error",
        op,
        ms: Date.now() - t0,
        ok: false,
        scope: cleanScope,
        err: redactError(e),
      });
      throw e;
    }
  }

  return {
    kind: inner.kind,
    getCategory: (categoryId: ArtifactCategoryId, wallet?: Address) =>
      run<CategoryQueryResult>(
        "getCategory",
        { category: categoryId, wallet: wallet ? redactAddress(wallet) : undefined },
        () => inner.getCategory(categoryId, wallet),
      ),
    getArtifact: (artifactId: string, wallet?: Address) =>
      run<ArtifactQueryResult>(
        "getArtifact",
        { artifact: artifactId, wallet: wallet ? redactAddress(wallet) : undefined },
        () => inner.getArtifact(artifactId, wallet),
      ),
    checkEligibility: (wallet: Address, artifactId: string) =>
      run<EligibilityResult>(
        "checkEligibility",
        { wallet: redactAddress(wallet), artifact: artifactId },
        () => inner.checkEligibility(wallet, artifactId),
      ),
    listOwnedArtifacts: (wallet: Address) =>
      run<ArtifactToken[]>(
        "listOwnedArtifacts",
        { wallet: redactAddress(wallet) },
        () => inner.listOwnedArtifacts(wallet),
      ),
    getMilestone: (milestoneId: string) =>
      run<MilestoneResult>(
        "getMilestone",
        { milestone: milestoneId },
        () => inner.getMilestone(milestoneId),
      ),
  };
}

// ─── Health probe ────────────────────────────────────────────────────────
//
// Runs a tiny, deterministic synthetic workload against the current
// indexer (mock or live) and returns a no-PII report. Probe values are
// constants — never derived from request input.

const PROBE_CATEGORY: ArtifactCategoryId = "chapter";
const PROBE_ARTIFACT_ID = "probe-artifact";
const PROBE_MILESTONE_ID = "probe-milestone";
const PROBE_WALLET = "0x0000000000000000000000000000000000000000" as Address;

export type IndexerHealthCheck = {
  name: string;
  ok: boolean;
  ms: number;
  detail?: string;
};

export type IndexerHealthReport = {
  generatedAt: string;
  indexerKind: "mock" | "live";
  ok: boolean;
  checks: IndexerHealthCheck[];
  recent: IndexerLogEvent[];
};

export async function runIndexerHealthCheck(
  indexer: ArchiveIndexer,
): Promise<IndexerHealthReport> {
  const checks: IndexerHealthCheck[] = [];

  async function probe(
    name: string,
    fn: () => Promise<unknown>,
    validate?: (r: unknown) => string | undefined,
  ): Promise<void> {
    const t0 = Date.now();
    try {
      const r = await fn();
      const detail = validate?.(r);
      checks.push({
        name,
        ok: detail === undefined,
        ms: Date.now() - t0,
        detail,
      });
    } catch (e) {
      const err = redactError(e);
      checks.push({
        name,
        ok: false,
        ms: Date.now() - t0,
        detail: `${err.name}: ${err.message}`,
      });
    }
  }

  await Promise.all([
    probe(
      "getCategory(chapter)",
      () => indexer.getCategory(PROBE_CATEGORY),
      (r) => {
        const v = r as CategoryQueryResult;
        if (!v?.truthState) return "missing truthState";
        if (!v?.binding) return "missing binding";
        return undefined;
      },
    ),
    probe(
      "getArtifact(probe-artifact)",
      () => indexer.getArtifact(PROBE_ARTIFACT_ID),
      (r) => ((r as ArtifactQueryResult)?.truthState ? undefined : "missing truthState"),
    ),
    probe(
      "checkEligibility(zero,probe-artifact)",
      () => indexer.checkEligibility(PROBE_WALLET, PROBE_ARTIFACT_ID),
      (r) => ((r as EligibilityResult)?.truthState ? undefined : "missing truthState"),
    ),
    probe(
      "listOwnedArtifacts(zero)",
      () => indexer.listOwnedArtifacts(PROBE_WALLET),
      (r) => (Array.isArray(r) ? undefined : "expected array"),
    ),
    probe(
      "getMilestone(probe-milestone)",
      () => indexer.getMilestone(PROBE_MILESTONE_ID),
      (r) => ((r as MilestoneResult)?.truthState ? undefined : "missing truthState"),
    ),
  ]);

  return {
    generatedAt: new Date().toISOString(),
    indexerKind: indexer.kind,
    ok: checks.every((c) => c.ok),
    checks,
    recent: getIndexerLogger().recent(10),
  };
}
