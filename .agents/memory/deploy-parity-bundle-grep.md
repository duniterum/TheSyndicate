---
name: Deploy parity via bundle string-grep
description: How to verify whether a committed UI fix is actually LIVE in production (not just in HEAD)
---

- To confirm a committed UI fix is LIVE, grep the DEPLOYED JS for the OLD vs NEW string literals. New present + old absent = live; old present + new absent = the deploy is behind HEAD → republish.
- Route-specific copy lives in its OWN route-split chunk. The `/my-syndicate` cockpit copy ships in a `my-syndicate-*.js` chunk that the homepage HTML never references. Fetch the ROUTE's HTML (e.g. `/my-syndicate`) to discover its chunk URLs, then fetch + grep those — fetching `/` will miss it.
- Gotcha: lowercase `uncapped` legitimately exists in `CockpitProgression` (Open-Era seat-bar logic). Only `"Uncapped supply"` / `"Open edition"` are the stale First-Signal bug copy. Don't flag the Open-Era one.

**Why:** a green local test suite says nothing about what is deployed; production can lag HEAD silently (observed: the First-Signal "fixed edition" cockpit fix was committed + tested locally but the deployed cockpit chunk still served "Uncapped"/"Open edition").

**How to apply:** when asked "is X live?", string-grep the deployed route chunk; never infer "live" from the commit or local tests.
