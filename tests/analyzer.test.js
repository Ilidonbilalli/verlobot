/* Verlobot analyzer tests — run with: node tests/analyzer.test.js */
"use strict";
var assert = require("assert");
var A = require("../site/analyzer.js");

var results = [];
function test(name, fn) {
  try { fn(); results.push("PASS  " + name); }
  catch (e) { results.push("FAIL  " + name + "\n      " + e.message); process.exitCode = 1; }
}

test("parses JSONL and finds all leak types in the sample", function () {
  var parsed = A.parseLog(A.buildSampleText());
  assert.strictEqual(parsed.mode, "jsonl");
  var report = A.analyze(parsed.events);
  var ids = report.leaks.map(function (l) { return l.id; });
  ["silent", "repeats", "errors", "claims", "weaken", "trunc", "prose", "flood"].forEach(function (id) {
    assert.ok(ids.indexOf(id) >= 0, "missing leak type: " + id + " (found: " + ids.join(", ") + ")");
  });
  assert.ok(report.score < 60, "sample should score badly, got " + report.score);
});

test("parses a JSON array of messages", function () {
  var text = JSON.stringify([
    { role: "assistant", content: "" },
    { role: "tool", content: "Traceback: SyntaxError" },
    { role: "assistant", content: "All tests pass now!" }
  ]);
  var parsed = A.parseLog(text);
  assert.strictEqual(parsed.mode, "json");
  var report = A.analyze(parsed.events);
  assert.ok(report.totals.assistant === 2, "expected 2 assistant turns, got " + report.totals.assistant);
  assert.ok(report.leaks.some(function (l) { return l.id === "claims"; }), "expected a false-success claim");
});

test("parses OpenAI-style tool_calls and counts them", function () {
  var lines = [
    JSON.stringify({ role: "assistant", content: "hi", tool_calls: [{ id: "a", type: "function", function: { name: "run", arguments: "{\"cmd\":\"ls\"}" } }] }),
    JSON.stringify({ role: "tool", tool_call_id: "a", content: "file1\nfile2" })
  ].join("\n");
  var parsed = A.parseLog(lines);
  var report = A.analyze(parsed.events);
  assert.strictEqual(report.totals.toolCalls, 1);
  assert.strictEqual(report.totals.tool, 1);
});

test("parses Anthropic-style content blocks", function () {
  var lines = [
    JSON.stringify({ role: "assistant", content: [{ type: "text", text: "working" }, { type: "tool_use", id: "t1", name: "bash", input: { cmd: "make" } }] }),
    JSON.stringify({ role: "user", content: [{ type: "tool_result", tool_use_id: "t1", content: "error: build failed", is_error: true }] })
  ].join("\n");
  var parsed = A.parseLog(lines);
  assert.strictEqual(parsed.events[0].toolCalls.length, 1, "tool_use not parsed");
  assert.strictEqual(parsed.events[1].role, "tool", "tool_result not recognized");
  assert.strictEqual(parsed.events[1].isError, true);
});

test("clean log scores high", function () {
  var lines = [
    JSON.stringify({ role: "user", content: "add a test" }),
    JSON.stringify({ role: "assistant", content: "Reading the file.", tool_calls: [{ id: "a", type: "function", function: { name: "read", arguments: "{\"p\":\"x.py\"}" } }] }),
    JSON.stringify({ role: "tool", tool_call_id: "a", content: "print('hi')" }),
    JSON.stringify({ role: "assistant", content: "Writing the test.", tool_calls: [{ id: "b", type: "function", function: { name: "write", arguments: "{\"p\":\"test_x.py\"}" } }] }),
    JSON.stringify({ role: "tool", tool_call_id: "b", content: "ok" }),
    JSON.stringify({ role: "assistant", content: "Added the test. 1 passed." })
  ].join("\n");
  var report = A.analyze(A.parseLog(lines).events);
  assert.ok(report.score >= 85, "clean log should score >= 85, got " + report.score);
});

test("raw text logs fall back and still analyze", function () {
  var text = "starting run...\nerror: cannot connect to database\nretrying...\nerror: cannot connect to database\nretrying...\nerror: cannot connect to database";
  var parsed = A.parseLog(text);
  assert.strictEqual(parsed.mode, "text");
  var report = A.analyze(parsed.events);
  assert.ok(report.totals.raw >= 6, "raw lines should be counted");
});

console.log(results.join("\n"));
console.log(results.every(function (r) { return r.indexOf("PASS") === 0; }) ? "\nAll tests passed." : "\nSome tests failed.");
