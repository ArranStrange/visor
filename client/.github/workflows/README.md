# GitHub Actions Deployment Setup

This workflow automatically deploys the VISOR application to Firebase Hosting when:

- Code is pushed directly to the `main` branch
- A pull request is merged into the `main` branch

## Required GitHub Secrets

You need to set up the following secrets in your GitHub repository:

### 1. FIREBASE_SERVICE_ACCOUNT

This is the Firebase service account JSON key.

**To get this:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings (gear icon)
4. Go to Service Accounts tab
5. Click "Generate new private key"
6. Download the JSON file
7. Copy the entire JSON content
8. Add it as a secret named `FIREBASE_SERVICE_ACCOUNT` in your GitHub repository

### 2. FIREBASE_PROJECT_ID

This is your Firebase project ID.

**To get this:**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. The project ID is displayed in the project settings or in the URL
4. Add it as a secret named `FIREBASE_PROJECT_ID` in your GitHub repository

## How to Add Secrets

1. Go to your GitHub repository
2. Click on "Settings" tab
3. Click on "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact names above

## Workflow Details

The workflow will:

1. Checkout the code
2. Setup Node.js 18
3. Install dependencies with `npm ci`
4. Run linting checks
5. Build the application for production
6. Deploy to Firebase Hosting

## Troubleshooting

- If the deployment fails, check the Actions tab in your GitHub repository for detailed logs
- Ensure your Firebase project has Hosting enabled
- Verify that the service account has the necessary permissions for Firebase Hosting
