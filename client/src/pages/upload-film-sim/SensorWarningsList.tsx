import React from "react";
import { getSensorCompatibilityWarnings } from "../../constants/fujifilmSensors";
import { FilmSimSettings } from "../../types/filmSim";
import SensorWarning from "./SensorWarning";

interface SensorWarningsListProps {
  compatibleSensors: string[];
  settings: FilmSimSettings;
}

const SensorWarningsList: React.FC<SensorWarningsListProps> = ({
  compatibleSensors,
  settings,
}) => {
  const warnings = getSensorCompatibilityWarnings(compatibleSensors, settings);

  return (
    <>
      {warnings.map((warning) => (
        <SensorWarning key={warning} warning={warning} />
      ))}
    </>
  );
};

export default SensorWarningsList;
