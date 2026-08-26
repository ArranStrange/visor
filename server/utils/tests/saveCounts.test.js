const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");

const { membersToAdd, isMember } = require("../saveCounts");

const OID = "507f1f77bcf86cd799439011";
const OTHER_OID = "507f1f77bcf86cd799439012";

test("returns the ids not already held", () => {
  assert.deepEqual(membersToAdd([OID], [OID, OTHER_OID]), [OTHER_OID]);
});

test("compares an ObjectId to its id string as the same member", () => {
  // The bug this replaces: `new Set([...list.presets, ...presetIds])` kept
  // both, so re-confirming "Add to list" duplicated the entry and would have
  // inflated saveCount on every confirmation.
  const held = [new mongoose.Types.ObjectId(OID)];
  assert.deepEqual(membersToAdd(held, [OID]), []);
});

test("de-duplicates within the incoming batch too", () => {
  assert.deepEqual(membersToAdd([], [OID, OID]), [OID]);
});

test("treats a missing or empty membership list as adding everything", () => {
  assert.deepEqual(membersToAdd(undefined, [OID]), [OID]);
  assert.deepEqual(membersToAdd([], [OID]), [OID]);
});

test("adds nothing for a missing or empty batch", () => {
  assert.deepEqual(membersToAdd([OID], undefined), []);
  assert.deepEqual(membersToAdd([OID], []), []);
});

test("isMember sees an ObjectId through its string form", () => {
  assert.equal(isMember([new mongoose.Types.ObjectId(OID)], OID), true);
  assert.equal(isMember([new mongoose.Types.ObjectId(OID)], OTHER_OID), false);
  assert.equal(isMember(undefined, OID), false);
});
