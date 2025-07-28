import React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TuneIcon from "@mui/icons-material/Tune";
import CameraRollIcon from "@mui/icons-material/CameraRoll";

const Upload: React.FC = () => {
  const navigate = useNavigate();

  const options = [
    {
      title: "Upload Preset",
      value: "preset",
      icon: <TuneIcon />,
      path: "/upload/preset",
    },
    {
      title: "Upload Film Simulation",
      value: "filmsim",
      icon: <CameraRollIcon />,
      path: "/upload/filmsim",
    },
  ] as const;

  return (
    <Container data-cy="upload-page" maxWidth="lg" sx={{ py: 4 }}>
      <Paper data-cy="upload-form" sx={{ p: 4 }}>
        <Typography data-cy="upload-title" variant="h4" gutterBottom>
          Upload
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Choose what you would like to upload:
        </Typography>

        <Box display="flex" justifyContent="center" mt={4}>
          <ToggleButtonGroup
            data-cy="upload-type-toggle"
            exclusive
            sx={{
              backgroundColor: "background.default",
              borderRadius: "999px",
              boxShadow: 1,
              p: 0.5,
              gap: 0.5,
            }}
          >
            {options.map(({ value, icon, title, path }) => (
              <Tooltip key={value} title={title} arrow>
                <ToggleButton
                  data-cy={`upload-${value}-tab`}
                  value={value}
                  onClick={() => navigate(path)}
                  sx={{
                    border: "none",
                    borderRadius: "999px",
                    textTransform: "none",
                    px: 3,
                    py: 1,
                    fontWeight: "medium",
                    fontSize: "0.9rem",
                    color: "text.primary",
                    backgroundColor: "transparent",
                    "&:hover": {
                      backgroundColor: "action.hover",
                    },
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  {icon}
                  <Typography variant="caption">{title}</Typography>
                </ToggleButton>
              </Tooltip>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Paper>
    </Container>
  );
};

export default Upload;
