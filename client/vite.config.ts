// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // SFG20-style path aliases
      lib: path.resolve(__dirname, "./src/lib"),
      routes: path.resolve(__dirname, "./src/routes"),
      plugins: path.resolve(__dirname, "./src/plugins"),
      components: path.resolve(__dirname, "./src/components"),
      hooks: path.resolve(__dirname, "./src/hooks"),
      context: path.resolve(__dirname, "./src/context"),
      utils: path.resolve(__dirname, "./src/utils"),
      types: path.resolve(__dirname, "./src/types"),
      config: path.resolve(__dirname, "./src/config"),
      theme: path.resolve(__dirname, "./src/theme"),
      core: path.resolve(__dirname, "./src/core"),
      styles: path.resolve(__dirname, "./src/styles"),
      constants: path.resolve(__dirname, "./src/constants"),
      "@gql": path.resolve(__dirname, "./src/graphql"),
    },
  },
  optimizeDeps: {
    // Force re-optimization when dependencies change
    force: false,
    // Include dependencies that might need optimization
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@apollo/client",
      "@mui/material",
      "@mui/icons-material",
    ],
  },
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
