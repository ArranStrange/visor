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
const Discussion = require("../../../../models/Discussion");
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
    Discussion.deleteMany({}),
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

test("changeEmail stages the address without switching it", async () => {
  // Switching immediately would mean one typo locks the account out for good:
  // login needs a verified address, and every recovery route would then mail
  // the address nobody owns.
  const user = await createUser();

  const result = await mutations.changeEmail(
    null,
    { currentPassword: PASSWORD, newEmail: "new@visor.test" },
    ctx({ id: user._id.toString() })
  );

  assert.equal(result.success, false, "no SendGrid key in tests, so the send fails");

  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "arran@visor.test", "the live address is untouched");
  assert.equal(reloaded.emailVerified, true, "the user can still log in");
  assert.equal(
    reloaded.pendingEmail,
    undefined,
    "a failed send clears the staged change rather than leaving it dangling"
  );
});

test("a staged email change only applies once the new address is confirmed", async () => {
  const user = await createUser();
  const pendingToken = user.generatePendingEmailToken("new@visor.test");
  await user.save();

  // Still the old address before the link is clicked.
  let reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "arran@visor.test");

  const result = await mutations.verifyEmail(null, { token: pendingToken });

  assert.equal(result.success, true);
  reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "new@visor.test");
  assert.equal(reloaded.emailVerified, true);
  assert.equal(reloaded.pendingEmail, undefined, "single-use");
  assert.ok(reloaded.credentialsChangedAt, "sessions under the old address end");
});

test("a staged change is refused if the address is claimed in the meantime", async () => {
  const user = await createUser();
  const pendingToken = user.generatePendingEmailToken("contested@visor.test");
  await user.save();

  await createUser({ username: "faster", email: "contested@visor.test" });

  const result = await mutations.verifyEmail(null, { token: pendingToken });

  assert.equal(result.success, false);
  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "arran@visor.test", "the live address survives");
  assert.equal(reloaded.pendingEmail, undefined);
});

test("an expired staged change cannot be completed", async () => {
  const user = await createUser();
  const pendingToken = user.generatePendingEmailToken("new@visor.test");
  user.pendingEmailTokenExpiry = new Date(Date.now() - 1000);
  await user.save();

  const result = await mutations.verifyEmail(null, { token: pendingToken });

  assert.equal(result.success, false);
  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.email, "arran@visor.test");
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

test("deletion discards a staged email change", async () => {
  // pendingEmail holds a real address, so it is PII of its own.
  const user = await createUser();
  user.generatePendingEmailToken("new@visor.test");
  await user.save();

  await mutations.deleteAccount(
    null,
    { currentPassword: PASSWORD },
    ctx({ id: user._id.toString() })
  );

  const reloaded = await User.findById(user._id);
  assert.equal(reloaded.pendingEmail, undefined);
  assert.equal(reloaded.pendingEmailTokenHash, undefined);
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

test("deletion scrubs the name and avatar copied into discussion posts", async () => {
  // Discussion posts store a copy of the author's username and avatar next to
  // the userId, so anonymising the User document is not enough on its own.
  const user = await createUser({ avatar: "https://cdn.test/arran.jpg" });
  const other = await createUser({
    username: "someoneelse",
    email: "else@visor.test",
    avatar: "https://cdn.test/else.jpg",
  });

  const discussion = await Discussion.create({
    title: "Classic Chrome on X-T5",
    linkedTo: { type: "filmsim", refId: new mongoose.Types.ObjectId() },
    createdBy: user._id,
    posts: [
      {
        userId: user._id,
        username: "arran",
        avatar: "https://cdn.test/arran.jpg",
        content: "my post",
        replies: [
          {
            userId: user._id,
            username: "arran",
            avatar: "https://cdn.test/arran.jpg",
            content: "my reply",
          },
          {
            userId: other._id,
            username: "someoneelse",
            avatar: "https://cdn.test/else.jpg",
            content: "their reply",
          },
        ],
      },
      {
        userId: other._id,
        username: "someoneelse",
        avatar: "https://cdn.test/else.jpg",
        content: "their post",
        replies: [],
      },
    ],
  });

  await mutations.deleteAccount(
    null,
    { currentPassword: PASSWORD },
    ctx({ id: user._id.toString() })
  );

  const reloadedUser = await User.findById(user._id);
  const reloaded = await Discussion.findById(discussion._id);

  const myPost = reloaded.posts[0];
  assert.equal(myPost.username, reloadedUser.username);
  assert.match(myPost.username, /^deleted_user_/);
  assert.equal(myPost.avatar, null, "the avatar URL is gone");

  const myReply = myPost.replies[0];
  assert.match(myReply.username, /^deleted_user_/);
  assert.equal(myReply.avatar, null);

  // Everyone else's identity is untouched.
  const theirReply = myPost.replies[1];
  assert.equal(theirReply.username, "someoneelse");
  assert.equal(theirReply.avatar, "https://cdn.test/else.jpg");
  assert.equal(reloaded.posts[1].username, "someoneelse");
  assert.equal(reloaded.posts[1].avatar, "https://cdn.test/else.jpg");
});
