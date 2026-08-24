import React from "react";
import { Stack, TextField, FormControlLabel, Switch, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

interface ListEditFieldsProps {
  description: string;
  isPublic: boolean;
  onDescriptionChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIsPublicChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteClick: () => void;
}

const ListEditFields: React.FC<ListEditFieldsProps> = ({
  description,
  isPublic,
  onDescriptionChange,
  onIsPublicChange,
  onDeleteClick,
}) => {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        multiline
        rows={3}
        name="description"
        value={description}
        onChange={onDescriptionChange}
        label="Description"
        placeholder="Describe your list..."
      />
      <FormControlLabel
        control={
          <Switch checked={isPublic} onChange={onIsPublicChange} name="isPublic" />
        }
        label="Public List"
      />
      <Button
        variant="outlined"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDeleteClick}
      >
        Delete List
      </Button>
    </Stack>
  );
};

export default ListEditFields;
