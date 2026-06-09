// /milestone/$id — shareable permalink for a single public milestone.
//
// Renders the full milestone disclosure (definition, trigger, verification,
// status, why-it-matters) and emits rich OG metadata so the link previews
// as a verifiable protocol artifact on X, Telegram, iMessage, Discord, etc.

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useRef } from "react";
import { PageShell } from "@/components/syndicate/PageShell";
import {
  GlassCard,
  Section,
  SectionHeader,
  StatusPill,
} from "@/components/syndicate/Primitives";
import { Breadcrumbs } from "@/components/syndicate/Breadcrumbs";
import { ShareActions } from "@/components/syndicate/ShareActions";
import {
  isMilestoneId,
  milestoneMeta,
  CANONICAL_ORIGIN,
  type MilestoneOgId,
} from "@/lib/og-data.server";

export const Route = createFileRoute("/milestone/$id")({
  beforeLoad: ({ params }) => {
    if (!isMilestoneId(params.id)) throw notFound();
  },
  head: ({ params }) => {
    if (!isMilestoneId(params.id)) return { meta: [] };
    const m = milestoneMeta(params.id as MilestoneOgId);
    const url = `${CANONICAL_ORIGIN}/milestone/${params.id}`;
    const img = `${CANONICAL_ORIGIN}/api/public/og/milestone/${params.id}`;
    // See docs/OG_RENDERING_STRATEGY.md — X strips SVG, so twitter:image
    // points to a static branded PNG fallback. All other platforms read
    // og:image and get the live status-aware SVG.
    const twImg = `${CANONICAL_ORIGIN}/og/og-protocol-default.png`;
    const title = `${m.label} — The Syndicate milestone`;
    const desc = m.definition;
    const imgAlt = `${m.label} — verifiable formation milestone on The Syndicate.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: img },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: imgAlt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: twImg },
        { name: "twitter:image:alt", content: imgAlt },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: MilestonePage,
});

function MilestonePage() {
  const { id } = Route.useParams();
  const cardRef = useRef<HTMLDivElement>(null);
  const m = milestoneMeta(id as MilestoneOgId);
  const url = `${CANONICAL_ORIGIN}/milestone/${id}`;
  const shareText = `${m.label} — public milestone on The Syndicate. ${m.definition}`;
  return (
    <PageShell
      eyebrow="Milestone"
      title={m.label}
      description="Verifiable formation milestone on The Syndicate protocol."
    >
      <Breadcrumbs />
      <Section id="milestone-detail">
        <div ref={cardRef}>
          <GlassCard className="p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Milestone · {id}
              </div>
              <StatusPill status="LIVE" />
            </div>
            <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
              {m.label}
            </h1>
            <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
              {m.definition}
            </p>
            {m.target && (
              <div className="mt-6 mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Target · <span className="text-foreground">{m.target}</span>
              </div>
            )}
            <div className="mt-6 text-xs text-muted-foreground">
              Status is derived live from on-chain reads on Avalanche C-Chain.
              The OG preview shown when this link is shared updates every
              minute from the same source.
            </div>
          </GlassCard>
        </div>

        <div className="mt-4">
          <ShareActions
            filename={`syndicate-milestone-${id}.png`}
            shareText={shareText}
            shareUrl={url}
            nodeRef={cardRef}
            hint="Share this milestone"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-border/60 hover:border-foreground"
          >
            All milestones →
          </Link>
          <Link
            to="/transparency"
            className="mono text-[11px] uppercase tracking-[0.18em] px-3 py-2 rounded border border-border/60 hover:border-foreground"
          >
            Transparency center →
          </Link>
        </div>
      </Section>
    </PageShell>
  );
}
