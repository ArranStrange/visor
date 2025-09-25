import { Alert, AlertProps } from "@mui/material";

interface StatusMessageProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onClose?: () => void;
  sx?: AlertProps["sx"];
}

const StatusMessage: React.FC<StatusMessageProps> = ({
  type,
  message,
  onClose,
  sx = { mt: 2 },
}) => {
  if (!message) return null;

  return (
    <Alert severity={type} onClose={onClose} sx={sx}>
      {message}
    </Alert>
  );
};

export default StatusMessage;
