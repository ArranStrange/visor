// Environment Configuration
// This file centralizes environment-specific settings

export const ENV_CONFIG = {
  // API Configuration
  GRAPHQL_ENDPOINT:
    import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:4000/graphql",

  // App Configuration
  APP_NAME: "VISOR",
  APP_VERSION: "1.0.0",

  // Feature Flags
  ENABLE_EMAIL_VERIFICATION:
    import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION !== "false",

  // Development Settings
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};

// Environment Variables Documentation:
//
// VITE_GRAPHQL_ENDPOINT - Your GraphQL API endpoint
// VITE_ENABLE_EMAIL_VERIFICATION - Set to "false" to disable email verification
//
// Example .env file:
// VITE_GRAPHQL_ENDPOINT=https://your-api.com/graphql
// VITE_ENABLE_EMAIL_VERIFICATION=true
