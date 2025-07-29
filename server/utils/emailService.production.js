const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@visor.com";
const APP_URL = process.env.APP_URL || "https://visor.com";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "support@visor.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

class EmailService {
  static async sendVerificationEmail(email, username, token) {
    if (!SENDGRID_API_KEY) {
      console.warn("SendGrid API key not configured. Skipping email send.");
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
        templateId: process.env.SENDGRID_VERIFICATION_TEMPLATE_ID, // Optional: Use SendGrid template
        dynamicTemplateData: {
          username: username,
          verification_url: verificationUrl,
          app_name: "VISOR",
          support_email: SUPPORT_EMAIL,
        },
        // Fallback HTML if template is not used
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your VISOR Account</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
                  .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px; }
                  .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
                  @media only screen and (max-width: 600px) {
                      .container { padding: 10px; }
                      .header, .content { padding: 20px; }
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1 style="margin: 0; font-size: 32px;">Welcome to VISOR!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 18px;">Hi ${username}, thanks for joining us!</p>
                  </div>
                  
                  <div class="content">
                      <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
                      <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                          To complete your registration and start using VISOR, please click the button below to verify your email address:
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                          <a href="${verificationUrl}" class="button">
                              Verify Email Address
                          </a>
                      </div>
                      
                      <p style="color: #666; font-size: 14px; margin-top: 30px;">
                          If the button doesn't work, you can copy and paste this link into your browser:
                      </p>
                      <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                          ${verificationUrl}
                      </p>
                      
                      <div class="footer">
                          <p style="margin: 0;">
                              This link will expire in 24 hours. If you didn't create a VISOR account, you can safely ignore this email.
                          </p>
                          <p style="margin: 10px 0 0 0;">
                              Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
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
        // Categories for analytics
        categories: ["verification", "welcome"],
        // Custom headers
        headers: {
          "X-Custom-Header": "email-verification",
        },
      };

      const response = await sgMail.send(msg);

      // Log successful email send
      console.log(`✅ Verification email sent to ${email}`, {
        messageId: response[0]?.headers["x-message-id"],
        statusCode: response[0]?.statusCode,
      });

      return {
        success: true,
        message: "Verification email sent successfully",
        messageId: response[0]?.headers["x-message-id"],
      };
    } catch (error) {
      console.error("❌ Error sending verification email:", error);

      // Enhanced error handling
      if (error.response) {
        const { body } = error.response;
        console.error("SendGrid API Error:", {
          statusCode: error.code,
          errors: body?.errors,
          message: body?.message,
        });

        // Handle specific SendGrid errors
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
      console.warn("SendGrid API key not configured. Skipping email send.");
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
        templateId: process.env.SENDGRID_WELCOME_TEMPLATE_ID, // Optional: Use SendGrid template
        dynamicTemplateData: {
          username: username,
          app_name: "VISOR",
          support_email: SUPPORT_EMAIL,
          login_url: `${APP_URL}/login`,
        },
        // Fallback HTML
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to VISOR!</title>
              <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
                  .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px; }
                  .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
                  .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="header">
                      <h1 style="margin: 0; font-size: 32px;">🎉 Welcome to VISOR!</h1>
                      <p style="margin: 10px 0 0 0; font-size: 18px;">Hi ${username}, your account is now verified!</p>
                  </div>
                  
                  <div class="content">
                      <h2 style="color: #333; margin-bottom: 20px;">You're All Set!</h2>
                      <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                          Your email has been successfully verified. You can now access all features of VISOR and start exploring!
                      </p>
                      
                      <div style="text-align: center; margin: 30px 0;">
                          <a href="${APP_URL}/login" class="button">
                              Start Using VISOR
                          </a>
                      </div>
                      
                      <div class="footer">
                          <p style="margin: 0;">
                              Thank you for choosing VISOR! If you have any questions, feel free to contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
                          </p>
                      </div>
                  </div>
              </div>
          </body>
          </html>
        `,
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

      console.log(`✅ Welcome email sent to ${email}`, {
        messageId: response[0]?.headers["x-message-id"],
        statusCode: response[0]?.statusCode,
      });

      return {
        success: true,
        message: "Welcome email sent successfully",
        messageId: response[0]?.headers["x-message-id"],
      };
    } catch (error) {
      console.error("❌ Error sending welcome email:", error);
      return { success: false, message: "Failed to send welcome email" };
    }
  }

  // Utility method to check email service status
  static async checkServiceStatus() {
    if (!SENDGRID_API_KEY) {
      return {
        status: "not_configured",
        message: "SendGrid API key not configured",
      };
    }

    try {
      // Test API key by making a simple request
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
