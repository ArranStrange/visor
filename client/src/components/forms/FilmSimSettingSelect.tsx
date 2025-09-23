import React from "react";
import {
  Grid,
  FormControl,
  Typography,
  Box,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { FilmSimSettings } from "../../types/filmSim";

interface FilmSimSettingSelectProps {
  label: string;
  value: string | number | null;
  options: { value: string | number | null; label: string }[];
  settingKey: keyof FilmSimSettings;
  onChange: (
    settingKey: keyof FilmSimSettings,
    value: string | number | null
  ) => void;
}

const FilmSimSettingSelect: React.FC<FilmSimSettingSelectProps> = ({
  label,
  value,
  options,
  settingKey,
  onChange,
}) => (
  <Grid {...(undefined as any)} item xs={12} md={6}>
    <FormControl fullWidth>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <Typography>{label}</Typography>
      </Box>
      <Select
        value={value === null ? "null" : value}
        onChange={(e: SelectChangeEvent<string | number>) => {
          const newValue = options.find(
            (opt) =>
              (opt.value === null ? "null" : opt.value) === e.target.value
          )?.value;
          if (newValue !== undefined) {
            onChange(settingKey, newValue);
          }
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.value === null ? "null" : option.value.toString()}
            value={option.value === null ? "null" : option.value.toString()}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  </Grid>
);

export default FilmSimSettingSelect;
