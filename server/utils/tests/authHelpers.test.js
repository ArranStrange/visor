const assert = require("node:assert/strict");
const test = require("node:test");

const { requireAdmin } = require("../authHelpers");

// requireAdmin replaced a dozen copies of the same two-step check. These tests
// pin the two failure modes those copies could drift into: letting an
// unauthenticated caller through, and letting a signed-in non-admin through.

test("requireAdmin rejects an anonymous caller", () => {
  assert.throws(() => requireAdmin(null), /Admin access required/);
});

test("requireAdmin rejects a signed-in non-admin", () => {
  assert.throws(() => requireAdmin({ id: "u1" }), /Admin access required/);
  assert.throws(
    () => requireAdmin({ id: "u1", isAdmin: false }),
    /Admin access required/
  );
});

test("requireAdmin surfaces UNAUTHENTICATED so the client can branch on it", () => {
  try {
    requireAdmin({ id: "u1" });
    assert.fail("expected a throw");
  } catch (error) {
    assert.equal(error.extensions.code, "UNAUTHENTICATED");
  }
});

test("requireAdmin returns the admin so call sites can chain", () => {
  const admin = { id: "u2", isAdmin: true };
  assert.equal(requireAdmin(admin), admin);
});

test("requireAdmin uses the caller's message for both failure modes", () => {
  // The message is what the user sees, so a per-site wording must survive.
  assert.throws(
    () => requireAdmin(null, "Only administrators can feature presets"),
    /Only administrators can feature presets/
  );
  assert.throws(
    () => requireAdmin({ id: "u1" }, "Only administrators can feature presets"),
    /Only administrators can feature presets/
  );
});
