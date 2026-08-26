const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const User = require("../User");

test("User schema declares a primaryCamera string path", () => {
  const primaryCamera = User.schema.path("primaryCamera");

  assert.ok(primaryCamera, "expected a primaryCamera path on the User schema");
  assert.equal(primaryCamera.instance, "String");
});

test("primaryCamera is unset on a new user", () => {
  const user = new User({
    username: "ansel",
    email: "ansel@example.com",
    password: "not-a-real-password",
  });

  assert.equal(user.primaryCamera, undefined);
});

// updateProfile takes an untyped JSON input, so the allow-list in the
// resolver is the only thing standing between a client and an arbitrary
// field write. These read the source because the resolver needs a live Mongo
// connection to run.
const mutationSource = fs.readFileSync(
  path.join(__dirname, "../../schema/resolvers/user/mutations.js"),
  "utf8"
);

test("updateProfile validates primaryCamera against the catalogue", () => {
  assert.match(
    mutationSource,
    /updateFields\.primaryCamera = normalizePrimaryCamera\(/,
    "primaryCamera must go through normalizePrimaryCamera, not straight into the update"
  );
  assert.match(
    mutationSource,
    /const camera = findCamera\(value\);/,
    "normalizePrimaryCamera must resolve names through the camera catalogue"
  );
});

test("updateProfile still refuses to set isAdmin", () => {
  assert.doesNotMatch(
    mutationSource,
    /updateFields\.isAdmin/,
    "isAdmin must never be settable through updateProfile"
  );
});
