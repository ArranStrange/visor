# Email Verification Setup Guide for VISOR

This guide will help you set up email verification for the VISOR application using SendGrid and reCAPTCHA.

## Prerequisites

- Node.js and npm installed
- MongoDB database running
- SendGrid account (free tier available)
- Google reCAPTCHA account

## Step 1: Email Service Setup (SendGrid)

### 1.1 Create SendGrid Account

1. Go to [sendgrid.com](https://sendgrid.com)
2. Click "Start for Free" and create an account
3. Verify your email address

### 1.2 Create API Key

1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name it "VISOR Email Service"
4. Select "Restricted Access" and choose "Mail Send"
5. Click "Create & View"
6. **Copy the API key** (you'll need this for your environment variables)

### 1.3 Verify Sender (Optional but Recommended)

1. Go to Settings → Sender Authentication
2. Choose "Domain Authentication" for production or "Single Sender Verification" for testing
3. Follow the verification process

## Step 2: reCAPTCHA Setup

### 2.1 Create reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Click the "+" button to add a new site
3. Choose "reCAPTCHA v2" with "I'm not a robot" checkbox
4. Add your domains:
   - `localhost` (for development)
   - `yourdomain.com` (for production)
5. Click "Submit"
6. **Copy both the Site Key and Secret Key**

## Step 3: Environment Configuration

### 3.1 Create Environment File

Create a `.env` file in your server directory with the following variables:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/visor

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# App Configuration
APP_URL=http://localhost:3000
NODE_ENV=development
PORT=4000
```

### 3.2 Update Client Environment

In your client directory, update the `.env` file:

```bash
# GraphQL Endpoint
VITE_GRAPHQL_URI=http://localhost:4000/graphql

# reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Feature Flags
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_RECAPTCHA=true
```

## Step 4: Install Dependencies

### 4.1 Server Dependencies

```bash
cd server
npm install @sendgrid/mail axios
```

### 4.2 Client Dependencies

```bash
cd client
npm install react-google-recaptcha @types/react-google-recaptcha
```

## Step 5: Database Migration

If you have existing users, you'll need to add the email verification fields:

```javascript
// Run this in your MongoDB shell or create a migration script
db.users.updateMany(
  { emailVerified: { $exists: false } },
  {
    $set: {
      emailVerified: false,
      verificationToken: null,
      tokenExpiry: null,
    },
  }
);
```

## Step 6: Testing the Implementation

### 6.1 Start the Servers

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

### 6.2 Test Registration Flow

1. Go to `http://localhost:3000/register`
2. Fill out the registration form
3. Complete the reCAPTCHA
4. Submit the form
5. Check your email for verification link
6. Click the verification link
7. Try logging in

### 6.3 Test Email Verification

1. Check your email for the verification email
2. Click the verification link
3. Verify you're redirected to the success page
4. Try logging in with the verified account

## Step 7: Production Deployment

### 7.1 Update Environment Variables

For production, update your environment variables:

```bash
# Production Environment
NODE_ENV=production
APP_URL=https://yourdomain.com
SENDGRID_API_KEY=your_production_sendgrid_key
RECAPTCHA_SECRET_KEY=your_production_recaptcha_secret
FROM_EMAIL=noreply@yourdomain.com
```

### 7.2 Update reCAPTCHA Settings

1. Go to Google reCAPTCHA Admin
2. Add your production domain to the allowed domains
3. Update your client environment with the production site key

### 7.3 SendGrid Domain Authentication

1. Go to SendGrid Settings → Sender Authentication
2. Set up Domain Authentication for your production domain
3. Update the FROM_EMAIL to use your verified domain

## Troubleshooting

### Common Issues

#### 1. Emails Not Sending

- Check SendGrid API key is correct
- Verify sender email is authenticated
- Check SendGrid dashboard for delivery status
- Review server logs for error messages

#### 2. reCAPTCHA Not Working

- Verify site key and secret key match
- Check domain is added to reCAPTCHA settings
- Ensure you're using the correct reCAPTCHA version

#### 3. Verification Links Not Working

- Check APP_URL is correct in environment
- Verify token generation and validation
- Check database for token expiry

#### 4. Login Issues After Verification

- Ensure emailVerified field is being set correctly
- Check JWT token generation
- Verify user object structure

### Debug Steps

1. **Check Server Logs**

   ```bash
   # Look for email service errors
   grep "email" server.log

   # Look for reCAPTCHA errors
   grep "recaptcha" server.log
   ```

2. **Test Email Service**

   ```javascript
   // Add this to your server for testing
   const EmailService = require("./utils/emailService");

   EmailService.sendVerificationEmail(
     "test@example.com",
     "testuser",
     "test-token"
   ).then(console.log);
   ```

3. **Test reCAPTCHA Service**

   ```javascript
   // Add this to your server for testing
   const ReCAPTCHAService = require("./utils/recaptchaService");

   ReCAPTCHAService.verifyToken("test-token").then(console.log);
   ```

## Security Considerations

### 1. Environment Variables

- Never commit API keys to version control
- Use different keys for development and production
- Rotate keys regularly

### 2. Email Security

- Use HTTPS for verification links
- Implement rate limiting for email sending
- Monitor for suspicious activity

### 3. reCAPTCHA Security

- Always validate tokens on the server
- Use different keys for different environments
- Monitor for abuse

### 4. Token Security

- Use cryptographically secure random tokens
- Implement proper token expiry
- Clear tokens after use

## Monitoring and Maintenance

### 1. Email Delivery Monitoring

- Set up SendGrid webhooks for delivery tracking
- Monitor bounce and spam reports
- Track email open rates

### 2. Security Monitoring

- Monitor failed login attempts
- Track verification token usage
- Log security events

### 3. Performance Monitoring

- Monitor email sending performance
- Track verification success rates
- Monitor database performance

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server and client logs
3. Verify all environment variables are set correctly
4. Test with a fresh user registration
5. Check SendGrid and reCAPTCHA dashboards for errors

## Next Steps

After successful implementation:

1. Set up monitoring and alerting
2. Implement rate limiting
3. Add analytics tracking
4. Consider implementing additional security features:
   - Two-factor authentication
   - Phone number verification
   - Social login integration
