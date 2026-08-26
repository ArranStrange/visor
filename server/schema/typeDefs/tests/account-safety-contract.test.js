const assert = require("node:assert/strict");
const test = require("node:test");

const typeDefs = require("../user");

// Walks the gql AST rather than asserting on the source string, matching the
// style of preset-inputs.test.js. These are contract tests: the client sends
// these argument names and reads these fields, and nothing else checks that the
// two halves agree (there is no codegen).

const definitions = typeDefs.definitions;

const mutationFields = definitions
  .filter(
    (def) =>
      def.kind === "ObjectTypeExtension" && def.name.value === "Mutation"
  )
  .flatMap((def) => def.fields);

const fieldByName = (name) =>
  mutationFields.find((field) => field.name.value === name);

const argNames = (field) => field.arguments.map((arg) => arg.name.value);

const isNonNull = (typeNode) => typeNode.kind === "NonNullType";

const namedType = (typeNode) =>
  isNonNull(typeNode) ? typeNode.type.name.value : typeNode.name.value;

test("the account-safety mutations exist", () => {
  for (const name of [
    "requestPasswordReset",
    "resetPassword",
    "changePassword",
    "changeEmail",
    "deleteAccount",
  ]) {
    assert.ok(fieldByName(name), `${name} is declared`);
  }
});

test("every account-safety mutation returns a non-null SimpleResponse", () => {
  for (const name of [
    "requestPasswordReset",
    "resetPassword",
    "changePassword",
    "changeEmail",
    "deleteAccount",
  ]) {
    const field = fieldByName(name);
    assert.ok(isNonNull(field.type), `${name} returns non-null`);
    assert.equal(namedType(field.type), "SimpleResponse");
  }
});

test("SimpleResponse carries a success flag and a message", () => {
  const type = definitions.find(
    (def) =>
      def.kind === "ObjectTypeDefinition" && def.name.value === "SimpleResponse"
  );
  assert.ok(type, "SimpleResponse is defined");

  const fields = Object.fromEntries(
    type.fields.map((field) => [field.name.value, field])
  );
  assert.ok(isNonNull(fields.success.type));
  assert.equal(namedType(fields.success.type), "Boolean");
  assert.ok(isNonNull(fields.message.type));
  assert.equal(namedType(fields.message.type), "String");
});

test("resetPassword takes the token, the address and the new password", () => {
  const args = argNames(fieldByName("resetPassword"));
  assert.deepEqual(args.sort(), ["email", "newPassword", "token"]);
});

test("the destructive mutations all require the current password", () => {
  // Changing how you sign in, or ending the account, must not be possible with
  // only a stolen session token.
  for (const name of ["changePassword", "changeEmail", "deleteAccount"]) {
    const field = fieldByName(name);
    assert.ok(
      argNames(field).includes("currentPassword"),
      `${name} requires currentPassword`
    );

    const arg = field.arguments.find(
      (candidate) => candidate.name.value === "currentPassword"
    );
    assert.ok(isNonNull(arg.type), `${name}'s currentPassword is non-null`);
  }
});

test("register accepts an optional honeypot", () => {
  const field = fieldByName("register");
  const honeypot = field.arguments.find((arg) => arg.name.value === "honeypot");

  assert.ok(honeypot, "honeypot is declared");
  assert.equal(
    isNonNull(honeypot.type),
    false,
    "honeypot must stay optional so existing clients keep working"
  );
  assert.equal(namedType(honeypot.type), "String");
});

test("requestPasswordReset takes only an email", () => {
  // Any extra argument here risks becoming an oracle for which addresses exist.
  assert.deepEqual(argNames(fieldByName("requestPasswordReset")), ["email"]);
});
