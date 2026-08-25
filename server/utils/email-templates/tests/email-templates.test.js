const assert = require("node:assert/strict");
const test = require("node:test");

const createVerificationEmailHtml = require("../verification-email");
const createWelcomeEmailHtml = require("../welcome-email");

test("verification template includes the recipient and verification details", () => {
  const html = createVerificationEmailHtml({
    username: "Ada",
    verificationUrl: "https://visor.test/verify?token=abc",
    supportEmail: "help@visor.test",
  });

  assert.match(html, /Hi Ada, thanks for joining us!/);
  assert.match(html, /https:\/\/visor\.test\/verify\?token=abc/);
  assert.match(html, /mailto:help@visor\.test/);
});

test("welcome template includes the recipient and login details", () => {
  const html = createWelcomeEmailHtml({
    username: "Ada",
    loginUrl: "https://visor.test/login",
    supportEmail: "help@visor.test",
  });

  assert.match(html, /Hi Ada, your account is now verified!/);
  assert.match(html, /href="https:\/\/visor\.test\/login"/);
  assert.match(html, /mailto:help@visor\.test/);
});
