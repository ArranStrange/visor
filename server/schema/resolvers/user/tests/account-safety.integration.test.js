// config/jwt exits the process when JWT_SECRET is unset, and the resolver
// module pulls it in at require time — so this has to be set first.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret-not-for-real-use";

const assert = require("node:assert/strict");
const { test, before, after, beforeEach } = require("node:test");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const User = require("../../../../models/User");
const Loadout = require("../../../../models/Loadout");
const Notification = require("../../../../models/Notification");
const mutations = require("../mutations");
const { clearAll } = require("../../../../utils/rateLimiter");

// Resolver-level integration tests for the account-safety flows: the parts that
// only show up once a real document round-trips through Mongo — the pre-save
// password hash, single-use reset tokens, and what deletion actually leaves
// behind.
//
// EmailService is stubbed: without SENDGRID_API_KEY it already short-circuits
// to {success: false} without sending, and every one of these resolvers is
// specified to carry on regardless.

let mongod;

const PASSWORD = "OriginalPass1";
const ctx = (user, ip = "10.0.0.1") => ({ user, req: { ip } });

const createUser = (overrides = {}) =>
  User.create({
    username: "arran",
    email: "arran@visor.test",
    password: PASSWORD,
    emailVerified: true,
    ...overrides,
  });

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

after(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([
    User.deleteMany({}),
    Loadout.deleteMany({}),
    Notification.deleteMany({}),
  ]);
  // Counters are process-global, so tests would otherwise poison each other.
  clearAll();
});

test("requestPasswordReset issues a token for a real account", async () => {
  const user = await createUser();

  const result = await mutations.requestPasswordReset(
    null,
    { email: user.email },
    ctx(null)
  );

  assert.equal(result.success, true);
  const reloaded = await User.findById(user._id);
  assert.ok(reloaded.resetTokenHash, "a digest is stored");
  assert.ok(reloaded.resetTokenExpiry > new Date());
});

test("requestPasswordReset answers identically for an unknown address", async () => {
  await createUser();

  const known = await mutations.requestPasswordReset(
    null,
    { email: "arran@visor.test" },
    ctx(null)
  );
  const unknown = await mutations.requestPasswordReset(
    null,
    { email: "nobody@visor.test" },
    ctx(null, "10.0.0.2")
  );

  // Byte-identical: any difference here is an account-existence oracle.
  assert.deepEqual(unknown, known);
});

test("requestPasswordReset is rate limited per IP", async () => {
  await createUser();

  for (let i = 0; i < 5; i += 1) {
    await mutations.requestPasswordReset(
      null,
      { email: "arran@visor.test" },
      ctx(null, "10.0.0.9")
    );
  }

  await assert.rejects(
    () =>
      mutations.requestPasswordReset(
        null,
        { email: "arran@visor.test" },
        ctx(null, "10.0.0.9")
      ),
    /Too many attempts/
  );
});

test("resetPassword sets a new password and retires the link", async () => {
  const user = await createUser();
  const rawToken = user.generateResetToken();
  await user.save();

  const result = await mutations.resetPassword(null, {
    token: rawToken,
    email: user.email,
    newPassword: "BrandNewPass1",
  });

  assert.equal(result.success, true);

  const reloaded = await User.findById(user._id);
  assert.equal(await reloaded.comparePassword("BrandNewPass1"), true);
  assert.equal(await reloaded.comparePassword(PASSWORD), false);
  assert.equal(reloaded.resetTokenHash, undefined, "token is single-use");
  assert.ok(reloaded.credentialsChangedAt, "other sessions are signed out");
});

test("resetPassword refuses a reused token", async () => {
  const user = await createUser();
  const rawToken = user.generateResetToken();
  await user.save();

  await mutations.resetPassword(null, {
    token: rawToken,
    email: user.email,
    newPassword: "BrandNewPass1",
  });

  const second = await mutations.resetPassword(null, {
    token: rawToken,
    email: user.email,
    newPassword: "ThirdPassword1",
  });

  assert.equal(second.success, false);
  const reloaded = await User.findById(user._id);
  assert.equal(await reloaded.comparePassword("BrandNewPass1"), true);
});

test("resetPassword refuses an expired token", async () => {
  const user = await createUser();
  const rawToken = user.generateResetToken();
  user.resetTokenExpiry = new Date(Date.now() - 1000);
  await user.save();

  const result = await mutations.resetPassword(null, {
    token: rawToken,
    email: user.email,
    newPassword: "BrandNewPass1",
  });

  assert.equal(result.success, false);
});

test("resetPassword rejects a token belonging to another account", async () => {
  const victim = await createUser();
  const attacker = await createUser({
    username: "someoneelse",
    email: "else@visor.test",
  });
  const attackerToken = attacker.generateResetToken();
  await attacker.save();

  const result = await mutations.resetPassword(null, {
    token: attackerToken,
    email: victim.email,
    newPassword: "TakenOver1",
  });

  assert.equal(result.success, false);
  const reloaded = await User.findById(victim._id);
  assert.equal(await reloaded.comparePassword(PASSWORD), true);
});

