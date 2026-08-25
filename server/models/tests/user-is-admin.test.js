const assert = require("node:assert/strict");
const test = require("node:test");

const User = require("../User");

// The GraphQL schema declares `isAdmin: Boolean!` and every admin guard reads
// `user.isAdmin`, so the model has to carry the path with a safe default.

test("User schema declares an isAdmin boolean path", () => {
  const path = User.schema.path("isAdmin");

  assert.ok(path, "expected an isAdmin path on the User schema");
  assert.equal(path.instance, "Boolean");
});

test("isAdmin defaults to false on a new user", () => {
  const user = new User({
    username: "ansel",
    email: "ansel@example.com",
    password: "not-a-real-password",
  });

  assert.equal(user.isAdmin, false);
});
