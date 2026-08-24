import React from "react";
import { Box, Chip, Tooltip, SxProps, Theme } from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { useNavigate } from "react-router-dom";
import { getSensorForCamera } from "../../constants/fujifilmSensors";

export interface CameraChipsProps {
  cameras: string[];
  onRemove?: (camera: string) => void;
  showIcon?: boolean;
  showTooltip?: boolean;
  sx?: SxProps<Theme>;
}

const CameraChips: React.FC<CameraChipsProps> = ({
  cameras,
  onRemove,
  showIcon = false,
  showTooltip = false,
  sx,
}) => {
  const navigate = useNavigate();

  return (
    <Box display="flex" flexWrap="wrap" gap={1} sx={sx}>
      {cameras.map((camera) => renderChip(camera))}
    </Box>
  );

  function renderChip(camera: string) {
    const sensor = getSensorForCamera(camera);
    const clickable = !onRemove && !!sensor;

    const chip = (
      <Chip
        label={camera}
        icon={showIcon ? <CameraAltIcon /> : undefined}
        color={sensor ? "secondary" : "default"}
        variant={clickable ? "outlined" : "filled"}
        clickable={clickable}
        onClick={
          clickable
            ? () =>
                navigate(`/search?sensor=${encodeURIComponent(sensor!.label)}`)
            : undefined
        }
        onDelete={onRemove ? () => onRemove(camera) : undefined}
      />
    );

    if (!showTooltip) {
      return <React.Fragment key={camera}>{chip}</React.Fragment>;
    }

    return (
      <Tooltip
        key={camera}
        title={sensor ? `See film sims for ${sensor.label}` : ""}
      >
        {chip}
      </Tooltip>
    );
  }
};

export default CameraChips;
