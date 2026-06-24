# Production Synchronization Doctrine

Last updated: 2026-06-24

Status: OPERATIONAL DOCTRINE / NO DEPLOYMENT AUTHORITY / NO PUBLISH AUTHORITY

This document defines how The Syndicate keeps GitHub, Replit, production,
on-chain state, local preview, documentation, tests, and read models aligned.

It does not authorize contract deployment, source creation, source activation,
referral activation, claim UI, registry switches, public source links, wallet
signing, funding, recovery, Replit publish, or production claims. It is the
decision system for when those surfaces must be synchronized, validated,
published, read back, or left alone.

## 1. Purpose

The Syndicate now has multiple legitimate truth surfaces:

- GitHub main
- Codex local clones
- GitHub Desktop clones
- Replit workspace
- Replit deployment artifact
- live production at `thesyndicate.money`
- Avalanche C-Chain contracts
- canonical docs
- operational docs and runbooks
- local preview / localhost
- tests and release gates
- read models, caches, and indexed events

Those surfaces can diverge. Divergence is not automatically a failure; it
becomes a failure when the team collapses one state into another.

This doctrine prevents that collapse.

## 2. Source-Of-Truth Model

| Surface | What it proves | What it does not prove | Required language |
| --- | --- | --- | --- |
| GitHub main | Canonical implementation source after push. | Replit pulled it, production serves it, or on-chain state changed. | "GitHub truth." |
| Codex local clone | Work in progress and local validation. | Delivery, production, or Replit alignment. | "Local only" until pushed. |
| GitHub Desktop clone | Authenticated sync route when clean/current. | Production publish or on-chain state. | "Desktop clone at commit X." |
| Replit workspace | Production workspace source after pull. | Published live site. | "Replit pulled X." |
| Replit deployment | Built deployment artifact and server process. | Route-specific doctrine correctness. | "Deployment built/published." |
| Live production | What visitors currently see and can interact with. | GitHub is current, Replit has no local drift, or chain state is correct. | "Production verified by route QA." |
| On-chain state | Current contract truth after live readback. | Frontend readiness or public activation. | "Current authority readback." |
| Documentation | Doctrine, plans, runbooks, lineage, and operational memory. | Production state or chain state unless backed by current proof. | "Doc authority class X." |
| Tests / release gates | Local or CI confidence for code and copy. | Production or wallet behavior unless the relevant environment is tested. | "Validation passed." |
| Local preview | Developer render/runtime proof. | Production QA. | "Local preview only." |

Completion states must be reported separately:

- local success: files changed, tests passed, local commit exists
- GitHub success: GitHub main contains the commit
- Replit workspace success: Replit pulled and validated the commit
- Replit deployment success: Replit built and published the deployment
- production success: live routes were checked and matched doctrine
- on-chain success: current authority readback matched expected state

## 3. Change Classification Matrix

| Change class | Examples | Replit pull | Publish | Live QA | Route QA | Wallet/write QA | Current-authority readback | Founder approval | Can Codex continue without Replit? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Docs-only / guard-only | Doctrine, runbooks, ledgers, tests that do not change runtime. | Optional unless provenance alignment is requested. | Not needed. | Not needed. | Not needed unless public docs routes changed. | No. | No unless ceremony-adjacent. | Usually no. | Yes after GitHub push. |
| Code but not runtime-visible | Internal helpers, unused config, test-only utilities. | Optional until bundled with runtime change. | Usually not needed. | No. | No. | No. | No unless it reads chain state. | Usually no. | Yes after GitHub push. |
| Runtime UI change | Component/layout/copy rendered on public routes. | Required before production claim. | Required for public site. | Required. | Changed routes plus base smoke. | No unless wallet flow touched. | No unless live chain state shown. | Depends on sensitivity. | Yes for more coding, but production remains stale. |
| Public copy / doctrine surface | Homepage, Join, Transparency, Registry, Docs, Whitepaper, FAQ. | Required before production claim. | Required if public copy should change. | Required. | Changed routes and route-specific doctrine checks. | No unless buy/claim/signing copy changed. | If copy describes chain state. | Required for sensitive claims. | Yes if not claiming production. |
| Route / navigation / sitemap wiring | New route, header link, sitemap, redirect. | Required before route is live. | Required. | Required. | New route, linked routes, 404/redirect checks. | No unless route includes wallet action. | No unless route claims chain state. | Usually yes for public route launch. | Yes, but route is not production-live. |
| Payment / write-path frontend | Buy flow, approval spender, mint, claim, source-aware buy, recovery UI. | Required. | Required after approval. | Required. | Full affected route set. | Required on test/founder wallet path where safe. | Required for contract addresses, pause state, source state, balances. | Required. | No public confidence until Replit and wallet QA. |
| Contract interaction / read model | New reads, cache/indexing, Activity/Register/My Syndicate chain data. | Required if surfaced publicly. | Required if public. | Required. | Read surfaces and reload/cache behavior. | No unless writes exist. | Required for read addresses and expected values. | Depends on risk. | Yes for local follow-up only. |
| On-chain transaction | Deployment, ownership, pause, funding, recovery, source creation, activation. | Not by itself. | Not by itself. | Only if public copy/read model changes. | Affected proof routes after docs/UI update. | Founder signs only after ceremony. | Mandatory immediately before and after. | Mandatory. | Yes after readback/docs commit, if no public UI change. |
| Activation / public availability boundary | Referral activation, source ACTIVE, claim UI, public source links, registry switch. | Required if frontend changes. | Required after all gates. | Required. | Full module route set and base smoke. | Required where wallet path exists. | Mandatory. | Mandatory explicit approval. | No activation confidence without Replit and production QA. |
| Hotfix | Small production fix for broken route/build/copy. | Required if fixing production. | Required if visitor-facing. | Required on broken route and base smoke. | Required. | If write path involved. | If chain state involved. | Founder informed; approval if sensitive. | Only after GitHub push and publish plan. |
| Emergency rollback | Revert route, disable feature, restore safe copy. | Required if production-facing. | Required after validation. | Required. | Rolled-back routes and base smoke. | If write path affected. | If contract state involved. | Required if user funds/activation affected. | No production confidence until live QA. |

