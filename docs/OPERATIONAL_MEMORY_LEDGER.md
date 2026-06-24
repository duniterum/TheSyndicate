# Operational Memory Ledger

Last updated: 2026-06-24

Status: operational first-read for synchronization, release, deployment,
environment, Git, Replit, sandbox, credential, and handoff work.

This ledger records the operational facts, repeated mistakes, environment
limits, sync failures, and workflow rules that The Syndicate must not
rediscover in future chats or future sprints.

This file has no deployment authority. It does not authorize contract
transactions, source activation, registry switches, Replit publishes, or
production claims. It is process memory.

Primary synchronization doctrine: `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`.
Use that document to classify whether a batch requires Replit pull, production
publish, live route QA, wallet/write-path QA, current-authority readback, or
founder approval.

## 1. Purpose

The Syndicate already records smart-contract lessons in
`docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md`. This ledger does the
same for operations.

Operational mistakes are not small. A stale workspace, blocked push, missed
Replit publish, wrong folder, incomplete dependency tree, or patch-file handoff
can create real product drift. Production velocity is a protocol resource. It
should be protected with the same seriousness as contract safety.

Goals:

- prevent rediscovering known environment realities
- prevent repeating synchronization mistakes
- reduce founder manual work
- reduce Replit/GitHub drift
- keep GitHub, Replit, production, and Codex aligned
- make environment limitations explicit instead of hidden
- preserve delivery velocity without weakening release discipline

## 2. Entry Template

Use this template for every new operational lesson, repeated discovery,
environment limitation, credential issue, sync failure, Replit issue, release
mistake, sandbox boundary, patch-file handoff, or production process failure.

```text
ID:
Title:
Date discovered:
System:
Severity:
Status:
Category:
Affected surfaces:
Symptom:
Root cause:
Why it mattered:
Fix:
Process guard:
Founder-work impact:
Release implication:
Future "never again" rule:
Source links / commit hashes:
```

Severity guide:

- Critical: can publish stale truth, route users to the wrong contract, lose
  canonical work, or require a founder transaction/sync repair.
- High: can block development, block pushes, create GitHub/Replit divergence,
  or leave production behind current truth.
- Medium: can waste time, require patch handoffs, or cause repeated local setup
  work.
- Low: documentation or workflow clarity issue with limited production risk.

Status guide:

- Resolved: fixed and guarded.
- Partially resolved: known and documented, but still depends on manual
  discipline or external access.
- Open: unresolved.
- Deferred: intentionally parked with a known owner or prerequisite.

## 3. Standing Operating Rules

1. GitHub main is the canonical implementation truth.
2. Replit is the production deployment surface for `thesyndicate.money`.
3. A live site is not proven current until Replit has pulled GitHub main,
   release checks pass, production is published, and live routes are checked.
4. Desktop export folders are not authoritative unless they are verified as a
   real Git checkout at the expected commit.
5. Always confirm the exact repository path before editing.
6. Always confirm the current commit before implementation, commit, publish, or
   handoff work.
7. A sandbox can have different filesystem, credential, ownership, network, and
   wallet access than the founder machine.
8. GitHub Desktop clones may be readable but not writable from the sandbox.
9. Windows Git may block pushes because of credential or ownership boundaries.
10. Patch-file handoffs are a last resort, not the default delivery path.
11. Never commit `.output`, `node_modules`, `contracts/out`,
    `contracts/cache`, generated build artifacts, screenshots, ZIPs, or
    unrelated files.
12. Run `npm run check-release` before any release-worthy commit or publish
    request.
13. Do not request Replit publish until a coherent batch is complete and
    validated.
14. Do not ask the founder to do manual sync work until the agent has exhausted
    safe local/GitHub-ready options.
15. If push or write access is blocked, report the exact blocker, local commit,
    affected files, and safest founder action.
16. Local validation, GitHub sync, Replit publish, and production verification
    are four different completion states. Report them separately.
17. When a sprint is expected to end in GitHub synchronization, evaluate push
    capability before starting implementation or before declaring the batch
    blocked.
