import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { readFixtureManifest, savesDir } from "../tests/support/fixture-manifest.mjs";

const require = createRequire(import.meta.url);
const LZString = require("lz-string");

function usage() {
    throw new Error("Usage: node tools/create-save-fixture.mjs <fixture-id> <input-file> [description]");
}

const fixtureId = process.argv[2];
const inputFile = process.argv[3];
const description = process.argv.slice(4).join(" ");

if (!fixtureId || !inputFile) {
    usage();
}

const inputText = fs.readFileSync(path.resolve(inputFile), "utf8").trim();
const saveJson = inputText.startsWith("ILSV01")
    ? LZString.decompressFromBase64(inputText.slice(6))
    : inputText;

if (!saveJson) {
    throw new Error(`Unable to decode save data from ${inputFile}`);
}

const parsed = JSON.parse(saveJson);
const manifest = readFixtureManifest();
const knownFixture = manifest.find(fixture => fixture.id === fixtureId);
const fixturePath = knownFixture?.fixturePath ?? path.join(savesDir, `${fixtureId}.localstorage.json`);
const challengeSave = parsed.challengeSave ?? {};
const shouldPopulateChallengeSlot = challengeSave.inChallenge === true || challengeSave.challengeMode > 0;

const fixture = {
    name: fixtureId,
    description: description || knownFixture?.description || `Imported save fixture for ${fixtureId}.`,
    localStorage: {
        idleLoops1: saveJson,
        idleLoopsChallenge: shouldPopulateChallengeSlot ? saveJson : "",
    },
};

fs.writeFileSync(fixturePath, `${JSON.stringify(fixture, null, 2)}\n`, "utf8");
console.log(`Wrote fixture: ${fixturePath}`);
