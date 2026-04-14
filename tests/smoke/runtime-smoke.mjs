import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { readFixtureFile } from "../support/fixture-manifest.mjs";
import { dismissTutorialIfPresent, openFixturePage } from "../support/runtime-fixture-driver.mjs";

const thisDir = path.dirname(fileURLToPath(import.meta.url));
const defaultFixturePath = path.resolve(thisDir, "../fixtures/saves/new-game.localstorage.json");

/**
 * @param {{
 *   baseUrl: string,
 *   fixturePath?: string,
 *   outputDir: string,
 *   languages?: string[],
 * }} options
 */
export async function runRuntimeSmoke({
    baseUrl,
    fixturePath = defaultFixturePath,
    outputDir,
    languages = ["zh-CN", "en-EN"],
}) {
    const fixture = readFixtureFile(fixturePath);
    fs.mkdirSync(outputDir, {recursive: true});

    const browser = await chromium.launch({headless: true});
    const results = [];

    try {
        for (const language of languages) {
            results.push(await runLanguageScenario({
                baseUrl,
                browser,
                fixturePath,
                language,
                outputDir,
            }));
        }
    } finally {
        await browser.close();
    }

    const summary = {
        fixture: fixture.name,
        scenarioCount: results.length,
        languages,
        results,
    };
    const resultsPath = path.join(outputDir, "results.json");
    fs.writeFileSync(resultsPath, JSON.stringify(summary, null, 2), "utf8");

    const errorMessages = results.flatMap(result => result.consoleErrors);
    if (errorMessages.length > 0) {
        throw new Error(`Smoke failed with ${errorMessages.length} console/page errors. See ${resultsPath}`);
    }
    if (results.some(result => !result.predictor.workerObserved)) {
        throw new Error(`Smoke failed to observe predictor worker creation. See ${resultsPath}`);
    }
    if (results.some(result => !result.compatBridge?.timerUsesAppContextBinding || !result.compatBridge?.dungeonsUsesAppContextBinding)) {
        throw new Error(`Smoke failed to verify AppContext-backed save globals. See ${resultsPath}`);
    }
    if (results.some(result => !result.saveBridge?.saveUsesAppContext || !result.saveBridge?.loadUsesAppContext || !result.saveBridge?.loadMatchesExpected)) {
        throw new Error(`Smoke failed to verify AppContext-backed save/load flow. See ${resultsPath}`);
    }

    return summary;
}