18. Current authority beats remembered authority. Before any transaction,
    deployment, funding, recovery, registry, ownership, source, referral,
    activation, publish, or production action, rebuild current truth from
    live readbacks and repository state instead of relying on memory,
    historical docs, or stale chat context.
19. Classify every batch before asking Replit to pull or publish. Use
    `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md` to decide whether the change
    is docs-only, runtime-visible, public-copy, route/wiring, payment/write
    path, contract-interaction, on-chain, activation-boundary, hotfix, or
    rollback work.

## 4. Operational Lessons

### OML-001 - GitHub main is canonical implementation truth

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through 2026-06 |
| System | GitHub / Codex / Replit |
| Severity | Critical |
| Status | Resolved as process doctrine; must remain guarded |
| Category | Source of truth |
| Affected surfaces | GitHub main, Codex local clones, Replit source, production |
| Symptom | Work can drift when Codex, Replit, and production are treated as interchangeable. |
| Root cause | Multiple working surfaces exist, but only one can be canonical. |
| Why it mattered | A stale Replit or desktop folder can overwrite newer product truth. |
| Fix | GitHub main is the canonical implementation source. Replit pulls from GitHub. Codex must start from GitHub truth or explicitly report divergence. |
| Process guard | Confirm commit hash and clean status before work. |
| Founder-work impact | Prevents manual reconciliation after stale syncs. |
| Release implication | Replit publish should follow GitHub main, not local exports. |
| Future "never again" rule | Never overwrite GitHub with stale Replit or desktop-export code. |

### OML-002 - Replit production can lag GitHub truth

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through V3 frontend cutover |
| System | Replit / production |
| Severity | Critical |
| Status | Resolved as process doctrine; live QA remains required |
| Category | Production sync |
| Affected surfaces | Replit source, Replit deployment, `thesyndicate.money` |
| Symptom | GitHub can be correct while the live site still serves old copy or old buy targets. |
| Root cause | GitHub commit, Replit pull, release gate, publish, and live route QA are separate events. |
| Why it mattered | Public `/join` could target stale sale state or teach stale doctrine. |
| Fix | Publish sequence is: pull GitHub main, run `npm run check-release`, publish only if green, then live QA. |
| Process guard | Release handoff and live QA checklist must name GitHub commit and live routes checked. |
| Founder-work impact | Avoids repeated "is production current?" uncertainty. |
| Release implication | Never claim live truth from GitHub alone. |
| Future "never again" rule | GitHub green is not production green until Replit publish and live route checks pass. |

### OML-003 - Desktop export folders are not authoritative

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through Replit/GitHub sync work |
| System | Local filesystem |
| Severity | High |
| Status | Resolved as process doctrine |
| Category | Workspace identity |
| Affected surfaces | Desktop exports, GitHub Desktop clone, Codex workspace |
| Symptom | A folder can look like the project but not be a real current Git checkout. |
| Root cause | Exported or copied folders preserve files but not reliable Git authority. |
| Why it mattered | Edits in a stale export create patch handoffs and drift. |
| Fix | Verify `git status`, `git rev-parse --show-toplevel`, and latest commit before treating a folder as canonical. |
| Process guard | If a folder is not a valid Git repo, do not treat it as source of truth. |
| Founder-work impact | Prevents founder from manually merging stale exported files. |
| Release implication | Replit should pull GitHub, not desktop exports. |
| Future "never again" rule | A folder path is not authority; a verified Git commit is authority. |

### OML-004 - Sandbox access differs from founder machine access

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through local validation and sync attempts |
| System | Codex sandbox / Windows host |
| Severity | High |
| Status | Open environmental constraint |
| Category | Sandbox boundary |
| Affected surfaces | Filesystem, Git, RPC secrets, GitHub Desktop clone, browser/session state |
| Symptom | Codex may read a path but fail to write it, or validate locally but fail to push. |
| Root cause | Sandbox permissions, Windows ownership, credentials, and secret access differ from the founder account. |
| Why it mattered | Work can be correct but unsynced; retrying blindly wastes time. |
| Fix | Report the exact boundary and produce the safest handoff only when direct sync is blocked. |
| Process guard | Check write access and Git push path before promising a pushed commit. |
| Founder-work impact | Avoids surprise manual patch application. |
| Release implication | A local green result does not mean GitHub/Replit received it. |
| Future "never again" rule | Never assume sandbox access equals founder machine access. |

