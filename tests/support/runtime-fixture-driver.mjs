import { readFixtureFile } from "./fixture-manifest.mjs";

/**
 * @param {import("playwright").Browser} browser
 * @param {{localStorage?: Record<string, string>, viewport?: {width:number, height:number}}} fixture
 */
export async function createFixtureContext(browser, fixture) {
    const context = await browser.newContext({
        viewport: fixture.viewport ?? {width: 1440, height: 1100},
    });
    await context.addInitScript((storage) => {
        window.localStorage.clear();
        for (const [key, value] of Object.entries(storage)) {
            window.localStorage.setItem(key, value);
        }
    }, fixture.localStorage ?? {});
    return context;
}

/**
 * @param {{
 *   browser: import("playwright").Browser,
 *   baseUrl: string,
 *   fixturePath: string,
 *   language?: string,
 * }} options
 */
export async function openFixturePage({
    browser,
    baseUrl,
    fixturePath,
    language = "en-EN",
}) {
    const fixture = readFixtureFile(fixturePath);
    const context = await createFixtureContext(browser, fixture);
    const page = await context.newPage();
    const consoleErrors = [];
    const workerUrls = [];

    page.on("pageerror", error => {
        consoleErrors.push({type: "pageerror", message: String(error)});
    });
    page.on("console", message => {
        if (message.type() === "error") {
            consoleErrors.push({type: "console", message: message.text()});
        }
    });
    page.on("worker", worker => {
        workerUrls.push(worker.url());
    });

    const scenarioUrl = `${baseUrl}/index.html?lg=${encodeURIComponent(language)}`;
    await page.goto(scenarioUrl, {waitUntil: "networkidle"});
    await page.waitForSelector("#main");

    return {
        fixture,
        context,
        page,
        scenarioUrl,
        consoleErrors,
        workerUrls,
    };
}

export async function dismissTutorialIfPresent(page) {
    const tutorialButton = page.locator("#tutorial button");
    if (await tutorialButton.count()) {
        await tutorialButton.click();
        await page.waitForTimeout(100);
    }
}