async function runLanguageScenario({baseUrl, browser, fixturePath, language, outputDir}) {
    const runtime = await openFixturePage({
        browser,
        baseUrl,
        fixturePath,
        language,
    });
    try {
        const {page, scenarioUrl, consoleErrors, workerUrls} = runtime;
        await dismissTutorialIfPresent(page);

        const bootstrapState = await page.evaluate(() => ({
            hasBootstrapApi: !!globalThis.IdleLoopsBootstrap,
            hasBootstrapGame: typeof globalThis.IdleLoopsBootstrap?.bootstrapGame === "function",
            hasBootstrapPredictorWorker: typeof globalThis.IdleLoopsBootstrap?.bootstrapPredictorWorker === "function",
            hasGameSessionGetter: typeof globalThis.IdleLoopsBootstrap?.getGameSession === "function",
            hasView: typeof view !== "undefined" && !!view,
            totalActions: typeof totalActionList !== "undefined" && Array.isArray(totalActionList) ? totalActionList.length : -1,
            townCount: typeof towns !== "undefined" && Array.isArray(towns) ? towns.length : -1,
            sessionAvailable: !!globalThis.IdleLoopsBootstrap?.getGameSession?.(),
        }));
        const compatBridgeState = await page.evaluate(() => {
            const session = globalThis.IdleLoopsBootstrap?.getGameSession?.();
            const appContext = session?.appContext;
            const timerDescriptor = Object.getOwnPropertyDescriptor(Data.rootObjects.globals, "timer");
            const dungeonsDescriptor = Object.getOwnPropertyDescriptor(Data.rootObjects.globals, "dungeons");
            return {
                sessionHasAppContext: !!appContext,
                timerUsesAppContextBinding: timerDescriptor?.get === appContext?.globalBindings?.timer?.get
                    && timerDescriptor?.set === appContext?.globalBindings?.timer?.set,
                dungeonsUsesAppContextBinding: dungeonsDescriptor?.get === appContext?.globalBindings?.dungeons?.get
                    && dungeonsDescriptor?.set === appContext?.globalBindings?.dungeons?.set,
            };
        });
        const saveBridgeState = await page.evaluate(() => {
            const session = globalThis.IdleLoopsBootstrap?.getGameSession?.();
            const appContext = session?.appContext;
            if (!appContext) {
                return {
                    available: false,
                    saveUsesAppContext: false,
                    loadUsesAppContext: false,
                    loadMatchesExpected: false,
                };
            }

            const originalCapture = appContext.captureGlobalState.bind(appContext);
            const originalApply = appContext.applyGlobalState.bind(appContext);
            let saveCaptureCalls = 0;
            let loadApplyCalls = 0;

            appContext.captureGlobalState = function captureGlobalStateSpy(names) {
                saveCaptureCalls += 1;
                return originalCapture(names);
            };
            appContext.applyGlobalState = function applyGlobalStateSpy(patch) {
                loadApplyCalls += 1;
                return originalApply(patch);
            };

            try {
                session.applyGlobalPatch({
                    totalTalent: 4321,
                    goldInvested: 765,
                    stonesUsed: {1: 1, 3: 2, 5: 3, 6: 4},
                    storyMax: 11,
                    unreadActionStories: ["storyContainerSmokeSave"],
                });
                const saved = JSON.parse(save());

                const reloaded = structuredClone(saved);
                reloaded.totalTalent = 8765;
                reloaded.goldInvested = 234;
                reloaded.stonesUsed = {1: 9, 3: 8, 5: 7, 6: 6};
                reloaded.storyMax = 17;
                reloaded.unreadActionStories = ["storyContainerSmokeLoad"];
                loadPrimarySaveGlobals(reloaded);
                loadStorySaveGlobals(reloaded);

                const loaded = session.captureGlobalState([
                    "totalTalent",
                    "goldInvested",
                    "stonesUsed",
                    "storyMax",
                    "unreadActionStories",
                ]);

                return {
                    available: true,
                    saveUsesAppContext: saveCaptureCalls > 0,
                    loadUsesAppContext: loadApplyCalls > 0,
                    savedValues: {
                        totalTalent: saved.totalTalent,
                        goldInvested: saved.goldInvested,
                        stonesUsed: saved.stonesUsed,
                        storyMax: saved.storyMax,
                        unreadActionStories: saved.unreadActionStories,
                    },
                    loadedValues: loaded,
                    loadMatchesExpected: loaded.totalTalent === reloaded.totalTalent
                        && loaded.goldInvested === reloaded.goldInvested
                        && JSON.stringify(loaded.stonesUsed) === JSON.stringify(reloaded.stonesUsed)
                        && loaded.storyMax === reloaded.storyMax
                        && JSON.stringify(loaded.unreadActionStories) === JSON.stringify(reloaded.unreadActionStories),
                };
            } finally {
                appContext.captureGlobalState = originalCapture;
                appContext.applyGlobalState = originalApply;
            }
        });

        const workerEvent = page.waitForEvent("worker", {timeout: 5000}).catch(() => null);
        const predictorStateBefore = await page.locator("#plannerPredictorState").textContent();
        await page.evaluate(() => {
            setOption("predictor", true);
            clearList();
            actions.addAction("Wander", 1);
            view.requestUpdate("updateNextActions");
        });
        const predictorWorker = await workerEvent;
        await page.waitForTimeout(750);

        const predictorStateAfter = await page.locator("#plannerPredictorState").textContent();
        const queueState = await page.evaluate(() => ({
            queueLength: Array.isArray(actions?.next) ? actions.next.length : -1,
            predictorEnabled: !!options?.predictor,
            predictorBackgroundThread: !!options?.predictorBackgroundThread,
            trackedStat: options?.predictorTrackedStat ?? null,
        }));

        const screenshotPath = path.join(outputDir, `runtime-${language}.png`);
        await page.screenshot({path: screenshotPath, fullPage: true});

        return {
            language,
            url: scenarioUrl,
            bootstrap: bootstrapState,
            compatBridge: compatBridgeState,
            saveBridge: saveBridgeState,
            queue: queueState,
            predictor: {
                stateBefore: predictorStateBefore?.trim() ?? "",
                stateAfter: predictorStateAfter?.trim() ?? "",
                workerObserved: !!predictorWorker,
                workerUrl: predictorWorker?.url() ?? null,
                workerUrls,
            },
            consoleErrors,
            screenshotPath,
        };
    } finally {
        await runtime.context.close();
    }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
    const baseUrl = process.argv[2];
    const outputDir = process.argv[3] ?? path.resolve(thisDir, "../../output/smoke/runtime");
    if (!baseUrl) {
        throw new Error("Usage: node tests/smoke/runtime-smoke.mjs <baseUrl> [outputDir]");
    }
    await runRuntimeSmoke({baseUrl, outputDir});
}
