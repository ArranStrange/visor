describe("Registration Security Features", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should allow registration", () => {
    cy.get('[data-cy="register-page"]').should("exist");
  });

  it("should allow registration completion", () => {
    // Fill out the form
    cy.get('[data-cy="username-input"]').type("testuser");
    cy.get('[data-cy="email-input"]').type("test@example.com");
    cy.get('[data-cy="password-input"]').type("TestPassword123");
    cy.get('[data-cy="confirm-password-input"]').type("TestPassword123");

    // Should be able to submit
    cy.get('[data-cy="register-button"]').click();
  });

  it("should show email verification message after successful registration", () => {
    // Fill out the form
    cy.get('[data-cy="username-input"]').type("testuser");
    cy.get('[data-cy="email-input"]').type("test@example.com");
    cy.get('[data-cy="password-input"]').type("TestPassword123");
    cy.get('[data-cy="confirm-password-input"]').type("TestPassword123");

    // Mock successful registration response
    cy.intercept("POST", "/graphql", {
      statusCode: 200,
      body: {
        data: {
          register: {
            success: true,
            requiresVerification: true,
            message: "Please check your email to verify your account",
            user: {
              id: "1",
              username: "testuser",
              email: "test@example.com",
              emailVerified: false,
            },
          },
        },
      },
    }).as("registerRequest");

    // Submit form
    cy.get('[data-cy="register-button"]').click();

    // Wait for request
    cy.wait("@registerRequest");

    // Should show email verification message
    cy.get('[data-cy="email-verification-message"]').should(
      "contain",
      "Check Your Email"
    );
    cy.get('[data-cy="email-verification-message"]').should(
      "contain",
      "test@example.com"
    );
  });

  it("should handle email verification page", () => {
    // Visit verification page with token
    cy.visit("/verify-email?token=test-token&email=test@example.com");

    // Mock verification response
    cy.intercept("POST", "/graphql", {
      statusCode: 200,
      body: {
        data: {
          verifyEmail: {
            success: true,
            message: "Email verified successfully!",
            user: {
              id: "1",
              username: "testuser",
              email: "test@example.com",
              emailVerified: true,
            },
          },
        },
      },
    }).as("verifyRequest");

    // Should show verification in progress
    cy.get('[data-cy="verification-status"]').should(
      "contain",
      "Verifying your email"
    );

    // Wait for verification
    cy.wait("@verifyRequest");

    // Should show success message
    cy.get('[data-cy="verification-success"]').should(
      "contain",
      "Email verified successfully!"
    );
  });

  it("should handle expired verification links", () => {
    // Visit verification page without token
    cy.visit("/verify-email");

    // Should show expired/invalid message
    cy.get('[data-cy="verification-error"]').should(
      "contain",
      "Invalid verification link"
    );

    // Should show resend option
    cy.get('[data-cy="resend-verification"]').should("be.visible");
  });

  it("should validate password requirements", () => {
    // Test weak password
    cy.get('[data-cy="password-input"]').type("weak");
    cy.get('[data-cy="password-error"]').should(
      "contain",
      "at least 6 characters"
    );

    // Test password without uppercase
    cy.get('[data-cy="password-input"]').clear().type("weakpassword");
    cy.get('[data-cy="password-error"]').should("contain", "uppercase letter");

    // Test valid password
    cy.get('[data-cy="password-input"]').clear().type("StrongPassword123");
    cy.get('[data-cy="password-error"]').should("not.exist");
  });

  it("should validate password confirmation", () => {
    cy.get('[data-cy="password-input"]').type("TestPassword123");
    cy.get('[data-cy="confirm-password-input"]').type("DifferentPassword");

    cy.get('[data-cy="confirm-password-error"]').should(
      "contain",
      "Passwords do not match"
    );
  });

  it("should validate username length", () => {
    cy.get('[data-cy="username-input"]').type("ab");
    cy.get('[data-cy="username-error"]').should(
      "contain",
      "at least 3 characters"
    );
  });
});
