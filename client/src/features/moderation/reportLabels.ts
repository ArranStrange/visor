import type {
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/types/graphql";

/**
 * The reason a reporter picks, in the words they would use. The enum values
 * are the server's; these are the only place they are spelled for people.
 */
export const REPORT_REASON_OPTIONS: {
  value: ReportReason;
  label: string;
  helper?: string;
}[] = [
  { value: "SPAM", label: "Spam or advertising" },
  {
    value: "STOLEN_CONTENT",
    label: "Not the uploader's work",
    helper: "Someone else's recipe or photo, posted without credit.",
  },
  { value: "INAPPROPRIATE", label: "Inappropriate content" },
  { value: "ABUSE", label: "Abuse or harassment" },
  {
    value: "OTHER",
    label: "Something else",
    helper: "Tell us what is wrong so a moderator can act on it.",
  },
];

export const REPORT_REASON_LABELS: Record<ReportReason, string> =
  REPORT_REASON_OPTIONS.reduce(
    (labels, option) => ({ ...labels, [option.value]: option.label }),
    {} as Record<ReportReason, string>
  );

export const REPORT_TARGET_LABELS: Record<ReportTargetType, string> = {
  PRESET: "Preset",
  FILMSIM: "Film sim",
  IMAGE: "Photo",
  DISCUSSION_POST: "Discussion post",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  ACTIONED: "Actioned",
  DISMISSED: "Dismissed",
};

/** Mirrors Report.DETAIL_MAX_LENGTH in server/models/Report.js. */
export const REPORT_DETAIL_MAX_LENGTH = 1000;
