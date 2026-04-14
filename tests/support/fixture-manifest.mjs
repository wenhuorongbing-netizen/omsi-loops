import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
export const savesDir = path.resolve(thisDir, "../fixtures/saves");
export const manifestPath = path.join(savesDir, "manifest.json");

export function readJsonFile(jsonPath) {
    return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

export function readFixtureManifest() {
    const manifest = readJsonFile(manifestPath);
    return manifest.fixtures.map(fixture => ({
        ...fixture,
        fixturePath: path.join(savesDir, fixture.fixtureFile),
        baselinePath: path.join(savesDir, fixture.baselineFile),
    }));
}

export function getActiveFixtures() {
    return readFixtureManifest().filter(fixture => fixture.status === "active");
}

export function readFixtureFile(fixturePath) {
    return readJsonFile(fixturePath);
}
