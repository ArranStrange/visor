// reCAPTCHA Configuration
// Replace these with your actual reCAPTCHA keys from https://www.google.com/recaptcha/admin

export const RECAPTCHA_CONFIG = {
  // Test keys (for development) - replace with your actual keys
  SITE_KEY: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // Replace with your actual site key
  SECRET_KEY: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe", // This should only be used on the backend

  // Production keys (uncomment and replace when deploying)
  // SITE_KEY: "YOUR_PRODUCTION_SITE_KEY",
  // SECRET_KEY: "YOUR_PRODUCTION_SECRET_KEY",
};

// Instructions for setting up reCAPTCHA:
// 1. Go to https://www.google.com/recaptcha/admin
// 2. Create a new site
// 3. Choose reCAPTCHA v2 with "I'm not a robot" checkbox
// 4. Add your domain(s) to the allowed domains
// 5. Copy the site key and secret key
// 6. Replace the keys in this file
// 7. Make sure to use the secret key only on your backend server
