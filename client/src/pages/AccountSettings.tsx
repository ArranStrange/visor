import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";

import {
  CHANGE_EMAIL,
  CHANGE_PASSWORD,
  DELETE_ACCOUNT,
} from "@/features/auth/graphql/users";
import {
  PASSWORD_HINT,
  validatePassword,
} from "@/features/auth/utils/passwordRules";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "../utils/errorHandling";

/**
 * Every action here is gated on the current password, because each one either
 * changes how you sign in or ends the account.
 */
const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordRuleError, setPasswordRuleError] = useState<string | null>(null);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);

  const [emailForm, setEmailForm] = useState({
    currentPassword: "",
    newEmail: "",
  });
  const [emailFeedback, setEmailFeedback] = useState<{
    severity: "success" | "error";
    message: string;
  } | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [changePassword, { loading: changingPassword }] = useMutation(
    CHANGE_PASSWORD,
    {
      onCompleted: (data) => {
        setPasswordFeedback({
          severity: data.changePassword.success ? "success" : "error",
          message: data.changePassword.message,
        });
        if (data.changePassword.success) {
          setPasswordForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
      },
      onError: (err) =>
        setPasswordFeedback({
          severity: "error",
          message: getErrorMessage(err, "Could not change your password."),
        }),
    }
  );

  const [changeEmail, { loading: changingEmail }] = useMutation(CHANGE_EMAIL, {
    onCompleted: (data) => {
      setEmailFeedback({
        severity: data.changeEmail.success ? "success" : "error",
        message: data.changeEmail.message,
      });
      if (data.changeEmail.success) {
        setEmailForm({ currentPassword: "", newEmail: "" });
      }
    },
    onError: (err) =>
      setEmailFeedback({
        severity: "error",
        message: getErrorMessage(err, "Could not change your email."),
      }),
  });

  const [deleteAccount, { loading: deleting }] = useMutation(DELETE_ACCOUNT, {
    onCompleted: (data) => {
      if (data.deleteAccount.success) {
        // The account is gone, so the stored session is meaningless — drop it
        // before navigating rather than letting requests fail one by one.
        logout();
        navigate("/", { replace: true });
      } else {
        setDeleteError(data.deleteAccount.message);
      }
    },
    onError: (err) =>
      setDeleteError(getErrorMessage(err, "Could not delete your account.")),
  });

  if (!isAuthenticated) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={() => navigate("/login")}>
              Log in
            </Button>
          }
        >
          Log in to manage your account.
        </Alert>
      </Container>
    );
  }

  const handlePasswordSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordFeedback(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({
        severity: "error",
        message: "New passwords do not match",
      });
      return;
    }

    const problem = validatePassword(passwordForm.newPassword);
    setPasswordRuleError(problem);
    if (problem) return;

    changePassword({
      variables: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    });
  };

  const handleEmailSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setEmailFeedback(null);
    changeEmail({ variables: emailForm });
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={4}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Account
          </Typography>
          <Typography color="text.secondary">
            Signed in as {user?.username}
            {user?.email ? ` (${user.email})` : ""}.
          </Typography>
        </Stack>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  Change password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Changing your password signs you out on every other device.
                </Typography>

                {passwordFeedback && (
                  <Alert severity={passwordFeedback.severity}>
                    {passwordFeedback.message}
                  </Alert>
                )}

                <TextField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: event.target.value,
                    })
                  }
                  disabled={changingPassword}
                />

                <Box>
                  <TextField
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    required
                    fullWidth
                    value={passwordForm.newPassword}
                    onChange={(event) => {
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: event.target.value,
                      });
                      setPasswordRuleError(validatePassword(event.target.value));
                    }}
                    disabled={changingPassword}
                    error={!!passwordRuleError}
                  />
                  {passwordRuleError ? (
                    <FormHelperText error>{passwordRuleError}</FormHelperText>
                  ) : (
                    <FormHelperText>{PASSWORD_HINT}</FormHelperText>
                  )}
                </Box>

                <TextField
                  label="Confirm new password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: event.target.value,
                    })
                  }
                  disabled={changingPassword}
                />

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={changingPassword}
                  >
                    {changingPassword ? (
                      <CircularProgress size={22} />
                    ) : (
                      "Update password"
                    )}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Box component="form" onSubmit={handleEmailSubmit} noValidate>
              <Stack spacing={2}>
                <Typography variant="h6" component="h2">
                  Change email
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We'll send a verification link to the new address. You'll need
                  to click it before you can log in again.
                </Typography>

                {emailFeedback && (
                  <Alert severity={emailFeedback.severity}>
                    {emailFeedback.message}
                  </Alert>
                )}

                <TextField
                  label="New email"
                  type="email"
                  autoComplete="email"
                  required
                  value={emailForm.newEmail}
                  onChange={(event) =>
                    setEmailForm({ ...emailForm, newEmail: event.target.value })
                  }
                  disabled={changingEmail}
                />

                <TextField
                  label="Current password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={emailForm.currentPassword}
                  onChange={(event) =>
                    setEmailForm({
                      ...emailForm,
                      currentPassword: event.target.value,
                    })
                  }
                  disabled={changingEmail}
                />

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={changingEmail}
                  >
                    {changingEmail ? (
                      <CircularProgress size={22} />
                    ) : (
                      "Update email"
                    )}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Divider />

        <Card variant="outlined" sx={{ borderColor: "error.main" }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" component="h2" color="error.main">
                Delete account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Removes your email address, profile details and private camera
                loadouts. Recipes, presets and posts you shared stay on VISOR,
                no longer linked to you — otherwise discussions other people
                took part in would break. This cannot be undone.
              </Typography>
              <Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setDeleteError(null);
                    setDeletePassword("");
                    setDeleteOpen(true);
                  }}
                >
                  Delete my account
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog
        open={deleteOpen}
        onClose={() => (deleting ? undefined : setDeleteOpen(false))}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete your account?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <DialogContentText>
              Enter your password to confirm. This cannot be undone.
            </DialogContentText>
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              autoFocus
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              disabled={deleting}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
            Keep my account
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting || deletePassword.length === 0}
            onClick={() =>
              deleteAccount({ variables: { currentPassword: deletePassword } })
            }
          >
            {deleting ? <CircularProgress size={22} /> : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AccountSettings;
