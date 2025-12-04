import { IconButton, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import LoginIcon from "@mui/icons-material/Login";

export function NavbarLoginButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return null;

  return (
    <>
      <IconButton
        onClick={() => navigate("/login")}
        color="inherit"
        sx={{ display: { xs: "flex", sm: "none" } }}
      >
        <LoginIcon />
      </IconButton>
      <Button
        variant="outlined"
        color="primary"
        size="small"
        onClick={() => navigate("/login")}
        sx={{
          display: { xs: "none", sm: "inline-flex" },
          borderRadius: 2,
        }}
      >
        Login
      </Button>
    </>
  );
}
