/* Verlobot — site config.
   Fill in the checkout links after your merchant-of-record is approved.
   Until then, buttons fall back to email ordering. */
window.VERLOBOT_CONFIG = {
  contactEmail: "hello@verlobot.com",
  thankYouUrl: "thanks.html",
  checkout: {
    watch_mo: "",    // Watchtower — $15,000/month subscription
    watch_yr: "",    // Watchtower — $100,000/year subscription
    command_mo: "",  // Command — $25,000/month subscription
    command_yr: ""   // Command — $180,000/year subscription
  }
};
