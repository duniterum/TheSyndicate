// src/routes/labs.knowledge-map.tsx
// INTERNAL · Protocol Knowledge Map — the layer inspection surface.
//
// A read-only projection of src/lib/protocol-knowledge-map.ts (the source of truth).
// It names every canonical knowledge HOME and its six facts — purpose · source of
// truth · permanence · coverage model · promotion path · public surfaces — plus its
// status and identity posture. Nothing here writes, fetches, or computes; it renders
// the static registry so drift is visible at a glance.
//
// Doctrine on display (this surface restates nothing — it points at the canon):
//   • Precedence — code registries outrank canon docs (docs/canon/00_AUTHORITY_MAP.md).
//   • Adjacency Law — the pipeline cluster follows Truth → Events → Signals → Memory →
//     Story (docs/canon/05_FOUNDATION_FREEZE.md).
//   • Protocol Knowledge (live projection) vs Institutional Register Memory (durable
//     overlay) — docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md.
//
// noindex/nofollow (inherits the /labs layout); never linked from public nav;
// /labs/* is blocked in robots.txt and excluded from the sitemap.

import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PROTOCOL_LAYERS,
  CLUSTER_ORDER,
  CLUSTER_LABELS,
  layersByCluster,
  type LayerStatus,
  type ProtocolLayer,
} from "@/lib/protocol-knowledge-map";

export const Route = createFileRoute("/labs/knowledge-map")({
  head: () => ({
    meta: [
      { title: "Protocol Knowledge Map · Layer Inspection — The Syndicate" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Internal layer-inspection surface. The canonical index of every knowledge home — purpose, source of truth, permanence, coverage, promotion path, public surfaces. Read-only.",
      },
    ],
  }),
  component: KnowledgeMapWorkbench,
});

const STATUS_TONE: Record<LayerStatus, string> = {
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  partial: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "mock-quarantined":
    "border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-400",
  reserved: "border-border bg-muted text-muted-foreground",
};

const POSTURE_LABEL: Record<ProtocolLayer["identityPosture"], string> = {
  "identity-free": "identity-free",
  "member-derived": "member-derived",
  "member-living-reserved": "member-living · reserved",
};

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span
      className={`mono inline-block rounded border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.16em] ${tone}`}
    >
      {children}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="text-sm">
      <span className="mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="mt-0.5 text-foreground/85">{children}</div>
    </div>
  );
}

function LayerCard({ l }: { l: ProtocolLayer }) {
  return (
    <li className="rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight">{l.name}</h3>
        <code className="text-xs text-muted-foreground">{l.id}</code>
        <span className="grow" />
        <Pill tone={STATUS_TONE[l.status]}>{l.status}</Pill>
        <Pill tone="border-border text-muted-foreground">{l.permanence}</Pill>
        <Pill tone="border-border text-muted-foreground">{l.coverageModel}</Pill>
        <Pill tone="border-border text-muted-foreground">
          {POSTURE_LABEL[l.identityPosture]}
        </Pill>
      </div>

      <p className="mt-2 text-sm text-foreground/90">{l.purpose}</p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="Source of truth">
          {l.sourceOfTruth.description}
          <div className="mt-1 flex flex-wrap gap-1">
            {l.sourceOfTruth.homeFiles.map((f) => (
              <code key={f} className="rounded bg-muted px-1 py-0.5 text-[11px]">
                {f}
              </code>
            ))}
          </div>
        </Field>
        <Field label="Promotion path">{l.promotionPath ?? "— (terminal / recognition only)"}</Field>
        <Field label="Public surfaces">
          {l.publicSurfaces.length === 0 ? (
            <span className="text-muted-foreground">— (internal only)</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {l.publicSurfaces.map((s) => (
                <code key={s} className="text-[12px]">
                  {s}
                </code>
              ))}
            </div>
          )}
        </Field>
        <Field label="Internal surfaces">
          {l.internalSurfaces.length === 0 ? (
            <span className="text-muted-foreground">—</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {l.internalSurfaces.map((s) => (
                <code key={s} className="text-[12px]">
                  {s}
                </code>
              ))}
            </div>
          )}
        </Field>
      </div>

      {l.statusNote && (
        <p className="mt-3 rounded border border-border bg-muted/40 p-2 text-xs text-muted-foreground">
          {l.statusNote}
        </p>
      )}

      {(l.indexes.canonDocs.length > 0 || l.indexes.registries.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
          <span className="mono uppercase tracking-[0.16em]">indexes</span>
          {[...l.indexes.canonDocs, ...l.indexes.registries].map((r) => (
            <code key={r} className="rounded bg-muted px-1 py-0.5">
              {r}
            </code>
          ))}
        </div>
      )}
    </li>
  );
}

function KnowledgeMapWorkbench() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-10">
      <header>
        <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Internal · noindex · read-only
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Protocol Knowledge Map</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          The canonical index of every knowledge <b>home</b> in The Syndicate. A projection of{" "}
          <code>src/lib/protocol-knowledge-map.ts</code> — the source of truth. Per the precedence
          law, code outranks docs; this surface and{" "}
          <code>docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md</code> both defer to that file.
        </p>
        <div className="mt-3 rounded-md border border-border bg-card p-3 text-sm text-foreground/85">
          <b>Protocol Knowledge</b> is a live projection (recomputed every load).{" "}
          <b>Institutional Register Memory</b> is a durable overlay that records an assertion +
          anchor — never a live value. One canonical home per fact; the Register references homes,
          it never copies them; a fact is promoted or seeded, otherwise held.
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Total layers: <b>{PROTOCOL_LAYERS.length}</b>.{" "}
          <Link to="/labs" className="underline hover:no-underline">
            ← back to Labs
          </Link>
        </p>
      </header>

      {CLUSTER_ORDER.map((cluster) => {
        const layers = layersByCluster(cluster);
        if (layers.length === 0) return null;
        return (
          <section key={cluster} className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">
              {CLUSTER_LABELS[cluster]}{" "}
              <span className="text-muted-foreground">· {layers.length}</span>
            </h2>
            <ul className="mt-4 grid gap-4">
              {layers.map((l) => (
                <LayerCard key={l.id} l={l} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
