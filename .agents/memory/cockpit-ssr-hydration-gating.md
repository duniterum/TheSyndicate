---
name: Wallet-gated SSR hydration gating
description: Why wallet-gated null-vs-subtree components crash connected users in production only, and the mounted-gate cure.
---

**Rule:** any component on an SSR route that returns `null` when disconnected but a full subtree when connected (branching on wagmi `isConnected`) will hydration-mismatch and can escalate to the root CatchBoundary ("This page didn't load") — but ONLY in production, ONLY for connected wallets.

**Why:** `src/lib/wagmi.ts` uses `ssr:true` with NO cookieStorage, so the SERVER has no wallet and always renders the disconnected branch (`null`). A reconnected CLIENT renders the connected subtree on its first paint. Server `null` ≠ client subtree = a structural hydration mismatch (React #418 class). Disconnected users never see it (both sides render `null`); the dev server never reproduces it (lenient hydration + the prod bundle differs). Minified production strict hydration turns the otherwise-recoverable mismatch fatal at the boundary.

**Cure:** a mounted gate placed BEFORE the `if (!isConnected) return null` check:
`const [mounted,setMounted]=useState(false); useEffect(()=>setMounted(true),[]); if(!mounted) return null;`
First client render === server render === `null`; the connected content reveals post-mount as a client-only update, so there is no SSR HTML to mismatch. `src/components/syndicate/NextMemberHero.tsx` is the canonical in-repo pattern — its comment explicitly cites the wagmi cache hydrating synchronously on the client.

**How to apply:** when adding ANY wallet-gated section to an SSR route, never branch `null`-vs-subtree on `isConnected` without the mounted gate. Components that always render a wrapper/Shell in every state (a ternary INSIDE an always-rendered element) are already safe — that is why the sibling cockpit surfaces (SeatsAroundYou, WakeBehindYou, IdentityRibbon, CockpitProgression/Collector/Memory) did not crash. Known latent same-shape candidate OFF the cockpit route: `WalletBadge` in `LivePurchase.tsx` (`/join`); leave it unless a connected-wallet crash actually surfaces there.

**Repro caveat:** you cannot reproduce this with the `?cockpit=` DEV fixtures — they are `import.meta.env.DEV`-gated and DEV is `false` in every build (see cockpit-dev-fixtures.md). Verify by publishing and loading the live `/my-syndicate` with a connected wallet — the only environment where it ever reproduced.
