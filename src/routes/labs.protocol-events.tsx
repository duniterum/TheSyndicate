// src/routes/labs.protocol-events.tsx
// INTERNAL · Protocol Event Pipeline — the event workbench.
//
// NOT marketing. An internal design + QA surface for the ONE canonical event
// pipeline:
//
//   raw on-chain log → normalized CanonicalProtocolEvent (enrichEvent) →
//   metric effects → Activity → Chronicle candidate → recommended surfaces
//
// It renders every ProtocolEventKind with its category, metric effects (reusing
// the MetricDisplays forms), chronicle eligibility, and recommended reuse
// surfaces; the reserved future namespaces (all PENDING, none scanned); the
// known-address label registry; and a live useProtocolEvents() sample so you can
// inspect the enriched shape before building any new event-driven surface.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap. Nothing here
// fabricates a value — live rows come straight from useProtocolEvents().

import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useProtocolEvents, type CanonicalProtocolEvent } from "@/lib/protocol-events";
import {
  type ProtocolEventKind,
  type ProtocolEventCategory,
  CATEGORY_FOR_KIND,
  EVENT_METRIC_EFFECTS,
  chronicleEligibleForKind,
  RECOMMENDED_SURFACES_FOR_CATEGORY,
  FUTURE_EVENT_NAMESPACES,
} from "@/lib/protocol-event-registry";
import { KNOWN_ADDRESSES, labelForAddress } from "@/lib/known-addresses";
import { getMetric } from "@/lib/protocol-metrics-registry";
import { MetricTickerItem, MetricStatusBadge } from "@/components/metrics/MetricDisplays";

export const Route = createFileRoute("/labs/protocol-events")({
  head: () => ({
    meta: [
      { title: "Protocol Event Pipeline · Event Workbench — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal event workbench. Every protocol event kind, its metric effects, chronicle eligibility, and recommended surfaces — the one canonical pipeline. Not for public use.",
      },
    ],
  }),
  component: ProtocolEventsWorkbench,
});

// Sensible reading order: membership-sale → lp → protocol-wallet → archive →
// burn. Exhaustive over ProtocolEventKind (the registry's CATEGORY_FOR_KIND is
// the source of truth for the category each maps to).
const KIND_ORDER: ProtocolEventKind[] = [
  "purchase",
  "new-member",
  "rank-reached",
  "swap-buy",
  "swap-sell",
  "lp-add",
  "lp-remove",
  "vault-in",
  "vault-out",
  "nft-mint-first-signal",
  "nft-mint-patron-seal",
  "nft-mint-other",
  "burn-founder",
  "burn-community",
];

const CATEGORY_LABEL: Record<ProtocolEventCategory, string> = {
  "membership-sale": "Membership sale",
  "syn-transfer": "SYN transfer",
  burn: "Burn",
  archive: "Archive",
  lp: "Liquidity pool",
  "protocol-wallet": "Protocol wallet",
};

// The RAW on-chain source each category is normalized FROM. Documentation only
// (advisory) — the normalizers in protocol-events.ts are the implementation.
const SOURCE_FOR_CATEGORY: Record<ProtocolEventCategory, string> = {
  "membership-sale": "TokensPurchased on the Membership Sale contract (new-member + rank-reached are derived per-buyer).",
  "syn-transfer": "SYN ERC-20 Transfer logs (general movements — reserved; only burns are indexed today).",
  burn: "SYN ERC-20 Transfer to the burn address; sender classifies founder vs community.",
  archive: "TransferSingle / mint logs on the Archive1155 contract.",
  lp: "Swap / Mint / Burn logs on the LP pair (Mint/Burn = liquidity add/remove, not token burn).",
  "protocol-wallet": "USDC Transfer logs in/out of a protocol wallet address.",
};

