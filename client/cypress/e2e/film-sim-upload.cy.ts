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

  it("should upload a film simulation", () => {
    performLogin();
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

    cy.wait(5000);

    cy.get('[data-cy="film-sim-notes-input"]').type(testFilmSimUpload.notes);

    cy.get('[data-cy="film-sim-submit-button"]').click();

    cy.url().should("include", "/filmsim/");
  });
});
