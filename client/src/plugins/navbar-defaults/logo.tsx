import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Logo from "../../assets/VISOR.png";

export function NavbarLogo() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "start",
        gap: 1,
        cursor: "pointer",
      }}
      onClick={() => navigate("/")}
    >
      <img src={Logo} alt="VISOR logo" style={{ height: 28 }} />
    </Box>
  );
}
