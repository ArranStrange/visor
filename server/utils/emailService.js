const sgMail = require("@sendgrid/mail");

// Initialize SendGrid with API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@visor.com";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

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
        from: FROM_EMAIL,
        subject: "Verify your VISOR account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 32px;">Welcome to VISOR!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Hi ${username}, thanks for joining us!</p>
            </div>
            
            <div style="padding: 40px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                To complete your registration and start using VISOR, please click the button below to verify your email address:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold; 
                          display: inline-block;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, you can copy and paste this link into your browser:
              </p>
              <p style="color: #667eea; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  This link will expire in 24 hours. If you didn't create a VISOR account, you can safely ignore this email.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          Welcome to VISOR!
          
          Hi ${username}, thanks for joining us!
          
          To complete your registration and start using VISOR, please verify your email address by clicking the link below:
          
          ${verificationUrl}
          
          This link will expire in 24 hours. If you didn't create a VISOR account, you can safely ignore this email.
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: "Verification email sent successfully" };
    } catch (error) {
      console.error("Error sending verification email:", error);
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
        from: FROM_EMAIL,
        subject: "Welcome to VISOR!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 32px;">Welcome to VISOR!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Hi ${username}, your account is now verified!</p>
            </div>
            
            <div style="padding: 40px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">You're All Set!</h2>
              <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
                Your email has been verified and your VISOR account is now active. You can start exploring presets, film simulations, and connecting with other photographers!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${APP_URL}" 
                   style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                          color: white; 
                          padding: 15px 30px; 
                          text-decoration: none; 
                          border-radius: 5px; 
                          font-weight: bold; 
                          display: inline-block;">
                  Start Exploring VISOR
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  Thank you for joining the VISOR community!
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
          Welcome to VISOR!
          
          Hi ${username}, your account is now verified!
          
          Your email has been verified and your VISOR account is now active. You can start exploring presets, film simulations, and connecting with other photographers!
          
          Visit ${APP_URL} to get started.
          
          Thank you for joining the VISOR community!
        `,
      };

      await sgMail.send(msg);
      return { success: true, message: "Welcome email sent successfully" };
    } catch (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, message: "Failed to send welcome email" };
    }
  }
}

module.exports = EmailService;
