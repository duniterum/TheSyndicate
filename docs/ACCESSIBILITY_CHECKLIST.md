# Accessibility Checklist — NFT Archive (/nft, /archive, /my-syndicate)

Date: 2026-06-06
Scope: Read-only validation phase of the NFT Archive experience.

## FAQ widget (`src/components/syndicate/ArchiveFaq.tsx`)

- [x] Each question is rendered as a real `<button type="button">` (not a `<div>` with `onClick`).
- [x] `aria-expanded` reflects current open/closed state.
- [x] `aria-controls` points at the matching answer panel `id`.
- [x] Answer panel `id`s are stable per render and derived from `useId()` + question index.
- [x] Answer panel uses `role="region"` and `aria-labelledby` pointing at the question button.
- [x] Keyboard support: native `<button>` handles Enter/Space; Tab order follows DOM order; visible focus ring (`focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50`).
- [x] Client-side search input has an associated `<label>` (visually hidden via `sr-only`), `type="search"`, autoComplete off.
- [x] Empty-search state announces "No matching FAQ found." as readable text (not relying on color).

## Hero CTAs (`src/routes/archive.tsx`)

- [x] All CTAs are real `<a>` / `<Link>` elements with visible labels.
- [x] External explorer link sets `target="_blank"` + `rel="noopener noreferrer"`.
- [x] Visible focus ring on every CTA.
- [x] Status pills use both color and text — never color alone.

## Explorer link guard (`src/lib/explorer-guard.ts`)

- [x] When no valid explorer URL is configured, the UI renders an honest "Explorer link pending" text node instead of a dead `<a>` (prevents focusable elements with no destination).

## Contract status widget (`src/components/syndicate/ArchiveContractStatus.tsx`)

- [x] All explorer `<a>` elements pass through `isValidExplorerUrl` before render.
- [x] Status pills carry text labels in addition to color (DEPLOYED · VALIDATION · NO PUBLIC DROP · READ-ONLY · READ · OK/PARTIAL/ERROR/PENDING).
- [x] Contract address is rendered as text and is selectable for copy.

## Build / typecheck

- [x] `bun run build` and TypeScript strict checks pass (see latest build log).
- [x] No new ESLint warnings introduced by this pass.

## Out of scope (unchanged constraints)

- No mint / approve / admin / marketplace UI.
- No fake values; failed reads surface as "Read error" or "Read pending".
- No drop activation, no smart-contract changes.
