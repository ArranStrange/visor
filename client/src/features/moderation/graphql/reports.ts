import { gql } from "@apollo/client";
import type {
  PaginatedReports,
  Report,
  ReportReason,
  ReportStatus,
  ReportTargetType,
} from "@/types/graphql";

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
  ${REPORT_FIELDS}
  query ListReports($status: ReportStatus, $page: Int, $limit: Int) {
    listReports(status: $status, page: $page, limit: $limit) {
      reports {
        ...ReportFields
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
  ${REPORT_FIELDS}
  mutation ResolveReport($reportId: ID!, $status: ReportStatus!) {
    resolveReport(reportId: $reportId, status: $status) {
      ...ReportFields
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
