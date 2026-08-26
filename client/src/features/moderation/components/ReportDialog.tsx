import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import type { ReportReason, ReportTargetType } from "@/types/graphql";
import {
  REPORT_CONTENT,
  type ReportContentData,
  type ReportContentVariables,
} from "@/features/moderation/graphql/reports";
import {
  REPORT_DETAIL_MAX_LENGTH,
  REPORT_REASON_OPTIONS,
} from "@/features/moderation/reportLabels";
import { getErrorMessage } from "@/utils/errorHandling";

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  /** What is being reported, shown so nobody reports the wrong thing. */
  targetName?: string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  open,
  onClose,
  targetType,
  targetId,
  targetName,
}) => {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [detail, setDetail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [reportContent, { loading, error }] = useMutation<
    ReportContentData,
    ReportContentVariables
  >(REPORT_CONTENT);

  // "Something else" carries no information on its own, so it is the one
  // reason where a moderator cannot act without the detail.
  const detailRequired = reason === "OTHER";
  const detailTooLong = detail.length > REPORT_DETAIL_MAX_LENGTH;
  const canSubmit =
    !!reason &&
    !loading &&
    !detailTooLong &&
    (!detailRequired || detail.trim().length > 0);

  const handleClose = () => {
    onClose();
    // Reset after closing so the form does not visibly empty itself first.
    setReason("");
    setDetail("");
    setSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!reason) return;

    try {
      await reportContent({
        variables: {
          targetType,
          targetId,
          reason,
          detail: detail.trim() || null,
        },
      });
      setSubmitted(true);
    } catch {
      // Rendered from the mutation's error below; nothing to do here.
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="report-dialog-title"
    >
      <DialogTitle id="report-dialog-title">Report this content</DialogTitle>

      {submitted ? (
        <>
          <DialogContent>
            <Alert severity="success">
              Thanks — a moderator will take a look. You will not hear back
              about every report, but each one is read.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="contained">
              Done
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              {targetName
                ? `Tell us what is wrong with "${targetName}".`
                : "Tell us what is wrong with this content."}
            </DialogContentText>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                aria-label="Reason for reporting"
                value={reason}
                onChange={(event) =>
                  setReason(event.target.value as ReportReason)
                }
              >
                {REPORT_REASON_OPTIONS.map((option) => (
                  <React.Fragment key={option.value}>
                    <FormControlLabel
                      value={option.value}
                      control={<Radio size="small" />}
                      label={option.label}
                    />
                    {option.helper && reason === option.value && (
                      <FormHelperText sx={{ ml: 4, mt: -0.5, mb: 0.5 }}>
                        {option.helper}
                      </FormHelperText>
                    )}
                  </React.Fragment>
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              label={detailRequired ? "What is wrong?" : "Anything to add?"}
              placeholder="Optional context for the moderator"
              value={detail}
              onChange={(event) => setDetail(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              required={detailRequired}
              error={detailTooLong}
              helperText={
                detailTooLong
                  ? `Please keep this under ${REPORT_DETAIL_MAX_LENGTH} characters.`
                  : `${detail.length}/${REPORT_DETAIL_MAX_LENGTH}`
              }
              sx={{ mt: 2 }}
              inputProps={{ "aria-label": "Report details" }}
            />

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {getErrorMessage(error)}
              </Alert>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 2 }}
            >
              Reports are only visible to moderators.
            </Typography>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="error"
              disabled={!canSubmit}
            >
              {loading ? "Sending..." : "Send report"}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default ReportDialog;
