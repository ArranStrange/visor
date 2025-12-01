const resource = require("/Users/arranstrange/Documents/Coding/visor_full_project/client/cypress/fixtures/filmsim-detail.json");

describe("FilmSim Detail Page Tests", () => {
  beforeEach(() => {
    // Login as test user
    cy.loginAsTestUser();

    // Load mock data from fixture and set up GraphQL intercept
    cy.loadRecords("filmsim-detail", {
      operationName: "GetFilmSim",
      dataPath: "mockFilmSim",
    });
  });

  it("should load mock data and display FilmSim detail page", () => {
    // Get the mock data from fixture for assertions
    cy.fixture("filmsim-detail").then((fixture) => {
      const mockFilmSim = fixture.mockFilmSim;

      // Visit the detail page using the slug from mock data
      cy.visit(`/filmsim/${mockFilmSim.slug}`);

      // Wait for page to load
      cy.wait(1000);

      // Step 1: Verify the FilmSim name is displayed
      cy.contains(mockFilmSim.name).should("be.visible");

      // Step 2: Verify the description is displayed
      cy.contains(mockFilmSim.description).should("be.visible");

      // Step 3: Verify creator information is displayed
      cy.contains(mockFilmSim.creator.username).should("be.visible");

      // Step 4: Verify tags are displayed
      mockFilmSim.tags.forEach((tag) => {
        cy.contains(tag.displayName).should("be.visible");
      });

      // Step 5: Verify creator notes are displayed
      cy.contains("Creator Notes").should("be.visible");
      cy.contains(mockFilmSim.notes).should("be.visible");

      // Step 6: Verify camera settings section
      cy.contains("Camera Settings").should("be.visible");
      cy.contains(mockFilmSim.settings.filmSimulation).should("be.visible");
    });
  });
});
