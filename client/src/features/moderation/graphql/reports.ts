import { gql } from "@apollo/client";
import type {
  PaginatedReports,
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/types/graphql";

// Everything any caller may read. Deliberately excludes targetUrl: that field
// is admin-only on the server, and reportContent returns a Report to the
// person who filed it — selecting it there would fail the whole mutation.
const REPORT_FIELDS = gql`
  fragment ReportFields on Report {
    id
    targetType
    targetId
    reason
    detail
    status
    createdAt
    resolvedAt
    reporter {
      id
      username
      avatar
    }
    resolvedBy {
      id
      username
    }
  }
`;

// The moderation queue's view, for admin-only operations.
const MODERATION_REPORT_FIELDS = gql`
  ${REPORT_FIELDS}
  fragment ModerationReportFields on Report {
    ...ReportFields
    targetUrl
  }
`;

export const REPORT_CONTENT = gql`
  ${REPORT_FIELDS}
  mutation ReportContent(
    $targetType: ReportTargetType!
    $targetId: ID!
    $reason: ReportReason!
    $detail: String
  ) {
    reportContent(
      targetType: $targetType
      targetId: $targetId
      reason: $reason
      detail: $detail
    ) {
      ...ReportFields
    }
  }
`;

export const LIST_REPORTS = gql`
  ${MODERATION_REPORT_FIELDS}
  query ListReports($status: ReportStatus, $page: Int, $limit: Int) {
    listReports(status: $status, page: $page, limit: $limit) {
      reports {
        ...ModerationReportFields
      }
      totalCount
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
`;

export const RESOLVE_REPORT = gql`
  ${MODERATION_REPORT_FIELDS}
  mutation ResolveReport($reportId: ID!, $status: ReportStatus!) {
    resolveReport(reportId: $reportId, status: $status) {
      ...ModerationReportFields
    }
  }
`;

export interface ReportContentVariables {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail?: string | null;
}

export interface ReportContentData {
  reportContent: Report;
}

export interface ListReportsVariables {
  status?: ReportStatus;
  page?: number;
  limit?: number;
}

export interface ListReportsData {
  listReports: PaginatedReports;
}

export interface ResolveReportVariables {
  reportId: string;
  status: Exclude<ReportStatus, "OPEN">;
}

export interface ResolveReportData {
  resolveReport: Report;
}
