const assert = require("node:assert/strict");
const test = require("node:test");

const typeDefs = require("../report");
const discussionTypeDefs = require("../discussion");
const Report = require("../../../models/Report");

// Walks the gql AST rather than asserting on the source string, matching
// account-safety-contract.test.js and preset-inputs.test.js. There is no
// codegen, so nothing else checks that the schema, the model enums and the
// client's hand-written types still agree.

const definitions = typeDefs.definitions;

const typeByName = (kind, name) =>
  definitions.find((def) => def.kind === kind && def.name.value === name);

const extensionFields = (name) =>
  definitions
    .filter(
      (def) => def.kind === "ObjectTypeExtension" && def.name.value === name
    )
    .flatMap((def) => def.fields);

const enumValues = (name) =>
  typeByName("EnumTypeDefinition", name).values.map((value) => value.name.value);

const isNonNull = (typeNode) => typeNode.kind === "NonNullType";

const namedType = (typeNode) => {
  let node = typeNode;
  while (node.kind === "NonNullType" || node.kind === "ListType") {
    node = node.type;
  }
  return node.name.value;
};

const fieldMap = (fields) =>
  Object.fromEntries(fields.map((field) => [field.name.value, field]));

const argMap = (field) =>
  Object.fromEntries(field.arguments.map((arg) => [arg.name.value, arg]));

test("the three moderation enums match the model's enums exactly", () => {
  // A value in one and not the other is a runtime failure nothing else catches:
  // GraphQL accepts the input and Mongoose then rejects the document.
  assert.deepEqual(enumValues("ReportTargetType"), Report.TARGET_TYPES);
  assert.deepEqual(enumValues("ReportReason"), Report.REASONS);
  assert.deepEqual(enumValues("ReportStatus"), Report.STATUSES);
});

test("Report exposes the queue fields a moderator needs", () => {
  const fields = fieldMap(typeByName("ObjectTypeDefinition", "Report").fields);

  for (const name of ["id", "targetType", "targetId", "reason", "status"]) {
    assert.ok(isNonNull(fields[name].type), `${name} is non-null`);
  }
  // Nullable on purpose: the reporter's account may since have been deleted,
  // and an unresolved report has no resolver.
  for (const name of ["reporter", "resolvedBy", "resolvedAt", "detail"]) {
    assert.equal(isNonNull(fields[name].type), false, `${name} is nullable`);
  }
  assert.equal(namedType(fields.reporter.type), "User");
  assert.equal(namedType(fields.resolvedBy.type), "User");
});

test("reportContent takes a typed target, a typed reason and free-text detail", () => {
  const field = fieldMap(extensionFields("Mutation")).reportContent;
  assert.ok(field, "reportContent is declared");

  const args = argMap(field);
  assert.deepEqual(Object.keys(args).sort(), [
    "detail",
    "reason",
    "targetId",
    "targetType",
  ]);

  // Typed inputs, not a JSON blob: the client cannot invent a target type or
  // a reason the queue does not understand.
  assert.equal(namedType(args.targetType.type), "ReportTargetType");
  assert.equal(namedType(args.reason.type), "ReportReason");
  assert.ok(isNonNull(args.targetType.type));
  assert.ok(isNonNull(args.targetId.type));
  assert.ok(isNonNull(args.reason.type));
  assert.equal(isNonNull(args.detail.type), false, "detail stays optional");

  assert.ok(isNonNull(field.type));
  assert.equal(namedType(field.type), "Report");
});

test("resolveReport takes the report and its new status", () => {
  const field = fieldMap(extensionFields("Mutation")).resolveReport;
  const args = argMap(field);

  assert.deepEqual(Object.keys(args).sort(), ["reportId", "status"]);
  assert.equal(namedType(args.status.type), "ReportStatus");
  assert.ok(isNonNull(args.status.type));
  assert.equal(namedType(field.type), "Report");
});

test("listReports is paginated and filterable by status", () => {
  const field = fieldMap(extensionFields("Query")).listReports;
  const args = argMap(field);

  assert.deepEqual(Object.keys(args).sort(), ["limit", "page", "status"]);
  assert.equal(namedType(args.status.type), "ReportStatus");
  // Optional: no status means the open queue.
  assert.equal(isNonNull(args.status.type), false);
  assert.equal(namedType(field.type), "PaginatedReports");
  assert.ok(isNonNull(field.type));
});

test("PaginatedReports carries the same envelope as the other paged lists", () => {
  const fields = fieldMap(
    typeByName("ObjectTypeDefinition", "PaginatedReports").fields
  );

  for (const name of [
    "reports",
    "totalCount",
    "hasNextPage",
    "hasPreviousPage",
    "currentPage",
    "totalPages",
  ]) {
    assert.ok(isNonNull(fields[name].type), `${name} is non-null`);
  }
  assert.equal(namedType(fields.reports.type), "Report");
});

test("DiscussionPost exposes the id a DISCUSSION_POST report points at", () => {
  const fields = fieldMap(
    discussionTypeDefs.definitions.find(
      (def) =>
        def.kind === "ObjectTypeDefinition" &&
        def.name.value === "DiscussionPost"
    ).fields
  );

  assert.ok(fields.id, "DiscussionPost declares an id");
  assert.ok(isNonNull(fields.id.type));
  assert.equal(namedType(fields.id.type), "ID");
});
