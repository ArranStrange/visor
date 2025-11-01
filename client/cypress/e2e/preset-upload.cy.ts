describe("Preset Upload Flow with XMP Parser", () => {
  const testPreset = {
    title: `Test Preset ${Date.now()}`,
    description: "Test preset upload with XMP parser",
    tags: ["test", "xmp"],
    notes: "Testing XMP parser extraction",
  };

  beforeEach(() => {
    cy.visit("/login");
  });

  const performLogin = () => {
    cy.window().then((win) => {
      const token =
        win.localStorage.getItem("authToken") ||
        win.sessionStorage.getItem("authToken");
      if (token) {
        cy.visit("/");
      } else {
        cy.visit("/login");
        cy.get('[data-cy="login-page"]').should("be.visible");
        cy.get('[data-cy="login-email-input"]').type(
          "arranstrange@googlemail.com"
        );
        cy.get('[data-cy="login-password-input"]').type("Admin1234!");
        cy.get('[data-cy="login-submit-button"]').click();
        cy.wait(5000);
      }
    });
  };

  it("should parse XMP file and upload preset with all settings", () => {
    performLogin();

    // Navigate to preset upload page
    cy.get('[data-testid="upload-icon"]').click();
    cy.get('[data-cy="upload-preset-button"]').click();
    cy.wait(1000);

    // Fill in title
    cy.get('[data-cy="preset-title-input"]').type(testPreset.title);

    // Fill in description
    cy.get('[data-cy="preset-description-input"]').type(testPreset.description);

    // Upload XMP file
    cy.get('[data-cy="xmp-file-input"]').selectFile(
      "cypress/fixtures/Duotone cyan.xmp",
      { force: true }
    );

    // Wait for XMP parser to process the file and verify settings are parsed
    cy.wait(2000);
    cy.contains("Parsed Settings Preview").should("be.visible");
    cy.contains("Lightroom File Uploaded").should("be.visible");

    // Verify that key settings from the XMP file are displayed
    // The XMP file has:
    // - Contrast2012="+5" -> should be 500 (converted: 5 * 100)
    // - Highlights2012="-25" -> should be -2500
    // - Shadows2012="+40" -> should be 4000
    // - Whites2012="-10" -> should be -1000
    // - Blacks2012="+30" -> should be 3000
    // - Clarity2012="+30" -> should be 3000
    // - Vibrance="-5" -> should be -500
    // - Saturation="-5" -> should be -500

    // Add tags
    testPreset.tags.forEach((tag) => {
      cy.get('[data-cy="preset-tags-input"]').type(tag);
      cy.get('[data-cy="preset-tags-input"]').type("{enter}");
    });

    // Upload before image
    cy.get('[data-cy="before-image-input"]').selectFile(
      "cypress/fixtures/Before.jpg",
      { force: true }
    );
    cy.wait(5000); // Wait for Cloudinary upload

    // Upload after image
    cy.get('[data-cy="after-image-input"]').selectFile(
      "cypress/fixtures/After.jpg",
      { force: true }
    );
    cy.wait(5000); // Wait for Cloudinary upload

    // Fill in notes
    cy.get('[data-cy="preset-notes-input"]').type(testPreset.notes);

    // Submit the form
    cy.get('[data-cy="preset-submit-button"]').click();

    // Verify redirect to preset detail page
    cy.url().should("include", "/preset/");
    cy.contains(testPreset.title).should("be.visible");
  });

  it("should validate required fields before submission", () => {
    performLogin();

    cy.get('[data-testid="upload-icon"]').click();
    cy.get('[data-cy="upload-preset-button"]').click();
    cy.wait(1000);

    // Try to submit without filling required fields
    cy.get('[data-cy="preset-submit-button"]').click();

    // Should show validation errors
    cy.contains("Please upload an XMP file first").should("be.visible");

    // Fill title but still missing other required fields
    cy.get('[data-cy="preset-title-input"]').type(testPreset.title);
    cy.get('[data-cy="preset-submit-button"]').click();
    cy.contains("At least one tag is required").should("be.visible");
  });
});