### OML-005 - Git ownership and credential boundaries can block Git operations

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-23 |
| System | Git on Windows |
| Severity | High |
| Status | Open environmental constraint |
| Category | Git / credentials |
| Affected surfaces | `.codex-canonical-work`, GitHub Desktop clone, push workflow |
| Symptom | Git reported dubious ownership for the working clone and earlier push attempts failed with Windows credential errors. |
| Root cause | The sandbox user, Windows founder user, and Git credential store are not always the same security context. |
| Why it mattered | A validated local commit may not be pushable from Codex. |
| Fix | Use per-command safe-directory only for local inspection. Do not mutate global founder Git config without approval. If push remains blocked, report local commit and patch path. |
| Process guard | Prefer validated commits in an authenticated GitHub Desktop/Replit path. Treat patch files as fallback. |
| Founder-work impact | Prevents repeated failed push loops and unclear sync status. |
| Release implication | GitHub main is unchanged until a push from an authenticated context succeeds. |
| Future "never again" rule | If Git rejects ownership or credentials, stop retry loops and report the boundary clearly. |

### OML-006 - Patch-file handoffs create founder work

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through GitHub Desktop write-boundary work |
| System | Patch handoff / Git sync |
| Severity | Medium |
| Status | Partially resolved |
| Category | Handoff overhead |
| Affected surfaces | Founder workflow, GitHub Desktop, Codex local commits |
| Symptom | When Codex cannot write or push the canonical clone, founder must apply patches manually. |
| Root cause | Sandbox write or credential limits. |
| Why it mattered | Patch handoffs slow production velocity and increase merge risk. |
| Fix | Prefer direct GitHub commit/push or Replit-to-GitHub fix push. Use patch files only when blocked. |
| Process guard | If a patch file is unavoidable, include commit hash, files changed, validation result, and exact apply path. |
| Founder-work impact | Minimizes manual synchronization and reduces cognitive load. |
| Release implication | Patch-applied work still needs release gate after application. |
| Future "never again" rule | Do not normalize patch handoffs as the main workflow. |

### OML-007 - Dependency state must not be guessed

| Field | Detail |
| --- | --- |
| Date discovered | Repeated during fresh clone validation |
| System | Node dependencies / release gate |
| Severity | Medium |
| Status | Resolved as process doctrine |
| Category | Local setup |
| Affected surfaces | `node_modules`, package manager, release checks |
| Symptom | A fresh clone can fail tests or typecheck because dependencies are incomplete or absent. |
| Root cause | Local dependency folders are not source truth and may differ between workspaces. |
| Why it mattered | A false failure can look like a code regression. |
| Fix | Use declared dependencies and `npm install` when needed. Do not commit dependency folders. |
| Process guard | Verify install state before interpreting validation failures. |
| Founder-work impact | Gives beginner-safe install instructions instead of assuming developer knowledge. |
| Release implication | Replit should install dependencies from lockfiles, not receive `node_modules`. |
| Future "never again" rule | Never treat local `node_modules` as canonical project state. |

### OML-008 - Coherent batches protect velocity

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through product and V3 phases |
| System | Planning / release management |
| Severity | Medium |
| Status | Resolved as operating principle |
| Category | Delivery cadence |
| Affected surfaces | GitHub commits, Replit publishes, founder review |
| Symptom | One-file micro-sync loops create overhead and increase coordination failure. |
| Root cause | Treating every small observation as an immediate release event. |
| Why it mattered | Founder attention and production publish cycles are scarce resources. |
| Fix | Work in coherent batches, validate once, commit once, then sync/publish once. |
| Process guard | Do not ask for Replit sync or publish until the batch is coherent and green. |
| Founder-work impact | Reduces repeated context switching and manual publish requests. |
| Release implication | Release notes and live QA are clearer. |
| Future "never again" rule | Batch related changes unless a production blocker demands a narrow hotfix. |

