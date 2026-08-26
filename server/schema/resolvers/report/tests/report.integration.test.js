// config/jwt exits the process when JWT_SECRET is unset, and the resolver
// module graph pulls it in at require time — so this has to be set first.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-real-use";

const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const Discussion = require("../../../../models/Discussion");
const Preset = require("../../../../models/Preset");
const Report = require("../../../../models/Report");
const User = require("../../../../models/User");
const mutations = require("../mutations");
const queries = require("../queries");
const types = require("../types");
const { clearAll } = require("../../../../utils/rateLimiter");
const { FIXTURE_PASSWORD } = require("../../../../test-support/fixtures");

// Resolver-level integration tests for the moderation queue: the parts that
// only show up once documents round-trip through Mongo — target existence
// checks, the partial unique index behind duplicate handling, and what
// resolving a report actually writes.

let mongod;

const ctx = (user, ip = "10.0.0.1") => ({ user, req: { ip } });

let counter = 0;
const createUser = (overrides = {}) => {
  counter += 1;
  return User.create({
    username: `member${counter}`,
    email: `member${counter}@visor.test`,
    password: FIXTURE_PASSWORD,
    emailVerified: true,
    ...overrides,
  });
};

const createPreset = (creator) =>
  Preset.create({
    title: "Muted Greens",
    slug: `muted-greens-${(counter += 1)}`,
    creator: creator._id,
  });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  // The duplicate guard is a database-level partial unique index; without this
  // the race branch under test is never exercised.
  await Report.syncIndexes();
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([
    Report.deleteMany({}),
    User.deleteMany({}),
    Preset.deleteMany({}),
    Discussion.deleteMany({}),
  ]);
  // Rate-limit counters are process-global, so tests would poison each other.
  clearAll();
});

test("reportContent requires a signed-in reporter", async () => {
  const author = await createUser();
  const preset = await createPreset(author);

  await assert.rejects(
    () =>
      mutations.reportContent(
        null,
        { targetType: "PRESET", targetId: preset._id.toString(), reason: "SPAM" },
        ctx(null)
      ),
    /must be logged in/
  );
});

test("reportContent files an open report against real content", async () => {
  const reporter = await createUser();
  const preset = await createPreset(await createUser());

  const report = await mutations.reportContent(
    null,
    {
      targetType: "PRESET",
      targetId: preset._id.toString(),
      reason: "STOLEN_CONTENT",
      detail: "  This is my photo.  ",
    },
    ctx(reporter)
  );

  assert.equal(report.status, "OPEN");
  assert.equal(report.reason, "STOLEN_CONTENT");
  assert.equal(report.detail, "This is my photo.", "detail is trimmed");
  assert.equal(report.reporter.username, reporter.username, "reporter populated");
  assert.equal(report.resolvedBy, null);
  assert.equal(report.resolvedAt, null);
});

test("reportContent rejects a target that does not exist", async () => {
  const reporter = await createUser();

  await assert.rejects(
    () =>
      mutations.reportContent(
        null,
        {
          targetType: "PRESET",
          targetId: new mongoose.Types.ObjectId().toString(),
          reason: "SPAM",
        },
        ctx(reporter)
      ),
    /could not be found/
  );

  assert.equal(await Report.countDocuments({}), 0);
});

test("reportContent rejects a target id that is not an ObjectId", async () => {
  const reporter = await createUser();

  await assert.rejects(
    () =>
      mutations.reportContent(
        null,
        { targetType: "PRESET", targetId: "not-an-id", reason: "SPAM" },
        ctx(reporter)
      ),
    /could not be found/
  );
});

test("reportContent finds a discussion post by its subdocument id", async () => {
  const reporter = await createUser();
  const author = await createUser();
  const preset = await createPreset(author);
  const discussion = await Discussion.create({
    title: "About this preset",
    linkedTo: { type: "preset", refId: preset._id },
    createdBy: author._id,
    posts: [
      { userId: author._id, username: author.username, content: "Buy my thing" },
    ],
  });
  const postId = discussion.posts[0]._id.toString();

  const report = await mutations.reportContent(
    null,
    { targetType: "DISCUSSION_POST", targetId: postId, reason: "SPAM" },
    ctx(reporter)
  );

  assert.equal(report.targetType, "DISCUSSION_POST");
  assert.equal(report.targetId.toString(), postId);
});

