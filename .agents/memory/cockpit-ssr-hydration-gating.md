---
name: Wallet-gated SSR hydration gating
description: Why wallet-gated components crash connected users in production only, and the centralized mounted-gate cure on /my-syndicate.
---

**Rule:** on an SSR route, ANY render that differs in STRUCTURE between the
disconnected and connected branches — `if (!isConnected) return null` vs a
subtree, an inline `{isConnected && <el>}` / `{record && <el>}` (renders nothing
vs an element), or a structural early-return like Wake/Seats
`if (isConnected && idx.isLoading) return <card>` — will hydration-mismatch and
can escalate to the root CatchBoundary ("This page didn't load"), but ONLY in
production, ONLY for connected wallets.

**Why:** `src/lib/wagmi.ts` uses `ssr:true` with NO cookieStorage, so the SERVER
has no wallet and always renders the disconnected branch. A reconnected CLIENT
reports `isConnected` (and an `address`) SYNCHRONOUSLY on its first paint (wagmi
cache hydrates from localStorage), so the first client render produces the
connected subtree the server never emitted. Server ≠ first client = structural
mismatch (React #418/#423 class). Disconnected users never see it; the dev
server never reproduces it (lenient hydration + unminified). Minified prod strict
hydration turns the otherwise-recoverable mismatch fatal at the boundary.

**Cure that actually worked (centralized at the wallet-state source):**
`useCockpitAccount` (`src/lib/dev/cockpit-fixtures.ts`) now returns
`{address: undefined, isConnected: false}` until a mounted gate flips post-mount
(`const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[]); if(!mounted) return {address:undefined,isConnected:false}`).
ALL FOUR cockpit consumers (MemberCockpit, SeatsAroundYou, CockpitCollector,
WakeBehindYou) inherit it, and because every cockpit wallet branch derives from
this hook — `isConnected`, `address`, and `record = address ? idx.getByWallet(address) : undefined`
— the WHOLE cockpit collapses to the disconnected branch on first client paint =
matches SSR. One gate fixes the lot; the connected cockpit reveals as a
client-only update post-mount. **Do not remove this gate.**

**Correction to a prior belief:** a previous fix gated ONLY `WhatChangedForYou`
and the note claimed the inline-`&&` cockpit siblings were "safe because they
render a wrapper in every state." That was WRONG — a ternary `{c ? <A/> : <B/>}`
inside an always-rendered wrapper IS safe (one element either way), but inline
`{c && <el>}` and structural early-returns are NOT. They were the residual crash.

**Still-valid per-component gates:** `NextMemberHero.tsx` and
`WhatChangedForYou.tsx` keep their own mounted gates because they are NOT fed by
`useCockpitAccount` (they call wagmi `useAccount` directly). Route helpers that
use raw `useAccount` (`ActivityStrip`, `ChronicleBlock` in `my-syndicate.tsx`)
are genuinely safe — they always render their wrapper with a ternary inside, so
only StatusPill TEXT differs (non-fatal).

**How to apply:** any NEW wallet-gated cockpit surface should consume
`useCockpitAccount` (gets the gate for free). Any wallet-gated surface OUTSIDE
the cockpit that branches null-vs-subtree on `isConnected`/`address`-derived data
needs its own mounted gate.

**Repro caveat:** cannot reproduce with `?cockpit=` DEV fixtures (DEV-gated, DEV
is false in every build) NOR on the dev server. Verify ONLY by publishing and
loading live `/my-syndicate` with a connected wallet — the sole environment where
it reproduces.
