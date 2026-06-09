import { useState } from "react";
import {
  ACCESS_RATE_LABEL,
  VAULT_ALLOCATION,
  rankForUsdc,
  SALE_STATUS_LABEL,
  PURCHASE_PRESETS_USDC,
  SALE_MIN_USDC,
} from "@/lib/syndicate-config";
import { GlassCard, Pill, Section, SectionHeader, CTAButton } from "@/components/syndicate/Primitives";

export function HomeJoinPreview() {
  const [usdcInput, setUsdcInput] = useState<string>(String(SALE_MIN_USDC));
  const usdc = usdcInput.trim() === "" ? 0 : Math.max(0, Number(usdcInput) || 0);
  // Unified rate (matches /join): 1 USDC = 100 SYN.
  const syn = usdc * 100;
  const { current, next } = rankForUsdc(usdc);
  const vault = usdc * VAULT_ALLOCATION.vaultAssets;
  const lp = usdc * VAULT_ALLOCATION.liquidityReinforcement;
  const ops = usdc * VAULT_ALLOCATION.operationsCommunity;
  const belowMin = usdc < SALE_MIN_USDC;

  return (
    <Section id="join-preview">
      <SectionHeader
        eyebrow="Join Preview"
        title="See your future membership"
        description={`Fixed access rate: ${ACCESS_RATE_LABEL}. Minimum buy: $${SALE_MIN_USDC} USDC. Membership Sale is live on Avalanche — buy on /join.`}
      />
      <GlassCard className="p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">USDC Amount</label>
            <div className="mt-2 flex items-center gap-2 rounded-md border border-border/70 bg-background/40 px-3 py-2">
              <span className="mono text-sm text-muted-foreground">$</span>
              <input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={usdcInput}
                placeholder={String(SALE_MIN_USDC)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d*\.?\d*$/.test(v)) {
                    setUsdcInput(v.replace(/^0+(?=\d)/, ""));
                  }
                }}
                onBlur={() => {
                  if (usdcInput.trim() === "" || Number(usdcInput) < SALE_MIN_USDC) {
                    setUsdcInput(String(SALE_MIN_USDC));
                  }
                }}
                className="w-full bg-transparent outline-none mono text-lg"
              />
              <span className="mono text-xs text-muted-foreground">USDC</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PURCHASE_PRESETS_USDC.map((v) => (
                <button
                  key={v}
                  onClick={() => setUsdcInput(String(v))}
                  className={`mono text-[10px] uppercase tracking-[0.18em] rounded border px-2 py-1 transition-colors ${
                    usdc === v
                      ? "border-[var(--gold)] bg-[var(--gold)]/10"
                      : "border-border/70 hover:bg-muted/30"
                  }`}
                >
                  ${v}
                </button>
              ))}
            </div>
            {belowMin && (
              <p className="mt-2 mono text-[10px] uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
                Minimum ${SALE_MIN_USDC} USDC
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Cell label="SYN Received" value={`${syn.toLocaleString("en-US")} SYN`} />
            <Cell label="Rank Unlocked" value={current?.name ?? "Below entry"} />
            <Cell label="→ Vault (70%)" value={`$${vault.toLocaleString("en-US")}`} />
            <Cell label="→ Liquidity (20%)" value={`$${lp.toLocaleString("en-US")}`} />
            <Cell label="→ Operations (10%)" value={`$${ops.toLocaleString("en-US")}`} />
            <Cell label="Next Rank" value={next ? `${next.name} · $${next.usdc}` : "Top of ladder"} />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Pill tone="gold">● {SALE_STATUS_LABEL}</Pill>
          <div className="flex flex-wrap gap-3">
            <CTAButton variant="ghost" href="/join">Full Calculator & Tiers →</CTAButton>
            <CTAButton variant="gold" href="/join">Join The Syndicate →</CTAButton>
          </div>
        </div>
      </GlassCard>
    </Section>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/30 p-3">
      <div className="mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
      <div className="mt-1 mono text-sm font-semibold">{value}</div>
    </div>
  );
}
