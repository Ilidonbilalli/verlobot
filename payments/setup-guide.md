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
| **Polar** | ~4% + 40¢ | Developer-first; NM on payout list |
| **Creem** | 3.9% + 40¢ | Flat pricing; NM on supported list |
| **Dodo Payments** | ~4% + 40¢ | NM on accepted list |
| **Gumroad** | 10% flat | Easiest signup, highest fee; pays out in MKD |
| Paddle | ~5% + 50¢ | Rejects pure-service businesses — not a fit for audits/sprints |
| Lemon Squeezy | — | Now Stripe-owned; NM payouts being migrated — skip for now |

**Recommended: sign up for AgentaOS first, Polar or Creem as backup.** Signing
up is free; you only need identity documents and a bank account.

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
3. **Create three products:**

   | Product name | Price | Type |
   |---|---|---|
   | Deep Audit — AI agent failure report | $950 | one-time |
   | Fix Sprint — agent reliability, two weeks | $12,000 | one-time |
   | Watch — monthly agent health monitoring | $1,500 | subscription (monthly) |
   | (optional) Deposit — Fix Sprint | $3,000 | one-time; useful for "50% now, 50% on delivery" |

4. **Copy each checkout link** into `site/config.js` (see README).
5. **Set the post-purchase redirect** to `https://verlobot.com/thanks.html`.
6. **Test with a real card** (small product) and, if offered, test mode. Make
   sure the money actually arrives and the redirect works.
7. **Refund policy:** state it on checkout ("Full refund if the audit finds
   nothing beyond what you already knew"). MoRs expect a visible refund policy.

## While waiting for approval (1–3 days)

The site's Buy buttons fall back to a prefilled email order:
`hello@verlobot.com`. If someone wants to buy:

1. Reply with a one-page order summary (scope, price, delivery date).
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
