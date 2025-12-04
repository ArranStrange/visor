import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

export function ExploreButton() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/search")}
      startIcon={<SearchIcon />}
      sx={{
        textTransform: "none",
        py: 1.5,
        px: { xs: 2, md: 4 },
        width: { xs: "100%", md: "auto" },
        fontSize: "0.95rem",
        fontWeight: 500,
        backgroundColor: (theme) =>
          theme.palette.mode === "dark"
            ? "rgba(255, 255, 255, 0.05)"
            : "rgba(0, 0, 0, 0.03)",
        color: "text.primary",
        "&:hover": {
          backgroundColor: (theme) =>
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(0, 0, 0, 0.05)",
        },
      }}
    >
      Explore VISOR
    </Button>
  );
}

