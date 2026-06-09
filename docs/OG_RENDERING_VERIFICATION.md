# OG Rendering Verification Matrix

For each route × platform combination, record what a social crawler
actually shows when the URL is shared. Code that "should" render
correctly does not count — only manual observation does.

Strategy reference: `OG_RENDERING_STRATEGY.md` (hybrid SVG + static PNG).

## Automated checks (run these first)

### 1. Health endpoint

```
curl -s https://thesyndicate.money/api/og/health | jq
```

Returns `{ ok: true, surfaces: {...} }` when every shareable surface
has required meta tags AND every dynamic OG endpoint + static PNG
fallback responds 200 with the expected content type. Returns HTTP
503 with a per-surface breakdown when something is wrong. No PII is
exposed.

### 2. Metadata test script

```
node scripts/og-metadata-test.mjs                       # local dev
node scripts/og-metadata-test.mjs https://thesyndicate.money
```

Exits non-zero on any missing required tag. Required per route:
`title`, `og:title`, `og:description`, `og:image`, `twitter:card`,
`twitter:image`, `twitter:image:alt`, `canonical`.

Run both before submitting a manual verification pass. If either
fails, fix the code first — manual platform checks are pointless
when the static metadata is wrong.

## Manual platform checks

- **X / Twitter** — https://cards-dev.twitter.com/validator
  (or post a draft tweet with the URL and inspect the unfurl).
- **Telegram** — paste link into a Saved Messages chat.
- **iMessage** — paste link into a Notes draft or Messages.
- **Discord** — paste link in a #test channel.
- **Slack** — paste link in a DM with yourself.
- **Bluesky** — compose a draft post.
- **LinkedIn** — https://www.linkedin.com/post-inspector/

Each cell below must be filled with ✓ / ✗ / notes after manual
verification. **Do not pre-fill ✓; absence of a check is the truthful
state until verified.**

## Matrix

### URL: `https://thesyndicate.money/`

| Platform | Image renders | Title correct | Description correct | Fallback acceptable | Notes |
| -------- | ------------- | ------------- | ------------------- | ------------------- | ----- |
| X / Twitter | _todo_ | _todo_ | _todo_ | _todo_ | static PNG fallback |
| Telegram    | _todo_ | _todo_ | _todo_ | n/a                 | static PNG (root has no dynamic SVG) |
| iMessage    | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Discord     | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Slack       | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Bluesky     | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| LinkedIn    | _todo_ | _todo_ | _todo_ | _todo_              | static PNG |

### URL: `https://thesyndicate.money/transparency`

| Platform | Image renders | Title correct | Description correct | Fallback acceptable | Notes |
| -------- | ------------- | ------------- | ------------------- | ------------------- | ----- |
| X / Twitter | _todo_ | _todo_ | _todo_ | _todo_ | static PNG |
| Telegram    | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| iMessage    | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Discord     | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Slack       | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| Bluesky     | _todo_ | _todo_ | _todo_ | n/a                 | static PNG |
| LinkedIn    | _todo_ | _todo_ | _todo_ | _todo_              | static PNG |

### URL: `https://thesyndicate.money/wallet/<member-address>`

| Platform | Image renders | Title correct | Description correct | Fallback acceptable | Notes |
| -------- | ------------- | ------------- | ------------------- | ------------------- | ----- |
| X / Twitter | _todo_ | _todo_ | _todo_ | _todo_ | branded static PNG fallback (X strips SVG) |
| Telegram    | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG with founder #, rank, chapter |
| iMessage    | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Discord     | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Slack       | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Bluesky     | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| LinkedIn    | _todo_ | _todo_ | _todo_ | _todo_              | branded static PNG fallback |

### URL: `https://thesyndicate.money/milestone/<id>`

| Platform | Image renders | Title correct | Description correct | Fallback acceptable | Notes |
| -------- | ------------- | ------------- | ------------------- | ------------------- | ----- |
| X / Twitter | _todo_ | _todo_ | _todo_ | _todo_ | branded static PNG fallback |
| Telegram    | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG with status + as-of block |
| iMessage    | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Discord     | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Slack       | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| Bluesky     | _todo_ | _todo_ | _todo_ | n/a                 | dynamic SVG |
| LinkedIn    | _todo_ | _todo_ | _todo_ | _todo_              | branded static PNG fallback |

### Mobile / desktop browser sanity

| Form factor | URL | Visual integrity | Notes |
| ----------- | --- | ---------------- | ----- |
| Mobile browser   | /                          | _todo_ | |
| Mobile browser   | /transparency              | _todo_ | |
| Mobile browser   | /wallet/<address>          | _todo_ | |
| Mobile browser   | /milestone/<id>            | _todo_ | |
| Desktop browser  | /                          | _todo_ | |
| Desktop browser  | /transparency              | _todo_ | |
| Desktop browser  | /wallet/<address>          | _todo_ | |
| Desktop browser  | /milestone/<id>            | _todo_ | |

## Known OG limitations

- **X / Twitter strips SVG `og:image`.** This is why every shareable
  route declares a static PNG `twitter:image` fallback. There is no
  way around this without a runtime PNG renderer; see
  `OG_RENDERING_STRATEGY.md` for the deferral rationale.
- **Root (`/`) and `/transparency` are static-PNG only.** They do not
  have dynamic SVG cards. This is intentional: snapshot data on a
  homepage drifts and would require re-rendering on every state
  change. Branded PNGs are stable and accurate.
- **`og:image:alt` is ignored by some scrapers.** Provided anyway for
  accessibility and for crawlers that do honor it (LinkedIn, Slack).

## Reporting

When verification is complete, replace `_todo_` cells with ✓ / ✗ and
add notes for any partial / quirky platform behavior. If any cell
turns ✗, log a follow-up in `FINISHING_PHASE_ROADMAP.md` before
moving to Member Wall / Founders Hall / Chapter Archives / NFT /
Referral.
