# Cypress Testing for VISOR

This directory contains comprehensive end-to-end (E2E) tests for the VISOR application using Cypress.

## Test Structure

```
cypress/
├── e2e/                    # End-to-end test files
│   ├── navigation.cy.ts    # Navigation and routing tests
│   ├── search.cy.ts        # Search functionality tests
│   ├── preset-detail.cy.ts # Preset detail page tests
│   └── upload.cy.ts        # Upload functionality tests
├── fixtures/               # Test data and files
│   ├── test-image.jpg      # Test image for uploads
│   └── test-preset.xmp     # Test XMP preset file
├── support/                # Support files and custom commands
│   ├── e2e.ts             # E2E support configuration
│   ├── component.ts        # Component testing support
│   ├── commands.ts         # Custom Cypress commands
│   └── index.d.ts          # TypeScript declarations
└── README.md              # This file
```

## Available Test Scripts

```bash
# Run all E2E tests in headless mode
npm run test:e2e

# Open Cypress Test Runner (GUI)
npm run test:e2e:open

# Run tests in headed mode (with browser visible)
npm run test:e2e:headed

# Run tests in specific browsers
npm run test:e2e:chrome
npm run test:e2e:firefox
```

## Test Categories

### 1. Navigation Tests (`navigation.cy.ts`)

- Home page loading
- Navigation between pages
- Responsive navigation (mobile/tablet/desktop)
- Browser back/forward navigation
- Loading states during navigation

### 2. Search Tests (`search.cy.ts`)

- Basic search functionality
- Content type filtering (presets, film sims)
- Empty search results handling
- Search suggestions
- Sorting and pagination
- Special character handling

### 3. Preset Detail Tests (`preset-detail.cy.ts`)

- Preset page loading
- Before/after comparison slider
- XMP settings display
- Download functionality
- Like/unlike interactions
- Comments and sharing
- Responsive design

### 4. Upload Tests (`upload.cy.ts`)

- Preset and film sim uploads
- Form validation
- File upload handling
- Progress indicators
- Error handling
- Drag and drop functionality

## Custom Commands

The following custom commands are available in all tests:

### Navigation

- `cy.viewportPreset(preset)` - Set viewport to mobile/tablet/desktop
- `cy.waitForPageLoad()` - Wait for page to fully load
- `cy.login(email, password)` - Login with credentials
- `cy.logout()` - Logout user

### GraphQL

- `cy.waitForGraphQL()` - Wait for GraphQL operations
- `cy.waitForGraphQLOperation(operationName)` - Wait for specific GraphQL operation

### UI Interactions

- `cy.shouldBeVisibleAndClickable(selector)` - Check element is visible and clickable
- `cy.typeWithDelay(selector, text, delay)` - Type with custom delay
- `cy.scrollToElement(selector)` - Scroll element into view
- `cy.waitForImage(selector)` - Wait for image to load
- `cy.shouldHaveClass(selector, className)` - Check CSS class
- `cy.shouldHaveDataAttr(selector, attr, value)` - Check data attribute

## Data Attributes

Tests use `data-cy` attributes for reliable element selection. Add these to your components:

```tsx
// Example component with data-cy attributes
<button data-cy="nav-home">Home</button>
<input data-cy="search-input" />
<div data-cy="preset-title">Preset Title</div>
```

## Test Data

### Fixtures

- `test-image.jpg` - Sample image for upload tests
- `test-preset.xmp` - Sample XMP preset file

### Test Users

Create test users in your development environment:

- Email: `test@example.com`
- Password: `testpassword123`

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach()` to set up test state
- Clean up after tests when necessary

### 2. Reliable Selectors

- Use `data-cy` attributes instead of CSS classes
- Avoid text-based selectors when possible
- Use stable, semantic selectors

### 3. Waiting Strategies

- Use `cy.waitForPageLoad()` for page transitions
- Wait for specific elements rather than arbitrary delays
- Use `cy.intercept()` for API calls

### 4. Responsive Testing

- Test on multiple viewport sizes
- Use `cy.viewportPreset()` for consistent testing
- Verify mobile-specific functionality

### 5. Error Handling

- Test error states and edge cases
- Verify error messages are displayed
- Test network failures gracefully

## Debugging Tests

### Running Individual Tests

```bash
# Run specific test file
npx cypress run --spec "cypress/e2e/navigation.cy.ts"

# Run specific test
npx cypress run --spec "cypress/e2e/navigation.cy.ts" --grep "should load the home page"
```

### Debug Mode

```bash
# Run in headed mode for debugging
npm run test:e2e:headed

# Open Cypress Test Runner
npm run test:e2e:open
```

### Screenshots and Videos

- Failed tests automatically capture screenshots
- Videos are disabled by default (set `video: false` in config)
- Screenshots are saved to `cypress/screenshots/`

## Continuous Integration

The GitHub Actions workflow includes E2E tests:

```yaml
- name: Run E2E tests
  run: npm run test:e2e
```

## Troubleshooting

### Common Issues

1. **Tests failing due to timing**

   - Add explicit waits for elements
   - Use `cy.waitForPageLoad()` for page transitions
   - Check for loading states

2. **Element not found**

   - Verify `data-cy` attributes are present
   - Check if element is in viewport
   - Ensure element is not hidden by overlays

3. **Network errors**

   - Mock API calls with `cy.intercept()`
   - Handle loading states properly
   - Test error scenarios

4. **Responsive issues**
   - Test on different viewport sizes
   - Check mobile-specific elements
   - Verify touch interactions

### Getting Help

- Check Cypress documentation: https://docs.cypress.io/
- Review test logs in Cypress Test Runner
- Use browser dev tools for debugging
- Check network tab for API issues
