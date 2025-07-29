const axios = require("axios");

class ReCAPTCHAService {
  static async verifyToken(token, remoteip = null) {
    // TEMPORARILY DISABLED - Always return success
    console.log("reCAPTCHA temporarily disabled - allowing all tokens");
    return {
      success: true,
      message: "reCAPTCHA temporarily disabled",
    };

    // Original code commented out below
    /*
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    const NODE_ENV = process.env.NODE_ENV || "development";
    const ENABLE_RECAPTCHA = process.env.ENABLE_RECAPTCHA !== "false"; // Default to true

    // If reCAPTCHA is disabled, allow all tokens
    if (!ENABLE_RECAPTCHA) {
      console.log("reCAPTCHA disabled - allowing all tokens");
      return {
        success: true,
        message: "reCAPTCHA disabled",
      };
    }

    // In development mode, allow test tokens for easier testing
    if (
      NODE_ENV === "development" &&
      (token === "test-recaptcha-token" || token === "development-bypass")
    ) {
      console.log("Development mode: Allowing test reCAPTCHA token");
      return {
        success: true,
        message: "Development mode - test token accepted",
      };
    }

    // Temporary production bypass for testing (remove this when you have proper keys)
    if (NODE_ENV === "production" && token === "production-bypass") {
      console.log("Production mode: Allowing bypass token for testing");
      return {
        success: true,
        message: "Production mode - bypass token accepted",
      };
    }

    if (!RECAPTCHA_SECRET_KEY) {
      console.warn(
        "reCAPTCHA secret key not configured. Skipping verification."
      );
      return { success: true, message: "reCAPTCHA not configured" };
    }

    if (!token) {
      return { success: false, message: "reCAPTCHA token is required" };
    }

    try {
      const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";
      const params = new URLSearchParams({
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      });

      if (remoteip) {
        params.append("remoteip", remoteip);
      }

      const response = await axios.post(verificationUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const {
        success,
        score,
        action,
        challenge_ts,
        hostname,
        "error-codes": errorCodes,
      } = response.data;

      if (!success) {
        console.error("reCAPTCHA verification failed:", errorCodes);
        return {
          success: false,
          message: "reCAPTCHA verification failed",
          errorCodes,
        };
      }

      // For reCAPTCHA v2, success is sufficient
      // For reCAPTCHA v3, you might want to check the score
      if (score !== undefined && score < 0.5) {
        return {
          success: false,
          message: "reCAPTCHA score too low",
          score,
        };
      }

      return {
        success: true,
        message: "reCAPTCHA verification successful",
        score,
        action,
        challenge_ts,
        hostname,
      };
    } catch (error) {
      console.error("Error verifying reCAPTCHA token:", error);
      return {
        success: false,
        message: "Error verifying reCAPTCHA token",
        error: error.message,
      };
    }
    */
  }
}

module.exports = ReCAPTCHAService;
