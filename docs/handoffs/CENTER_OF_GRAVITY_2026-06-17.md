# The Syndicate — Center of Gravity Determination

**Type:** Read-only determination. **No redesign, no implementation, no page moves, no new lab, no deletes, no renames.**
**Date:** 2026-06-17
**Trigger:** "Using the approved architecture board, identify the ONE visual center of gravity." (Senior product/design/founder review.)
**On the board:** Section **I — Center of Gravity** and Section **J — Five Systems**.

---

## The one-line answer

> **The center of gravity is the SEAT — member identity — rendered as the Member OS (`/my-syndicate`).**
> Everything else (economy, memory, proof, future) exists to give the seat meaning. The homepage is the *trailer that promises the seat*, not the destination.

- **One screen to remember:** the **Member OS** (`/my-syndicate`).
- **One symbol to remember:** the **Seat #** + the brand mark.
- **One emotional concept to remember:** **"I have a seat."**

This confirms and sharpens the working conclusion. The nuance worth holding: the *anchor concept* is the **Seat (belonging)**; the *anchor screen* is the **Member OS** (where the seat becomes tangible); they are one center expressed two ways.

---

## How it was decided (independent evaluation, not a vote)

Nine candidates scored 1–5 on six senior criteria. **Uniqueness** (can't be cloned / not generic) · **Emotion** (belonging pull) · **Legal safety** (no ROI/speculation read) · **Built** (already exists, low effort to anchor) · **Memorable** (the one thing recalled) · **Loop** (reason to return).

| Candidate | Unique | Emotion | Legal | Built | Memorable | Loop | Total |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| **Member OS (`/my-syndicate`)** | 5 | 5 | 5 | 5 | 4 | 5 | **29** |
| **Seat / member identity** | 5 | 5 | 5 | 4 | 5 | 4 | **28** |
| Homepage cockpit | 4 | 4 | 4 | 2 | 4 | 3 | 21 |
| Rank | 3 | 4 | 3 | 4 | 3 | 3 | 20 |
| Activity | 3 | 3 | 5 | 5 | 3 | 4 | 23 |
| Membership (category) | 4 | 4 | 5 | 3 | 3 | 3 | 22 |
| Chapter | 3 | 3 | 4 | 4 | 3 | 2 | 19 |
| NFT | 3 | 3 | 3 | 4 | 3 | 2 | 18 |
| Vault | 3 | 2 | 3 | 5 | 3 | 3 | 19 |

**Winner: Seat / Member OS** — the only candidate that is simultaneously unique, legally clean, already built, and the most memorable + highest return-loop.

**Why not the obvious alternatives:**
- **Vault** is the *legally riskiest* anchor — making the treasury the hero invites a "this is mine / yield" misread. It is protocol-controlled and never member-claimable; it must stay a *supporting* terminal, not the face.
- **NFT** carries the single biggest cross-site confusion (NFT ≠ membership). Anchoring on it would amplify the wrong mental model.
- **Homepage cockpit** is the **trailer** — it must *promise* the seat and funnel to Join. It is the public entry, not the place the product lives.
- **Activity** is the *aliveness proof* (great supporting signal) but it's ambient, not identity.

---

## The reframe that matters: systems, not pages (Section J)

The board's real revelation is that the protocol has been thinking in **~21 pages** when it should think in **5 systems**, with pages as *views*:

| System | Contains | Views (existing routes — no new ones) |
|---|---|---|
| **S1 · Identity** *(the core)* | Seat · Member # · Rank · Chapter | `/my-syndicate` · `/members` · `/ranks` · `/chapters` |
| **S2 · Economy** | Sale · Vault · Liquidity · Burn | `/join` · `/vault` · `/liquidity` · `/tokenomics` |
| **S3 · Memory** | Artifacts · Chronicle · Archive | `/nft` · `/archive` · `/activity` |
| **S4 · Proof** | Registry · Transparency · Contracts | `/registry` · `/transparency` · `/token` |
| **S5 · Future** | Referral · Marketplace · SeatRecord721 | `/referral` · `/roadmap` |

**Identity is the core; Economy, Memory, Proof, Future orbit it.** This is a *mental model*, not a migration — the routes don't move, but every design decision now answers to "which system is this a view of, and how does it serve the seat?"

---

## Confirmed sprint order (unchanged by this analysis — it reinforces it)

The center-of-gravity finding *validates* the sprint order already recommended. Anchoring on the seat means the safest, highest-leverage path is to (a) lock the brand, (b) make the public trailer promise the seat, then (c) make the seat's home unmissable.

| Sprint | Scope | Why it serves the anchor | Risk |
|---|---|---|---|
| **0 · Brand system** | favicon · token logo · social avatar · press kit · icon family (preferred rounded mark) | The seat needs one consistent symbol *before* 20 pages are touched, or you redesign twice | **None** (assets only) |
| **1 · Homepage cockpit** | un-hide ticker · lift existing economy engines · show belonging | The trailer that *promises the seat* and proves the economy is alive | Medium (composition) |
| **2 · Member OS promotion** | entry path · first-time/zero state · return-hook | Makes the **center of gravity** the obvious post-join home | Low |
| **3 · Join simplification** | focused checkout; demote the 13-section depth | Clears the path *to* the seat | Medium-high |
| **4 · Navigation / IA** | promote belonging+economy, demote proof; flatten "More" | Re-orders nav around the new center | Medium |

**Start with Sprint 0.** It is the lowest-risk, highest-leverage move and a prerequisite for everything visual.

---

## What this determination does NOT change (guardrails)

- No code, no page moves, no new lab, no deletes, no renames in this pass.
- The **seat = SYN** (Holder Index is identity truth); artifacts are *memory*, not membership.
- Vault stays protocol-controlled, transparently routed, **never member-claimable**; it is supporting, not the anchor.
- Rank / chapter / era confer **no rights** — recognition + coordinates only.
- Referral stays **preview** (commissionRouter = 0x0).
- No ROI / yield / dividend / return / equity / profit language anywhere.
- Every public number maps to an on-chain read or is labeled PENDING/FUTURE.

---

## The next six months, in one sentence

Design every surface to answer one question — *"how does this make the member's seat more real, more recognized, or more remembered?"* — and let the economy, memory, proof, and future systems orbit that, with the Member OS as home and the homepage as the trailer that gets Alice there.

*End of determination. Read-only by design. Approve the anchor + Sprint 0 to begin.*
