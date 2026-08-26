const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const Report = require("../Report");

// Schema-level checks only: no connection is needed for validateSync or for
// reading the declared indexes. The integration test covers what Mongo itself
// enforces (the partial unique index).

const validReport = (overrides = {}) =>
  new Report({
    reporter: new mongoose.Types.ObjectId(),
    targetType: "PRESET",
    targetId: new mongoose.Types.ObjectId(),
    reason: "SPAM",
    ...overrides,
  });

test("a minimal report validates and opens in the queue", () => {
  const report = validReport();

  assert.equal(report.validateSync(), undefined);
  assert.equal(report.status, "OPEN");
  assert.equal(report.resolvedBy, null);
  assert.equal(report.resolvedAt, null);
});

test("reporter, targetType, targetId and reason are all required", () => {
  const errors = new Report({}).validateSync().errors;

  for (const field of ["reporter", "targetType", "targetId", "reason"]) {
    assert.ok(errors[field], `${field} is required`);
  }
});

test("targetType is closed to the four reportable surfaces", () => {
  assert.deepEqual(Report.TARGET_TYPES, [
    "PRESET",
    "FILMSIM",
    "IMAGE",
    "DISCUSSION_POST",
  ]);

  const errors = validReport({ targetType: "USER" }).validateSync().errors;
  assert.ok(errors.targetType, "an unlisted target type is rejected");
});

test("reason is closed to the triage categories", () => {
  assert.deepEqual(Report.REASONS, [
    "SPAM",
    "STOLEN_CONTENT",
    "INAPPROPRIATE",
    "ABUSE",
    "OTHER",
  ]);

  const errors = validReport({ reason: "BECAUSE" }).validateSync().errors;
  assert.ok(errors.reason, "an unlisted reason is rejected");
});

test("status is closed to the three queue states", () => {
  assert.deepEqual(Report.STATUSES, ["OPEN", "ACTIONED", "DISMISSED"]);

  const errors = validReport({ status: "MAYBE" }).validateSync().errors;
  assert.ok(errors.status, "an unlisted status is rejected");
});

test("detail is capped so a report cannot become free storage", () => {
  const tooLong = "a".repeat(Report.DETAIL_MAX_LENGTH + 1);
  const errors = validReport({ detail: tooLong }).validateSync().errors;

  assert.ok(errors.detail, `detail over ${Report.DETAIL_MAX_LENGTH} is rejected`);
  assert.equal(
    validReport({ detail: "a".repeat(Report.DETAIL_MAX_LENGTH) }).validateSync(),
    undefined
  );
});

test("the queue read and the duplicate guard are both indexed", () => {
  const indexes = Report.schema.indexes();

  const queueIndex = indexes.find(
    ([fields]) => fields.status === 1 && fields.createdAt === -1
  );
  assert.ok(queueIndex, "expected a {status, createdAt} index for the queue");

  const duplicateGuard = indexes.find(
    ([, options]) =>
      options.unique && options.partialFilterExpression?.status === "OPEN"
  );
  assert.ok(duplicateGuard, "expected a partial unique index on open reports");
  assert.deepEqual(duplicateGuard[0], {
    reporter: 1,
    targetType: 1,
    targetId: 1,
    status: 1,
  });
});
