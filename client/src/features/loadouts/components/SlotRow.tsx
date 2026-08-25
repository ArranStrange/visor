import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import type { LoadoutSlot } from "@/features/loadouts/types/loadouts";
import { optimizeImageUrl } from "@/utils/cloudinary";

interface SlotRowProps {
  index: number;
  slot: LoadoutSlot | null;
  warnings: string[];
  onClick: () => void;
}

// One bank row in the wallet. The C-number is deliberately the loudest
// element — it's the only bridge back to the physical dial. Sized for
// one-handed outdoor use: the whole row is a single large tap target.
const SlotRow: React.FC<SlotRowProps> = ({ index, slot, warnings, onClick }) => {
  const filmSim = slot?.filmSim ?? null;
  // Snapshot name survives recipe deletion: the recipe is still keyed
  // into the physical camera even if it vanished from VISOR.
  const displayName = filmSim?.name ?? slot?.filmSimName ?? null;
  const isEmpty = !displayName;
  const isDangling = !filmSim && !!slot?.filmSimName;
  const hasWarnings = warnings.length > 0;

  const thumb =
    filmSim?.thumbnail || filmSim?.sampleImages?.[0]?.url || null;

  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Bank C${index + 1}: ${displayName ?? "empty"}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: "grid",
        gridTemplateColumns: "48px 44px 1fr auto",
        alignItems: "center",
        gap: 1.5,
        p: 1.25,
        borderRadius: 2,
        cursor: "pointer",
        backgroundColor: isEmpty ? "transparent" : "background.paper",
        border: "1px solid",
        borderColor: hasWarnings
          ? "warning.main"
          : isEmpty
            ? "surface.outline"
            : "surface.border",
        borderStyle: isEmpty ? "dashed" : "solid",
        "&:hover": { backgroundColor: "action.hover" },
      }}
    >
      <Typography
        sx={{
          fontFamily: "monospace",
          fontSize: "1.4rem",
          fontWeight: 700,
          color: hasWarnings
            ? "warning.main"
            : isEmpty
              ? "text.disabled"
              : "secondary.main",
        }}
      >
        C{index + 1}
      </Typography>

      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1,
          overflow: "hidden",
          backgroundColor: "surface.input",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {thumb ? (
          <img
            src={optimizeImageUrl(thumb, 96)}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          isEmpty && <AddIcon sx={{ color: "text.disabled" }} fontSize="small" />
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          noWrap
          sx={{ color: isEmpty ? "text.disabled" : "text.primary" }}
        >
          {displayName ?? "Empty — tap to fill"}
        </Typography>
        {filmSim?.settings?.filmSimulation && (
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {filmSim.settings.filmSimulation}
          </Typography>
        )}
        {isDangling && (
          <Typography variant="caption" color="warning.main" noWrap display="block">
            Recipe removed from VISOR — still in your camera
          </Typography>
        )}
        {slot?.sourceChanged && (
          <Typography variant="caption" color="warning.main" noWrap display="block">
            Recipe updated since you keyed it in
          </Typography>
        )}
      </Box>

      {hasWarnings && (
        <Tooltip title={warnings.join(" · ")} arrow>
          <WarningAmberIcon sx={{ color: "warning.main" }} fontSize="small" />
        </Tooltip>
      )}
    </Box>
  );
};

export default SlotRow;
