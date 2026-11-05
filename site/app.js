/* Verlobot — wiring: checkout buttons + email links + year + copy buttons. */
(function () {
  "use strict";
  var cfg = window.VERLOBOT_CONFIG || {};
  var email = cfg.contactEmail || "hello@verlobot.com";
  var links = cfg.checkout || {};

  // Wire checkout buttons inside a root element (default: whole document).
  // <a data-checkout="watch_mo" data-product="Watchtower — monthly">
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

  // Copy buttons: <button class="copy-btn" data-copy="pre-id">Copy</button>
  function wireCopy(rootElement) {
    var root = rootElement || document;
    var btns = root.querySelectorAll("[data-copy]");
    for (var k = 0; k < btns.length; k++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var target = document.getElementById(btn.getAttribute("data-copy"));
          if (!target) return;
          var text = target.innerText || target.textContent;
          function done() {
            btn.textContent = "Copied";
            setTimeout(function () { btn.textContent = "Copy"; }, 1600);
          }
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, done);
          } else {
            var ta = document.createElement("textarea");
            ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
            document.body.appendChild(ta); ta.select();
            try { document.execCommand("copy"); } catch (e) { /* noop */ }
            document.body.removeChild(ta); done();
          }
        });
      })(btns[k]);
    }
  }

  window.VerlobotApp = { wireCheckout: wireCheckout, wireEmail: wireEmail };

  wireCheckout(document);
  wireEmail(document);
  wireCopy(document);

  var y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
