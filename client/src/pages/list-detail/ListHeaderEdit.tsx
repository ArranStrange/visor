import React from "react";
import { Box, TextField, Button } from "@mui/material";

interface ListHeaderEditProps {
  name: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancel: () => void;
  onSave: () => void;
}

const ListHeaderEdit: React.FC<ListHeaderEditProps> = ({
  name,
  onNameChange,
  onCancel,
  onSave,
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Box display="flex" alignItems="center" gap={2} flex={1}>
        <TextField
          fullWidth
          name="name"
          value={name}
          onChange={onNameChange}
          variant="standard"
          sx={{
            "& .MuiInputBase-root": {
              fontSize: "2rem",
              fontWeight: "bold",
            },
          }}
        />
      </Box>
      <Box>
        <Button variant="outlined" onClick={onCancel} sx={{ mr: 2 }}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onSave} disabled={!name.trim()}>
          Save Changes
        </Button>
      </Box>
    </Box>
  );
};

export default ListHeaderEdit;
