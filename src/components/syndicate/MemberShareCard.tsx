// MemberShareCard — the production, premium "share your seat" artifact.
//
// A purpose-built, fixed-size identity card exported to PNG via html-to-image
// (see ./ShareActions). Graduated from the labs share-card work into a single
// reusable block used on /my-syndicate (the cockpit) and /wallet/$address.
//
// Truth doctrine: every field is a live on-chain read or a value derived from
// indexed Membership Sale purchases — member number, chapter,
// capital-footprint band, SYN received, wallet. Nothing is fabricated.
// Language stays recognition-only:
// "Verified on Avalanche", "Member #N" — never profit / yield / ROI.
//
// Hierarchy: Member # (hero) → chapter + capital footprint → SYN received →
// wallet (short, de-emphasized). The full address is never the visual subject;
// the footer prints only the host so the card stays clean and shareable. Full
// verification stays one tap away via the explorer link on the profile page and
// the Copy-link / share actions below.

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ShareActions } from "./ShareActions";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const hostOnly = (u: string) => u.replace(/^https?:\/\//, "").split("/")[0];

// ─── The visual card (inline-styled for html-to-image capture reliability) ──
export function MemberShareCard({
  innerRef,
  memberNumber,
  chapterLabel,
  rankName,
  wallet,
  synReceived,
  url,
}: {
  innerRef: RefObject<HTMLDivElement | null>;
  memberNumber: number;
  chapterLabel: string;
  rankName: string;
  wallet: `0x${string}`;
  synReceived: number;
  url: string;
}) {
  return (
    <div
      ref={innerRef}
      style={{
        width: 640,
        height: 360,
        background:
          "radial-gradient(circle at 18% 18%, oklch(0.30 0.06 265) 0%, oklch(0.17 0.04 262) 58%, oklch(0.11 0.02 262) 100%)",
        color: "white",
        fontFamily: "ui-sans-serif, system-ui, -apple-system",
        position: "relative",
        overflow: "hidden",
        borderRadius: 18,
        padding: 36,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* gold corner accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 260,
          height: 260,
          background:
            "radial-gradient(circle at top right, oklch(0.80 0.14 78 / 0.32), transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 11,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: "oklch(0.82 0.13 80)",
          }}
        >
          Member Card
        </div>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          The Syndicate
        </div>
      </div>

      {/* chapter + member number + rank */}
      <div style={{ marginTop: 18 }}>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.55)",
            marginBottom: 6,
          }}
        >
          {chapterLabel}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 0.9,
              background: "linear-gradient(135deg, oklch(0.93 0.12 82), oklch(0.78 0.14 76))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            #{memberNumber.toLocaleString("en-US")}
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 14,
              letterSpacing: "0.04em",
              color: "rgba(255,255,255,0.74)",
            }}
          >
            {rankName}
          </span>
        </div>
      </div>

      {/* SYN received — the prominent secondary fact */}
      <div style={{ marginTop: 18 }}>
        <div
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "oklch(0.82 0.13 80)",
          }}
        >
          SYN received
        </div>
        <div style={{ marginTop: 4, display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
            {fmtInt(synReceived)}
          </span>
          <span
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 13,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            SYN
          </span>
        </div>
      </div>

      {/* wallet — short, de-emphasized */}
      <div
        style={{
          marginTop: 12,
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          letterSpacing: "0.04em",
          color: "rgba(255,255,255,0.55)",
        }}
      >
        {short(wallet)}
        <span style={{ color: "rgba(255,255,255,0.32)" }}> · verified on-chain</span>
      </div>

      {/* verified badge */}
      <div
        style={{
          marginTop: 14,
          display: "inline-flex",
          alignSelf: "flex-start",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 999,
          border: "1px solid oklch(0.80 0.14 78 / 0.4)",
          background: "oklch(0.80 0.14 78 / 0.08)",
        }}
      >
        <span style={{ width: 7, height: 7, borderRadius: 999, background: "oklch(0.80 0.14 78)" }} />
        <span
          style={{
            fontFamily: "ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "oklch(0.86 0.10 82)",
          }}
        >
          Verified on Avalanche C-Chain
        </span>
      </div>

      {/* footer — host only on the left; verify motto pinned on the right */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          fontFamily: "ui-monospace, monospace",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {hostOnly(url)}
        </span>
        <span style={{ flexShrink: 0, whiteSpace: "nowrap" }}>Don&apos;t trust · verify</span>
      </div>
    </div>
  );
}

// ─── Responsive frame — scales the fixed 640×360 card down to fit narrow
//     viewports without horizontal scroll or clipping. The inner card keeps its
//     intrinsic size so the PNG export (which captures the ref node) stays
//     full-resolution; only the on-screen presentation is scaled. SSR-safe:
//     first paint renders at scale 1, then a ResizeObserver fits to width. ──
function ResponsiveCardFrame({ children }: { children: ReactNode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setScale(Math.min(1, el.clientWidth / 640));
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", maxWidth: 640 }}>
      <div style={{ height: 360 * scale, overflow: "hidden" }}>
        <div
          style={{
            width: 640,
            height: 360,
            transformOrigin: "top left",
            transform: `scale(${scale})`,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Block — card + the canonical ShareActions bar in one drop-in unit ──────
// variant="visible"   → card is shown inline (member profile page), scaled to
//                       fit the viewport on mobile.
// variant="offscreen" → card is rendered off-screen for export only, so the
//                       live cockpit stays the control surface (the share
//                       buttons themselves remain visible).
export function MemberShareBlock({
  memberNumber,
  chapterLabel,
  rankName,
  wallet,
  synReceived,
  cardUrl,
  shareUrl,
  shareText,
  filename,
  hint,
  variant = "visible",
}: {
  memberNumber: number;
  chapterLabel: string;
  rankName: string;
  wallet: `0x${string}`;
  synReceived: number;
  /** URL printed on the card itself (clean, no query string). */
  cardUrl: string;
  /** URL used for the share links — may carry ?ref attribution. */
  shareUrl: string;
  shareText: string;
  filename: string;
  hint?: string;
  variant?: "visible" | "offscreen";
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const card = (
    <MemberShareCard
      innerRef={ref}
      memberNumber={memberNumber}
      chapterLabel={chapterLabel}
      rankName={rankName}
      wallet={wallet}
      synReceived={synReceived}
      url={cardUrl}
    />
  );

  return (
    <div>
      {variant === "offscreen" ? (
        <div
          aria-hidden
          style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }}
        >
          {card}
        </div>
      ) : (
        <ResponsiveCardFrame>{card}</ResponsiveCardFrame>
      )}
      <ShareActions
        filename={filename}
        shareText={shareText}
        shareUrl={shareUrl}
        nodeRef={ref}
        hint={hint}
      />
    </div>
  );
}
