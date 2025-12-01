/// <reference types="cypress" />

/**
 * Test user credentials configuration
 */
export const TEST_USER = {
  email: "arranstrange@googlemail.com",
  password: "Admin1234!",
};

/**
 * Custom command to login as test user
 *
 * @example
 * cy.loginAsTestUser()
 * cy.loginAsTestUser({ email: 'custom@email.com', password: 'pass123' })
 */
Cypress.Commands.add("loginAsTestUser", (credentials = TEST_USER) => {
  cy.window().then((win) => {
    // Check if already logged in
    const token =
      win.localStorage.getItem("authToken") ||
      win.sessionStorage.getItem("authToken") ||
      win.localStorage.getItem("visor_token");

    if (token) {
      // Already logged in, just visit home
      cy.visit("/");
      cy.log("Already authenticated, skipping login");
      return;
    }

    // Perform login
    cy.visit("/login");
    cy.get('[data-cy="login-page"]').should("be.visible");
    cy.get('[data-cy="login-email-input"]').type(credentials.email);
    cy.get('[data-cy="login-password-input"]').type(credentials.password);
    cy.get('[data-cy="login-submit-button"]').click();

    // Wait for login to complete and redirect
    cy.wait(5000);
    cy.url().should("not.include", "/login");
    cy.log("Successfully logged in as test user");
  });
});

/**
 * Custom command to logout
 *
 * @example
 * cy.logout()
 */
Cypress.Commands.add("logout", () => {
  cy.window().then((win) => {
    win.localStorage.clear();
    win.sessionStorage.clear();
  });
  cy.visit("/login");
  cy.log("Logged out");
});

/**
 * Custom command to check if user is authenticated
 *
 * @example
 * cy.isAuthenticated().should('be.true')
 */
Cypress.Commands.add("isAuthenticated", () => {
  return cy.window().then((win) => {
    const token =
      win.localStorage.getItem("authToken") ||
      win.sessionStorage.getItem("authToken") ||
      win.localStorage.getItem("visor_token");
    return !!token;
  });
});

/**
 * Custom command to add/create a FilmSim for testing
 *
 * @example
 * cy.addFilmSim({ name: "Test FilmSim", description: "Test description" })
 * cy.addFilmSim({
 *   name: "Test FilmSim",
 *   description: "Test",
 *   tags: ["test", "cypress"],
 *   notes: "Test notes"
 * })
 */
Cypress.Commands.add(
  "addFilmSim",
  (options: {
    name: string;
    description?: string;
    tags?: string[];
    notes?: string;
    settings?: any;
    sampleImages?: Array<{ publicId: string; url: string }>;
  }) => {
    cy.window().then((win) => {
      const token =
        win.localStorage.getItem("authToken") ||
        win.sessionStorage.getItem("authToken") ||
        win.localStorage.getItem("visor_token");

      if (!token) {
        throw new Error(
          "Must be logged in to add FilmSim. Call cy.loginAsTestUser() first."
        );
      }

      // Default settings if not provided
      const defaultSettings = {
        filmSimulation: "Classic Chrome",
        whiteBalance: "Auto",
        wbShift: { r: 0, b: 0 },
        color: 0,
        sharpness: 0,
        highlight: 0,
        shadow: 0,
        noiseReduction: 0,
        grainEffect: "Weak",
        clarity: 0,
        colorChromeEffect: "Off",
        colorChromeFxBlue: "Off",
      };

      const mutation = `
        mutation UploadFilmSim(
          $name: String!
          $description: String
          $settings: FilmSimSettingsInput!
          $notes: String
          $tags: [String!]!
          $sampleImages: [SampleImageInput!]
        ) {
          uploadFilmSim(
            name: $name
            description: $description
            settings: $settings
            notes: $notes
            tags: $tags
            sampleImages: $sampleImages
          ) {
            id
            name
            slug
            description
            notes
            creator {
              id
              username
            }
          }
        }
      `;

      const variables = {
        name: options.name,
        description: options.description || "",
        settings: options.settings || defaultSettings,
        notes: options.notes || "",
        tags: options.tags || ["test"],
        sampleImages: options.sampleImages || [],
      };

      cy.request({
        method: "POST",
        url: "http://localhost:4000/graphql",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: {
          query: mutation,
          variables,
        },
      }).then((response) => {
        if (response.body.errors) {
          throw new Error(
            `Failed to create FilmSim: ${response.body.errors[0].message}`
          );
        }
        cy.log(`Created FilmSim: ${response.body.data.uploadFilmSim.name}`);
        return response.body.data.uploadFilmSim;
      });
    });
  }
);

/**
 * Custom command to load records from fixture and set up GraphQL intercepts
 *
 * @example
 * cy.loadRecords('filmsim-detail')
 * cy.loadRecords('filmsim-detail', { operationName: 'GetFilmSim', dataPath: 'mockFilmSim' })
 */
Cypress.Commands.add(
  "loadRecords",
  (
    fixtureName: string,
    options: {
      operationName?: string;
      dataPath?: string;
      responseKey?: string;
    } = {}
  ) => {
    const { operationName = "GetFilmSim", dataPath, responseKey } = options;

    return cy.fixture(fixtureName).then((fixture) => {
      // Determine the data to use
      let mockData;
      if (dataPath) {
        // If dataPath is provided, use it (e.g., 'mockFilmSim')
        mockData = fixture[dataPath];
      } else {
        // Otherwise, use the fixture directly or first property
        mockData = fixture.mockFilmSim || fixture.mockData || fixture;
      }

      // Determine the response key (e.g., 'getFilmSim' for 'GetFilmSim')
      const responseDataKey =
        responseKey ||
        operationName.replace("Get", "get").replace("List", "list");

      // Set up GraphQL intercept
      cy.intercept("POST", "**/graphql", (req) => {
        if (req.body.operationName === operationName) {
          req.reply({
            statusCode: 200,
            body: {
              data: {
                [responseDataKey]: mockData,
              },
            },
          });
        }
      });

      cy.log(`Loaded records from fixture: ${fixtureName}`);
      return cy.wrap(mockData);
    });
  }
);

// Extend Cypress namespace to include custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as test user
       * @param credentials - Optional custom credentials (defaults to TEST_USER)
       */
      loginAsTestUser(credentials?: typeof TEST_USER): Chainable<void>;

      /**
       * Logout current user
       */
      logout(): Chainable<void>;

      /**
       * Check if user is authenticated
       */
      isAuthenticated(): Chainable<boolean>;

      /**
       * Add/create a FilmSim for testing
       * @param options - FilmSim data (name required, others optional)
       */
      addFilmSim(options: {
        name: string;
        description?: string;
        tags?: string[];
        notes?: string;
        settings?: any;
        sampleImages?: Array<{ publicId: string; url: string }>;
      }): Chainable<any>;

      /**
       * Load records from fixture and set up GraphQL intercepts
       * @param fixtureName - Name of the fixture file (without .json extension)
       * @param options - Optional configuration for intercepts
       */
      loadRecords(
        fixtureName: string,
        options?: {
          operationName?: string;
          dataPath?: string;
          responseKey?: string;
        }
      ): Chainable<any>;
    }
  }
}
