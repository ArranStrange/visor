const getGraphQLEndpoint = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const isMobile = hostname !== "localhost" && hostname !== "127.0.0.1";

    if (isMobile && import.meta.env.VITE_GRAPHQL_MOBILE_URI) {
      return import.meta.env.VITE_GRAPHQL_MOBILE_URI;
    }

    if (!isMobile && import.meta.env.VITE_GRAPHQL_URI) {
      return import.meta.env.VITE_GRAPHQL_URI;
    }

    if (isMobile) {
      return `http://${hostname}:4000/graphql`;
    }
  }

  return "http://localhost:4000/graphql";
};

export const ENV_CONFIG = {
  // API Configuration
  GRAPHQL_ENDPOINT: getGraphQLEndpoint(),

  // App Configuration
  APP_NAME: "VISOR",
  APP_VERSION: "1.0.0",

  // Feature Flags
  ENABLE_EMAIL_VERIFICATION:
    import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION !== "false",

  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,

  // Development Settings
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
};
