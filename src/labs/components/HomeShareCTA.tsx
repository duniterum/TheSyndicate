// Tasteful homepage share CTA. NOT a banner, NOT a popup.
//
// Three actions that all invite sharing VERIFIABLE PROGRESS, never hype:
//   · Share protocol snapshot (homepage URL with branded OG)
//   · Share latest milestone (latest LIVE milestone permalink)
//   · Copy verification link (transparency center)
//
// Truth-preserving: copy text is fixed, no invented metrics.

import { useState } from "react";
import { Section, SectionHeader, GlassCard } from "@/components/syndicate/Primitives";

const ORIGIN = "https://thesyndicate.money";

const SHARE_OPTIONS = [
  {
    key: "snapshot",
    label: "Share protocol snapshot",
    sub: "Homepage · branded preview",
    url: `${ORIGIN}/`,
    text: "The Syndicate — a transparent on-chain protocol on Avalanche. Membership Sale routes every USDC 70 / 20 / 10 on-chain. Verify everything.",
  },
  {
    key: "milestone",
    label: "Share latest milestone",
    sub: "Live milestone permalink",
    url: `${ORIGIN}/milestone/sale-live`,
    text: "Membership Sale is live on The Syndicate. USDC routes 70 / 20 / 10 on-chain. Verifiable on Avalanche.",
  },
  {
    key: "verify",
    label: "Copy verification link",
    sub: "Transparency center",
    url: `${ORIGIN}/transparency`,
    text: "Verify The Syndicate on-chain — live contracts, public wallets, 70 / 20 / 10 routing.",
  },
] as const;

export function HomeShareCTA() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard?.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1200);
    } catch {
      // best-effort
    }
  }

  return (
    <Section id="home-share">
      <SectionHeader
        eyebrow="Share verifiable progress"
        title={<>Help others <span className="text-gradient-gold">verify</span> The Syndicate</>}
        description="Every shared link previews as a real protocol artifact — not a marketing banner. Preview formats: branded card on X, live data card on Telegram / Discord / iMessage."
      />
      <GlassCard className="p-5 md:p-6">
        <div className="grid gap-3 md:grid-cols-3">
          {SHARE_OPTIONS.map((opt) => {
            const fullText = `${opt.text}\n\n${opt.url}`;
            const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
            const tgHref = `https://t.me/share/url?url=${encodeURIComponent(opt.url)}&text=${encodeURIComponent(opt.text)}`;
            return (
              <div
                key={opt.key}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-background/40 p-4"
              >
                <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {opt.sub}
                </div>
                <div className="text-sm font-medium text-foreground">{opt.label}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <a
                    href={xHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition-colors"
                  >
                    Share on X ↗
                  </a>
                  <a
                    href={tgHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition-colors"
                  >
                    Telegram ↗
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(opt.url, opt.key)}
                    className="mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition-colors"
                  >
                    {copied === opt.key ? "Copied ✓" : "Copy link"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </Section>
  );
}
