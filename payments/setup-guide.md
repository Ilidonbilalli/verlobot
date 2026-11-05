# Payments from North Macedonia — setup guide

Stripe does not support sellers in North Macedonia, and PayPal is send-only
there. The proven route is a **Merchant of Record (MoR)**: the platform is the
legal seller, collects the card, handles every country's VAT/sales tax, and
pays you out to your own bank in EUR or USD.

Providers that accept sellers from North Macedonia (checked against their own
country lists, October 2026):

| Provider | Fee (typical) | Notes |
|---|---|---|
| **AgentaOS** | 4.5% + €0.50 per sale; +1.5% international cards; 1% payout fee | Built for individuals; payouts 1st & 15th by SEPA (EUR) or SWIFT (USD); handles VAT; English UI |
| **Polar** | ~4% + 40¢ | Developer-first; NM on payout list; supports subscriptions |
| **Creem** | 3.9% + 40¢ | Flat pricing; NM on supported list; subscriptions supported |
| **Dodo Payments** | ~4% + 40¢ | NM on accepted list; subscriptions supported |
| **Gumroad** | 10% flat | Easiest signup, highest fee; pays out in MKD; subscriptions supported |
| Paddle | ~5% + 50¢ | Rejects pure-service businesses — not a fit |
| Lemon Squeezy | — | Now Stripe-owned; NM payouts being migrated — skip for now |

**Recommended: AgentaOS first, Polar or Creem as backup** (verify each supports
recurring subscriptions before creating products; all three list subscription
billing as of late 2026 — confirm in their dashboard on signup). Signing up is
free; you only need identity documents and a bank account.

## You need

- A bank account in North Macedonia that can receive **EUR (SEPA)** or **USD
  (SWIFT)**. Most local banks offer a foreign-currency account; ask for
  "прилив од странство / incoming SEPA" if unsure. If your bank can't, a Wise
  or Payoneer account also works as the receiving account on some platforms.
- A personal ID (individuals are accepted — no company needed on AgentaOS,
  Polar, Creem, Dodo).
- ~30 minutes.

## Steps

1. **Create the account** at agentaos.ai (or polar.sh / creem.io /
   dodopayments.com). Verify identity.
2. **Add a bank payout account** (EUR or USD account in NM).
3. **Create four subscription products:**

   | Product name | Price | Type |
   |---|---|---|
   | Watchtower — monthly | $10,000 | subscription, monthly |
   | Watchtower — yearly | $75,000 | subscription, yearly |
   | Command — monthly | $20,000 | subscription, monthly |
   | Command — yearly | $150,000 | subscription, yearly |

4. **Copy each checkout link** into `site/config.js` (see README for the keys:
   `watch_mo`, `watch_yr`, `command_mo`, `command_yr`).
5. **Set the post-purchase redirect** to `https://verlobot.com/thanks.html`.
6. **Test with a real card** (use a small test product first) and, if offered,
   test mode. Make sure the money actually arrives and the redirect works.
7. **Refund policy:** already visible on the site (month one credited if the
   first report finds nothing actionable). MoRs expect a visible refund policy.

## While waiting for approval (1–3 days)

The site's buttons fall back to a prefilled email order:
`hello@verlobot.com`. If someone wants to buy today:

1. Reply with a one-page order summary (plan, price, start date).
2. Send an invoice: register free at **Wise** → Business → invoice, or use
   **Payoneer** — both let clients pay by card or bank transfer and both work
   from North Macedonia.
3. Deliver after payment. Record everything for taxes.

## Taxes (short version)

- The MoR collects and remits VAT/sales tax on your sales worldwide. That
  burden is theirs.
- You declare your income in North Macedonia as an individual (or company, if
  you register one). Keep the MoR's payout statements — they issue a
  self-billed invoice per payout.
- Talk to an accountant once revenue starts; not before.
