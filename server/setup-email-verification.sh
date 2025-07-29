#!/bin/bash

# VISOR Email Verification Setup Script
# This script helps you set up email verification for the VISOR application

set -e

echo "🚀 VISOR Email Verification Setup"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the server directory"
    exit 1
fi

print_info "Starting email verification setup..."

# Step 1: Install dependencies
print_info "Installing required dependencies..."
npm install @sendgrid/mail axios

print_status "Dependencies installed successfully"

# Step 2: Check for existing .env file
if [ -f ".env" ]; then
    print_warning "Found existing .env file. Backing up to .env.backup"
    cp .env .env.backup
fi

# Step 3: Create or update .env file
print_info "Setting up environment variables..."

# Check if .env exists and read existing values
if [ -f ".env" ]; then
    # Read existing values
    MONGODB_URI=$(grep "^MONGODB_URI=" .env | cut -d '=' -f2- || echo "mongodb://localhost:27017/visor")
    JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f2- || echo "")
    PORT=$(grep "^PORT=" .env | cut -d '=' -f2- || echo "4000")
    NODE_ENV=$(grep "^NODE_ENV=" .env | cut -d '=' -f2- || echo "development")
else
    MONGODB_URI="mongodb://localhost:27017/visor"
    JWT_SECRET=""
    PORT="4000"
    NODE_ENV="development"
fi

# Generate JWT secret if not exists
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    print_status "Generated new JWT secret"
fi

# Create .env file
cat > .env << EOF
# Database
MONGODB_URI=${MONGODB_URI}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@yourdomain.com

# reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# App Configuration
APP_URL=http://localhost:3000
NODE_ENV=${NODE_ENV}
PORT=${PORT}
EOF

print_status "Environment file created/updated"

# Step 4: Create client environment template
print_info "Creating client environment template..."

CLIENT_ENV_FILE="../client/.env.template"
cat > "$CLIENT_ENV_FILE" << EOF
# GraphQL Endpoint
VITE_GRAPHQL_URI=http://localhost:4000/graphql

# Cloudinary Configuration (if using)
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
VITE_CLOUDINARY_API_KEY=your_cloudinary_api_key
VITE_CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# reCAPTCHA Site Key
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here

# Feature Flags
VITE_ENABLE_EMAIL_VERIFICATION=true
VITE_ENABLE_RECAPTCHA=true
EOF

print_status "Client environment template created"

# Step 5: Create database migration script
print_info "Creating database migration script..."

MIGRATION_FILE="migrate-email-verification.js"
cat > "$MIGRATION_FILE" << 'EOF'
const mongoose = require('mongoose');
require('dotenv').config();

async function migrateEmailVerification() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const users = db.collection('users');

    console.log('Updating existing users with email verification fields...');
    
    const result = await users.updateMany(
      { emailVerified: { $exists: false } },
      { 
        $set: { 
          emailVerified: false,
          verificationToken: null,
          tokenExpiry: null
        } 
      }
    );

    console.log(`Updated ${result.modifiedCount} users`);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateEmailVerification();
EOF

print_status "Database migration script created"

# Step 6: Create test script
print_info "Creating test script..."

TEST_FILE="test-email-verification.js"
cat > "$TEST_FILE" << 'EOF'
const EmailService = require('./utils/emailService');
const ReCAPTCHAService = require('./utils/recaptchaService');

async function testEmailVerification() {
  console.log('🧪 Testing Email Verification Setup');
  console.log('===================================');

  // Test email service
  console.log('\n1. Testing Email Service...');
  try {
    const emailResult = await EmailService.sendVerificationEmail(
      'test@example.com',
      'testuser',
      'test-token-123'
    );
    console.log('Email service result:', emailResult);
  } catch (error) {
    console.error('Email service error:', error.message);
  }

  // Test reCAPTCHA service
  console.log('\n2. Testing reCAPTCHA Service...');
  try {
    const recaptchaResult = await ReCAPTCHAService.verifyToken('test-token');
    console.log('reCAPTCHA service result:', recaptchaResult);
  } catch (error) {
    console.error('reCAPTCHA service error:', error.message);
  }

  console.log('\n✅ Test completed!');
  console.log('\nNext steps:');
  console.log('1. Get your SendGrid API key from sendgrid.com');
  console.log('2. Get your reCAPTCHA keys from google.com/recaptcha/admin');
  console.log('3. Update the .env file with your keys');
  console.log('4. Run: node migrate-email-verification.js');
  console.log('5. Start your server: npm run dev');
}

testEmailVerification();
EOF

print_status "Test script created"

# Step 7: Display next steps
echo ""
echo "🎉 Setup completed successfully!"
echo "================================"
echo ""
print_info "Next steps to complete the setup:"
echo ""
echo "1. 📧 Get SendGrid API Key:"
echo "   - Go to https://sendgrid.com"
echo "   - Create a free account"
echo "   - Go to Settings → API Keys"
echo "   - Create a new API key with 'Mail Send' permissions"
echo "   - Update SENDGRID_API_KEY in .env"
echo ""
echo "2. 🤖 Get reCAPTCHA Keys:"
echo "   - Go to https://www.google.com/recaptcha/admin"
echo "   - Create a new site with reCAPTCHA v2"
echo "   - Add localhost to allowed domains"
echo "   - Update RECAPTCHA_SECRET_KEY in .env"
echo "   - Update VITE_RECAPTCHA_SITE_KEY in client/.env"
echo ""
echo "3. 🗄️  Run Database Migration:"
echo "   node migrate-email-verification.js"
echo ""
echo "4. 🧪 Test the Setup:"
echo "   node test-email-verification.js"
echo ""
echo "5. 🚀 Start the Servers:"
echo "   # Terminal 1 (Server)"
echo "   npm run dev"
echo ""
echo "   # Terminal 2 (Client)"
echo "   cd ../client && npm run dev"
echo ""
echo "6. 📖 Read the Setup Guide:"
echo "   cat EMAIL_VERIFICATION_SETUP.md"
echo ""

print_warning "Important: Don't forget to update your .env file with actual API keys!"
print_warning "The current .env file contains placeholder values."

echo ""
print_status "Setup script completed! 🎉" 