### OML-009 - Live QA must be route-specific

| Field | Detail |
| --- | --- |
| Date discovered | Repeated through V3 public truth cleanup |
| System | Production QA |
| Severity | High |
| Status | Resolved as process doctrine |
| Category | Live verification |
| Affected surfaces | `/`, `/join`, `/transparency`, `/my-syndicate`, `/referral`, `/registry`, `/nft` |
| Symptom | A site can return 200 while still serving stale route-specific truth. |
| Root cause | Health checks prove uptime, not doctrine or flow correctness. |
| Why it mattered | Stale buy targets, referral copy, or future-state labels can survive a successful deploy. |
| Fix | Live QA must name checked routes and critical truth assertions. |
| Process guard | Post-publish report must include route list, HTTP status, and specific truth checks. |
| Founder-work impact | Avoids vague "published" confirmations. |
| Release implication | Production is accepted only after route-level checks. |
| Future "never again" rule | Uptime is not product truth. |

### OML-010 - Operational memory belongs in the repository

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-23 |
| System | Documentation / institutional memory |
| Severity | Medium |
| Status | Resolved by this ledger |
| Category | Memory system |
| Affected surfaces | Docs, release process, future Codex chats |
| Symptom | Known environment facts were being rediscovered across sprints. |
| Root cause | Operational lessons lived in chat history instead of repository canon. |
| Why it mattered | Future agents and future chats cannot reliably inherit chat-only memory. |
| Fix | Create this ledger and guard it through production coherence tests. |
| Process guard | Update this ledger when operational facts change. |
| Founder-work impact | Reduces repeated explanations and manual context reconstruction. |
| Release implication | Operational risks become inspectable before sync/publish work. |
| Future "never again" rule | If an operational mistake costs time twice, record it here. |

### OML-011 - Local validated commits are not delivery

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-23 |
| System | GitHub sync / Codex / GitHub Desktop |
| Severity | High |
| Status | Resolved by authenticated Desktop-clone sync; permanently guarded by process |
| Category | Completion boundary / synchronization |
| Affected surfaces | Local Codex clone, GitHub Desktop clone, GitHub main, Replit pull boundary |
| Symptom | Two validated local commits (`26038b0` and `bd7b5bc`) were initially reported as blocked because direct push from the sandbox failed with `SEC_E_NO_CREDENTIALS`; later they were successfully synchronized by fetching from the local Codex clone into the authenticated GitHub Desktop clone, cherry-picking, validating, and pushing. |
| Root cause | The first sync attempt stopped at the local Git credential failure instead of exhausting all authenticated synchronization paths available on the machine. |
| Why it mattered | Local-only commits are invisible to GitHub, cannot be pulled by Replit, and create a false sense of completion. Patch-file handoff would have pushed avoidable manual work onto the founder. |
| Fix | Used the authenticated GitHub Desktop clone at the same base commit, fetched the local commit chain from `.codex-canonical-work`, cherry-picked the two commits, ran `npm run check-release`, and pushed GitHub main to `c6899065922d8f476438854fdc6aaa354d47af16`. |
| Process guard | Before declaring sync blocked, check direct Git push, GitHub Desktop clone fetch/cherry-pick path, GitHub connector/API path, GitHub CLI availability, SSH/token availability, and Replit/GitHub sync options where relevant. |
| Founder-work impact | Founder manual patch application was avoided. Future founder action must not be requested until authenticated paths are truly exhausted. |
| Release implication | Replit can pull only after GitHub main receives the commits. Validation in a local-only clone is not release completion. |
| Future "never again" rule | Patch handoff is not a valid completion path until every safe authenticated sync path has been exhausted and the exact blocker is documented. |
| Source links / commit hashes | Local-only commits: `26038b0`, `bd7b5bc`. GitHub commits after authenticated sync: `24b0364`, `c6899065922d8f476438854fdc6aaa354d47af16`. Blocked command: `git push origin main` from `.codex-canonical-work`; blocker: `schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS`. |

