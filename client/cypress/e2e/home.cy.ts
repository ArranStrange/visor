describe("Home Page", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.waitForPageLoad();
  });

  it("should load the home page with all required elements", () => {
    cy.get("[data-cy=app-container]").should("be.visible");
    cy.get("[data-cy=home-page]").should("be.visible");

    cy.get("[data-cy=content-type-toggle]").should("be.visible");

    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should have content type filter buttons", () => {
    cy.get("[data-cy=filter-all]").should("be.visible");
    cy.get("[data-cy=filter-presets]").should("be.visible");
    cy.get("[data-cy=filter-films]").should("be.visible");
  });

  it("should display content cards", () => {
    cy.get("[data-cy=content-grid]").should("be.visible");

    cy.get("[data-cy=preset-card], [data-cy=filmsim-card]").should(
      "have.length.greaterThan",
      0
    );
  });

  it("should have working content type filters", () => {
    cy.get("[data-cy=filter-presets]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");

    cy.get("[data-cy=filter-films]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");

    cy.get("[data-cy=filter-all]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should handle responsive design", () => {
    cy.viewportPreset("mobile");
    cy.get("[data-cy=content-type-toggle]").should("be.visible");
    cy.get("[data-cy=content-grid]").should("be.visible");

    cy.viewportPreset("tablet");
    cy.get("[data-cy=content-type-toggle]").should("be.visible");
    cy.get("[data-cy=content-grid]").should("be.visible");

    cy.viewportPreset("desktop");
    cy.get("[data-cy=content-type-toggle]").should("be.visible");
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should have proper page structure", () => {
    cy.get("body").should("be.visible");
    cy.get("[data-cy=app-container]").should("be.visible");
    cy.get("[data-cy=home-page]").should("be.visible");
  });
});
