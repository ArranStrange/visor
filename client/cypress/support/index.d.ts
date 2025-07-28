/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    viewportPreset(preset: "mobile" | "tablet" | "desktop"): Chainable<void>;
    waitForPageLoad(): Chainable<void>;
    login(email: string, password: string): Chainable<void>;
    logout(): Chainable<void>;
    waitForGraphQL(): Chainable<void>;
    waitForGraphQLOperation(operationName: string): Chainable<void>;
    shouldBeVisibleAndClickable(selector: string): Chainable<void>;
    typeWithDelay(
      selector: string,
      text: string,
      delay?: number
    ): Chainable<void>;
    scrollToElement(selector: string): Chainable<void>;
    waitForImage(selector: string): Chainable<void>;
    shouldHaveClass(selector: string, className: string): Chainable<void>;
    shouldHaveDataAttr(
      selector: string,
      attr: string,
      value: string
    ): Chainable<void>;
  }
}
