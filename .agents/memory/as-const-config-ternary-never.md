---
name: as-const config + exhaustive ternary → TS 'never' narrowing
description: Deriving UI from an `as const` registry can make a provably-unreachable branch narrow the element to `never`; the fix is to extract fields to plain locals before branching.
---

# `as const` config + exhaustive ternary narrows to `never`

When you `.map` over an array inside a config object declared `as const` and branch on a
field whose every union member happens to share the same literal, TypeScript can prove a
branch is unreachable and narrows the element variable to `never` inside it. Touching the
element there (`a.id`) then errors: `Property 'id' does not exist on type 'never'`.

Concrete case: `ARCHIVE_CONTRACT_STATE` (whole object `as const`) has no artifact that is
`configured:"DEPLOYED_CONFIGURED"` **and** `active:false`. A ternary
`reserved ? … : active ? … : <configured-but-inactive>` made that last branch unreachable,
so `a` became `never` exactly where the pills are derived.

**Fix (minimal, future-proof):** extract the fields you need into plain locals *before* the
branching, and widen the boolean:
```ts
const id = a.id;
const active = a.active as boolean;   // widen the literal so the branch stays live
const reserved = a.configured === "RESERVED_DISABLED";
// then branch on `active`/`reserved` and interpolate `id`, never `a.*`
```
Because the branches read the locals (not `a`), the unreachable-branch narrowing of `a` is
harmless, and the code still renders correctly if a future artifact *is* configured-but-inactive.

**Why this matters here:** this codebase derives a lot of UI from `as const` registries
(syndicate-config.ts). Any future "derive pills/labels from config" widget can hit the same
trap. A `satisfies <Type>` annotation on the array is the cleaner alternative if you'd rather
not widen at the use site.
