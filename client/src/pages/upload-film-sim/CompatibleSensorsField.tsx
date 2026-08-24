import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { SENSOR_LABELS } from "../../constants/fujifilmSensors";

interface CompatibleSensorsFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled: boolean;
}

const CompatibleSensorsField: React.FC<CompatibleSensorsFieldProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Autocomplete
      multiple
      options={SENSOR_LABELS}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      renderInput={renderInput}
    />
  );

  function handleChange(_event: React.SyntheticEvent, newValue: string[]) {
    onChange(newValue);
  }

  function renderInput(params: React.ComponentProps<typeof TextField>) {
    return (
      <TextField
        {...params}
        label="Compatible Sensors"
        placeholder="e.g. X-Trans IV"
      />
    );
  }
};

export default CompatibleSensorsField;
