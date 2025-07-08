describe("Navigation", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForPageLoad();
  });

  it("should load the home page successfully", () => {
    cy.url().should("eq", Cypress.config().baseUrl + "/");
    cy.get("body").should("be.visible");
  });

  it("should have app container and home page", () => {
    cy.get("[data-cy=app-container]").should("be.visible");
    cy.get("[data-cy=home-page]").should("be.visible");
  });

  it("should navigate to search page", () => {
    cy.visit("/search");
    cy.url().should("include", "/search");
    cy.get("[data-cy=search-input]").should("be.visible");
  });

  it("should navigate to login page", () => {
    cy.visit("/login");
    cy.url().should("include", "/login");
    cy.get("[data-cy=login-page]").should("be.visible");
    cy.get("[data-cy=login-title]").should("contain", "Sign In to VISOR");
  });

  it("should navigate to upload page", () => {
    cy.visit("/upload");
    cy.url().should("include", "/upload");
    cy.get("[data-cy=upload-page]").should("be.visible");
    cy.get("[data-cy=upload-title]").should("contain", "Upload");
  });

  it("should have content type toggle on home page", () => {
    cy.get("[data-cy=content-type-toggle]").should("be.visible");
  });

  it("should have content grid on home page", () => {
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should handle browser back and forward navigation", () => {
    cy.visit("/search");
    cy.url().should("include", "/search");

    cy.go("back");
    cy.url().should("eq", Cypress.config().baseUrl + "/");

    cy.go("forward");
    cy.url().should("include", "/search");
  });

  it("should maintain navigation state after page refresh", () => {
    cy.visit("/search");
    cy.url().should("include", "/search");

    cy.reload();
    cy.url().should("include", "/search");
  });
});
