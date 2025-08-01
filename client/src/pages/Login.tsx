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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../graphql/mutations/login";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN_USER, {
    onCompleted: (data) => {
      console.log("Login response:", data);
      if (data?.login?.token) {
        // Store the token in localStorage
        localStorage.setItem("visor_token", data.login.token);
        // Store user data
        if (data.login.user) {
          const userData = {
            id: data.login.user.id,
            username: data.login.user.username,
            email: data.login.user.email,
            avatar: data.login.user.avatar,
          };
          localStorage.setItem("user", JSON.stringify(userData));
          setUser(userData);
          // Navigate to home page
          navigate("/");
        } else {
          setError("No user data received from server");
        }
      } else {
        setError("No token received from server");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      setError(error.message || "Failed to login. Please try again.");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({
        variables: {
          email: form.email,
          password: form.password,
        },
      });
    } catch (err) {
      // Error is handled in onError callback
      console.error("Login error:", err);
    }
  };

  const handleGuestLogin = () => {
    // For guest login, we'll just store a guest token
    localStorage.setItem("token", "guest");
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
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={form.email}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={form.password}
            onChange={handleChange}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Button
            onClick={handleGuestLogin}
            variant="outlined"
            disabled={loading}
          >
            Continue as Guest
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Don't have an account? Register
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

export default Login;
