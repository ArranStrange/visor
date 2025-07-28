# Register Page

## Overview

The Register page provides user registration functionality for the VISOR application. It features a comprehensive form with username, email, and password fields, including password confirmation and robust validation.

## File Location

`src/pages/Register.tsx`

## Key Features

### Registration Form

- **Username Field**: Required with minimum 3 characters
- **Email Field**: Required with email validation
- **Password Field**: Required with strength validation
- **Confirm Password**: Required with matching validation
- **Submit Button**: Triggers registration mutation with loading state

### Password Validation

- **Minimum Length**: 6 characters required
- **Uppercase Letter**: At least one uppercase letter required
- **Real-time Validation**: Immediate feedback on password strength
- **Helper Text**: Clear guidance on password requirements

### Form Validation

- **Client-side Validation**: Real-time field validation
- **Server-side Validation**: GraphQL mutation validation
- **Error Display**: Clear error messages with field-specific feedback

## Form Structure

### State Management

```tsx
const [form, setForm] = useState({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});
const [error, setError] = useState<string | null>(null);
const [passwordError, setPasswordError] = useState<string | null>(null);
```

### Form Fields

#### Username Field

- **Type**: `text`
- **Minimum Length**: 3 characters
- **Validation**: Real-time length checking
- **Error Display**: Helper text for validation errors
- **Helper Text**: "Username must be at least 3 characters"

#### Email Field

- **Type**: `email`
- **Required**: Yes
- **Validation**: Browser email validation
- **Disabled**: During loading state

#### Password Field

- **Type**: `password`
- **Required**: Yes
- **Validation**: Custom password strength validation
- **Error Display**: FormHelperText for password errors
- **Helper Text**: Password requirements guidance

#### Confirm Password Field

- **Type**: `password`
- **Required**: Yes
- **Validation**: Must match password field
- **Error Display**: Helper text for mismatch
- **Helper Text**: "Passwords do not match"

## Validation Logic

### Password Validation Function

```tsx
const validatePassword = (password: string): boolean => {
  if (password.length < 6) {
    setPasswordError("Password must be at least 6 characters long");
    return false;
  }
  if (!/[A-Z]/.test(password)) {
    setPasswordError("Password must contain at least one uppercase letter");
    return false;
  }
  setPasswordError(null);
  return true;
};
```

### Form Submission Validation

1. **Password Match**: Confirms password and confirmPassword match
2. **Password Strength**: Validates password meets requirements
3. **Required Fields**: Ensures all fields are filled
4. **Server Validation**: GraphQL mutation handles server-side validation

## Registration Flow

### GraphQL Mutation

- **Mutation**: `REGISTER_USER`
- **Variables**: `username`, `email`, `password`
- **Response**: Token and user data

### Success Flow

1. User submits valid registration form
2. Client-side validation passes
3. GraphQL mutation executes
4. Token stored in localStorage
5. User data stored in localStorage
6. Navigation to home page (`/`)

### Error Handling

- **Network Errors**: Displayed in error alert
- **Validation Errors**: Field-specific error messages
- **Server Errors**: GraphQL error messages
- **User Feedback**: Clear error messages with retry options

## Data Storage

### Local Storage

- **Token**: `localStorage.setItem("token", token)`
- **User Data**: `localStorage.setItem("user", JSON.stringify(userData))`

### User Data Structure

```typescript
{
  id: string;
  username: string;
  email: string;
  avatar?: string;
}
```

## UI Components

### Container Layout

- **Max Width**: `xs` (extra small)
- **Top Margin**: `mt: 10`
- **Centered**: Horizontal centering

### Form Elements

- **Stack Layout**: Vertical spacing with `spacing={3}`
- **Alert Component**: Error display with severity
- **Loading States**: Circular progress during submission
- **Button Variants**:
  - Primary: Register button
  - Text: Login link

### Form Validation Display

- **Error States**: Red borders and text for invalid fields
- **Helper Text**: Guidance text below fields
- **Real-time Feedback**: Immediate validation feedback

## Error States

### Field Validation

- **Username**: Length validation with visual feedback
- **Email**: Browser email validation
- **Password**: Strength validation with detailed feedback
- **Confirm Password**: Match validation with helper text

### Form Submission Errors

- **Network Errors**: Alert component display
- **Server Errors**: GraphQL error messages
- **Validation Errors**: Field-specific error display

## Accessibility Features

### Form Accessibility

- **Labels**: Proper form labels for all fields
- **Required Fields**: Clear indication of required fields
- **Error Messages**: Descriptive error feedback
- **Keyboard Navigation**: Full keyboard support

### Screen Reader Support

- **Semantic HTML**: Proper form structure
- **ARIA Labels**: Descriptive labels for form elements
- **Error Announcements**: Screen reader accessible error messages
- **Helper Text**: Accessible guidance text

## Security Considerations

### Password Security

- **Input Type**: `password` for secure input
- **No Local Storage**: Passwords not stored locally
- **Strength Requirements**: Enforced password complexity
- **Confirmation**: Password confirmation prevents typos

### Form Security

- **CSRF Protection**: GraphQL mutations handle CSRF
- **Input Validation**: Client and server-side validation
- **Error Handling**: Secure error messages
- **Token Storage**: Secure token handling

## Performance Optimizations

### Loading States

- **Button Loading**: Circular progress during submission
- **Form Disabled**: Prevents multiple submissions
- **Optimistic UI**: Immediate feedback for user actions

### Validation Performance

- **Real-time Validation**: Immediate field validation
- **Debounced Validation**: Efficient validation timing
- **Error Recovery**: Form remains functional after errors

## Integration Points

### Navigation

- `useNavigate`: React Router navigation
- **Routes**: `/` (home), `/login` (login page)

### GraphQL Integration

- `REGISTER_USER` mutation
- Apollo Client for data fetching
- Error handling and caching

### Context Dependencies

- **Auth Context**: User authentication state management
- **Global State**: User data management

## Testing Integration

### Test Scenarios

- Valid registration flow
- Invalid username (too short)
- Invalid email format
- Weak password
- Password mismatch
- Network errors
- Server validation errors

### Form Testing

- Field validation testing
- Submission testing
- Error handling testing
- Navigation testing

## Future Enhancements

### Planned Features

- Email verification
- Social registration integration
- Terms of service acceptance
- Privacy policy agreement
- CAPTCHA integration
- Account activation flow
- Welcome email functionality
- Profile completion wizard
