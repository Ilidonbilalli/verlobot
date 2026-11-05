# Launch kit — ready-to-post content

Post the free tool (not the paid services) everywhere. The tool is the ad; the
paid tiers are the upsell. Always link: `https://verlobot.com/tool.html`.

Replace `verlobot.com` with the live URL once deployed. Never post the same
text twice in the same community — rewrite the first line each time.

---

## 1) Show HN (news.ycombinator.com/submit)

Title:
`Show HN: Free, private tool that finds why AI agents fail silently (runs in-browser)`

Text:
```
Hi HN. I kept hitting the same wall with coding/ops agents: the run "succeeds"
but half the turns produced nothing. The model announces actions it never
takes, re-runs the same failing command, claims "all tests pass" when the last
output says otherwise, or quietly skips tests to get green.

So I built a log autopsy that runs entirely in your browser — no upload, no
account. You paste JSONL/JSON/text from any agent (OpenAI/Anthropic/LangChain/
custom) and it flags 8 leak types: silent turns, stuck loops, error storms,
false success claims, weakened tests, truncated output, prose-without-action,
context floods. Each finding points at the exact turn, with a suggested fix.

It's v1 and the heuristics are deliberately conservative. If you run agents in
prod, I'd love to see an anonymized log and hear what it misses — the tool is
free and always will be. Feedback welcome.
```

If it gets any traction, stay in the thread and answer everything for 2 hours.

## 2) X / Twitter (post as a thread, then pin it)

```
1/ Your AI agent fails silently and your logs know why.

I built a free tool that reads agent logs in your browser and shows you the 8 ways agents waste turns — no upload, no signup.

2/ The 8 leaks:
- silent turns (nothing returned)
- stuck loops (same command, again and again)
- error storms (blind retries)
- false success claims ("all tests pass")
- weakened tests (skip/xfail sneaking in)
- truncated output
- "let me..." with no tool call
- context floods

3/ Every finding shows the exact turn + the fix. Works with OpenAI, Anthropic, LangChain, Claude Code logs, raw text.

4/ Your logs never leave your machine. It's 100% client-side. Open DevTools and check — nothing is sent anywhere.

5/ Try it on a log right now: https://verlobot.com/tool.html

If it finds something embarrassing, that's normal. That's the point.
```

## 3) Reddit — r/LLMDevs, r/AI_Agents, r/SaaS, r/LocalLLaMA (check each sub's self-promo rules first)

Title:
`I made a free browser tool that finds silent failures in agent logs (no upload) — would love feedback`

Body:
```
I run coding agents daily and got tired of "successful" runs where the agent:
- returns empty turns,
- loops the same failing command,
- says "all tests pass" while the last run says 3 failed,
- adds skip/xfail to make things green.

So I made a log viewer that flags those (plus truncated output, tool floods,
and "let me check..." turns with no tool call). Everything runs client-side —
you paste the log, you get a report with the exact turns. No upload, no account.

Free, no signup: https://verlobot.com/tool.html

If you paste a log and it finds nothing new, tell me — false negatives are the
most useful feedback right now.
```

## 4) LinkedIn (for the B2B side — this one can mention the services)

```
AI agents don't fail loudly. They fail silently.

A run "completes" while:
• 1 in 5 turns produces no action
• the same failing command re-runs 4 times
• the final message claims success the test output contradicts

We built Agent Autopsy: paste your agent logs, get the failure report in your
browser — nothing is uploaded. It finds 8 classes of silent failure and points
at the exact turns.

Free forever: https://verlobot.com/tool.html

If it finds something you'd rather have fixed than reported, that's what we do:
deep audits, two-week fix sprints, and continuous watching.
```

## 5) Direct messages (the actual first sale — see the playbook)

Keep posts as awareness. Deals come from DMs/emails to people who ship agents.
Templates in `outreach-playbook.md`.

## 6) Rules we never break

- Only original assets. No images, logos, or fonts from Google/random sites.
- Trending music is for personal posts only — never ads/branded videos.
  Branded videos use royalty-free music; keep the license link.
- No fake "as seen in ..." claims, no fake reviews, no made-up numbers.
- Don't imitate famous brand marks when making new logos.
Full checklist: `docs/legal-rules.md`.
