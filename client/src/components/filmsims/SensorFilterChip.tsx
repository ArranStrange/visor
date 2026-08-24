import React from "react";
import { Chip, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getSensorByLabel } from "../../constants/fujifilmSensors";

interface SensorFilterChipProps {
  sensor: string;
}

const SensorFilterChip: React.FC<SensorFilterChipProps> = ({ sensor }) => {
  const navigate = useNavigate();
  const info = getSensorByLabel(sensor);

  return (
    <Tooltip
      title={
        info
          ? `Works on: ${info.cameras.join(", ")} — click to see all ${sensor} film sims`
          : `See all ${sensor} film sims`
      }
    >
      <Chip
        label={sensor}
        color="secondary"
        clickable
        onClick={() => navigate(`/search?sensor=${encodeURIComponent(sensor)}`)}
      />
    </Tooltip>
  );
};

export default SensorFilterChip;
