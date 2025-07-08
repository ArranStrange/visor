describe("Search Functionality", () => {
  beforeEach(() => {
    cy.visit("/search");
    cy.waitForPageLoad();
  });

  it("should load the search page successfully", () => {
    cy.url().should("include", "/search");
    cy.get("[data-cy=search-input]").should("be.visible");
  });

  it("should perform basic search", () => {
    const searchTerm = "preset";

    cy.get("[data-cy=search-input]").shouldBeVisibleAndClickable();
    cy.get("[data-cy=search-input]").typeWithDelay(searchTerm);

    // Wait for search results to load
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should filter by content type", () => {
    // Test content type toggle
    cy.get("[data-cy=content-type-toggle]").should("be.visible");

    // Test preset filter
    cy.get("[data-cy=filter-presets]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");

    // Test film sim filter
    cy.get("[data-cy=filter-films]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");

    // Test all content filter
    cy.get("[data-cy=filter-all]").click();
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should handle empty search results", () => {
    const nonExistentTerm = "xyz123nonexistent";

    cy.get("[data-cy=search-input]").typeWithDelay(nonExistentTerm);

    // Check if no results message appears
    cy.get("body").should("contain", "No results found");
  });

  it("should clear search input", () => {
    cy.get("[data-cy=search-input]").type("test search");
    cy.get("[data-cy=search-input]").should("have.value", "test search");

    // Clear the input
    cy.get("[data-cy=search-input]").clear();
    cy.get("[data-cy=search-input]").should("have.value", "");
  });

  it("should handle search with special characters", () => {
    const specialSearch = "test@#$%^&*()";

    cy.get("[data-cy=search-input]").typeWithDelay(specialSearch);
    cy.get("[data-cy=search-input]").should("have.value", specialSearch);
  });

  it("should show tag filters", () => {
    // Check if tags are visible
    cy.get("body").should("contain", "all");

    // Click on a tag filter
    cy.contains("all").click();
  });

  it("should handle search with filters applied", () => {
    // Apply tag filter by clicking on "all"
    cy.contains("all").click();

    // Perform search
    cy.get("[data-cy=search-input]").type("test");

    // Verify results are shown
    cy.get("[data-cy=content-grid]").should("be.visible");
  });

  it("should show content type toggle", () => {
    cy.get("[data-cy=content-type-toggle]").should("be.visible");
  });

  it("should handle responsive design", () => {
    cy.viewportPreset("mobile");
    cy.get("[data-cy=search-input]").should("be.visible");

    cy.viewportPreset("tablet");
    cy.get("[data-cy=search-input]").should("be.visible");
  });
});
