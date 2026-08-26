const { gql } = require("apollo-server-express");

const reportTypeDefs = gql`
  "The reportable surfaces. A discussion post is identified by its subdocument id."
  enum ReportTargetType {
    PRESET
    FILMSIM
    IMAGE
    DISCUSSION_POST
  }

  """
  Why the content was reported. A closed set, so the queue can be triaged
  without reading free text — OTHER exists for everything else and is the only
  reason where the detail field really matters.
  """
  enum ReportReason {
    SPAM
    STOLEN_CONTENT
    INAPPROPRIATE
    ABUSE
    OTHER
  }

  enum ReportStatus {
    OPEN
    ACTIONED
    DISMISSED
  }

  type Report {
    id: ID!
    "Null once the reporter's account has been deleted."
    reporter: User
    targetType: ReportTargetType!
    targetId: ID!
    reason: ReportReason!
    detail: String
    status: ReportStatus!
    resolvedBy: User
    resolvedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type PaginatedReports {
    reports: [Report!]!
    totalCount: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    currentPage: Int!
    totalPages: Int!
  }

  extend type Query {
    "Admin only. Defaults to the open queue, newest first."
    listReports(status: ReportStatus, page: Int, limit: Int): PaginatedReports!
  }

  extend type Mutation {
    """
    Files a report against a piece of content. Rate limited per reporter so one
    account cannot flood the queue. Filing the same open report twice returns
    the existing report rather than erroring.
    """
    reportContent(
      targetType: ReportTargetType!
      targetId: ID!
      reason: ReportReason!
      detail: String
    ): Report!

    "Admin only. Closes a report as ACTIONED or DISMISSED."
    resolveReport(reportId: ID!, status: ReportStatus!): Report!
  }
`;

module.exports = reportTypeDefs;
