import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";

import { REQUEST_PASSWORD_RESET } from "@/features/auth/graphql/users";
import { getErrorMessage } from "../utils/errorHandling";

/**
 * The server deliberately answers the same way whether or not the address has
 * an account, so this page does too: on success it shows the "check your inbox"
 * state without ever confirming the address exists.
 */
const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requestReset, { loading }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: (data) => {
      if (data.requestPasswordReset.success) {
        setSent(true);
        setError(null);
      } else {
        setError(data.requestPasswordReset.message);
      }
    },
    // Rate limiting is the one failure the user needs to see.
    onError: (err) =>
      setError(getErrorMessage(err, "Could not send the reset email.")),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    requestReset({ variables: { email } });
  };

  if (sent) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Stack spacing={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Check your inbox
          </Typography>
          <Typography color="text.secondary">
            If <strong>{email}</strong> has a VISOR account, a reset link is on
            its way. The link works once and expires in an hour.
          </Typography>
          <Alert severity="info">
            Nothing arrived? Check your spam folder, then try again — and make
            sure the address matches the one you signed up with.
          </Alert>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Back to login
            </Button>
            <Button
              variant="text"
              onClick={() => {
                setSent(false);
                setError(null);
              }}
            >
              Use a different address
            </Button>
          </Stack>
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
        Reset your password
      </Typography>
      <Typography color="text.secondary" textAlign="center" sx={{ mb: 1 }}>
        We'll email you a link to choose a new one.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3} mt={4}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading || email.trim().length === 0}
          >
            {loading ? <CircularProgress size={24} /> : "Send reset link"}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Back to login
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
