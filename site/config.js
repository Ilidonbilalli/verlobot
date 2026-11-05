/* Verlobot — site config.
   Fill in the checkout links after your merchant-of-record is approved.
   Until then, buttons fall back to email ordering. */
window.VERLOBOT_CONFIG = {
  contactEmail: "hello@verlobot.com",
  thankYouUrl: "thanks.html",
  checkout: {
    audit: "",   // e.g. https://checkout.agentaos.ai/... or Polar/Creem/Dodo product link
    sprint: "",
    watch: ""
  }
};