### OML-012 - Current authority beats remembered authority

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-24 |
| System | Ceremony execution / live-state readbacks / operational truth |
| Severity | Critical |
| Status | Resolved by process guard; must be re-checked before every execution action |
| Category | Execution authority / institutional memory |
| Affected surfaces | Source ceremonies, deployment ceremonies, ownership changes, funding, recovery, registry switches, Replit publish, production activation, frontend truth |
| Symptom | A historical value, previous readback, or remembered owner/state can be mistaken for current execution authority after mainnet, GitHub, Replit, or production state has changed. |
| Root cause | Lineage and readback logs explain how the protocol arrived at a state, but they do not prove that state is still current at the moment of execution. |
| Why it mattered | A transaction signed from stale authority can target the wrong contract, use the wrong signer, create a duplicate source, activate the wrong path, publish stale frontend truth, or mislead the founder about what is live. |
| Fix | Add a Current Authority Check to ceremony runbooks and standing rules. Any execution action must rebuild current truth from live readbacks and current repository state immediately before action. |
| Process guard | Before any transaction/deployment/activation/funding/recovery/registry/ownership/source/referral/publish action, read current chain ID, contract bytecode, owner, pending owner, signer, target address, activation status, source count/status, frontend buy target, Replit state, and production state where relevant. Stop if any value differs from the packet or if the readback cannot be performed. |
| Founder-work impact | Prevents the founder from signing or publishing based on stale memory. Makes every ceremony auditable and reduces repeated "what is current?" reconstruction. |
| Release implication | A green historical report is not enough for execution. Final reports must say whether a value is lineage, prior readback, or current authority. |
| Future "never again" rule | Current authority always beats remembered authority. Lineage explains how we arrived here. Readbacks prove where we are now. Execution must use current truth: never remembered truth, never historical truth alone, never stale documentation alone. |
| Source links / commit hashes | Added after the first internal source packet froze values but before any source-record ceremony. The frozen packet remains pending until a fresh current-authority readback confirms it can still be executed safely. |

### OML-013 - Production synchronization requires change classification

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-24 |
| System | GitHub / Replit / production / release operations |
| Severity | High |
| Status | Resolved by production synchronization doctrine; must remain guarded |
| Category | Production synchronization / release classification |
| Affected surfaces | GitHub main, Replit workspace, Replit deployment, live production, on-chain state, docs, route QA, wallet QA |
| Symptom | The team repeatedly needed bespoke Replit instructions to decide whether a batch required pull-only, publish, route QA, wallet QA, source/readback checks, or no Replit action. |
| Root cause | GitHub success, Replit workspace success, Replit deployment success, production success, and on-chain success were known as separate states, but no reusable change-classification table existed. |
| Why it mattered | A docs-only batch could waste founder/Replit time if treated like a publish, while a runtime/payment/source/activation batch could create public drift if treated like docs-only work. |
| Fix | Created `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md` with the source-of-truth model, change classification matrix, Replit pre-pull protocol, validation protocol, publish decision protocol, live QA protocol, push-back protocol, Codex after-Replit protocol, final reporting standard, and anti-drift rules. |
| Process guard | Before Replit sync/publish or production-facing work, classify the batch using the doctrine. Reports must separate local, GitHub, Replit workspace, Replit deployment, production, validation, QA, and on-chain state. |
| Founder-work impact | Reduces one-off Replit prompts, avoids unnecessary publishes for docs-only work, and protects founder time during real runtime or wallet-flow releases. |
| Release implication | Publish decisions are no longer ad hoc: docs-only can wait, runtime UI needs publish and route QA, write paths need wallet QA, and on-chain actions need current-authority readback. |
| Future "never again" rule | Never ask Replit to pull, publish, push back, or skip publish without first naming the change class and the required validation/QA boundary. |
| Source links / commit hashes | Introduced after Protocol Evolution V1 route work, before the next production alignment pass. |

### OML-014 - Replit dev workflow watcher limits are not production failures

