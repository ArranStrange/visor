import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";

export function NavbarSearchButton() {
  const navigate = useNavigate();

  return (
    <IconButton onClick={() => navigate("/explore")} color="inherit">
      <SearchIcon />
    </IconButton>
  );
}
