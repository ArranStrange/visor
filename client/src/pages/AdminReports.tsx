import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link as MuiLink,
  Pagination,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import type { Report, ReportStatus } from "@/types/graphql";
import {
  LIST_REPORTS,
  RESOLVE_REPORT,
  type ListReportsData,
  type ListReportsVariables,
  type ResolveReportData,
  type ResolveReportVariables,
} from "@/features/moderation/graphql/reports";
import {
  REPORT_REASON_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_TARGET_LABELS,
} from "@/features/moderation/reportLabels";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { getErrorMessage } from "@/utils/errorHandling";

const PAGE_SIZE = 20;

const STATUS_TABS: ReportStatus[] = ["OPEN", "ACTIONED", "DISMISSED"];

const formatFiledAt = (isoDate: string): string => {
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? "an unknown time" : date.toLocaleString();
};

/**
 * An external target (an image's own URL) needs a real anchor; an in-app path
 * must stay a client-side route so the moderator does not lose the queue.
 */
const TargetLink: React.FC<{ report: Report }> = ({ report }) => {
  const label = REPORT_TARGET_LABELS[report.targetType];

  if (!report.targetUrl) {
    return (
      <Typography variant="body2" color="text.secondary">
        {label} — no longer exists
      </Typography>
    );
  }

  const isExternal = /^https?:\/\//.test(report.targetUrl);

  return (
    <MuiLink
      component={isExternal ? "a" : RouterLink}
      {...(isExternal
        ? { href: report.targetUrl, target: "_blank", rel: "noopener noreferrer" }
        : { to: report.targetUrl })}
      variant="body2"
      sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}
    >
      View {label.toLowerCase()}
      <OpenInNewIcon sx={{ typography: "body2" }} />
    </MuiLink>
  );
};

const ReportRow: React.FC<{
  report: Report;
  resolving: boolean;
  onResolve: (reportId: string, status: "ACTIONED" | "DISMISSED") => void;
}> = ({ report, resolving, onResolve }) => (
  <Box sx={{ py: 2 }} data-cy="report-row">
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Chip
            size="small"
            label={REPORT_TARGET_LABELS[report.targetType]}
            variant="outlined"
          />
          <Typography variant="subtitle2">
            {REPORT_REASON_LABELS[report.reason]}
          </Typography>
          {report.status !== "OPEN" && (
            <Chip
              size="small"
              color={report.status === "ACTIONED" ? "success" : "default"}
              label={REPORT_STATUS_LABELS[report.status]}
            />
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary" display="block">
          {report.reporter?.username ?? "a deleted account"} ·{" "}
          {formatFiledAt(report.createdAt)}
        </Typography>

        {report.detail && (
          <Typography variant="body2" sx={{ mt: 1, whiteSpace: "pre-wrap" }}>
            {report.detail}
          </Typography>
        )}

        <Box sx={{ mt: 1 }}>
          <TargetLink report={report} />
        </Box>

        {report.resolvedBy && report.resolvedAt && (
          <Typography variant="caption" color="text.secondary" display="block">
            Closed by {report.resolvedBy.username} ·{" "}
            {formatFiledAt(report.resolvedAt)}
          </Typography>
        )}
      </Box>

      {report.status === "OPEN" && (
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <Button
            size="small"
            variant="outlined"
            disabled={resolving}
            onClick={() => onResolve(report.id, "DISMISSED")}
          >
            Dismiss
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={resolving}
            onClick={() => onResolve(report.id, "ACTIONED")}
          >
            Actioned
          </Button>
        </Stack>
      )}
    </Stack>
  </Box>
);

const AdminReports: React.FC = () => {
  const isAdmin = useIsAdmin();
  const [status, setStatus] = useState<ReportStatus>("OPEN");
  const [page, setPage] = useState(1);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<
    ListReportsData,
    ListReportsVariables
  >(LIST_REPORTS, {
    variables: { status, page, limit: PAGE_SIZE },
    // The server rejects a non-admin anyway; skipping keeps the console clean.
    skip: !isAdmin,
    fetchPolicy: "cache-and-network",
  });

  const [resolveReport] = useMutation<
    ResolveReportData,
    ResolveReportVariables
  >(RESOLVE_REPORT);

  const handleResolve = async (
    reportId: string,
    nextStatus: "ACTIONED" | "DISMISSED"
  ) => {
    setResolvingId(reportId);
    setResolveError(null);
    try {
      await resolveReport({ variables: { reportId, status: nextStatus } });
      // The report leaves whichever list is on screen, so refetch rather than
      // patching the cache by hand.
      await refetch();
    } catch (mutationError) {
      setResolveError(getErrorMessage(mutationError));
    } finally {
      setResolvingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">This page is for moderators.</Alert>
      </Container>
    );
  }

  const connection = data?.listReports;
  const reports = connection?.reports ?? [];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Reports
      </Typography>

      <Tabs
        value={status}
        onChange={(_, next: ReportStatus) => {
          setStatus(next);
          setPage(1);
        }}
        sx={{ mb: 2 }}
      >
        {STATUS_TABS.map((value) => (
          <Tab key={value} value={value} label={REPORT_STATUS_LABELS[value]} />
        ))}
      </Tabs>

      {resolveError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {resolveError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading reports: {getErrorMessage(error)}
        </Alert>
      )}

      {loading && reports.length === 0 && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress aria-label="Loading reports" />
        </Box>
      )}

      {!loading && !error && reports.length === 0 && (
        <Alert severity="success">
          {status === "OPEN"
            ? "Nothing in the queue."
            : `No ${REPORT_STATUS_LABELS[status].toLowerCase()} reports.`}
        </Alert>
      )}

      {reports.map((report, index) => (
        <React.Fragment key={report.id}>
          {index > 0 && <Divider />}
          <ReportRow
            report={report}
            resolving={resolvingId === report.id}
            onResolve={handleResolve}
          />
        </React.Fragment>
      ))}

      {connection && connection.totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={connection.totalPages}
            page={connection.currentPage}
            onChange={(_, nextPage) => setPage(nextPage)}
          />
        </Box>
      )}
    </Container>
  );
};

export default AdminReports;
