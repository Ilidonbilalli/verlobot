/*!
 * Verlobot Analyzer v1.0.0
 * Client-side AI agent log leak detector.
 * Runs entirely in the browser (also runs in Node for tests).
 * No network calls. Your logs never leave the machine.
 *
 * Usage:
 *   const parsed = VerlobotAnalyzer.parseLog(text);
 *   const report = VerlobotAnalyzer.analyze(parsed.events);
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.VerlobotAnalyzer = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  var VERSION = "1.0.0";
  var FLOOD_LIMIT = 30000; // chars; bigger tool outputs get flagged

  var FAIL_RE = /\b(error|failed|failure|exception|traceback|panic|fatal|exit code [1-9]|command not found|no such file|permission denied|timed out|timeout)\b/i;
  var CLAIM_RE = /\b(all tests? pass(ed|ing)?|tests? (?:now )?pass(?:ing|ed)?|everything works|works (?:now|perfectly)|completed successfully|done successfully|successfully (?:finished|completed|implemented|fixed)|no (?:errors|issues|problems)(?: found)?|fixed it|it works now)\b/i;
  var PROSE_ACTION_RE = /\b(?:let me|i(?:'| a)m going to|i'?ll|i will|next,? i|now i|let'?s)\b[^.!?\n]{0,90}\b(?:run|check|look at|inspect|read|fix|test|verify|update|create|write|add|remove|search|try|debug|examine)\b/i;
  var WEAKEN_RE = /(pytest\.mark\.skip|unittest\.skip|\.skip\(|xfail|assert True|# noqa|type: ?ignore\[|eslint-disable|--no-verify)/i;

  // ---------- small helpers ----------
  function isObj(x) { return x !== null && typeof x === "object"; }

  function safeJson(x) {
    try { return JSON.stringify(x); } catch (e) { return String(x); }
  }

  function snippet(s, n) {
    s = String(s == null ? "" : s).replace(/\s+/g, " ").trim();
    return s.length > n ? s.slice(0, n - 1) + "\u2026" : s;
  }

  function textOf(content) {
    if (content == null) return "";
    if (typeof content === "string") return content;
    if (typeof content === "number" || typeof content === "boolean") return String(content);
    if (Array.isArray(content)) {
      var out = [];
      for (var i = 0; i < content.length; i++) {
        var p = content[i];
        if (typeof p === "string") out.push(p);
        else if (isObj(p)) {
          if (typeof p.text === "string") out.push(p.text);
          else if (typeof p.content === "string") out.push(p.content);
          else if (Array.isArray(p.content)) out.push(textOf(p.content));
        }
      }
      return out.join("\n");
    }
    if (isObj(content) && typeof content.text === "string") return content.text;
    return "";
  }

  function partList(o) {
    if (!isObj(o)) return [];
    if (o.message && Array.isArray(o.message.content)) return o.message.content;
    if (Array.isArray(o.content)) return o.content;
    return [];
  }

  function roleOf(o) {
    if (!isObj(o)) return "unknown";
    var r = o.role || o.type || (o.message && (o.message.role || o.message.type)) || "";
    r = String(r).toLowerCase();
    if (r === "human") r = "user";
    if (r === "ai" || r === "model") r = "assistant";
    if (r === "function_call" || r === "tool_use") r = "assistant";
    if (r === "tool_result" || r === "function_result") r = "tool";
    return r || "unknown";
  }

  function callsOf(o) {
    if (!isObj(o)) return [];
    var src = [];
    if (Array.isArray(o.tool_calls)) src = src.concat(o.tool_calls);
    if (o.message && Array.isArray(o.message.tool_calls)) src = src.concat(o.message.tool_calls);
    var parts = partList(o);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (isObj(p) && (p.type === "tool_use" || p.type === "tool_call" || p.type === "function_call")) src.push(p);
    }
    if (isObj(o.function_call)) src.push({ name: o.function_call.name, arguments: o.function_call.arguments });
    if (o.message && isObj(o.message.function_call)) src.push({ name: o.message.function_call.name, arguments: o.message.function_call.arguments });

    var calls = [];
    for (var j = 0; j < src.length; j++) {
      var t = src[j];
      if (!isObj(t)) continue;
      var fn = isObj(t.function) ? t.function : t;
      var name = fn.name || t.name || "";
      var a = fn.arguments != null ? fn.arguments : (t.input != null ? t.input : "");
      var args = typeof a === "string" ? a : safeJson(a);
      if (name || args) calls.push({ name: String(name), args: String(args) });
    }
    return calls;
  }

  // Returns {text, isError} or null when the event is not a tool result.
  function toolResultOf(o) {
    if (!isObj(o)) return null;
    var parts = partList(o);
    var texts = [], err = false, found = false;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (isObj(p) && (p.type === "tool_result" || p.type === "function_result")) {
        found = true;
        texts.push(textOf(p.content) || textOf(p));
        if (p.is_error === true) err = true;
      }
    }
    var role = roleOf(o);
    if (!found && (role === "tool" || role === "function")) {
      found = true;
      texts.push(textOf(o.content != null ? o.content : o.text));
      if (o.is_error === true) err = true;
    }
    if (!found) return null;
    var t = texts.join("\n");
    return { text: t, isError: err || FAIL_RE.test(t) };
  }

  function normalizeEvent(raw, idx) {
    var o = raw;
    var text = textOf(o && o.content != null ? o.content : (o && o.text));
    if (o && o.message && o.message.content != null) text = textOf(o.message.content) || text;
    var tr = toolResultOf(o);
    if (tr) return { idx: idx, role: "tool", text: tr.text || "", isError: !!tr.isError, toolCalls: [] };
    var role = roleOf(o);
    if (role === "assistant") return { idx: idx, role: "assistant", text: text || "", toolCalls: callsOf(o), isError: false };
    if (role === "user") return { idx: idx, role: "user", text: text || "", toolCalls: [], isError: false };
    if (role === "system" || role === "developer") return { idx: idx, role: "system", text: text || "", toolCalls: [], isError: false };
    return { idx: idx, role: "raw", text: text || safeJson(o), toolCalls: [], isError: false };
  }

  // ---------- parsing ----------
  function parseLog(input) {
    var text = String(input == null ? "" : input);
    var events = [];
    var trimmed = text.trim();
    if (!trimmed) return { events: [], mode: "empty", lineCount: 0 };

    // 1) Whole-file JSON (array, or {messages: [...]} / {conversation: [...]} / {events: [...]})
    var parsedAll = null;
    if (trimmed[0] === "[" || trimmed[0] === "{") {
      try { parsedAll = JSON.parse(trimmed); } catch (e) { parsedAll = null; }
    }
    if (parsedAll) {
      var list = null;
      if (Array.isArray(parsedAll)) list = parsedAll;
      else if (Array.isArray(parsedAll.messages)) list = parsedAll.messages;
      else if (Array.isArray(parsedAll.conversation)) list = parsedAll.conversation;
      else if (Array.isArray(parsedAll.events)) list = parsedAll.events;
      if (list) {
        for (var i = 0; i < list.length; i++) events.push(normalizeEvent(list[i], events.length));
        return { events: events, mode: "json", lineCount: list.length };
      }
      if (isObj(parsedAll) && (parsedAll.role || parsedAll.type)) {
        events.push(normalizeEvent(parsedAll, 0));
        return { events: events, mode: "json", lineCount: 1 };
      }
    }

    // 2) JSONL (one JSON object per line, tolerant of stray raw lines)
    var lines = text.split(/\r?\n/);
    var nonEmpty = 0, parsedCount = 0;
    var stash = [];
    for (var j = 0; j < lines.length; j++) {
      var ln = lines[j];
      if (!ln.trim()) continue;
      nonEmpty++;
      var obj = null;
      var c0 = ln.trim()[0];
      if (c0 === "{" || c0 === "[") {
        try { obj = JSON.parse(ln); } catch (e) { obj = null; }
      }
      if (obj != null && typeof obj === "object") { parsedCount++; stash.push({ obj: obj }); }
      else stash.push({ raw: ln });
    }
    if (nonEmpty > 0 && parsedCount / nonEmpty >= 0.6) {
      for (var k = 0; k < stash.length; k++) {
        var it = stash[k];
        if (it.raw != null) events.push({ idx: events.length, role: "raw", text: it.raw, toolCalls: [], isError: FAIL_RE.test(it.raw) });
        else if (Array.isArray(it.obj)) {
          for (var m = 0; m < it.obj.length; m++) events.push(normalizeEvent(it.obj[m], events.length));
        } else events.push(normalizeEvent(it.obj, events.length));
      }
      return { events: events, mode: "jsonl", lineCount: nonEmpty };
    }

    // 3) Plain text lines
    for (var n = 0; n < lines.length; n++) {
      if (!lines[n].trim()) continue;
      events.push({ idx: events.length, role: "raw", text: lines[n], toolCalls: [], isError: FAIL_RE.test(lines[n]) });
    }
    return { events: events, mode: "text", lineCount: events.length };
  }

  // ---------- analysis ----------
  function stableStringify(x) {
    if (!isObj(x)) return JSON.stringify(x == null ? null : x);
    if (Array.isArray(x)) {
      var parts = [];
      for (var i = 0; i < x.length; i++) parts.push(stableStringify(x[i]));
      return "[" + parts.join(",") + "]";
    }
    var keys = Object.keys(x).sort();
    var kv = [];
    for (var j = 0; j < keys.length; j++) kv.push(JSON.stringify(keys[j]) + ":" + stableStringify(x[keys[j]]));
    return "{" + kv.join(",") + "}";
  }

  function sigOf(call) {
    var args = call.args || "";
    try { args = stableStringify(JSON.parse(args)); } catch (e) { args = args.replace(/\s+/g, " ").slice(0, 400); }
    return (call.name || "tool") + " " + args;
  }

  function mkLeak(id, title, severity, count, examples, tip) {
    return { id: id, title: title, severity: severity, count: count, examples: examples, tip: tip };
  }

  function analyze(events) {
    events = events || [];
    var reps = { assistant: 0, user: 0, tool: 0, toolCalls: 0, system: 0, raw: 0 };
    var hasToolCalls = false;
    for (var h = 0; h < events.length; h++) {
      if (events[h] && events[h].toolCalls && events[h].toolCalls.length) { hasToolCalls = true; break; }
    }

    var silent = [], prose = [], claims = [], weaken = [], trunc = [], flood = [];
    var repeats = {};
    var errorCount = 0, maxErrorRun = 0, errorRun = 0, maxOutput = 0;

    for (var i = 0; i < events.length; i++) {
      var ev = events[i];
      if (!ev) continue;
      if (ev.role === "assistant") {
        reps.assistant++;
        var txt = ev.text || "";
        var hasCalls = ev.toolCalls && ev.toolCalls.length > 0;

        if (!txt.trim() && !hasCalls) silent.push({ idx: ev.idx, snippet: "(no text, no tool call)" });

        if (hasCalls) {
          reps.toolCalls += ev.toolCalls.length;
          for (var c = 0; c < ev.toolCalls.length; c++) {
            var sig = sigOf(ev.toolCalls[c]);
            if (!repeats[sig]) repeats[sig] = { count: 0, idxs: [] };
            repeats[sig].count++;
            if (repeats[sig].idxs.length < 4) repeats[sig].idxs.push(ev.idx);
            if (WEAKEN_RE.test(ev.toolCalls[c].args || "")) {
              weaken.push({ idx: ev.idx, snippet: snippet(ev.toolCalls[c].name + ": " + ev.toolCalls[c].args, 160) });
            }
          }
        } else if (hasToolCalls && txt.trim() && PROSE_ACTION_RE.test(txt)) {
          prose.push({ idx: ev.idx, snippet: snippet(txt, 160) });
        }

        if (CLAIM_RE.test(txt)) {
          var looked = 0, found = null;
          for (var b = i - 1; b >= 0 && looked < 8; b--) {
            var bev = events[b];
            if (bev && bev.role === "tool") { found = bev; break; }
            looked++;
          }
          if (found && found.isError) claims.push({ idx: ev.idx, snippet: snippet(txt, 160), afterErrorAt: found.idx });
        }

        if (WEAKEN_RE.test(txt)) weaken.push({ idx: ev.idx, snippet: snippet(txt, 160) });

        var fences = (txt.match(/```/g) || []).length;
        if (txt.trim().length > 40 && fences % 2 === 1) trunc.push({ idx: ev.idx, snippet: snippet(txt, 160) });
        else if (/\.\.\.\s*$/.test(txt.trim()) && /```/.test(txt)) trunc.push({ idx: ev.idx, snippet: snippet(txt, 160) });
      } else if (ev.role === "tool") {
        reps.tool++;
        var len = (ev.text || "").length;
        if (len > maxOutput) maxOutput = len;
        if (ev.isError) { errorCount++; errorRun++; if (errorRun > maxErrorRun) maxErrorRun = errorRun; }
        else errorRun = 0;
        if (len > FLOOD_LIMIT) flood.push({ idx: ev.idx, snippet: len + " chars of tool output" });
      } else if (ev.role === "user") reps.user++;
      else if (ev.role === "system") reps.system++;
      else reps.raw++;
    }

    // repeated identical actions
    var repeatLeaks = [];
    Object.keys(repeats).forEach(function (sig) {
      if (repeats[sig].count >= 3) repeatLeaks.push({ sig: sig, count: repeats[sig].count, idxs: repeats[sig].idxs });
    });
    repeatLeaks.sort(function (a, b) { return b.count - a.count; });
    var repeatExamples = repeatLeaks.slice(0, 4).map(function (r) {
      return { idx: r.idxs[0], snippet: snippet(r.sig, 140) + "  (x" + r.count + ")" };
    });

    var leaks = [];
    if (silent.length) leaks.push(mkLeak("silent", "Silent turns", "high", silent.length, silent.slice(0, 5),
      "Give the model a hard output budget and require every turn to end with a tool call or a final answer. A turn that returns nothing should be retried automatically, not accepted."));
    if (repeatLeaks.length) leaks.push(mkLeak("repeats", "Stuck loops (identical actions repeated)", "high",
      repeatLeaks.reduce(function (a, r) { return a + r.count; }, 0), repeatExamples,
      "Fingerprint tool calls. After the second identical failure, force a different strategy instead of re-running the same command."));
    if (maxErrorRun >= 3 || (errorCount > 0 && errorCount / Math.max(1, reps.tool) > 0.4)) leaks.push(mkLeak("errors", "Error storm / failing retry loop", "high",
      errorCount, events.filter(function (e) { return e.role === "tool" && e.isError; }).slice(0, 4).map(function (e) { return { idx: e.idx, snippet: snippet(e.text, 160) }; }),
      "Trim tool output to head+tail (tracebacks live at the end), distinguish 'cannot even run' from 'tests fail', and change the approach after repeated failures."));
    if (claims.length) leaks.push(mkLeak("claims", "Unproven success claims", "critical", claims.length, claims.slice(0, 5),
      "Check the claim against the evidence: 'all tests pass' is only true if the last run says so. Compare the claim with the most recent tool output before accepting the turn."));
    if (weaken.length) leaks.push(mkLeak("weaken", "Weakened tests (skip / xfail / assert True)", "critical", weaken.length, weaken.slice(0, 5),
      "Lock test files from edits. Flag any newly added skip/xfail/assert-True as a failure, not a fix."));
    if (trunc.length) leaks.push(mkLeak("trunc", "Truncated output (unbalanced code fences)", "medium", trunc.length, trunc.slice(0, 5),
      "Unbalanced code fences mean the answer was cut off mid-file. Raise the output budget or write files in chunks, and syntax-check every write."));
    if (prose.length) leaks.push(mkLeak("prose", "Prose instead of action ('let me...' with no tool call)", "medium", prose.length, prose.slice(0, 5),
      "Announcing an action is not taking it. Enforce a contract: describe-then-act in the same turn, or the turn is invalid."));
    if (flood.length) leaks.push(mkLeak("flood", "Context floods (oversized tool output)", "medium", flood.length, flood.slice(0, 5),
      "One giant tool output flushes useful context. Keep head/tail only: cut outputs over ~30k chars down to their first and last 100 lines."));

    // score & rates
    var penalty = 0;
    penalty += Math.min(16, silent.length * 4);
    penalty += Math.min(10, prose.length * 2);
    var repeatExtra = 0;
    for (var r2 = 0; r2 < repeatLeaks.length; r2++) repeatExtra += (repeatLeaks[r2].count - 2);
    penalty += Math.min(15, repeatExtra * 3);
    penalty += Math.min(16, Math.max(0, maxErrorRun - 2) * 4);
    penalty += Math.min(10, Math.round((reps.tool ? errorCount / reps.tool : 0) * 20));
    penalty += Math.min(18, claims.length * 6);
    penalty += Math.min(18, weaken.length * 6);
    penalty += Math.min(9, trunc.length * 3);
    penalty += Math.min(9, flood.length * 3);
    var score = Math.max(5, 100 - penalty);

    var verdict = score >= 85 ? "Healthy" : score >= 70 ? "Warning signs" : score >= 50 ? "Leaking budget" : "Critical failure load";
    var usable = reps.assistant ? 1 - (silent.length + prose.length) / reps.assistant : 1;
    if (usable < 0) usable = 0;

    return {
      version: VERSION,
      totals: reps,
      leaks: leaks,
      score: score,
      verdict: verdict,
      usableActionRate: usable,
      errorRate: reps.tool ? errorCount / reps.tool : 0,
      maxOutput: maxOutput,
      generatedAt: new Date().toISOString()
    };
  }

  // ---------- built-in sample (for the "Try a sample" button + tests) ----------
  function buildSample() {
    var L = [];
    L.push({ role: "system", content: "You are a coding agent working in the payments-api repo. Use tools to act." });
    L.push({ role: "user", content: "Fix the failing checkout tests in tests/test_checkout.py and make CI pass." });
    L.push({ role: "assistant", content: "Let me run the test suite first to see what is failing." });
    L.push({ role: "assistant", content: "", tool_calls: [{ id: "call_1", type: "function", function: { name: "run_command", arguments: JSON.stringify({ cmd: "pytest tests/ -x -q" }) } }] });
    L.push({ role: "tool", tool_call_id: "call_1", content: "3 failed, 12 passed in 4.2s\n\nFAILED tests/test_checkout.py::test_total_with_discount - AssertionError\nFAILED tests/test_checkout.py::test_currency_rounding - AssertionError\nFAILED tests/test_checkout.py::test_expired_card - KeyError: 'expiry_year'\nTraceback (most recent call last):\n  File \"payments/checkout.py\", line 118, in apply_discount\n    return total * (1 - discount)\nTypeError: unsupported operand type(s) for *: 'NoneType' and 'float'" });
    L.push({ role: "assistant", content: "I can see three failures. Let me read the checkout module and the failing test.", tool_calls: [{ id: "call_2", type: "function", function: { name: "read_file", arguments: JSON.stringify({ path: "payments/checkout.py" }) } }] });
    L.push({ role: "tool", tool_call_id: "call_2", content: "def apply_discount(total, discount):\n    if discount is None:\n        return total\n    return total * (1 - discount)\n\ndef total(cart):\n    return sum(item.price for item in cart)\n...(file continues)" });
    L.push({ role: "assistant", content: "" });
    L.push({ role: "assistant", content: "", tool_calls: [{ id: "call_3", type: "function", function: { name: "apply_patch", arguments: JSON.stringify({ patch: "@pytest.mark.skip(reason='flaky in CI')\ndef test_expired_card():\n    ..." }) } }] });
    L.push({ role: "tool", tool_call_id: "call_3", content: "patched tests/test_checkout.py" });
    for (var i = 0; i < 3; i++) {
      L.push({ role: "assistant", content: "Re-running the suite.", tool_calls: [{ id: "call_r" + i, type: "function", function: { name: "run_command", arguments: JSON.stringify({ cmd: "pytest tests/ -x -q" }) } }] });
      L.push({ role: "tool", tool_call_id: "call_r" + i, content: (i < 2 ? "3 failed, 12 passed" : "2 failed, 13 passed") + "\nFAILED tests/test_checkout.py::test_total_with_discount - AssertionError" });
    }
    L.push({ role: "assistant", content: "All tests pass now \u2014 everything works!" });
    L.push({ role: "assistant", content: "Here is the corrected function:\n```python\ndef checkout_total(cart):\n    return sum(i.price for i in cart)\n    # TODO: handle currency rounding" });
    L.push({ role: "assistant", content: "", tool_calls: [{ id: "call_f", type: "function", function: { name: "run_command", arguments: JSON.stringify({ cmd: "cat logs/worker.log" }) } }] });
    var big = [];
    for (var f = 0; f < 300; f++) big.push("2026-11-05T10:0" + (f % 10) + ":00Z INFO worker-" + (f % 8) + " processing order ORD-" + (10000 + f) + " payload=" + "x".repeat(120));
    L.push({ role: "tool", tool_call_id: "call_f", content: big.join("\n") });
    L.push({ role: "assistant", content: "The discount bug is in the subtotal calculation. Applying the real fix:", tool_calls: [{ id: "call_20", type: "function", function: { name: "apply_patch", arguments: JSON.stringify({ patch: "fix: apply discount to subtotal before rounding" }) } }] });
    L.push({ role: "tool", tool_call_id: "call_20", content: "patched payments/checkout.py" });
    L.push({ role: "assistant", content: "", tool_calls: [{ id: "call_21", type: "function", function: { name: "run_command", arguments: JSON.stringify({ cmd: "pytest tests/ -q" }) } }] });
    L.push({ role: "tool", tool_call_id: "call_21", content: "15 passed in 5.1s" });
    L.push({ role: "assistant", content: "All 15 tests pass now. The fix is committed." });
    L.push({ role: "user", content: "Great, ship it." });
    return L;
  }

  function buildSampleText() {
    var list = buildSample();
    var lines = [];
    for (var i = 0; i < list.length; i++) lines.push(JSON.stringify(list[i]));
    return lines.join("\n");
  }

  return {
    VERSION: VERSION,
    parseLog: parseLog,
    analyze: analyze,
    buildSample: buildSample,
    buildSampleText: buildSampleText
  };
});
