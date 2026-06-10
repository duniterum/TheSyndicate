# The Syndicate

## Overview
"The Syndicate" — an on-chain Avalanche C-Chain (43114) membership protocol and website. Members join by buying the SYN token with USDC; each member receives a permanent, verifiable on-chain "seat." The product is identity and belonging, not financial return.

**Stack:** TanStack Start + React 19 + Tailwind v4 + Wagmi/Viem + TanStack Query v5.

**Dev command:** `bun run dev -- --port 5000 --host 0.0.0.0`

**Core doctrine (non-negotiable):**
- SYN is an experimental utility membership token — **not** equity, debt, a dividend, yield, or a promise of profit.
- **Code outranks docs.** On-chain truth → code registries → execution gates → canonical docs → operational → historical.
- Rank is **recognition only** (derived from cumulative USDC), confers no rights/returns/discounts.
- Every public claim must map to an on-chain read or be clearly labeled PENDING. "Don't trust, verify."

## User preferences

- **"Full Protocol View" command:** When the user says **"Full Protocol View"**, regenerate the complete **14-part founder-grade audit report** and deliver it as **one single Markdown file** (then present it for download). It is **read-only** — do not modify protocol code, config, or canon docs; only write the report file (and agent memory). Use the existing report as the template/format: `docs/audits/FULL_PROTOCOL_VIEW_CANON_FOUNDER_INTENT_MAP.md`. The 14 parts are: (1) Full protocol view across the 12 canonical buckets, (2) Source-of-truth table, (3) Founder intent map, (4) Economic reality (income streams), (5) Revenue-per-member reality, (6) Personas, (7) Terminology collision map, (8) Chronicle/story-engine readiness, (9) Burn readiness, (10) Future-module readiness, (11) Documentation/canon structure, (12) Doc/site/FAQ/whitepaper sync process + lint checklist, (13) Final priority roadmap (Phase 0–5), (14) Steward's 5-year perspective. Refresh values from the live code before writing — do not blindly copy stale numbers.