## 4. Replit Pre-Pull Protocol

Before Replit pulls GitHub main, Replit must report:

1. current commit
2. current branch
3. `git status`
4. local uncommitted changes, if any
5. whether those changes are intentional fixes, generated/noise, or unknown
6. whether any local change touches runtime, contracts, secrets, env, build
   output, routes, wallet logic, or public copy

Replit must not overwrite local changes silently.

If local changes are intentional production fixes:

1. explain the diff
2. validate the fix
3. push back to GitHub only as an intentional commit
4. report the pushed commit

If local changes are generated or noise:

1. name the files
2. explain why they are noise
3. clean or discard safely
4. then pull GitHub main

Replit must never push stale state, generated files, local environment files,
old production code, or accidental formatting back to GitHub.

## 5. Replit Validation Protocol

Minimum validation before any production publish:

```bash
npm run check-release
```

Additional checks depend on the change class:

- focused guards for the touched module
- production build confirmation
- route status checks
- route-specific copy/doctrine checks
- wallet/write-path QA for payment, claim, mint, source-aware, or approval flows
- current-authority chain readbacks when public copy or frontend behavior
  depends on on-chain state
- cache/reload checks when Activity, Holder Index, My Syndicate, Register, or
  Chronicle read models are affected

Validation passing in Replit means Replit workspace is healthy. It does not
mean production is current until publish and live QA pass.

## 6. Publish Decision Protocol

Publish is required when:

- a runtime UI change should become public
- public copy/routes/navigation/sitemap changed
- a payment/write path changed
- contract reads shown to users changed
- a bug fix must reach visitors
- an activation has been separately approved and all on-chain/readback gates
  passed

Publish is optional when:

- the batch is docs-only or guard-only
- the batch affects internal tests only
- GitHub provenance alignment is desired but visitors do not need a changed
  runtime

Publish is not needed when:

- the change is operational documentation only
- no public route/build artifact changed
- no current production claim depends on it

Publish is forbidden until separate approval when:

- the change would create or imply source/referral activation
- the change would expose claim UI
- the change would switch registry or payment targets
- the change would enable non-zero public source paths
- the change would present future systems as live
- current-authority readback required for the action has not passed

## 7. Live QA Protocol

Live QA must verify behavior and doctrine, not only HTTP 200.

Base smoke route set:

- `/`
- `/join`
- `/my-syndicate`
- `/activity`
- `/transparency`
- `/registry`
- `/referral`
- `/tokenomics`
- `/whitepaper`
- `/roadmap`
- `/evolution`
- `/nft`

The checked route set must expand to match the changed surfaces.

Module-specific examples:

| Module | Additional checks |
| --- | --- |
| Membership / sale | `/join`, approval spender, buy target, `ZERO_SOURCE_ID`, historical-member guard, quote, receipt, error states. |
| Source / referral | `/referral`, source observability surfaces, no public source link unless approved, no claim UI unless approved, source status copy. |
| Protocol Evolution | `/evolution`, `/roadmap`, docs links, evidence-backed statuses, no feedback form or activation action. |
| Archive / NFT | `/nft`, `/archive`, mint/claim state by artifact ID, no marketplace/floor/volume drift. |
| My Syndicate | `/my-syndicate`, connected/disconnected states, cache reload, member status, economy sections. |
| Transparency / treasury | `/transparency`, Protocol Economy, routing copy, no fake accounting dashboards. |
| Activity / Register / Chronicle | `/activity`, `/registry`, `/chronicle`, event labels, proof links, no stale source labels. |
| Future commerce modules | relevant module route, payment target, source attribution support, receipt schema, activation status. |

