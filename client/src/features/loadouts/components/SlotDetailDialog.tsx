import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FilmSimCameraSettings from "@/features/film-sims/components/FilmSimCameraSettings";
import type { LoadoutSlot } from "@/features/loadouts/types/loadouts";

interface SlotDetailDialogProps {
  open: boolean;
  slot: LoadoutSlot | null;
  camera: string;
  warnings: string[];
  onClose: () => void;
  onClear: () => void;
  onReplace: () => void;
  onDialIn: () => void;
}

// The slot screen: full in-camera settings in menu order, reusing the
// existing FilmSimCameraSettings renderer. This is the screen someone
// scrolls next to the camera while keying in a bank.
const SlotDetailDialog: React.FC<SlotDetailDialogProps> = ({
  open,
  slot,
  camera,
  warnings,
  onClose,
  onClear,
  onReplace,
  onDialIn,
}) => {
  if (!slot) return null;

  const filmSim = slot.filmSim;
  const displayName = filmSim?.name ?? slot.filmSimName;

  return (
    // md, not sm: FilmSimCameraSettings lays its settings out in two
    // columns on desktop and needs the width to breathe.
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 2,
          px: { xs: 2.5, md: 4 },
          pt: { xs: 2.5, md: 3 },
        }}
      >
        <Typography
          component="span"
          sx={{
            fontFamily: "monospace",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "secondary.main",
          }}
        >
          C{slot.index + 1}
        </Typography>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" component="span" noWrap display="block">
            {displayName}
          </Typography>
          {filmSim && (
            <Link
              component={RouterLink}
              to={`/filmsim/${filmSim.slug}`}
              variant="caption"
              color="text.secondary"
            >
              View recipe
            </Link>
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 2, md: 3 } }}>
        {warnings.map((warning) => (
          <Alert key={warning} severity="warning" sx={{ mb: 2 }}>
            {warning}
          </Alert>
        ))}

        {filmSim ? (
          <FilmSimCameraSettings settings={filmSim.settings ?? undefined} />
        ) : (
          <Alert severity="warning">
            This recipe was removed from VISOR. The settings are still keyed
            into {camera} as <strong>C{slot.index + 1}</strong>, but VISOR can
            no longer show them — replace the slot when you next re-pack.
          </Alert>
        )}

        {slot.note && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Note
            </Typography>
            <Typography variant="body2">{slot.note}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2.5, md: 4 }, py: 2 }}>
        <Button onClick={onClear} color="error">
          Clear slot
        </Button>
        <Button onClick={onReplace}>Replace</Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose}>Close</Button>
        {/* Dial-in needs live settings — a dangling (deleted) recipe has
            none to walk through. */}
        <Button
          onClick={onDialIn}
          variant="contained"
          disabled={!filmSim?.settings}
        >
          Dial this into C{slot.index + 1}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SlotDetailDialog;
