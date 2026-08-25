const sgMail = require("@sendgrid/mail");
const createVerificationEmailHtml = require("./email-templates/verification-email");
const createWelcomeEmailHtml = require("./email-templates/welcome-email");
const { createLogger } = require("./logger");

const logger = createLogger("email-service");

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@visor.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@visor.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

class EmailService {
  static async sendVerificationEmail(email, username, token) {
    if (!SENDGRID_API_KEY) {
      logger.warn("SendGrid API key not configured.");
      return { success: false, message: "Email service not configured" };
    }

    try {
      const verificationUrl = `${APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(
        email
      )}`;

      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: "VISOR Team",
        },
        replyTo: SUPPORT_EMAIL,
        subject: "Verify your VISOR account",
        html: createVerificationEmailHtml({
          username,
          verificationUrl,
          supportEmail: SUPPORT_EMAIL,
        }),
        text: `
          Welcome to VISOR!
          
          Hi ${username}, thanks for joining us!
          
          To complete your registration and start using VISOR, please verify your email address by clicking the link below:
          
          ${verificationUrl}
          
          This link will expire in 24 hours. If you didn't create a VISOR account, you can safely ignore this email.
          
          Need help? Contact us at ${SUPPORT_EMAIL}
        `,
        // Email tracking
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: true,
          },
          openTracking: {
            enable: true,
          },
          subscriptionTracking: {
            enable: false,
          },
        },

        categories: ["verification", "welcome"],

        headers: {
          "X-Custom-Header": "email-verification",
        },
      };

      const response = await sgMail.send(msg);

      logger.info(
        `Verification email sent to ${email} (messageId: ${response[0]?.headers["x-message-id"]})`
      );

      return {
        success: true,
        message: "Verification email sent successfully",
        messageId: response[0]?.headers["x-message-id"],
      };
    } catch (error) {
      logger.error("Error sending verification email", error);

      if (error.response) {
        logger.error("SendGrid API Error", {
          code: error.code,
          errors: error.response.body?.errors,
        });

        if (error.code === 403) {
          return {
            success: false,
            message: "Email service authentication failed",
          };
        } else if (error.code === 429) {
          return { success: false, message: "Email rate limit exceeded" };
        } else if (error.code === 400) {
          return { success: false, message: "Invalid email request" };
        }
      }

      return { success: false, message: "Failed to send verification email" };
    }
  }

  static async sendWelcomeEmail(email, username) {
    if (!SENDGRID_API_KEY) {
      logger.warn("SendGrid API key not configured. Skipping email send.");
      return { success: false, message: "Email service not configured" };
    }

    try {
      const msg = {
        to: email,
        from: {
          email: FROM_EMAIL,
          name: "VISOR Team",
        },
        replyTo: SUPPORT_EMAIL,
        subject: "Welcome to VISOR! 🎉",
        html: createWelcomeEmailHtml({
          username,
          loginUrl: `${APP_URL}/login`,
          supportEmail: SUPPORT_EMAIL,
        }),
        text: `
          🎉 Welcome to VISOR!
          
          Hi ${username}, your account is now verified!
          
          You're all set to start using VISOR. Visit ${APP_URL}/login to get started.
          
          Thank you for choosing VISOR!
          
          Need help? Contact us at ${SUPPORT_EMAIL}
        `,
        trackingSettings: {
          clickTracking: { enable: true, enableText: true },
          openTracking: { enable: true },
          subscriptionTracking: { enable: false },
        },
        categories: ["welcome", "verification-success"],
      };

      const response = await sgMail.send(msg);

      logger.info(
        `Welcome email sent to ${email} (messageId: ${response[0]?.headers["x-message-id"]})`
      );

      return {
        success: true,
        message: "Welcome email sent successfully",
        messageId: response[0]?.headers["x-message-id"],
      };
    } catch (error) {
      logger.error("Error sending welcome email", error);
      return { success: false, message: "Failed to send welcome email" };
    }
  }

  static async checkServiceStatus() {
    if (!SENDGRID_API_KEY) {
      return {
        status: "not_configured",
        message: "SendGrid API key not configured",
      };
    }

    try {
      const response = await sgMail.send({
        to: "test@example.com",
        from: FROM_EMAIL,
        subject: "Test",
        text: "Test email",
      });

      return { status: "healthy", message: "Email service is working" };
    } catch (error) {
      return {
        status: "error",
        message: "Email service error",
        error: error.message,
      };
    }
  }
}

module.exports = EmailService;
