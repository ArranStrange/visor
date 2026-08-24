import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules"] },
  {
    files: ["**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
