const assert = require("node:assert/strict");
const test = require("node:test");

const { consume, reset, clearAll } = require("../rateLimiter");

const opts = { limit: 3, windowMs: 60_000 };

test("allows attempts up to the limit", () => {
  clearAll();
  assert.equal(consume("a", opts).allowed, true);
  assert.equal(consume("a", opts).allowed, true);
  assert.equal(consume("a", opts).allowed, true);
});

test("blocks once the limit is reached", () => {
  clearAll();
  for (let i = 0; i < 3; i += 1) consume("b", opts);

  const result = consume("b", opts);
  assert.equal(result.allowed, false);
  assert.equal(result.remaining, 0);
  assert.ok(result.retryAfterSeconds > 0, "tells the caller when to come back");
});

test("reports remaining attempts", () => {
  clearAll();
  assert.equal(consume("c", opts).remaining, 2);
  assert.equal(consume("c", opts).remaining, 1);
  assert.equal(consume("c", opts).remaining, 0);
});

test("keys are independent", () => {
  clearAll();
  for (let i = 0; i < 3; i += 1) consume("d", opts);

  assert.equal(consume("d", opts).allowed, false);
  assert.equal(consume("e", opts).allowed, true, "a different key is unaffected");
});

test("the window slides — old attempts stop counting", () => {
  clearAll();
  const start = 1_000_000;

  for (let i = 0; i < 3; i += 1) {
    consume("f", { ...opts, now: start + i });
  }
  assert.equal(consume("f", { ...opts, now: start + 10 }).allowed, false);

  // Just past the window: the earliest attempts have aged out.
  const later = start + opts.windowMs + 1;
  assert.equal(consume("f", { ...opts, now: later }).allowed, true);
});

test("retryAfterSeconds counts from the oldest attempt in the window", () => {
  clearAll();
  const start = 2_000_000;
  for (let i = 0; i < 3; i += 1) consume("g", { ...opts, now: start });

  const blocked = consume("g", { ...opts, now: start + 20_000 });
  assert.equal(blocked.allowed, false);
  // 60s window, 20s elapsed, so roughly 40s left.
  assert.equal(blocked.retryAfterSeconds, 40);
});

test("reset clears a key so a successful flow does not penalise the user", () => {
  clearAll();
  for (let i = 0; i < 3; i += 1) consume("h", opts);
  assert.equal(consume("h", opts).allowed, false);

  reset("h");

  assert.equal(consume("h", opts).allowed, true);
});

test("requires a key and a configured limit", () => {
  clearAll();
  assert.throws(() => consume("", opts), /requires a key/);
  assert.throws(() => consume(undefined, opts), /requires a key/);
  assert.throws(() => consume("i", { windowMs: 1000 }), /limit and windowMs/);
  assert.throws(() => consume("i", { limit: 5 }), /limit and windowMs/);
});
