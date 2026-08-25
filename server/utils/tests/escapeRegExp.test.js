const assert = require("node:assert/strict");
const test = require("node:test");

const { escapeRegExp } = require("../escapeRegExp");

test("escapes every regular-expression metacharacter", () => {
  assert.equal(escapeRegExp("."), "\\.");
  assert.equal(escapeRegExp("*"), "\\*");
  assert.equal(escapeRegExp("+"), "\\+");
  assert.equal(escapeRegExp("?"), "\\?");
  assert.equal(escapeRegExp("^"), "\\^");
  assert.equal(escapeRegExp("$"), "\\$");
  assert.equal(escapeRegExp("{"), "\\{");
  assert.equal(escapeRegExp("}"), "\\}");
  assert.equal(escapeRegExp("("), "\\(");
  assert.equal(escapeRegExp(")"), "\\)");
  assert.equal(escapeRegExp("|"), "\\|");
  assert.equal(escapeRegExp("["), "\\[");
  assert.equal(escapeRegExp("]"), "\\]");
  assert.equal(escapeRegExp("\\"), "\\\\");
});

test("leaves ordinary search text untouched", () => {
  assert.equal(escapeRegExp("Fujifilm X-T5"), "Fujifilm X-T5");
  assert.equal(escapeRegExp(""), "");
});

test("returns an empty string for null and undefined", () => {
  assert.equal(escapeRegExp(null), "");
  assert.equal(escapeRegExp(undefined), "");
});

test("an unbalanced paren no longer throws when compiled", () => {
  assert.throws(() => new RegExp("("));
  assert.doesNotThrow(() => new RegExp(escapeRegExp("(")));
});

test("escaped input matches literally, not as a pattern", () => {
  const literal = new RegExp(escapeRegExp("a.c"), "i");

  assert.ok(literal.test("a.c"));
  assert.ok(!literal.test("abc"));
});

test("a wildcard search no longer matches everything", () => {
  const literal = new RegExp(escapeRegExp(".*"), "i");

  assert.ok(!literal.test("anything"));
  assert.ok(literal.test("prefix .* suffix"));
});
