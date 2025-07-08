describe("Preset Detail Page", () => {
  beforeEach(() => {
    // Visit a specific preset page (you'll need to replace with actual preset slug)
    cy.visit("/preset/test-preset");
    cy.waitForPageLoad();
  });

  it("should load preset detail page successfully", () => {
    cy.url().should("include", "/preset/");
    cy.get("[data-cy=preset-title]").should("be.visible");
    cy.get("[data-cy=preset-image]").should("be.visible");
  });

  it("should display preset information correctly", () => {
    cy.get("[data-cy=preset-title]").should("be.visible");
    cy.get("[data-cy=preset-author]").should("be.visible");
    cy.get("[data-cy=preset-description]").should("be.visible");
    cy.get("[data-cy=preset-tags]").should("be.visible");
  });

  it("should show before/after comparison", () => {
    cy.get("[data-cy=before-after-slider]").should("be.visible");

    // Test slider interaction
    cy.get("[data-cy=slider-handle]").should("be.visible");
    cy.get("[data-cy=slider-handle]").trigger("mousedown");
    cy.get("[data-cy=slider-handle]").trigger("mousemove", { clientX: 400 });
    cy.get("[data-cy=slider-handle]").trigger("mouseup");
  });

  it("should display XMP settings", () => {
    cy.get("[data-cy=xmp-settings]").should("be.visible");
    cy.get("[data-cy=setting-item]").should("have.length.greaterThan", 0);
  });

  it("should allow downloading preset", () => {
    cy.get("[data-cy=download-preset]").shouldBeVisibleAndClickable();
    cy.get("[data-cy=download-preset]").click();

    // Verify download starts
    cy.readFile("cypress/downloads/*.xmp").should("exist");
  });

  it("should show preset metadata", () => {
    cy.get("[data-cy=preset-metadata]").should("be.visible");
    cy.get("[data-cy=camera-model]").should("be.visible");
    cy.get("[data-cy=lens-info]").should("be.visible");
    cy.get("[data-cy=exposure-info]").should("be.visible");
  });

  it("should handle like/unlike preset", () => {
    cy.get("[data-cy=like-button]").shouldBeVisibleAndClickable();

    // Like the preset
    cy.get("[data-cy=like-button]").click();
    cy.get("[data-cy=like-count]").should("contain", "1");

    // Unlike the preset
    cy.get("[data-cy=like-button]").click();
    cy.get("[data-cy=like-count]").should("contain", "0");
  });

  it("should display comments section", () => {
    cy.scrollToElement("[data-cy=comments-section]");
    cy.get("[data-cy=comments-section]").should("be.visible");
    cy.get("[data-cy=comment-item]").should("have.length.greaterThan", 0);
  });

  it("should allow adding comments", () => {
    cy.scrollToElement("[data-cy=comment-form]");
    cy.get("[data-cy=comment-input]").shouldBeVisibleAndClickable();
    cy.get("[data-cy=comment-input]").type("Great preset!");
    cy.get("[data-cy=submit-comment]").click();

    // Verify comment was added
    cy.get("[data-cy=comment-item]").should("contain", "Great preset!");
  });

  it("should show related presets", () => {
    cy.scrollToElement("[data-cy=related-presets]");
    cy.get("[data-cy=related-presets]").should("be.visible");
    cy.get("[data-cy=related-preset-item]").should(
      "have.length.greaterThan",
      0
    );
  });

  it("should handle share functionality", () => {
    cy.get("[data-cy=share-button]").shouldBeVisibleAndClickable();
    cy.get("[data-cy=share-button]").click();

    cy.get("[data-cy=share-modal]").should("be.visible");
    cy.get("[data-cy=copy-link]").click();

    // Verify link was copied
    cy.window()
      .its("navigator.clipboard")
      .invoke("readText")
      .should("contain", "/preset/");
  });

  it("should display preset statistics", () => {
    cy.get("[data-cy=preset-stats]").should("be.visible");
    cy.get("[data-cy=download-count]").should("be.visible");
    cy.get("[data-cy=view-count]").should("be.visible");
    cy.get("[data-cy=like-count]").should("be.visible");
  });

  it("should handle responsive design", () => {
    cy.viewportPreset("mobile");
    cy.get("[data-cy=preset-title]").should("be.visible");
    cy.get("[data-cy=preset-image]").should("be.visible");

    cy.viewportPreset("tablet");
    cy.get("[data-cy=preset-title]").should("be.visible");
    cy.get("[data-cy=preset-image]").should("be.visible");
  });

  it("should show error for invalid preset", () => {
    cy.visit("/preset/invalid-preset-slug");
    cy.get("[data-cy=error-message]").should("be.visible");
    cy.get("[data-cy=back-to-home]").shouldBeVisibleAndClickable();
  });
});
