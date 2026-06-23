# Operational Memory Ledger

Last updated: 2026-06-23

Status: operational first-read for synchronization, release, deployment,
environment, Git, Replit, sandbox, credential, and handoff work.

This ledger records the operational facts, repeated mistakes, environment
limits, sync failures, and workflow rules that The Syndicate must not
rediscover in future chats or future sprints.

This file has no deployment authority. It does not authorize contract
transactions, source activation, registry switches, Replit publishes, or
production claims. It is process memory.

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

## 5. Required Pre-Work Operational Truth Check

Before any implementation, release, sync, or handoff sprint:

1. Confirm the exact workspace path.
2. Confirm the folder is a real Git checkout.
3. Confirm the latest local commit.
4. Confirm whether local state matches GitHub main.
5. Confirm whether the worktree is clean or intentionally dirty.
6. Confirm whether the current clone can be written and pushed.
7. Confirm whether Replit production is current, lagging, paused, or unknown.
8. Confirm whether the task requires live-site QA or can stay local.
9. Confirm whether secrets/RPC values are needed and whether they are available
   without being exposed.
10. Confirm the validation command required for the batch.

If any of these cannot be confirmed, report the unknown before presenting the
work as synchronized.

## 6. Required Post-Work Sync Workflow

For a GitHub/Replit-facing batch:

1. Re-read intended changed files.
2. Confirm no generated or unrelated files are included.
3. Run targeted tests if the batch has a focused risk.
4. Run `npm run check-release`.
5. Commit only intended files.
6. Push to GitHub main from an authenticated path.
7. Replit pulls the exact GitHub commit.
8. Replit runs `npm run check-release`.
9. Replit publishes only if green.
10. Live QA checks the relevant routes and states.
11. Final report names GitHub commit, Replit status, live QA result, and any
    manual checks still needed.

If push or Replit publish is blocked, say so plainly. Do not imply the batch is
live.

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