test("resetPassword enforces the password rule", async () => {
  const user = await createUser();
  const rawToken = user.generateResetToken();
  await user.save();

  await assert.rejects(
    () =>
      mutations.resetPassword(null, {
        token: rawToken,
        email: user.email,
        newPassword: "short",
      }),
    /at least 8 characters/
  );
});

test("a reset also verifies the address", async () => {
  // Otherwise someone who never clicked the original verification link resets
  // their password and is still locked out of logging in.
  const user = await createUser({ emailVerified: false });
  const rawToken = user.generateResetToken();
  await user.save();

  await mutations.resetPassword(null, {
    token: rawToken,
    email: user.email,
    newPassword: "BrandNewPass1",
  });

  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.emailVerified, true);
});

test("login retires a pending reset link", async () => {
  const user = await createUser();
  user.generateResetToken();
  await user.save();

  await mutations.login(null, { email: user.email, password: PASSWORD });

  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.resetTokenHash, undefined);
});

test("changePassword requires the current password", async () => {
  const user = await createUser();

  await assert.rejects(
    () =>
      mutations.changePassword(
        null,
        { currentPassword: "WrongPass1", newPassword: "BrandNewPass1" },
        ctx({ id: user._id.toString() })
      ),
    /current password is incorrect/
  );

  const reloaded = await User.findById(user._id);
  assert.equal(await reloaded.comparePassword(PASSWORD), true);
});

test("changePassword updates the hash and stamps the revocation time", async () => {
  const user = await createUser();

  const result = await mutations.changePassword(
    null,
    { currentPassword: PASSWORD, newPassword: "BrandNewPass1" },
    ctx({ id: user._id.toString() })
  );

  assert.equal(result.success, true);
  const reloaded = await User.findById(user._id);
  assert.equal(await reloaded.comparePassword("BrandNewPass1"), true);
  assert.ok(reloaded.credentialsChangedAt);
});

test("changeEmail leaves the new address unverified", async () => {
  const user = await createUser();

  const result = await mutations.changeEmail(
    null,
    { currentPassword: PASSWORD, newEmail: "new@visor.test" },
    ctx({ id: user._id.toString() })
  );

  assert.equal(result.success, true);
  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "new@visor.test");
  assert.equal(reloaded.emailVerified, false, "login stays blocked until verified");
  assert.ok(reloaded.verificationToken, "a verification token is issued");
});

test("changeEmail refuses an address already in use", async () => {
  const user = await createUser();
  await createUser({ username: "other", email: "taken@visor.test" });

  await assert.rejects(
    () =>
      mutations.changeEmail(
        null,
        { currentPassword: PASSWORD, newEmail: "taken@visor.test" },
        ctx({ id: user._id.toString() })
      ),
    /already in use/
  );
});

test("deleteAccount anonymises the user and clears private data", async () => {
  const user = await createUser({ bio: "hello", instagram: "@arran" });
  await Loadout.create({
    owner: user._id,
    name: "Everyday",
    camera: "X-T5",
    bankCount: 7,
    slots: [],
  });
  await Notification.create({
    recipientId: user._id,
    type: "INFO",
    title: "hi",
    message: "hi",
  });

  const result = await mutations.deleteAccount(
    null,
    { currentPassword: PASSWORD },
    ctx({ id: user._id.toString() })
  );

  assert.equal(result.success, true);

  const reloaded = await User.findById(user._id);
  assert.ok(reloaded, "the document survives so content stays attributable");
  assert.match(reloaded.username, /^deleted_user_/);
  assert.doesNotMatch(reloaded.email, /arran@visor\.test/);
  assert.equal(reloaded.bio, undefined);
  assert.equal(reloaded.instagram, undefined);
  assert.ok(reloaded.deletedAt);
  assert.equal(await reloaded.comparePassword(PASSWORD), false, "password scrambled");

  assert.equal(await Loadout.countDocuments({ owner: user._id }), 0);
  assert.equal(await Notification.countDocuments({ recipientId: user._id }), 0);
});

test("deleteAccount requires the correct password", async () => {
  const user = await createUser();

  await assert.rejects(
    () =>
      mutations.deleteAccount(
        null,
        { currentPassword: "WrongPass1" },
        ctx({ id: user._id.toString() })
      ),
    /password is incorrect/
  );

  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.deletedAt, undefined);
});

test("a tombstoned account cannot be deleted or changed again", async () => {
  const user = await createUser();
  await mutations.deleteAccount(
    null,
    { currentPassword: PASSWORD },
    ctx({ id: user._id.toString() })
  );

  await assert.rejects(
    () =>
      mutations.changePassword(
        null,
        { currentPassword: PASSWORD, newPassword: "BrandNewPass1" },
        ctx({ id: user._id.toString() })
      ),
    /Account not found/
  );
});

test("register rejects a filled honeypot without creating an account", async () => {
  await assert.rejects(
    () =>
      mutations.register(
        null,
        {
          username: "botuser",
          email: "bot@visor.test",
          password: "BotPassword1",
          honeypot: "http://spam.example",
        },
        ctx(null)
      ),
    /could not be completed/
  );

  assert.equal(await User.countDocuments({ email: "bot@visor.test" }), 0);
});
