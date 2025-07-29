// Environment Configuration
// This file centralizes environment-specific settings

export const ENV_CONFIG = {
  // reCAPTCHA Configuration
  RECAPTCHA_SITE_KEY:
    import.meta.env.VITE_RECAPTCHA_SITE_KEY ||
    "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI",

  // API Configuration
  GRAPHQL_ENDPOINT:
    import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",

  // App Configuration
  APP_NAME: "VISOR",
  APP_VERSION: "1.0.0",

  // Feature Flags
  ENABLE_EMAIL_VERIFICATION:
    import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION !== "false",
  ENABLE_RECAPTCHA: import.meta.env.VITE_ENABLE_RECAPTCHA !== "false",

  // Development Settings
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Environment Variables Documentation:
//
// VITE_RECAPTCHA_SITE_KEY - Your reCAPTCHA site key
// VITE_GRAPHQL_ENDPOINT - Your GraphQL API endpoint
// VITE_ENABLE_EMAIL_VERIFICATION - Set to "false" to disable email verification
// VITE_ENABLE_RECAPTCHA - Set to "false" to disable reCAPTCHA
//
// Example .env file:
// VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
// VITE_GRAPHQL_ENDPOINT=https://your-api.com/graphql
// VITE_ENABLE_EMAIL_VERIFICATION=true
// VITE_ENABLE_RECAPTCHA=true
