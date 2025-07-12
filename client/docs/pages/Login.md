# Login Page

## Overview

The Login page provides user authentication functionality for the VISOR application. It features a clean, centered form design with email and password fields, along with options for guest access and registration navigation.

## File Location

`src/pages/Login.tsx`

## Key Features

### Authentication Form

- **Email Field**: Required email input with validation
- **Password Field**: Secure password input with masking
- **Submit Button**: Triggers login mutation with loading state
- **Form Validation**: Client-side validation for required fields

### Guest Access

- **Guest Login Button**: Allows users to continue without registration
- **Token Storage**: Stores "guest" token in localStorage
- **Navigation**: Redirects to home page after guest login

### Registration Link

- **Navigation**: Links to registration page
- **Accessibility**: Clear call-to-action for new users

## Form Structure

### State Management

```tsx
const [form, setForm] = useState({ email: "", password: "" });
const [error, setError] = useState<string | null>(null);
```

### Form Fields

- **Email Input**:

  - Type: `email`
  - Required field
  - Disabled during loading
  - Data attribute: `data-cy="email-input"`

- **Password Input**:
  - Type: `password`
  - Required field
  - Disabled during loading
  - Data attribute: `data-cy="password-input"`

## Authentication Flow

### Login Mutation

- **GraphQL Mutation**: `LOGIN_USER`
- **Variables**: `email`, `password`
- **Response Handling**: Stores token and user data

### Success Flow

1. User submits form with valid credentials
2. GraphQL mutation executes
3. Token stored in localStorage as "visor_token"
4. User data stored in localStorage
5. Auth context updated with user data
6. Navigation to home page (`/`)

### Error Handling

- **Network Errors**: Displayed in error alert
- **Validation Errors**: Server-side validation messages
- **Token Errors**: Fallback error messages
- **User Feedback**: Clear error messages with retry options

## Data Storage

### Local Storage

- **Token**: `localStorage.setItem("visor_token", token)`
- **User Data**: `localStorage.setItem("user", JSON.stringify(userData))`
- **Guest Token**: `localStorage.setItem("token", "guest")`

### User Data Structure

```typescript
{
  id: string;
  username: string;
  email: string;
  avatar: string;
}
```

## UI Components

### Container Layout

- **Max Width**: `xs` (extra small)
- **Top Margin**: `mt: 10`
- **Centered**: Horizontal centering
- **Data Attribute**: `data-cy="login-page"`

### Form Elements

- **Stack Layout**: Vertical spacing with `spacing={3}`
- **Alert Component**: Error display with severity
- **Loading States**: Circular progress during submission
- **Button Variants**:
  - Primary: Login button
  - Outlined: Guest login
  - Text: Registration link

## Error States

### Form Validation

- **Required Fields**: Email and password validation
- **Loading State**: Disabled form during submission
- **Error Display**: Alert component with error message

### Network Errors

- **GraphQL Errors**: Handled in `onError` callback
- **User Feedback**: Clear error messages
- **Retry Logic**: Form remains functional after errors

## Accessibility Features

### Form Accessibility

- **Labels**: Proper form labels
- **Required Fields**: Clear indication of required fields
- **Error Messages**: Descriptive error feedback
- **Keyboard Navigation**: Full keyboard support

### Screen Reader Support

- **Semantic HTML**: Proper form structure
- **ARIA Labels**: Descriptive labels for form elements
- **Error Announcements**: Screen reader accessible error messages

## Testing Integration

### Cypress Testing

- **Page Selector**: `data-cy="login-page"`
- **Form Selector**: `data-cy="login-form"`
- **Title Selector**: `data-cy="login-title"`
- **Input Selectors**: `data-cy="email-input"`, `data-cy="password-input"`
- **Button Selector**: `data-cy="login-button"`

### Test Scenarios

- Valid login flow
- Invalid credentials
- Network errors
- Guest login
- Navigation to registration

## Security Considerations

### Password Security

- **Input Type**: `password` for secure input
- **No Local Storage**: Passwords not stored locally
- **Token Storage**: Secure token handling

### Form Security

- **CSRF Protection**: GraphQL mutations handle CSRF
- **Input Validation**: Client and server-side validation
- **Error Handling**: Secure error messages

## Performance Optimizations

### Loading States

- **Button Loading**: Circular progress during submission
- **Form Disabled**: Prevents multiple submissions
- **Optimistic UI**: Immediate feedback for user actions

### Error Recovery

- **Form Reset**: Maintains form state after errors
- **Retry Capability**: Users can retry failed logins
- **Graceful Degradation**: Form remains functional

## Integration Points

### Context Dependencies

- `AuthContext`: User authentication state management
- `setUser`: Updates global user state

### Navigation

- `useNavigate`: React Router navigation
- **Routes**: `/` (home), `/register` (registration)

### GraphQL Integration

- `LOGIN_USER` mutation
- Apollo Client for data fetching
- Error handling and caching

## Future Enhancements

### Planned Features

- Remember me functionality
- Social login integration
- Two-factor authentication
- Password reset functionality
- Account lockout protection
- Session management
- Biometric authentication support
