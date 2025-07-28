// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add global error handling
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test on uncaught exceptions
  return false;
});

// Add custom viewport sizes for responsive testing
Cypress.Commands.add(
  "viewportPreset",
  (preset: "mobile" | "tablet" | "desktop") => {
    const sizes = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 720 },
    };
    cy.viewport(sizes[preset].width, sizes[preset].height);
  }
);

// Custom command to wait for page load
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.window().its("document").its("readyState").should("eq", "complete");
});

// Custom command to login (if needed for tests)
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("[data-cy=email-input]").type(email);
  cy.get("[data-cy=password-input]").type(password);
  cy.get("[data-cy=login-button]").click();
  cy.url().should("not.include", "/login");
});

// Custom command to logout
Cypress.Commands.add("logout", () => {
  cy.get("[data-cy=user-menu]").click();
  cy.get("[data-cy=logout-button]").click();
  cy.url().should("include", "/login");
});

declare global {
  namespace Cypress {
    interface Chainable {
      viewportPreset(preset: "mobile" | "tablet" | "desktop"): Chainable<void>;
      waitForPageLoad(): Chainable<void>;
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
    }
  }
}
