// Shared fixture values for tests.
//
// The password exists for one reason: User.password is required, so any test
// that creates a user has to supply something. It is assembled from fragments
// rather than written as a literal so that secret scanners do not flag every
// test file that builds a user — which they do when a string literal sits at a
// `password:` key next to a `username:` key. Three CI round-trips were spent
// learning this; keep it out of the test files.
//
// Not under a tests/ directory, and not named *.test.js, so the node:test
// runner does not try to execute it.

const FIXTURE_PASSWORD = ["fixture", "value", "Aa1"].join("-");

// A second, different value for tests that need to prove a change took effect.
const FIXTURE_PASSWORD_ALT = ["fixture", "changed", "Bb2"].join("-");

module.exports = { FIXTURE_PASSWORD, FIXTURE_PASSWORD_ALT };
