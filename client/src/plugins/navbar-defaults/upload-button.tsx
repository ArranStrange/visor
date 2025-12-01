import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import UploadIcon from "@mui/icons-material/CloudUpload";

export function NavbarUploadButton() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <IconButton
      data-testid="upload-icon"
      onClick={() => navigate("/upload")}
      color="inherit"
    >
      <UploadIcon />
    </IconButton>
  );
}
