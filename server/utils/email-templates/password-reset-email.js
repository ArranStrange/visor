const { renderEmailLayout } = require("./layout");

function createPasswordResetEmailHtml({ username, resetUrl, supportEmail }) {
  return renderEmailLayout({
    title: "Reset Your VISOR Password",
    heading: "Reset your password",
    subheading: `Hi ${username},`,
    body: `
        <h2 style="color: #333; margin-bottom: 20px;">Choose a new password</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          Someone asked to reset the password for your VISOR account. Click the
          button below to choose a new one. The link works once and expires in
          one hour.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" class="button">Reset my password</a>
        </div>

        <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
          Or paste this into your browser:
        </p>
        <p style="word-break: break-all; color: #667eea; font-size: 14px; margin-bottom: 30px;">
          ${resetUrl}
        </p>

        <p style="color: #666; line-height: 1.6;">
          <strong>Didn't ask for this?</strong> You can ignore this email —
          your password stays as it is, and the link expires on its own. If you
          keep getting these, tell us at
          <a href="mailto:${supportEmail}" style="color: #667eea;">${supportEmail}</a>.
        </p>`,
    footer: `
        <p style="margin: 0;">
          For your security, this link expires in one hour and can only be used once.
        </p>
        <p style="margin: 10px 0 0 0;">
          Questions? Email
          <a href="mailto:${supportEmail}" style="color: #999;">${supportEmail}</a>.
        </p>`,
  });
}

module.exports = { createPasswordResetEmailHtml };
