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

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Replace with real API call or Apollo mutation
      console.log("Logging in with:", form);
      // await loginUser(form)
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  const handleGuestLogin = () => {
    console.log("Logging in as guest");
    navigate("/");
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        textAlign="center"
      >
        Sign In to VISOR
      </Typography>

      <Box component="form" onSubmit={handleLogin} noValidate>
        <Stack spacing={3} mt={4}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Email or Username"
            name="email"
            type="text"
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

          <Button type="submit" variant="contained" size="large">
            Login
          </Button>

          <Button onClick={handleGuestLogin} variant="outlined">
            Continue as Guest
          </Button>

          <Button variant="text" onClick={() => navigate("/register")}>
            Don’t have an account? Register
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
