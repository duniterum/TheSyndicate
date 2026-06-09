# THE SYNDICATE — MVP TESTING SCRIPT

Reusable scripts for inviting testers, running interviews, and capturing
feedback. Copy/paste-ready.

---

## 1. The 2-Minute Invite (DM / Telegram / X)

> Hey — building something and I'd love 2 minutes of your honest reaction.
>
> Please visit **thesyndicate.money** for 2 minutes. **Do not read the docs
> first.** Then tell me:
>
> 1. What do you think it is?
> 2. What would you click?
> 3. What confused you?
> 4. Would you join with $5?
>
> Brutal honesty only. No need to be polite. Thanks 🙏

Use as the default cold-test invite. If they reply, escalate to the
5-minute interview below.

---

## 2. The 5-Minute Interview

> Thanks for taking a look. Five quick questions:
>
> 1. In one sentence, what is The Syndicate?
> 2. Why do you think it exists?
> 3. What would you click first?
> 4. Do you trust it? Why or why not?
> 5. Would you join with $5? Why or why not?
>
> If you'd like to go deeper, I have a longer 10-min version.

Record verbatim answers. Do not coach. Do not correct.

---

## 3. The 10-Minute Interview

Run live (call or screen-share). Stay silent while they explore.

**Opening (30s)**
> I'm going to share a link. Please open it and think out loud for the next
> few minutes. I'll stay quiet. There are no wrong answers — I'm testing
> the site, not you.

**Observation (3 min)**
- Watch without commenting.
- Note every click, hover, hesitation, back-button press.
- Note when they speak — write down their literal words.

**Questions (6 min)** — ask in order, do not skip:
1. What do you think this is?
2. Why do you think it exists?
3. What did you click first? Why?
4. What did you expect after clicking?
5. Did anything confuse you?
6. Did anything feel empty or unfinished?
7. Did anything make you trust it? Distrust it?
8. Would you join with $5? Why or why not?
9. Would you share it with one person? Who? What would you say?
10. If you could change one thing, what would it be?

**Closing (30s)**
> Thank you. Anything you want to flag that I didn't ask about?

---

## 4. Feedback Form (async)

Use if a live interview is not possible. Google Form or Tally is enough.

1. Your background (crypto-native / DeFi user / casual / non-technical / skeptical) — single select
2. What do you think The Syndicate is? (free text)
3. Why do you think it exists? (free text)
4. What did you click first? (free text)
5. On a scale of 1–5, how clearly did the homepage explain itself? (slider)
6. On a scale of 1–5, how much do you trust the protocol? (slider)
7. On a scale of 1–5, how likely are you to join with $5? (slider)
8. What confused you? (free text)
9. What felt empty or unfinished? (free text)
10. If you could change one thing, what would it be? (free text)
11. Would you share this with one person? Who, and what would you say? (free text)

---

## 5. Observation Checklist (one per tester)

```
Tester ID: ___________
Group:     ___________  (crypto / meme / defi / cautious / non-tech / skeptic / community)
Date:      ___________
Duration:  _______ min

ROUTE PATH:
[ ] /                  time on page: ____
[ ] /join              time on page: ____
[ ] /transparency      time on page: ____
[ ] /members           time on page: ____
[ ] /founders          time on page: ____
[ ] /chapters          time on page: ____
[ ] /ranks             time on page: ____
[ ] /token             time on page: ____
[ ] /docs              time on page: ____
[ ] external (snowtrace / dexscreener)

CTA INTERACTION:
[ ] Clicked Join
[ ] Clicked Verify
[ ] Clicked Trade / Add LP   ← if YES before Join, hierarchy is broken
[ ] Connected wallet
[ ] Attempted buy
[ ] Completed buy
[ ] Shared

PASS CRITERIA (one minute):
[ ] Could state what it is
[ ] Could state why it exists
[ ] Could state how to join
[ ] Could state what happens after joining
[ ] Could state how to verify

CONFUSION SIGNALS (quotes):
- "..."
- "..."

TRUST SIGNALS (positive / negative quotes):
- "..."

ONE THING TO CHANGE:
- "..."

VERDICT: PASS / FAIL / PARTIAL
```

---

## 6. After Each Round

1. Aggregate all observation sheets.
2. Group confusion signals by source surface (see `MVP_CONFUSION_SIGNALS.md`).
3. Pick the **top 3 wording or ordering fixes only**.
4. Ship those. Do not add features.
5. Recruit a fresh cohort. Repeat.
