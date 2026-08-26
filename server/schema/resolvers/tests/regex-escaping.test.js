const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

// Every place a user-supplied search string becomes a regex must escape it
// first: "(" throws, and ".*" or a nested quantifier turns a lookup into an
// expensive scan (#127, #137). Four sites were fixed in Phase 0 and a fifth —
// searchTags — was missed; this pins all of them, because the failure mode of
// a new unescaped site is a 500 on one specific input, which no other test
// would catch.

const RESOLVERS_DIR = path.join(__dirname, "..");

const jsFilesUnder = (dir) =>
  fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return entry.name === "tests" ? [] : jsFilesUnder(full);
      }
      return entry.name.endsWith(".js") ? [full] : [];
    });

const RAW_REGEX_CONSTRUCTION = /new RegExp\(\s*(?!escapeRegExp)/;
const RAW_MONGO_REGEX = /\$regex:\s*(?!escapeRegExp)[A-Za-z_$]/;

test("no resolver builds a regex from unescaped input", () => {
  const offenders = [];

  for (const file of jsFilesUnder(RESOLVERS_DIR)) {
    const source = fs.readFileSync(file, "utf8");
    if (RAW_REGEX_CONSTRUCTION.test(source) || RAW_MONGO_REGEX.test(source)) {
      offenders.push(path.relative(RESOLVERS_DIR, file));
    }
  }

  assert.deepEqual(
    offenders,
    [],
    `wrap the search term in escapeRegExp in: ${offenders.join(", ")}`
  );
});

test("searchTags is one of the files the sweep covers", () => {
  // Guards the sweep itself: if the walk stopped finding files, the test above
  // would pass vacuously.
  const files = jsFilesUnder(RESOLVERS_DIR).map((file) =>
    path.relative(RESOLVERS_DIR, file)
  );

  assert.ok(files.includes("tag.js"));
  assert.ok(files.includes(path.join("discussion", "queries.js")));
  assert.ok(files.length > 10);
});
