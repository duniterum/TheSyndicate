---
name: TanStack flat-route layout needs Outlet
description: In this repo's flat file routing, a parent route file with dotted children is a LAYOUT; without <Outlet/> the children silently render nothing (you see the parent instead).
---

# Flat-route parent files are layouts — they MUST render `<Outlet/>`

In this TanStack Start repo (`@tanstack/router-plugin`, flat dot-notation files
in `src/routes/`), a file like `labs.tsx` that has dotted children
(`labs.design-archive.tsx`, `labs.invariants.tsx`, `labs.<x>.tsx`) is the
**layout route** for `/labs/*`. The generated `routeTree.gen.ts` wires every
child with `getParentRoute: () => LabsRoute`.

**The trap:** if that parent file renders its own page content directly and has
**no `<Outlet/>`**, then visiting any child path (`/labs/design-archive`,
`/labs/anything`) renders the PARENT component and silently drops the child —
there is no error, no console warning. It just looks like the index page at
every sub-path. This had been latently broken for the existing `/labs/*`
children before it was noticed.

**Why:** the child only mounts into the parent's `<Outlet/>`. No outlet → no
place to render the child → parent shows alone.

**How to apply:** to add a real sub-page under an existing flat parent `X.tsx`:
1. Make `X.tsx` a thin layout: `component` returns just `<Outlet/>` (keep shared
   head/meta like noindex here so the whole subtree inherits it).
2. Move the content that should show at exactly `/X` into `X.index.tsx`
   (`createFileRoute("/X/")`, trailing slash = index route).
3. Your new `X.child.tsx` then renders correctly at `/X/child`.

Restart the dev workflow (or let the plugin regen) so `routeTree.gen.ts` rebuilds;
verify with a screenshot per path, not just typecheck — the failure mode is
visual, not a type error.
