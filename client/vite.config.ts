// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    open: true,
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {

          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-mui": [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          "vendor-apollo": ["@apollo/client", "graphql", "graphql-tag"],
          "vendor-animations": ["framer-motion", "react-intersection-observer"],
        },
      
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },

    chunkSizeWarningLimit: 600,
  },
});
