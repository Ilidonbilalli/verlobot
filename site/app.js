/* Verlobot — wiring: checkout buttons + email links + year. */
(function () {
  "use strict";
  var cfg = window.VERLOBOT_CONFIG || {};
  var email = cfg.contactEmail || "hello@verlobot.com";
  var links = cfg.checkout || {};

  // Wire checkout buttons inside a root element (default: whole document).
  // <a data-checkout="audit" data-product="Deep Audit">
  function wireCheckout(rootElement) {
    var root = rootElement || document;
    var nodes = root.querySelectorAll("[data-checkout]");
    for (var i = 0; i < nodes.length; i++) {
      (function (el) {
        var key = el.getAttribute("data-checkout");
        var product = el.getAttribute("data-product") || key;
        var url = links[key] || "";
        if (url) {
          el.setAttribute("href", url);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
          el.removeAttribute("title");
        } else {
          el.setAttribute("href", "mailto:" + email + "?subject=" + encodeURIComponent("Order: " + product));
          el.setAttribute("title", "Card checkout goes live shortly \u2014 order by email for now");
        }
      })(nodes[i]);
    }
  }

  // Email links: <a data-email>
  function wireEmail(rootElement) {
    var root = rootElement || document;
    var mails = root.querySelectorAll("[data-email]");
    for (var j = 0; j < mails.length; j++) {
      mails[j].setAttribute("href", "mailto:" + email);
      if (mails[j].getAttribute("data-email") === "text") mails[j].textContent = email;
    }
  }

  window.VerlobotApp = { wireCheckout: wireCheckout, wireEmail: wireEmail };

  wireCheckout(document);
  wireEmail(document);

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
