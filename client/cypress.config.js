const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    supportFile: "cypress/support/e2e.ts",
    specPattern: [
      "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
      "src/**/tests/**/*.cy.{js,jsx,ts,tsx}",
      "src/**/test/**/*.cy.{js,jsx,ts,tsx}",
    ],
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
  },
});
