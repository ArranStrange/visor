import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import type { LoadoutSlot } from "@/features/loadouts/types/loadouts";
import { buildDialInSteps } from "@/features/loadouts/utils/dialIn";

interface DialInModeProps {
  open: boolean;
  slot: LoadoutSlot | null;
  cameraKey: string;
  cameraName: string;
  /** The next filled bank after this one, or null if this is the last. */
  nextSlotIndex: number | null;
  onClose: () => void;
  onNextSlot: (index: number) => void;
  onMarkKeyedIn: () => void;
}

// The dial-in player. One setting per screen at desk-propped size, menu
// path underneath, thumb-sized advance. All sequencing decisions live in
// buildDialInSteps — this component only plays the plan.
const DialInMode: React.FC<DialInModeProps> = ({
  open,
  slot,
  cameraKey,
  cameraName,
  nextSlotIndex,
  onClose,
  onNextSlot,
  onMarkKeyedIn,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [stepIndex, setStepIndex] = useState(0);
  const [confirmingExit, setConfirmingExit] = useState(false);

  const plan = useMemo(() => {
    if (!slot?.filmSim?.settings) return null;
    return buildDialInSteps(slot.filmSim.settings, cameraKey, slot.index + 1);
  }, [slot, cameraKey]);

  // Restart at step 1 whenever a different slot enters the player or the
  // dialog reopens. Reset synchronously during render — an effect resets a
  // frame late, flashing the previous slot's done screen when chaining.
  const playKey = open ? `${slot?.index}-${slot?.filmSim?.id}` : null;
  const [lastPlayKey, setLastPlayKey] = useState(playKey);
  if (playKey !== lastPlayKey) {
    setLastPlayKey(playKey);
    setStepIndex(0);
    setConfirmingExit(false);
  }

  // Keep the screen awake while the phone is propped next to the camera.
  // Progressive enhancement: re-acquire on visibility change, ignore
  // rejection (browser support / low battery).
  useEffect(() => {
    if (!open || !("wakeLock" in navigator)) return;
    type WakeLockLike = { release: () => Promise<void> };
    let lock: WakeLockLike | null = null;
    // Guards the acquire/close race: if the dialog closes while request()
    // is in flight, the late-resolving lock must be released immediately
    // or the screen stays awake until the tab changes visibility.
    let cancelled = false;
    const acquire = async () => {
      try {
        const acquired = await (
          navigator as Navigator & {
            wakeLock: { request: (t: "screen") => Promise<WakeLockLike> };
          }
        ).wakeLock.request("screen");
        if (cancelled) {
          acquired.release().catch(() => {});
        } else {
          lock = acquired;
        }
      } catch {
        /* unsupported or denied — fine */
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };
    acquire();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => {});
    };
  }, [open]);

  const steps = plan?.steps ?? [];
  const total = steps.length;
  const done = stepIndex >= total;
  const step = done ? null : steps[stepIndex];

  const advance = () => {
    if (!done) setStepIndex((i) => i + 1);
  };
  const retreat = () => {
    // Back retreats a step; it never exits. Exit is the X / Escape only.
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const requestClose = () => setConfirmingExit(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // On the confirm and done screens, buttons own the keyboard — a
    // dialog-level preventDefault would swallow Enter on the focused
    // "Next: C5" / "Mark as keyed in" button and dead-end the flow.
    if (confirmingExit || done) return;
    // Likewise mid-flow: Enter on a focused control (the X button)
    // activates that control, not the step advance.
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.closest("button, a, [role='button']")) {
      return;
    }
    if (e.key === "ArrowRight" || e.key === "Enter") {
      e.preventDefault();
      advance();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      retreat();
    }
  };

  // aria-live region content: announced on every step change.
  const liveText = step
    ? `Step ${stepIndex + 1} of ${total}: ${step.label}, ${step.value}`
    : done
      ? "Bank complete"
      : "";

  if (!slot || !plan) return null;

  const bank = `C${slot.index + 1}`;

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      onClose={(_, reason) => {
        // Escape / backdrop become a confirm, not a silent exit — a
        // chained session is ~100 keystrokes of progress. A second Escape
        // on the confirm screen backs out to "keep going" (the safe
        // default), matching Back-never-exits.
        if (reason === "escapeKeyDown" || reason === "backdropClick") {
          if (confirmingExit) {
            setConfirmingExit(false);
          } else {
            requestClose();
          }
        }
      }}
      onKeyDown={handleKeyDown}
      slotProps={{ paper: { sx: { minHeight: fullScreen ? undefined : 520 } } }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: "inherit",
          p: { xs: 2, md: 3 },
          gap: 2,
        }}
      >
        {/* header */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.08em",
              color: "text.secondary",
            }}
          >
            {bank} · {slot.filmSim?.name?.toUpperCase()}
          </Typography>
          <IconButton onClick={requestClose} aria-label="Exit dial-in" size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* progress */}
        {!done && (
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="baseline" mb={0.5}>
              <Typography
                variant="caption"
                sx={{ fontVariantNumeric: "tabular-nums", color: "text.secondary" }}
              >
                {stepIndex + 1} / {total}
              </Typography>
            </Box>
            {/* Decorative — the numeric counter + live region carry the
                progress for assistive tech. */}
            <Box display="flex" gap={0.4} aria-hidden="true">
              {steps.map((s, i) => (
                <Box
                  key={`${s.key}-${i}`}
                  sx={{
                    height: 3,
                    flex: 1,
                    borderRadius: 1,
                    backgroundColor:
                      i < stepIndex
                        ? "secondary.main"
                        : i === stepIndex
                          ? "text.primary"
                          : "surface.outline",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* screen-reader step announcements */}
        <Box aria-live="polite" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {liveText}
        </Box>

        {confirmingExit ? (
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2} textAlign="center">
            <Typography variant="h3">Exit dial-in?</Typography>
            <Typography variant="body2" color="text.secondary">
              Progress isn't saved — you'll start {bank} from the top next time.
            </Typography>
            <Box display="flex" gap={1.5} mt={1}>
              <Button
                onClick={() => setConfirmingExit(false)}
                variant="contained"
                autoFocus
              >
                Keep going
              </Button>
              <Button onClick={onClose} color="error">
                Exit
              </Button>
            </Box>
          </Box>
        ) : done ? (
          /* done screen — explicit chaining, never auto-advance: the user
             has to back out and select the next bank on-camera first. */
          <Box flex={1} display="flex" flexDirection="column" justifyContent="center" alignItems="center" gap={2} textAlign="center">
            <CheckIcon sx={{ fontSize: 48, color: "success.main" }} />
            <Typography variant="h2">{bank} done</Typography>
            <Typography variant="body2" color="text.secondary" maxWidth="36ch">
              Back out of the bank menu on the camera
              {nextSlotIndex !== null
                ? `, then select C${nextSlotIndex + 1} and carry on.`
                : " — that was the last filled bank."}
            </Typography>
            {plan.skipped.length > 0 && (
              <Typography variant="caption" color="text.disabled" maxWidth="38ch">
                Reminder: {plan.skipped.map((s) => s.label).join(", ")}{" "}
                {plan.skipped.length > 1 ? "were" : "was"} omitted — {cameraName}{" "}
                doesn't have {plan.skipped.length > 1 ? "them" : "it"}.
              </Typography>
            )}
            <Box display="flex" flexDirection="column" gap={1.5} mt={1} width="100%" maxWidth={320}>
              {nextSlotIndex !== null ? (
                <Button
                  variant="contained"
                  size="large"
                  autoFocus
                  onClick={() => onNextSlot(nextSlotIndex)}
                >
                  Next: C{nextSlotIndex + 1}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  autoFocus
                  startIcon={<CheckIcon />}
                  onClick={() => {
                    onMarkKeyedIn();
                    onClose();
                  }}
                >
                  Mark loadout as keyed in
                </Button>
              )}
              <Button onClick={onClose}>Back to wallet</Button>
            </Box>
          </Box>
        ) : (
          step && (
            <>
              {/* the step itself */}
              <Box
                flex={1}
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                gap={1}
                px={2}
              >
                {plan.caveat && stepIndex === 0 && (
                  <Alert severity="warning" sx={{ mb: 2, textAlign: "left" }}>
                    {plan.caveat}
                  </Alert>
                )}
                {plan.skipped.length > 0 && stepIndex === 0 && (
                  <Typography variant="caption" color="text.secondary" mb={1}>
                    {plan.skipped.length} setting
                    {plan.skipped.length > 1 ? "s" : ""} omitted —{" "}
                    {cameraName} doesn't have{" "}
                    {plan.skipped.map((s) => s.label).join(", ")}.
                  </Typography>
                )}

                <Typography variant="h3" color="text.secondary">
                  {step.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 600,
                    fontSize: "clamp(2.6rem, 11vw, 4rem)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step.value}
                </Typography>
                {step.path ? (
                  <Typography
                    sx={{
                      fontFamily: "monospace",
                      fontSize: "0.7rem",
                      letterSpacing: "0.08em",
                      color: "text.disabled",
                      mt: 1,
                    }}
                  >
                    {step.path.join(" › ")}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.disabled" mt={1}>
                    Menu path not verified for this body — find "{step.label}"
                    in the bank's settings.
                  </Typography>
                )}
                {step.hint && (
                  <Typography variant="caption" color="text.secondary" maxWidth="38ch" mt={1}>
                    {step.hint}
                  </Typography>
                )}
                {step.warning && (
                  <Alert severity="warning" sx={{ mt: 1.5, textAlign: "left" }}>
                    {step.warning}
                  </Alert>
                )}
              </Box>

              {/* controls */}
              <Box display="flex" gap={1.5}>
                <Button
                  onClick={retreat}
                  disabled={stepIndex === 0}
                  startIcon={<ArrowBackIcon />}
                  sx={{ flexBasis: 110 }}
                >
                  Back
                </Button>
                <Button variant="contained" size="large" fullWidth onClick={advance}>
                  {stepIndex === total - 1 ? "Done" : "Set — next"}
                </Button>
              </Box>
            </>
          )
        )}
      </Box>
    </Dialog>
  );
};

export default DialInMode;