function ProtocolEventsWorkbench() {
  const { events, isLoading, isError } = useProtocolEvents({ limit: 12 });

  const stats = useMemo(() => {
    const byCategory = new Map<ProtocolEventCategory, number>();
    for (const k of KIND_ORDER) {
      const c = CATEGORY_FOR_KIND[k];
      byCategory.set(c, (byCategory.get(c) ?? 0) + 1);
    }
    const chronicleCandidates = KIND_ORDER.filter(chronicleEligibleForKind).length;
    return {
      kinds: KIND_ORDER.length,
      categories: byCategory.size,
      chronicleCandidates,
      futures: FUTURE_EVENT_NAMESPACES.length,
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      {/* Internal banner */}
      <div className="mb-8 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-amber-700 dark:text-amber-400">
        <div className="mono text-[11px] font-semibold uppercase tracking-[0.22em]">
          Internal · Labs · Not production
        </div>
        <p className="mt-1 text-xs">
          Event workbench for design + QA. Not marketing, not linked from public navigation,{" "}
          <code>noindex</code>, blocked by <code>/labs</code> in robots.txt. Live rows come straight
          from <code>useProtocolEvents()</code>; everything else is read from the canonical event
          registry. Nothing here fabricates a value.
        </p>
      </div>

      {/* Header */}
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · event workbench
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Protocol Event Pipeline · Event Workbench
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          The ONE canonical path every on-chain event travels. Before building a new event-driven
          surface, find the kind here and reuse its classification — never re-derive a category,
          metric effect, chronicle rule, or surface list inline. The registries are the one source;
          this is their map.
        </p>

        {/* Pipeline stages */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {[
            "Raw on-chain log",
            "Normalized event (enrichEvent)",
            "Metric effects",
            "Activity",
            "Chronicle candidate",
            "Surfaces",
          ].map((stage, i, arr) => (
            <span key={stage} className="flex items-center gap-2">
              <span className="rounded border border-border bg-card px-2 py-1 font-medium text-foreground">
                {stage}
              </span>
              {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            Event kinds: <b>{stats.kinds}</b>
          </span>
          <span>
            Categories: <b>{stats.categories}</b>
          </span>
          <span>
            Chronicle candidates: <b>{stats.chronicleCandidates}</b>
          </span>
          <span>
            Reserved future namespaces: <b>{stats.futures}</b>
          </span>
        </div>

        <nav className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link to="/labs" className="underline hover:no-underline">
            → Labs index
          </Link>
          <Link to="/labs/protocol-intelligence" className="underline hover:no-underline">
            → Protocol intelligence (metric workbench)
          </Link>
          <a href="#kinds" className="underline hover:no-underline">
            → Event kinds
          </a>
          <a href="#live" className="underline hover:no-underline">
            → Live sample
          </a>
          <a href="#future" className="underline hover:no-underline">
            → Future namespaces
          </a>
          <a href="#addresses" className="underline hover:no-underline">
            → Known addresses
          </a>
        </nav>
      </header>

      {/* ── Event kind catalog ─────────────────────────────────────────────── */}
      <section id="kinds" className="mt-12 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Event kinds <span className="text-muted-foreground">· {KIND_ORDER.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Every kind in <code>ProtocolEventKind</code>, with its category, the raw source it is
          normalized from, the metrics it moves, whether it may be a Chronicle candidate (advisory —
          the selection gate + curation is the real filter), and where it is recommended for reuse.
        </p>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {KIND_ORDER.map((kind) => {
            const category = CATEGORY_FOR_KIND[kind];
            const effects = EVENT_METRIC_EFFECTS[kind];
            const eligible = chronicleEligibleForKind(kind);
            const surfaces = RECOMMENDED_SURFACES_FOR_CATEGORY[category];
            return (
              <div key={kind} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <code className="mono text-sm font-semibold text-foreground">{kind}</code>
                  <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {CATEGORY_LABEL[category]}
                  </span>
                </div>

                <div className="mt-3 text-xs">
                  <div className="uppercase tracking-wide text-muted-foreground">Raw source</div>
                  <p className="mt-0.5 text-foreground/80">{SOURCE_FOR_CATEGORY[category]}</p>
                </div>

                <div className="mt-3 text-xs">
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Metric effects · {effects.length}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1.5">
                    {effects.map((id) => {
                      const m = getMetric(id);
                      return m ? (
                        <MetricTickerItem key={id} metric={m} status={m.status} />
                      ) : (
                        <code key={id} className="text-[11px] text-destructive">
                          {id}?
                        </code>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="uppercase tracking-wide text-muted-foreground">Chronicle</span>
                    <span
                      className={`mono rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                        eligible
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {eligible ? "candidate" : "not eligible"}
                    </span>
                  </span>
                </div>

                <div className="mt-3 text-xs">
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Recommended surfaces
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {surfaces.map((s) => (
                      <span
                        key={s}
                        className="rounded border border-border bg-background px-1.5 py-0.5 text-[11px] text-foreground/80"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Live sample ────────────────────────────────────────────────────── */}
      <section id="live" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Live sample <span className="text-muted-foreground">· useProtocolEvents()</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The enriched <code>CanonicalProtocolEvent</code> shape every consumer reads. Status is{" "}
          per-event freshness (burns degrade to <code>PARTIAL</code> until the scan is gapless);{" "}
          verification link is empty when the tx hash is unverifiable.
        </p>

        {isLoading ? (
          <p className="mt-4 text-sm text-muted-foreground">Loading on-chain events…</p>
        ) : isError ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Live read unavailable right now — the pipeline degrades rather than fabricating rows.
          </p>
        ) : events.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No events indexed yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-md border border-border">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Kind</th>
                  <th className="px-3 py-2 font-medium">Category</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 font-medium">From → To</th>
                  <th className="px-3 py-2 font-medium">Effects</th>
                  <th className="px-3 py-2 font-medium">Chronicle</th>
                  <th className="px-3 py-2 font-medium">Proof</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e: CanonicalProtocolEvent) => (
                  <tr key={e.id} className="border-b border-border/60 align-top">
                    <td className="px-3 py-2">
                      <code className="mono text-xs">{e.kind}</code>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {CATEGORY_LABEL[e.category]}
                    </td>
                    <td className="px-3 py-2">
                      <MetricStatusBadge status={e.status} />
                    </td>
                    <td className="px-3 py-2 text-xs text-foreground/80">
                      {e.fromLabel ?? "—"}
                      {e.toLabel ? ` → ${e.toLabel}` : ""}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {e.metricEffects.length}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {e.chronicleEligible ? (
                        <span className="text-emerald-700 dark:text-emerald-400">candidate</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {e.verificationLink ? (
                        <a
                          href={e.verificationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="underline hover:no-underline"
                        >
                          verify
                        </a>
                      ) : (
                        <span className="text-muted-foreground">no proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Future namespaces ──────────────────────────────────────────────── */}
      <section id="future" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Reserved future namespaces{" "}
          <span className="text-muted-foreground">· {FUTURE_EVENT_NAMESPACES.length} · PENDING</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          Clean namespaces reserved so future modules have a home without re-opening event drift.{" "}
          <b>None are scanned, emitted, or wired</b>, and they are intentionally kept OUT of{" "}
          <code>ProtocolEventKind</code> so no consumer must handle them. All are PENDING and pay or
          imply nothing until a real contract exists.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {FUTURE_EVENT_NAMESPACES.map((ns) => (
            <div key={ns.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-medium text-foreground">{ns.label}</div>
                <span className="mono rounded border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {ns.status}
                </span>
              </div>
              <code className="mono mt-1 block text-[11px] text-muted-foreground">{ns.id}</code>
              <p className="mt-2 text-xs text-foreground/80">{ns.description}</p>
              {ns.forbiddenVocab && ns.forbiddenVocab.length > 0 && (
                <div className="mt-3 text-xs">
                  <div className="uppercase tracking-wide text-muted-foreground">
                    Forbidden vocabulary
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {ns.forbiddenVocab.map((v) => (
                      <span
                        key={v}
                        className="rounded border border-destructive/40 bg-destructive/10 px-1.5 py-0.5 text-[11px] text-destructive"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Known addresses ────────────────────────────────────────────────── */}
      <section id="addresses" className="mt-14 scroll-mt-6">
        <h2 className="text-lg font-semibold tracking-tight">
          Known address registry{" "}
          <span className="text-muted-foreground">· {KNOWN_ADDRESSES.length}</span>
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
          The single label table <code>enrichEvent</code> resolves <code>from</code>/<code>to</code>{" "}
          against. Addresses reference <code>CONTRACTS</code> / <code>SYNDICATE_CONFIG</code> — never
          re-hardcoded. Anything outside this table resolves to <code>unknown</code>.
        </p>

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-3 py-2 font-medium">Label</th>
                <th className="px-3 py-2 font-medium">Role</th>
                <th className="px-3 py-2 font-medium">Address</th>
              </tr>
            </thead>
            <tbody>
              {KNOWN_ADDRESSES.map((a) => {
                const resolved = labelForAddress(a.address);
                return (
                  <tr key={`${a.role}-${a.address}`} className="border-b border-border/60">
                    <td className="px-3 py-2 text-foreground">{resolved.label}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{a.role}</td>
                    <td className="px-3 py-2">
                      <code className="mono text-[11px] text-muted-foreground">{a.address}</code>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
        Sources of truth: <code>src/lib/protocol-event-registry.ts</code> (kinds, categories, metric
        effects, chronicle rule, surfaces, future namespaces),{" "}
        <code>src/lib/protocol-events.ts</code> (<code>enrichEvent</code> +{" "}
        <code>useProtocolEvents</code>), <code>src/lib/known-addresses.ts</code> (label registry).
        Add a kind to the registry and it appears here automatically.
      </footer>
    </div>
  );
}
