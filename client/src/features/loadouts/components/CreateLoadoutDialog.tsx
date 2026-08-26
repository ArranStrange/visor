import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Autocomplete,
  Typography,
} from "@mui/material";
import {
  LOADOUT_CAPABLE_CAMERAS,
  findCamera,
} from "@/constants/fujifilmCameras";

interface CreateLoadoutDialogProps {
  open: boolean;
  defaultCamera?: string;
  onClose: () => void;
  onCreate: (input: { name: string; camera: string }) => void;
}

const CreateLoadoutDialog: React.FC<CreateLoadoutDialogProps> = ({
  open,
  defaultCamera,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [camera, setCamera] = useState<string | null>(defaultCamera ?? null);

  const entry = camera ? findCamera(camera) : undefined;

  const handleCreate = () => {
    if (!name.trim() || !camera) return;
    onCreate({ name: name.trim(), camera });
    setName("");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>New loadout</DialogTitle>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1.5 }}
      >
        <TextField
          label="Name"
          placeholder="Lisbon, May"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          fullWidth
        />
        <Autocomplete
          options={LOADOUT_CAPABLE_CAMERAS.map((c) => c.name)}
          value={camera}
          onChange={(_, value) => setCamera(value)}
          renderInput={(params) => <TextField {...params} label="Camera" />}
        />
        {entry && (
          <Typography variant="caption" color="text.secondary">
            {entry.name} · C1–C{entry.customBanks}
            {!entry.banksVerified && " (assuming — unverified against the manual)"}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!name.trim() || !camera}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateLoadoutDialog;
