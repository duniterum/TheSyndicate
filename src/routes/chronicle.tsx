// /chronicle — Protocol Chronicle (Phase 1 MVP).
//
// Constitutional sources:
//   • docs/PROTOCOL_CHRONICLE_MVP_EXECUTION_SPEC.md
//   • docs/PROTOCOL_CHRONICLE_FINAL_READINESS_REVIEW.md
//   • docs/PROTOCOL_CONTINUITY_DOCTRINE.md
//
// This is the protocol's first-person record of what has happened.
// Read top-to-bottom, OLDEST → NEWEST. No feed behaviour, no pagination,
// no reactions, no comments, no trending. Entries are sourced from a
// typed registry validated by chronicle-doctrine.test.ts.

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/syndicate/PageShell";
import { PagePurpose } from "@/components/syndicate/PagePurpose";
import { Section } from "@/components/syndicate/Primitives";
import { CHRONICLE_ENTRIES } from "@/lib/chronicle-entries";
import { deriveGenesisRegisterEntries } from "@/lib/institutional-register-genesis";
import { buildPublicChronicleView } from "@/lib/chronicle-public-integration";
import { useProtocolTruth } from "@/lib/protocol-truth";

export const Route = createFileRoute("/chronicle")({
  head: () => ({
    meta: [
      { title: "Chronicle — The protocol's own record | The Syndicate" },
      {
        name: "description",
        content:
          "The protocol's first-person record of what has happened on-chain — chapter by chapter, oldest to newest. Entries appear only when their on-chain anchor exists.",
      },
      { property: "og:title", content: "The Syndicate — Chronicle" },
      {
        property: "og:description",
        content:
          "Protocol history, in the protocol's own voice. Oldest first. Verifiable on-chain.",
      },
      { property: "og:url", content: "https://thesyndicate.money/chronicle" },
    ],
    links: [{ rel: "canonical", href: "https://thesyndicate.money/chronicle" }],
  }),
  component: ChroniclePage,
});

function ChroniclePage() {
  const truth = useProtocolTruth();
  const members = truth.members.value;

  // Defensive: ordering is enforced by tests; sort here too so a misordered
  // registry can never silently render newest-first.
  const entries = [...CHRONICLE_ENTRIES].sort((a, b) => a.order - b.order);

  // Controlled Public Chronicle Integration — attach a restrained institutional
  // backing line to each locked entry that an ACTIVE genesis register entry
  // verifies. Pure projection: it adds no entries, re-lists nothing, and never
  // publishes a draft. Non-overlapping register facts live on /institutional-register.
  const registerEntries = deriveGenesisRegisterEntries();
  const items = buildPublicChronicleView(entries, registerEntries);

  return (
    <PageShell
      serif
      eyebrow="Chronicle"
      title="The protocol's own record"
      description="Written in the protocol's voice, oldest first. Entries appear only when their on-chain anchor already exists. Nothing here is editorial."
    >
      <PagePurpose
        statement="The Chronicle is the protocol's curated memory — verified events narrated in the protocol's own voice, oldest first."
        distinctions={[
          { label: "Activity", to: "/activity" },
          { label: "Institutional Register", to: "/institutional-register" },
        ]}
      />

      {/* ── Current chapter block ─────────────────────────────────────── */}
      <Section id="current-chapter" width="narrow">
        <div className="border border-border rounded-lg p-5 md:p-6 bg-card">
          <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
            Current chapter
          </div>
          <h2 className="mt-2 font-serif text-2xl md:text-3xl text-foreground">
            Chapter I — Genesis Signal
          </h2>
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Status
              </dt>
              <dd className="mt-1 text-foreground">Open</dd>
            </div>
            <div>
              <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Members so far
              </dt>
              <dd className="mt-1 mono tabular-nums text-foreground">
                {members !== undefined ? members : "—"}
              </dd>
            </div>
            <div>
              <dt className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Capacity
              </dt>
              <dd className="mt-1 mono tabular-nums text-foreground">333</dd>
            </div>
          </dl>
        </div>
      </Section>

      {/* ── Entries — chronological, oldest first ─────────────────────── */}
      <Section id="entries" width="narrow">
        <ol
          className="space-y-12 list-none"
          aria-label="Chronicle entries, oldest first"
          data-chronicle-order="oldest-first"
        >
          {items.map(({ entry: e, backing }) => (
            <li
              key={e.id}
              id={e.id}
              data-chronicle-entry={e.id}
              data-chronicle-subject={e.subject}
              className="border-l-2 border-[color:var(--gold)]/40 pl-5 md:pl-6"
            >
              <h3 className="font-serif text-xl md:text-2xl text-foreground leading-snug">
                {e.title}
              </h3>
              <p className="mt-3 text-[15px] md:text-base text-foreground/85 leading-relaxed">
                {e.body}
              </p>
              <p className="mt-3 text-sm text-muted-foreground italic">
                What changed: {e.whatChanged}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {e.anchors.map((a) => (
                  <li key={a.href}>
                    <a
                      href={a.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
                    >
                      {a.label}
                    </a>
                  </li>
                ))}
              </ul>
              {backing && (
                <div
                  data-chronicle-backing={backing.registerEntryId}
                  className="mt-4 border-t border-border/60 pt-3"
                >
                  <div className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {backing.label}
                  </div>
                  <p className="mt-1 text-sm text-foreground/75 leading-relaxed">
                    {backing.note}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {backing.sourceTxHref && (
                      <a
                        href={backing.sourceTxHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
                      >
                        {backing.sourceTxLabel}
                      </a>
                    )}
                    <Link
                      to="/institutional-register"
                      className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                    >
                      {backing.lineageLabel}
                    </Link>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </Section>

      {/* ── What comes next ───────────────────────────────────────────── */}
      <Section id="what-comes-next" width="narrow">
        <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
          The next entry will appear when a canonical on-chain predicate
          fires — a chapter sealing, a treasury or liquidity threshold
          crossing, or another artifact joining the archive. Until then,
          this page is complete.
        </p>
      </Section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <Section id="chronicle-footer" width="narrow">
        <div className="border-t border-border pt-6 flex flex-wrap items-center gap-x-6 gap-y-2 mono text-[10px] uppercase tracking-[0.2em]">
          <Link
            to="/activity"
            className="text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Raw ledger ↗
          </Link>
          <Link
            to="/my-syndicate"
            className="text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            Your own record ↗
          </Link>
          <Link
            to="/chapters"
            className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Chapter archive ↗
          </Link>
          <Link
            to="/institutional-register"
            className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Institutional register ↗
          </Link>
          <Link
            to="/knowledge-map"
            className="text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            Knowledge map ↗
          </Link>
        </div>
        <p className="mt-4 text-xs text-muted-foreground/80 leading-relaxed">
          This page is the protocol's own record of what has happened.
          Entries are written only after their on-chain anchor exists. Nothing
          here is editorial, promotional, or speculative.
        </p>
      </Section>
    </PageShell>
  );
}
