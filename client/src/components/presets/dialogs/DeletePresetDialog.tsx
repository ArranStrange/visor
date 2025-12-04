import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  PresetDeleteRequested,
  PresetDeleteConfirmed,
  DialogClose,
} from "lib/events/event-definitions";

interface DeletePresetDialogProps {
  open?: boolean;
  presetTitle?: string;
  deleting?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

const DeletePresetDialog: React.FC<DeletePresetDialogProps> = ({
  open: openProp,
  presetTitle: presetTitleProp,
  deleting: deletingProp,
  onClose: onCloseProp,
  onConfirm: onConfirmProp,
}) => {
  const [open, setOpen] = useState(openProp || false);
  const [presetTitle, setPresetTitle] = useState(presetTitleProp || "");
  const [deleting, setDeleting] = useState(deletingProp || false);
  const [presetId, setPresetId] = useState<string | null>(null);

  // Listen to PresetDeleteRequested event
  PresetDeleteRequested.useEvent(
    (data) => {
      if (data?.preset) {
        setPresetTitle(data.preset.title || "");
        setPresetId(data.presetId || data.preset?.id || null);
        setDeleting(false);
        setOpen(true);
      }
    },
    []
  );

  // Listen to DialogClose event
  DialogClose.useEvent(
    (data) => {
      if (data?.dialogId === "delete-preset" || !data?.dialogId) {
        setOpen(false);
        if (onCloseProp) onCloseProp();
      }
    },
    [onCloseProp]
  );

  // Sync with props if provided (backward compatibility)
  useEffect(() => {
    if (openProp !== undefined) setOpen(openProp);
  }, [openProp]);

  useEffect(() => {
    if (presetTitleProp) setPresetTitle(presetTitleProp);
  }, [presetTitleProp]);

  useEffect(() => {
    if (deletingProp !== undefined) setDeleting(deletingProp);
  }, [deletingProp]);

  const handleClose = () => {
    setOpen(false);
    DialogClose.raise({ dialogId: "delete-preset" });
    if (onCloseProp) onCloseProp();
  };

  const handleConfirm = () => {
    if (presetId) {
      PresetDeleteConfirmed.raise({ presetId });
      setDeleting(true);
    }
    if (onConfirmProp) onConfirmProp();
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Delete Preset</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete "{presetTitle}"? This action cannot be
          undone and will permanently remove the preset and all associated
          images from the database.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeletePresetDialog;
