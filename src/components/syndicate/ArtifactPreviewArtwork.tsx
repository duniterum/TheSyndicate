// Preview artwork generator — small, deterministic SVG illustrations
// used purely for the Archive Experience Preview. These are NOT the
// on-chain renderer output and the UI labels them as PREVIEW ARTWORK.
//
// Inspired by the design references (artifact anatomy / certificate /
// seal / card families) but intentionally simple and clearly synthetic.

import type { PreviewArtifact } from "@/lib/archive-preview-catalog";

export function ArtifactPreviewArtwork({ artifact }: { artifact: PreviewArtifact }) {
  const { id, name, visualFamily, primaryColor, accentColor, chapterLabel } =
    artifact;
  const idLabel = `#${String(id).padStart(3, "0")}`;
  return (
    <svg
      viewBox="0 0 320 200"
      role="img"
      aria-label={`Preview artwork for ${name}`}
      className="w-full h-full block"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <radialGradient id={`a-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.45" />
          <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="320" height="200" fill={`url(#g-${id})`} />
      <rect
        x="6"
        y="6"
        width="308"
        height="188"
        fill="none"
        stroke={accentColor}
        strokeOpacity="0.45"
      />

      {/* Family-specific glyph */}
      {visualFamily === "SEAL" && (
        <g transform="translate(160 100)">
          <circle r="46" fill="none" stroke={accentColor} strokeOpacity="0.8" />
          <circle r="34" fill="none" stroke={accentColor} strokeOpacity="0.55" />
          <circle r="6" fill={accentColor} />
        </g>
      )}
      {visualFamily === "ARTIFACT_CARD" && (
        <g transform="translate(160 100)" stroke={accentColor} fill="none">
          <rect x="-36" y="-50" width="72" height="100" strokeOpacity="0.7" />
          <line x1="-36" y1="-20" x2="36" y2="-20" strokeOpacity="0.35" />
          <line x1="-36" y1="20" x2="36" y2="20" strokeOpacity="0.35" />
          <circle r="4" fill={accentColor} stroke="none" />
        </g>
      )}
      {visualFamily === "PIXEL_SECRET" && (
        <g transform="translate(120 70)" fill={accentColor} fillOpacity="0.85">
          {[
            [2, 0], [4, 0], [1, 1], [5, 1], [0, 2], [6, 2], [0, 3], [6, 3],
            [1, 4], [5, 4], [2, 5], [4, 5], [3, 6],
          ].map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="9" height="9" />
          ))}
        </g>
      )}
      {visualFamily === "CERTIFICATE" && (
        <g transform="translate(40 50)" stroke={accentColor} fill="none">
          <rect x="0" y="0" width="240" height="100" strokeOpacity="0.6" />
          <line x1="20" y1="30" x2="220" y2="30" strokeOpacity="0.35" />
          <line x1="20" y1="50" x2="220" y2="50" strokeOpacity="0.35" />
          <line x1="20" y1="70" x2="160" y2="70" strokeOpacity="0.35" />
          <circle cx="210" cy="80" r="10" strokeOpacity="0.7" />
        </g>
      )}
      {visualFamily === "LEGACY" && (
        <g transform="translate(160 100)" stroke={accentColor} fill="none">
          <polygon
            points="0,-46 40,-15 25,40 -25,40 -40,-15"
            strokeOpacity="0.7"
          />
          <circle r="5" fill={accentColor} stroke="none" />
        </g>
      )}

      <rect width="320" height="200" fill={`url(#a-${id})`} />

      {/* Header / footer chrome */}
      <text
        x="14"
        y="22"
        fill={accentColor}
        fontFamily="ui-monospace, monospace"
        fontSize="9"
        letterSpacing="2"
      >
        {idLabel} · {visualFamily.replace("_", " ")}
      </text>
      <text
        x="14"
        y="188"
        fill={accentColor}
        fillOpacity="0.7"
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        letterSpacing="1.5"
      >
        PREVIEW · NOT CONTRACT-RENDERED
      </text>
      <text
        x="306"
        y="188"
        fill={accentColor}
        fillOpacity="0.7"
        fontFamily="ui-monospace, monospace"
        fontSize="8"
        letterSpacing="1.5"
        textAnchor="end"
      >
        {chapterLabel}
      </text>
    </svg>
  );
}
