const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const {
  FUJIFILM_CAMERAS,
  normalizeCameraName,
} = require("../../../constants/fujifilmCameras");

// The client's catalog is the UI source of truth; the server copy exists so
// Loadout validation can run where writes happen. This test parses the
// client TypeScript file and fails if the two catalogs drift.
const clientSource = fs.readFileSync(
  path.join(
    __dirname,
    "../../../../client/src/constants/fujifilmCameras.ts"
  ),
  "utf8"
);

const clientEntries = [
  ...clientSource.matchAll(
    /\{\s*name:\s*"([^"]+)",\s*sensorKey:\s*"([^"]+)"/g
  ),
].map((m) => ({ name: m[1], sensorKey: m[2] }));

test("client camera catalog parsed successfully", () => {
  assert.ok(
    clientEntries.length >= 40,
    `expected 40+ cameras in the client catalog, parsed ${clientEntries.length}`
  );
});

test("server catalog matches the client catalog, name for name", () => {
  const serverNames = new Set(FUJIFILM_CAMERAS.map((c) => c.name));
  const clientNames = new Set(clientEntries.map((c) => c.name));

  const missingFromServer = [...clientNames].filter((n) => !serverNames.has(n));
  const missingFromClient = [...serverNames].filter((n) => !clientNames.has(n));

  assert.deepEqual(missingFromServer, [], "cameras missing from server copy");
  assert.deepEqual(missingFromClient, [], "cameras missing from client copy");
});

test("sensor keys agree between the two catalogs", () => {
  const serverByName = new Map(FUJIFILM_CAMERAS.map((c) => [c.name, c]));
  for (const entry of clientEntries) {
    assert.equal(
      serverByName.get(entry.name)?.sensorKey,
      entry.sensorKey,
      `sensorKey mismatch for ${entry.name}`
    );
  }
});

test("normalizeCameraName matches the client implementation's behaviour", () => {
  // Mirror of the client's documented examples.
  assert.equal(normalizeCameraName("Fujifilm X-T30 II"), "xt30ii");
  assert.equal(normalizeCameraName("fuji xt30ii"), "xt30ii");
  assert.equal(normalizeCameraName("X-T30II"), "xt30ii");
  assert.equal(normalizeCameraName("  FUJI  X100V "), "x100v");
});

test("every camera has an explicit bank count", () => {
  for (const c of FUJIFILM_CAMERAS) {
    assert.ok(
      Number.isInteger(c.customBanks) && c.customBanks >= 0,
      `${c.name} has no customBanks`
    );
    assert.equal(typeof c.banksVerified, "boolean", `${c.name} missing banksVerified`);
  }
});

test("bank counts agree between the two catalogs", () => {
  const clientBankEntries = [
    ...clientSource.matchAll(
      /\{ name: "([^"]+)", sensorKey: "[^"]+", customBanks: (\d+), banksVerified: (true|false) \}/g
    ),
  ].map((m) => ({ name: m[1], customBanks: Number(m[2]), banksVerified: m[3] === "true" }));

  assert.equal(
    clientBankEntries.length,
    FUJIFILM_CAMERAS.length,
    "client catalog entries missing customBanks/banksVerified"
  );

  const serverByName = new Map(FUJIFILM_CAMERAS.map((c) => [c.name, c]));
  for (const entry of clientBankEntries) {
    const server = serverByName.get(entry.name);
    assert.equal(server?.customBanks, entry.customBanks, `customBanks mismatch for ${entry.name}`);
    assert.equal(server?.banksVerified, entry.banksVerified, `banksVerified mismatch for ${entry.name}`);
  }
});

test("client loadout fragment aliases the colour field (schema spells it colour)", () => {
  // Guard for the class of bug where a client document requests a field
  // the schema doesn't expose: FilmSimSettings has "colour"; the client
  // types use "color" and must alias. Nothing else executes client
  // documents against the schema, so this drift is otherwise invisible
  // until runtime.
  const loadoutGraphql = fs.readFileSync(
    path.join(__dirname, "../../../../client/src/features/loadouts/graphql/loadouts.ts"),
    "utf8"
  );
  assert.ok(
    /color:\s*colour/.test(loadoutGraphql),
    "loadouts fragment must request `color: colour`"
  );
  assert.ok(
    !/^\s+color\s*$/m.test(loadoutGraphql),
    "loadouts fragment must not request a bare `color` field"
  );
});
