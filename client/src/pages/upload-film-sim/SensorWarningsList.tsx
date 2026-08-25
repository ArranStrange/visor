import React from "react";
import { getSensorCompatibilityWarnings } from "@/features/film-sims/utils/fujifilmSensors";
import { FilmSimSettings } from "@/features/film-sims/types/filmSim";
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
