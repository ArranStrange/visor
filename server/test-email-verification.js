const EmailService = require("./utils/emailService");
const ReCAPTCHAService = require("./utils/recaptchaService");

async function testEmailVerification() {
  console.log("🧪 Testing Email Verification Setup");
  console.log("===================================");

  // Test email service
  console.log("\n1. Testing Email Service...");
  try {
    const emailResult = await EmailService.sendVerificationEmail(
      "test@example.com",
      "testuser",
      "test-token-123"
    );
    console.log("Email service result:", emailResult);
  } catch (error) {
    console.error("Email service error:", error.message);
  }

  // Test reCAPTCHA service
  console.log("\n2. Testing reCAPTCHA Service...");
  try {
    const recaptchaResult = await ReCAPTCHAService.verifyToken("test-token");
    console.log("reCAPTCHA service result:", recaptchaResult);
  } catch (error) {
    console.error("reCAPTCHA service error:", error.message);
  }

  console.log("\n✅ Test completed!");
  console.log("\nNext steps:");
  console.log("1. Get your reCAPTCHA keys from google.com/recaptcha/admin");
  console.log("2. Update the .env file with your reCAPTCHA keys");
  console.log("3. Start your server: npm run dev");
  console.log("4. Test the complete registration flow");
}

testEmailVerification();
