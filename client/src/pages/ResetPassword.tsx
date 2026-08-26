import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@apollo/client";

import { RESET_PASSWORD } from "@/features/auth/graphql/users";
import {
  PASSWORD_HINT,
  validatePassword,
} from "@/features/auth/utils/passwordRules";
import { getErrorMessage } from "../utils/errorHandling";

/** Lands here from the emailed link, which carries the token and the address. */
const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      if (data.resetPassword.success) {
        setDone(true);
        setError(null);
      } else {
        setError(data.resetPassword.message);
      }
    },
    onError: (err) =>
      setError(getErrorMessage(err, "Could not reset your password.")),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const problem = validatePassword(password);
    setPasswordError(problem);
    if (problem) return;

    resetPassword({ variables: { token, email, newPassword: password } });
  };

  // A link missing either half cannot be acted on, so say so rather than
  // letting someone type a new password and fail on submit.
  if (!token || !email) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            This link is incomplete
          </Typography>
          <Typography color="text.secondary">
            Open the link from your reset email again, or request a new one.
            Some email clients split long links across lines.
          </Typography>
          <Box>
            <Button
              variant="contained"
              onClick={() => navigate("/forgot-password")}
            >
              Request a new link
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  if (done) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Password updated
          </Typography>
          <Typography color="text.secondary">
            You can now log in with your new password. Any other devices you
            were signed in on have been signed out.
          </Typography>
          <Box>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Go to login
            </Button>
          </Box>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        Choose a new password
      </Typography>
      <Typography color="text.secondary" textAlign="center">
        for {email}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3} mt={4}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <TextField
              label="New password"
              type="password"
              fullWidth
              required
              autoComplete="new-password"
              autoFocus
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError(validatePassword(event.target.value));
              }}
              disabled={loading}
              error={!!passwordError}
            />
            {passwordError ? (
              <FormHelperText error>{passwordError}</FormHelperText>
            ) : (
              <FormHelperText>{PASSWORD_HINT}</FormHelperText>
            )}
          </Box>

          <TextField
            label="Confirm new password"
            type="password"
            fullWidth
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={loading}
            error={confirmPassword.length > 0 && password !== confirmPassword}
            helperText={
              confirmPassword.length > 0 && password !== confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || password.length === 0}
          >
            {loading ? <CircularProgress size={24} /> : "Set new password"}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ResetPassword;
