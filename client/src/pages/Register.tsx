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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../graphql/mutations/register";

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

  const [register, { loading }] = useMutation(REGISTER_USER, {
    onCompleted: (data) => {
      // Store the token in localStorage
      localStorage.setItem("token", data.register.token);
      // Store user data if needed
      localStorage.setItem("user", JSON.stringify(data.register.user));
      // Navigate to home page
      navigate("/");
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

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        component="h1"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        Create Your VISOR Account
      </Typography>

      <Box
        component="form"
        onSubmit={handleRegister}
        noValidate
        role="form"
        aria-label="Registration form"
      >
        <Stack spacing={3} mt={4}>
          {error && (
            <Alert severity="error" role="alert" aria-live="polite">
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
            aria-required="true"
            aria-describedby={
              form.username.length > 0 && form.username.length < 3
                ? "username-error"
                : undefined
            }
            inputProps={{
              minLength: 3,
              "aria-label": "Username (minimum 3 characters)",
              autoComplete: "username",
            }}
            error={form.username.length > 0 && form.username.length < 3}
            helperText={
              form.username.length > 0 && form.username.length < 3
                ? "Username must be at least 3 characters"
                : ""
            }
            id="username-error"
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
            aria-required="true"
            inputProps={{
              "aria-label": "Email address",
              autoComplete: "email",
            }}
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
              aria-required="true"
              aria-describedby={
                passwordError ? "password-error" : "password-help"
              }
              inputProps={{
                "aria-label":
                  "Password (minimum 6 characters with uppercase letter)",
                autoComplete: "new-password",
              }}
            />
            {passwordError && (
              <FormHelperText error id="password-error">
                {passwordError}
              </FormHelperText>
            )}
            <FormHelperText id="password-help">
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
            aria-required="true"
            aria-describedby={
              form.confirmPassword.length > 0 &&
              form.password !== form.confirmPassword
                ? "confirm-password-error"
                : undefined
            }
            inputProps={{
              "aria-label": "Confirm password",
              autoComplete: "new-password",
            }}
            helperText={
              form.confirmPassword.length > 0 &&
              form.password !== form.confirmPassword
                ? "Passwords do not match"
                : ""
            }
            id="confirm-password-error"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            aria-label={loading ? "Creating account..." : "Create account"}
          >
            {loading ? (
              <CircularProgress size={24} aria-label="Loading" />
            ) : (
              "Register"
            )}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/login")}
            disabled={loading}
            aria-label="Navigate to sign in page"
          >
            Already have an account? Sign In
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
