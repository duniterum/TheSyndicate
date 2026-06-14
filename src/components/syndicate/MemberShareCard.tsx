// MemberShareCard — the production, premium "share your seat" artifact.
//
// A purpose-built, fixed-size identity card exported to PNG via html-to-image
// (see ./ShareActions). Graduated from the labs share-card work into a single
// reusable block used on /my-syndicate (the cockpit) and /wallet/$address.
//
// Truth doctrine: every field is a live on-chain read or a value derived from
// indexed Membership Sale purchases — member number, chapter, rank, SYN
// received, wallet. Nothing is fabricated. Language stays recognition-only:
// "Verified on Avalanche", "Member #N" — never profit / yield / ROI.

import { useRef, type RefObject } from "react";
import { ShareActions } from "./ShareActions";

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const fmtInt = (n: number) => Math.round(n).toLocaleString("en-US");
const stripProtocol = (u: string) => u.replace(/^https?:\/\//, "");

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

      {/* member number + rank */}
      <div style={{ marginTop: 16 }}>
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
              fontSize: 76,
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
              color: "rgba(255,255,255,0.72)",
            }}
          >
            {rankName}
          </span>
        </div>
      </div>

      {/* fact row */}
      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="SYN received" value={`${fmtInt(synReceived)} SYN`} />
        <Field label="Wallet" value={short(wallet)} />
      </div>

      {/* verified badge */}
      <div
        style={{
          marginTop: 18,
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

      {/* footer */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "ui-monospace, monospace",
          fontSize: 10.5,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        <span>{stripProtocol(url)}</span>
        <span>Don&apos;t trust · verify</span>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 14 }}>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 9.5,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.55)",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 18, fontWeight: 600 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Block — card + the canonical ShareActions bar in one drop-in unit ──────
// variant="visible"   → card is shown inline (member profile page).
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
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>{card}</div>
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
