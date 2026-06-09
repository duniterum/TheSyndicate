// "Since your last visit" story strip, sourced from a backend cookie
// (see src/lib/last-visit.functions.ts). No localStorage truth.
//
// Renders 1-line deltas vs previous snapshot. On first visit it welcomes the
// visitor without inventing diffs. While the backend roundtrip is in flight,
// a small skeleton replaces the text so the section never flashes wrong data.
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getAndRecordLastVisit, type SinceLastVisit } from "@/lib/last-visit.functions";
import { useProtocolPulse } from "@/lib/protocol-pulse";
import { GlassCard } from "./Primitives";
import { SourceTag } from "./SourceTag";

const fmtPlus = (n: number, decimals = 0) =>
  `${n >= 0 ? "+" : "−"}${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: decimals })}`;
const fmtPlusUsd = (n: number) =>
  `${n >= 0 ? "+" : "−"}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtAgo = (unix: number) => {
  const s = Math.max(0, Math.floor(Date.now() / 1000) - unix);
  if (s < 3600) return `${Math.round(s / 60)} minutes ago`;
  if (s < 86400) return `${Math.round(s / 3600)} hours ago`;
  return `${Math.round(s / 86400)} days ago`;
};

export function SinceLastVisitStory() {
  const fn = useServerFn(getAndRecordLastVisit);
  const pulse = useProtocolPulse();
  const ready =
    pulse.usdcRaised !== undefined || pulse.synSold !== undefined || pulse.buyers !== undefined;

  const [state, setState] = useState<SinceLastVisit | undefined>(undefined);
  const [err, setErr] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!ready) return;
    let alive = true;
    setErr(undefined);
    fn({
      data: {
        members: pulse.nextMemberNumber !== undefined ? pulse.nextMemberNumber - 1 : pulse.buyers,
        usdcRaised: pulse.usdcRaised,
        synSold: pulse.synSold,
        vaultUsdc: pulse.vaultUsdc,
        liquidityUsdc: pulse.liquidityUsdc,
        purchases: pulse.purchaseCount,
      },
    })
      .then((r) => {
        if (alive) setState(r);
      })
      .catch((e: Error) => {
        if (alive) setErr(e?.message ?? "unavailable");
      });
    return () => {
      alive = false;
    };
    // Only call once per mount when ready becomes true.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (err) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">Since your last visit</span>
          <SourceTag source="LOCAL" />
        </div>
        <p className="text-sm text-muted-foreground">Backend cookie unavailable — story will return on next visit.</p>
      </GlassCard>
    );
  }

  if (!state || !ready) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">Since your last visit</span>
          <SourceTag source="LOCAL" />
        </div>
        <div className="h-3 w-2/3 rounded bg-foreground/[0.06] animate-pulse" />
      </GlassCard>
    );
  }

  if (state.firstTime || !state.previous) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">Welcome — first visit</span>
          <SourceTag source="LOCAL" />
        </div>
        <p className="text-sm text-foreground/90">
          We're recording your visit so the next time you return, you'll see exactly what changed
          in the protocol since you were last here.
        </p>
      </GlassCard>
    );
  }

  const prev = state.previous;
  const cur = state.current ?? prev;
  const diff = (a?: number, b?: number) =>
    a === undefined || b === undefined ? undefined : a - b;

  const lines: { key: string; text: string; tone: "pos" | "neutral" }[] = [];
  const dm = diff(cur.members, prev.members);
  if (dm !== undefined && dm !== 0) lines.push({ key: "members", text: `${fmtPlus(dm)} members joined`, tone: dm > 0 ? "pos" : "neutral" });
  const du = diff(cur.usdcRaised, prev.usdcRaised);
  if (du !== undefined && du !== 0) lines.push({ key: "usdc", text: `${fmtPlusUsd(du)} routed through the sale`, tone: du > 0 ? "pos" : "neutral" });
  const dp = diff(cur.purchases, prev.purchases);
  if (dp !== undefined && dp !== 0) lines.push({ key: "purchases", text: `${fmtPlus(dp)} on-chain purchases`, tone: dp > 0 ? "pos" : "neutral" });
  const dv = diff(cur.vaultUsdc, prev.vaultUsdc);
  if (dv !== undefined && Math.abs(dv) >= 1) lines.push({ key: "vault", text: `Vault USDC ${fmtPlusUsd(dv)}`, tone: dv > 0 ? "pos" : "neutral" });

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--gold)]">
          Since your last visit · {fmtAgo(prev.unix)}
        </span>
        <SourceTag source="LOCAL" />
      </div>
      {lines.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No measurable change in tracked metrics since you were last here — the protocol kept its
          state.
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {lines.map((l) => (
            <li key={l.key} className="flex items-center gap-2">
              <span
                className={`size-1.5 rounded-full ${l.tone === "pos" ? "bg-emerald-500" : "bg-muted-foreground"}`}
              />
              <span className="text-foreground/90">{l.text}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
