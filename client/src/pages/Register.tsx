import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  FormHelperText,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../graphql/mutations/register";
import { Email } from "@mui/icons-material";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [register, { loading }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      if (data.register.success) {
        if (data.register.requiresVerification) {
          setRegistrationSuccess(true);
          setError(null);
        } else {
          // Store the token in localStorage if no verification required
          localStorage.setItem("token", data.register.token);
          localStorage.setItem("user", JSON.stringify(data.register.user));
          navigate("/");
        }
      } else {
        setError(
          data.register.message || "Registration failed. Please try again."
        );
      }
    },
    onError: (error) => {
      setError(error.message || "Registration failed. Please try again.");
    },
  });

  const validatePassword = (password: string): boolean => {
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!validatePassword(form.password)) {
      return;
    }

    try {
      await register({
        variables: {
          username: form.username,
          email: form.email,
          password: form.password,
        },
      });
    } catch (err) {
      // Error is handled in onError callback
      console.error("Registration error:", err);
    }
  };

  if (registrationSuccess) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
          <Email sx={{ fontSize: 64, color: "primary.main", mb: 3 }} />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Check Your Email
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
            data-cy="email-verification-message"
          >
            We've sent a verification email to <strong>{form.email}</strong>.
            Please click the link in the email to verify your account.
          </Typography>

          <Alert severity="info" sx={{ mb: 3 }}>
            If you don't see the email, check your spam folder.
          </Alert>

          <Stack spacing={2}>
            <Button variant="contained" onClick={() => navigate("/login")}>
              Go to Login
            </Button>

            <Button
              variant="outlined"
              onClick={() => {
                setRegistrationSuccess(false);
                setForm({
                  username: "",
                  email: "",
                  password: "",
                  confirmPassword: "",
                });
              }}
            >
              Register Another Account
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }} data-cy="register-page">
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        Create Your VISOR Account
      </Typography>

      <Box component="form" onSubmit={handleRegister} noValidate>
        <Stack spacing={3} mt={4}>
          {error && (
            <Alert severity="error" data-cy="error-message">
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            name="username"
            fullWidth
            value={form.username}
            onChange={handleChange}
            required
            disabled={loading}
            inputProps={{ minLength: 3 }}
            error={form.username.length > 0 && form.username.length < 3}
            helperText={
              form.username.length > 0 && form.username.length < 3
                ? "Username must be at least 3 characters"
                : ""
            }
            data-cy="username-input"
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
            data-cy="email-input"
          />

          <Box>
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              error={!!passwordError}
              data-cy="password-input"
            />
            {passwordError && (
              <FormHelperText error data-cy="password-error">
                {passwordError}
              </FormHelperText>
            )}
            <FormHelperText>
              Password must be at least 6 characters and contain an uppercase
              letter
            </FormHelperText>
          </Box>

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={form.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
            error={
              form.confirmPassword.length > 0 &&
              form.password !== form.confirmPassword
            }
            helperText={
              form.confirmPassword.length > 0 &&
              form.password !== form.confirmPassword
                ? "Passwords do not match"
                : ""
            }
            data-cy="confirm-password-input"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            data-cy="register-button"
          >
            {loading ? <CircularProgress size={24} /> : "Create Account"}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Already have an account? Sign In
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