| Field | Detail |
| --- | --- |
| Date discovered | 2026-06-25 |
| System | Replit dev workflow / Vite / production publish |
| Severity | Medium |
| Status | Partially resolved by local Replit workaround; canonical repo unchanged unless a future sprint intentionally commits the fix |
| Category | Environment limitation / production QA interpretation |
| Affected surfaces | Replit development workflow, local preview, production publish reports, `vite.config.ts` local-only edits |
| Symptom | After syncing GitHub `12dc33f` and publishing successfully, Replit's dev workflow showed `ENOSPC: System limit for number of file watchers reached` while production build and live QA were green. |
| Root cause | Replit's inotify watcher cap was exhausted across running processes and growing local folders such as `.local`, `.pythonlibs`, `contracts`, `artifacts`, and reports. The failure came from the dev server's file-watching footprint, not the production bundle. |
| Why it mattered | A dev workflow failure can be misread as a production regression after a successful publish. Conversely, a local-only Replit fix can be lost on the next GitHub sync if it is not intentionally committed to canonical source. |
| Fix | Replit added a local-only `server.watch.ignored` workaround in `vite.config.ts` to stop the dev preview from watching non-frontend/generated/local directories. Production remained healthy and no GitHub push-back was needed because build/publish did not require a source fix. |
| Process guard | Distinguish Replit dev workflow health from publish/build/live-site health. If dev preview fails with `ENOSPC` after production publish succeeds, diagnose watcher pressure before treating it as code failure. If a `vite.config.ts` watch-ignore is needed repeatedly, decide explicitly whether to make it canonical. |
| Founder-work impact | Prevents unnecessary rollback or manual debugging when the live site is already healthy. Preserves the rule that Replit fixes are pushed back only when they are intentional canonical production fixes. |
| Release implication | Production can be accepted when publish build and live QA pass even if the Replit dev workflow needs an environment-only watch workaround. Reports must name the distinction. |
| Future "never again" rule | Do not collapse dev-server watcher exhaustion into production failure. Do not assume local-only Replit config edits survive future GitHub sync unless they are intentionally committed. |
| Source links / commit hashes | Replit sync from `30e16970` to GitHub canonical `12dc33fd8469c00d0cbcb429489254c59cbbf731`; production deploy checkpoint reported as `543e6665`; GitHub canonical unchanged because no production source fix was required. |

## 5. Required Pre-Work Operational Truth Check

Before any implementation, release, sync, or handoff sprint:

1. Confirm the exact workspace path.
2. Confirm the folder is a real Git checkout.
3. Confirm the latest local commit.
4. Confirm whether local state matches GitHub main.
5. Confirm whether the worktree is clean or intentionally dirty.
6. Confirm whether the current clone can be written and pushed.
7. If the sprint is expected to end in GitHub sync, confirm at least one
   authenticated sync path before starting or before declaring the work blocked.
8. Confirm whether Replit production is current, lagging, paused, or unknown.
9. Confirm whether the task requires live-site QA or can stay local.
10. Confirm whether secrets/RPC values are needed and whether they are available
   without being exposed.
11. Confirm the validation command required for the batch.
12. Classify the batch using `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`
    if GitHub/Replit/production/on-chain alignment may be affected.

If any of these cannot be confirmed, report the unknown before presenting the
work as synchronized.

For any execution action, add a current-authority readback before the founder
acts. At minimum, confirm the current chain ID, signer, target address,
contract owner, pending owner, activation state, relevant source count/status,
frontend buy target, Replit state, and production state. Historical readbacks
and packet values are lineage; they do not authorize execution by themselves.

## 6. Required Post-Work Sync Workflow

For a GitHub/Replit-facing batch:

1. Classify the change using `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`.
2. Re-read intended changed files.
3. Confirm no generated or unrelated files are included.
4. Run targeted tests if the batch has a focused risk.
5. Run `npm run check-release`.
6. Commit only intended files.
7. Push to GitHub main from an authenticated path.
8. Replit pulls the exact GitHub commit when the change class requires it or
   when provenance alignment is requested.
9. Replit runs `npm run check-release`.
10. Replit publishes only if the change class requires publish and validation
    is green.
11. Live QA checks the relevant routes and states when production changed.
12. Final report names GitHub commit, Replit status, live QA result, and any
    manual checks still needed.

