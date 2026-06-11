---
name: Windowed "first/earliest" truthfulness
description: Deriving a protocol-wide "first ever" claim from a truncated, newest-first event window is a fabricated claim — phrase window-relative unless the scan is gapless.
---

# Windowed "first-of-kind" claims must not assert a protocol-wide first

`useProtocolEvents({ limit })` returns a NEWEST-FIRST, truncated slice of the
canonical event stream. The oldest event of a kind *inside that window* is NOT
necessarily the protocol's first occurrence of that kind.

**Rule:** Any derivation that elevates / labels the earliest-in-window event
(e.g. `deriveChronicleCandidates` first-of-kind elevation) must NOT emit copy
like "First X recorded by the protocol" by default. Default wording is
window-relative ("Earliest X in the current sample."). A genuine protocol-wide
first may only be asserted when the caller proves the window is a gapless,
full-history scan — pass an explicit opt-in (`{ windowComplete: true }`).

**Why:** Core doctrine is "never invent a value / don't claim what you can't
verify." A windowed sample cannot verify protocol-wide firstness; asserting it
is fabrication even on an internal /labs surface. Caught by architect review in
the Sprint 2 (Protocol Memory) foundation work.

**How to apply:** Whenever you compute "first", "earliest", "latest", "newest",
"#1", or a count-since-genesis from a `useProtocolEvents`/limited query, ask "is
this window complete?" If not, scope the claim to the sample or gate it behind a
completeness flag. The worthiness/advisory ranking can still elevate first-in-
window (it is curated downstream); only the human-readable CLAIM must stay
truthful.
