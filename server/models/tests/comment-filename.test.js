const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

test("Comment model uses the project model filename convention", () => {
  const modelFiles = fs.readdirSync(path.join(__dirname, ".."));

  assert.ok(modelFiles.includes("Comment.js"));
  assert.ok(!modelFiles.includes("comment.js"));
});
