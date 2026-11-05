# Outreach playbook — first paying client in 7–14 days

The site makes you credible. This playbook makes you money. Budget ~3 hours a
day for 2 weeks. Track everything in the checklist at the bottom.

**Goal:** 1 paying Watchtower client ($10k/mo) — or the founding deal
(month one credited if the first report finds nothing actionable). After the
first one, the second is 5x easier — you have proof.

**Never break these:** original assets only; no fake "as seen in" claims; no
fake reviews; no trending music in branded videos; no stolen logos.
Full rules: `docs/legal-rules.md`.

---

## Day 0 (today) — 60 minutes

1. Deploy the site (README → Deploy). Confirm the tool works on the live URL.
2. Sign up for the MoR (payments/setup-guide.md). Approval takes 1–3 days.
3. Create `hello@verlobot.com` (Cloudflare Email Routing → forward to your
   personal inbox — free, 5 minutes).
4. Post the Show HN + X thread (launch-kit.md).

## Days 1–14 — the daily engine

Every working day, in this order:

**A. 20–30 personal messages (90 minutes).** People who run agents in prod:
- AI startups with agent products (YC/Seed lists, Product Hunt "AI agents",
  "agent" on GitHub trending)
- Agencies that build agents for clients
- Dev-tool founders with agent features
- People publicly complaining about agent reliability (search X for
  "agent" + "loops", "agent" + "fails", "agent" + "debug")

**B. Answer every reply + every community comment (30 min).**

**C. One community action (20 min):** a Reddit/HN/Discord answer where you
genuinely help someone debug an agent — with or without linking the tool.

**D. One log, one finding (30 min):** run the autopsy on a public/open-source
agent log, write a 5-line "here's what I found" post. This is content that
sells without selling.

### Message template A — cold email to an agent startup

Subject: `found 3 silent failures in <product>'s agent runs`

```
Hi <name> — I make tools for agent reliability. Quick one:

I ran the public demo logs/examples I could find for <product> through our
autopsy tool and saw the classic pattern: <one concrete thing — a loop, a
"done" with no evidence, an empty turn>. Happy to send the 1-page report, free.

If it's useful: we watch and fix agent reliability on a monthly subscription
(Watchtower). First report is free either way — if it finds nothing actionable,
month one is credited.

Want the report?

<you>
```

### Message template B — DM (X/LinkedIn/Discord, shorter)

```
Hey — saw your post about <agent thing>. I built a free tool that scans agent
logs for silent failures (loops, fake "all tests pass", empty turns). Runs in
browser, nothing uploaded. Want me to run your last log through it and send
you what it finds? Free, no strings.
```

### Message template C — agency/integration partner angle

```
Hi <name> — you ship agents for clients. We run reliability watchtowers:
monthly finding + fixing, audit-ready reports. First month credited if the
first report finds nothing actionable. Want me to run the first month on
your most flaky client agent, free? If it's good, you resell it.
```

### When they say yes

1. Send `https://verlobot.com/tool.html` + "paste your log, send me the report,
   or send me the raw log".
2. Run it live with them. Show the leaks. That demo closes.
3. Close with: *"Should I set up the Watchtower this week or start with
   Command for the Loop Killer?"*

### When they say "not now"

Add to a follow-up list. Send ONE follow-up after 4 days:

```
Re-upping for visibility — the offer stands: free report on one log, no
strings. If timing is off, tell me when to check back.
```

Then stop. No third message.

---

## 7-day schedule (minimum viable)

| Day | Must happen | Target |
|---|---|---|
| 0 | Deploy + MoR signup + Show HN + X thread | Site live |
| 1 | 25 messages (templates A/B) | 2–5 replies |
| 2 | 25 messages + answer everyone + 1 community post | 1 "send me the report" |
| 3 | Same + follow-ups from day 1 | 1st free report delivered |
| 4 | 25 messages + Reddit post (launch-kit #3) | 2nd report requested |
| 5 | 25 messages + LinkedIn post | First subscription offer sent |
| 6 | Follow-ups + one "found this in a public log" post | First close conversation |
| 7 | Close the sale (payment link or invoice) | **First month billed** |

## Objections, answered in one line

- **"We'll do it ourselves"** → "Great — here's the report format we use; if
  you want a second set of eyes monthly, we're here."
- **"We don't have logs"** → "Your agent prints something every run. JSONL,
  JSON, or raw text — the tool handles all three."
- **"Is this private?"** → "The free tool never uploads anything; check
  DevTools. Paid work: NDA on request, deletion in writing."
- **"$10k/month is a lot"** → "One bad agent day costs more. And if the first
  report finds nothing actionable, month one is credited."
- **"Why not Datadog/LangSmith?"** → "They show you dashboards. We find the
  failures, fix them, and hand you the audit-ready report. Cheapest way to
  get all three."
- **"Can we do yearly?"** → Yes: $75k Watchtower / $150k Command, founding
  clients lock their price for 24 months.

## Tracking (copy into a sheet)

```
name | company | channel (email/DM/community) | sent | replied | report sent | offer sent | paid | next action + date
```

Review every evening for 10 minutes: who replied, who to follow up, what
message got the best response. Double down on whichever template gets answers.

## The honest math

- 300 messages over 2 weeks → ~10% reply → ~30 conversations → ~5 free reports
  → 1–2 subscriptions. That is normal for cold outreach. Volume + honesty wins.
- One paying client ($10k/mo, or the founding yearly deal) is the whole goal
  of phase 1. It becomes the case study for the rest: the path to $1M by
  April is 10–15 of these, stackable with yearly prepays ($75k–150k each).
