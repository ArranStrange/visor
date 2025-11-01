import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteFilmSimDialogProps {
  open: boolean;
  filmSimName: string;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteFilmSimDialog: React.FC<DeleteFilmSimDialogProps> = ({
  open,
  filmSimName,
  deleting,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      data-cy="film-sim-delete-dialog"
    >
      <DialogTitle id="delete-dialog-title">Delete Film Simulation</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete "{filmSimName}"? This action cannot be
          undone and will permanently remove the film simulation and all
          associated images from the database.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          data-cy="film-sim-delete-confirm-button"
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteFilmSimDialog;
