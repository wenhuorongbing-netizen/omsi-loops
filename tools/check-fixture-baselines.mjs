import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getActiveFixtures, readFixtureManifest } from "../tests/support/fixture-manifest.mjs";
import { openFixturePage, dismissTutorialIfPresent } from "../tests/support/runtime-fixture-driver.mjs";
import { captureRuntimeMetrics } from "../tests/support/runtime-metrics.mjs";
import { startStaticServer } from "./static-server-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mismatchDir = path.resolve(rootDir, "output/smoke/baselines");
fs.mkdirSync(mismatchDir, {recursive: true});

const manifest = readFixtureManifest();
const activeFixtures = getActiveFixtures();
const plannedFixtures = manifest.filter(fixture => fixture.status !== "active");

const server = await startStaticServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
});

const browser = await chromium.launch({headless: true});
const mismatches = [];

try {
    for (const fixture of activeFixtures) {
        const runtime = await openFixturePage({
            browser,
            baseUrl: server.url,
            fixturePath: fixture.fixturePath,
            language: fixture.language ?? "en-EN",
        });
        try {
            await dismissTutorialIfPresent(runtime.page);
            if (runtime.consoleErrors.length > 0) {
                const errorPath = path.join(mismatchDir, `${fixture.id}.errors.json`);
                fs.writeFileSync(errorPath, `${JSON.stringify(runtime.consoleErrors, null, 2)}\n`, "utf8");
                mismatches.push(`${fixture.id}: page reported ${runtime.consoleErrors.length} console/page errors`);
                continue;
            }
            const metrics = await captureRuntimeMetrics(runtime.page);
            const actualJson = `${JSON.stringify(metrics, null, 2)}\n`;
            if (!fs.existsSync(fixture.baselinePath)) {
                fs.writeFileSync(path.join(mismatchDir, `${fixture.id}.actual.json`), actualJson, "utf8");
                mismatches.push(`${fixture.id}: baseline missing`);
                continue;
            }
            const expectedJson = fs.readFileSync(fixture.baselinePath, "utf8");
            if (actualJson !== expectedJson) {
                fs.writeFileSync(path.join(mismatchDir, `${fixture.id}.actual.json`), actualJson, "utf8");
                mismatches.push(`${fixture.id}: runtime metrics differ from ${path.relative(rootDir, fixture.baselinePath)}`);
                continue;
            }
            fs.rmSync(path.join(mismatchDir, `${fixture.id}.actual.json`), {force: true});
            fs.rmSync(path.join(mismatchDir, `${fixture.id}.errors.json`), {force: true});
            console.log(`Baseline OK: ${fixture.id}`);
        } finally {
            await runtime.context.close();
        }
    }
} finally {
    await browser.close();
    await server.close();
}

if (plannedFixtures.length > 0) {
    console.log(`Planned fixtures not yet captured: ${plannedFixtures.map(fixture => fixture.id).join(", ")}`);
}

if (mismatches.length > 0) {
    throw new Error(`Fixture baseline check failed:\n${mismatches.join("\n")}`);
}
