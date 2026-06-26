// Pure SVG OG cards. No external deps, no WASM, no React.
//
// We serve SVG with `image/svg+xml`. Rendering coverage:
//   ✓ Telegram, Discord, Slack, iMessage, Bluesky, Signal, Mastodon
//   ✗ X / Twitter (strips SVG og:image — falls back to text-only card with
//     title + description, which we provide via twitter:card="summary").
//
// Truth contract: every value below is passed in by callers reading on-chain
// state. The template never invents numbers. PENDING is rendered as PENDING.

import type { WalletOgData, MilestoneOgData } from "./og-data.server";

const W = 1200;
const H = 630;

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const fmtUsd = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const fmtN = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
const shortAddr = (a: string) => `${a.slice(0, 8)}…${a.slice(-6)}`;

const statusColor = (s: string) => {
  if (s === "LIVE" || s === "MEMBER") return "#5bd6a6";
  if (s === "PARTIAL" || s === "HOLDER") return "#d4af37";
  return "#7a8298";
};

function shell(inner: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif">
  <defs>
    <radialGradient id="g1" cx="12%" cy="18%" r="60%">
      <stop offset="0%" stop-color="#d4af37" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0b1020" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="g2" cx="92%" cy="88%" r="60%">
      <stop offset="0%" stop-color="#466ec8" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0b1020" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0b1020"/>
  <rect width="${W}" height="${H}" fill="url(#g1)"/>
  <rect width="${W}" height="${H}" fill="url(#g2)"/>
  <rect x="0" y="0" width="${W}" height="4" fill="#d4af37" opacity="0.6"/>
  ${inner}
</svg>`;
}

function header(eyebrow: string, statusValue: string, statusLabel: string): string {
  const c = statusColor(statusValue);
  return `
  <circle cx="76" cy="68" r="6" fill="#d4af37"/>
  <text x="94" y="74" fill="#7a8298" font-size="20" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">THE SYNDICATE · ${esc(eyebrow.toUpperCase())}</text>
  <circle cx="${W - 280}" cy="68" r="5" fill="${c}"/>
  <text x="${W - 264}" y="74" fill="${c}" font-size="20" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(statusLabel.toUpperCase())}</text>
  `;
}

function footer(asOfBlock: string | null): string {
  const right = asOfBlock ? `AS OF BLOCK ${asOfBlock}` : "INDEXING…";
  return `
  <text x="64" y="${H - 40}" fill="#7a8298" font-size="18" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">THESYNDICATE.MONEY</text>
  <text x="${W - 64}" y="${H - 40}" text-anchor="end" fill="#7a8298" font-size="18" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(right)}</text>
  `;
}

function metric(x: number, y: number, label: string, value: string, tone: "gold" | "muted" = "muted"): string {
  return `
  <text x="${x}" y="${y}" fill="#7a8298" font-size="18" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(label.toUpperCase())}</text>
  <text x="${x}" y="${y + 56}" fill="${tone === "gold" ? "#d4af37" : "#e8edf6"}" font-size="46" font-weight="600" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(value)}</text>
  `;
}

// ─── Wallet OG ──────────────────────────────────────────────────────────

export function walletOgSvg(d: WalletOgData): string {
  if (d.status === "MEMBER") {
    const founder = d.founderNumber ?? 0;
    return shell(`
${header("Member identity", d.status, "Member · indexed")}
<text x="64" y="178" fill="#7a8298" font-size="26" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(shortAddr(d.address))}</text>
<text x="64" y="278" fill="#e8edf6" font-size="92" font-weight="700">Member <tspan fill="#d4af37">#${founder}</tspan></text>
<text x="64" y="328" fill="#a8b0c2" font-size="26">${esc(d.chapterLabel ?? "")} · ${esc(d.rankName ?? "—")} capital footprint</text>
${metric(64, 430, "Cumulative USDC", fmtUsd(d.cumulativeUsdc), "gold")}
${metric(360, 430, "SYN received", fmtN(Math.round(d.cumulativeSyn)))}
${metric(640, 430, "Purchases", fmtN(d.purchaseCount))}
${metric(880, 430, "Total members", fmtN(d.totalMembers))}
${footer(d.asOfBlock)}
`);
  }
  if (d.status === "HOLDER") {
    return shell(`
${header("Wallet · market participant", "HOLDER", "Holder · not a member")}
<text x="64" y="240" fill="#e8edf6" font-size="68" font-weight="600" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(shortAddr(d.address))}</text>
<text x="64" y="300" fill="#a8b0c2" font-size="24">Holds SYN but has not purchased through the</text>
<text x="64" y="334" fill="#a8b0c2" font-size="24">Membership Sale. Verifiable on-chain.</text>
${metric(64, 430, "Live SYN balance", fmtN(Math.round(d.cumulativeSyn)))}
${metric(440, 430, "Membership status", "Not a member")}
${footer(d.asOfBlock)}
`);
  }
  return shell(`
${header("Wallet", d.status, d.status === "UNKNOWN" ? "No record" : "Pending")}
<text x="64" y="240" fill="#e8edf6" font-size="68" font-weight="600" font-family="ui-monospace, 'JetBrains Mono', monospace">${esc(shortAddr(d.address))}</text>
<text x="64" y="300" fill="#a8b0c2" font-size="24">${
  d.status === "UNKNOWN"
    ? "No SYN balance and no Membership Sale activity indexed."
    : "Resolving on-chain identity from Avalanche RPC…"
}</text>
${footer(d.asOfBlock)}
`);
}

// ─── Milestone OG ───────────────────────────────────────────────────────

function wrapText(s: string, maxChars: number): string[] {
  const words = s.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else {
      cur = (cur ? cur + " " : "") + w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export function milestoneOgSvg(d: MilestoneOgData): string {
  const lines = wrapText(d.definition, 64).slice(0, 3);
  const defSvg = lines
    .map((l, i) => `<text x="64" y="${360 + i * 34}" fill="#a8b0c2" font-size="24">${esc(l)}</text>`)
    .join("\n");
  return shell(`
${header("Public milestone", d.status, d.status)}
<text x="64" y="170" fill="#7a8298" font-size="22" letter-spacing="3" font-family="ui-monospace, 'JetBrains Mono', monospace">MILESTONE · ${esc(d.id.toUpperCase())}</text>
<text x="64" y="280" fill="#e8edf6" font-size="74" font-weight="700">${esc(d.label)}</text>
${defSvg}
${metric(64, 510, "Current", d.current ?? "—", "gold")}
${metric(440, 510, "Target", d.target ?? "—")}
${metric(800, 510, "Status", d.status)}
${footer(d.asOfBlock)}
`);
}
