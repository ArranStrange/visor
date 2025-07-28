describe("Upload Functionality", () => {
  beforeEach(() => {
    cy.visit("/upload");
    cy.waitForPageLoad();
  });

  it("should load upload page successfully", () => {
    cy.url().should("include", "/upload");
    cy.get("[data-cy=upload-form]").should("be.visible");
  });

  it("should switch between preset and film sim upload", () => {
    cy.get("[data-cy=upload-preset-tab]").click();
    cy.get("[data-cy=preset-upload-form]").should("be.visible");

    cy.get("[data-cy=upload-filmsim-tab]").click();
    cy.get("[data-cy=filmsim-upload-form]").should("be.visible");
  });

  it("should upload preset with required fields", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    cy.get("[data-cy=preset-title]").type("Test Preset");
    cy.get("[data-cy=preset-description]").type("A test preset for testing");

    // Upload image
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/test-image.jpg"
    );

    // Upload XMP file
    cy.get("[data-cy=xmp-upload]").selectFile(
      "cypress/fixtures/test-preset.xmp"
    );

    // Add tags
    cy.get("[data-cy=tag-input]").type("test,preset");

    // Submit form
    cy.get("[data-cy=submit-upload]").click();

    // Verify success
    cy.get("[data-cy=upload-success]").should("be.visible");
  });

  it("should upload film sim with required fields", () => {
    cy.get("[data-cy=upload-filmsim-tab]").click();

    // Fill required fields
    cy.get("[data-cy=filmsim-title]").type("Test Film Sim");
    cy.get("[data-cy=filmsim-description]").type("A test film simulation");

    // Upload image
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/test-image.jpg"
    );

    // Add tags
    cy.get("[data-cy=tag-input]").type("test,filmsim");

    // Submit form
    cy.get("[data-cy=submit-upload]").click();

    // Verify success
    cy.get("[data-cy=upload-success]").should("be.visible");
  });

  it("should validate required fields", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Try to submit without required fields
    cy.get("[data-cy=submit-upload]").click();

    // Check for validation errors
    cy.get("[data-cy=title-error]").should("be.visible");
    cy.get("[data-cy=description-error]").should("be.visible");
    cy.get("[data-cy=image-error]").should("be.visible");
  });

  it("should handle file upload errors", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Try to upload invalid file
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/invalid-file.txt"
    );

    // Check for file type error
    cy.get("[data-cy=file-type-error]").should("be.visible");
  });

  it("should show upload progress", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Fill form
    cy.get("[data-cy=preset-title]").type("Test Preset");
    cy.get("[data-cy=preset-description]").type("A test preset");
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/test-image.jpg"
    );

    // Submit and check progress
    cy.get("[data-cy=submit-upload]").click();
    cy.get("[data-cy=upload-progress]").should("be.visible");
  });

  it("should allow image preview", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Upload image
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/test-image.jpg"
    );

    // Check preview
    cy.get("[data-cy=image-preview]").should("be.visible");
  });

  it("should handle drag and drop upload", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Test drag and drop
    cy.get("[data-cy=drop-zone]").selectFile(
      "cypress/fixtures/test-image.jpg",
      { action: "drag-drop" }
    );

    // Verify file was uploaded
    cy.get("[data-cy=uploaded-file]").should("be.visible");
  });

  it("should allow editing upload before submission", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Fill form
    cy.get("[data-cy=preset-title]").type("Test Preset");
    cy.get("[data-cy=preset-description]").type("A test preset");

    // Edit title
    cy.get("[data-cy=preset-title]").clear().type("Updated Test Preset");

    // Verify change
    cy.get("[data-cy=preset-title]").should(
      "have.value",
      "Updated Test Preset"
    );
  });

  it("should handle upload cancellation", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Fill form
    cy.get("[data-cy=preset-title]").type("Test Preset");
    cy.get("[data-cy=preset-description]").type("A test preset");

    // Cancel upload
    cy.get("[data-cy=cancel-upload]").click();

    // Verify form is reset
    cy.get("[data-cy=preset-title]").should("have.value", "");
    cy.get("[data-cy=preset-description]").should("have.value", "");
  });

  it("should show upload guidelines", () => {
    cy.get("[data-cy=upload-guidelines]").should("be.visible");
    cy.get("[data-cy=guidelines-link]").shouldBeVisibleAndClickable();
  });

  it("should handle network errors gracefully", () => {
    cy.get("[data-cy=upload-preset-tab]").click();

    // Intercept network error
    cy.intercept("POST", "/api/upload", { statusCode: 500 });

    // Fill and submit form
    cy.get("[data-cy=preset-title]").type("Test Preset");
    cy.get("[data-cy=preset-description]").type("A test preset");
    cy.get("[data-cy=image-upload]").selectFile(
      "cypress/fixtures/test-image.jpg"
    );
    cy.get("[data-cy=submit-upload]").click();

    // Check for error message
    cy.get("[data-cy=upload-error]").should("be.visible");
  });
});
