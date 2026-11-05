/* Verlobot — Autopsy tool page logic. */
(function () {
  "use strict";
  var A = window.VerlobotAnalyzer;

  var drop = document.getElementById("drop");
  var fileInput = document.getElementById("file-input");
  var textarea = document.getElementById("log-input");
  var runBtn = document.getElementById("run-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var status = document.getElementById("status");
  var report = document.getElementById("report");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function setStatus(msg) { status.textContent = msg || ""; }

  function loadFile(file) {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setStatus("That file is over 20 MB \u2014 trim it first."); return; }
    var reader = new FileReader();
    reader.onload = function () {
      textarea.value = String(reader.result || "");
      setStatus("Loaded " + file.name + " (" + Math.round(file.size / 1024) + " KB). Click Analyze.");
    };
    reader.onerror = function () { setStatus("Could not read that file."); };
    reader.readAsText(file);
  }

  // postMessage-style guard for embedded file:// pages is unnecessary; keep simple.
  if (drop && fileInput) {
    drop.addEventListener("click", function () { fileInput.click(); });
    ["dragenter", "dragover"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("hover"); });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("hover"); });
    });
    drop.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
    });
    fileInput.addEventListener("change", function () { if (fileInput.files.length) loadFile(fileInput.files[0]); });
  }

  if (sampleBtn) sampleBtn.addEventListener("click", function () {
    textarea.value = A.buildSampleText();
    setStatus("Sample log loaded. Click Analyze to see a report.");
  });

  if (clearBtn) clearBtn.addEventListener("click", function () {
    textarea.value = "";
    report.classList.remove("on");
    report.innerHTML = "";
    setStatus("");
  });

  if (runBtn) runBtn.addEventListener("click", function () {
    var text = textarea.value;
    if (!text.trim()) { setStatus("Paste some log lines or open a file first."); return; }
    var parsed, result;
    try {
      parsed = A.parseLog(text);
      result = A.analyze(parsed.events);
    } catch (err) {
      setStatus("Could not parse this log. Try JSONL (one JSON object per line) or paste raw text.");
      return;
    }
    setStatus("Analyzed " + parsed.lineCount + " input lines (" + parsed.mode + ").");
    render(result, parsed);
  });

  function scoreClass(score) { return score >= 85 ? "ok" : score >= 60 ? "warn" : "bad"; }

  function pct(x) { return Math.round(x * 100) + "%"; }

  function render(r, parsed) {
    var h = [];
    h.push('<div class="scorehead">');
    h.push('<div class="score ' + scoreClass(r.score) + '">' + r.score + "</div>");
    h.push("<div><h3>Autopilot score: " + esc(r.verdict) + "</h3>");
    h.push('<p class="muted">' + esc(r.totals.assistant) + " assistant turns analyzed &middot; " + esc(r.totals.toolCalls) + " tool calls &middot; " +
      pct(r.usableActionRate) + " of turns produced an action &middot; " + pct(r.errorRate) + " of tool results were errors</p></div>");
    h.push("</div>");

    h.push('<div class="stats">');
    h.push(stat(r.totals.assistant, "assistant turns"));
    h.push(stat(r.totals.toolCalls, "tool calls"));
    h.push(stat(pct(r.usableActionRate), "usable action rate"));
    h.push(stat(pct(r.errorRate), "tool error rate"));
    h.push(stat(fmt(r.maxOutput), "largest tool output"));
    h.push(stat(r.leaks.length, "leak types found"));
    h.push("</div>");

    if (!r.leaks.length) {
      h.push('<div class="card"><h3>No leaks detected in this run.</h3><p class="muted">Either this log is clean or the patterns did not appear. A month of watching finds what one scan misses &mdash; that is what the Watchtower is for.</p>' +
        '<a class="btn btn-primary" data-checkout="watch_mo" data-product="Watchtower — monthly">Start the Watchtower</a></div>');
    } else {
      for (var i = 0; i < r.leaks.length; i++) {
        var L = r.leaks[i];
        h.push('<div class="card leak ' + esc(L.severity) + '" style="margin:14px 0">');
        h.push("<h3>" + esc(L.title) + ' <span class="sev ' + esc(L.severity) + '">' + esc(L.severity) + "</span></h3>");
        h.push('<p class="muted">Found <b>' + esc(L.count) + "</b> time(s).</p>");
        for (var e = 0; e < L.examples.length; e++) {
          h.push('<pre class="ex">#' + esc(L.examples[e].idx) + "  " + esc(L.examples[e].snippet) + "</pre>");
        }
        h.push('<p><b>Fix:</b> ' + esc(L.tip) + "</p>");
        h.push("</div>");
      }
      h.push('<div class="card" style="margin-top:18px"><h3>Want these fixed, not just found?</h3>' +
        '<p class="muted">The Watchtower finds, alerts, and fixes &mdash; every month. Command adds the Loop Killer and auto-fix queue.</p>' +
        '<div class="toolbar"><a class="btn btn-primary" data-checkout="watch_mo" data-product="Watchtower — monthly">Start the Watchtower</a>' +
        '<a class="btn" data-checkout="command_mo" data-product="Command — monthly">Go Command</a></div></div>');
    }

    h.push('<p class="small muted" style="margin-top:14px">Heuristic scan of ' + esc(parsed.lineCount) + " lines. Heuristics can miss things and can occasionally over-count. For a human-verified report, book an audit.</p>");

    report.innerHTML = h.join("");
    report.classList.add("on");
    if (window.VerlobotApp && window.VerlobotApp.wireCheckout) window.VerlobotApp.wireCheckout(report);
    report.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stat(value, label) {
    return '<div class="stat"><b>' + esc(value) + "</b><span>" + esc(label) + "</span></div>";
  }

  function fmt(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + " MB";
    if (n >= 1000) return Math.round(n / 1000) + "k chars";
    return n + " chars";
  }
})();
