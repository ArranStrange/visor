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
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        Create Your VISOR Account
      </Typography>

      <Box component="form" onSubmit={handleRegister} noValidate>
        <Stack spacing={3} mt={4}>
          {error && <Alert severity="error">{error}</Alert>}

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
            />
            {passwordError && (
              <FormHelperText error>{passwordError}</FormHelperText>
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
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Register"}
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
