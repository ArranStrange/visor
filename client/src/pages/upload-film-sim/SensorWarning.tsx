import React from "react";
import { Alert } from "@mui/material";

interface SensorWarningProps {
  warning: string;
}

const SensorWarning: React.FC<SensorWarningProps> = ({ warning }) => (
  <Alert severity="warning">{warning}</Alert>
);

export default SensorWarning;
