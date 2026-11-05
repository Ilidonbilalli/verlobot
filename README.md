# Verlobot — README

**What this is:** a ready-to-deploy product. A free in-browser tool that finds the
hidden failures in AI agent logs ("Agent Autopsy"), plus subscriptions sold on the
same site: Watchtower ($10,000/mo or $75,000/yr) and Command ($20,000/mo or
$150,000/yr). Founding clients: first 3 lock their price for 24 months.

**What it is not:** a promise that a website alone makes $500k. The site is the
store; the outreach playbook in `marketing/` is the engine. Do both.

**Legal pack:** see `LICENSE`, `THIRD_PARTY.md`, and `docs/legal-rules.md` — original
assets only, no fake claims, no GPL code, no trending music in branded videos.

**Live now:** GitHub Pages deploys automatically on every push to `main`
(`.github/workflows/pages.yml`). Repo: `github.com/Ilidonbilalli/verlobot` &rarr;
site: `https://ilidonbilalli.github.io/verlobot/`. To serve it on `verlobot.com`:
point DNS at GitHub Pages (CNAME `@` and `www` &rarr; `ilidonbilalli.github.io`),
then we switch the custom domain on in the repo settings.

---

## Run it locally (30 seconds)

```powershell
cd C:\Users\APJ\Desktop\verlobot
python -m http.server 8899 --directory site
# open http://127.0.0.1:8899
```

Check: the landing page loads, "Run the free autopsy" opens the tool, "Try a
sample log" produces a full report with a score and leak cards.

## Test it

```powershell
node tests/analyzer.test.js
```

Six tests: JSONL parsing, JSON arrays, OpenAI tool_calls, Anthropic content
blocks, sample log finds all 8 leak types, clean log scores high. All must pass
after any edit to `site/analyzer.js`.

## Deploy it (free, ~10 minutes)

Any static host works. Recommended: **Cloudflare Pages** (free, fast, custom
domain, and you already use Cloudflare):

1. Go to dash.cloudflare.com → Workers & Pages → Create → Pages →
   "Upload assets".
2. Project name: `verlobot`. Upload the **contents of the `site/` folder**
   (drag the folder; make sure `index.html` is at the top level of the upload).
3. Deploy. You get `https://verlobot.pages.dev`. Test it.
4. Custom domains → add `verlobot.com` (and `www`). DNS is automatic if the
   domain is on this Cloudflare account.

Alternatives: Netlify Drop (drag `site/` to app.netlify.com/drop), Vercel,
GitHub Pages.

## Turn on card payments (do this today too — see `payments/setup-guide.md`)

Card checkout works from North Macedonia without Stripe, via a Merchant of
Record (MoR). Until a checkout link exists, every "Buy" button on the site
falls back to a prefilled order email, so you can still close your first sale
manually.

When the MoR account is approved:

1. Create three products there (prices/names in the setup guide).
2. Copy each product's checkout link.
3. Paste them into `site/config.js`:

```js
window.VERLOBOT_CONFIG = {
  contactEmail: "hello@verlobot.com",
  thankYouUrl: "thanks.html",
  checkout: {
    watch_mo:   "https://...",  // Watchtower — $10,000/month subscription
    watch_yr:   "https://...",  // Watchtower — $75,000/year subscription
    command_mo: "https://...",  // Command — $20,000/month subscription
    command_yr: "https://..."   // Command — $150,000/year subscription
  }
};
```

4. Re-upload the site (or `git push` if it's connected).

Also set the MoR's post-purchase redirect to `https://verlobot.com/thanks.html`.

## Get the first sale

Follow `marketing/launch-kit.md` (ready-to-post content) and
`marketing/outreach-playbook.md` (day-by-day). Rule of thumb: 20–30 personal
messages per day to people who run AI agents, plus one community post, leads to
the first paying customer inside 1–2 weeks.

## File map

```
site/               the deployable website
  index.html        landing page (pricing + checkout buttons)
  tool.html         the free Agent Autopsy tool
  thanks.html       post-payment page
  analyzer.js       the detection engine (client-side, tested)
  tool-page.js      tool UI wiring
  app.js            checkout button + email wiring
  config.js         >>> PASTE CHECKOUT LINKS HERE <<<
  styles.css        styling
payments/           merchant-of-record setup for North Macedonia
marketing/          launch kit + outreach playbook (copy-paste content)
tests/              analyzer tests (node tests/analyzer.test.js)
```

## Honest expectations

- A deployed site with no traffic sells nothing. The playbook fixes that.
- The MoR may take 1–3 days to approve; email orders work meanwhile.
- The $10k/mo Watchtower converts best after a free report; Command ($20k/mo)
  needs a demo conversation (the playbook has the messages).
- The $1M goal needs ~10–15 clients: yearly prepays ($75k–150k each) stack the
  fastest. That is roughly 1–2 paid conversations per working day for 21 weeks.
  That is the job. This repo makes the job possible; it cannot do it alone.
