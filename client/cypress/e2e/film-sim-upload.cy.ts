import { ThemeContext } from "@emotion/react";

describe("Film Sim Upload and Delete", () => {
  const testFilmSim = {
    name: `Test Film Simulation ${Date.now()}`,
    description: "Test film simulation Upload and Delete",
  };

  const testFilmSimUpload = {
    name: `Test Film Simulation ${new Date().toLocaleString()}`,
    description: `Test film simulation Upload and Delete ${new Date().toLocaleString()}`,
    tags: "test",
    sampleImages: ["Film Sim Test Image.webp"],
    notes: "Test film simulation Upload and Delete",
  };

  beforeEach(() => {
    // Login as test user before each test
    cy.loginAsTestUser();
  });

  it("should upload a film simulation", () => {
    cy.get('[data-testid="upload-icon"]').click();
    cy.get('[data-cy="upload-filmsim-button"]').click();
    cy.wait(1000);

    cy.get('[data-cy="film-sim-name-input"]').type(testFilmSimUpload.name);
    cy.get('[data-cy="film-sim-description-input"]').type(
      testFilmSimUpload.description
    );
    cy.get('[data-cy="film-sim-tags-input"]').type(testFilmSimUpload.tags);
    cy.get('[data-cy="film-sim-tags-input"]').type("{enter}");

    cy.get('input[type="file"]').selectFile(
      "cypress/fixtures/Film Sim Test Image.webp",
      { force: true }
    );

    cy.wait(5000); // Wait for the URL to be returned instead - AS

    cy.get('[data-cy="film-sim-notes-input"]').type(testFilmSimUpload.notes);

    cy.get('[data-cy="film-sim-submit-button"]').click();

    cy.url().should("include", "/filmsim/");
  });
});
