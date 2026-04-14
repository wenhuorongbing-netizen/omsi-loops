import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { getActiveFixtures } from "../tests/support/fixture-manifest.mjs";
import { openFixturePage, dismissTutorialIfPresent } from "../tests/support/runtime-fixture-driver.mjs";
import { captureRuntimeMetrics } from "../tests/support/runtime-metrics.mjs";
import { startStaticServer } from "./static-server-lib.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const server = await startStaticServer({
    rootDir,
    host: "127.0.0.1",
    port: 0,
});

const browser = await chromium.launch({headless: true});
const fixtures = getActiveFixtures();

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
            if (runtime.consoleErrors.length > 0) {
                throw new Error(`Refusing to write baseline for ${fixture.id}; page reported ${runtime.consoleErrors.length} errors.`);
            }
            const metrics = await captureRuntimeMetrics(runtime.page);
            fs.writeFileSync(fixture.baselinePath, `${JSON.stringify(metrics, null, 2)}\n`, "utf8");
            console.log(`Updated baseline: ${path.relative(rootDir, fixture.baselinePath)}`);
        } finally {
            await runtime.context.close();
        }
    }
} finally {
    await browser.close();
    await server.close();
}
