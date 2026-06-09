import { useState, type RefObject } from "react";
import { toPng } from "html-to-image";

/**
 * ShareActions — canonical share-state primitive.
 *
 * Every shareable artifact in the app (member card, protocol snapshot,
 * milestone, vault summary, future cards) must render this same bar so
 * users see one consistent set of actions:
 *
 *   Download PNG · Share to X · Share to Telegram · Copy text · Copy link
 *
 * Truth-preserving by contract: callers are responsible for assembling
 * `shareText` from verifiable values only (no profit / ROI / yield
 * language). This component does not invent copy.
 */
export async function downloadNodeAsPng(
  node: HTMLElement | null,
  filename: string
) {
  if (!node) return;
  const dataUrl = await toPng(node, { pixelRatio: 2, cacheBust: true });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function ShareActions({
  filename,
  shareText,
  shareUrl,
  nodeRef,
  hint,
  className = "",
}: {
  filename: string;
  shareText: string;
  shareUrl: string;
  nodeRef: RefObject<HTMLDivElement | null>;
  hint?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState<null | "png" | "text" | "link">(null);

  const fullText = `${shareText}\n\n${shareUrl}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`;
  const tgHref = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

  async function copy(text: string, key: "text" | "link") {
    setBusy(key);
    try {
      await navigator.clipboard?.writeText(text);
    } catch {
      // best-effort
    } finally {
      setTimeout(() => setBusy(null), 900);
    }
  }

  const btn =
    "mono text-[10px] uppercase tracking-[0.18em] px-2.5 py-1.5 rounded-full border border-border/60 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition-colors disabled:opacity-50";

  return (
    <div className={`mt-3 flex flex-col gap-2 ${className}`}>
      {hint && (
        <div className="mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {hint}
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          disabled={busy === "png"}
          onClick={async () => {
            setBusy("png");
            try {
              await downloadNodeAsPng(nodeRef.current, filename);
            } finally {
              setBusy(null);
            }
          }}
          className="mono text-[10px] uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[color:oklch(0.5_0.13_75)] hover:bg-[var(--gold)]/20 disabled:opacity-50"
        >
          {busy === "png" ? "Rendering…" : "Download PNG ↓"}
        </button>
        <a className={btn} href={xHref} target="_blank" rel="noopener noreferrer">
          Share to X ↗
        </a>
        <a className={btn} href={tgHref} target="_blank" rel="noopener noreferrer">
          Share to Telegram ↗
        </a>
        <button type="button" className={btn} onClick={() => copy(fullText, "text")}>
          {busy === "text" ? "Copied ✓" : "Copy text"}
        </button>
        <button type="button" className={btn} onClick={() => copy(shareUrl, "link")}>
          {busy === "link" ? "Copied ✓" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
