// Wave 3A — "Since your last visit" momentum banner.
//
// Reads the previous visitor snapshot from localStorage (set on the last
// visit) and diffs it against the current protocol state. Renders only if
// there is *something* to show. No accounts, no tracking, fully client-side.

import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { useHolderIndex } from "@/lib/holder-index";
import { useVisitorMemory } from "@/lib/visitor-memory";
import { formatRelative } from "@/lib/chain-time";

const milestoneTargets = [
  { id: "first-buyer",     label: "First buyer",                          kind: "members", target: 1 },
  { id: "raise-100",       label: "First $100 routed",                    kind: "usdc",    target: 100 },
  { id: "raise-1k",        label: "First $1,000 routed",                  kind: "usdc",    target: 1_000 },
  { id: "raise-10k",       label: "First $10,000 routed",                 kind: "usdc",    target: 10_000 },
  { id: "members-333",     label: "Genesis Signal sealed (#1 – #333)",    kind: "members", target: 333 },
  { id: "members-1000",    label: "First Thousand sealed (#334 – #1,000)",kind: "members", target: 1_000 },
  { id: "members-3333",    label: "The Expansion sealed (#1,001 – #3,333)",kind:"members", target: 3_333 },
  { id: "members-10000",   label: "First Ten Thousand sealed (#3,334 – #10,000)", kind: "members", target: 10_000 },
] as const;

function reachedMilestoneIds(buyers: number | undefined, usdcRaised: number | undefined): string[] {
  return milestoneTargets
    .filter((m) =>
      m.kind === "members"
        ? buyers !== undefined && buyers >= m.target
        : usdcRaised !== undefined && usdcRaised >= m.target,
    )
    .map((m) => m.id);
}

export function SinceYourLastVisit() {
  const p = useProtocolPulse();
  const idx = useHolderIndex();

  const currentMilestones = useMemo(
    () => reachedMilestoneIds(p.buyers, p.usdcRaised),
    [p.buyers, p.usdcRaised],
  );

  const { previous, ready } = useVisitorMemory({
    ready: !p.isLoading && p.buyers !== undefined,
    members: p.buyers,
    usdcRaised: p.usdcRaised,
    synSold: p.synSold,
    purchases: idx.totals.purchaseCount,
    vaultUsdc: p.vaultUsdc,
    liquidityUsdc: p.liquidityUsdc,
    milestonesReached: currentMilestones,
  });

  if (!ready || !previous) return null;

  const dMembers = diff(p.buyers, previous.members);
  const dUsdc = diff(p.usdcRaised, previous.usdcRaised);
  const dPurchases = diff(idx.totals.purchaseCount, previous.purchases);
  const dVault = diff(p.vaultUsdc, previous.vaultUsdc);
  const newMilestones = currentMilestones.filter((id) => !previous.milestonesReached.includes(id));

  // Hide if nothing changed.
  const anyChange =
    (dMembers && dMembers > 0) ||
    (dUsdc && dUsdc > 0) ||
    (dPurchases && dPurchases > 0) ||
    (dVault && dVault > 0) ||
    newMilestones.length > 0;
  if (!anyChange) return null;

  const ago = Math.max(0, Math.floor(Date.now() / 1000) - previous.unix);
  const items: { label: string; value: string }[] = [];
  if (dMembers && dMembers > 0) items.push({ label: "New members", value: `+${dMembers}` });
  if (dPurchases && dPurchases > 0) items.push({ label: "Purchases", value: `+${dPurchases}` });
  if (dUsdc && dUsdc > 0)
    items.push({ label: "USDC routed", value: `+$${dUsdc.toLocaleString("en-US", { maximumFractionDigits: 0 })}` });
  if (dVault && dVault > 0)
    items.push({ label: "Vault grew", value: `+$${dVault.toLocaleString("en-US", { maximumFractionDigits: 0 })}` });

  return (
    <section className="container py-4">
      <div className="surface elevated p-4 md:p-5 border border-[var(--gold)]/25 bg-[var(--gold)]/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--gold)]">
                Since your last visit
              </div>
              <span
                className="mono text-[9px] uppercase tracking-[0.18em] rounded border border-border px-1.5 py-0.5 text-muted-foreground"
                aria-label="Source LOCAL"
              >
                LOCAL
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              You last opened The Syndicate <span className="text-foreground">{formatRelative(ago)}</span>.
              Here is what the protocol did while you were gone.
            </div>
          </div>
          <Link
            to="/activity"
            className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--navy-soft)] hover:text-[var(--gold)] underline-offset-4 hover:underline"
          >
            See full activity →
          </Link>
        </div>

        {items.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {items.map((it) => (
              <div key={it.label} className="rounded-md border border-border/40 bg-background/40 px-3 py-2">
                <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{it.label}</div>
                <div className="mono text-base font-semibold text-foreground">{it.value}</div>
              </div>
            ))}
          </div>
        )}

        {newMilestones.length > 0 && (
          <div className="mt-3 text-xs text-foreground/85">
            <span className="mono text-[10px] uppercase tracking-[0.2em] text-[var(--gold)] mr-2">
              New milestone{newMilestones.length === 1 ? "" : "s"} reached
            </span>
            {newMilestones
              .map((id) => milestoneTargets.find((m) => m.id === id)?.label)
              .filter(Boolean)
              .join(" · ")}
          </div>
        )}

        <div className="mt-3 mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/70">
          Local snapshot only · no account required · clear browser storage to reset
        </div>
      </div>
    </section>
  );
}

function diff(now: number | undefined, then: number | undefined): number | undefined {
  if (now === undefined || then === undefined) return undefined;
  return now - then;
}
