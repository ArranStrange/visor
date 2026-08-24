import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { DiscussionLinkedType } from "./discussionTypeLabels";

interface DiscussionTypeSelectProps {
  value: DiscussionLinkedType;
  onChange: (value: DiscussionLinkedType) => void;
}

const DiscussionTypeSelect: React.FC<DiscussionTypeSelectProps> = ({
  value,
  onChange,
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 3 }}>
      <InputLabel>Discussion Type</InputLabel>
      <Select value={value} onChange={handleChange} label="Discussion Type">
        <MenuItem value="PRESET">Preset</MenuItem>
        <MenuItem value="FILMSIM">Film Simulation</MenuItem>
        <MenuItem value="TECHNIQUE">Technique</MenuItem>
        <MenuItem value="EQUIPMENT">Equipment</MenuItem>
        <MenuItem value="LOCATION">Location</MenuItem>
        <MenuItem value="TUTORIAL">Tutorial</MenuItem>
        <MenuItem value="REVIEW">Review</MenuItem>
        <MenuItem value="CHALLENGE">Challenge</MenuItem>
        <MenuItem value="WORKFLOW">Workflow</MenuItem>
        <MenuItem value="INSPIRATION">Inspiration</MenuItem>
        <MenuItem value="CRITIQUE">Critique</MenuItem>
        <MenuItem value="NEWS">News</MenuItem>
        <MenuItem value="EVENT">Event</MenuItem>
        <MenuItem value="GENERAL">General</MenuItem>
      </Select>
    </FormControl>
  );

  function handleChange(e: SelectChangeEvent) {
    onChange(e.target.value as DiscussionLinkedType);
  }
};

export default DiscussionTypeSelect;
