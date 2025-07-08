// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to wait for GraphQL operations
Cypress.Commands.add("waitForGraphQL", () => {
  cy.intercept("POST", "/graphql", (req) => {
    req.alias = "graphql";
  });
});

// Custom command to wait for specific GraphQL operation
Cypress.Commands.add("waitForGraphQLOperation", (operationName: string) => {
  cy.intercept("POST", "/graphql", (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName;
    }
  });
});

// Custom command to check if element is visible and clickable
Cypress.Commands.add("shouldBeVisibleAndClickable", (selector: string) => {
  cy.get(selector).should("be.visible").should("not.be.disabled");
});

// Custom command to type with delay (useful for search inputs)
Cypress.Commands.add(
  "typeWithDelay",
  (selector: string, text: string, delay: number = 100) => {
    cy.get(selector).clear().type(text, { delay });
  }
);

// Custom command to scroll to element
Cypress.Commands.add("scrollToElement", (selector: string) => {
  cy.get(selector).scrollIntoView();
});

// Custom command to wait for image to load
Cypress.Commands.add("waitForImage", (selector: string) => {
  cy.get(selector)
    .should("be.visible")
    .and("have.prop", "naturalWidth")
    .should("be.greaterThan", 0);
});

// Custom command to check if element has specific CSS class
Cypress.Commands.add(
  "shouldHaveClass",
  (selector: string, className: string) => {
    cy.get(selector).should("have.class", className);
  }
);

// Custom command to check if element has specific data attribute
Cypress.Commands.add(
  "shouldHaveDataAttr",
  (selector: string, attr: string, value: string) => {
    cy.get(selector).should("have.attr", `data-${attr}`, value);
  }
);

export {};