Every live QA report must say what was checked, what was not checked, and
whether console/log inspection was automated, manual, or still pending.

## 8. Replit Push-Back Protocol

Replit may push back to GitHub only when all are true:

1. Replit made an intentional production fix.
2. The diff is small, reviewed, and explained.
3. Generated files, build output, caches, secrets, and local env files are
   excluded.
4. `npm run check-release` passes or the failure is explicitly scoped and
   accepted for an emergency.
5. The commit message explains why Replit changed GitHub truth.
6. Founder/Codex can review the final commit.

Replit must not push back:

- stale workspace state
- generated output
- `.output`, `node_modules`, `contracts/out`, `contracts/cache`, screenshots,
  ZIPs, reports, or unrelated files
- secrets, RPC URLs, private keys, signer exports, or environment files
- old production code that overwrites newer GitHub truth
- unreviewed emergency edits

GitHub wins unless Replit is making a clear, intentional, validated production
fix.

## 9. Codex After-Replit Protocol

After Replit reports:

1. If Replit pushed no commit, Codex continues from the current GitHub main.
2. If Replit pushed a commit, Codex must pull/fetch it before new work.
3. Codex confirms current GitHub commit and local clean status.
4. Codex reports GitHub, Replit, production, and on-chain status separately.
5. Codex does not rely on old chat memory if Replit or production state changed.
6. Codex continues only from the aligned baseline or explicitly reports the
   remaining divergence.

If production-facing work is next, Codex should plan Replit sync/publish as a
coherent release batch. If the next work is docs-only or internal, Replit can
wait unless provenance alignment is requested.

## 10. Final Reporting Standard

Every sync, publish, hotfix, activation-adjacent, or production-facing report
must include:

- starting GitHub commit
- ending GitHub commit
- Replit starting commit, if Replit was involved
- Replit ending commit, if Replit was involved
- local changes before pull
- files changed
- validation commands and results
- publish result
- live route QA result
- wallet/write-path QA result, if relevant
- current-authority chain readback, if relevant
- whether Replit pushed back to GitHub
- final GitHub/Replit/production/on-chain status
- unresolved risks or manual checks
- explicit no-transaction/no-deployment/no-activation statement when those
  boundaries apply

## 11. Anti-Drift Rules

1. Never treat docs as production.
2. Never treat GitHub as production.
3. Never treat Replit workspace as published site.
4. Never treat HTTP 200 as doctrine correctness.
5. Never treat contract deployment as product activation.
6. Never treat on-chain transaction as frontend readiness.
7. Never treat local preview as production QA.
8. Never push stale Replit state to GitHub.
9. Never publish without knowing what changed.
10. Never make public claims from future plans.
11. Never collapse deployment, funding, registry switch, UI publish, and
    activation into one word.
12. Never call source policy existence "referral live."
13. Never call a source record "source activation" unless status and public
    surfaces are separately approved and verified.
14. Never call wallet approval a purchase.
15. Never expose secrets, RPC URLs, private keys, signer exports, or local env
    files in reports, commits, bundles, or chat.

## 12. Recommended Replit Instruction Shape

Use this shape when asking Replit to align production:

```text
GitHub main is the source of truth at <commit>.

Before pulling, report current commit and git status. Do not overwrite local
changes silently. If local changes are intentional fixes, explain them and push
them back only after validation. If they are generated/noise, explain and clean
them safely.

Pull GitHub main. Run npm run check-release. Publish only if green and only if
this change class requires production publish. After publish, run route-specific
live QA for the changed surfaces plus the base smoke routes. Report starting
commit, ending commit, local changes, validation, publish result, live QA,
Replit-made changes, and whether anything was pushed back to GitHub.

Do not change contracts, sign transactions, expose secrets, activate future
systems, or invent features during sync.
```

## 13. Relationship To Existing Memory

This document operationalizes:

- `docs/OPERATIONAL_MEMORY_LEDGER.md`
- `docs/RELEASE_HANDOFF.md`
- `docs/DOCUMENTATION_AUTHORITY_MAP.md`
- `docs/ACTIVATION_RUNBOOK.md`
- `docs/PROTOCOL_EVOLUTION_LAYER_ARCHITECTURE.md`
- `docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md`

If those docs and this doctrine disagree, use the higher-authority document for
its domain:

- on-chain actions: current chain readback and transaction runbooks win
- documentation classification: `docs/DOCUMENTATION_AUTHORITY_MAP.md` wins
- operational sync and publish decisions: this doctrine wins
- historical explanation: ledgers explain lineage, not current authority

Update this doctrine whenever a new production synchronization failure repeats
or a new module introduces a new class of publish/readback risk.
