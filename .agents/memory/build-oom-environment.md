---
name: Production build OOM ceiling
description: Why `bun run build` (vite transform) gets SIGKILLed on this container and how to validate instead.
---

The production build (`bun run build` → `vite build`) reliably dies during the
`transforming...` phase with no error and no exit code — a cgroup OOM SIGKILL,
not a code error.

**Why:** the vite client transform for this app (wagmi/viem/recharts + many
routes) peaks above the container's cgroup memory limit. Raising
`NODE_OPTIONS=--max-old-space-size` makes it *worse* — Node then claims more than
the cgroup allows and gets killed *sooner*. `free -h` looks fine after the kill
because the spike already collapsed.

**Also:** a build backgrounded from a bash tool call is terminated when that
call returns. To observe it across polls you must fully detach
(`setsid bash -c '... ; echo done > marker' < /dev/null & disown`) and poll a
completion marker file in later calls. Even detached, it still eventually OOMs.

**How to apply:** do NOT treat a failed production build as a code regression
when `npx tsc --noEmit` is EXIT 0, targeted vitest passes, and the dev server
(`vite dev`, lighter on-demand compile) renders the changed surfaces clean.
Validate via tsc + targeted tests + dev-server screenshots; report the build as
environment-blocked, not broken. Don't burn turns re-running it with bigger heaps.
