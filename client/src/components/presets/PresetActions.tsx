import React from "react";
import { Stack, Button } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate } from "react-router-dom";

interface PresetActionsProps {
  preset?: any;
  currentUser?: any;
  onDownload?: () => void;
}

const PresetActions: React.FC<PresetActionsProps> = ({
  currentUser,
  onDownload,
}) => {
  const isAuthenticated = !!currentUser;
  const navigate = useNavigate();

  return (
    <Stack direction="row" alignItems="center" spacing={2} my={4}>
      {isAuthenticated ? (
        <Button
          onClick={onDownload}
          variant="contained"
          startIcon={<DownloadIcon />}
        >
          Download .xmp
        </Button>
      ) : (
        <Button
          onClick={() => navigate("/login")}
          variant="outlined"
          startIcon={<DownloadIcon />}
          color="primary"
        >
          Login to Download .xmp
        </Button>
      )}
    </Stack>
  );
};

export default PresetActions;

