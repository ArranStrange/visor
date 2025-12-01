describe("Navbar Tests", () => {
  beforeEach(() => {
    // Login as test user before each test
    cy.loginAsTestUser();
  });

  it("should display navbar when logged in", () => {
    cy.visit("/");
    cy.get('[data-testid="upload-icon"]').should("be.visible");
  });
});