If push or Replit publish is blocked, say so plainly. Do not imply the batch is
live. A report must distinguish:

- local success: files changed, tests passed, local commit exists
- GitHub success: GitHub main contains the commit
- Replit success: Replit has pulled and validated the commit
- production success: the live site is published and route-checked

## 7. Founder-Work Reduction Opportunities

- Prefer GitHub main as the handoff boundary over ZIPs or patch files.
- Keep Replit fixes small, intentional, and pushed back to GitHub.
- Group related product changes into coherent release batches.
- Include exact route QA checklists after publish, not vague review requests.
- Use local previews for visual QA, but do not confuse localhost with
  production.
- Keep environment variables in Replit Secrets or local private environment
  files, never in chat or committed files.
- When Codex cannot push, provide the exact blocker and the smallest safe next
  action.
- Before asking for founder manual action, exhaust authenticated sync paths such
  as GitHub Desktop clone fetch/cherry-pick, GitHub connector/API, GitHub CLI,
  SSH/token Git, and Replit/GitHub import paths when available.
- Keep recurring setup facts in this ledger so the founder does not need to
  restate them.

## 8. Additional Institutional Memory Categories

Smart contracts and operations now have ledgers. Future categories worth adding
when the need repeats:

- Product UX regression ledger: repeated confusion, hierarchy failures, route
  drift, first-impression issues, and conversion QA lessons.
- Live production incident ledger: cold starts, Replit outages, CDN issues,
  health-check noise, and post-publish observations.
- Documentation drift ledger: doctrine collisions, stale vocabulary, duplicate
  truths, and superseded public copy.
- Data/indexer ledger: purchase-event cache issues, Holder Index gaps, Activity
  scan anchors, and chain-read limitations.
- Founder decision ledger: explicit founder decisions that affect long-term
  protocol posture but are not smart-contract details.

Do not create these ledgers preemptively unless the same class of issue repeats
or a sprint explicitly requires it.

## 9. Test / Guard Map

| Operational memory | Existing guard | Status | Missing or suggested future guard |
| --- | --- | --- | --- |
| GitHub main canonical | This ledger, release handoff, production coherence guard | Guarded in docs/tests | Add a release script that prints expected GitHub commit before publish. |
| Replit can lag GitHub | This ledger, release handoff | Guarded by process | Add a Replit publish checklist artifact if publish drift repeats. |
| Desktop export not authoritative | This ledger | Guarded by process | Add a `scripts/check-workspace-authority.mjs` if stale-folder work repeats. |
| Sandbox and credential boundaries | This ledger | Guarded by process | Add a sync preflight script if blocked pushes continue. |
| No generated files | This ledger, release handoff | Guarded by docs/tests | Add a precommit generated-artifact scanner if needed. |
| Patch handoffs last resort | This ledger | Guarded by process | Add handoff template if patch handoffs remain unavoidable. |
| Local-only commits are not delivery | This ledger, release handoff, production coherence guard | Guarded in docs/tests | Add a sync preflight script if local-only commit loops repeat. |
| Production synchronization classification | `docs/PRODUCTION_SYNCHRONIZATION_DOCTRINE.md`, this ledger, release handoff, production coherence guard | Guarded in docs/tests | Add a script that prints required Replit/publish/QA class if production drift repeats. |
| Replit dev watcher limits are not production failures | This ledger, production synchronization doctrine's separate completion states | Guarded by process | If ENOSPC repeats, consider a canonical Vite dev watch-ignore for `.local`, `.pythonlibs`, `contracts`, `artifacts`, reports, and generated local state. |

## 10. Validation Policy

After updating this ledger:

- update `docs/DOCUMENTATION_AUTHORITY_MAP.md` if authority classification
  changes
- run the focused guard that references this file
- run `npm run check-release` for release-worthy changes
- commit only the ledger and intentional docs/tests
- do not commit `.output`, `node_modules`, `contracts/out`,
  `contracts/cache`, generated build artifacts, screenshots, ZIPs, or unrelated
  files

Suggested commit message for the initial ledger:

```text
Create operational memory ledger
```
