#!/bin/bash

# 🚀 Production Deployment Script for VISOR
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting Production Deployment for VISOR"
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the server directory."
    exit 1
fi

# 1. Environment check
print_status "Checking environment..."

if [ "$NODE_ENV" != "production" ]; then
    print_warning "NODE_ENV is not set to 'production'. Setting it now..."
    export NODE_ENV=production
fi

# Check required environment variables
required_vars=("MONGODB_URI" "SENDGRID_API_KEY" "FROM_EMAIL" "APP_URL" "JWT_SECRET")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    exit 1
fi

print_status "Environment variables check passed"

# 2. Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production

# 3. Create logs directory
print_status "Creating logs directory..."
mkdir -p logs

# 4. Run database migration
print_status "Running database migration..."
if [ -f "production-migration.js" ]; then
    node production-migration.js
else
    print_warning "production-migration.js not found, skipping migration"
fi

# 5. Test email service
print_status "Testing email service..."
node -e "
const EmailService = require('./utils/emailService');
EmailService.checkServiceStatus().then(status => {
    console.log('Email service status:', status);
    if (status.status === 'error') {
        process.exit(1);
    }
});
"

# 6. Build client (if client directory exists)
if [ -d "../client" ]; then
    print_status "Building client application..."
    cd ../client
    npm ci
    npm run build
    cd ../server
else
    print_warning "Client directory not found, skipping client build"
fi

# 7. Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

# 8. Stop existing PM2 processes
print_status "Stopping existing PM2 processes..."
pm2 stop visor-server 2>/dev/null || true
pm2 delete visor-server 2>/dev/null || true

# 9. Start application with PM2
print_status "Starting application with PM2..."
pm2 start pm2.config.js --env production

# 10. Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# 11. Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

# 12. Health check
print_status "Performing health check..."
sleep 5

# Check if the application is running
if pm2 list | grep -q "visor-server.*online"; then
    print_status "Application is running successfully!"
else
    print_error "Application failed to start. Check logs with: pm2 logs visor-server"
    exit 1
fi

# 13. Display status
echo ""
echo "🎉 Deployment completed successfully!"
echo "====================================="
echo ""
echo "📊 Application Status:"
pm2 list
echo ""
echo "📋 Useful Commands:"
echo "  View logs: pm2 logs visor-server"
echo "  Monitor: pm2 monit"
echo "  Restart: pm2 restart visor-server"
echo "  Stop: pm2 stop visor-server"
echo ""
echo "🌐 Your application should now be accessible at:"
echo "  API: $APP_URL/graphql"
echo "  Client: $APP_URL"
echo ""
echo "📧 Email verification is configured with:"
echo "  From: $FROM_EMAIL"
echo "  Support: ${SUPPORT_EMAIL:-support@visor.com}"
echo ""
print_status "Deployment completed! 🚀" 