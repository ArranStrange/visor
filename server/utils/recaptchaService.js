const axios = require("axios");

class ReCAPTCHAService {
  static async verifyToken(token, remoteip = null) {
    const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
    const NODE_ENV = process.env.NODE_ENV || "development";

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
  }
}

module.exports = ReCAPTCHAService;
