// Generates The Syndicate v2 "Interlock" APPROVED brand asset set from the
// canonical traced monogram geometry. Review-only — NOT wired into production,
// NOT published. Output: public/brand-v2-syndicate-interlock/
//
// All wordmark/descriptor/tagline text is REAL vector text (DejaVu Sans Bold),
// rendered via the SVG <text> element — never AI-generated image text.
//
// Run: node scripts/brand/gen-interlock.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";

const OUT = "public/brand-v2-syndicate-interlock";
mkdirSync(OUT, { recursive: true });

const RENDER_ENV = { ...process.env, FONTCONFIG_FILE: "/tmp/fc/fonts.conf" };
const sh = (cmd) => execSync(cmd, { env: RENDER_ENV, stdio: ["ignore", "ignore", "inherit"] });

// ── Palette (color law: Gold = identity/brand/seat/token) ──────────────────
const GOLD = "#E3A92B";
const INK = "#0A0B0D";
const IVORY = "#F5F1E8";
const LIGHTBG = "#F5F5F7";
const MUTED = "#6B6B73";
const FONT = "DejaVu Sans"; // only premium sans available as a file in-env

// ── Canonical monogram geometry (interlocking double-S / chain-link) ────────
// Two filled paths in potrace space; group transform maps to viewBox 0 0 600 554.
// Content bbox measured = x[2..600] y[25..502] -> tight viewBox "2 25 598 477".
const P1 = `M1765 5270 l-260 -7 -140 -40 c-166 -48 -204 -62 -395 -152 -55 -26 -119 -65 -184 -110 -120 -83 -315 -271 -387 -371 -63 -88 -119 -174 -119 -183 0 -5 -11 -23 -25 -41 -14 -18 -25 -36 -25 -40 0 -4 -13 -35 -30 -69 -60 -126 -111 -275 -130 -377 -10 -58 -26 -139 -35 -180 -15 -67 -16 -132 -10 -620 3 -300 6 -651 6 -780 1 -354 32 -509 155 -755 113 -228 166 -310 276 -431 196 -216 275 -274 558 -415 174 -86 180 -88 361 -132 l144 -35 607 -6 c443 -4 614 -3 633 6 39 18 48 64 42 217 -5 147 -17 191 -73 263 -50 63 -148 137 -218 163 l-66 25 -451 0 c-422 0 -456 1 -531 21 -173 44 -424 197 -536 326 -123 143 -210 316 -236 471 -17 98 -13 123 22 140 27 13 1014 7 1038 -6 22 -12 28 -24 60 -126 17 -55 55 -116 113 -180 71 -78 248 -179 346 -198 92 -17 1465 -16 1525 1 62 18 163 81 241 151 52 46 76 78 112 147 55 107 71 184 65 303 -7 116 -37 180 -128 270 -77 77 -138 112 -238 135 -69 17 -78 17 -160 1 -145 -29 -267 -111 -352 -238 -60 -90 -72 -143 -79 -356 -5 -168 -8 -185 -26 -198 -16 -12 -57 -14 -222 -12 -178 3 -204 5 -220 21 -15 15 -18 40 -20 185 -3 173 -9 203 -51 287 -73 145 -174 243 -332 318 l-85 41 -420 7 c-362 6 -426 9 -465 24 -25 9 -65 24 -90 32 -184 61 -385 201 -494 346 -66 87 -123 206 -137 287 -18 101 -16 326 4 420 17 81 86 234 142 315 58 83 171 200 238 248 118 82 304 166 419 187 28 6 255 10 508 10 355 0 467 3 502 14 98 29 237 151 281 246 18 38 21 70 25 215 4 159 3 172 -16 195 l-20 25 -379 1 c-208 0 -495 -2 -638 -6z`;
const P2 = `M3220 5253 c-25 -21 -25 -22 -25 -190 0 -214 9 -244 103 -340 45 -45 90 -80 136 -103 l70 -35 510 -5 511 -5 65 -28 c36 -16 80 -33 97 -38 61 -18 194 -96 256 -150 72 -62 201 -203 230 -251 11 -18 27 -44 36 -58 25 -40 82 -181 92 -229 5 -25 10 -81 11 -124 2 -126 42 -117 -501 -116 -251 0 -494 4 -539 8 -98 8 -108 16 -117 100 -10 83 -21 112 -76 196 -98 150 -239 253 -384 280 -95 17 -1291 31 -1391 15 -47 -7 -98 -25 -162 -58 -127 -64 -203 -139 -259 -255 -54 -111 -65 -154 -65 -252 0 -110 14 -159 68 -248 57 -96 130 -161 232 -206 70 -31 86 -34 177 -35 95 0 104 1 178 37 110 52 209 154 269 273 l43 87 5 202 c5 203 8 220 45 247 6 4 87 8 182 8 184 0 197 -3 208 -53 2 -12 6 -107 8 -212 l3 -190 34 -70 c90 -186 181 -273 382 -366 l93 -43 450 -7 450 -7 84 -31 c258 -96 429 -239 533 -448 41 -80 88 -286 88 -381 0 -82 -47 -286 -85 -372 -48 -109 -160 -267 -233 -328 -143 -120 -191 -153 -285 -195 -167 -74 -191 -77 -712 -77 -431 0 -459 -1 -513 -20 -110 -39 -207 -122 -260 -225 l-37 -70 0 -167 c0 -104 4 -171 11 -178 7 -7 221 -11 665 -13 613 -2 657 -1 699 16 44 18 71 27 210 69 68 20 305 135 375 181 253 168 425 343 553 562 58 98 128 237 142 280 7 22 21 60 32 84 11 24 26 86 34 137 15 101 28 144 44 144 7 0 10 281 10 865 0 833 -1 867 -19 893 -12 17 -25 67 -35 135 -8 59 -24 124 -35 145 -10 20 -22 53 -26 72 -17 86 -147 321 -263 480 -112 152 -297 314 -500 437 -69 42 -215 113 -233 113 -8 0 -38 11 -68 25 -55 26 -134 49 -306 91 l-100 25 -585 -3 c-583 -3 -585 -3 -610 -25z`;

