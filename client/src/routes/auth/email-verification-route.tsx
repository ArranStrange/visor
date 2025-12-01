import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import {
  VERIFY_EMAIL,
  RESEND_VERIFICATION_EMAIL,
} from "@gql/mutations/register";
import { CheckCircle, Email, Error } from "@mui/icons-material";

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error" | "expired"
  >("pending");
  const [message, setMessage] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  const [verifyEmail, { loading: verifying }] = useMutation(VERIFY_EMAIL, {
    onCompleted: (data) => {
      if (data.verifyEmail.success) {
        setVerificationStatus("success");
        setMessage(data.verifyEmail.message || "Email verified successfully!");

        // Store user data and token if provided
        if (data.verifyEmail.user) {
          localStorage.setItem("user", JSON.stringify(data.verifyEmail.user));
        }

        // Redirect to home after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setVerificationStatus("error");
        setMessage(data.verifyEmail.message || "Verification failed");
      }
    },
    onError: (error) => {
      setVerificationStatus("error");
      setMessage(error.message || "Verification failed. Please try again.");
    },
  });

  const [resendEmail, { loading: resending }] = useMutation(
    RESEND_VERIFICATION_EMAIL,
    {
      onCompleted: (data) => {
        if (data.resendVerificationEmail.success) {
          setMessage(
            data.resendVerificationEmail.message || "Verification email sent!"
          );
        } else {
          setMessage(
            data.resendVerificationEmail.message || "Failed to resend email"
          );
        }
      },
      onError: (error) => {
        setMessage(error.message || "Failed to resend verification email");
      },
    }
  );

  useEffect(() => {
    const token = searchParams.get("token");
    const emailParam = searchParams.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }

    if (token) {
      verifyEmail({ variables: { token } });
    } else {
      setVerificationStatus("expired");
      setMessage("Invalid verification link. Please request a new one.");
    }
  }, [searchParams, verifyEmail]);

  const handleResendEmail = () => {
    if (email) {
      resendEmail({ variables: { email } });
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case "success":
        return <CheckCircle sx={{ fontSize: 64, color: "success.main" }} />;
      case "error":
      case "expired":
        return <Error sx={{ fontSize: 64, color: "error.main" }} />;
      default:
        return <Email sx={{ fontSize: 64, color: "primary.main" }} />;
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case "success":
        return "success";
      case "error":
      case "expired":
        return "error";
      default:
        return "info";
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <Box sx={{ mb: 3 }}>
          {verifying ? <CircularProgress size={64} /> : getStatusIcon()}
        </Box>

        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Email Verification
        </Typography>

        {message && (
          <Alert
            severity={getStatusColor()}
            sx={{ mb: 3 }}
            data-cy={`verification-${verificationStatus}`}
          >
            {message}
          </Alert>
        )}

        <Stack spacing={2}>
          {verificationStatus === "pending" && verifying && (
            <Typography
              variant="body1"
              color="text.secondary"
              data-cy="verification-status"
            >
              Verifying your email...
            </Typography>
          )}

          {verificationStatus === "success" && (
            <>
              <Typography variant="body1" color="text.secondary">
                Your email has been verified successfully! You will be
                redirected to the home page shortly.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/")}
                sx={{ mt: 2 }}
              >
                Go to Home
              </Button>
            </>
          )}

          {(verificationStatus === "error" ||
            verificationStatus === "expired") && (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                The verification link is invalid or has expired. Please request
                a new verification email.
              </Typography>

              {email && (
                <Button
                  variant="contained"
                  onClick={handleResendEmail}
                  disabled={resending}
                  startIcon={
                    resending ? <CircularProgress size={20} /> : <Email />
                  }
                  data-cy="resend-verification"
                >
                  {resending ? "Sending..." : "Resend Verification Email"}
                </Button>
              )}

              <Button variant="outlined" onClick={() => navigate("/register")}>
                Back to Registration
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Container>
  );
};

export default EmailVerification;
