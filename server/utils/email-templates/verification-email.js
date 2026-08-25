function createVerificationEmailHtml({
  username,
  verificationUrl,
  supportEmail,
}) {
  return `
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
                        Need help? Contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
                    </p>
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
}

module.exports = createVerificationEmailHtml;