const MARK_ASPECT = 598 / 477; // ≈ 1.2537 (wide)
const markGroup = (fill) =>
  `<g transform="translate(0,554) scale(0.1,-0.1)" fill="${fill}"><path d="${P1}"/><path d="${P2}"/></g>`;
// Place the mark centered on (cx,cy) at target width tw (height kept in aspect).
const markAt = (cx, cy, tw, fill) => {
  const th = tw / MARK_ASPECT;
  return `<svg x="${(cx - tw / 2).toFixed(2)}" y="${(cy - th / 2).toFixed(2)}" width="${tw.toFixed(2)}" height="${th.toFixed(2)}" viewBox="2 25 598 477" preserveAspectRatio="xMidYMid meet">${markGroup(fill)}</svg>`;
};
const svg = (vb, body, extra = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${extra ? " " + extra : ""}>\n${body}\n</svg>\n`;

// Shared gradient defs
const goldTileGrad = `<linearGradient id="gt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4D98A"/><stop offset="0.5" stop-color="#E3A92B"/><stop offset="1" stop-color="#A8791D"/></linearGradient>`;
const obsidianGrad = `<radialGradient id="ob" cx="0.5" cy="0.4" r="0.78"><stop offset="0" stop-color="#1C1E22"/><stop offset="1" stop-color="#0A0B0D"/></radialGradient>`;
const goldCoinFace = `<radialGradient id="cf" cx="0.36" cy="0.30" r="0.82"><stop offset="0" stop-color="#F8E6A6"/><stop offset="0.45" stop-color="#D9B441"/><stop offset="0.80" stop-color="#B68C24"/><stop offset="1" stop-color="#8A6614"/></radialGradient>`;
const goldCoinRim = `<linearGradient id="cr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F4D98A"/><stop offset="0.5" stop-color="#B8911F"/><stop offset="1" stop-color="#6E520F"/></linearGradient>`;
const silverFace = `<radialGradient id="sf" cx="0.36" cy="0.30" r="0.82"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#D2D6DC"/><stop offset="0.80" stop-color="#9AA0A8"/><stop offset="1" stop-color="#6E747C"/></radialGradient>`;
const silverRim = `<linearGradient id="sr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2F4F6"/><stop offset="0.5" stop-color="#9AA0A8"/><stop offset="1" stop-color="#5E636B"/></linearGradient>`;

// Text helper (real vector text)
const text = (x, y, s, { size = 48, fill = IVORY, ls = 8, weight = "bold", anchor = "start" }) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" text-anchor="${anchor}">${s}</text>`;

const files = []; // { name, raster: fn(svgPath, pngPath) }
const writeSvg = (name, content) => {
  writeFileSync(`${OUT}/${name}.svg`, content);
  return name;
};

// ── 1 · Bare marks ─────────────────────────────────────────────────────────
const bareMark = (fill) => svg("2 25 598 477", markGroup(fill));
writeSvg("syn-mark-gold", bareMark(GOLD));
writeSvg("syn-mark-ink", bareMark(INK));
writeSvg("syn-mark-ivory", bareMark(IVORY));

// ── 2 · Icon tiles (512) ───────────────────────────────────────────────────
const SIZE = 512, RX = 112, FRAC = 0.6;
const tw = SIZE * FRAC;
writeSvg(
  "syn-icon-gold",
  svg(`0 0 ${SIZE} ${SIZE}`, `<defs>${goldTileGrad}</defs><rect width="${SIZE}" height="${SIZE}" rx="${RX}" fill="url(#gt)"/>${markAt(SIZE / 2, SIZE / 2, tw, INK)}`),
);
writeSvg(
  "syn-icon-obsidian",
  svg(`0 0 ${SIZE} ${SIZE}`, `<defs>${obsidianGrad}</defs><rect width="${SIZE}" height="${SIZE}" rx="${RX}" fill="url(#ob)"/><rect x="6" y="6" width="${SIZE - 12}" height="${SIZE - 12}" rx="${RX - 6}" fill="none" stroke="${GOLD}" stroke-opacity="0.35" stroke-width="2"/>${markAt(SIZE / 2, SIZE / 2, tw, GOLD)}`),
);
// Maskable: full-bleed obsidian, mark inside 80% safe zone (~52%)
writeSvg(
  "syn-icon-maskable",
  svg(`0 0 ${SIZE} ${SIZE}`, `<defs>${obsidianGrad}</defs><rect width="${SIZE}" height="${SIZE}" fill="url(#ob)"/>${markAt(SIZE / 2, SIZE / 2, SIZE * 0.5, GOLD)}`),
);

// ── 3 · Favicon / app / avatar ─────────────────────────────────────────────
// App icon = obsidian tile (512)
writeSvg(
  "syn-app-icon",
  svg(`0 0 ${SIZE} ${SIZE}`, `<defs>${obsidianGrad}</defs><rect width="${SIZE}" height="${SIZE}" rx="${RX}" fill="url(#ob)"/>${markAt(SIZE / 2, SIZE / 2, tw, GOLD)}`),
);
// Favicon master (64) — bigger mark for small-size legibility
writeSvg(
  "syn-favicon",
  svg(`0 0 64 64`, `<defs>${obsidianGrad}</defs><rect width="64" height="64" rx="14" fill="url(#ob)"/>${markAt(32, 32, 64 * 0.74, GOLD)}`),
);
// Avatar (512) — round obsidian + gold ring
writeSvg(
  "syn-avatar",
  svg(`0 0 ${SIZE} ${SIZE}`, `<defs>${obsidianGrad}</defs><circle cx="256" cy="256" r="256" fill="url(#ob)"/><circle cx="256" cy="256" r="250" fill="none" stroke="${GOLD}" stroke-opacity="0.5" stroke-width="3"/>${markAt(256, 256, SIZE * 0.58, GOLD)}`),
);

// ── 4 · Token coins (512) ──────────────────────────────────────────────────
const coin = (faceUrl, rimUrl, defs) =>
  svg(
    `0 0 512 512`,
    `<defs>${defs}</defs><circle cx="256" cy="256" r="250" fill="url(#${rimUrl})"/><circle cx="256" cy="256" r="230" fill="url(#${faceUrl})"/><circle cx="256" cy="256" r="230" fill="none" stroke="#000000" stroke-opacity="0.18" stroke-width="3"/>${markAt(256, 256, 300, INK)}`,
  );
writeSvg("syn-coin-gold", coin("cf", "cr", goldCoinFace + goldCoinRim));
writeSvg("syn-coin-silver", coin("sf", "sr", silverFace + silverRim));

// ── 5 · Lockups (real text) ────────────────────────────────────────────────
const LW = 1280, LH = 340;
const WORD = "THE SYNDICATE";
const DESC = "ON-CHAIN MEMBERSHIP PROTOCOL";

const lockupHorizontal = (name, { bg, markEl, wordFill, descFill }) => {
  const dividerX = 90 + 230 + 70; // mark box left(90)+width(230)+gap(70)
  const body = `
    ${bg.startsWith("#") ? `<rect width="${LW}" height="${LH}" fill="${bg}"/>` : bg}
    ${markEl}
    <line x1="${dividerX}" y1="95" x2="${dividerX}" y2="245" stroke="${GOLD}" stroke-width="3"/>
    ${text(dividerX + 50, 185, WORD, { size: 76, fill: wordFill, ls: 11 })}
    ${text(dividerX + 52, 232, DESC, { size: 23, fill: descFill, ls: 7 })}
  `;
  return writeSvg(name, svg(`0 0 ${LW} ${LH}`, body));
};

// light — bare gold mark, ink wordmark
lockupHorizontal("syn-lockup-light", {
  bg: LIGHTBG,
  markEl: markAt(205, 170, 230, GOLD),
  wordFill: INK,
  descFill: MUTED,
});
// dark — gold tile, ivory wordmark
lockupHorizontal("syn-lockup-dark", {
  bg: `<defs>${goldTileGrad}</defs><rect width="${LW}" height="${LH}" fill="${INK}"/><rect x="90" y="70" width="200" height="200" rx="46" fill="url(#gt)"/><svg x="115" y="95" width="150" height="150" viewBox="2 25 598 477" preserveAspectRatio="xMidYMid meet">${markGroup(INK)}</svg>`,
  markEl: "",
  wordFill: IVORY,
  descFill: GOLD,
});
// obsidian — bare gold mark, ivory wordmark
lockupHorizontal("syn-lockup-obsidian", {
  bg: INK,
  markEl: markAt(205, 170, 230, GOLD),
  wordFill: IVORY,
  descFill: GOLD,
});
// stacked — centered, mark over wordmark
{
  const W = 760, H = 620;
  const body = `<defs>${obsidianGrad}</defs><rect width="${W}" height="${H}" fill="url(#ob)"/>
    ${markAt(380, 210, 300, GOLD)}
    <line x1="280" y1="378" x2="480" y2="378" stroke="${GOLD}" stroke-width="2"/>
    ${text(380, 470, WORD, { size: 66, fill: IVORY, ls: 11, anchor: "middle" })}
    ${text(380, 520, DESC, { size: 22, fill: GOLD, ls: 8, anchor: "middle" })}`;
  writeSvg("syn-lockup-stacked", svg(`0 0 ${W} ${H}`, body));
}

// ── 6 · Social / listing ───────────────────────────────────────────────────
// OG card 1200x630
{
  const W = 1200, H = 630;
  const body = `<defs>${obsidianGrad}</defs>
    <rect width="${W}" height="${H}" fill="url(#ob)"/>
    <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="10" fill="none" stroke="${GOLD}" stroke-opacity="0.25" stroke-width="2"/>
    ${markAt(600, 188, 260, GOLD)}
    ${text(600, 410, WORD, { size: 90, fill: IVORY, ls: 14, anchor: "middle" })}
    ${text(600, 462, DESC, { size: 27, fill: MUTED, ls: 9, anchor: "middle" })}
    ${text(600, 540, "MEMBERSHIP · SIGNAL · LEGACY", { size: 28, fill: GOLD, ls: 10, anchor: "middle" })}`;
  writeSvg("syn-og", svg(`0 0 ${W} ${H}`, body));
}
// Listing badge 920x200 (mark + name | SYN)
{
  const W = 920, H = 200;
  const dx = 700;
  const body = `<defs>${goldTileGrad}</defs>
    <rect width="${W}" height="${H}" rx="28" fill="${INK}"/>
    <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" rx="26.5" fill="none" stroke="${GOLD}" stroke-opacity="0.4" stroke-width="2"/>
    <rect x="40" y="40" width="120" height="120" rx="26" fill="url(#gt)"/>
    <svg x="58" y="58" width="84" height="84" viewBox="2 25 598 477" preserveAspectRatio="xMidYMid meet">${markGroup(INK)}</svg>
    ${text(190, 118, WORD, { size: 44, fill: IVORY, ls: 5 })}
    <line x1="${dx}" y1="60" x2="${dx}" y2="140" stroke="${GOLD}" stroke-width="2"/>
    ${text(dx + 34, 118, "SYN", { size: 44, fill: GOLD, ls: 5 })}`;
  writeSvg("syn-listing", svg(`0 0 ${W} ${H}`, body));
}
// Exchange preview 800x800 (coin + ticker + name)
{
  const W = 800, H = 800;
  const body = `<defs>${goldCoinFace}${goldCoinRim}${obsidianGrad}</defs>
    <rect width="${W}" height="${H}" fill="url(#ob)"/>
    <circle cx="400" cy="300" r="180" fill="url(#cr)"/>
    <circle cx="400" cy="300" r="165" fill="url(#cf)"/>
    <circle cx="400" cy="300" r="165" fill="none" stroke="#000000" stroke-opacity="0.18" stroke-width="3"/>
    <svg x="295" y="216" width="210" height="168" viewBox="2 25 598 477" preserveAspectRatio="xMidYMid meet">${markGroup(INK)}</svg>
    ${text(400, 610, "SYN", { size: 96, fill: GOLD, ls: 10, anchor: "middle" })}
    ${text(400, 672, WORD, { size: 40, fill: IVORY, ls: 9, anchor: "middle" })}
    ${text(400, 716, DESC, { size: 21, fill: MUTED, ls: 7, anchor: "middle" })}`;
  writeSvg("exchange-preview", svg(`0 0 ${W} ${H}`, body));
}

console.log("SVGs written to", OUT);

// ── Rasterize ──────────────────────────────────────────────────────────────
const png = (name, args) => sh(`magick -background none ${args} "${OUT}/${name}.svg" "${OUT}/${name}.png"`);
const pngBG = (name, density, w, h) =>
  sh(`magick -density ${density} -background none "${OUT}/${name}.svg" -resize ${w}${h ? "x" + h : ""} "${OUT}/${name}.png"`);

// marks (1024 wide, transparent)
for (const n of ["syn-mark-gold", "syn-mark-ink", "syn-mark-ivory"]) pngBG(n, 192, 1024);
// icons / app / avatar / coins (512, crisp via 2x density)
for (const n of ["syn-icon-gold", "syn-icon-obsidian", "syn-icon-maskable", "syn-app-icon", "syn-avatar", "syn-coin-gold", "syn-coin-silver"])
  pngBG(n, 192, 512, 512);
// dedicated app-icon-512 filename
sh(`cp "${OUT}/syn-app-icon.png" "${OUT}/syn-app-icon-512.png"`);
// favicon png (32) + ico (16,32,48) from the 64 master
sh(`magick -density 192 -background none "${OUT}/syn-favicon.svg" -resize 32x32 "${OUT}/syn-favicon.png"`);
sh(`magick -density 384 -background none "${OUT}/syn-favicon.svg" -define icon:auto-resize=48,32,16 "${OUT}/favicon.ico"`);
// lockups (2x density for crisp text)
for (const n of ["syn-lockup-light", "syn-lockup-dark", "syn-lockup-obsidian", "syn-lockup-stacked"]) png(n, "-density 192");
// social
pngBG("syn-og", 192, 1200, 630);
png("syn-listing", "-density 192");
pngBG("exchange-preview", 192, 800, 800);

console.log("PNGs + favicon.ico rasterized. Done.");
