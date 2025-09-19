describe("Registration Security Features", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  it("should allow registration", () => {
    cy.get('[data-cy="register-page"]').should("exist");
  });

  it("should allow registration completion", () => {
    cy.get('[data-cy="username-input"]').type("testuser");
    cy.get('[data-cy="email-input"]').type("test@example.com");
    cy.get('[data-cy="password-input"]').type("TestPassword123");
    cy.get('[data-cy="confirm-password-input"]').type("TestPassword123");

    cy.get('[data-cy="register-button"]').click();
  });

  it("should show email verification message after successful registration", () => {
    cy.get('[data-cy="username-input"]').type("testuser");
    cy.get('[data-cy="email-input"]').type("test@example.com");
    cy.get('[data-cy="password-input"]').type("TestPassword123");
    cy.get('[data-cy="confirm-password-input"]').type("TestPassword123");

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

    cy.get('[data-cy="register-button"]').click();

    cy.wait("@registerRequest");

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
    cy.visit("/verify-email?token=test-token&email=test@example.com");

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

    cy.get('[data-cy="verification-status"]').should(
      "contain",
      "Verifying your email"
    );

    cy.wait("@verifyRequest");

    cy.get('[data-cy="verification-success"]').should(
      "contain",
      "Email verified successfully!"
    );
  });

  it("should handle expired verification links", () => {
    cy.visit("/verify-email");

    cy.get('[data-cy="verification-error"]').should(
      "contain",
      "Invalid verification link"
    );

    cy.get('[data-cy="resend-verification"]').should("be.visible");
  });

  it("should validate password requirements", () => {
    cy.get('[data-cy="password-input"]').type("weak");
    cy.get('[data-cy="password-error"]').should(
      "contain",
      "at least 6 characters"
    );

    cy.get('[data-cy="password-input"]').clear().type("weakpassword");
    cy.get('[data-cy="password-error"]').should("contain", "uppercase letter");

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
