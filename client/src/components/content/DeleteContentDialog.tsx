import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface DeleteContentDialogProps {
  open: boolean;
  title: string;
  description: React.ReactNode;
  deleting?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dialogTestId?: string;
  confirmTestId?: string;
}

const DeleteContentDialog: React.FC<DeleteContentDialogProps> = ({
  open,
  title,
  description,
  deleting = false,
  onClose,
  onConfirm,
  dialogTestId,
  confirmTestId,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      data-cy={dialogTestId}
    >
      <DialogTitle id="delete-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          data-cy={confirmTestId}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteContentDialog;
