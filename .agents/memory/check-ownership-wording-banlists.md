---
name: check-ownership-wording banlist false-positives
description: Why definitional banlist files trip the ownership-wording guard, how to allow-list them safely, and that this guard must be in your verification set.
---

# check-ownership-wording: banlist files + verification

`scripts/check-ownership-wording.mjs` is a doctrine guard NOT bundled in
`check-release.mjs`. It is easy to forget — run it explicitly as part of
verification on any vocabulary/public-copy task, and beware: piping its output
through `tail -N` hides the earlier failures (it prints ALL findings at once).

## The false-positive class
Files that DEFINE banlists (a literal array of banned terms) trip the guard on
their own definitions:
- `src/lib/protocol-language.ts` → `FORBIDDEN_LANGUAGE = [...]` (long array; the
  declaration line carrying "FORBIDDEN" sits OUTSIDE the guard's 3-line denial
  lookback window, so entries like "dividends"/"passive income" read as claims).
- `src/lib/protocol-event-registry.ts` → `REFERRAL_FORBIDDEN` (`forbiddenVocab`)
  — even WITH the declaration in-window, the underscore in `REFERRAL_FORBIDDEN`
  is a word char, so the guard's `\bforbidden\b` denial hint never matches.

## The fix (established pattern)
Add such files to `EXCLUDE_FILES` in the guard — the same mechanism already used
for `chronicle-entries.ts`, `data-verification-registry.ts`, `execution-gates.ts`.
**Why:** these are pure-data definitional/registry leaves, not public copy.
**How to apply:** prefer whole-file EXCLUDE over rewriting the guard's detection
(over-build for a leaf problem).

## Restore the coverage you removed
EXCLUDE turns off scanning for the WHOLE file, including any real human-facing
`label`/`description` strings it also holds (registry files often do). Restore
vocabulary coverage with a cheap leaf-level test that runs
`findForbiddenLanguage(text)` (from `protocol-language.ts`) over those strings —
see `protocol-event-registry.test.ts` "uses no forbidden vocabulary..." case.
`FORBIDDEN_LANGUAGE` is a tight list (investment/roi/yield/dividend(s)/passive
income/guaranteed return(s)/fundraising/raised/verified identity/kyc) — it does
NOT ban bare "reward"/"contribution", so disclaimer phrasing ("No reward is
implied", "growth contribution") stays clean.
