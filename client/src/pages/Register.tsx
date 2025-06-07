import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      // Replace with real API call or Apollo mutation
      console.log("Registering with:", form);
      // await registerUser(form)
      navigate("/");
    } catch (err) {
      setError("Registration failed");
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
          />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            required
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
            required
          />

          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />

          <Button type="submit" variant="contained" size="large">
            Register
          </Button>

          <Button variant="text" onClick={() => navigate("/login")}>
            Already have an account? Sign In
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Register;
