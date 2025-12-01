# Cypress Support Files

This directory contains Cypress support files that are automatically loaded before your tests.

## Custom Commands

### `cy.loginAsTestUser([credentials])`

Logs in as a test user. If already authenticated, skips login.

**Usage:**

```typescript
// Use default test user credentials
beforeEach(() => {
  cy.loginAsTestUser();
});

// Use custom credentials
cy.loginAsTestUser({
  email: "custom@email.com",
  password: "custompassword",
});
```

**Default Test User:**

- Email: `arranstrange@googlemail.com`
- Password: `Admin1234!`

### `cy.logout()`

Logs out the current user by clearing all auth tokens from storage.

**Usage:**

```typescript
cy.logout();
```

### `cy.isAuthenticated()`

Checks if the user is currently authenticated.

**Usage:**

```typescript
cy.isAuthenticated().should("be.true");
```

## Configuration

Test user credentials are configured in:

- `cypress/support/commands.ts` - `TEST_USER` constant
- `cypress/fixtures/test-user.json` - JSON fixture (for reference)

## Example Test

```typescript
describe("My Feature Tests", () => {
  beforeEach(() => {
    // Login before each test
    cy.loginAsTestUser();
  });

  it("should do something", () => {
    cy.visit("/");
    // Your test code here
  });
});
```
