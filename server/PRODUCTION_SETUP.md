# 🚀 Production Setup Guide - Email Verification System

## 📋 **Prerequisites**

### **1. Domain & SSL Certificate**

- ✅ **Domain name** (e.g., `yourdomain.com`)
- ✅ **SSL certificate** (Let's Encrypt or paid provider)
- ✅ **DNS records** configured

### **2. Email Service Provider**

- ✅ **SendGrid account** with verified sender domain
- ✅ **Domain authentication** (SPF, DKIM, DMARC)
- ✅ **Production API key** with appropriate permissions

### **3. Hosting Platform**

- ✅ **Server/Cloud platform** (AWS, DigitalOcean, Heroku, etc.)
- ✅ **Environment variables** configured
- ✅ **Database** (MongoDB Atlas recommended)

## 🔧 **Production Environment Variables**

### **Server (.env)**

```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/visor?retryWrites=true&w=majority

# Email Service
SENDGRID_API_KEY=SG.your-production-api-key
FROM_EMAIL=noreply@yourdomain.com
APP_URL=https://yourdomain.com

# Security
JWT_SECRET=your-super-secure-jwt-secret-key
RECAPTCHA_SECRET_KEY=your-production-recaptcha-secret-key

# Server
NODE_ENV=production
PORT=4000
```

### **Client (.env)**

```bash
# API Endpoints
VITE_GRAPHQL_ENDPOINT=https://yourdomain.com/graphql
VITE_RECAPTCHA_SITE_KEY=your-production-recaptcha-site-key

# App Configuration
VITE_APP_NAME=VISOR
VITE_APP_URL=https://yourdomain.com
```

## 📧 **Email Service Setup**

### **1. SendGrid Domain Authentication**

1. **Go to SendGrid Dashboard** → Settings → Sender Authentication
2. **Domain Authentication** (not just single sender)
3. **Add your domain**: `yourdomain.com`
4. **Configure DNS records**:

   ```
   Type: CNAME
   Name: s1._domainkey.yourdomain.com
   Value: s1.domainkey.u12345678.wl123.sendgrid.net

   Type: CNAME
   Name: s2._domainkey.yourdomain.com
   Value: s2.domainkey.u12345678.wl123.sendgrid.net
   ```

### **2. Update Email Templates**

- **From email**: `noreply@yourdomain.com` (verified domain)
- **Reply-to**: `support@yourdomain.com`
- **Subject lines**: Professional and branded
- **HTML templates**: Responsive design

## 🔒 **Security Enhancements**

### **1. reCAPTCHA Production Keys**

1. **Go to Google reCAPTCHA Admin**
2. **Create new site** for production
3. **Domain**: `yourdomain.com`
4. **Update environment variables**

### **2. JWT Configuration**

```javascript
// Enhanced JWT settings for production
const jwtOptions = {
  expiresIn: "7d",
  issuer: "yourdomain.com",
  audience: "visor-app",
};
```

### **3. Rate Limiting**

```javascript
// Add rate limiting for registration
const rateLimit = require("express-rate-limit");

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 registration attempts per windowMs
  message: "Too many registration attempts, please try again later",
});
```

## 🌐 **Deployment Configuration**

### **1. Server Deployment**

```bash
# PM2 Configuration (pm2.config.js)
module.exports = {
  apps: [{
    name: 'visor-server',
    script: 'index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

### **2. Client Deployment**

```bash
# Build for production
npm run build

# Serve static files with nginx or similar
# nginx.conf example included below
```

### **3. Nginx Configuration**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Client (React app)
    location / {
        root /var/www/visor/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API (GraphQL)
    location /graphql {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 **Monitoring & Analytics**

### **1. Email Delivery Monitoring**

- **SendGrid Analytics**: Track delivery rates, bounces, spam reports
- **Email logs**: Monitor verification email success/failure rates
- **Alerting**: Set up alerts for high bounce rates

### **2. Application Monitoring**

- **Error tracking**: Sentry or similar
- **Performance monitoring**: New Relic, DataDog
- **Uptime monitoring**: Pingdom, UptimeRobot

## 🔄 **Database Migration**

### **1. Update Existing Users**

```javascript
// Migration script for existing users
const mongoose = require("mongoose");
require("dotenv").config();

async function migrateUsers() {
  await mongoose.connect(process.env.MONGODB_URI);

  const User = require("./models/User");

  // Add email verification fields to existing users
  await User.updateMany(
    { emailVerified: { $exists: false } },
    {
      $set: {
        emailVerified: true, // Mark existing users as verified
        verificationToken: null,
        tokenExpiry: null,
      },
    }
  );

  console.log("Migration completed");
  process.exit(0);
}

migrateUsers();
```

## 🧪 **Testing Checklist**

### **Pre-Launch Testing**

- [ ] **Email delivery**: Test verification emails in production environment
- [ ] **reCAPTCHA**: Verify production keys work
- [ ] **SSL**: Ensure all URLs use HTTPS
- [ ] **Database**: Test with production database
- [ ] **Rate limiting**: Verify registration limits work
- [ ] **Error handling**: Test various failure scenarios

### **Post-Launch Monitoring**

- [ ] **Email delivery rates**: Monitor SendGrid analytics
- [ ] **User registration flow**: Track completion rates
- [ ] **Error rates**: Monitor for 500 errors
- [ ] **Performance**: Monitor response times

## 🚨 **Common Production Issues**

### **1. Email Delivery Issues**

- **Problem**: Emails going to spam
- **Solution**: Proper domain authentication, good sender reputation

### **2. CORS Issues**

- **Problem**: Frontend can't connect to API
- **Solution**: Configure CORS for production domain

### **3. Database Connection**

- **Problem**: Connection timeouts
- **Solution**: Connection pooling, proper error handling

### **4. SSL/HTTPS Issues**

- **Problem**: Mixed content warnings
- **Solution**: Ensure all resources use HTTPS

## 📞 **Support & Maintenance**

### **1. Regular Tasks**

- **Monitor email delivery rates** (weekly)
- **Check error logs** (daily)
- **Update dependencies** (monthly)
- **Review security** (quarterly)

### **2. Backup Strategy**

- **Database backups**: Daily automated backups
- **Code backups**: Version control (Git)
- **Configuration backups**: Secure storage

---

## 🎯 **Quick Start Commands**

```bash
# 1. Set production environment variables
export NODE_ENV=production

# 2. Install production dependencies
npm ci --only=production

# 3. Build client
cd client && npm run build

# 4. Start server with PM2
pm2 start pm2.config.js

# 5. Monitor logs
pm2 logs visor-server
```

---

**📧 Need help?** Check the troubleshooting section or contact support.