test("reporting the same target twice returns the existing open report", async () => {
  const reporter = await createUser();
  const preset = await createPreset(await createUser());
  const args = {
    targetType: "PRESET",
    targetId: preset._id.toString(),
    reason: "SPAM",
  };

  const first = await mutations.reportContent(null, args, ctx(reporter));
  const second = await mutations.reportContent(
    null,
    { ...args, reason: "ABUSE" },
    ctx(reporter)
  );

  // Idempotent rather than an error: a second tap on Report is someone
  // repeating themselves, and duplicates only inflate the queue.
  assert.equal(second.id.toString(), first.id.toString());
  assert.equal(second.reason, "SPAM", "the original report is untouched");
  assert.equal(await Report.countDocuments({}), 1);
});

test("a second reporter can report the same target", async () => {
  const preset = await createPreset(await createUser());
  const args = {
    targetType: "PRESET",
    targetId: preset._id.toString(),
    reason: "SPAM",
  };

  await mutations.reportContent(null, args, ctx(await createUser()));
  await mutations.reportContent(null, args, ctx(await createUser()));

  assert.equal(await Report.countDocuments({}), 2);
});

test("the same reporter can report again once the first report is closed", async () => {
  const reporter = await createUser();
  const admin = await createUser({ isAdmin: true });
  const preset = await createPreset(await createUser());
  const args = {
    targetType: "PRESET",
    targetId: preset._id.toString(),
    reason: "SPAM",
  };

  const first = await mutations.reportContent(null, args, ctx(reporter));
  await mutations.resolveReport(
    null,
    { reportId: first.id.toString(), status: "DISMISSED" },
    ctx(admin)
  );

  const second = await mutations.reportContent(null, args, ctx(reporter));

  assert.notEqual(second.id.toString(), first.id.toString());
  assert.equal(await Report.countDocuments({}), 2);
});

test("reportContent is rate limited per reporter", async () => {
  const reporter = await createUser();
  const other = await createUser();
  const presets = [];
  for (let i = 0; i < 21; i += 1) {
    presets.push(await createPreset(await createUser()));
  }

  for (let i = 0; i < 20; i += 1) {
    await mutations.reportContent(
      null,
      {
        targetType: "PRESET",
        targetId: presets[i]._id.toString(),
        reason: "SPAM",
      },
      ctx(reporter)
    );
  }

  await assert.rejects(
    () =>
      mutations.reportContent(
        null,
        {
          targetType: "PRESET",
          targetId: presets[20]._id.toString(),
          reason: "SPAM",
        },
        ctx(reporter)
      ),
    /Too many attempts/
  );

  // Keyed per reporter, so a second account on the same IP is unaffected.
  const stillWorks = await mutations.reportContent(
    null,
    {
      targetType: "PRESET",
      targetId: presets[20]._id.toString(),
      reason: "SPAM",
    },
    ctx(other)
  );
  assert.equal(stillWorks.status, "OPEN");
});

test("listReports is closed to anonymous callers and to non-admins", async () => {
  const member = await createUser();

  await assert.rejects(
    () => queries.listReports(null, {}, ctx(null)),
    /Admin access required/
  );
  await assert.rejects(
    () => queries.listReports(null, {}, ctx(member)),
    /Admin access required/
  );
});

test("resolveReport is closed to anonymous callers and to non-admins", async () => {
  const reporter = await createUser();
  const preset = await createPreset(await createUser());
  const report = await mutations.reportContent(
    null,
    { targetType: "PRESET", targetId: preset._id.toString(), reason: "SPAM" },
    ctx(reporter)
  );
  const args = { reportId: report.id.toString(), status: "ACTIONED" };

  await assert.rejects(
    () => mutations.resolveReport(null, args, ctx(null)),
    /Admin access required/
  );
  await assert.rejects(
    () => mutations.resolveReport(null, args, ctx(reporter)),
    /Admin access required/
  );

  const untouched = await Report.findById(report.id);
  assert.equal(untouched.status, "OPEN");
});

