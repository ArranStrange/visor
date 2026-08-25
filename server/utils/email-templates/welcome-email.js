function createWelcomeEmailHtml({ username, loginUrl, supportEmail }) {
  return `
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
                    <a href="${loginUrl}" class="button">
                        Start Using VISOR
          </a>
        </div>
        
                <div class="footer">
                    <p style="margin: 0;">
                        Thank you for choosing VISOR! If you have any questions, feel free to contact us at <a href="mailto:${supportEmail}">${supportEmail}</a>
          </p>
        </div>
      </div>
    </div>
    </body>
    </html>
  `;
}

module.exports = createWelcomeEmailHtml;
