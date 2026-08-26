const assert = require("node:assert/strict");
const test = require("node:test");

const createVerificationEmailHtml = require("../verification-email");
const createWelcomeEmailHtml = require("../welcome-email");
const { createPasswordResetEmailHtml } = require("../password-reset-email");
const { renderEmailLayout } = require("../layout");

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

test("password reset template includes the recipient and reset details", () => {
  const html = createPasswordResetEmailHtml({
    username: "Ada",
    resetUrl: "https://visor.test/reset-password?token=abc&email=ada%40visor.test",
    supportEmail: "help@visor.test",
  });

  assert.match(html, /Hi Ada,/);
  assert.match(
    html,
    /href="https:\/\/visor\.test\/reset-password\?token=abc&email=ada%40visor\.test"/
  );
  assert.match(html, /mailto:help@visor\.test/);
});

test("password reset template tells the user the link is single-use and expiring", () => {
  const html = createPasswordResetEmailHtml({
    username: "Ada",
    resetUrl: "https://visor.test/reset-password?token=abc",
    supportEmail: "help@visor.test",
  });

  assert.match(html, /expires in one hour/i);
  assert.match(html, /only be used once|works once/i);
  assert.match(html, /Didn't ask for this/i, "tells an unexpecting recipient what to do");
});

test("password reset template never contains the raw token outside the link", () => {
  // The token belongs in the URL only. Anything that echoes it into visible
  // copy risks it being quoted into a support thread or a screenshot.
  const html = createPasswordResetEmailHtml({
    username: "Ada",
    resetUrl: "https://visor.test/reset-password?token=SECRETTOKEN",
    supportEmail: "help@visor.test",
  });

  const withoutUrls = html.replace(/https:\/\/visor\.test\/\S*/g, "");
  assert.doesNotMatch(withoutUrls, /SECRETTOKEN/);
});

test("the shared layout omits the subheading paragraph when there is none", () => {
  const withSub = renderEmailLayout({
    title: "t",
    heading: "h",
    subheading: "sub",
    body: "b",
    footer: "f",
  });
  const withoutSub = renderEmailLayout({
    title: "t",
    heading: "h",
    subheading: "",
    body: "b",
    footer: "f",
  });

  assert.match(withSub, /sub/);
  assert.doesNotMatch(withoutSub, /font-size: 18px/);
});
