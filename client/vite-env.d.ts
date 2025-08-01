/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string;
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly VITE_ENABLE_EMAIL_VERIFICATION: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_CLOUDINARY_API_KEY: string;
  readonly VITE_CLOUDINARY_API_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
