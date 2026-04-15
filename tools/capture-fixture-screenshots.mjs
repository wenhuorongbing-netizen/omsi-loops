import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getActiveFixtures } from "../tests/support/fixture-manifest.mjs";
import { openFixturePage, dismissTutorialIfPresent } from "../tests/support/runtime-fixture-driver.mjs";
import { captureRuntimeMetrics } from "../tests/support/runtime-metrics.mjs";
import { startStaticServer } from "./static-server-lib.mjs";
import { phase0FixturePresets } from "../tests/fixtures/saves/phase0-presets.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.resolve(rootDir, "output/fixtures/review");
fs.mkdirSync(outputDir, {recursive: true});

const server = await startStaticServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
});

const browser = await chromium.launch({headless: true});
const fixtures = getActiveFixtures();
const results = [];
const presetById = new Map(phase0FixturePresets.map(preset => [preset.id, preset]));

try {
    for (const fixture of fixtures) {
        const runtime = await openFixturePage({
            browser,
            baseUrl: server.url,
            fixturePath: fixture.fixturePath,
            language: fixture.language ?? "en-EN",
        });
        try {
            await dismissTutorialIfPresent(runtime.page);
            const preset = presetById.get(fixture.id);
            if (typeof preset?.targetTown === "number") {
                await runtime.page.evaluate(targetTown => {
                    view.showTown(targetTown);
                    curTown = targetTown;
                    view.update();
                }, preset.targetTown);
            }
            await runtime.page.waitForTimeout(250);
            const screenshotPath = path.join(outputDir, `${fixture.id}.png`);
            await runtime.page.screenshot({path: screenshotPath, fullPage: true});
            const metrics = await captureRuntimeMetrics(runtime.page);
            results.push({
                id: fixture.id,
                language: fixture.language ?? "en-EN",
                screenshotTown: preset?.targetTown ?? metrics.meta?.curTown ?? 0,
                screenshotPath,
                consoleErrors: runtime.consoleErrors,
                meta: metrics.meta,
                townsUnlocked: metrics.townsUnlocked,
                queueLength: metrics.queue?.length ?? 0,
                totals: metrics.totals,
            });
            console.log(`Captured fixture review: ${path.relative(rootDir, screenshotPath)}`);
        } finally {
            await runtime.context.close();
        }
    }
} finally {
    await browser.close();
    await server.close();
}

const resultsPath = path.join(outputDir, "results.json");
fs.writeFileSync(resultsPath, `${JSON.stringify({fixtures: results}, null, 2)}\n`, "utf8");
console.log(`Wrote fixture review summary: ${path.relative(rootDir, resultsPath)}`);
