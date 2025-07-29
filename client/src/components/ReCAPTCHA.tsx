import React, { useRef, useEffect, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Box, Alert } from "@mui/material";
import { ENV_CONFIG } from "../config/environment";

interface ReCAPTCHAProps {
  onVerify: (token: string | null) => void;
  disabled?: boolean;
}

const ReCAPTCHAComponent: React.FC<ReCAPTCHAProps> = ({
  onVerify,
  disabled = false,
}) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    // Check if reCAPTCHA should be enabled
    const shouldEnable = ENV_CONFIG.ENABLE_RECAPTCHA && !disabled;
    setIsEnabled(shouldEnable);

    if (!shouldEnable) {
      // If reCAPTCHA is disabled, call onVerify with a bypass token
      onVerify("recaptcha-disabled");
    }
  }, [disabled, onVerify]);

  const handleChange = (token: string | null) => {
    onVerify(token);
  };

  // If reCAPTCHA is disabled, don't render the component
  if (!isEnabled) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
          reCAPTCHA is currently disabled for this environment.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={ENV_CONFIG.RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        theme="light"
      />
    </Box>
  );
};

export default ReCAPTCHAComponent;
