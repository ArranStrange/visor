import React from "react";
import {
  Autocomplete,
  Box,
  Button,
  Popover,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  FUJIFILM_CAMERAS,
  normalizeCameraName,
  type FujifilmCamera,
} from "@/constants/fujifilmCameras";
import { useCamera } from "@/context/CameraContext";

/**
 * Compact picker for the body the app personalises for.
 *
 * Selection is constrained to the catalogue rather than free text (unlike the
 * profile's "cameras I own" field): this value drives sensor filtering and
 * compatibility verdicts, so a name that resolves to nothing would silently
 * turn those features off. Matching is tolerant of how the name is written —
 * "xt30ii" and "Fujifilm X-T30 II" both find the same body.
 */

const matchesQuery = (camera: FujifilmCamera, query: string) => {
  const normalizedQuery = normalizeCameraName(query);
  if (!normalizedQuery) return true;
  return normalizeCameraName(camera.name).includes(normalizedQuery);
};

const PrimaryCameraPicker: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { camera, setPrimaryCamera } = useCamera();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const label = camera?.name ?? "Set camera";

  return (
    <>
      <Tooltip
        title={
          camera
            ? `Showing what fits your ${camera.name}`
            : "Pick your camera to see what fits it"
        }
      >
        <Button
          data-testid="primary-camera-picker"
          size="small"
          color={camera ? "inherit" : "primary"}
          variant={camera ? "text" : "outlined"}
          startIcon={<PhotoCameraIcon fontSize="small" />}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            // The unset state is a nudge, not an alarm: it reads as a quiet
            // suggestion until the user has told us what they shoot.
            color: camera ? "text.secondary" : "primary.main",
            minWidth: 0,
            "& .MuiButton-startIcon": { mr: isMobile ? 0 : 0.75 },
          }}
        >
          {!isMobile && label}
        </Button>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <Box sx={{ p: 2, width: 300, backgroundColor: "background.paper" }}>
          <Typography variant="subtitle2" gutterBottom>
            Your camera
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, display: "block" }}
          >
            Recipes are checked against this body — what fits, what it can't do,
            and what to dial in.
          </Typography>

          <Autocomplete
            autoHighlight
            openOnFocus
            options={FUJIFILM_CAMERAS}
            value={camera}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, selected) =>
              option.name === selected.name
            }
            groupBy={(option) => option.sensorKey}
            filterOptions={(options, state) =>
              options.filter((option) => matchesQuery(option, state.inputValue))
            }
            onChange={(_, selected) => {
              setPrimaryCamera(selected?.name ?? null);
              setAnchorEl(null);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                size="small"
                placeholder="Search Fujifilm bodies"
              />
            )}
          />

          {camera && (
            <Button
              size="small"
              color="inherit"
              sx={{ mt: 1.5, textTransform: "none", color: "text.secondary" }}
              onClick={() => {
                setPrimaryCamera(null);
                setAnchorEl(null);
              }}
            >
              Clear
            </Button>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default PrimaryCameraPicker;
