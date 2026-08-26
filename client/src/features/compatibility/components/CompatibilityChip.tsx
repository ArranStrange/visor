import React from "react";
import { Chip, Tooltip, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useCamera } from "@/context/CameraContext";
import { getCompatibilityVerdict } from "../verdict";
import type { CompatibilityStatus, CompatibilitySubject } from "../index";

/**
 * The five-state compatibility verdict, as a chip with the reasons in a
 * tooltip. Renders nothing when no camera is set — an UNVERIFIED chip on
 * every card would be noise, not information.
 */

type ChipColor = "success" | "info" | "warning" | "error" | "default";

const PRESENTATION: Record<
  CompatibilityStatus,
  { label: string; color: ChipColor; icon: React.ReactElement }
> = {
  FITS: {
    label: "Fits your camera",
    color: "success",
    icon: <CheckCircleIcon />,
  },
  FITS_WITH_SUBSTITUTIONS: {
    label: "Fits, with tweaks",
    color: "info",
    icon: <SwapHorizIcon />,
  },
  PARTIAL: {
    label: "Partly fits",
    color: "warning",
    icon: <WarningAmberIcon />,
  },
  INCOMPATIBLE: {
    label: "Not on your camera",
    color: "error",
    icon: <ErrorOutlineIcon />,
  },
  UNVERIFIED: {
    label: "Not checked",
    color: "default",
    icon: <HelpOutlineIcon />,
  },
};

interface CompatibilityChipProps extends CompatibilitySubject {
  size?: "small" | "medium";
  /** Show the chip even when the verdict is UNVERIFIED. */
  showUnverified?: boolean;
}

const CompatibilityChip: React.FC<CompatibilityChipProps> = ({
  settings,
  compatibleSensors,
  size = "small",
  showUnverified = false,
}) => {
  const { cameraKey } = useCamera();
  const verdict = getCompatibilityVerdict(cameraKey, {
    settings,
    compatibleSensors,
  });

  if (verdict.status === "UNVERIFIED" && !showUnverified) return null;

  const { label, color, icon } = PRESENTATION[verdict.status];
  const tooltip = verdict.reasons.length
    ? verdict.reasons.map((reason) => (
        <Typography key={reason} variant="caption" component="p">
          {reason}
        </Typography>
      ))
    : "Every setting in this recipe is available on your camera.";

  return (
    <Tooltip title={<>{tooltip}</>} arrow>
      <Chip
        data-testid="compatibility-chip"
        data-status={verdict.status}
        size={size}
        color={color}
        variant="outlined"
        icon={icon}
        label={label}
      />
    </Tooltip>
  );
};

export default CompatibilityChip;