test("listReports shows the open queue newest first, paginated", async () => {
  const admin = await createUser({ isAdmin: true });
  const reporter = await createUser();
  const presets = [
    await createPreset(await createUser()),
    await createPreset(await createUser()),
    await createPreset(await createUser()),
  ];

  for (const preset of presets) {
    await mutations.reportContent(
      null,
      { targetType: "PRESET", targetId: preset._id.toString(), reason: "SPAM" },
      ctx(reporter)
    );
  }

  const firstPage = await queries.listReports(
    null,
    { page: 1, limit: 2 },
    ctx(admin)
  );

  assert.equal(firstPage.totalCount, 3);
  assert.equal(firstPage.reports.length, 2);
  assert.equal(firstPage.currentPage, 1);
  assert.equal(firstPage.totalPages, 2);
  assert.equal(firstPage.hasNextPage, true);
  assert.equal(firstPage.hasPreviousPage, false);
  assert.ok(
    firstPage.reports[0].createdAt >= firstPage.reports[1].createdAt,
    "newest first"
  );

  const secondPage = await queries.listReports(
    null,
    { page: 2, limit: 2 },
    ctx(admin)
  );
  assert.equal(secondPage.reports.length, 1);
  assert.equal(secondPage.hasNextPage, false);
  assert.equal(secondPage.hasPreviousPage, true);
});

test("resolveReport records who closed the report and when", async () => {
  const admin = await createUser({ isAdmin: true });
  const reporter = await createUser();
  const preset = await createPreset(await createUser());
  const filed = await mutations.reportContent(
    null,
    { targetType: "PRESET", targetId: preset._id.toString(), reason: "ABUSE" },
    ctx(reporter)
  );

  const resolved = await mutations.resolveReport(
    null,
    { reportId: filed.id.toString(), status: "ACTIONED" },
    ctx(admin)
  );

  assert.equal(resolved.status, "ACTIONED");
  assert.equal(resolved.resolvedBy.username, admin.username);
  assert.ok(resolved.resolvedAt instanceof Date);

  // And it leaves the open queue.
  const open = await queries.listReports(null, {}, ctx(admin));
  assert.equal(open.totalCount, 0);
  const actioned = await queries.listReports(
    null,
    { status: "ACTIONED" },
    ctx(admin)
  );
  assert.equal(actioned.totalCount, 1);
});

test("resolveReport refuses to reopen a report", async () => {
  const admin = await createUser({ isAdmin: true });
  const reporter = await createUser();
  const preset = await createPreset(await createUser());
  const filed = await mutations.reportContent(
    null,
    { targetType: "PRESET", targetId: preset._id.toString(), reason: "SPAM" },
    ctx(reporter)
  );

  await assert.rejects(
    () =>
      mutations.resolveReport(
        null,
        { reportId: filed.id.toString(), status: "OPEN" },
        ctx(admin)
      ),
    /ACTIONED or DISMISSED/
  );
});

test("resolveReport rejects an unknown report", async () => {
  const admin = await createUser({ isAdmin: true });

  await assert.rejects(
    () =>
      mutations.resolveReport(
        null,
        {
          reportId: new mongoose.Types.ObjectId().toString(),
          status: "ACTIONED",
        },
        ctx(admin)
      ),
    /Report not found/
  );
});

test("targetUrl is admin-only, even on the report the reporter just filed", async () => {
  // reportContent hands a Report back to a non-admin, so this field cannot rely
  // on listReports being gated — it has to gate itself.
  const reporter = await createUser();
  const preset = await createPreset(await createUser());

  const report = await mutations.reportContent(
    null,
    {
      targetType: "PRESET",
      targetId: preset._id.toString(),
      reason: "SPAM",
    },
    ctx(reporter)
  );

  // requireAdmin throws synchronously, before any lookup happens.
  assert.throws(
    () => types.Report.targetUrl(report, {}, ctx(reporter)),
    /Admin access required/,
    "the reporter cannot read it"
  );
  assert.throws(
    () => types.Report.targetUrl(report, {}, ctx(null)),
    /Admin access required/,
    "nor can an anonymous caller"
  );

  const admin = await createUser({ isAdmin: true });
  const url = await types.Report.targetUrl(report, {}, ctx(admin));
  assert.equal(url, `/preset/${preset.slug}`, "an admin still gets the link");
});
