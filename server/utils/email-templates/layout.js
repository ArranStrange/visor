// Shared chrome for transactional email.
//
// Email clients strip <style> blocks unpredictably, so the structural CSS lives
// here once and anything that must survive Gmail is inlined at the call site.
// Extracted when the third template arrived rather than duplicating it again.

const SHARED_STYLES = `
      body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
      .content { background: #f8f9fa; padding: 40px; border-radius: 0 0 10px 10px; }
      .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; }
      .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; }
      @media only screen and (max-width: 600px) {
        .container { padding: 10px; }
        .header, .content { padding: 20px; }
      }`;

/**
 * @param {object} params
 * @param {string} params.title      Browser/preview title.
 * @param {string} params.heading    Large text in the coloured header.
 * @param {string} params.subheading Line under the heading (usually a greeting).
 * @param {string} params.body       HTML for the white panel.
 * @param {string} params.footer     HTML for the small print.
 */
const renderEmailLayout = ({ title, heading, subheading, body, footer }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>${SHARED_STYLES}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 32px;">${heading}</h1>
            ${subheading ? `<p style="margin: 10px 0 0 0; font-size: 18px;">${subheading}</p>` : ""}
        </div>

        <div class="content">
${body}

            <div class="footer">
${footer}
            </div>
        </div>
    </div>
</body>
</html>
`;

module.exports = { renderEmailLayout, SHARED_STYLES };
